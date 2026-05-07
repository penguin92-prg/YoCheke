/**
 * @typedef {Object} Course
 * @typedef {Course[][]} WeeklyTable
 * @typedef {Array<WeeklyTable | Course[]>} Timetable
 * @property {string} title
 * @property {string} lecturer
 * @property {string[]} periods
 * @property {string} detail
 * @property {string} type
 * @property {string} category
 */

// ============================================================
// ============================================================
// ============================================================

import {
  course1S1
} from "./script-courseData.js"

// ============================================================
// ============================================================
// ============================================================

/**
 * 全講義データ
 * @type {Course[]}
 */
let ALL_SYLLABUS = [];

/**
 * 曜限別の全講義データ
 * @type {Timetable}
 */
let SYLLABUS_PERIOD = [];

/**
 * 曜日indexから曜日名への連想配列
 * @type {Record<number, string>}
 */
const NUM_TO_DAY = {
  1: "月",
  2: "火",
  3: "水",
  4: "木",
  5: "金"
};

/**
 * ターム別の登録済み講義データ
 * @type {WeeklyTable}
 */
let registered_course_1s1;

// ============================================================
// ============================================================
// ============================================================

window.addEventListener("load", function(){
  console.log("script.js");
  
  // ============================================================
  // ============================================================
  // ============================================================
  
  // ユーザーデータの使用許諾
  // document.cookie = "cookie=;max-age=0";
  // console.log(document.cookie);
  if(document.cookie.indexOf("cookie=true") != -1){
    console.log("Cookie/LocalStorageの使用が許可されています");
    document.cookie = "cookie=true;max-age=" + String(60*60*2);
  }
  else if(document.cookie.indexOf("cookie=false") != -1){
    console.log("Cookie/LocalStorageの使用が許可されていません");
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

  // Supabaseから講義データ読み取り
  fetch('https://my-worker.penguin92-prg.workers.dev')
  .then(res => res.json())
  .then(res => {
    // 講義データをグローバル化
    ALL_SYLLABUS = res.data;

    // 曜限別データに変換
    SYLLABUS_PERIOD = buildTimetable(res.data);
  })
  .catch(err => {
    console.error(err)
  });


  // ============================================================
  // ============================================================
  // ============================================================

  // 登録済み講義データをLocalStorageから取得
  registered_course_1s1 = JSON.parse(localStorage.getItem("registered_course_1s1"));
  console.log(registered_course_1s1);

  // ============================================================
  // ============================================================
  // ============================================================

  // ターム選択
  /**
   * ターム名と登録済み講義データの連想配列
   * @type {Record<string, Course[][] | null>}
   */
  const courseDataMap = {
    "1S1": registered_course_1s1,
    "1S2": null,
    "1A1": null,
    "1A2": null,
    "2S1": null,
    "2S2": null,
    "2A1": null,
    "2A2": null
  };

  document.querySelectorAll("ul#termList>li").forEach(item => {
    item.addEventListener("click", function(){
      document.querySelectorAll("ul#termList>li").forEach(li => {
        li.classList.remove("active");
      });
      item.classList.add("active");

      loadCourse(courseDataMap[item.textContent.replace("年-", "")]);
    });
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 登録済みの講義データの反映
  loadCourse(registered_course_1s1);

  // 登録済みの集中講義データの反映
  loadCourseIntensive(registered_course_1s1);

  // 授業追加用モーダル内のボタンの動作設定
  document.getElementById("modalClose").addEventListener("click", function(){
    document.getElementById("modal").classList.remove("active");
    document.getElementById("modal").classList.remove("standby");
    document.querySelectorAll("#classTable [data-day]").forEach(cell => {
      cell.classList.remove("active");
    });
  });
});




// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの講義データの読み込み
 * @param {Course[][]} registered_data 登録済み講義データ
 */
function loadCourse(registered_data){

  console.log(registered_data);
  
  // 各曜限セルの初期化
  document.querySelectorAll("#classTable [data-day]").forEach(cell => {
    cell.innerHTML = "";
  });

  // 各曜限ごとのデータを取得・更新
  for(let day_index = 0; day_index < 5; day_index++){
    for(let period_index = 0; period_index < 6; period_index++){

      // 曜限のセルを取得
      const cell = document.querySelector(
        `[data-day="${day_index+1}"][data-period="${period_index+1}"]`
      );
      if(!cell) continue;

      // 各曜限の授業データ取得
      const course_of_clicked_period = registered_data[day_index][period_index];
      
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);
      
      if(Object.keys(course_of_clicked_period).length === 0){
        // 空き曜限がクリックされたときの動作設定
        newCell.addEventListener("click", function(){
          // クリックされた曜限以外の選択を解除
          document.querySelectorAll("#classTable [data-day]").forEach(cell => {
            cell.classList.remove("active");
          });
          this.classList.add("active");

          // モーダルに表示
          const all_course_of_clicked_period = filterByPeriod(ALL_SYLLABUS, Number(this.dataset.day), Number(this.dataset.period));
          const modal_message = `講義を見る｜${NUM_TO_DAY[this.dataset.day]}${this.dataset.period}`;
          modalActivate(all_course_of_clicked_period, modal_message);
        });
        continue;
      }
      else{
        // 登録済み曜限がクリックされたときの動作設定
        newCell.addEventListener("click", function(){
          console.log(JSON.parse(this.querySelector("a").dataset.course));
          modalActivate([JSON.parse(this.querySelector("a").dataset.course)], "登録済みの講義");
          // if(confirm("この講義を削除しますか?\n" + String(NUM_TO_DAY[this.dataset.day]) + "曜 " + String(this.dataset.period) + "限 " + String(JSON.parse(this.querySelector("a").dataset.course).title))){
          //   registered_data[this.dataset.day-1][this.dataset.period-1] = {};
          //   loadCourse(registered_data);
          // }
        });
      }

      // 曜限の授業データをセルに書き込み
      const el = document.createElement("a");
      el.setAttribute("data-course", JSON.stringify(course_of_clicked_period));
      el.innerText = course_of_clicked_period.title;
      newCell.appendChild(el);
    }
  }
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの集中講義データの読み込み
 * @param {Course[][]} registered_data 登録済み講義データ
 */
function loadCourseIntensive(registered_data){

  // 集中講義の授業内容を初期化
  document.getElementById("courseIntensiveTable").innerHTML = "";

  if(registered_data[5] == null) return;

  for(let course_intensive of registered_data[5]){
    const course_intensive_clone = document.getElementById("template_courseIntensive").content.cloneNode(true);
    course_intensive_clone.firstElementChild.setAttribute("data-course", JSON.stringify(course_intensive));
    course_intensive_clone.querySelector("p").innerText = course_intensive.title;
    course_intensive_clone.querySelector("button.detail").addEventListener("click", function(){
      modalActivate([JSON.parse(this.parentElement.dataset.course)], "登録済みの集中講義");
    });
    course_intensive_clone.querySelector("button.remove").addEventListener("click", function(){
      if(confirm("登録されている講義を削除します。よろしいですか?")){
        registered_data[5].splice(registered_data[5].indexOf(JSON.parse(this.parentElement.dataset.course)), 1);
        localStorage.setItem("registered_course_1s1", JSON.stringify(registered_data))
        loadCourseIntensive(registered_data);
      }
    });
    document.getElementById("courseIntensiveTable").appendChild(course_intensive_clone);
  }

  document.getElementById("addCourseIntensive").addEventListener("click", function(){
    const all_course_of_clicked_period =  filterByPeriod(ALL_SYLLABUS, null, null);
    modalActivate(all_course_of_clicked_period, "講義を見る｜集中")
  });
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 曜限の生データから曜日と時限を分離取得
 * @param {str} str 曜限名
 * @returns {Array<Object>} {day, period, intensive}
 * @example
 * parsePeriod("月4");  // {day: 1, period: 4, intensive: false}
 * parsePeriod("集中"); // {day: null, period: null, intensive: true}
 */
function parsePeriod(str) {
  const DAY_TO_NUM = {
    "月": 1,
    "火": 2,
    "水": 3,
    "木": 4,
    "金": 5
  }

  if(str == "集中"){
    return {day: null, period: null, intensive: true};
  }
  else{  
    return {day: DAY_TO_NUM[str[0]], period: Number(str[1]), intensive: false}
  }
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 講義データを曜限別に配列へ格納
 * @param {Array<Object>} all_course 全講義データ
 * @returns {Array<Object>} table 曜限別全講義データ
 */
function buildTimetable(all_course) {
  // 5日×6限+集中講義の空配列を作成
  const table = Array.from({ length: 5 }, () =>
    Array.from({ length: 6 }, () => [])
  );
  // 集中講義用の配列を追加
  table.push([]);

  // 各授業を曜限別配列に追加
  for (const course of all_course) {
    for (const p of course.periods) {
      // 曜限データの取得（曜日と時限を分けて）
      const {day, period, intensive} = parsePeriod(p)

      // 集中講義の場合は曜限外の配列に追加
      if(intensive){
        table[5].push(course);
      }
      // データ欠損がある場合は飛ばす
      else if(!day || !period){
        continue;
      }
      // 通常講義は曜限別配列に追加
      else{
        table[day-1][period-1].push(course);
      }
    }
  }

  return table;
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 指定した曜限の講義のみを全講義データから抽出
 * @param {Course[]} all_course 全講義データ
 * @param {number|null} day 曜日インデックス
 * @param {number|null} period 時限インデックス
 * @returns {Course[]} 指定曜限の全講義データ
 */
function filterByPeriod(all_course, day, period) {
  return all_course.filter(course => {
    return course.periods.some(p => {
      const parsed = parsePeriod(p);

      // 集中講義のみ場合分け
      if (parsed.intensive) {
        return day === null;
      }

      return parsed.day === day && parsed.period === period;
    });
  });
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済み講義かどうかを判定
 * @param {Course} course 判定する講義データ（1講義分）
 * @returns {boolean} 登録済みかどうかの判定（登録済み→true）
 */
function isRegistered(course){
  return registered_course_1s1.some(day => {
    if(Array.isArray(day)){
      return day.some(c => c.id === course.id);
    }
    return false;
  });
}

// ============================================================
// ============================================================
// ============================================================

/**
 * モーダルに授業一覧を表示
 * @param {Course[]} all_course モーダルに表示する講義データ
 * @param {string} message モーダルに表示するメッセージ 
 */
function modalActivate(all_course, message){
  const modal = document.getElementById("modal");
  modal.querySelector("p").innerText = message;
  modal.querySelector("#modalCourseList").innerHTML = "";

  // クリックされた曜限の授業を講義データから取得
  all_course.forEach(course => {
    const item_clone = document.getElementById("template_modalCourse").content.cloneNode(true);

    item_clone.firstElementChild.setAttribute("data-course", JSON.stringify(course));
    item_clone.querySelector(".modalCourseTitle").innerText = course.title;
    item_clone.querySelector(".modalCourseLecturer").innerText = course.lecturer;
    item_clone.querySelector(".modalCoursePeriod").innerText = String(course.periods).replace(",", " ･ ");
    item_clone.querySelector(".modalCourseDetail").innerText = course.detail;
    console.log(registered_course_1s1);
    if(isRegistered(course)){
      item_clone.querySelector(".modalCourseAdd").setAttribute("disabled", "");
      item_clone.querySelector(".modalCourseAdd").innerText = "追加済み";
    }
    item_clone.querySelector(".modalCourseAdd").addEventListener("click", function(){
      const adding_course = JSON.parse(this.parentElement.parentElement.dataset.course);
      if(adding_course.periods.length >= 2){
        console.log("wow! more than two classes per week!");
      }
      else{
        const {day, period, intensive} = parsePeriod(adding_course.periods[0]);
        if(intensive){
          // 集中講義の場合
          if(registered_course_1s1[5].indexOf(adding_course) == -1){
            registered_course_1s1[5].push(adding_course);
            localStorage.setItem("registered_course_1s1", JSON.stringify(registered_course_1s1));
            loadCourseIntensive(registered_course_1s1);
          }
        }
        else{
          // 通常の講義の場合
          registered_course_1s1[Number(day)-1][Number(period)-1] = adding_course;
          localStorage.setItem("registered_course_1s1", JSON.stringify(registered_course_1s1));
          loadCourse(registered_course_1s1);
        }
        this.setAttribute("disabled", "");
        this.innerText = "追加済み";
      }
    });

    const item_attr1 = item_clone.querySelector(".modalCourseType");
    const item_attr2 = item_clone.querySelector(".modalCourseCategory");
    item_attr1.innerText = course.type + "科目";
    switch(course.type){
    case "基礎":
      item_attr1.classList.add("basic");
      break;
    case "総合":
      item_attr1.classList.add("comprehensive");
      break;
    case "主題":
      item_attr1.classList.add("subjective");
      break;
    case "展開":
      item_attr1.classList.add("expansive");
      break;
    case "要求":
      item_attr1.classList.add("required");
      break;
    }
    item_attr2.innerText = course.category;

    item_clone.firstElementChild.addEventListener("click", function(){
      this.classList.toggle("active");
    });

    modal.querySelector("#modalCourseList").appendChild(item_clone);
  });

  // モーダルを表示
  modal.classList.add("active");
}