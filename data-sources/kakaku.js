/*
function jsonUrl(url) {
	return 'https://script.google.com/macros/s/AKfycbxRjzQftnEWO7fwETplJpsJMC79UTlXCQGSYjmdac3vHGJYFida/exec?url=' + encodeURIComponent(url);
}
*/
function getProductCode(title){
	var m = title.match(/(?=.*[0-9])[\-A-Z0-9\.]{6,}/g);
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
	  }else if(/&vc_url=(.*)/.test(url)){ //Value Commerse
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
  var url = 'https://app.kakaku.com/searchresults/v3/?=&n=60&p=1&query=' + encodeURIComponent(query) + '&searchcategorycode=&sort=clkrank_d';
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


Kakaku.prototype.extra = function (id, priceorder, carriagearea) {
  //var url = 'https://app.kakaku.com/itemview/v1/' + id + `/?priceorder=${priceorder}&carriagearea=${carriagearea}`;
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
    json["salesDate"] = new Date(json.salesDate.replace(/(\d+)年(\d+)月((\d+)日)?/, "$1/$2/$4").replace(/\/[^\d]*$/, "/1"));
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

// ?priceorder=1&carriagearea=29
Kakaku.prototype.shopsWeb = function (productID, priceorder, carriagearea) {
  var url = 'http://kakaku.com/item/' + productID + '/?priceorder=' + priceorder + '&carriagearea=' + carriagearea;
  //var url = 'http://kakaku.com/item/' + productID + `/?priceorder=${priceorder}&carriagearea=${carriagearea}`;
  var result = http().get(url);
  //var body = ECL.charset.convert(result.body, "Unicode", "SJIS");
  var body = result.body;
  var matches = body.match(/<div class="p-PTShop_btn">\s\s<a onclick="cmc\(.*>/g);
  var shops = [];
  if (matches){
    matches.forEach(match => {
      if (/k3c.atrack.ping\((.*?)\);/.test(match)) {
      //Logger.log(RegExp.$1);
      //data = JSON.parse(RegExp.$1);
      var datastr = RegExp.$1;
      datastr = datastr.replace(/:([A-z]\w*)/g, ":'$1'");
      eval("var data = " + datastr);
      //eval("var data = " + RegExp.$1);
      var shop = {
        "id" : data.shpkey,
        "name" : data.shpname,
        "price" : data.shpbid + data.shpshp,
        "point" : data.shppnt,
        "deliver" : data.shpshp
      };
    }
/*      if (/shpbid:(\d+),shpkey:(\d+),shpname:'(.*?)'/.test(match)) {
        var shop = {};
        shop['price'] = RegExp.$1;
        shop['id'] = RegExp.$2;
        shop['shopName'] = RegExp.$3;
      }
*/
      //Logger.log(match);
    if(/href="(.+?)"/.test(match)){
      shop["cpcUrl"] = RegExp.$1;
      //shop["url"] = cleanUrl(RegExp.$1);
    }

      shops.push(shop);
    });
  }
  return shops
}
