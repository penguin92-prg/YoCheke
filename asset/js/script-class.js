// 授業データ
export const class1S1 = [
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

export const class1S2 = [
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

export function loadClass(data){

  // 授業データの初期化
  document.querySelectorAll("#classTable>div:nth-of-type(n+8)").forEach(div => {
    div.innerHTML = "";
  });

  for (const [dayIndex, dayClass] of data.entries()) {
  
    // 曜日名の挿入
    const days = ["月", "火", "水", "木", "金"];
  
    let dayName = document.createElement("p");
    dayName.innerText = days[dayIndex];
    document.querySelector(`#classTable>div:nth-of-type(${dayIndex*7 + 8})`).appendChild(dayName);
  
    for (const [periodIndex, periodClass] of dayClass.entries()) {
  
      // 授業名の挿入
      if (Object.keys(periodClass).length !== 0) {
        let className = document.createElement("a");
        className.innerText = periodClass.name;
        document.querySelector(`#classTable>div:nth-of-type(${(dayIndex*7 + 8) + (periodIndex+1)})`).appendChild(className);
      }

      // 授業内容の操作
      document.querySelector(`#classTable>div:nth-of-type(${(dayIndex*7 + 8) + (periodIndex+1)})`).addEventListener("click", function(){
        window.prompt("Enter class-name...");
      });
    }
  }
}