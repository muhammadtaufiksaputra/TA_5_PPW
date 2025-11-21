const expEl   = document.getElementById("expression");
const resEl   = document.getElementById("result");
const histList = document.getElementById("history-list");
const histPopup = document.getElementById("history-popup");

let expr = "";
let ans = 0;
let memory = 0;
let history = [];
let mode = "DEG";
let shift = false;

/* --------------------------------------------------
  DISPLAY UPDATE
-------------------------------------------------- */
function update() {
  expEl.textContent = expr;
  if (!expr) resEl.textContent = ans;
}

/* --------------------------------------------------
  HISTORY (MAX 5)
-------------------------------------------------- */
function saveHist(t) {
  history.unshift(t);
  if (history.length > 5) history.pop();
  renderHist();
}

function renderHist() {
  histList.innerHTML = "";
  history.forEach(h => {
    let div = document.createElement("div");
    div.textContent = h;
    histList.appendChild(div);
  });
}

/* --------------------------------------------------
  BASIC ADD / DELETE
-------------------------------------------------- */
function add(v) { expr += v; update(); }
function ce() { expr = expr.slice(0, -1); update(); }
function clearAll() { expr = ""; update(); }

/* --------------------------------------------------
  PARSER DAN EVALUATOR SCIENTIFIC
-------------------------------------------------- */

function evalSci() {
  try {
    let cleaned = expr
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/pi/g, "Math.PI")
      .replace(/e/g, "Math.E");

    // handle factorial
    cleaned = cleaned.replace(/(\d+)!/g, "fact($1)");

    function rad(x) {
      return mode === "DEG" ? (x * Math.PI / 180) : x;
    }

    const env = {
      sin : x => Math.sin(rad(x)),
      cos : x => Math.cos(rad(x)),
      tan : x => Math.tan(rad(x)),
      asin: x => (mode === "DEG" ? Math.asin(x)*180/Math.PI : Math.asin(x)),
      acos: x => (mode === "DEG" ? Math.acos(x)*180/Math.PI : Math.acos(x)),
      atan: x => (mode === "DEG" ? Math.atan(x)*180/Math.PI : Math.atan(x)),
      ln  : Math.log,
      log : Math.log10,
      sqrt: Math.sqrt,
      pow : (a,b)=> Math.pow(a,b),
      fact: n => {
        if (n < 0 || String(n).includes(".")) throw "Domain";
        let r=1; for (let i=2;i<=n;i++) r*=i; return r;
      },
      inv : x => 1/x
    };

    let result = Function("env", `with(env){ return ${cleaned} }`)(env);

    if (!isFinite(result)) throw "DIV0";

    ans = result;
    resEl.textContent = result;
    saveHist(`${expr} = ${result}`);
    expr = "";
    update();

  } catch(e){
    resEl.textContent = "Error";
  }
}

/* --------------------------------------------------
  MEMORY
-------------------------------------------------- */
const mem = {
  mc: () => memory = 0,
  mr: () => add(String(memory)),
  mplus: () => memory += (expr ? eval(expr) : ans),
  mminus: () => memory -= (expr ? eval(expr) : ans)
};

/* --------------------------------------------------
  BUTTON HANDLING
-------------------------------------------------- */
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {

    const v = btn.dataset.val;
    const act = btn.dataset.act;
    const fn = btn.dataset.fn;

    // angka & operator
    if (v) return add(v);

    // scientific function
    if (fn) {
      add(fn + "(");
      return;
    }

    // ACTION
    switch(act) {
      case "clear": return clearAll();
      case "ce": return ce();
      case "equals": return evalSci();
      case "ans": return add(String(ans));

      case "recip": add("inv("); return;
      case "open": add("("); return;
      case "close": add(")"); return;

      case "mc":
      case "mr":
      case "mplus":
      case "mminus":
        mem[act]();
        return;

      case "history":
        histPopup.classList.remove("hidden");
        return;

      case "sign":
        expr = `(-1*(${expr}))`;
        update();
        return;
    }

  });
});

/* CLOSE HIST */
document.getElementById("close-history").onclick = () => {
  histPopup.classList.add("hidden");
};

/* --------------------------------------------------
  MODE DEG / RAD
-------------------------------------------------- */
document.getElementById("mode-toggle").onclick = () => {
  mode = mode === "DEG" ? "RAD" : "DEG";
  document.getElementById("mode-toggle").textContent = mode;
};

/* --------------------------------------------------
  SHIFT SWITCH
-------------------------------------------------- */
document.getElementById("shift-toggle").onclick = () => {
  shift = !shift;
  document.querySelectorAll(".shift-alt").forEach(btn=>{
    btn.style.display = shift ? "inline-block" : "none";
  });
};

/* --------------------------------------------------
  KEYBOARD SUPPORT
-------------------------------------------------- */
window.addEventListener("keydown", e => {
  const k = e.key;

  if (/[0-9]/.test(k)) add(k);
  if (["+", "-", "*", "/"].includes(k)) add(k);
  if (k === ".") add(".");
  if (k === "Enter") evalSci();
  if (k === "Backspace") ce();
  if (k === "Escape") clearAll();
});

/* --------------------------------------------------
  THEME SWITCH
-------------------------------------------------- */
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
};

/* INIT */
update();

/* By default, hide the inverse row */
document.querySelectorAll(".shift-alt").forEach(btn => btn.style.display = "none");
