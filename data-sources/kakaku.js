/*
function jsonUrl(url) {
	return 'https://script.google.com/macros/s/AKfycbxRjzQftnEWO7fwETplJpsJMC79UTlXCQGSYjmdac3vHGJYFida/exec?url=' + encodeURIComponent(url);
}
*/
function getProductCode(title){
	var m = title.match(/(?=.*[0-9])[\-A-Z0-9]{6,}/g);
	if (m){
	 return m[m.length-1]
	}else{
	 return ""
	}
}

function cleanUrl(url){
	if (/&Url=([^&]*)/.test(url)){
	  url = decodeURIComponent(RegExp.$1);
	  if(/\?url=(.*)/.test(url)){ //Amazon対応
	    url = decodeURIComponent(RegExp.$1);
	  }
    url = url.replace(/\?.*/, '');
	  return url;
	}else{
		return ""
	}
}

function Kakaku(apiKey) {
  this.apiKey = apiKey;
}

Kakaku.prototype.autocomp = function (query){
  var url = 'https://kakaku.com/apiSuggest/ApiSuggest.aspx?kw=' + encodeURIComponent(query);
  var result = http().get(url);
  var json = JSON.parse(result.body);  
  var items = json["suggestion"];
  if (!items) return []
  var result = items.map(item => ({
    "title" : item.orgName,
    "desc" : item.categoryName ? item.categoryName : ""
  }));
  return result
}

Kakaku.prototype.search = function (query) {
  var url = 'https://app.kakaku.com/searchresults/v2/?=&n=20&p=1&query=' + encodeURIComponent(query) + '&searchcategorycode=&sort=clkrank_d';
  var result = http().get(url);
  var json = JSON.parse(result.body);
  var items = json["products"];
  items = items.filter(item => item.reviewsCount != null);
  items.forEach(item =>{
                item['source'] = 'kakaku';
                item["id"] = item["productID"];
                item["title"] = item["productName"];
                item['thumb'] = item.imgUrls.list;
                item['image'] = item.imgUrls.catlog;
                //item["kakakuUrl"] = "https://kakaku.com/item/" + item["productID"] + "/"
                item['desc'] = [item.maker, item.categoryName, item.comment].join(' ');
                if(/容量：([^\s]+)\s/.test(item.comment)) item.amount = RegExp.$1;
  });
return items;
}

Kakaku.prototype.extra = function (id) {
  var url = 'https://app.kakaku.com/itemview/v1/' + id + '/';
  var result = http().get(url);
  var json = JSON.parse(result.body);

  //親アイテムがある場合
  if(json.product.parentProduct) return this.extra(json.product.parentProduct.productID);
  
//  var url = 'https://app.kakaku.com/productspec/v1/' + id + '/';
//  var result = http().get(url);
//  var data_spec = JSON.parse(result.body);
 
  Object.assign(json, json.product);
  json["title"] = json.productName;
  json["image"] = json.img ? json.img.mainImg.url.view : "";
  json["kakakuUrl"] = json.shareMessages.url;
  json["productCode"] = getProductCode(json.product.productName);
  //if (json.salesDate) json["salesDate"] = Date.parse(json.salesDate.replace(/[年月日]/g, "/"));
  if (json.product.salesDate){
    //json["salesDate"] = new Date((json.salesDate.replace(/[年月日]/g, "/") + "01").substr(0,10));
    json["salesDate"] = new Date(json.salesDate.replace(/(\d+)年(\d+)月((\d+)日)?/, "$1/$2/$4").replace(/\/$/, "/1"));
    json["salesDateUTC"] = json["salesDate"].getTime();
  }
  //Logger.log(json["salesDate"])
  return json
}

Kakaku.prototype.shops = function (id, order, area) {
  var url = 'https://app.kakaku.com/shoplist/v2/' + id + '/?page=1&per_page=1000000&type=0';
  if(order) url += '&priceorder=' + order;
  if(area) url += '&carriagearea=' + area;
  
  var result = http().get(url);
  var shops = JSON.parse(result.body);
  return shops;
}
/*
Kakaku.prototype.search = function (query) {
  var url = 'http://api.kakaku.com/WebAPI/ItemSearch/Ver1.0/ItemSearch.aspx?ApiKey=' + this.apiKey + '&Keyword=' + encodeURIComponent(query) + '&CategoryGroup=ALL&HitNum=20';
  var result = http().get(jsonUrl(url));
  var json = JSON.parse(result.body);
  //log(result.body);
  //log(json.query.results.ProductInfo);
  var results = json["ProductInfo"];
  var items;
  if (!results){
    items = [];
  }else if (results.NumOfResult == 1){
    items = [results.Item];
  }else{
    items = results.Item;
  }
  items.forEach(item => {
    //log(item);
    item['title'] = item.ProductName;
    item['desc'] = [
      item.MakerName,
      item.CategoryName
    ].join(' ');
    
    item['thumb'] = item.ImageUrl;
    item['image'] = item.ImageUrl.replace("/m/", "/fullscale/");
    //item['id'] = item.ProductID;
    item['id'] = item;
  });
  return items;
}

Kakaku.prototype.extra = function (item) {
  item["shops"] = Kakaku.prototype.getShops(item.ProductID);
  item["id"] = null;
  return item
}
*/

Kakaku.prototype.shopsWeb = function (productID) {
  var result = http().get('http://kakaku.com/item/' + productID + '/');
  //var body = ECL.charset.convert(result.body, "Unicode", "SJIS");
  var body = result.body;
  var matches = body.match(/<div class="p-PTShop_btn">\s\s<a onclick="cmc\(.*>/g);
  var shops = [];
  if (matches){
    matches.forEach(match => {
      if (/shpbid:(\d+),shpkey:(\d+),shpname:'(.*?)'/.test(match)) {
        shop = {};
        shop['price'] = RegExp.$1;
        shop['id'] = RegExp.$2;
        shop['shopName'] = RegExp.$3;
      }
      //Logger.log(match);
      if(/href="(.+?)"/.test(match)) shop["cpcUrl"] = RegExp.$1;
      // if (/&Url=(.*?)&/.test(match)) {
      //   shop['url'] = decodeURIComponent(RegExp.$1);
      //   //shop['url'] = cleanAmazonUrl(shop['url']);
      // }
      shops.push(shop);
    });
  }
  return shops
}


//---------------------
function test6(){
  var url = "https://kakaku.com/pt/ard.asp?url=https%3a%2f%2fwww.amazon.co.jp%2fdp%2fB08L48V1WN%3ftag%3dkakaku-subtag-22%26ascsubtag%3dkakaku-pc-pcother-22_B08L48V1WN_K0001296639_732%26me%3dAN1VRQENFRJN5%26linkCode%3dogi%26th%3d1%26psc%3d1";
  Logger.log(cleanAmazonUrl(url));
}

function test5(){
  var kkk = new Kakaku();
  var r = kkk.autocomp("kc-h");
  Logger.log(r);
}

function test4(){
  var kkk = new Kakaku();
  var r = kkk.shopsWeb("K0001296639");
  Logger.log(r);
}


function test3(){
  var kkk = new Kakaku("b0572c65d75b8edf330bf88354b8d761");
  var r = kkk.extra("K0001296639");
  //var r = kkk.shops("K0001248222");
  //var r = kkk.extra("K0000958768");
  Logger.log(r);

}

function test2(){
  var kkk = new Kakaku("b0572c65d75b8edf330bf88354b8d761");
  //var r = kkk.extra("K0001278149");
  var r = kkk.extra("J0000033233");
  //var r = kkk.extra("K0000958768");
  Logger.log(r);

}

function test1(){
  var a = 1;
  var kkk = new Kakaku("b0572c65d75b8edf330bf88354b8d761");
  var r = kkk.search("ニベアサン");
  Logger.log(r);
}
