/**
 * @typedef {Object} Course
 * @typedef {Course[][]} WeeklyTable
 * @typedef {Course[]} IntensiveTable
 * @typedef {Course[][][]} Timetable
 * @property {string} title
 * @property {string} lecturer
 * @property {string[]} periods
 * @property {string} detail
 * @property {string} type
 * @property {string|number} id
 * @property {string} category
 * @property {number} credit
 */

// ============================================================
// ============================================================
// ============================================================

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
 * @type {WeeklyTable[]}
 */
let registered_course_all_term;

/**
 * ターム別の登録済み集中講義データ
 * @type {Course[][]}
 */
let registered_course_intensive_all_term;

/**
 * 現在表示中のタームインデックス
 * @type {number}
 */
let current_term_index = 0;

/**
 * ターム名からindexへの連想配列
 */
const TERM_INDEX = {
  "1S1": 0,
  "1S2": 1,
  "1A1": 2,
  "1A2": 3,
  "2S1": 4,
  "2S2": 5,
  "2A1": 6,
  "2A2": 7
};

/**
 * 表示中の登録講義の単位数合計
 * @type {number}
 */
let credit_sum = 0;

/**
 * ユーザーの科類
 * @type {string}
 */
let user_faculty;

/**
 * ユーザーの学年
 * @type {number}
 */
let user_grade;

/**
 * ユーザーのクラス
 * @type {number}
 */
let user_class;

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
  if(document.cookie.indexOf("cookie=true") !== -1){
    console.log("Cookie/LocalStorageの使用が許可されています");
    document.cookie = "cookie=true;max-age=" + String(60*60*2);
  }
  else if(document.cookie.indexOf("cookie=false") !== -1){
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
  registered_course_all_term = initRegisteredCourse()
  registered_course_intensive_all_term = initRegisteredCourseIntensive();

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

      current_term_index = TERM_INDEX[item.dataset.value];

      loadCourse();
      loadCourseIntensive();
    });
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 登録済みの講義データの反映
  loadCourse();

  // 登録済みの集中講義データの反映
  loadCourseIntensive();

  // 集中講義追加ボタンの動作設定
  document.getElementById("addCourseIntensive").addEventListener("click", function(){
    const all_course_of_clicked_period =  filterByPeriod(ALL_SYLLABUS, null, null);
    modalActivate(all_course_of_clicked_period, "講義を見る｜集中")
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 講義一覧モーダルの閉ボタンの動作設定
  document.getElementById("modalClose").addEventListener("click", function(){
    document.getElementById("modal").classList.remove("active");
    document.getElementById("modal").classList.remove("standby");
    document.querySelectorAll("#courseTable [data-day]").forEach(cell => {
      cell.classList.remove("active");
    });
  });

  // ============================================================
  // ============================================================
  // ============================================================

  document.getElementById("shinfuriCheckBtn").addEventListener("click", function(){
    if(user_faculty !== undefined && user_faculty !== null){
      document.getElementById("mainWindow").classList.toggle("hidden");
      document.getElementById("checkWindow").classList.toggle("hidden");
      
      console.log(user_faculty);
      console.log(shinfuri_requirement[user_faculty]);

      const container = document.querySelector("#checkTable>tbody");
      container.innerHTML = "";
      renderTable(shinfuri_requirement[user_faculty], container);
    }
    else{
      alert("科類を選択してください");
    }
  });
  document.getElementById("checkWindowClose").addEventListener("click", function(){
    document.getElementById("mainWindow").classList.toggle("hidden");
    document.getElementById("checkWindow").classList.toggle("hidden");
  });

  // ============================================================
  // ============================================================
  // ============================================================

  // 科類・学年・クラスの選択
  const select_karui = document.getElementById("karui");
  if(localStorage.getItem("user_faculty") !== null && localStorage.getItem("user_faculty") !== undefined){
    user_faculty = localStorage.getItem("user_faculty");
    select_karui.value = user_faculty;
  }
  select_karui.addEventListener("change", function(){
    user_faculty = this.value;
    localStorage.setItem("user_faculty", this.value);
  });

  const select_grade = document.getElementById("grade");
  if(localStorage.getItem("user_grade") !== null && localStorage.getItem("user_grade") !== undefined){
    user_grade = localStorage.getItem("user_grade");
    select_grade.value = user_grade;
  }
  select_grade.addEventListener("change", function(){
    user_grade = this.value;
    localStorage.setItem("user_grade", this.value);
  });

  const select_class = document.getElementById("class");
  if(localStorage.getItem("user_class") !== null && localStorage.getItem("user_class") !== undefined){
    user_class = localStorage.getItem("user_class");
    select_class.value = user_class;
  }
  select_class.addEventListener("change", function(){
    user_class = this.value;
    localStorage.setItem("user_class", this.value);
  });



});




// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの講義データの読み込み
 * @return {WeeklyTable[]} 必要に応じて初期化処理を施した登録済み講義データ
 */
function initRegisteredCourse(){
  let registered_course_all_term = JSON.parse(localStorage.getItem("registered_course_all_term"));

  if (registered_course_all_term == null) {

    registered_course_all_term = Array.from(
      { length: 8 },
      () => [
        // 月
        [null, null, null, null, null, null],

        // 火
        [null, null, null, null, null, null],

        // 水
        [null, null, null, null, null, null],

        // 木
        [null, null, null, null, null, null],

        // 金
        [null, null, null, null, null, null],
      ]
    );

    localStorage.setItem(
      "registered_course_all_term",
      JSON.stringify(registered_course_all_term)
    );
  }

  return registered_course_all_term;
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの集中講義データの読み込み
 * @return {Course[][]} 必要に応じて初期化処理を施した登録済み集中講義データ
 */
function initRegisteredCourseIntensive(){
  let registered_course_intensive_all_term = JSON.parse(localStorage.getItem("registered_course_intensive_all_term"));

  if (registered_course_intensive_all_term == null) {

    registered_course_intensive_all_term = Array.from(
      { length: 8 },
      () => []
    );

    localStorage.setItem(
      "registered_course_intensive_all_term",
      JSON.stringify(registered_course_intensive_all_term)
    );
  }

  return registered_course_intensive_all_term;
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの講義データの読み込み
 */
function loadCourse(){
  // 選択中タームの登録済みデータ
  const registered_data = registered_course_all_term[current_term_index];
  
  // 各曜限セルの初期化
  document.querySelectorAll("#courseTable [data-day]").forEach(cell => {
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
      const course = registered_data[day_index][period_index];
      
      if(course == null || !course.title){
        // 空き曜限がクリックされたときの動作設定
        cell.onclick = function(){
          // モーダルに表示
          const all_course_of_clicked_period = filterByPeriod(ALL_SYLLABUS, Number(this.dataset.day), Number(this.dataset.period));
          const modal_message = `講義を見る｜${NUM_TO_DAY[this.dataset.day]}${this.dataset.period}`;
          modalActivate(all_course_of_clicked_period, modal_message);
        }
        continue;
      }
      else{
        // 登録済み曜限がクリックされたときの動作設定
        cell.onclick = function(){
          modalActivate([JSON.parse(this.querySelector("a").dataset.course)], "登録済みの講義｜" + NUM_TO_DAY[this.dataset.day] + this.dataset.period);
        }
      }

      // 曜限の授業データをセルに書き込み
      const el = document.createElement("a");
      el.setAttribute("data-course", JSON.stringify(course));
      el.innerText = course.title;
      if(parsePeriod(course.periods[0]).day-1 == day_index && parsePeriod(course.periods[0]).period-1 == period_index){
        credit_sum += Number(course.credits);
      }
      cell.appendChild(el);
    }
  }

  console.log(credit_sum);
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済みの集中講義データの読み込み
 */
function loadCourseIntensive(){
  // 選択中タームの登録済みデータ
  const registered_data = registered_course_intensive_all_term[current_term_index];

  // 集中講義の授業内容を初期化
  document.getElementById("courseIntensiveTable").innerHTML = "";

  if(registered_data == null) return;

  for(let course_intensive of registered_data){
    const course_intensive_clone = document.getElementById("template_courseIntensive").content.cloneNode(true);
    course_intensive_clone.firstElementChild.setAttribute("data-course", JSON.stringify(course_intensive));
    course_intensive_clone.querySelector("p").innerText = course_intensive.title;
    course_intensive_clone.querySelector("button.detail").addEventListener("click", function(){
      modalActivate([JSON.parse(this.parentElement.dataset.course)], "登録済みの集中講義");
    });
    course_intensive_clone.querySelector("button.remove").addEventListener("click", function(){
      if(confirm("登録されている講義を削除します。よろしいですか?")){
        registered_data.splice(registered_data.findIndex(c => c.id === course_intensive.id),1);
      }
      saveRegisteredCourseIntensive();
      loadCourseIntensive();
    });
    document.getElementById("courseIntensiveTable").appendChild(course_intensive_clone);
  }
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 曜限の生データから曜日と時限を分離取得
 * @param {string} str 曜限名
 * @returns {{
 *   day: number|null,
 *   period: number|null,
 *   intensive: boolean
 * }}
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
 * @param {Course[]} all_course 全講義データ（集中講義含む）
 * @returns {Timetable} table 曜限別全講義データ（集中講義含む）
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
        return day === null && period === null;
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
function isRegistered(course, term_index){
  const registered_data = registered_course_all_term[term_index];

  // 通常講義
  for(let day = 0; day < 5; day++){
    for(let period = 0; period < 6; period++){
      if(registered_data[day][period]?.id === course.id){
        return true;
      }
    }
  }

  // 集中講義
  return registered_course_intensive_all_term[term_index].some(c => c.id === course.id);
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済み講義を削除
 * @param {Course} course 削除する講義データ（1講義分）
 */
function removeRegister(course, term_index){
  for(let nth_period of course.periods){
    const {day, period, intensive} = parsePeriod(nth_period);
    if(!intensive){
      // 通常講義の削除処理
      registered_course_all_term[term_index][day-1][period-1] = null;

    }
    else{
      // 集中講義の削除処理
      registered_course_intensive_all_term[term_index].splice(
        registered_course_intensive_all_term[term_index].findIndex(c => c.id === course.id),
        1
      );
    }
  }

  saveRegisteredCourse();
  saveRegisteredCourseIntensive();
  loadCourse();
  loadCourseIntensive();
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済み講義をlocalStorageに保存
 */
function saveRegisteredCourse(){
  localStorage.setItem(
    "registered_course_all_term",
    JSON.stringify(registered_course_all_term)
  );
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 登録済み集中講義をlocalStorageに保存
 */
function saveRegisteredCourseIntensive(){
  localStorage.setItem(
    "registered_course_intensive_all_term",
    JSON.stringify(registered_course_intensive_all_term)
  );
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
    item_clone.querySelector(".modalCoursePeriod").innerText = String(course.periods.join(" ･ "));
    item_clone.querySelector(".modalCourseDetail").innerText = course.detail;

    // 登録済み授業は削除ボタンを表示
    if(isRegistered(course, current_term_index)){
      item_clone.querySelector("button.add").setAttribute("disabled", "");
      item_clone.querySelector("button.remove").removeAttribute("disabled");
    }
    else{
      item_clone.querySelector("button.remove").setAttribute("disabled", "");
      item_clone.querySelector("button.add").removeAttribute("disabled");
    }

    item_clone.querySelector("button.remove").addEventListener("click", function(){
      if(confirm("登録されている講義を削除します。よろしいですか?")){
        removeRegister(course, current_term_index);
        this.setAttribute("disabled", "");
        this.parentElement.querySelector("button.add").removeAttribute("disabled");
        // document.getElementById("modal").classList.remove("active");
      }
    });
    
    item_clone.querySelector("button.add").addEventListener("click", function(){
      const adding_course = JSON.parse(this.parentElement.parentElement.dataset.course);

      for(let nth_period of adding_course.periods){
        const {day, period, intensive} = parsePeriod(nth_period);
        if(intensive){
          // 集中講義の場合
          if(!registered_course_intensive_all_term[current_term_index].some(c => c.id === adding_course.id)){
            registered_course_intensive_all_term[current_term_index].push(adding_course);
          }
        }
        else{
          // 通常の講義の場合
          registered_course_all_term[current_term_index][Number(day)-1][Number(period)-1] = adding_course;
        }
      }
      saveRegisteredCourse();
      saveRegisteredCourseIntensive();
      loadCourse();
      loadCourseIntensive();

      this.setAttribute("disabled", "");
      this.parentElement.querySelector("button.remove").removeAttribute("disabled");
    });

    item_clone.querySelector("button.detail").addEventListener("click", function(){
      if(this.parentElement.parentElement.classList.contains("active")){
        this.parentElement.parentElement.classList.remove("active");
        this.innerText = "詳細を確認";
      }
      else{
        this.parentElement.parentElement.classList.add("active");
        this.innerText = "詳細を閉じる"
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

    modal.querySelector("#modalCourseList").appendChild(item_clone);
  });

  // モーダルを表示
  modal.classList.add("active");
}

// ============================================================
// ============================================================
// ============================================================
// ============================================================
// ============================================================
// ============================================================

const shinfuri_requirement = {
  "L1": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ],
        },
        {
          M: "初年次ゼミナール文科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "社会科学",
          sub: [
            {
              S: "法Ⅰまたは政治Ⅰ",
              description: null,
              credits: 2,
              note: []
            }
          ],
          description: "4単位の取得",
          credits: 4,
          note: [
            "文科一類生は「法Ⅰ」または「政治Ⅰ」の2単位を含む。"
          ]
        },
        {
          M: "人文科学",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: null,
          credits: 13,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: null,
          credits: 5,
          note: []
        }
      ],
      description: "13単位の取得（L系列の5単位を含む）",
      credits: 13,
      note: [
        "既修･既修の組合せで外国語を履修する場合を除き、初修外国語として履修するものと同一言語の「〇語初級(演習)①」の2単位を含む。"
      ]
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "46単位以上",
      credits: 46,
      note: []
    }
  ],

  "L2": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ],
        },
        {
          M: "初年次ゼミナール文科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "社会科学",
          sub: [],
          description: "4単位の取得",
          credits: 4,
          note: [
            "文科一類生は「法Ⅰ」または「政治Ⅰ」の2単位を含む。"
          ]
        },
        {
          M: "人文科学",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: null,
          credits: 13,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: null,
          credits: 5,
          note: []
        }
      ],
      description: "13単位の取得（L系列の5単位を含む）",
      credits: 13,
      note: [
        "既修･既修の組合せで外国語を履修する場合を除き、初修外国語として履修するものと同一言語の「〇語初級(演習)①」の2単位を含む。"
      ]
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "46単位以上",
      credits: 46,
      note: []
    }
  ],

  "L3": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ],
        },
        {
          M: "初年次ゼミナール文科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "社会科学",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "人文科学",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: null,
          credits: 13,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: null,
          credits: 5,
          note: []
        }
      ],
      description: "13単位の取得（L系列の5単位を含む）",
      credits: 13,
      note: [
        "既修･既修の組合せで外国語を履修する場合を除き、初修外国語として履修するものと同一言語の「〇語初級(演習)①」の2単位を含む。"
      ]
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "46単位以上",
      credits: 46,
      note: []
    }
  ],

  "S1": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ]
        },
        {
          M: "初年次ゼミナール理科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "自然科学",
          sub: [
            {
              S: "基礎実験",
              description: "3単位の取得",
              credits: 3,
              note: [
                "任意選択科目の単位を除く",
                "1Aセメスターの実験科目(理科一類生は「基礎実験Ⅰ」「基礎実験Ⅱ」、理科二･三類生は「基礎物理学実験」「基礎化学実験」)の単位を取得していない場合でも、当該科目の単位を取得できなかった理由(病気療養など)が妥当と当該年度の基礎実験委員会で認められ、当該科目を2Aセメスターで補修可能と同委員会で判断した場合は、「基礎実験Ⅲ」または、「基礎生命科学実験」の1単位を取得していれば、進学選択が可能となる。"
              ]
            },
            {
              S: "数理科学",
              description: "6単位の取得（「数理科学基礎演習」1単位および「数理基礎理論演習」1単位を含む）",
              credits: 6,
              note: []
            },
            {
              S: "物質科学",
              description: "「力学」2単位、「熱力学」2単位、および「物性化学」2単位の取得",
              credits: 6,
              note: []
            },
            {
              S: "生命科学",
              description: "1単位の取得（「生命科学」1単位の取得）",
              credits: 1,
              note: []
            }
          ]
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: "8単位の取得（L系列の2単位を含む）",
          credits: 8,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: "(2単位の取得)",
          credits: 2,
          note: []
        }
      ],
      description: "",
      credits: 8,
      note: []
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "53単位以上",
      credits: 53,
      note: []
    }
  ],

  "S2": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ]
        },
        {
          M: "初年次ゼミナール理科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "自然科学",
          sub: [
            {
              S: "基礎実験",
              description: "3単位の取得",
              credits: 3,
              note: [
                "任意選択科目の単位を除く",
                "1Aセメスターの実験科目(理科一類生は「基礎実験Ⅰ」「基礎実験Ⅱ」、理科二･三類生は「基礎物理学実験」「基礎化学実験」)の単位を取得していない場合でも、当該科目の単位を取得できなかった理由(病気療養など)が妥当と当該年度の基礎実験委員会で認められ、当該科目を2Aセメスターで補修可能と同委員会で判断した場合は、「基礎実験Ⅲ」または、「基礎生命科学実験」の1単位を取得していれば、進学選択が可能となる。"
              ]
            },
            {
              S: "数理科学",
              description: "5単位の取得",
              credits: 5,
              note: [
                "任意選択科目の単位を除く"
              ]
            },
            {
              S: "物質科学",
              description: "「力学」2単位、「化学熱力学」2単位、および「物性化学」2単位の取得",
              credits: 6,
              note: []
            },
            {
              S: "生命科学",
              description: "「生命科学Ⅰ」2単位の取得",
              credits: 2,
              note: []
            }
          ]
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: "8単位の取得（L系列の2単位を含む）",
          credits: 8,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: "(2単位の取得)",
          credits: 2,
          note: []
        }
      ],
      description: "",
      credits: 8,
      note: []
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "53単位以上",
      credits: 53,
      note: []
    }
  ],

  "S3": [
    {
      L: "基礎科目",
      sub: [
        {
          M: "外国語",
          sub: [
            {
              S: "既修外国語",
              description: "5単位の成績の平均が40点以上",
              credits: 5,
              note: [
                "英語･日本語以外を既修外国語として履修する場合は「6単位の成績の平均が40点以上」となる。"
              ]
            },
            {
              S: "初修外国語",
              description: "6単位の成績の平均が40点以上",
              credits: 6,
              note: []
            }
          ]
        },
        {
          M: "初年次ゼミナール理科",
          sub: [],
          description: "2単位の取得",
          credits: 2,
          note: []
        },
        {
          M: "自然科学",
          sub: [
            {
              S: "基礎実験",
              description: "3単位の取得",
              credits: 3,
              note: [
                "任意選択科目の単位を除く",
                "1Aセメスターの実験科目(理科一類生は「基礎実験Ⅰ」「基礎実験Ⅱ」、理科二･三類生は「基礎物理学実験」「基礎化学実験」)の単位を取得していない場合でも、当該科目の単位を取得できなかった理由(病気療養など)が妥当と当該年度の基礎実験委員会で認められ、当該科目を2Aセメスターで補修可能と同委員会で判断した場合は、「基礎実験Ⅲ」または、「基礎生命科学実験」の1単位を取得していれば、進学選択が可能となる。"
              ]
            },
            {
              S: "数理科学",
              description: "5単位の取得",
              credits: 5,
              note: [
                "任意選択科目の単位を除く"
              ]
            },
            {
              S: "物質科学",
              description: "「力学」2単位、「化学熱力学」2単位、および「物性化学」2単位の取得",
              credits: 6,
              note: []
            },
            {
              S: "生命科学",
              description: "「生命科学Ⅰ」2単位の取得",
              credits: 2,
              note: []
            }
          ]
        }
      ]
    },
    {
      L: "総合科目",
      sub: [
        {
          M: "(全系列)",
          sub: [],
          description: "8単位の取得（L系列の2単位を含む）",
          credits: 8,
          note: []
        },
        {
          M: "L(言語・コミュニケーション)",
          sub: [],
          description: null,
          credits: 2,
          note: []
        }
      ],
      description: "",
      credits: 8,
      note: []
    },
    {
      L: "総取得単位数",
      sub: [],
      description: "53単位以上",
      credits: 53,
      note: []
    }
  ]
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 要件の表形式表示に必要な行数をカウント
 * @param {*} node 要件データ
 * @returns {number} 行数
 */
function countColumn(node) {
  if (!node.sub || node.sub.length === 0) return 1;
  return node.sub.reduce((sum, c) => sum + countColumn(c), 0);
}

// ============================================================
// ============================================================
// ============================================================

/**
 * 要件の一覧表のDOM作成･表示
 * @param {*} data 要件データ
 * @param {*} container 表形式表示のDOM（tbody）
 */

function renderTable(data, container) {
  
  // コンテナを初期化
  container.innerHTML = "";

  // ============================================================
  
  data.forEach(Lnode => {

    // 大区分の行数カウント
    const L_span = countColumn(Lnode);

    // 大区分が追加されたかのフラグ
    let Lprinted = false;

    // ============================================================
    // ============================================================
    // ============================================================
    
    // 大区分までの場合（総取得単位数など）
    if (!Lnode.sub || Lnode.sub.length === 0) {
      // 行を作成
      const tr = document.createElement("tr");

      // 区分名の要素を作成
      const category_L_name = document.createElement("td");
      category_L_name.textContent = Lnode.L;
      category_L_name.classList.add("checkTableL");

      // 大区分までの場合は3列分
      category_L_name.colSpan = 3;

      tr.appendChild(category_L_name);

      // 説明文の要素を作成
      const description = document.createElement("td");
      description.textContent = Lnode.description || "";

      // 注がある場合はツールチップに追加
      if(Lnode.note.length !== 0){
        description.innerHTML += "<sup>注</sup>"
        description.setAttribute("title", Lnode.note);
      }
      tr.appendChild(description);

      // 必要単位数
      const required_credits = document.createElement("td");
      required_credits.textContent = `必要単位数: ${Lnode.credits}`;
      tr.appendChild(required_credits);

      // 登録済み単位数
      const registered_credits = document.createElement("td");
      let cnt;
      if(Lnode.L == "総取得単位数"){
        cnt = credit_sum
      }
      else{
        cnt = getRegisteredCountByName(Lnode.L, current_term_index, "type");
      }
      registered_credits.textContent = `登録済み単位数: ${cnt}`;
      tr.appendChild(registered_credits);

      // 残り必要単位数
      const credit_diff = document.createElement("td");
      credit_diff.textContent = `${(cnt - Lnode.credits) >= 0 ? "OK" : "あと" + String(Lnode.credits - cnt) + "単位必要です"} `;
      credit_diff.setAttribute("data-value", cnt - Lnode.credits);
      tr.appendChild(credit_diff);

      container.appendChild(tr);
      return;
    }

    // 中区分以降がある場合
    Lnode.sub.forEach(Mnode => {

      // 小区分を含むかのフラグ
      const contain_S = Mnode.sub && Mnode.sub.length > 0;
      
      // 中区分の行数カウント
      const M_span = countColumn(Mnode);

      // 中区分が追加されたかのフラグ
      let Mprinted = false;

      // ============================================================
      // ============================================================
      // ============================================================
      
      // 中区分までの場合（初年次ゼミナールなど）
      if (!contain_S) {
        const tr = document.createElement("tr");

        if (!Lprinted) {
          const category_L_name = document.createElement("td");
          category_L_name.textContent = Lnode.L;
          category_L_name.rowSpan = L_span;
          category_L_name.classList.add("checkTableL");
          tr.appendChild(category_L_name);
          Lprinted = true;
        }

        const category_M_name = document.createElement("td");
        category_M_name.textContent = Mnode.M;
        category_M_name.colSpan = 2;
        category_M_name.classList.add("checkTableM");
        tr.appendChild(category_M_name);

        const description = document.createElement("td");
        description.textContent = Mnode.description || Lnode.description;
        if(Mnode.note.length !== 0){
          description.innerHTML += "<sup>注</sup>"
          description.setAttribute("title", Mnode.note);
          console.log(Mnode.note);
        }
        tr.appendChild(description);
        
        // 必要単位数
        const required_credits = document.createElement("td");
        required_credits.textContent = `必要単位数: ${Mnode.credits}`;
        tr.appendChild(required_credits);

        // 登録済み単位数
        const registered_credits = document.createElement("td");
        let cnt;
        if(Lnode.L == "総合科目" && Mnode.M == "(全系列)"){
          cnt = getRegisteredCountByName(Lnode.L, current_term_index, "type");
        }
        else{
          cnt = getRegisteredCountByName(Mnode.M, current_term_index, "category");
        }
        registered_credits.textContent = `登録済み単位数: ${cnt}`;
        tr.appendChild(registered_credits);

        // 残り必要単位数
        const credit_diff = document.createElement("td");
        credit_diff.textContent = `${(cnt - Mnode.credits) >= 0 ? "OK" : "あと" + String(Mnode.credits - cnt) + "単位必要です"} `;
        credit_diff.setAttribute("data-value", cnt - Mnode.credits);
        tr.appendChild(credit_diff);

        container.appendChild(tr);
        return;
      }
      
      // ============================================================
      // ============================================================
      // ============================================================

      // 小区分あり通常構造
      Mnode.sub.forEach(Snode => {
        const tr = document.createElement("tr");

        // 大区分
        if (!Lprinted) {
          const category_L_name = document.createElement("td");
          category_L_name.textContent = Lnode.L;
          category_L_name.rowSpan = L_span;
          category_L_name.classList.add("checkTableL");
          tr.appendChild(category_L_name);
          Lprinted = true;
        }

        // 中区分
        if (!Mprinted) {
          const category_M_name = document.createElement("td");
          category_M_name.textContent = Mnode.M;
          category_M_name.rowSpan = M_span;
          category_M_name.classList.add("checkTableM");
          tr.appendChild(category_M_name);
          Mprinted = true;
        }

        // 小区分
        const category_S_name = document.createElement("td");
        category_S_name.textContent = Snode.S;
        category_S_name.classList.add("checkTableS");
        tr.appendChild(category_S_name);

        // 条件文
        const description = document.createElement("td");
        description.textContent = Snode.description || "";
        if(Snode.note.length !== 0){
          description.innerHTML += "<sup>注</sup>"
          description.setAttribute("title", Snode.note);
        }
        tr.appendChild(description);

        // 必要単位数
        const required_credits = document.createElement("td");
        required_credits.textContent = `必要単位数: ${Snode.credits}`;
        tr.appendChild(required_credits);

        // 登録済み単位数
        const registered_credits = document.createElement("td");
        const cnt = getRegisteredCountByName(Snode.S, current_term_index, "category");
        registered_credits.textContent = `登録済み単位数: ${cnt}`;
        tr.appendChild(registered_credits);

        // 残り必要単位数
        const credit_diff = document.createElement("td");
        credit_diff.textContent = `${(cnt - Snode.credits) >= 0 ? "OK" : "あと" + String(Snode.credits - cnt) + "単位必要です"} `;
        credit_diff.setAttribute("data-value", cnt - Snode.credits);
        tr.appendChild(credit_diff);

        container.appendChild(tr);
      });
    });
  });
}

/**
 * 登録されている講義をカウント
 * @param {*} name 
 * @param {*} term_index
 * @param {string} sort_key カラム名（type/category)
 * @returns {number} カウント結果
 */
function getRegisteredCountByName(name, term_index, sort_key) {
  const registered = registered_course_all_term[term_index];

  let count = 0;

  for (let day = 0; day < 5; day++) {
    for (let period = 0; period < 6; period++) {
      const course = registered[day][period];
      if (course && course[sort_key] === name.replace("科目", "") && parsePeriod(course.periods[0]).day-1 == day && parsePeriod(course.periods[0]).period-1 == period) {
        count += course.credits;
      }
    }
  }

  const intensive = registered_course_intensive_all_term[term_index];
  for (const c of intensive) {
    if (c[sort_key] === name) count++;
  }

  return count;
}