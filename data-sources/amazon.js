
function decNumRefToString(decNumRef) {
	return decNumRef.replace(/&#(\d+);/ig, function(match, $1, idx, all) {
		return String.fromCharCode($1);
	});
}

function cleanTitle(title){
	return title.replace(/【.*?】/g,"")
}


function Amazon () {
}

Amazon.prototype.autocomp = function(query) {
	var result = http().get("http://completion.amazon.co.jp/search/complete?mkt=6&method=completion&search-alias=aps&q=" + encodeURIComponent(query));
	var json = JSON.parse(result.body);
	var resultArray = [];
	for each(var i in json[1]){
		resultArray.push({"title": i});
	}
	return resultArray
}

Amazon.prototype.search = function(query){
	var url = "https://www.amazon.co.jp/s?k=" + query;
	var http = http();
	//http.headers({"User-Agent": "Mozilla/5.0 (iPhone; CPU OS 10_14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/14E304 Safari/605.1.15"});
	http.headers({"User-Agent": "D501i DoCoMo/1.0/D5" + new Date().getSeconds()});
	var res = http.get(url);
	//log(result.body);
	var regexp = /"\/gp\/aw\/d\/([A-Z0-9]*)\/.*\n    (.*)<\/a>\n<br \/><font size="-1">(.*)<\/font>/gm

	var resultArray = [];
	var o;
	while(m = regexp.exec(res.body)){
		o = {
			"id" : m[1],
			"title" : cleanTitle(decNumRefToString(m[2])),
			"desc" : m[3],
			"thumb" : "http://images-jp.amazon.com/images/P/" + m[1] + ".09.THUMBZZZ.jpg",
			"image" : "http://images-jp.amazon.com/images/P/" + m[1] + ".09.LZZZZZZZ.jpg",
		};
		resultArray.push(o);
		//log("■" + m[2]);
	}

	return resultArray;
	//log(resultArray);
}

/*

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

*/

Amazon.prototype.rss = function(query) {
	var parser = new XMLParser();
	//var x2js = new X2JS();
	var url = "https://www.kuroneko-square.net/services/amazon/rest?format=atom&Keywords=" + encodeURIComponent(query);
	var r = http().get(url);
	//var json = xmlToJSON.parseString(r.body);
var dom = parser.load(r.body);
var json = dom.toJSON();
	log(json);
//var items = dom.getElementsByTagName("entry");
var items = json["feed"]["entry"];
//log(dom);
var resultList = [];
for each(var item in items){
	
//    "title" : item.getElementsByTagName("title")[0].innerText,
//    "desc" : item.getElementsByTagName("summary")[0].innerText,
//  var link = item.getElementsByTagName("link")[0].href;
//  var asin = link.substring(link.lastIndexOf("=") + 1);
//  o["image"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg";
//  o["thumb"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.THUMBZZZ.jpg";
//  o["id"] = o;
  resultList.push(item);
}
return resultList;

}
