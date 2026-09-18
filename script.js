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
  if (!placeholder) return;
  try {
    const cssId = "fx-market-overview-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "./sections/market-overview.css?v=20260918-clean-final";
      document.head.appendChild(link);
    }

    const overviewResponse = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!overviewResponse.ok) throw new Error(`Market Overview HTTP ${overviewResponse.status}`);
    placeholder.insertAdjacentHTML("beforebegin", await overviewResponse.text());

    const marketOverview = document.querySelector(".fx-market-section");
    if (!marketOverview) throw new Error("Market Overview section was not inserted.");

    if (!document.querySelector(".fx-site-running-tape")) {
      const tape = document.createElement("div");
      tape.className = "fx-site-running-tape";
      tape.setAttribute("aria-label", "Live market prices");
      tape.innerHTML = '<iframe src="./widgets/finlogix-strip.html?v=20260918-final" title="Live market prices" scrolling="no"></iframe>';
      marketOverview.parentNode.insertBefore(tape, marketOverview);
    }

    if (!document.querySelector(".fx-market-data-section")) {
      const dataResponse = await fetch("./sections/market-data.html", { cache: "no-cache" });
      if (!dataResponse.ok) throw new Error(`Market Data HTTP ${dataResponse.status}`);
      marketOverview.insertAdjacentHTML("afterend", await dataResponse.text());
    }

    placeholder.remove();

    const loadElement = (name, src) => {
      if (customElements.get(name)) return Promise.resolve();
      const selector = name.replace(/[^a-z0-9-]/gi,"");
      if (!document.querySelector(`script[data-gocoiin-widget="${selector}"]`)) {
        const moduleScript = document.createElement("script");
        moduleScript.type = "module";
        moduleScript.src = src;
        moduleScript.dataset.gocoiinWidget = selector;
        document.head.appendChild(moduleScript);
      }
      return customElements.whenDefined(name);
    };
    await Promise.all([
      loadElement("tv-tickers", "https://widgets.tradingview-widget.com/w/en/tv-tickers.js"),
      loadElement("tv-market-data", "https://widgets.tradingview-widget.com/w/en/tv-market-data.js")
    ]);
  } catch (error) {
    console.error("GO COIIN market sections failed to load:", error);
  }
});


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
  const loadMarketCategories = async () => {
    if (document.querySelector(".market-categories")) return true;
    const marketDataSection=document.querySelector(".fx-market-data-section"); const marketSection=document.querySelector(".fx-market-section"); if(!marketSection && !marketDataSection) return false;
    try {
      const cssId="fx-market-categories-css";
      if(!document.getElementById(cssId)){const link=document.createElement("link");link.id=cssId;link.rel="stylesheet";link.href="./sections/market-categories.css";document.head.appendChild(link);}
      const response=await fetch("./sections/market-categories.html",{cache:"no-cache"}); if(!response.ok) throw new Error(`Market categories HTTP ${response.status}`);
      const markup=await response.text(); (marketDataSection || marketSection).insertAdjacentHTML("afterend",markup); return true;
    } catch(error){console.error("FXCentrum24 market categories failed to load:",error);return false;}
  };
  const start=async()=>{if(await loadMarketCategories())return;const observer=new MutationObserver(async()=>{if(await loadMarketCategories())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});};
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
