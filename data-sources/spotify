function Spotify(client_id, client_secret, authorization_code){
  this.client_id = client_id;
  this.client_secret = client_secret;
  this.authorization_code = authorization_code;
}

Spotify.prototype.getAccessToken = function(){
  let access_token = getvar("global.spotify.access_token");
  if (!access_token) access_token = this.getFirstAccessToken();
  return access_token;
}

Spotify.prototype.getFirstAccessToken = function(){
  const basic_authorization = Base64.encode(this.client_id+":"+this.client_secret);
   const headers = {
    "Authorization": "Basic " + basic_authorization };
   const payload = {
     "grant_type": "authorization_code",
     "code": this.authorization_code,
     "redirect_uri": "http://localhost:8888/callback"
   };

  let req = http();
  req.headers(headers);
  let response = req.post("https://accounts.spotify.com/api/token", payload);
  //Logger.log(response.body)
  const parsedResponse = JSON.parse(response.body);
  setvar('global.spotify.access_token', parsedResponse.access_token);
  setvar('global.spotify.refresh_token', parsedResponse.refresh_token);

   return parsedResponse.access_token;
}

Spotify.prototype.refreshAccessToken = function() {
  const basic_authorization = Base64.encode(this.client_id+":"+this.client_secret);
  
  const refresh_token = getvar('global.spotify.refresh_token');

  const headers = {
    "Authorization": "Basic " + basic_authorization,
    "Content-Type": "application/x-www-form-urlencoded"
  };
  const payload = {
     "grant_type": "refresh_token",
     "refresh_token": refresh_token
  };
  let req = http();
  req.headers(headers);

  const response = req.post("https://accounts.spotify.com/api/token", payload);

  const parsedResponse = JSON.parse(response.body);
  setvar('global.spotify.access_token', parsedResponse.access_token);
  // refresh_token は毎回発行されるとは限らない
  if (parsedResponse.refresh_token) {
    setvar('global.spotify.refresh_token', parsedResponse.refresh_token);
  }
  return parsedResponse.access_token;
}

//Spotify.prototype.search = function(params){
Spotify.prototype.search = function(query, type, market, limit, offset){
  offset = offset || 0;
  limit = limit || 20;
  market = market || 'JP';
  //var url = "https://api.spotify.com/v1/search?" + querystring(params);
  var url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&market=${market}&limit=${limit}&offset=${offset}`;
  let access_token = this.getAccessToken();
  let req = http();
  req.headers({
      "contentType": "application/json",
      'Authorization': "Bearer " + access_token
            });
  var response = req.get(url);
  
  switch (response.code) {
    case 200: // Spotify の曲をセット
      return JSON.parse(response.body).tracks.items;
    case 204: // 何も聞いていない
      return null;
    case 401: // access_token が切れた
      this.refreshAccessToken();
      return this.search(query, type, market, limit, offset);
    default:
      // 実行されない想定
      return response.body;
  }
  
}

Spotify.prototype.flattenTracks = function(tracks){
  tracks.forEach(t => Object.assign(t, {
    "image" : t.album.images[0].url,
    "thumb" : t.album.images[t.album.images.length-1].url,
    "artist" : t.artists[0].name,
    "album_name" : t.album.name,
    "artist_id" : t.artists[0].id,
    "album_id" : t.album.id,
    "isrc" : t.external_ids.isrc,
  })
  );
  return tracks
}

