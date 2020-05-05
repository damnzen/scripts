var MyUtil = {
    atc : function (filter, cmd, pars){
   var url = "autotoolscommand://" + [filter, cmd].concat(pars).join("=:=");

   i = intent("android.intent.action.VIEW");
   i.data(url);
   i.send();
    },
  
  

}
