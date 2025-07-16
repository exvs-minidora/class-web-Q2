// ==== DOM取得 ====
const wordInput = document.getElementById("word");
const meaningInput = document.getElementById("meaning");
const exampleInput = document.getElementById("example");
const levelSelect = document.getElementById("level");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const doneList = document.getElementById("done-list");

const toggleThemeBtn = document.getElementById("toggle-theme");

const spellOutput = document.getElementById("spell-output");
const spellInput = document.getElementById("spell-input");
const generateSpellBtn = document.getElementById("generate-spell");
const restoreBtn = document.getElementById("restore-btn");

let tasks = [];

// ==== ひらがな辞書 ====
const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const hiraMap = [
  // A〜Z（26文字）
  "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の", "は",

  // a〜z（26文字）
  "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や",
  "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん",
  "が", "ぎ", "ぐ", "げ", "ご", "ざ",

  // 0〜9（10文字）
  "じ", "ず", "ぜ", "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば",

  // +, /
  "び", "ぶ"
];

// ==== テーマ設定 ====
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    tasks = JSON.parse(saved);
    render();
  }

  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
  } else {
    document.body.classList.add("light");
  }
});

toggleThemeBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  document.body.classList.toggle("light", !isLight);
  document.body.classList.toggle("dark", isLight);
  localStorage.setItem("theme", isLight ? "dark" : "light");
});

// ==== タスク追加 ====
addBtn.addEventListener("click", () => {
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const example = exampleInput.value.trim();
  const level = parseInt(levelSelect.value);

  if (!word || !meaning) return alert("たんご と いみ は ひつよう です！");

  const task = {
    word,
    meaning,
    example,
    level,
    isDone: false
  };

  tasks.push(task);
  saveTasks();
  render();

  wordInput.value = "";
  meaningInput.value = "";
  exampleInput.value = "";
  levelSelect.value = "1";
});

// ==== タスク描画 ====
function render() {
  todoList.innerHTML = "";
  doneList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${task.word}</strong> - ${task.meaning} - ★${task.level}<br>
      <em>${task.example}</em><br>
      <button onclick="toggleDone(${index})">${task.isDone ? "もどす" : "おぼえた！"}</button>
      <button onclick="deleteTask(${index})">さくじょ</button>
    `;

    if (task.isDone) {
      li.classList.add("done");
      doneList.appendChild(li);
    } else {
      todoList.appendChild(li);
    }
  });
}

// ==== 状態切り替え・削除・保存 ====
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

// ==== Base64 → ひらがな変換 ====
function base64ToHiragana(str) {
  let hira = "";
  for (let char of str) {
    const index = base64Chars.indexOf(char);
    if (index !== -1) {
      hira += hiraMap[index];
    } // 無効な文字は無視
  }
  return hira;
}


function hiraganaToBase64(hiraStr) {
  let base64 = "";
  for (let char of hiraStr) {
    const index = hiraMap.indexOf(char);
    if (index !== -1) {
      base64 += base64Chars[index];
    } // 無効な文字は無視
  }
  return base64;
}


// ==== 呪文発行・復元 ====

restoreBtn.addEventListener("click", () => {
  try {
    const hira = spellInput.value.trim();
    const base64 = hiraganaToBase64(hira);
    const json = decodeURIComponent(escape(atob(base64)));
    const restored = JSON.parse(json);
    if (Array.isArray(restored)) {
      tasks = restored;
      saveTasks();
      render();
      alert("ふっかつ したぞ！");
    } else {
      throw new Error();
    }
  } catch {
    alert("ふっかつ に しっぱいした… じゅもん が まちがっている かも！");
  }
});


generateSpellBtn.addEventListener("click", () => {
  try {
    const json = JSON.stringify(tasks);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    console.log("Base64出力:", base64);
    console.log("Base64の長さ:", base64.length);
    const hiraSpell = base64ToHiragana(base64);
    spellOutput.value = hiraSpell;
  } catch {
    alert("じゅもん の はっこう に しっぱいした！");
  }
});

function toggleMenu() {
  const menu = document.getElementById("menu-box");
  menu.classList.toggle("hidden");
}

