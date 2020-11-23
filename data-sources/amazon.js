function decNumRefToString(decNumRef) {
	return decNumRef.replace(/&#(\d+);/ig, function(match, $1, idx, all) {
		return String.fromCharCode($1);
	});
}

function cleanTitle(title){
	return title.replace(/【.*?】/g,"")
}

function getProductCode(title){
	var m = 	title.match(/[0-9A-Z\-]{6,}/g);
	if (m){
	 return m[m.length-1]
	}else{
	 return ""
	}
}

function getAmount(title){
	var m = 	name.match(/\d+(ml|mL|ML|g)/g);
	if (m){
	 return m[m.length-1]
	}else{
	 return ""
	}
}

function imageFromThumb(thumb){
	return thumb.replace(/_AC.*_\./,"")
}

function Amazon () {
}

Amazon.prototype.autocomp = function(query) {
	var req = http();
//	req.headers({"User-Agent": "D501i DoCoMo/1.0/D501"});
	var result = req.get("http://completion.amazon.co.jp/search/complete?mkt=6&method=completion&search-alias=aps&q=" + encodeURIComponent(query));
	var json = JSON.parse(result.body);
	var resultArray = [];
	for each(var i in json[1]){
		resultArray.push({"title": i});
	}
	return resultArray
}

Amazon.prototype.search = function(query){
	var url = "https://www.amazon.co.jp/s?k=" + query;
	var req = http();
	//http.headers({"User-Agent": "Mozilla/5.0 (iPhone; CPU OS 10_14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/14E304 Safari/605.1.15"});
	req.headers({"User-Agent": "D501i DoCoMo/1.0/D501"});
req.headers({"User-Agent": "Mozilla/5.0 (Linux; Android 9.0; Z832 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Mobile Safari/537.36"});
//req.headers({"User-Agent": "Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en) Presto/2.12.423 Version/12.16"});
	//req.headers({"User-Agent": ("D501i DoCoMo/1.0/D5" + new Date().getSeconds()).toString()});
	var res = req.get(url);
	var v = res.body.split('<div data-asin');
	v.shift();
	v.pop();
	var regexp = /<img src="(.*)"[\s\S]*?alt="(.*)"/;
	var resultArray = [];
	var o;
	v.forEach(div=>{
		//log(div);
		if(!/^="([A-Z0-9]+)/.test(div)) return;
		var asin = RegExp.$1;
		var m = div.match(regexp);
		if (!m) return;
		//log(/<img src="(.*)"[\s\S]*?alt="(.*)"/.exec(div));
		o = {
			"id" : asin,
			"asin" : asin,
			"title" : cleanTitle(m[2]),
			"desc" : getProductCode(m[2]),
			"thumb" : m[1],
			"image" : imageFromThumb(m[1]),
			"amazonUrl" : "https://www.amazon.co.jp/o/ASIN/" + asin + "/",
//			"image" : "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg",
		};
			resultArray.push(o);			
	});

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
