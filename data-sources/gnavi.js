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

function Gnavi (apiKey , apiSecret, type) {
    this.apiKey = apiKey;
}


/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
Discogs.prototype.search = function(query) {
    if(reg_hira.test(query)){
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name_kana=" + encodeURIComponent(query) + "&keyid=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
    }else{
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name=" + encodeURIComponent(query) + "&keyid=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
    }
    var json = JSON.parse(result.body);
    var rests = json.rest;
  //var rests = json1.rest.concat(json2.rest)


  for each(var res in rests){
      var v = res.title.split(" - ");
      res['title'] = res['name'];
      res['desc'] = res['category'] + "\n" + res['code']['areaname_s'];
  }
  return rests;
}



/**
@param {string} id - The resource identifier.
*/
Discogs.prototype.extra = function(id) {
    var resultJson = http().get("https://api.discogs.com/" + this.type + "s/" + id + "?key=" + this.apiKey + "&secret=" + this.apiSecret);
    var result = JSON.parse(resultJson.body);
    if (result.images !== undefined)
        result['image'] = result.images[0].uri;
        result['images'] = result.images.map(function(e) { return e.uri; }).join();
    if (result.videos !== undefined)
        result['videos'] = result.videos.map(function(e) { return e.uri; }).join();
    if (result.artists !== undefined)
        result['artists'] = result.artists.map(function(e) { return e.anv ? e.anv : e.name; }).join();
    if (result.tracklist !== undefined)
        result['tracklist'] = result.tracklist.map(function(e) { return e.position + ". " + e.title + " " + e.duration; }).join("\n");
    if (result.styles !== undefined)
        result['styles'] = result.styles.join();
    if (result.genres !== undefined)
        result['genres'] = result.genres.join();
    if (result.labels !== undefined)
        result['label'] = result.labels[0].name;

    return result;
}
