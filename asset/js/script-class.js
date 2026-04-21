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
          this.classList.toggle("active");
          console.log(this);
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