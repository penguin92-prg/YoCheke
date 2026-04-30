// ============================================================
// ============================================================
// ============================================================

export function loadClass(data){
  
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
      const periodClass = data[dayIndex][periodIndex];
      if(Object.keys(periodClass).length === 0){
        cell.addEventListener("click", function(){
          document.querySelectorAll("#classTable [data-day]").forEach(cell => {
            cell.classList.remove("active");
          });
          this.classList.add("active");
          classAddConfirm();
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

  // 授業追加用モーダルの閉じるボタンの動作設定
  document.getElementById("confirmModalClose").addEventListener("click", function(){
    document.getElementById("confirmModal").classList.remove("active");
    document.querySelectorAll("#classTable [data-day]").forEach(cell => {
      cell.classList.remove("active");
    });
  });
}

function classAddConfirm(){
  const dialog = document.getElementById("confirmModal");
  const message = dialog.querySelector("p");
  const btnContainer = dialog.querySelector("#confirmBtnContainer");

  dialog.classList.add("active");
  message.textContent = "この曜限に授業を登録しますか？"

  const btn1 = document.createElement("button");
  const btn2 = document.createElement("button");
  
  btn1.setAttribute("id", "confirmBtn1");
  btn2.setAttribute("id", "confirmBtn2");
  btn1.innerText = "はい";
  btn2.innerText = "いいえ";

  btnContainer.innerHTML = "";
  btnContainer.appendChild(btn1);
  btnContainer.appendChild(btn2);
}

window.addEventListener("load", function(){
  fetch('https://my-worker.penguin92-prg.workers.dev')
  .then(res => res.json())
  .then(res => {
    const table = buildTimetable(res.data);
    loadClass(table);
  })
  .catch(err => {
    console.error(err)
  })
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

