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
function Amazon () {
}

/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
Amazon.prototype.autocomp = function(query) {
	var result = http().get("http://completion.amazon.co.jp/search/complete?mkt=6&method=completion&search-alias=aps&q=" + encodeURIComponent(query));
	var json = JSON.parse(result.body);
	var resultArray = [];
	for each(var i in json[1]){
		resultArray.push({"title": i});
	}
	return resultArray
}

Amazon.prototype.amazlet = function(query) {
	var result = http().get("http://app.bloghackers.net/amazlet/?type=all&__mode=keywordsearch&locale=jp&keyword=" + encodeURIComponent(query));
	var items = result.body.split('<div class="search-result">');
	delete items[0];
//	delete items[items.length-1];

	var resultArray = [];
	for each(item in items){
		if (/<p class="title"><a href="(.*?)" target="_blank">(.*?)<\/a>/.test(item)){
			var o = {};
			o["id"] = o;
			o["title"] = RegExp.$2;
			o["url"] = RegExp.$1;
			o["asin"] = RegExp.$1.match(/ASIN\/([^/]+)/)[1];
			if (/<span class="result-price">(.*?)<\/span>/.test(item)){
				o["desc"] = RegExp.$1;
				o["price"] = RegExp.$1.slice(2).replace(",","");
			}
			if (/<img src="(.*?)"/.test(item)){
				o["thumb"] = RegExp.$1;
				o["image"] = o["thumb"].replace("SL75_", "SL1500_");
			}
			resultArray.push(o);
		}
	}
	return resultArray
}

Amazon.prototype.rss = function(query) {
	var parser = new XMLParser();
	//var x2js = new X2JS();
	var url = "https://www.kuroneko-square.net/services/amazon/rest?format=atom&Keywords=" + encodeURIComponent(query);
	var r = http().get(url);
	//var json = xmlToJSON.parseString(r.body);
	var dom = parser.load(r.body);
	//var json = xmlToJson(dom);
	var items = dom.getElementsByTagName("entry");
	//var items = json["feed"]["entry"];

	var resultList = [];
	for each(var item in items){
	  o = {
	    "title" : item.getElementsByTagName("title")[0].innerText,
	    "desc" : item.getElementsByTagName("summary")[0].innerText,
	  };
	  var link = item.getElementsByTagName("link")[0].href;
	log(item);
	  var asin = link.substring(link.lastIndexOf("=") + 1);
	  o["image"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg";
	  o["thumb"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.THUMBZZZ.jpg";
	  o["id"] = o;
	  resultList.push(o);
	}
	return resultList;
}
