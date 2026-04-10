window.addEventListener("load", function(){
  
  // document.cookie = "cookie=;max-age=0";
  console.log(document.cookie);

  if(document.cookie.indexOf("cookie=true") != -1){
    console.log("Cookieの使用が許可されています");
  }
  else if(document.cookie.indexOf("cookie=false") != -1){
    console.log("Cookieの使用が許可されていません");
  }
  else{
    document.getElementById("cookieConfirm").classList.add("active");
    document.getElementById("cookie-agree").addEventListener("click", function(){
      document.cookie = "cookie=true";
      document.getElementById("cookieConfirm").classList.remove("active");
    });
    document.getElementById("cookie-disagree").addEventListener("click", function(){
      document.cookie = "cookie=false";
      document.getElementById("cookieConfirm").classList.remove("active");
    });
  }
});