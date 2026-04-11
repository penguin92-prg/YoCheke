window.addEventListener("load", function(){
  
  // document.cookie = "cookie=;max-age=0";
  console.log(document.cookie);

  if(document.cookie.indexOf("cookie=true") != -1){
    console.log("Cookieの使用が許可されています");
    document.cookie = "cookie=true;max-age=" + String(60*60*2);
  }
  else if(document.cookie.indexOf("cookie=false") != -1){
    console.log("Cookieの使用が許可されていません");
    document.cookie = "cookie=false;max-age=" + String(60*60*2);
  }
  else{
    document.getElementById("cookieConfirm").classList.add("active");
    document.getElementById("cookie-agree").addEventListener("click", function(){
      document.cookie = "cookie=true;max-age=" + String(60*60*2);
      document.getElementById("cookieConfirm").classList.remove("active");
    });
    document.getElementById("cookie-disagree").addEventListener("click", function(){
      document.cookie = "cookie=false;max-age=" + String(60*60*2);
      document.getElementById("cookieConfirm").classList.remove("active");
    });
  }


  document.querySelectorAll("ul#termList>li").forEach(item => {
    item.addEventListener("click", function(){
      document.querySelectorAll("ul#termList>li").forEach(li => {
        li.classList.remove("active");
      });
      item.classList.add("active");
    });
  });
});