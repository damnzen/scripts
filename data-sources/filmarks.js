function Filmarks(){
  
}

Filmarks.prototype.autocomplete = function(query){
  var url = "https://api.filmarks.com/v2/movies?autocomplete=1&limit=24&q=" + encodeURIComponent(query);
  var req = http();
  var res = req.get(url);
  var json = JSON.parse(res.body);
  
  var rs = json["movies"];
  return rs;
}

Filmarks.prototype.autocompleteForUrl= function(query){
  var rs = this.autocomplete(query);
  var rs2 = rs.map(r => ({
         title : "https://filmarks.com/movies/" + r["id"],
         thumb : r["imagePath"],
         desc : r["title"],
                   id : r["id"],
                   }));
  return rs2
}

Filmarks.prototype.autocompleteForId= function(query){
  var rs = this.autocomplete(query);
  var rs2 = rs.map(r => ({
         title : "movies/" + r["id"],
         thumb : r["imagePath"],
         desc : r["title"],
                   id : r["id"],
                   }));
  return rs2
}

Filmarks.prototype.lookup = function(id, limit){
  limit = limit || 5;
  var url = "https://api.filmarks.com/v2/movies/" + id + "?contents=all&limit=" + limit;
  var req = http();
  var res = req.get(url);
  var r = JSON.parse(res.body);

  //flatten(r, "movie");
  Object.assign(r, r["movie"]);
  r["filmarksurl"] = "https://filmarks.com/movies/" + id;
  r["copyright"] = r["copyright"] || "";
  var director = r["credits"].find(e => e.roleName == "監督");
  if (director) r["director"] = director.people[0].name;
  
  var actors = r["credits"].find(e => e.roleName == "キャスト");
  if (actors) r["actors"] = actors.people.map(e => e.name);
  if (r["originalImagePath"]) r["image"] = r["originalImagePath"].replace("/store/", "/store/fit/1000/1000/");
  r["vodServices"].forEach(e =>{
                           if (e.serviceTypes.indexOf("svod")>=0) r[e["name"]] = e["link"];
});
return r
}
