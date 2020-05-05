var MyUtil = {
	DEFAULT_BROWSER : "arun.com.chromer",
	
    browse : function(url,pkg,cls){
		if(!pkg) pkg = this.DEFAULT_BROWSER;
		var link = "android-app://" + pkg + "/" + url.replace("://", "/");

		var i = intent("android.intent.action.VIEW");
		i.data(url);
		i.send();		
	},
    
    atc : function (filter, cmd, pars){
		var os = system().os;
        if(os.indexOf("Android")>=0){
		    var url = "autotoolscommand://" + [filter, cmd].concat(pars).join("=:=");
    		i = intent("android.intent.action.VIEW");
	    	i.data(url);
		    i.send();
            return true;
        }else{
            message("実行できませんでした : " + cmd);
            return false;
        }
	},
  
  loadJS : function (path){
	var os = system().os;
	if (os.indexOf("Windows")>=0){
		if (path.indexOf(":")<0) path = "D:/ApplicationData/Memento/" + path;
	}
	var f = file(path);
	eval(f.readAll());
	f.close();
  }

}
