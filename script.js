// ============================================================
//  THEME TOGGLE (iOS-style)
// ============================================================
const root = document.documentElement;

// Загружаем сохранённую тему
(function() {
    const saved = localStorage.getItem('calc-theme') || 'dark';
    root.setAttribute('data-theme', saved);
})();

function toggleTheme() {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('calc-theme', next);
}


// ============================================================
//  MODALS
// ============================================================
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function closeModalOverlay(e, id) {
    if (e.target === e.currentTarget) closeModal(id);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
});


// ============================================================
//  TABS
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.calculator-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});


// ============================================================
//  BASIC CALCULATOR — МГНОВЕННЫЕ КНОПКИ
// ============================================================
let calcExpression = '';
const buttonsGrid = document.getElementById('calcButtons');

function handleBtn(action, value) {
    if (action === 'append') {
        calcExpression += value;
        updateDisplay();
    } else if (action === 'clear') {
        calcExpression = '';
        document.getElementById('expression').textContent = '';
        document.getElementById('result').textContent = '0';
    } else if (action === 'backspace') {
        calcExpression = calcExpression.slice(0, -1);
        updateDisplay();
    } else if (action === 'calculate') {
        calculate();
    }
}

// touchstart — мгновенный отклик на мобильных (0ms задержка)
buttonsGrid.addEventListener('touchstart', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    e.preventDefault();
    handleBtn(btn.dataset.action, btn.dataset.value);
}, { passive: false });

// click — для десктопа
buttonsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    // Пропускаем если уже обработано через touch
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    handleBtn(btn.dataset.action, btn.dataset.value);
});

function updateDisplay() {
    const expr = calcExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    document.getElementById('expression').textContent = expr;

    try {
        if (calcExpression) {
            const res = eval(calcExpression);
            if (res !== undefined && isFinite(res)) {
                document.getElementById('result').textContent = formatNumber(res);
            }
        } else {
            document.getElementById('result').textContent = '0';
        }
    } catch (_) {}
}

function calculate() {
    try {
        const res = eval(calcExpression);
        if (res === undefined || !isFinite(res)) {
            document.getElementById('result').textContent = 'Ошибка';
            return;
        }
        document.getElementById('expression').textContent =
            calcExpression.replace(/\*/g, '×').replace(/\//g, '÷') + ' =';
        document.getElementById('result').textContent = formatNumber(res);
        calcExpression = String(res);
    } catch (_) {
        document.getElementById('result').textContent = 'Ошибка';
    }
}

// Клавиатура
document.addEventListener('keydown', (e) => {
    const active = document.querySelector('.tab.active').dataset.tab;
    if (active !== 'basic') return;
    if (document.querySelector('.modal-overlay.open')) return;

    const k = e.key;
    if ((k >= '0' && k <= '9') || k === '.') { calcExpression += k; updateDisplay(); }
    else if (k === '+' || k === '-') { calcExpression += k; updateDisplay(); }
    else if (k === '*') { calcExpression += '*'; updateDisplay(); }
    else if (k === '/') { e.preventDefault(); calcExpression += '/'; updateDisplay(); }
    else if (k === '(' || k === ')') { calcExpression += k; updateDisplay(); }
    else if (k === 'Enter' || k === '=') calculate();
    else if (k === 'Backspace') { calcExpression = calcExpression.slice(0, -1); updateDisplay(); }
    else if (k === 'Escape' || k === 'Delete') {
        calcExpression = '';
        document.getElementById('expression').textContent = '';
        document.getElementById('result').textContent = '0';
    }
});


// ============================================================
//  WEIGHT CONVERTER
// ============================================================
const weightToGrams = { mg: 0.001, g: 1, kg: 1000, t: 1e6, lb: 453.592, oz: 28.3495, ct: 0.2 };
const weightNames = { mg:'Миллиграмм', g:'Грамм', kg:'Килограмм', t:'Тонна', lb:'Фунт', oz:'Унция', ct:'Карат' };

function convertWeight() {
    const val = parseFloat(document.getElementById('weightValue').value);
    const from = document.getElementById('weightFrom').value;
    const to = document.getElementById('weightTo').value;

    if (isNaN(val)) {
        document.querySelector('#weightResult .result-value').textContent = '—';
        document.getElementById('weightAllUnits').innerHTML = '';
        return;
    }

    const grams = val * weightToGrams[from];
    const result = grams / weightToGrams[to];
    document.querySelector('#weightResult .result-value').textContent = formatNumber(result) + ' ' + to;

    let html = '';
    for (const [u, f] of Object.entries(weightToGrams)) {
        html += `<div class="unit-row"><span class="unit-name">${weightNames[u]} (${u})</span><span class="unit-val">${formatNumber(grams / f)}</span></div>`;
    }
    document.getElementById('weightAllUnits').innerHTML = html;
}

function swapWeight() {
    const f = document.getElementById('weightFrom'), t = document.getElementById('weightTo');
    [f.value, t.value] = [t.value, f.value];
    convertWeight();
}


// ============================================================
//  DATA CONVERTER
// ============================================================
let dataStandard = 'binary';

function getDataToBytes() {
    const b = dataStandard === 'binary' ? 1024 : 1000;
    return { bit: 1/8, byte: 1, kb: b, mb: b**2, gb: b**3, tb: b**4, pb: b**5 };
}

const dataNames = { bit:'Бит (b)', byte:'Байт (B)', kb:'Килобайт (KB)', mb:'Мегабайт (MB)', gb:'Гигабайт (GB)', tb:'Терабайт (TB)', pb:'Петабайт (PB)' };

function setDataStandard(std) {
    dataStandard = std;
    document.querySelectorAll('.std-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.std-btn[data-std="${std}"]`).classList.add('active');
    convertData();
}

function convertData() {
    const val = parseFloat(document.getElementById('dataValue').value);
    const from = document.getElementById('dataFrom').value;
    const to = document.getElementById('dataTo').value;
    const map = getDataToBytes();

    if (isNaN(val)) {
        document.querySelector('#dataResult .result-value').textContent = '—';
        document.getElementById('dataAllUnits').innerHTML = '';
        return;
    }

    const bytes = val * map[from];
    document.querySelector('#dataResult .result-value').textContent = formatNumber(bytes / map[to]) + ' ' + to.toUpperCase();

    let html = '';
    for (const [u, f] of Object.entries(map)) {
        html += `<div class="unit-row"><span class="unit-name">${dataNames[u]}</span><span class="unit-val">${formatNumber(bytes / f)}</span></div>`;
    }
    document.getElementById('dataAllUnits').innerHTML = html;
}

function swapData() {
    const f = document.getElementById('dataFrom'), t = document.getElementById('dataTo');
    [f.value, t.value] = [t.value, f.value];
    convertData();
}


// ============================================================
//  FINANCE
// ============================================================
function switchFinanceTab(tab) {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.finance-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.sub-tab[data-subtab="${tab}"]`).classList.add('active');
    document.getElementById(`panel-${tab}`).classList.add('active');
}

function calculateLoan() {
    const P = +document.getElementById('loanAmount').value;
    const rate = +document.getElementById('loanRate').value;
    const m = +document.getElementById('loanMonths').value;
    if (!P || !rate || !m) return;

    const r = rate / 100 / 12;
    const pay = P * (r * Math.pow(1+r,m)) / (Math.pow(1+r,m)-1);
    const total = pay * m;
    const over = total - P;

    document.getElementById('loanResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight"><div class="fr-label">Ежемесячный платёж</div><div class="fr-value">${formatMoney(pay)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Общая сумма</div><div class="fr-value">${formatMoney(total)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Переплата</div><div class="fr-value" style="color:var(--text-copyright)">${formatMoney(over)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Переплата %</div><div class="fr-value" style="color:var(--text-copyright)">${((over/P)*100).toFixed(1)}%</div></div>
            <div class="fr-item green"><div class="fr-label">Сумма кредита</div><div class="fr-value">${formatMoney(P)} ₽</div></div>
        </div>`;
}

function calculateDeposit() {
    const P = +document.getElementById('depositAmount').value;
    const rate = +document.getElementById('depositRate').value;
    const m = +document.getElementById('depositMonths').value;
    const cap = document.getElementById('depositCap').value;
    if (!P || !rate || !m) return;

    const r = rate / 100;
    let total;
    if (cap === 'none') { total = P * (1 + r*(m/12)); }
    else {
        const n = cap==='monthly'?12 : cap==='quarterly'?4 : 1;
        total = P * Math.pow(1 + r/n, n*(m/12));
    }
    const profit = total - P;

    document.getElementById('depositResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight green"><div class="fr-label">Итого на счёте</div><div class="fr-value" style="color:var(--text-green)">${formatMoney(total)} ₽</div></div>
            <div class="fr-item green"><div class="fr-label">Доход</div><div class="fr-value">${formatMoney(profit)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Доходность</div><div class="fr-value">${((profit/P)*100).toFixed(2)}%</div></div>
            <div class="fr-item"><div class="fr-label">Вложено</div><div class="fr-value">${formatMoney(P)} ₽</div></div>
        </div>`;
}

function calculateDiscount() {
    const price = +document.getElementById('originalPrice').value;
    const disc = +document.getElementById('discountPercent').value;
    if (!price || !disc) return;

    const saved = price * (disc/100);
    const final_ = price - saved;

    document.getElementById('discountResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight green"><div class="fr-label">Цена со скидкой</div><div class="fr-value" style="color:var(--text-green)">${formatMoney(final_)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Вы экономите</div><div class="fr-value" style="color:var(--text-copyright)">${formatMoney(saved)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Исходная цена</div><div class="fr-value">${formatMoney(price)} ₽</div></div>
            <div class="fr-item"><div class="fr-label">Скидка</div><div class="fr-value">${disc}%</div></div>
        </div>`;
}


// ============================================================
//  UTILITY
// ============================================================
function formatNumber(n) {
    if (Number.isInteger(n)) return n.toLocaleString('ru-RU');
    if (Math.abs(n) < 0.000001) return n.toExponential(4);
    if (Math.abs(n) >= 1) return parseFloat(n.toFixed(6)).toLocaleString('ru-RU');
    return parseFloat(n.toPrecision(8)).toLocaleString('ru-RU');
}

function formatMoney(n) {
    return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
