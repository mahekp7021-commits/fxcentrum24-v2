document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation is owned exclusively by site-fixes.js.
  // Do not attach a second menu/touch/click controller here.
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    heroVideo.muted = true;
    const playVideo = () => {
      const promise = heroVideo.play();
      if (promise !== undefined) promise.catch(() => console.log("Hero video autoplay was blocked."));
    };
    playVideo();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) playVideo(); });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.querySelector(".next-section-placeholder");
  if (!placeholder || document.querySelector(".fx-market-section")) return;
  try {
    const cssId = "fx-market-overview-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId; link.rel = "stylesheet"; link.href = "./sections/market-overview.css?v=20260921-crypto1";
      document.head.appendChild(link);
    }
    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market section HTTP ${response.status}`);
    const markup = await response.text();
    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();
    initFxMarketOverview();
  } catch (error) { console.error("FXCentrum24 market section failed to load:", error); }
});

function initFxCryptoTradingViewFallback(host) {
  if (!host || host.dataset.fallbackLoaded === "true") return;
  host.dataset.fallbackLoaded = "true";
  host.innerHTML = "";

  const widget = document.createElement("div");
  widget.className = "tradingview-widget-container";
  widget.style.width = "100%";
  widget.style.height = "100%";

  const widgetBody = document.createElement("div");
  widgetBody.className = "tradingview-widget-container__widget";
  widgetBody.style.width = "100%";
  widgetBody.style.height = "100%";
  widget.appendChild(widgetBody);

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
  script.text = JSON.stringify({
    width: "100%",
    height: "100%",
    defaultColumn: "overview",
    defaultScreen: "general",
    market: "crypto",
    showToolbar: true,
    colorTheme: "light",
    locale: "en",
    isTransparent: false,
    largeChartUrl: ""
  });

  widgetBody.appendChild(script);
  host.appendChild(widget);
  host.closest(".fx-crypto-widget-card")?.setAttribute("data-widget-source", "tradingview-fallback");
}

function initFxCryptoChartList() {
  const host = document.querySelector(".finlogix-crypto-chart");
  if (!host || host.dataset.initialized === "true") return;
  host.dataset.initialized = "true";

  const fallbackIfFinlogixFails = () => {
    const text = (host.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    const hasServerError = text.includes("server error") || text.includes("try again");
    const hasRenderedWidget = !!host.querySelector("iframe, canvas, svg, table");
    if (hasServerError || !hasRenderedWidget) {
      console.warn("GO COIIN: Finlogix Chart List unavailable; using TradingView crypto market fallback.");
      initFxCryptoTradingViewFallback(host);
    }
  };

  const scheduleFallbackCheck = () => {
    window.setTimeout(fallbackIfFinlogixFails, 6500);
  };

  const init = () => {
    if (!window.Widget || typeof window.Widget.init !== "function") {
      initFxCryptoTradingViewFallback(host);
      return;
    }
    try {
      window.Widget.init({
        widgetId: "87c63d8a-2d03-409f-ba57-599ea3a57013",
        type: "SymbolChartList",
        language: "en",
        symbolIds: [66,145,69,119,120,121,144,146],
        isAdaptive: true,
        withBorderBox: true
      });
      scheduleFallbackCheck();
    } catch (error) {
      console.error("GO COIIN Finlogix crypto widget failed:", error);
      initFxCryptoTradingViewFallback(host);
    }
  };

  if (window.Widget && typeof window.Widget.init === "function") {
    init();
    return;
  }

  const existing = document.querySelector('script[data-gocoiin-finlogix="true"]');
  if (existing) {
    existing.addEventListener("load", init, { once: true });
    scheduleFallbackCheck();
    return;
  }

  const script = document.createElement("script");
  script.src = "https://widget.finlogix.com/Widget.js";
  script.async = true;
  script.dataset.gocoiinFinlogix = "true";
  script.addEventListener("load", init, { once: true });
  script.addEventListener("error", () => initFxCryptoTradingViewFallback(host), { once: true });
  document.head.appendChild(script);
}

function initFxMarketOverview() {
  const section = document.querySelector(".fx-market-section");
  if (!section || section.dataset.initialized === "true") return;
  section.dataset.initialized = "true";
  initFxCryptoChartList();

  const ensureElement = (name, src, dataAttr) => {
    const tag = section.querySelector(name);
    if (!tag) return Promise.resolve();

    if (customElements.get(name)) return Promise.resolve();

    const existing = document.querySelector(`script[data-${dataAttr}="true"]`);
    if (existing) return customElements.whenDefined(name);

    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.src = src;
    moduleScript.dataset[dataAttr] = "true";
    document.head.appendChild(moduleScript);
    return customElements.whenDefined(name);
  };

  const loadAdvancedChart = () => {
    const container = document.querySelector(".fx-market-data-section .tradingview-widget-container");
    if (!container || container.dataset.gocoiinAdvancedChartLoaded === "true") return Promise.resolve();

    const widgetHost = container.querySelector(".tradingview-widget-container__widget");
    if (!widgetHost) return Promise.resolve();

    container.dataset.gocoiinAdvancedChartLoaded = "true";

    const widgetScript = document.createElement("script");
    widgetScript.type = "text/javascript";
    widgetScript.async = true;
    widgetScript.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    widgetScript.text = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: true,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: true,
      interval: "D",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "OANDA:XAUUSD",
      theme: "light",
      timezone: "Etc/UTC",
      backgroundColor: "#ffffff",
      gridColor: "rgba(46, 46, 46, 0.2)",
      watchlist: [],
      withdateranges: true,
      range: "YTD",
      compareSymbols: [],
      support_host: "https://www.tradingview.com",
      show_popup_button: true,
      popup_height: "650",
      popup_width: "1000",
      studies: [],
      autosize: true
    });

    widgetHost.appendChild(widgetScript);
    return Promise.resolve();
  };

  Promise.all([
    ensureElement("tv-tickers", "https://widgets.tradingview-widget.com/w/en/tv-tickers.js", "gocoiinTradingviewTickers"),
    loadAdvancedChart()
  ]).catch(error => {
    console.error("GO COIIN TradingView widgets failed to load:", error);
  });
}



(() => {
  const heroTicker = document.querySelector(".hero-ticker");
  const track = heroTicker?.querySelector(".hero-ticker-track");
  if (!heroTicker || !track) return;
  const markets = [
    { flag:"🇪🇺", symbol:"EURUSD", value:"1.0987", change:"+0.24%", tone:"positive" },
    { flag:"🇬🇧", symbol:"GBPUSD", value:"1.2794", change:"-0.12%", tone:"negative" },
    { flag:"🇺🇸", symbol:"USDJPY", value:"149.32", change:"+0.31%", tone:"positive" },
    { flag:"🟡", symbol:"XAUUSD", value:"2,447.32", change:"+0.18%", tone:"positive" },
    { flag:"🇺🇸", symbol:"US30", value:"40,823.6", change:"+0.36%", tone:"positive" },
    { flag:"₿", symbol:"BTCUSD", value:"112,840", change:"+1.12%", tone:"positive" }
  ];
  const createItems = () => markets.map(market => {
    const item = document.createElement("span"); item.className = "hero-ticker-item";
    item.innerHTML = `<span class="hero-ticker-icon" aria-hidden="true">${market.flag}</span><strong>${market.symbol}</strong><b>${market.value}</b><i class="${market.tone}">${market.change}</i>`;
    return item;
  });
  const fallback = document.createElement("div"); fallback.className = "hero-ticker-fallback-track"; fallback.append(...createItems(), ...createItems()); track.replaceChildren(fallback);
  const setFallbackSpeed = () => {
    const firstSet = [...fallback.children].slice(0, markets.length); const gap = parseFloat(getComputedStyle(fallback).gap) || 0;
    const width = firstSet.reduce((total,item)=>total+item.getBoundingClientRect().width,0)+gap*(markets.length-1);
    fallback.style.setProperty("--hero-ticker-distance", `${width}px`);
  };
  requestAnimationFrame(setFallbackSpeed); window.addEventListener("resize", setFallbackSpeed, { passive:true });
  import("https://www.tradingview-widget.com/w/en/tv-ticker-tape.js").then(() => {
    const ticker = document.createElement("tv-ticker-tape");
    ticker.setAttribute("symbols","FX:EURUSD,FX:GBPUSD,FX:USDJPY,OANDA:XAUUSD,TVC:DJI,BITSTAMP:BTCUSD"); ticker.setAttribute("theme","dark"); ticker.setAttribute("transparent",""); ticker.setAttribute("locale","en"); ticker.setAttribute("item-size","compact"); ticker.setAttribute("show-hover","false"); ticker.className="hero-tradingview-ticker";
    track.replaceChildren(ticker); heroTicker.classList.add("is-live");
  }).catch(error => console.warn("Hero TradingView ticker unavailable; using animated fallback.", error));
})();

(() => {
  const installFinalMarketPatch = () => {
    const section = document.querySelector(".fx-market-section");
    const heroTicker = document.querySelector(".hero-ticker"); const track = heroTicker?.querySelector(".hero-ticker-track");
    if (!section) return false;
    if (track) track.style.animation = "none";
    section.querySelectorAll(".fx-market-table tbody tr").forEach(row => {
      const trendCell = row.children[5]; if (!trendCell || trendCell.querySelector(".fx-trade-action")) return;
      const button = document.createElement("button"); button.type="button"; button.className="fx-trade-action"; button.textContent="Trade";
      button.setAttribute("aria-label", `Trade ${row.querySelector("td strong")?.textContent || "market"}`);
      button.addEventListener("click", () => { const accountLink=document.querySelector('a[href="#open-account"].btn-primary'); if(accountLink) accountLink.click(); }); trendCell.appendChild(button);
    });
    if (!document.getElementById("fx-final-market-patch-style")) {
      const style=document.createElement("style"); style.id="fx-final-market-patch-style"; style.textContent=`html body .fx-market-table td:nth-child(6)::after{display:none!important}html body .fx-market-table td:nth-child(6){padding-right:76px!important}html body .fx-trade-action{position:absolute;top:50%;right:9px;transform:translateY(-50%);min-width:55px;height:25px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(12,169,247,.62);border-radius:5px;color:#dff5ff;background:rgba(3,28,47,.76);box-shadow:inset 0 0 12px rgba(11,174,255,.05);font:700 8px/1 Inter,Arial,sans-serif;cursor:pointer}html body .fx-trade-action:hover{border-color:#16a9ff;background:rgba(8,53,79,.9);color:#fff}`; document.head.appendChild(style);
    }
    return true;
  };
  if (!installFinalMarketPatch()) { const observer=new MutationObserver(()=>{if(installFinalMarketPatch()) observer.disconnect();}); observer.observe(document.body,{childList:true,subtree:true}); }
})();

(() => {
  const loadMarketCategories = async () => {
    if (document.querySelector(".market-categories")) return true;

    const marketSection = document.querySelector(".fx-market-section");
    const marketDataSection = document.querySelector(".fx-market-data-section");
    if (!marketSection) return false;

    try {
      const cssId="fx-market-categories-css";
      if(!document.getElementById(cssId)){
        const link=document.createElement("link");
        link.id=cssId;
        link.rel="stylesheet";
        link.href="./sections/market-categories.css";
        document.head.appendChild(link);
      }

      const response=await fetch("./sections/market-categories.html",{cache:"no-cache"});
      if(!response.ok) throw new Error(`Market categories HTTP ${response.status}`);

      const markup=await response.text();

      // Keep Global Markets AFTER both Market Tickers and Market Data.
      (marketDataSection || marketSection).insertAdjacentHTML("afterend",markup);

      return true;
    } catch(error){
      console.error("FXCentrum24 market categories failed to load:",error);
      return false;
    }
  };
  const start=async()=>{if(await loadMarketCategories()){normalizeHomepageMarketOrder();return;}const observer=new MutationObserver(async()=>{if(await loadMarketCategories()){normalizeHomepageMarketOrder();observer.disconnect();}});observer.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();

/* =========================================================
   FXCENTRUM24 — SECTION 04: ACCOUNT TYPES + PARTNERSHIP
   Loaded only after the global market categories are present.
   ========================================================= */
(() => {
  const loadAccountsSection = async () => {
    if (document.querySelector(".fx-accounts-section")) return true;
    const marketCategories = document.querySelector(".market-categories");
    if (!marketCategories) return false;
    try {
      const cssId = "fx-accounts-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "./sections/accounts.css";
        document.head.appendChild(link);
      }
      const response = await fetch("./sections/accounts.html", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Accounts section HTTP ${response.status}`);
      const markup = await response.text();
      marketCategories.insertAdjacentHTML("afterend", markup);
      return true;
    } catch (error) {
      console.error("FXCentrum24 accounts section failed to load:", error);
      return false;
    }
  };
  const start = async () => {
    if (await loadAccountsSection()) return;
    const observer = new MutationObserver(async () => {
      if (await loadAccountsSection()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
