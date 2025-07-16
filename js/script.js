// =====================
// DOM 要素の取得
// =====================
const wordInput       = document.getElementById("word");
const meaningInput    = document.getElementById("meaning");
const exampleInput    = document.getElementById("example");
const levelSelect     = document.getElementById("level");
const addBtn          = document.getElementById("add-btn");
const todoList        = document.getElementById("todo-list");
const doneList        = document.getElementById("done-list");

const toggleThemeBtn     = document.getElementById("toggle-theme");
const spellOutput        = document.getElementById("spell-output");
const spellInput         = document.getElementById("spell-input");
const generateSpellBtn   = document.getElementById("generate-spell");
const restoreBtn         = document.getElementById("restore-btn");

const textColor = getComputedStyle(document.body).getPropertyValue('--text').trim();

const successSound     = document.getElementById("sound-success");
const failSound        = document.getElementById("sound-fail");
const missSound        = document.getElementById("sound-miss");
const addSound         = document.getElementById("sound-add");
const rememberedSound  = document.getElementById("sound-remembered");
const deleteSound      = document.getElementById("sound-delete");
const throwawaySound   = document.getElementById("sound-throwaway");
const selectSound      = document.getElementById("sound-select");

let tasks = [];

let theme = localStorage.getItem("theme");
if (!theme) {
  theme = "dark";
  localStorage.setItem("theme", "dark");
}
document.body.classList.add(theme === "dark" ? "dark" : "light");

// =====================
// Base64 ⇌ ひらがな辞書
// =====================
const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const hiraMap = [
  "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
  "る", "れ", "ろ", "わ", "を", "ん", "が", "ぎ", "ぐ", "げ",
  "ご", "ざ", "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で",
  "ど", "ば", "び", "ぶ"
];

// =====================
// 初期化処理
// =====================
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    render();
  }

  levelSelect.style.color = levelSelect.value === "" ? "#848484" : "#000";

  const toggleButton = document.getElementById("menu-toggle");
  toggleButton.addEventListener("click", toggleMenu);

  showView("view-input");
});

// =====================
// テーマ切り替え
// =====================
toggleThemeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  document.body.classList.toggle("light", !isLight);
  document.body.classList.toggle("dark", isLight);
  localStorage.setItem("theme", isLight ? "dark" : "light");

  selectSound.currentTime = 0;
  selectSound.play();
});

// =====================
// タスク追加
// =====================
addBtn.addEventListener("click", () => {
  const word    = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const level   = levelSelect.value;

  if (!word || !meaning) {
    missSound.currentTime = 0;
    missSound.play();
    return alert("たんご と いみ が ない！");
  }
  if (level === "") {
    missSound.currentTime = 0;
    missSound.play();
    return alert("ゆうせん が ついていない！");
  }

  tasks.push({
    word,
    meaning,
    example,
    level: parseInt(level),
    isDone: false
  });

  addSound.currentTime = 0;
  addSound.play();

  saveTasks();
  render();
  clearInputs();
});

function clearInputs() {
  wordInput.value = "";
  meaningInput.value = "";
  exampleInput.value = "";
  levelSelect.value = "";
  levelSelect.style.color = "#848484";
}

// =====================
// タスク描画
// =====================
function render() {
  todoList.innerHTML = "";
  doneList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("word-item");
    if (task.isDone) li.classList.add("done");

    li.innerHTML = `
      <strong>${task.word}</strong> - ${task.meaning} - ★${task.level}<br>
      <em>${task.example}</em><br>
      <button onclick="toggleDone(${index})">${task.isDone ? "もどす" : "おぼえた！"}</button>
      <button onclick="deleteTask(${index})">さくじょ</button>
    `;

    (task.isDone ? doneList : todoList).appendChild(li);
  });
}

// =====================
// タスク状態切替・削除・保存
// =====================
function toggleDone(index) {
  const wasDone = tasks[index].isDone;
  tasks[index].isDone = !tasks[index].isDone;

  saveTasks();
  render();

  if (wasDone) {
    missSound.currentTime = 0;
    missSound.play();
  } else {
    rememberedSound.currentTime = 0;
    rememberedSound.play();
  }
}

function deleteTask(index) {
  if (confirm("ほんとうに けしますか？")) {
    const wasDone = tasks[index].isDone;

    tasks.splice(index, 1);
    saveTasks();
    render();

    if (wasDone) {
      deleteSound.currentTime = 0;
      deleteSound.play();
    } else {
      throwawaySound.currentTime = 0;
      throwawaySound.play();
    }
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// ひらがな⇌Base64変換
// =====================
function base64ToHiragana(str) {
  return [...str].map(char => hiraMap[base64Chars.indexOf(char)] || "").join("");
}

function hiraganaToBase64(hiraStr) {
  return [...hiraStr].map(char => base64Chars[hiraMap.indexOf(char)] || "").join("");
}

// =====================
// 呪文機能
// =====================
generateSpellBtn.addEventListener("click", () => {
  try {
    const json = JSON.stringify(tasks);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const hiraSpell = base64ToHiragana(base64);
    spellOutput.value = hiraSpell;

    document.getElementById("spell-output-box").style.display = "block";

    selectSound.currentTime = 0;
    selectSound.play();
  } catch {
    alert("じゅもん の はっこう に しっぱいした！");
  }
});

restoreBtn.addEventListener("click", () => {
  try {
    const hira = spellInput.value.trim();
    const base64 = hiraganaToBase64(hira);
    const json = decodeURIComponent(escape(atob(base64)));
    const restored = JSON.parse(json);

    if (!Array.isArray(restored)) throw new Error();

    tasks = restored;
    saveTasks();
    render();
    successSound.currentTime = 0;
    successSound.play();
    alert("ふっかつ した！");
  } catch {
    failSound.currentTime = 0;
    failSound.play();
    alert("おきのどくですが ふっかつ は しっぱい しました");
  }
});

// =====================
// セレクト色の動的変更
// =====================
levelSelect.addEventListener("change", function () {
  this.style.color = this.value === "" ? "#848484" : "#fff";
});

// =====================
// メニュー切り替え
// =====================
function toggleMenu() {
  const menuBox = document.getElementById("menu-box");
  menuBox.classList.toggle("hidden");

  console.log("toggleMenu fired");
  selectSound.currentTime = 0;
  selectSound.play();
}

// =====================
// ビュー切り替え、音鳴らす
// =====================
function showView(viewId) {
  document.querySelectorAll("main > section").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  const menuBox = document.getElementById("menu-box");
  if (menuBox) menuBox.classList.add("hidden");

  selectSound.currentTime = 0;
  selectSound.play();
}

window.showView = showView;