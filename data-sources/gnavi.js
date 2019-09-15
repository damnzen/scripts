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

function isHiragana(str){
  str = (str==null)?"":str;
  if(str.match(/^[ぁ-んー　]*$/)){    //"ー"の後ろの文字は全角スペースです。
    return true;
  }else{
    return false;
  }
}

function hiraToKata(str){
    return str.replace(/[ぁ-ん]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
}

function kataToHira(str){
    return str.replace(/[ぁ-ん]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0x60);
    });
}

function flatten(o, key){
    var sub = o[key];
    if(typeof sub == "undefined") return;
    Object.keys(sub).forEach(function(subkey){
        if(Array.isArray(sub[subkey])){
            o[subkey] = sub[subkey].join(',');
        }else if(typeof sub[subkey] == "object"){
            o[subkey] = flatten(sub, subkey);
        }else{
            o[subkey] = sub[subkey]
        }

    });
}

function Gnavi(apiKey) {
    this.apiKey = apiKey;
}


/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
Gnavi.prototype.search = function(query) {
    if(isHiragana(query)){
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name_kana=" + encodeURIComponent(hiraToKata(query)) + "&keyid=" + this.apiKey);
    }else{
        var result = http().get("https://api.gnavi.co.jp/RestSearchAPI/v3/?name=" + encodeURIComponent(query) + "&keyid=" + this.apiKey);
    }
    var json = JSON.parse(result.body);
    var rests = json.rest;
  //var rests = json1.rest.concat(json2.rest)


  for each(var res in rests){

      res['title'] = res['name'];
      res['desc'] = res['category'] + "\n" + res['code']['areaname_s'];
      res['thumb'] = res['image_url']['shop_image1'];
        res['id'] = res;
  }
  return rests;
}

Gnavi.prototype.extra = function(res) {
    flatten(res,'code');
    flatten(res,'pr');
    flatten(res,'access');
    res['name_kana'] = kataToHira(res['name_kana']);
    res['location'] = res['latitude'] + ',' + res['longitude'];
    //message(res['desc'] + res['location']);
    return res;
}