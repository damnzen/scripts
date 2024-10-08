function decNumRefToString(decNumRef) {
	return decNumRef.replace(/&#(\d+);/ig, function(match, $1, idx, all) {
		return String.fromCharCode($1);
	});
}

/*
function getAmount(title){
	var m = title.match(/\d+(本|袋|枚|ml|mL|ML|g)/g);
	if (m){
	 return m[m.length-1]
	}else{
	 return ""
	}
}
*/

//function productCodeFromTitle(title){
  
//}

function imageFromThumb(thumb){
	return thumb.replace(/_AC.*_\./,"").replace(/_SL(\d+)_/, "_AA$1_");
}

function getSpec(body, name){
  var maker

  var re0 = /<table id="productDetails[\s\S]*?<\/table>/g;
  var tables = body.match(re0);
  //console.log(tables);
  if(tables){
    var table = tables.join("/n");
    //var table = RegExp.lastMatch;
    //console.log(table);
    var re = new RegExp(name + '\n<\/th>\n+<td .*?>\n(.*)\n<\/td>')
    if(re.test(table)){
      maker = RegExp.$1.replace("&lrm;", "");
    }else{
      maker = "";
    }
  }else if((/<div id="detailBullets_feature_div">([\s\S]*)<\/div>/).test(body)){
    
    var table = RegExp.$1.replace(/&(rl|lr)m;/g, "");
    var re = new RegExp(name + "\n*:\n*<\/span>\n<span>(.*)<\/span>");
    if(re.test(table)){
      maker = RegExp.$1.replace("&lrm;", "");
     }else{
      maker = "";
    }

  }else{
    maker = "";
  }
  return maker
}

function getPrice(body){
	var re = /(.*￥3,480.*)/;
  //Logger.log(body.slice(304000))
  //createFile("temp.txt", body);
	if(!re.test(body)){
		return
	}
	var str = RegExp.$1;
	
	return parseInt(str.replace(/[￥, ]/g, ""));
}


function Amazon () {
}

Amazon.prototype.autocomp = function(query) {
	var req = http();
//	req.headers({"User-Agent": "D501i DoCoMo/1.0/D501"});
	var result = req.get("http://completion.amazon.co.jp/search/complete?mkt=6&method=completion&search-alias=aps&q=" + encodeURIComponent(query));
	var json = JSON.parse(result.body);
	var resultArray = [];
  json[1].forEach(i =>{
		resultArray.push({"title": i});
	});
	return resultArray
}

Amazon.prototype.search = function(query, includeMarket){
	var url = "https://www.amazon.co.jp/s?k=" + query + (includeMarket ? "" : "&emi=AN1VRQENFRJN5") ;
	var req = http();
	//http.headers({"User-Agent": "Mozilla/5.0 (iPhone; CPU OS 10_14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Mobile/14E304 Safari/605.1.15"});
	//req.headers({"User-Agent": "D501i DoCoMo/1.0/D501"});
req.headers({"User-Agent": "Mozilla/5.0 (Linux; Android 9.0; Z832 Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Mobile Safari/537.36"});
//req.headers({"User-Agent": "Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en) Presto/2.12.423 Version/12.16"});
	//req.headers({"User-Agent": ("D501i DoCoMo/1.0/D5" + new Date().getSeconds()).toString()});
	var res = req.get(url);
  //log(res.body.replace(/<script[\s\S]*?<\/script>/g, ""));
 	var v = res.body.split('<div data-asin');
	v.shift();
	v.pop();
	//var regexp = /<img src="(.*)"[\s\S]*?alt="(.*)"/;
  var regexp = /<img .*?src="(.*?)"[\s\S]*?alt="(.*?)"/;
	var resultArray = [];
	var o;
	v.forEach(div=>{
		//log(div);
		if(!/^="([A-Z0-9]+)/.test(div)) return;
		var asin = RegExp.$1;
  if(asin == "") return
		var m = div.match(regexp);
		if (!m) return;
		var title = cleanTitle(m[2]);
		var image = imageFromThumb(m[1]);
		if (title.indexOf("スポンサー")==0) return;
		if (image.indexOf("//")==0) return;
		//log(/<img src="(.*)"[\s\S]*?alt="(.*)"/.exec(div));
		o = {
      "source" : "amazon",
			"id" : asin,
			"asin" : asin,
			"title" : title,
//			"desc" : getProductCode(m[2])　+ " " + title,
			"desc" :  "🅰" + title,
			"thumb" : m[1],
			"image" : image,
			"amazonUrl" : "https://www.amazon.co.jp/o/ASIN/" + asin + "/",
//			"image" : "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg",
		};
			resultArray.push(o);			
	});

	return resultArray;
	//log(resultArray);
}

Amazon.prototype.searchForId = function(query, includeMarket){
  var resultArray = this.search(query, includeMarket);
  return resultArray.map(item =>{item.title = item.id; return item})
}

Amazon.prototype.extra = function(asin, getfull){
  var url = "https://www.amazon.co.jp/dp/" + asin;
  var req = http();
  var res = req.get(url);
  
  if(res.code != "200" ) return {asin: asin, error : res.code, body : res.body};
  var o = {};
//  if(/<h1 id="title"[\s\S]*?<\/h1>/.test(res.body)){
//    o.title = RegExp.lastMatch.replace(/<.*?>/g, "").replace(/\n/g, "")
//  }
  //スペックを取得
  if(/<div id="productOverview_feature_div"[\s\S]*?(<\/table>|<!--\s+Loading EDP related metadata -->|a-spacing-top-mini">)/.test(res.body)){
    //log(RegExp.lastMatch.replace(/\n+/g, "").replace(/<style.*?<\/style>/g, ""));
    //Logger.log(RegExp.lastMatch.replace(/<script[\s\S]*?(<\/script>|$)/g, ""))
    o["comment"] = RegExp.lastMatch.replace(/\n+/g, "").replace(/<script[\s\S]*?(<\/script>|$)/g, "").replace(/<style.*?<\/style>/g, "").replace(/<td class="a-span9">/g, " : ").replace(/\s+/g, " ").replace(/<\/tr>/g, "\n").replace(/<.*?>/g, "").replace(/^\s+/gm, "").trim();
    //o["comment"] = RegExp.lastMatch
    //o["comment"] = o["comment"].replace(/<td class="a-span9">/g, " : ").replace(/<\/tr>/g, "\n").replace(/<.*?>/g, "").replace(/^\s+/gm, "").trim();
    
  //価格下の概要欄から取得  
  }else if(/<div id="featurebullets_feature_div"[\s\S]*<!--  Loading EDP related metadata -->/.test(res.body)){
    //Logger.log(RegExp.lastMatch);
    o["comment"] = RegExp.lastMatch.replace(/<div id="hsx-rpp-bullet-fits-message"[\s\S]*<\/script>/, "").replace(/<script.*?<\/script>/g, "").replace(/<.*?>/g, "").replace(/\n+/g, "\n").replace(/\nこの商品について\n/, "").trim();
  }
  
  //画像の取得
  if(/{"landingImageUrl":"([^"]+?)"}/.test(res.body)){
    o["image"] = modifyAmazonImage(RegExp.$1);
  }else if(/data-old-hires="([^"]+?)"/.test(res.body)){
    o["image"] = modifyAmazonImage(RegExp.$1);
    //  }else if(/data-a-dynamic-image="(.*?)"/.test(res.body)){
//    let imgdata = JSON.parse(RegExp.$1.replace(/&quot;/g, '"'));
//    o["image"] = Object.keys(imgdata)[Object.keys(imgdata).length -1];
//  }else{
//    createFile("ama.html", res.body)
  }
  
  //log(o.comment);
  //o.price = getPrice(res.body);   //fetchしたhtmlには価格情報がない
  //メーカーの取得
  o["maker"] = getSpec(res.body, "メーカー");
  var d = getSpec(res.body, "Amazon.co.jp での取り扱い開始日");
  if(d){
    o["salesDate"] = new Date(d);
    o["salesDateUTC"] = o.salesDate.getTime();
  }
  //型番の取得
  o["productCode"] = getSpec(res.body, "型番");
//  if(/メーカー\n:\n<\/span>\n<span>(.*)<\/span>/.test(res.body)){
//    o.maker = RegExp.$1;
//  }
  if(/<span id="priceblock_ourprice".*>￥(.*)<\/span>/.test(res.body)){
    o["price"] = parseInt(RegExp.$1.replace(",", ""));
  }
  
  //if(getfull){
  //o.image = "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg";
  o["amazonUrl"] = "https://www.amazon.co.jp/o/ASIN/" + asin + "/";
  o.asin = asin;
  if(/<span id="productTitle" .*?>\s*([^<]*?)\s*<\/span>/.test(res.body)){
    o["title"] = cleanTitle(RegExp.$1);
    o["amount"] = amountFromTitle(o.title);
    if (o.productCode == "") o.productCode = productCodeFromTitle(o.title)
  }
  //}
  
  return o;
}

//asinから直でデータを取得する場合
Amazon.prototype.lookup = function(asin){
  var o = this.extra(asin, true);
  if (!o.image)
    o.image = "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ";
    return o
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
items.forEach(item => {
	
//    "title" : item.getElementsByTagName("title")[0].innerText,
//    "desc" : item.getElementsByTagName("summary")[0].innerText,
//  var link = item.getElementsByTagName("link")[0].href;
//  var asin = link.substring(link.lastIndexOf("=") + 1);
//  o["image"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.LZZZZZZZ.jpg";
//  o["thumb"] = "http://images-jp.amazon.com/images/P/" + asin + ".09.THUMBZZZ.jpg";
//  o["id"] = o;
  resultList.push(item);
});
return resultList;

}
