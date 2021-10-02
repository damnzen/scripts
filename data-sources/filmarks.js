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

Filmarks.prototype.lookup = function(id, limit){
  id = id + "";
  limit = limit || 5;
  if(id.indexOf("/")>0){
    var url = "https://api.filmarks.com/v2/" + id + "?contents=all&limit=" + limit;
  }else{
    var url = "https://api.filmarks.com/v2/movies/" + id + "?contents=all&limit=" + limit;
  }
  var req = http();
  var res = req.get(url);
  var r = JSON.parse(res.body);

  //flatten(r, "movie");
  Object.assign(r, r["movie"]);
  r["filmarksurl"] = "https://filmarks.com/movies/" + id;
  if(r["credits"].length){
    //r["director"] = r["credits"].find(e => e.roleName == "監督").people[0].name;
    r["director"] = r["credits"].find(e => e.roleName == "監督").people.map(e => e.name);
    var actors = r["credits"].find(e => e.roleName == "キャスト");
    if(actors) r["actors"] = actors.people.map(e => e.name);
  }
//  r["vodServices"].forEach(e =>{
//                           if (e.serviceTypes.includes("svod")) r[e["name"]] = e["link"];
//});
  var services =  r["vodServices"].filter(e => e.serviceTypes.includes("svod"));
  services.forEach(e =>{r[e["name"]] = e["link"];});
  r["services"] = services.map(e => e.name == "Amazon Prime Video" ? "Prime Video" : e.name).join(",");

return r
}

/*
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
*/
