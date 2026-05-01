import {
  class1S1,
  class1S2,
  class1A1,
  class1A2,
  class2S1,
  class2S2,
  class2A1,
  class2A2
} from "script-classData.js"

// ============================================================
// ============================================================
// ============================================================

let ALL_SYLLABUS = [];

// ============================================================
// ============================================================
// ============================================================

window.addEventListener("load", function(){
  console.log("script.js");
  
  // Cookie使用許諾確認
  // document.cookie = "cookie=;max-age=0";
  // console.log(document.cookie);

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

  // Supabaseからシラバスデータ読み取り
  fetch('https://my-worker.penguin92-prg.workers.dev')
  .then(res => res.json())
  .then(res => {
    console.log(res.data);
    const table = buildTimetable(res.data);
    console.log(table);
  })
  .catch(err => {
    console.error(err)
  });


  // ============================================================
  // ============================================================
  // ============================================================

  // ターム選択
  const classDataMap = {
    "1S1": class1S1,
    "1S2": class1S2,
    "1A1": class1A1,
    "1A2": class1A2,
    "2S1": class2S1,
    "2S2": class2S2,
    "2A1": class2A1,
    "2A2": class2A2
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
  // document.cookie = `class1S1=${JSON.stringify(class1S1)};max-age=${String(60*60*2)}`;
  loadClass(class1S1);
});




// ============================================================
// ============================================================
// ============================================================

function loadClass(registeredData){
  
  // 各曜限の授業内容を初期化
  document.querySelectorAll("#classTable [data-day]").forEach(cell => {
    cell.innerHTML = "";
  });

  // 各曜限ごとのデータを取得・更新
  for(let dayIndex = 0; dayIndex < 5; dayIndex++){
    for(let periodIndex = 0; periodIndex < 6; periodIndex++){

      // 曜限のセルを取得
      const cell = document.querySelector(
        `[data-day="${dayIndex+1}"][data-period="${periodIndex+1}"]`
      );
      if(!cell) continue;

      // 曜限の授業データ取得
      const periodClass = registeredData[dayIndex][periodIndex];
      if(Object.keys(periodClass).length === 0){
        cell.addEventListener("click", function(){
          // クリックされた曜限以外の選択を解除
          this.classList.add("active");
          document.querySelectorAll("#classTable [data-day]").forEach(cell => {
            cell.classList.remove("active");
          });
          
          // クリックされた曜限の授業をシラバスデータから取得
          const class_of_clicked_period = filterByPeriod(ALL_SYLLABUS, dayIndex, periodIndex+1)
          showClassList(classes)
          console.log(classes);
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
    let classIntensiveContainer = document.createElement("div");
    let classIntensiveName = document.createElement("p");
    classIntensiveName.innerText = classIntensive.name;
    classIntensiveContainer.appendChild(classIntensiveName);
    document.getElementById("classIntensiveTable").appendChild(classIntensiveContainer);
  }

  // 授業追加用モーダル内のボタンの動作設定
  document.getElementById("modalClose").addEventListener("click", function(){
    document.getElementById("modal").classList.remove("active");
    document.getElementById("modal").classList.remove("standby");
    document.querySelectorAll("#classTable [data-day]").forEach(cell => {
      cell.classList.remove("active");
    });
  });
  
  document.getElementById("modalToggle").addEventListener("click", function(){
    const modal = document.getElementById("modal");
    if(modal.classList.contains("active")){
      modal.classList.remove("active");
      modal.classList.add("standby");
    }
    else if(modal.classList.contains("standby")){
      modal.classList.add("active");
      modal.classList.remove("standby");
    }
  });
}

function classAddConfirm(){
  const dialog = document.getElementById("modal");
  const message = dialog.querySelector("p");
  const btnContainer = dialog.querySelector("#modalBtnContainer");

  dialog.classList.add("standby");
  message.textContent = "この曜限の授業を見る" 
}

window.addEventListener("load", function(){
});


function parsePeriod(str) {
  const dayMap = {
    "月": 1,
    "火": 2,
    "水": 3,
    "木": 4,
    "金": 5
  }

  const day = dayMap[str[0]]
  const period = Number(str[1])

  return { day, period }
}

// シラバスデータを曜限別に配列へ格納
function buildTimetable(data) {
  // 5日×6限の空配列を作成
  const table = Array.from({ length: 5 }, () =>
    Array.from({ length: 6 }, () => [])
  )

  // 各授業を曜限別配列に追加
  for (const course of data) {
    for (const p of course.periods) {
      // 曜限データの取得（曜日と時限を分けて）
      const { day, period } = parsePeriod(p)

      // データ欠損がある場合は飛ばす
      if(!day || !period){
        continue;
      }

      // 曜限別配列に追加
      table[day-1][period-1].push({
        course
      });
    }
  }

  return table
}

// ============================================================

// 指定した曜限の授業をシラバスデータから抽出
function filterByPeriod(allCourses, day, period) {
  const dayMap = ["月","火","水","木","金"]

  return allCourses.filter(course =>
    course.periods.some(p =>
      p === `${dayMap[day]}${period}`
    )
  )
}