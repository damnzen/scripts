function formatDate(d){
	d = d.replace(/[年月]/g,"-").replace(/[日頃]/g,"");
	d = (d + "-01-01").slice(0,10)
    let out = Date.parse(d);
  return out ? out : null
}

function Gbooks() {
}

Gbooks.prototype.lookup = function(isbn) {
	var query = "isbn:" + isbn;
	var results = this.search(query);
	if (results.length){
		return results[0]
	}else{
		return {}
	}
}

Gbooks.prototype.search = function(query) {
	var url = "https://www.googleapis.com/books/v1/volumes?country=jp&q=" + query;
	var req = http();
	var res = req.get(url);
	var json = JSON.parse(res.body);
	var items =  json["items"];
  if (!items) return [];
	var results = items.map((item,idx) =>{
		var o = item["volumeInfo"];
		o["id"] = idx;
        if ("authors" in o)
			o["author"] = o["desc"] =  o["authors"].join(", ");
		if ("publishedDate" in o)
			o["publishedDate"] = formatDate(o["publishedDate"]);
		if ("imageLinks" in o)
			//o["image"] = o["thumb"] = o["imageLinks"]["thumbnail"];
          o["thumb"] = o["imageLinks"]["thumbnail"];
		if ("industryIdentifiers" in o ){
			o["industryIdentifiers"].some(o1 => {
				if (o1["type"] == "ISBN_13"){
					o["isbn"] = o1["identifier"];
//					o["id"] = o["isbn"] = o1["identifier"];
					o["desc"] += " *";
					//log(o["id"]);
					return true
				}
			});
		}
		return o;
	});
	return results
}

function Rbooks(apikey){
	this.apikey = apikey;
}

Rbooks.prototype.lookup = function(isbn){
	var url = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&outOfStockFlag=1&isbn=" + isbn + "&applicationId=" + this.apikey
	//log(isbn);
	var req = http();
	var res = req.get(url);
	var json = JSON.parse(res.body);
	return this.getResults(json)
	//log(res.body);

}

Rbooks.prototype.search = function(title,author){
	var url = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&title=" + encodeURIComponent(title) + "&author=" + encodeURIComponent(author) + "&outOfStockFlag=1&applicationId=" + this.apikey
	var req = http();
	var res = req.get(url);
	var json = JSON.parse(res.body);
	log(url);
	return this.getResults(json);
}

Rbooks.prototype.getGenre = function(genreid){
  genreid = genreid.split("/")[0];
  var url = "https://app.rakuten.co.jp/services/api/BooksGenre/Search/20121128?format=json&elements=parent&formatVersion=2&booksGenreId=" + genreid + "&applicationId=" + this.apikey
  //log(genreid);
  var req = http();
  var res = req.get(url);
  if(res.status == "200"){
    var json = JSON.parse(res.body);
    return json["parents"][0]["booksGenreName"]
  }else{
    return null
  }
}

Rbooks.prototype.getResults = function(json){
	if (json["count"]){
		var o = json["Items"][0]["Item"];
		o["publisher"] = o["publisherName"];
      if (o["itemCaption"])
		o["description"] = o["itemCaption"];
		o["image"] = o["largeImageUrl"].replace(/\?_ex=.*/,"");
		o["publishedDate"] = formatDate(o["salesDate"]);
		//o["publishedDate"] = new Date().getTime();
		o["genre"] = this.getGenre(o["booksGenreId"]);
		o["author"] = o["author"].replace(/\//g,", ");
        o["authorKana"] = kanaToHira(o["authorKana"].replace(/,/g, " ").replace(/\//, ", "));
        o["titleKana"] = kanaToHira(o["titleKana"]);
		return o
	}
}

Rbooks.prototype.extra = function(g_result){
	//log(Object.keys(g_result));
	if("isbn" in g_result){
		r_result = this.lookup(g_result["isbn"]);
		//log(Object.keys(r_result));
	}else{
		r_result = this.search(g_result["title"], g_result["author"]);
	}
	return Object.assign(g_result, r_result)
}


