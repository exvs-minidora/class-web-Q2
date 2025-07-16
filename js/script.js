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

let tasks = [];

// =====================
// Base64 ⇔ ひらがな辞書
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
  // タスク復元
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    render();
  }

  // テーマ設定
  const theme = localStorage.getItem("theme");
  document.body.classList.add(theme === "dark" ? "dark" : "light");

  // セレクトの初期色設定
  levelSelect.style.color = levelSelect.value === "" ? "#848484" : "#000";
});

// =====================
// テーマ切り替え
// =====================
toggleThemeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  document.body.classList.toggle("light", !isLight);
  document.body.classList.toggle("dark", isLight);
  localStorage.setItem("theme", isLight ? "dark" : "light");
});

// =====================
// タスク追加
// =====================
addBtn.addEventListener("click", () => {
  const word    = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const level   = levelSelect.value;

  if (!word || !meaning) return alert("たんご と いみ が ひつよう です！");
  if (level === "") return alert("ゆうせん を えらんでください！");

  tasks.push({
    word,
    meaning,
    example,
    level: parseInt(level),
    isDone: false
  });

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
  tasks[index].isDone = !tasks[index].isDone;
  saveTasks();
  render();
}

function deleteTask(index) {
  if (confirm("ほんとうに けす？")) {
    tasks.splice(index, 1);
    saveTasks();
    render();
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// =====================
// ひらがな⇔Base64変換
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
    alert("ふっかつ したぞ！");
  } catch {
    alert("ふっかつ に しっぱいした… じゅもん が まちがっている かも！");
  }
});

// =====================
// セレクト色の動的変更
// =====================
levelSelect.addEventListener("change", function () {
  this.style.color = this.value === "" ? "#848484" : fff;
});

// =====================
// メニュー切り替え
// =====================
function toggleMenu() {
  const menu = document.getElementById("menu-box");
  menu.classList.toggle("hidden");
}
