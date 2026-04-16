// 授業データ
export const class1S1 = [
  // 月
  [
    {},
    {category: "basic-sport", name: "身体運動・健康科学実習Ⅰ"}, 
    {category: "basic-lang2", name: "ドイツ語二列"}, 
    {}, 
    {}, 
    {}
  ],

  // 火
  [
    {}, 
    {category: "comp-e", name: "基礎化学"}, 
    {category: "basic-lang1", name: "英語一列①"}, 
    {category: "basic-sci-math", name: "数理科学基礎"}, 
    {category: "basic-sci-math", name: "数理科学基礎演習"}, 
    {}
  ],

  // 水
  [
    {category: "comp-l", name: "英語中級（クラス指定セメスター型）"}, 
    {category: "basic-lang2", name: "ドイツ語一列①"}, 
    {category: "basic-sci-mtrl", name: "熱力学"}, 
    {category: "basic-seminar", name: "初年次ゼミナール理科"}, 
    {category: "theme", name: "全学体験ゼミナール（飛行ロボットを作って飛ばす）"}, 
    {}
  ],

  // 木
  [
    {}, 
    {}, 
    {category: "basic-info", name: "情報"}, 
    {}, 
    {}, 
    {}
  ],

  // 金
  [
    {category: "basic-sci-math", name: "数理科学基礎"}, 
    {}, 
    {}, 
    {category: "basic-sci-mtrl", name: "力学A"}, 
    {category: "theme", name: "全学自由研究ゼミナール（グラフィックデザイン概論）"}, 
    {category: "theme", name: "全学体験ゼミナール（ロボット競技を体験しようA）"}
  ],

  // 集中
  [
    {name: "全学体験ゼミナール（模擬人工衛星開発を体験しようA）"}
  ]
];

export const class1S2 = [
  // 月
  [
    {}, 
    {category: "basic-sport", name: "身体運動・健康科学実習Ⅰ"}, 
    {category: "basic-lang2", name: "ドイツ語二列"}, 
    {}, 
    {}, 
    {}
  ],

  // 火
  [
    {}, 
    {category: "comp-e", name: "基礎化学"}, 
    {category: "basic-lang1", name: "英語一列①"}, 
    {category: "basic-sci-math", name: "数理科学基礎"}, 
    {category: "basic-sci-math", name: "数理科学基礎演習"}, 
    {}
  ],

  // 水
  [
    {category: "comp-l", name: "英語中級（クラス指定セメスター型）"}, 
    {category: "basic-lang2", name: "ドイツ語一列①"}, 
    {category: "basic-sci-mtrl", name: "熱力学"}, 
    {category: "basic-seminar", name: "初年次ゼミナール理科"}, 
    {category: "theme", name: "全学体験ゼミナール（飛行ロボットを作って飛ばす）"}, 
    {}
  ],

  // 木
  [
    {}, 
    {}, 
    {category: "basic-info", name: "情報"}, 
    {}, 
    {}, 
    {}
  ],

  // 金
  [
    {category: "basic-sci-math", name: "数理科学基礎"}, 
    {}, 
    {}, 
    {category: "basic-sci-mtrl", name: "力学A"}, 
    {category: "theme", name: "全学自由研究ゼミナール（グラフィックデザイン概論）"}, 
    {category: "theme", name: "全学体験ゼミナール（ロボット競技を体験しようA）"}
  ],

  // 集中
  [
    {name: "全学体験ゼミナール（模擬人工衛星開発を体験しようA）"}
  ]
];

export const class1A1 = null;
export const class1A2 = null;
export const class2S1 = null;
export const class2S2 = null;
export const class2A1 = null;
export const class2A2 = null;

// ============================================================
// ============================================================
// ============================================================

export function loadClass(data){
  
  // 各曜限の授業内容を初期化
  document.querySelectorAll("#classTable [data-day]").forEach(cell => {
    cell.innerHTML = "";
  });

  for(let dayIndex = 0; dayIndex < 5; dayIndex++){
    for(let periodIndex = 0; periodIndex < 6; periodIndex++){

      // 曜限のセルを取得
      const cell = document.querySelector(
        `[data-day="${dayIndex+1}"][data-period="${periodIndex+1}"]`
      );
      if(!cell) continue;

      // 曜限の授業データ取得
      const periodClass = data[dayIndex][periodIndex];
      if(Object.keys(periodClass).length === 0){
        cell.addEventListener("click", function(){
          confirm("ここは空きコマです！授業を入れますか？");
        });
        continue;
      }

      // 曜限の授業データをセルに書き込み
      const el = document.createElement("a");
      el.innerText = periodClass.name;
      cell.appendChild(el);
    }
  }

  // ============================================================

  // 集中講義の授業内容を初期化
  document.getElementById("classIntensiveTable").innerHTML = "";

  if(data[5] == null) return;

  for(let classIntensive of data[5]){
    console.log(classIntensive);
    let classIntensiveContainer = document.createElement("div");
    let classIntensiveName = document.createElement("p");
    classIntensiveName.innerText = classIntensive.name;
    classIntensiveContainer.appendChild(classIntensiveName);
    document.getElementById("classIntensiveTable").appendChild(classIntensiveContainer);
  }
}