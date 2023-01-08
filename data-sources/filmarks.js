function Filmarks(){
  
}

Filmarks.prototype.autocompleteForId= function(query, limit){
  limit = limit || 10;
  var title = query[0]=="/" ? query.substring(3) : query;
  var rs1 = [], rs2 = [];
  if(query.slice(0,3) == "/m:" || query[0] != "/"){
    rs1 = this.autocompleteMovie(title, limit);
  }
  if(query.slice(0,3) == "/t:" || query[0] != "/"){
    rs2 = this.autocompleteTv(title, limit);
  }
  var result = rs1.concat(rs2);
  result = result.map(r => ({
          title : r["compositeId"],
          //title : "dramas/" + r["seriesId"] + "/" + r["id"],
          thumb : r["imagePath"],
          desc : r["title"],
                    id : r["compositeId"],
                    }));

  return result
}

Filmarks.prototype.autocomplete = function(query, limit){
  limit = limit || 10;
  return this.autocompleteMovie(query, limit);
}

Filmarks.prototype.autocompleteMovie = function(query, limit){
  limit = limit || 10;
  var url = "https://api.filmarks.com/v2/movies?autocomplete=1&limit=" + limit + "&q=" + encodeURIComponent(query);
  var req = http();
  var res = req.get(url);
  var json = JSON.parse(res.body);
  
  var rs = json["movies"];
  rs.some(r => {r.compositeId = "movies/" + r.id});
  return rs;
}

Filmarks.prototype.autocompleteTv = function(query, limit){
  limit = limit || 10;
  var url = "https://api.dramarks.com/api/v2/drama/seasons?autocomplete=1&limit=" + limit + "&q=" + encodeURIComponent(query);
  var req = http();
  var res = req.get(url);
  var json = JSON.parse(res.body);
  
  var rs = json["seasons"];
  rs.some(r => {r.compositeId = "drama/seasons/" + r.id});
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

Filmarks.prototype.lookup = function(id, limit, contents, type){
  //id = id + "";
  limit = limit || 5;
  contents = contents || "all";
  switch (type){
    case "movie":
      id = "movies/" + id;
      break;
    case "tv":
      id = "drama/seasons/" + id;
      break;
    default :
      id = "" + id;
  }
  var url = "https://api." + (id.indexOf("movie") == 0 ? "filmarks" : "dramarks") + ".com/v2/" + id + "?contents=" + encodeURIComponent(contents) +  "&limit=" + limit;
  
  var req = http();
  var res = req.get(url);
  var r = JSON.parse(res.body);

  if(id.indexOf("drama")==0){
    Object.assign(r, r["season"]);
    r["filmarksurl"] = "https://filmarks.com/dramas/"+ r["seriesId"] + "/" + r["id"];
    r["compositeId"] = "drama/seasons/" + r["id"];
  }else{
    Object.assign(r, r["movie"]);
    r["filmarksurl"] = "https://filmarks.com/movies/" + r["id"]; 
    r["compositeId"] = "movies/" + r["id"];
  }
  
  if(r["credits"].length){
    //r["director"] = r["credits"].find(e => e.roleName == "監督").people[0].name;
    var director = r["credits"].find(e => e.roleName == "監督");
    if(director) r["director"] = director.people.map(e => e.name);
    var actors = r["credits"].find(e => e.roleName == "キャスト");
    if(actors) r["actors"] = actors.people.map(e => e.name);
  }
  r["copyright"] = r["copyright"] || "";
  
  if("vodServices" in r){
    var services =  r["vodServices"].filter(e => e.serviceTypes.indexOf("svod") >= 0);
    //各vodサービスごとのURLを取得する。
    services.forEach(e =>{r[e["name"]] = e["link"];});
    if("Amazon Prime Video" in r) r["Amazon Prime Video"] = r["Amazon Prime Video"].replace("?tag=vod_contentsdetail-22","");
    //利用できるvodのリスト
    r["services"] = services.map(e =>{
      e.name == "Amazon Prime Video" ? "Prime Video" : e.name;
      e.name == "ディズニープラス" ? "Disney+" : e.name;
    });
  }
  
return r
}
