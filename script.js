document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
  document.querySelectorAll(".nav-item > button").forEach(button => {
    button.addEventListener("click", event => {
      if (window.innerWidth <= 820) {
        event.preventDefault();
        const item = button.parentElement;
        document.querySelectorAll(".nav-item.open").forEach(openItem => {
          if (openItem !== item) openItem.classList.remove("open");
        });
        item.classList.toggle("open");
      }
    });
  });
  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        nav?.classList.remove("open");
        menu?.setAttribute("aria-expanded", "false");
      }
    });
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      nav?.classList.remove("open");
      menu?.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".nav-item.open").forEach(item => item.classList.remove("open"));
    }
  });
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
      link.id = cssId; link.rel = "stylesheet"; link.href = "./sections/market-overview.css?v=20260918-original-final";
      document.head.appendChild(link);
    }
    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market section HTTP ${response.status}`);
    const markup = await response.text();
    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();
    normalizeHomepageMarketOrder();
    initFxMarketOverview();
  } catch (error) { console.error("FXCentrum24 market section failed to load:", error); }
});

function normalizeHomepageMarketOrder() {
  const tickerSection = document.querySelector(".fx-market-section");
  if (!tickerSection || !tickerSection.parentNode) return;

  const tapes = [...document.querySelectorAll(".fx-site-running-tape")];
  const marketDataSections = [...document.querySelectorAll(".fx-market-data-section")];

  // Keep exactly one running tape and one Market Data section.
  tapes.slice(1).forEach(node => node.remove());
  marketDataSections.slice(1).forEach(node => node.remove());

  const tape = document.querySelector(".fx-site-running-tape");
  const marketData = document.querySelector(".fx-market-data-section");

  // Canonical order: Market Tickers -> Finlogix Running Tape -> Market Data.
  if (tape && tape !== tickerSection.nextElementSibling) {
    tickerSection.parentNode.insertBefore(tape, tickerSection.nextElementSibling);
  }

  if (marketData) {
    const anchor = tape && tape.parentNode === tickerSection.parentNode ? tape : tickerSection;
    if (marketData !== anchor.nextElementSibling) {
      anchor.parentNode.insertBefore(marketData, anchor.nextElementSibling);
    }
  }
}

function initFxMarketOverview() {
  const section = document.querySelector(".fx-market-section");
  if (!section || section.dataset.initialized === "true") return;
  section.dataset.initialized = "true";

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

  const loadForexScreener = () => {
    // Market Data is a sibling of the Market Tickers section, so query the page,
    // not the ticker section itself.
    const container = document.querySelector(".fx-market-data-section .tradingview-widget-container");
    if (!container || container.dataset.gocoiinScreenerLoaded === "true") return Promise.resolve();

    const widgetHost = container.querySelector(".tradingview-widget-container__widget");
    if (!widgetHost) return Promise.resolve();

    container.dataset.gocoiinScreenerLoaded = "true";

    const widgetScript = document.createElement("script");
    widgetScript.type = "text/javascript";
    widgetScript.async = true;
    widgetScript.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    widgetScript.text = JSON.stringify({
      market: "forex",
      showToolbar: true,
      defaultColumn: "performance",
      defaultScreen: "general",
      isTransparent: false,
      locale: "en",
      colorTheme: "light",
      width: "100%",
      height: 550
    });

    // Keep the TradingView widget exactly in the section's widget host.
    widgetHost.appendChild(widgetScript);
    return Promise.resolve();
  };

  Promise.all([
    ensureElement("tv-tickers", "https://widgets.tradingview-widget.com/w/en/tv-tickers.js", "gocoiinTradingviewTickers"),
    loadForexScreener()
  ]).catch(error => {
    console.error("GO COIIN TradingView widgets failed to load:", error);
  });
}

(() => {
  const mountLiveTicker = () => {
    if (document.querySelector(".fx-site-running-tape")) {
      normalizeHomepageMarketOrder();
      return true;
    }

    const section = document.querySelector(".fx-market-section");
    if (!section || !section.parentNode) return false;

    const wrap = document.createElement("div");
    wrap.className = "fx-site-running-tape";
    wrap.setAttribute("aria-label", "Finlogix live market prices");
    wrap.innerHTML = '<iframe src="./widgets/finlogix-strip.html?v=20260918-final" title="Finlogix live market prices" scrolling="no"></iframe>';

    section.parentNode.insertBefore(wrap, section);
    normalizeHomepageMarketOrder();
    return true;
  };

  const start = () => {
    mountLiveTicker();
    normalizeHomepageMarketOrder();

    const observer = new MutationObserver(() => {
      const ready = mountLiveTicker();
      normalizeHomepageMarketOrder();
      if (ready && document.querySelector(".fx-market-data-section")) {
        // Keep observing so late-loaded sections cannot move these market blocks elsewhere.
      }
    });
    observer.observe(document.body, { childList:true, subtree:true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();


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
