function jsonUrl(url) {
	return 'https://script.google.com/macros/s/AKfycbxRjzQftnEWO7fwETplJpsJMC79UTlXCQGSYjmdac3vHGJYFida/exec?url=' + encodeURIComponent(url);
}

function Kakaku(apiKey) {
  this.apiKey = apiKey;
}
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
  for each(var item in items) {
//log(item);
    item['title'] = item.ProductName;
    item['desc'] = [
      item.MakerName,
      item.CategoryName
    ].join(' ');
    item['image'] = item.ImageUrl;
    //item['id'] = item.ProductID;
    item['id'] = item;
  }
  return items;
}

Kakaku.prototype.extra = function (item) {
  item["shops"] = Kakaku.prototype.getShops(item.ProductID);
  item["id"] = null;
  return item
}

Kakaku.prototype.getShops = function (productID) {
  var result = http().get('http://kakaku.com/item/' + productID + '/');
  //var body = ECL.charset.convert(result.body, "Unicode", "SJIS");
  var body = result.body;
  var matches = body.match(/<div class="p-PTShop_btn">\s\s<a onclick="cmc\(.*>/g);
  var shops = [];
  if (matches){
    for each(var match in matches) {
      if (/shpbid:(\d+),shpkey:(\d+),shpname:'(.*?)'/.test(match)) {
        shop = {};
        shop['price'] = RegExp.$1;
        shop['id'] = RegExp.$2;
        shop['name'] = RegExp.$3;
      }
      if (/Url=(.*?)&/.test(match)) {
        shop['url'] = decodeURIComponent(RegExp.$1);
      }
      shops.push(shop);
    }
  }
  return shops
}
