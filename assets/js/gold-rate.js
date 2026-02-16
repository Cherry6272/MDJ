$(document).ready(function () {
    const API_KEY = '09b766d75c57943c1774041718f5f3e8';
    const BASE_URL = 'https://api.metalpriceapi.com/v1/';

    // Constants
    const OUNCE_TO_GRAM = 31.1035;
    const PURITY_22K = 0.916;
    const TAX_MULTIPLIER = 1.13; // 13% Tax/Duty

    const CACHE_KEY_DATA = 'mdj_soft_data';
    const CACHE_KEY_DATE = 'mdj_soft_date';
    const CACHE_KEY_PREV = 'mdj_soft_prev';
    const CACHE_KEY_TS = 'mdj_soft_ts';

    // SVG Icons
    const ICON_UP = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#48bb78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
    const ICON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;

    function init() {
        const today = new Date().toDateString();
        const cachedDate = localStorage.getItem(CACHE_KEY_DATE);

        // REVERTED to Daily Cache (User Request)
        if (cachedDate === today) {
            const data = JSON.parse(localStorage.getItem(CACHE_KEY_DATA));
            const prev = JSON.parse(localStorage.getItem(CACHE_KEY_PREV));
            const ts = localStorage.getItem(CACHE_KEY_TS);
            renderUI(data, prev, ts);
        } else {
            console.log("Fetching New Daily Rates...");
            fetchLive(today);
        }
    }

    function fetchLive(today) {
        $.ajax({
            url: BASE_URL + 'latest',
            data: { api_key: API_KEY, base: 'USD', currencies: 'XAU,XAG,INR' },
            success: function (res) {
                if (res.success) {
                    // Rotate Cache if day changed
                    const currentCache = localStorage.getItem(CACHE_KEY_DATA);
                    if (currentCache) {
                        localStorage.setItem(CACHE_KEY_PREV, currentCache);
                    } else {
                        // First time: fetch yesterday
                        fetchHistory(today, res.rates);
                        return; // Wait for history
                    }

                    const now = new Date();
                    const ts = now.toLocaleString();
                    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(res.rates));
                    localStorage.setItem(CACHE_KEY_DATE, today);
                    localStorage.setItem(CACHE_KEY_TS, ts);

                    // If we have prev data, use it. If not, we might fail a trend check but that's okay for first load.
                    let prev = null;
                    try { prev = JSON.parse(localStorage.getItem(CACHE_KEY_PREV)); } catch (e) { }

                    if (!prev) {
                        fetchHistory(today, res.rates);
                    } else {
                        renderUI(res.rates, prev, ts);
                    }
                }
            }
        });
    }

    function fetchHistory(todayStr, currentRates) {
        const d = new Date(todayStr);
        d.setDate(d.getDate() - 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');

        $.ajax({
            url: BASE_URL + `${yyyy}-${mm}-${dd}`,
            data: { api_key: API_KEY, base: 'USD', currencies: 'XAU,XAG,INR' },
            success: function (res) {
                if (res.success) {
                    localStorage.setItem(CACHE_KEY_PREV, JSON.stringify(res.rates));

                    const now = new Date();
                    const ts = now.toLocaleString();
                    localStorage.setItem(CACHE_KEY_DATA, JSON.stringify(currentRates));
                    localStorage.setItem(CACHE_KEY_DATE, todayStr);
                    localStorage.setItem(CACHE_KEY_TS, ts);

                    renderUI(currentRates, res.rates, ts);
                }
            }
        });
    }

    function renderUI(current, prev, ts) {
        if (!current) return;

        const curVals = calcValues(current);
        const prevVals = prev ? calcValues(prev) : null;

        // Cards: Gold 1g, Silver 1g (Requested: "Silver per gram in main div")
        updateCard('24k', curVals.g24, prevVals ? prevVals.g24 : null);
        updateCard('22k', curVals.g22, prevVals ? prevVals.g22 : null);
        updateCard('silver', curVals.sGram, prevVals ? prevVals.sGram : null); // Gram for Card

        // Table: Silver KG (Requested: "Prices in KGs in table")
        // Manual update for Table Silver Row to override the 'gram' value set by updateCard if IDs conflict
        // Actually updateCard updates #tbl-buy-silver etc directly. 
        // We will need separate logic or overwrite it here.
        updateTableSilverKG(curVals.sKg, prevVals ? prevVals.sKg : null);

        $('#last-updated').text(ts);
    }

    function calcValues(rates) {
        const usdInr = rates.INR;
        const goldGram = ((1 / rates.XAU) * usdInr * TAX_MULTIPLIER) / OUNCE_TO_GRAM;
        const silverGram = ((1 / rates.XAG) * usdInr * TAX_MULTIPLIER) / OUNCE_TO_GRAM;

        return {
            g24: goldGram,
            g22: goldGram * PURITY_22K,
            sGram: silverGram,
            sKg: silverGram * 1000
        };
    }

    function updateCard(type, current, prev, isKg = false) {
        // Price (Card Main)
        $(`#price-${type}`).text('₹' + format(current));

        // Table Buy/Sell (Default behavior - will be overwritten for Silver KG)
        if (type !== 'silver') {
            $(`#tbl-sell-${type}`).text('₹' + format(current));
            $(`#tbl-buy-${type}`).text('₹' + format(current * 0.96)); // 4% spread

            // High/Low (Table & Stats Bar)
            if (prev) {
                const high = Math.max(current, prev) * 1.005;
                const low = Math.min(current, prev) * 0.995;
                $(`#high-${type}`).text('₹' + format(high));
                $(`#low-${type}`).text('₹' + format(low));
                $(`#tbl-high-${type}`).text('₹' + format(high));
                $(`#tbl-low-${type}`).text('₹' + format(low));
            }
        }


        if (prev) {
            const diff = current - prev;
            const pct = (diff / prev) * 100;
            const absDiff = Math.abs(diff);

            // Badge %
            const sign = diff >= 0 ? '+' : '';
            const bgClass = diff >= 0 ? 'badge-up' : 'badge-down';
            $(`#pct-${type}`).text(`${sign}${pct.toFixed(2)}%`).removeClass('badge-up badge-down').addClass(bgClass);

            // Change Text
            const arrow = diff >= 0 ? '▲' : '▼';
            const colorClass = diff >= 0 ? 'text-up' : 'text-down';
            $(`#change-${type}`).html(`${arrow} ₹${format(absDiff)} today`).removeClass('text-up text-down').addClass(colorClass);

            // Icon in Table
            $(`#icon-${type}`).html(diff >= 0 ? ICON_UP : ICON_DOWN);

            // Sparkline Color
            const sparkContainer = $(`#price-${type}`).closest('.soft-card').find('.sparkline-container');
            sparkContainer.removeClass('text-up text-down').addClass(colorClass);

        } else {
            $(`#pct-${type}`).text('---');
            $(`#change-${type}`).text('---');
        }
    }

    function updateTableSilverKG(current, prev) {
        // Table Columns for Silver (KG)
        $('#tbl-buy-silver').text('₹' + format(current * 0.96));
        $('#tbl-sell-silver').text('₹' + format(current));

        if (prev) {
            const high = Math.max(current, prev) * 1.005;
            const low = Math.min(current, prev) * 0.995;

            // Table High/Low
            $('#tbl-high-silver').text('₹' + format(high));
            $('#tbl-low-silver').text('₹' + format(low));

            // Stats Bar High/Low (Also KG)
            $('#high-silver').text('₹' + format(high));
            $('#low-silver').text('₹' + format(low));
        }
    }

    function format(num) {
        return Math.round(num).toLocaleString('en-IN');
    }

    init();
});
