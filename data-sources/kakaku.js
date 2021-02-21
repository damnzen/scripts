function getProductCode(title){
	var m = title.match(/(?=.*[0-9])[\-A-Z0-9]{6,}/g);
	if (m){
	 return m[m.length-1]
	}else{
	 return ""
	}
}


function Kakaku(apiKey) {
  this.apiKey = apiKey;
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
  json["image"] = json.img ? json.img.mainImg.url.view : null;
  json["kakakuUrl"] = json.shareMessages.url;
  json["productCode"] = getProductCode(json.product.productName);
  //if (json.salesDate) json["salesDate"] = Date.parse(json.salesDate.replace(/[年月日]/g, "/"));
  if (json.salesDate) json["salesDate"] = new Date(json.salesDate.replace(/[年月日]/g, "/"));
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
