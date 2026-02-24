$(document).ready(function () {
  const API_KEY = "09b766d75c57943c1774041718f5f3e8"; // Replace with your MetalpriceAPI key
  const BASE_URL = "https://api.metalpriceapi.com/v1/";

  let priceState = {
<<<<<<< HEAD
    "24k": { current: 0, apiBase: 0, lastTick: 0 },
=======
    "18k": { current: 0, apiBase: 0, lastTick: 0 },
>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
    "22k": { current: 0, apiBase: 0, lastTick: 0 },
    silver: { current: 0, apiBase: 0, lastTick: 0 },
  };

<<<<<<< HEAD
  const OUNCE_TO_GRAM = 28.35;
=======
  const OUNCE_TO_GRAM = 31.1035;
  const PURITY_18K = 0.75; // 75% Purity for 18K
>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
  const PURITY_22K = 0.916; // 91.6% Purity for 22K

  const ICON_UP = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#48bb78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`;
  const ICON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;

  function getISTHour() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utc + 3600000 * 5.5);
    return istTime.getHours();
  }

  // --- 1. THE VARIATION & UI ENGINE (Runs every 1 second) ---
  function runVariationUI() {
    Object.keys(priceState).forEach((key) => {
      let data = priceState[key];
      if (data.apiBase > 0) {
        data.lastTick = data.current;

        const minVar = 0.0001;
        const maxVar = 0.008;

        let randomFactor = Math.random() * (maxVar - minVar) + minVar;
        let direction = Math.random() > 0.5 ? 1 : -1;

        data.current = data.apiBase * (1 + direction * randomFactor);

        const priceEl = $(`#price-${key}`);
<<<<<<< HEAD
        const changeEl = $(`#change-${key}`);

        // --- DYNAMIC COLOR LOGIC FOR MAIN PRICE AND CHANGE TEXT ---
        if (data.current > data.lastTick) {
=======
        const changeEl = $(`#change-${key}`); // The "▲ ₹141 today" element

        // --- DYNAMIC COLOR LOGIC FOR MAIN PRICE AND CHANGE TEXT ---
        if (data.current > data.lastTick) {
          // Turn both elements GREEN
>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
          priceEl.removeClass("text-down").addClass("text-up");
          changeEl.removeClass("text-down").addClass("text-up");
          changeEl.html(
            `▲ ₹${format(Math.abs(data.current - data.apiBase))} today`,
          );
        } else if (data.current < data.lastTick) {
<<<<<<< HEAD
=======
          // Turn both elements RED
>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
          priceEl.removeClass("text-up").addClass("text-down");
          changeEl.removeClass("text-up").addClass("text-down");
          changeEl.html(
            `▼ ₹${format(Math.abs(data.current - data.apiBase))} today`,
          );
        }

        // Update Main Price
        priceEl.text("₹" + format(data.current));

        // Update Tables & High/Low
        if (key === "silver") {
          updateTableSilverKG(data.current * 1000, data.apiBase * 1000);
        } else {
          $(`#tbl-sell-${key}`).text("₹" + format(data.current));
          $(`#tbl-buy-${key}`).text("₹" + format(data.current * 0.96));
          updateLiveHighLow(key, data.apiBase);
        }
      }
    });
  }

  let isFirstLoad = true;

  // --- 2. THE CONDITIONAL API SYNC (Runs every 60 seconds) ---
  function fetchLive() {
    const hour = getISTHour();
<<<<<<< HEAD

    // Time Window: 8 AM to 10 PM IST (8 to 21.59)
    const isLiveWindow = hour >= 8 && hour < 22;

    if (!isLiveWindow && !isFirstLoad) {
      return;
    }

    const endpoint = isLiveWindow ? "latest" : "yesterday";

    $.ajax({
      url: BASE_URL + endpoint,
      data: { api_key: API_KEY, base: "USD", currencies: "XAU,XAG,INR" },
      success: function (res) {
        if (res.success) {
          const rates = res.rates;
          const usdInr = rates.INR;

          // NEW MATH CALCULATION: ( (1 / MetalPrice) * INR_Rate ) / 28.35
          const goldGram = ((1 / rates.XAU) * usdInr) / OUNCE_TO_GRAM;
          const silverGram = ((1 / rates.XAG) * usdInr) / OUNCE_TO_GRAM;

          // Apply Purity Multipliers
          priceState["24k"].apiBase = goldGram; // 24K is the 100% baseline
          priceState["22k"].apiBase = goldGram * PURITY_22K;
          priceState["silver"].apiBase = silverGram;

          if (priceState["24k"].current === 0) {
            priceState["24k"].current = goldGram;
            priceState["22k"].current = goldGram * PURITY_22K;
            priceState["silver"].current = silverGram;
          }

          let statusText = isLiveWindow ? "" : " (Market Closed)";
          $("#last-updated").text(new Date().toLocaleTimeString() + statusText);

=======
    // Updated Time Window: 8 AM to 10 PM IST
    const isLiveWindow = hour >= 8 && hour < 22;

    if (!isLiveWindow && !isFirstLoad) {
      return;
    }

    const endpoint = isLiveWindow ? "latest" : "yesterday";

    $.ajax({
      url: BASE_URL + endpoint,
      data: { api_key: API_KEY, base: "USD", currencies: "XAU,XAG,INR" },
      success: function (res) {
        if (res.success) {
          const rates = res.rates;
          const usdInr = rates.INR;

          const goldGram = ((1 / rates.XAU) * usdInr) / OUNCE_TO_GRAM;
          const silverGram = ((1 / rates.XAG) * usdInr) / OUNCE_TO_GRAM;

          // Apply Purity Multipliers
          priceState["18k"].apiBase = goldGram * PURITY_18K;
          priceState["22k"].apiBase = goldGram * PURITY_22K;
          priceState["silver"].apiBase = silverGram;

          if (priceState["18k"].current === 0) {
            priceState["18k"].current = goldGram * PURITY_18K;
            priceState["22k"].current = goldGram * PURITY_22K;
            priceState["silver"].current = silverGram;
          }

          let statusText = isLiveWindow ? "" : " (Market Closed)";
          $("#last-updated").text(new Date().toLocaleTimeString() + statusText);

>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
          updateTrendBadges();
          isFirstLoad = false;
        }
      },
<<<<<<< HEAD
      error: function () {
        console.error("Failed to fetch rates from MetalpriceAPI");
      },
=======
>>>>>>> a83c2b2e295e0bb3f4ab0817b0b268c797735986
    });
  }

  function updateTrendBadges() {
    Object.keys(priceState).forEach((key) => {
      let data = priceState[key];
      let diff = data.current - data.apiBase;
      let pct = (diff / data.apiBase) * 100;
      let isUp = diff >= 0;

      $(`#pct-${key}`)
        .text(`${isUp ? "+" : ""}${pct.toFixed(2)}%`)
        .removeClass("badge-up badge-down")
        .addClass(isUp ? "badge-up" : "badge-down");

      $(`#icon-${key}`).html(isUp ? ICON_UP : ICON_DOWN);
    });
  }

  function updateTableSilverKG(currentKg, baseKg) {
    $("#tbl-buy-silver").text("₹" + format(currentKg * 0.96));
    $("#tbl-sell-silver").text("₹" + format(currentKg));
    $("#tbl-high-silver, #high-silver").text("₹" + format(baseKg * 1.008));
    $("#tbl-low-silver, #low-silver").text("₹" + format(baseKg * 0.992));
  }

  function updateLiveHighLow(type, base) {
    $(`#high-${type}, #tbl-high-${type}`).text("₹" + format(base * 1.008));
    $(`#low-${type}, #tbl-low-${type}`).text("₹" + format(base * 0.992));
  }

  function format(num) {
    return Math.round(num).toLocaleString("en-IN");
  }

  fetchLive();
  setInterval(fetchLive, 60000);
  setInterval(runVariationUI, 1000);
});
