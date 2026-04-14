// 授業データの読み込み
import {class1S1, class1S2} from "./script-class.js";
import {loadClass} from "./script-class.js";

// ============================================================

window.addEventListener("load", function(){
  
  // Cookie使用許諾確認
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

  // ============================================================
  // ============================================================
  // ============================================================

  // ターム選択
  const classDataMap = {
    "1S1": class1S1,
    "1S2": class1S2
  };

  document.querySelectorAll("ul#termList>li").forEach(item => {
    item.addEventListener("click", function(){
      document.querySelectorAll("ul#termList>li").forEach(li => {
        li.classList.remove("active");
      });
      item.classList.add("active");

      loadClass(classDataMap[item.innerHTML.replace("年-", "")]);
    });
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 授業データ反映
  document.cookie = `class1S1=${JSON.stringify(class1S1)};max-age=${String(60*60*2)}`;
  loadClass(class1S1);

});