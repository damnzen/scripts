function formatDate(d){
	d = d.replace(/[年月]/g,"-").replace("日","");
	d = d + "-01-01".slice(d.length-10)
	return Date.parse(d)
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
	var url = "https://www.googleapis.com/books/v1/volumes?q=" + query;
	var req = http();
	var res = req.get(url);
	var json = JSON.parse(res.body);
	var items =  json["items"];
	var results = items.map((item,idx) =>{
		var o = item["volumeInfo"];
		o["id"] = idx;
		if ("authors" in o)
			o["author"] = o["desc"] =  o["authors"].join(", ");
		if ("publishedDate" in o)
			o["publishedDate"] = formatDate(o["publishedDate"]);
		if ("imageLinks" in o)
			o["image"] = o["thumb"] = o["imageLinks"]["thumbnail"];
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