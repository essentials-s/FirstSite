// ============================================================
//  TABS NAVIGATION
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
//  1. BASIC CALCULATOR
// ============================================================
let calcExpression = '';

function appendCalc(val) {
    calcExpression += val;
    updateDisplay();
}

function clearCalc() {
    calcExpression = '';
    document.getElementById('expression').textContent = '';
    document.getElementById('result').textContent = '0';
}

function backspace() {
    calcExpression = calcExpression.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    const displayExpr = calcExpression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷');
    document.getElementById('expression').textContent = displayExpr;

    // Live preview
    try {
        if (calcExpression) {
            const res = eval(calcExpression);
            if (res !== undefined && isFinite(res)) {
                document.getElementById('result').textContent = formatNumber(res);
            }
        }
    } catch (e) {
        // expression not complete yet
    }
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
    } catch (e) {
        document.getElementById('result').textContent = 'Ошибка';
    }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    if (activeTab !== 'basic') return;

    if (e.key >= '0' && e.key <= '9' || e.key === '.') appendCalc(e.key);
    else if (e.key === '+' || e.key === '-') appendCalc(e.key);
    else if (e.key === '*') appendCalc('*');
    else if (e.key === '/') { e.preventDefault(); appendCalc('/'); }
    else if (e.key === '(' || e.key === ')') appendCalc(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape' || e.key === 'Delete') clearCalc();
});


// ============================================================
//  2. WEIGHT CONVERTER
// ============================================================
const weightToGrams = {
    mg: 0.001,
    g: 1,
    kg: 1000,
    t: 1_000_000,
    lb: 453.592,
    oz: 28.3495,
    ct: 0.2
};

const weightNames = {
    mg: 'Миллиграмм',
    g: 'Грамм',
    kg: 'Килограмм',
    t: 'Тонна',
    lb: 'Фунт',
    oz: 'Унция',
    ct: 'Карат'
};

function convertWeight() {
    const value = parseFloat(document.getElementById('weightValue').value);
    const from = document.getElementById('weightFrom').value;
    const to = document.getElementById('weightTo').value;

    if (isNaN(value)) {
        document.querySelector('#weightResult .result-value').textContent = '—';
        document.getElementById('weightAllUnits').innerHTML = '';
        return;
    }

    const grams = value * weightToGrams[from];
    const result = grams / weightToGrams[to];

    document.querySelector('#weightResult .result-value').textContent =
        formatNumber(result) + ' ' + to;

    // Show all units
    let html = '';
    for (const [unit, factor] of Object.entries(weightToGrams)) {
        const converted = grams / factor;
        html += `<div class="unit-row">
            <span class="unit-name">${weightNames[unit]} (${unit})</span>
            <span class="unit-val">${formatNumber(converted)}</span>
        </div>`;
    }
    document.getElementById('weightAllUnits').innerHTML = html;
}

function swapWeight() {
    const from = document.getElementById('weightFrom');
    const to = document.getElementById('weightTo');
    [from.value, to.value] = [to.value, from.value];
    convertWeight();
}


// ============================================================
//  3. DATA CONVERTER
// ============================================================
let dataStandard = 'binary'; // 'binary' or 'decimal'
const base = () => dataStandard === 'binary' ? 1024 : 1000;

function getDataToBytes() {
    const b = base();
    return {
        bit:  1 / 8,
        byte: 1,
        kb:   b,
        mb:   b ** 2,
        gb:   b ** 3,
        tb:   b ** 4,
        pb:   b ** 5
    };
}

const dataNames = {
    bit:  'Бит (b)',
    byte: 'Байт (B)',
    kb:   'Килобайт (KB)',
    mb:   'Мегабайт (MB)',
    gb:   'Гигабайт (GB)',
    tb:   'Терабайт (TB)',
    pb:   'Петабайт (PB)'
};

function setDataStandard(std) {
    dataStandard = std;
    document.querySelectorAll('.std-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.std-btn[data-std="${std}"]`).classList.add('active');
    convertData();
}

function convertData() {
    const value = parseFloat(document.getElementById('dataValue').value);
    const from = document.getElementById('dataFrom').value;
    const to = document.getElementById('dataTo').value;
    const toBytes = getDataToBytes();

    if (isNaN(value)) {
        document.querySelector('#dataResult .result-value').textContent = '—';
        document.getElementById('dataAllUnits').innerHTML = '';
        return;
    }

    const bytes = value * toBytes[from];
    const result = bytes / toBytes[to];

    document.querySelector('#dataResult .result-value').textContent =
        formatNumber(result) + ' ' + to.toUpperCase();

    // Show all units
    let html = '';
    for (const [unit, factor] of Object.entries(toBytes)) {
        const converted = bytes / factor;
        html += `<div class="unit-row">
            <span class="unit-name">${dataNames[unit]}</span>
            <span class="unit-val">${formatNumber(converted)}</span>
        </div>`;
    }
    document.getElementById('dataAllUnits').innerHTML = html;
}

function swapData() {
    const from = document.getElementById('dataFrom');
    const to = document.getElementById('dataTo');
    [from.value, to.value] = [to.value, from.value];
    convertData();
}


// ============================================================
//  4. FINANCE CALCULATORS
// ============================================================

// --- Tab switching ---
function switchFinanceTab(tab) {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.finance-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.sub-tab[data-subtab="${tab}"]`).classList.add('active');
    document.getElementById(`panel-${tab}`).classList.add('active');
}

// --- Кредитный калькулятор (аннуитет) ---
function calculateLoan() {
    const P = parseFloat(document.getElementById('loanAmount').value);
    const annualRate = parseFloat(document.getElementById('loanRate').value);
    const months = parseInt(document.getElementById('loanMonths').value);

    if (!P || !annualRate || !months) return;

    const r = annualRate / 100 / 12; // месячная ставка
    const payment = P * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPaid = payment * months;
    const overpayment = totalPaid - P;

    document.getElementById('loanResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight">
                <div class="fr-label">Ежемесячный платёж</div>
                <div class="fr-value">${formatMoney(payment)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Общая сумма выплат</div>
                <div class="fr-value">${formatMoney(totalPaid)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Переплата</div>
                <div class="fr-value" style="color: #f5576c">${formatMoney(overpayment)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Переплата в %</div>
                <div class="fr-value" style="color: #f5576c">${((overpayment / P) * 100).toFixed(1)}%</div>
            </div>
            <div class="fr-item green">
                <div class="fr-label">Сумма кредита</div>
                <div class="fr-value">${formatMoney(P)} ₽</div>
            </div>
        </div>
    `;
}

// --- Вклад ---
function calculateDeposit() {
    const P = parseFloat(document.getElementById('depositAmount').value);
    const annualRate = parseFloat(document.getElementById('depositRate').value);
    const months = parseInt(document.getElementById('depositMonths').value);
    const capType = document.getElementById('depositCap').value;

    if (!P || !annualRate || !months) return;

    let total;
    const r = annualRate / 100;

    if (capType === 'none') {
        // Простые проценты
        total = P * (1 + r * (months / 12));
    } else {
        // Сложные проценты
        let n;
        if (capType === 'monthly') n = 12;
        else if (capType === 'quarterly') n = 4;
        else if (capType === 'yearly') n = 1;

        const periods = n * (months / 12);
        total = P * Math.pow(1 + r / n, periods);
    }

    const profit = total - P;

    document.getElementById('depositResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight green">
                <div class="fr-label">Итого на счёте</div>
                <div class="fr-value" style="color: #6dd5a0">${formatMoney(total)} ₽</div>
            </div>
            <div class="fr-item green">
                <div class="fr-label">Доход</div>
                <div class="fr-value">${formatMoney(profit)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Доходность</div>
                <div class="fr-value">${((profit / P) * 100).toFixed(2)}%</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Вложено</div>
                <div class="fr-value">${formatMoney(P)} ₽</div>
            </div>
        </div>
    `;
}

// --- Калькулятор скидки ---
function calculateDiscount() {
    const price = parseFloat(document.getElementById('originalPrice').value);
    const discount = parseFloat(document.getElementById('discountPercent').value);

    if (!price || !discount) return;

    const saved = price * (discount / 100);
    const finalPrice = price - saved;

    document.getElementById('discountResults').innerHTML = `
        <div class="finance-result-card">
            <div class="fr-item highlight green">
                <div class="fr-label">Цена со скидкой</div>
                <div class="fr-value" style="color: #6dd5a0">${formatMoney(finalPrice)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Вы экономите</div>
                <div class="fr-value" style="color: #f5576c">${formatMoney(saved)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Исходная цена</div>
                <div class="fr-value">${formatMoney(price)} ₽</div>
            </div>
            <div class="fr-item">
                <div class="fr-label">Скидка</div>
                <div class="fr-value">${discount}%</div>
            </div>
        </div>
    `;
}


// ============================================================
//  UTILITY FUNCTIONS
// ============================================================
function formatNumber(num) {
    if (Number.isInteger(num)) return num.toLocaleString('ru-RU');
    // Smart rounding
    if (Math.abs(num) < 0.000001) return num.toExponential(4);
    if (Math.abs(num) >= 1) return parseFloat(num.toFixed(6)).toLocaleString('ru-RU');
    return parseFloat(num.toPrecision(8)).toLocaleString('ru-RU');
}

function formatMoney(num) {
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
