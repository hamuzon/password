const sets = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!?#$%&=~/*-_+@",
  ambiguous: "Ilji1Oo0"
};

const chkLower = document.getElementById("chkLower");
const chkUpper = document.getElementById("chkUpper");
const chkNumber = document.getElementById("chkNumber");
const chkSymbol = document.getElementById("chkSymbol");
const chkExcludeAmbiguous = document.getElementById("chkExcludeAmbiguous");
const lengthRange = document.getElementById("lengthRange");
const lengthNumber = document.getElementById("lengthNumber");
const countRange = document.getElementById("countRange");
const countNumber = document.getElementById("countNumber");
const resultsDiv = document.getElementById("results");
const saveBtn = document.getElementById("saveBtn");
const regenBtn = document.getElementById("regenBtn");
const copyAllBtn = document.getElementById("copyAllBtn");

function syncRangeAndNumber(rangeEl, numberEl) {
  rangeEl.addEventListener("input", () => {
    numberEl.value = rangeEl.value;
    generateAndDisplay();
  });

  numberEl.addEventListener("input", () => {
    let val = Number.parseInt(numberEl.value, 10);
    if (Number.isNaN(val)) return;

    val = Math.min(Number.parseInt(numberEl.max, 10), Math.max(Number.parseInt(numberEl.min, 10), val));
    numberEl.value = val;
    rangeEl.value = val;
    generateAndDisplay();
  });
}

syncRangeAndNumber(lengthRange, lengthNumber);
syncRangeAndNumber(countRange, countNumber);

[chkLower, chkUpper, chkNumber, chkSymbol, chkExcludeAmbiguous].forEach((el) => {
  el.addEventListener("change", generateAndDisplay);
});

function generatePassword(length, charSet) {
  let result = "";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < length; i += 1) {
    result += charSet.charAt(array[i] % charSet.length);
  }

  return result;
}

function setTemporarySuccess(button, defaultText, successText) {
  button.textContent = successText;
  button.classList.add("is-success");

  window.setTimeout(() => {
    button.textContent = defaultText;
    button.classList.remove("is-success");
  }, 1500);
}

function createCopyButton(text) {
  const btn = document.createElement("button");
  btn.textContent = "コピー";
  btn.className = "copy-btn";
  btn.type = "button";
  btn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(text);
    setTemporarySuccess(btn, "コピー", "コピー完了！");
  });
  return btn;
}

function renderMessage(message) {
  resultsDiv.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = message;
  resultsDiv.appendChild(empty);
}

function getPasswords() {
  return Array.from(resultsDiv.querySelectorAll(".password-text")).map((el) => el.textContent || "");
}

function generateAndDisplay() {
  resultsDiv.innerHTML = "";
  let charSet = "";

  if (chkLower.checked) charSet += sets.lower;
  if (chkUpper.checked) charSet += sets.upper;
  if (chkNumber.checked) charSet += sets.number;
  if (chkSymbol.checked) charSet += sets.symbol;

  if (charSet === "") {
    renderMessage("最低1種類の文字種を選んでください。");
    return;
  }

  if (chkExcludeAmbiguous.checked) {
    charSet = charSet
      .split("")
      .filter((char) => !sets.ambiguous.includes(char))
      .join("");

    if (charSet.length === 0) {
      renderMessage("判別しづらい文字を除外しすぎて文字がありません。");
      return;
    }
  }

  const length = Number.parseInt(lengthRange.value, 10);
  const count = Number.parseInt(countRange.value, 10);

  for (let i = 0; i < count; i += 1) {
    const password = generatePassword(length, charSet);
    const item = document.createElement("article");
    item.className = "result-item";

    const text = document.createElement("p");
    text.className = "password-text";
    text.textContent = password;

    item.append(text, createCopyButton(password));
    resultsDiv.appendChild(item);
  }
}

copyAllBtn.addEventListener("click", async () => {
  const passwords = getPasswords();
  if (passwords.length === 0) {
    alert("コピーできるパスワードがありません。");
    return;
  }

  await navigator.clipboard.writeText(passwords.join("\n"));
  setTemporarySuccess(copyAllBtn, "すべてコピー", "コピー完了！");
});

saveBtn.addEventListener("click", () => {
  const passwords = getPasswords();
  if (passwords.length === 0) {
    alert("パスワードが生成されていません。");
    return;
  }

  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const filename = `password_${y}${mo}${d}${h}${mi}${s}.txt`;

  const blob = new Blob([passwords.join("\n")], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
});

regenBtn.addEventListener("click", generateAndDisplay);

generateAndDisplay();
