function NDL(){
}

NDL.prototype.lookup = function(isbn){
  
  
  var urlString = 'http://iss.ndl.go.jp/api/opensearch?isbn=' + isbn;  
  var fetchXml = UrlFetchApp.fetch(urlString);
  
  var documentXml = XmlService.parse(fetchXml.getContentText());
  var items = documentXml.getRootElement().getChildren('channel')[0].getChildren('item');
  
  var namespaceDc = XmlService.getNamespace("dc", "http://purl.org/dc/elements/1.1/");
  var namespaceDcndl = XmlService.getNamespace("dcndl", "http://ndl.go.jp/dcndl/terms/");
  var namespacexsi = XmlService.getNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance");
  
  var result = items.map(item => {
    let bookinfo = {
      title : item.getChildText("title", namespaceDc),
      pubDate : new Date(item.getChildText("pubDate")),
      volume : item.getChildText("volume", namespaceDcndl),
      edition : item.getChildText("edition", namespaceDcndl),
      author : item.getChildText("author"),
      publisher : item.getChildText("publisher", namespaceDc),
      price : item.getChildText("price", namespaceDcndl),
    };
    let props = item.getChildren('subject', namespaceDc);
    props.forEach(prop => {
      let name = prop.getAttribute("type",namespacexsi);
      if(name){
        switch(name.getValue()){
          case "dcndl:NDC10":
            bookinfo.ndc10 = prop.getText()
            break;
          case "dcndl:NDC9":
            bookinfo.ndc9 = prop.getText()
            break;
        }
      }
    })
    return bookinfo
  });

  //本のタイトル、巻数、版
  var bookTitle = items[0].getChildText("title", namespaceDc);
  var bookVolume = items[0].getChildText("volume", namespaceDcndl);
  var bookEdition = items[0].getChildText("edition", namespaceDcndl);
  
  //本の巻数や版を取得して足し合わせて、書籍管理で１セルで済むようにする。
  
  //{bookTitle} {bookVolume}巻 {bookEdition}
  var bookCreator = items[0].getChildText("creator", namespaceDc);
  
  return result

}
