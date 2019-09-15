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

var reg_hira =  /^[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}]+$/mu;

function hiraToKata(str){
    return str.replace(/[ぁ-ん]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
}

function Gnavi(apiKey , apiSecret, type) {
    this.apiKey = apiKey;
}


/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
Gnavi.prototype.search = function(query) {
    if(reg_hira.test(query)){
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name_kana=" + encodeURIComponent(query) + "&keyid=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
    }else{
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name=" + encodeURIComponent(query) + "&keyid=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
    }
    var json = JSON.parse(result.body);
    var rests = json.rest;
  //var rests = json1.rest.concat(json2.rest)


  for each(var res in rests){
      res['title'] = res['name'];
      res['desc'] = res['category'] + "\n" + res['code']['areaname_s'];
      res['thumb'] = res['image_url']['shop_image1'];
  }
  return rests;
}
