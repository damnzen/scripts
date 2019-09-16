
function isHiragana(str){
  str = (str==null)?"":str;
  if(str.match(/^[ぁ-んー　]*$/)){    //"ー"の後ろの文字は全角スペースです。
    return true;
  }else{
    return false;
  }
}

function hiraToKata(str){
    return str.replace(/[ぁ-ん]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) + 0x60);
    });
}

function kataToHira(str){
    if (typeof str == "undefined") return "";
    return str.replace(/[ァ-ン]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0x60);
    });
}

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