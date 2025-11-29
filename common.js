function browse(url, pkg, cls){
	var link;
	if(pkg){
		link = "android-app://" + pkg + "/" + url.replace("://", "/");
	}else{
		link = url
	}

	var i = intent("android.intent.action.VIEW");
	i.data(url);
	i.send();		
}

function getvar(key){
 let lib = libByName("vars");
 if(lib) let e = lib.findByKey(key);
 if (e) return e.field("value")
}
function setvar(key, val){
 let l = libByName("vars");
 if (lib) let e = l.findByKey(key);
 if (e){
  return e.set("value", val)
 }else{
  return l.create({"key" : key, "value" : val});
 }
 //return lib("vars").findByKey(key).set("value", val);
}

function automate(cmd, payload){
let url = "automate://memento/"+ cmd +"?" +encodeURIComponent(JSON.stringify(payload));

let i = intent("android.intent.action.VIEW");
i.data(url);
i.send();
}

function automate2(uri, payload){
let i = intent("com.llamalab.automate.intent.action.START_FLOW");
i.data(uri);
if(payload){
	Object.keys(payload).forEach(key => {
		i.extra(key, payload[key]);
	});
}
i.send();
}


function automagic(cmd, payload){
let url = "automagic://memento/"+ cmd +"?" +encodeURIComponent(JSON.stringify(payload));

let i = intent("android.intent.action.VIEW");
i.data(url);
i.send();
}

