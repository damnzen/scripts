/**
The data source for obtaining information from discogs.com.
@param {string} apiKey - Consumer key.
@param {string} apiSecret - Consumer secret.
@param {string} type - One of release, master, artist.
Consumer key and Consumer secret can be obtained by this link : https://www.discogs.com/settings/developers
More info about Discogs API see here: https://www.discogs.com/developers
@example
var discogs = new Discogs("Consumer key" ,"Consumer secret" , "release" );
var r = discogs.search(query);
result( r , function(id) { return discogs.extra(id);});
*/

function Gnavi(apiKey) {
    this.apiKey = apiKey;
}


Gnavi.prototype.search = function(query) {
    var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?freeword=" + encodeURIComponent(query.replace(/[\s]+/g,',')) + "&keyid=" + this.apiKey);
    // if(isHiragana(query)){
    //     var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name_kana=" + encodeURIComponent(hiraToKata(query)) + "&keyid=" + this.apiKey);
    // }else{
    //     var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name=" + encodeURIComponent(query) + "&keyid=" + this.apiKey);
    // }
    var json = JSON.parse(result.body);
    var rests = json.rest;
  //var rests = json1.rest.concat(json2.rest)
  if (!rests) return;

  rests.forEach((res,idx) =>{
      res['title'] = res['name'];
      res['desc'] = res['category'] + "\n" + res['code']['areaname_s'];
      res['thumb'] = res['image_url']['shop_image1'];
        res['id'] = idx;
  });
  return rests;
}

Gnavi.prototype.extra = function(res) {
    flatten(res,'code');
    flatten(res,'pr');
    flatten(res,'access');
    flatten(res,'image_url');
    res['name_kana'] = kataToHira(res['name_kana']);
    res['location'] = res['latitude'] + ',' + res['longitude'];
    res['images'] = Object.values(res['image_url']);
    //message(res['desc'] + res['location']);
    return res;
}