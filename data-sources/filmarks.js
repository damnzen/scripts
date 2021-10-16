function Filmarks(){
  
}

Filmarks.prototype.autocompleteForId= function(query, limit){
  limit = limit || 10;
  var title = query[0]=="/" ? query.substring(3) : query;
  var rs1 = [], rs2 = [];
  if(query.slice(0,3) == "/m:" || query[0] != "/"){
    rs1 = this.autocompleteMovie(query, limit);
    rs1 = rs1.map(r => ({
          title : "movies/" + r["id"],
          thumb : r["imagePath"],
          desc : r["title"],
                    id : "movies/" + r["id"],
                    }));
  }
  if(query.slice(0,3) == "/t:" || query[0] != "/"){
    rs2 = this.autocompleteTv(query, limit);
    rs2 = rs2.map(r => ({
          title : "drama/seasons/" + r["id"],
          //title : "dramas/" + r["seriesId"] + "/" + r["id"],
          thumb : r["imagePath"],
          desc : r["title"],
                    id : "drama/seasons/" + r["id"],
                    }));
  }
  var result = rs1.concat(rs2);
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
  return rs;
}

Filmarks.prototype.autocompleteTv = function(query, limit){
  limit = limit || 10;
  var url = "https://api.dramarks.com/api/v2/drama/seasons?autocomplete=1&limit=" + limit + "&q=" + encodeURIComponent(query);
  var req = http();
  var res = req.get(url);
  var json = JSON.parse(res.body);
  
  var rs = json["seasons"];
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
  var url = "https://api.filmarks.com/v2/" + id + "?contents=all&limit=" + limit;
  
  var req = http();
  var res = req.get(url);
  var r = JSON.parse(res.body);

  if(id.indexOf("drama")==0){
    Object.assign(r, r["season"]);
    r["filmarksurl"] = "https://filmarks.com/dramas/"+ r["seriesId"] + "/" + r["id"];
  }else{
    Object.assign(r, r["movie"]);
    r["filmarksurl"] = "https://filmarks.com/movies/" + r["id"]; 
  }
  
  if(r["credits"].length){
    //r["director"] = r["credits"].find(e => e.roleName == "監督").people[0].name;
    var director = r["credits"].find(e => e.roleName == "監督");
    if(director) r["director"] = director.people.map(e => e.name);
    var actors = r["credits"].find(e => e.roleName == "キャスト");
    if(actors) r["actors"] = actors.people.map(e => e.name);
  }
  r["copyright"] = r["copyright"] || "";
    
  var services =  r["vodServices"].filter(e => e.serviceTypes.indexOf("svod") >= 0);
  //各vodサービスごとのURLを取得する。
  services.forEach(e =>{r[e["name"]] = e["link"];});
  if("Amazon Prime Video" in r) r["Amazon Prime Video"] = r["Amazon Prime Video"].replace("?tag=vod_contentsdetail-22","");
  //利用できるvodのリスト
  r["services"] = services.map(e => e.name == "Amazon Prime Video" ? "Prime Video" : e.name);
  
return r
}

