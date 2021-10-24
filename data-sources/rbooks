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
	var json = JSON.parse(res.body);
	return json["parents"][0]["booksGenreName"]
}

Rbooks.prototype.getResults = function(json){
	if (json["count"]){
		var o = json["Items"][0]["Item"];
		o["publisher"] = o["publisherName"];
		o["description"] = o["itemCaption"];
		o["image"] = o["largeImageUrl"].replace(/\?_ex=.*/,"");
		o["publishedDate"] = formatDate(o["salesDate"]);
		//o["publishedDate"] = new Date().getTime();
		o["genre"] = this.getGenre(o["booksGenreId"]);
		o["author"] = o["author"].replace("/",", ");
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
