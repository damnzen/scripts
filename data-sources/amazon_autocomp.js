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
function AmazonComp () {
}

/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
AmazonComp.prototype.search = function(query) {
	var result = http().get("http://completion.amazon.co.jp/search/complete?mkt=6&method=completion&search-alias=aps&q=" + encodeURIComponent(query));
	var json = JSON.parse(result.body);
	var resultArray = [];
	for each(var i in json[1]){
		resultArray.push({"title": i});
	}
	return resultArray
}
