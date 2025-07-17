// Cache currencies and rates in localStorage
const cache = {
    currencies: null,
    rates: {},
    lastFetched: null
};

// Load currencies
async function loadCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    if (localStorage.getItem('currencies') && localStorage.getItem('currenciesLastFetched')) {
        const lastFetched = new Date(localStorage.getItem('currenciesLastFetched'));
        if (new Date() - lastFetched < 24 * 60 * 60 * 1000) {
            cache.currencies = JSON.parse(localStorage.getItem('currencies'));
            populateCurrencies(fromSelect, toSelect);
            return;
        }
    }

    try {
        const response = await fetch('https://api.frankfurter.app/currencies');
        cache.currencies = await response.json();
        localStorage.setItem('currencies', JSON.stringify(cache.currencies));
        localStorage.setItem('currenciesLastFetched', new Date().toISOString());
        populateCurrencies(fromSelect, toSelect);
    } catch (error) {
        document.getElementById('result').innerHTML = '<div class="bg-red-100 text-red-700 p-3 rounded-md">Failed to load currencies. Try again later.</div>';
    }
}

function populateCurrencies(fromSelect, toSelect) {
    for (const currency in cache.currencies) {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        option1.value = currency;
        option1.text = `${currency} - ${cache.currencies[currency]}`;
        option2.value = currency;
        option2.text = `${currency} - ${cache.currencies[currency]}`;
        fromSelect.appendChild(option1);
        toSelect.appendChild(option2);
    }
    fromSelect.value = 'USD';
    toSelect.value = 'EUR';
}

// Convert currency
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultDiv = document.getElementById('result');

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = '<div class="bg-yellow-100 text-yellow-700 p-3 rounded-md">Enter a valid amount.</div>';
        return;
    }

    if (fromCurrency === toCurrency) {
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
        saveHistory(amount, fromCurrency, toCurrency, amount);
        return;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}_${amount}`;
    if (cache.rates[cacheKey] && new Date() - cache.rates[cacheKey].timestamp < 60 * 60 * 1000) {
        const convertedAmount = cache.rates[cacheKey].value;
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
        saveHistory(amount, fromCurrency, toCurrency, convertedAmount);
        return;
    }

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();
        const convertedAmount = data.rates[toCurrency];
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        cache.rates[cacheKey] = { value: convertedAmount, timestamp: new Date() };
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
        saveHistory(amount, fromCurrency, toCurrency, convertedAmount);
    } catch (error) {
        resultDiv.innerHTML = '<div class="bg-red-100 text-red-700 p-3 rounded-md">Failed to convert. Try again later.</div>';
    }
}

// Multi-currency conversion
async function updateMultiCurrency(amount, fromCurrency) {
    const multiResultDiv = document.getElementById('multiResult');
    const targetCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
    let results = [];

    for (const toCurrency of targetCurrencies) {
        if (toCurrency === fromCurrency) continue;
        const cacheKey = `${fromCurrency}_${toCurrency}_${amount}`;
        let convertedAmount = cache.rates[cacheKey]?.value || 'N/A';

        if (!cache.rates[cacheKey]) {
            try {
                const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
                const data = await response.json();
                convertedAmount = data.rates[toCurrency];
                cache.rates[cacheKey] = { value: convertedAmount, timestamp: new Date() };
            } catch (error) {}
        }
        results.push(`${amount} ${fromCurrency} = ${convertedAmount?.toFixed(2) || 'N/A'} ${toCurrency}`);
    }

    multiResultDiv.innerHTML = results.join('<br>');
}

// Save and display history
function saveHistory(amount, fromCurrency, toCurrency, convertedAmount) {
    let history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    history.unshift({ amount, fromCurrency, toCurrency, convertedAmount: convertedAmount.toFixed(2), date: new Date().toLocaleString() });
    if (history.length > 10) history.pop();
    localStorage.setItem('conversionHistory', JSON.stringify(history));
    updateHistory();
}

function updateHistory() {
    const historyList = document.getElementById('history');
    const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    historyList.innerHTML = history.map(item => `<li class="py-1">${item.date}: ${item.amount} ${item.fromCurrency} = ${item.convertedAmount} ${item.toCurrency}</li>`).join('');
}

// Live ticker
async function updateTicker() {
    const tickerDiv = document.getElementById('ticker');
    const keyCurrencies = ['USD', 'EUR', 'GBP'];
    let tickerText = [];

    for (const currency of keyCurrencies) {
        try {
            const response = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${currency}`);
            const data = await response.json();
            tickerText.push(`1 EUR = ${data.rates[currency].toFixed(2)} ${currency}`);
        } catch (error) {
            tickerText.push(`EUR/${currency}: N/A`);
        }
    }

    tickerDiv.innerHTML = tickerText.join(' | ');
    setTimeout(updateTicker, 60000);
}

// Chart
let chartInstance = null;
async function updateChart(fromCurrency, toCurrency) {
    const ctx = document.getElementById('rateChart').getContext('2d');
    const dates = [], rates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toLocaleDateString());
        try {
            const response = await fetch(`https://api.frankfurter.app/${date.toISOString().split('T')[0]}?from=${fromCurrency}&to=${toCurrency}`);
            const data = await response.json();
            rates.push(data.rates[toCurrency] || null);
        } catch (error) {
            rates.push(null);
        }
    }

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: dates, datasets: [{ label: `${fromCurrency} to ${toCurrency}`, data: rates, borderColor: '#004aad', fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { font: { size: 8 } } }, y: { ticks: { font: { size: 8 } } } } }
    });
}

// Swap currencies
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
    convertCurrency();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCurrencies();
    updateTicker();
    updateHistory();
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    amountInput.addEventListener('input', convertCurrency);
    fromSelect.addEventListener('change', convertCurrency);
    toSelect.addEventListener('change', convertCurrency);

    if (window.innerWidth <= 640) {
        document.getElementById('rateChart').style.height = '150px';
    }
});
