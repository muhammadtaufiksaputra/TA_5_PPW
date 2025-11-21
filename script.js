const expEl   = document.getElementById("expression");
const resEl   = document.getElementById("result");
const histBox = document.getElementById("history");
const histList = document.getElementById("history-list");
const histPopup = document.getElementById("history-popup");

let expr = "";
let ans = 0;
let memory = 0;
let history = [];

/* UPDATE DISPLAY */
function update() {
  expEl.textContent = expr;
  if (!expr) resEl.textContent = ans;
}

/* ADD CHARACTER */
function add(v) {
  expr += v;
  update();
}

/* CE (Backspace) */
function ce() {
  expr = expr.slice(0, -1);
  update();
}

/* C (Clear All) */
function clearAll() {
  expr = "";
  update();
}

/* SAVE HISTORY (max 5) */
function saveHistory(text) {
  history.unshift(text);
  if (history.length > 5) history.pop();

  renderHistory();
}

function renderHistory() {
  histList.innerHTML = "";
  history.forEach(h => {
    const div = document.createElement("div");
    div.textContent = h;
    histList.appendChild(div);
  });
}

/* EVALUATE EXPRESSION */
function evaluateExpr() {
  try {
    let calc = expr.replace(/×/g, "*").replace(/÷/g, "/");

    let result = Function(`return ${calc}`)();

    if (!isFinite(result)) throw "DIV0";

    ans = result;
    resEl.textContent = result;
    saveHistory(`${expr} = ${result}`);
    expr = "";
    update();

  } catch (e) {
    resEl.textContent = "Error";
  }
}

/* MEMORY */
const mem = {
  mc  : () => memory = 0,
  mr  : () => add(String(memory)),
  mplus : () => memory += (expr ? eval(expr) : ans),
  mminus: () => memory -= (expr ? eval(expr) : ans)
};

/* BUTTON ACTIONS */
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {

    const val = btn.dataset.val;
    const act = btn.dataset.act;

    // number & operator
    if (val) return add(val);

    // actions
    switch (act) {
      case "clear": return clearAll();
      case "ce": return ce();
      case "equals": return evaluateExpr();
      case "ans": return add(String(ans));
      case "mc":
      case "mr":
      case "mminus":
      case "mplus":
        mem[act]();
        break;
      case "history":
        histPopup.classList.remove("hidden");
        break;
    }
  });
});

/* CLOSE HISTORY */
document.getElementById("close-history").onclick = () => {
  histPopup.classList.add("hidden");
};

/* KEYBOARD SUPPORT */
window.addEventListener("keydown", e => {
  const k = e.key;

  if (/[0-9]/.test(k)) return add(k);
  if (["+", "-", "*", "/"].includes(k)) return add(k);
  if (k === ".") return add(".");
  if (k === "Enter") return evaluateExpr();
  if (k === "Backspace") return ce();
  if (k === "Escape") return clearAll();
});

/* THEME TOGGLE */
document.getElementById("theme-toggle").onclick = () => {
  if (document.body.classList.contains("dark")) {
    document.body.className = "light";
  } else {
    document.body.className = "dark";
  }
};

update();
