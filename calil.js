function Calil (apiKey) {
    this.apiKey = apiKey;
}

Calil.prototype.check = function(isbns, systemid, callback) {
    var url = "http://api.calil.jp/check?appkey=" + this.apiKey + "&isbn=" + isbns.join(",") +  "&systemid=" + systemid.join(",") + "&format=json&callback=no";
    var res = http().get(url);
    var data = JSON.parse(res.body);

    if(data.continue == 1){
	message("カーリル情報取得中...");
        setTimeout((session) => {app.continue(session)}, 1000, data.body.session);
    } else {
        callback(data);
    }
    //return res;
};

Calil.prototype.continue = function(session, callback) {
    var url = "http://api.calil.jp/check?session=" + session + "&format=json&callback=no";
    var res = http().get(url);
	var data = JSON.parse(res.body);

    if(data.continue == 1){
	message("カーリル情報取得中...");
        setTimeout((session) => {app.continue(session)}, 1000, data.body.session);
    } else {
        callback(data);
    }
    //return res;
};