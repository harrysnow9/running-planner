(function(){
  try{
    var raw = localStorage.getItem("sub2h-tracker-v1");
    var pref = "system";
    if(raw){ var parsed = JSON.parse(raw); if(parsed && parsed.themePref) pref = parsed.themePref; }
    var resolved = pref;
    if(pref === "system" || !pref){
      resolved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", resolved);
  }catch(e){}
})();
