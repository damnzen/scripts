function NDL(){
}

NDL.prototype.getNdc = function(isbn){
  var urlString = 'https://ndlsearch.ndl.go.jp/api/opensearch?isbn=' + isbn;  
  var r = http().get(urlString);
  if(/"dcndl:NDC10">(.*?)<\/dc:subject>/.test(r.body)){
    return RegExp.$1
  }else if(/"dcndl:NDC9">(.*?)<\/dc:subject>/.test(r.body)){
    return RegExp.$1
  }else if(/"dcndl:NDC8">(.*?)<\/dc:subject>/.test(r.body)){
    return RegExp.$1
  }
}

NDL.prototype.getNdcDetail = function(ndc){
  var url = 'https://api-4pccg7v5ma-an.a.run.app/ndc9/' + ndc;
  var r = http().get(url);
  //Logger.log(ndc);
  Logger.log(r.body);
  return JSON.parse(r.body)
}

NDL.prototype.getNdcCats = function(ndc){
  ndc = ndc.replace(/\..*/, "");
  //ndc = parseInt(ndc);
  let url = "https://script.google.com/macros/s/AKfycbxEU4HfDkzbl0TpKaz0I_oI7LT1KcPb5YT10znqzfRY0xqqQ9A/exec?ndc=" + ndc;
  let r = http().get(url);
  return JSON.parse(r.body)
}


NDL.prototype.getNdcCats2 = function(ndc){
  //let parentNdc = ndc.split(".")[0];
  let smallNdc = parseInt(ndc)
  let bigNdc = Math.floor(smallNdc / 10) * 10
  
  let detail = this.getNdcDetail(smallNdc);
  let smallCats = detail["prefLabel@ja"].replace(/．/g, " ");

  detail = this.getNdcDetail(bigNdc);
  let bigcat = detail["prefLabel@ja"].replace(/．/g, "・");
  return [bigcat, smallCats]
}

NDL.prototype.lookup = function(isbn){
  
  
  var urlString = 'https://ndlsearch.ndl.go.jp/api/opensearch?isbn=' + isbn;  
  var fetchXml = UrlFetchApp.fetch(urlString);
  
  var documentXml = XmlService.parse(fetchXml.getContentText());
  var items = documentXml.getRootElement().getChildren('channel')[0].getChildren('item');
  
  var namespaceDc = XmlService.getNamespace("dc", "http://purl.org/dc/elements/1.1/");
  var namespaceDcndl = XmlService.getNamespace("dcndl", "http://ndl.go.jp/dcndl/terms/");
  var namespacexsi = XmlService.getNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance");
  
  var items = items.map(item => {
    let bookinfo = {
      title : item.getChildText("title", namespaceDc),
      titleKana : kanaToHira(item.getChildText("titleTranscription", namespaceDcndl)),
      description : item.getChildText("description", namespaceDc),
//      pubDate : new Date(item.getChildText("pubDate")),
      volume : item.getChildText("volume", namespaceDcndl),
      edition : item.getChildText("edition", namespaceDcndl),
      author : item.getChildText("author"),
      publisher : item.getChildText("publisher", namespaceDc),
      price : item.getChildText("price", namespaceDcndl),
    };
//let extent = item.getChildText("extent", namespaceDc);
//if(extent) bookinfo.pageCount = parseInt(extent.match(/(\d+)p/)[1]);
let pubDate = item.getChildText("pubDate");
if (pubDate) bookinfo.publishedDate = new Date(pubDate);
    let authorKanas = item.getChildren("creatorTranscription", namespaceDcndl);
if(authorKanas){
  bookinfo.authorKana = kanaToHira(authorKanas.map(e => e.getText().replace(",", "")).join("/"));
  //bookinfo.authorKana = kanaToHira(authorKana.replace(",", ""));
}

  // NDLC, NDC9などを取得
    let props = item.getChildren('subject', namespaceDc);
    props.forEach(prop => {
      let name = prop.getAttribute("type",namespacexsi);
      if(name)
        bookinfo[name.getValue().replace("dcndl:", "").toLowerCase()] = prop.getText();
      // if(name){
      //   switch(name.getValue()){
      //     case "dcndl:NDC10":
      //       bookinfo.ndc10 = prop.getText()
      //       break;
      //     case "dcndl:NDC9":
      //       bookinfo.ndc9 = prop.getText()
      //       break;
      //   }
      // }
    })
    return bookinfo
  });

  return items

}
