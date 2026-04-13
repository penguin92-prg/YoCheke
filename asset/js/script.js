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
  document.querySelectorAll("ul#termList>li").forEach(item => {
    item.addEventListener("click", function(){
      document.querySelectorAll("ul#termList>li").forEach(li => {
        li.classList.remove("active");
      });
      item.classList.add("active");
    });
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 授業データ読み込み
  const classAll = [
    // 月
    [
      {}, 
      { category: "basic-sport", name: "身体運動・健康科学実習Ⅰ" }, 
      { category: "basic-lang2", name: "ドイツ語二列" }, 
      {}, 
      {}, 
      {}
    ],

    // 火
    [
      {}, 
      { category: "comp-e", name: "基礎化学" }, 
      { category: "basic-lang1", name: "英語一列①" }, 
      { category: "basic-sci-math", name: "数理科学基礎" }, 
      { category: "basic-sci-math", name: "数理科学基礎演習" }, 
      {}
    ],

    // 水
    [
      { category: "comp-l", name: "英語中級（クラス指定セメスター型）" }, 
      { category: "basic-lang2", name: "ドイツ語一列①" }, 
      { category: "basic-sci-mtrl", name: "熱力学" }, 
      { category: "basic-seminar", name: "初年次ゼミナール理科" }, 
      { category: "theme", name: "全学体験ゼミナール（飛行ロボットを作って飛ばす）" }, 
      {}
    ],

    // 木
    [
      {}, 
      {}, 
      { category: "basic-info", name: "情報" }, 
      {}, 
      {}, 
      {}
    ],

    // 金
    [
      { category: "basic-sci-math", name: "数理科学基礎" }, 
      {}, 
      {}, 
      { category: "basic-sci-mtrl", name: "力学A" }, 
      { category: "theme", name: "全学自由研究ゼミナール（グラフィックデザイン概論）" }, 
      { category: "theme", name: "全学体験ゼミナール（ロボット競技を体験しようA）" }
    ]
  ];

  document.cookie = `class1S1=${classAll};max-age=${String(60*60*2)}`;

  const days = ["月", "火", "水", "木", "金"];

  for (const [dayIndex, classDaily] of classAll.entries()) {

    // 曜日名を挿入
    let dayNameContainer = document.createElement("div");
    let dayName = document.createElement("p");
    dayName.innerText = days[dayIndex];
    dayNameContainer.appendChild(dayName);
    document.getElementById("classTable").appendChild(dayNameContainer);

    for (const [periodIndex, classData] of classDaily.entries()) {

      // 授業を挿入
      let classNameContainer = document.createElement("div");
      if (Object.keys(classData).length !== 0) {
        let className = document.createElement("a");
        className.innerText = classData.name;
        classNameContainer.appendChild(className);
        // console.log(`${days[dayIndex]}曜 ${periodIndex + 1}限: ${classData.name} (${classData.category})`);
      }
      document.getElementById("classTable").appendChild(classNameContainer);
    }
  }
});