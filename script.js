// Fetch available currencies and populate dropdowns
async function loadCurrencies() {
    try {
        const response = await fetch('https://api.frankfurter.app/currencies');
        const currencies = await response.json();
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');

        for (const currency in currencies) {
            const option1 = document.createElement('option');
            const option2 = document.createElement('option');
            option1.value = currency;
            option1.text = `${currency} - ${currencies[currency]}`;
            option2.value = currency;
            option2.text = `${currency} - ${currencies[currency]}`;
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        }

        // Set default currencies (e.g., USD to EUR)
        fromSelect.value = 'USD';
        toSelect.value = 'EUR';
    } catch (error) {
        console.error('Error fetching currencies:', error);
        document.getElementById('result').innerHTML = 'Error loading currencies.';
    }
}

// Convert currency
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultDiv = document.getElementById('result');

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = 'Please enter a valid amount.';
        return;
    }

    if (fromCurrency === toCurrency) {
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
        return;
    }

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();
        const convertedAmount = data.rates[toCurrency];
        resultDiv.innerHTML = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
    } catch (error) {
        resultDiv.innerHTML = 'Error fetching conversion data.';
        console.error('Error converting currency:', error);
    }
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

// Real-time conversion on input change
document.addEventListener('DOMContentLoaded', () => {
    loadCurrencies();
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');

    amountInput.addEventListener('input', convertCurrency);
    fromSelect.addEventListener('change', convertCurrency);
    toSelect.addEventListener('change', convertCurrency);
});
