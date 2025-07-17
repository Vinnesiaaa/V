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
        document.getElementById('result').innerHTML = '<div class="bg-red-100 text-red-700 p-4 rounded-md">Failed to load currencies. Please try again later.</div>';
        console.error('Error fetching currencies:', error);
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
    addTooltips();
}

// Add tooltips to dropdowns
function addTooltips() {
    const options = document.querySelectorAll('#fromCurrency option, #toCurrency option');
    options.forEach(option => {
        const tooltipText = option.getAttribute('data-tooltip') || `${option.value} - ${cache.currencies[option.value]}`;
        option.classList.add('tooltip');
        const tooltipSpan = document.createElement('span');
        tooltipSpan.className = 'tooltiptext';
        tooltipSpan.textContent = tooltipText;
        option.appendChild(tooltipSpan);
    });
}

// Convert currency
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultDiv = document.getElementById('result');

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = '<div class="bg-yellow-100 text-yellow-700 p-4 rounded-md">Please enter a valid amount.</div>';
        return;
    }

    if (fromCurrency === toCurrency) {
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
        saveHistory(amount, fromCurrency, toCurrency, amount);
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
        return;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}_${amount}`;
    if (cache.rates[cacheKey] && new Date() - cache.rates[cacheKey].timestamp < 60 * 60 * 1000) {
        const convertedAmount = cache.rates[cacheKey].value;
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        saveHistory(amount, fromCurrency, toCurrency, convertedAmount);
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
        return;
    }

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();
        const convertedAmount = data.rates[toCurrency];
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        cache.rates[cacheKey] = { value: convertedAmount, timestamp: new Date() };
        saveHistory(amount, fromCurrency, toCurrency, convertedAmount);
        updateMultiCurrency(amount, fromCurrency);
        updateChart(fromCurrency, toCurrency);
    } catch (error) {
        resultDiv.innerHTML = '<div class="bg-red-100 text-red-700 p-4 rounded-md">Failed to fetch conversion data. Please try again later.</div>';
        console.error('Error converting currency:', error);
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
        let convertedAmount;

        if (cache.rates[cacheKey] && new Date() - cache.rates[cacheKey].timestamp < 60 * 60 * 1000) {
            convertedAmount = cache.rates[cacheKey].value;
        } else {
            try {
                const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
                const data = await response.json();
                convertedAmount = data.rates[toCurrency];
                cache.rates[cacheKey] = { value: convertedAmount, timestamp: new Date() };
            } catch (error) {
                convertedAmount = 'N/A';
            }
        }
        results.push(`${amount} ${fromCurrency} = ${convertedAmount ? convertedAmount.toFixed(2) : 'N/A'} ${toCurrency}`);
    }

    multiResultDiv.innerHTML = results.join('<br>');
}

// Save conversion history to localStorage
function saveHistory(amount, fromCurrency, toCurrency, convertedAmount) {
    const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    history.unshift({ amount, fromCurrency, toCurrency, convertedAmount: convertedAmount.toFixed(2), date: new Date().toLocaleString() });
    if (history.length > 10) history.pop();
    localStorage.setItem('conversionHistory', JSON.stringify(history));
    updateHistory();
}

// Display conversion history
function updateHistory() {
    const historyList = document.getElementById('history');
    const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    historyList.innerHTML = history.map(item => `<li class="py-1">${item.date}: ${item.amount} ${item.fromCurrency} = ${item.convertedAmount} ${item.toCurrency}</li>`).join('');
}

// Live exchange rate ticker
async function updateTicker() {
    const tickerDiv = document.getElementById('ticker');
    const keyCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
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

// Historical chart with Chart.js
let chartInstance = null;
async function updateChart(fromCurrency, toCurrency) {
    const ctx = document.getElementById('rateChart').getContext('2d');
    const dates = [];
    const rates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(dateString);

        try {
            const response = await fetch(`https://api.frankfurter.app/${dateString}?from=${fromCurrency}&to=${toCurrency}`);
            const data = await response.json();
            rates.push(data.rates[toCurrency] || null);
        } catch (error) {
            rates.push(null);
        }
    }

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${fromCurrency} to ${toCurrency}`,
                data: rates,
                borderColor: '#004aad',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, title: { display: true, text: 'Date' }, ticks: { font: { size: 10 } } },
                y: { display: true, title: { display: true, text: 'Rate' }, ticks: { font: { size: 10 } } }
            },
            plugins: {
                legend: { labels: { font: { size: 10 } } }
            }
        }
    });
}

// Swap currencies
function swapCurrencies() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
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

    // Adjust chart height for mobile
    if (window.innerWidth <= 640) {
        document.getElementById('rateChart').style.height = '200px';
    }
});
