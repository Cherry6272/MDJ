$(document).ready(function () {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    const API_KEY = '09b766d75c57943c1774041718f5f3e8';
    const BASE_URL = 'https://api.metalpriceapi.com/v1/latest';

    // Fallback/Mock Data (used if request fails)
    const MOCK_DATA = {
        rates: {
            INR: 83.0,
            XAU: 0.00049
        }
    };

    // Conversion Constants
    const OUNCE_TO_GRAM = 31.1035;
    const PURITY_22K = 0.916;
    // const PURITY_18K = 0.750; // Removed
    const TAX_MULTIPLIER = 1.13; // Adding ~13% for Import Duty + GST
    const CACHE_KEY_DATA = 'mdj_gold_rate_data';
    const CACHE_KEY_DATE = 'mdj_gold_rate_date';

    function fetchGoldRate() {
        const today = new Date().toDateString();
        const cachedDate = localStorage.getItem(CACHE_KEY_DATE);
        const cachedData = localStorage.getItem(CACHE_KEY_DATA);

        // Check cache
        if (cachedDate === today && cachedData) {
            console.log("Using Cached Data:", JSON.parse(cachedData));
            processRates(JSON.parse(cachedData));
            return;
        }

        $.ajax({
            url: BASE_URL,
            data: {
                api_key: API_KEY,
                base: 'USD', // Free tier often restricts base to USD
                currencies: 'XAU,INR'
            },
            success: function (response) {
                if (response && response.success && response.rates) {
                    console.log("API Response:", response);

                    // Cache the successful response
                    const today = new Date().toDateString();
                    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(response.rates));
                    localStorage.setItem(CACHE_KEY_DATE, today);

                    processRates(response.rates);
                } else {
                    console.error("API request unsuccessful", response);

                    // Try to use old cache if available (fallback)
                    const cachedData = localStorage.getItem(CACHE_KEY_DATA);
                    if (cachedData) {
                        console.log("Falling back to expired cache due to API error");
                        processRates(JSON.parse(cachedData));
                    } else {
                        showError();
                    }
                }
            },
            error: function (err) {
                console.error("API Error:", err);
                // Fallback to cache on error
                const cachedData = localStorage.getItem(CACHE_KEY_DATA);
                if (cachedData) {
                    console.log("Falling back to cache due to API error");
                    processRates(JSON.parse(cachedData));
                } else {
                    showError();
                }
            }
        });
    }

    function processRates(rates) {
        if (rates.XAU && rates.INR) {
            const pricePerOunceInUSD = 1 / rates.XAU;
            const pricePerOunceInINR = pricePerOunceInUSD * rates.INR;

            // Apply Tax Multiplier for correct local pricing
            const finalPricePerOunceINR = pricePerOunceInINR * TAX_MULTIPLIER;

            updateUI(finalPricePerOunceINR);
        } else {
            console.error("Incomplete rates data", rates);
            showError();
        }
    }

    function updateUI(pricePerOunceINR) {
        // 1. Calculate Price per Gram (24k)
        const pricePerGram24k = pricePerOunceINR / OUNCE_TO_GRAM;

        // 2. Calculate 22k
        const pricePerGram22k = pricePerGram24k * PURITY_22K;

        // 3. Update DOM
        $('#price-24k').text('₹ ' + formatMoney(pricePerGram24k));
        $('#price-22k').text('₹ ' + formatMoney(pricePerGram22k));

        // 4. Update Date
        const now = new Date();
        $('#last-updated').text(now.toLocaleDateString() + ' ' + now.toLocaleTimeString());

        // Hide error if visible
        $('#api-error').hide();
    }

    function formatMoney(amount) {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function showError() {
        $('#api-error').show().text("Unable to fetch live rates. Displaying estimated values.");

        // Use Mock/Fallback data to show *something*
        // Mock Calculation assuming roughly $2000/oz
        // const estimatedOuncePriceINR = (1 / MOCK_DATA.rates.XAU) * MOCK_DATA.rates.INR;
        // updateUI(estimatedOuncePriceINR);
        // OR just leave the error message and let the "Loading..." stay or update nicely.
        // Let's hide the loading text and show error.

        $('#price-24k').text('---');
        $('#price-22k').text('---');
        $('#price-18k').text('---');
    }

    // Initial Call
    fetchGoldRate();
});
