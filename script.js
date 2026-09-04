document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     MOBILE NAVIGATION
     ===================================================== */

  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menu && nav) {

    menu.addEventListener("click", () => {

      const isOpen = nav.classList.toggle("open");

      menu.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

    });

  }


  /* =====================================================
     MOBILE DROPDOWNS
     ===================================================== */

  document
    .querySelectorAll(".nav-item > button")
    .forEach(button => {

      button.addEventListener("click", event => {

        if (window.innerWidth <= 820) {

          event.preventDefault();

          const item = button.parentElement;

          document
            .querySelectorAll(".nav-item.open")
            .forEach(openItem => {

              if (openItem !== item) {
                openItem.classList.remove("open");
              }

            });

          item.classList.toggle("open");
        }

      });

    });


  /* =====================================================
     CLOSE MOBILE NAV ON LINK CLICK
     ===================================================== */

  document
    .querySelectorAll(".main-nav a")
    .forEach(link => {

      link.addEventListener("click", () => {

        if (window.innerWidth <= 820) {

          nav?.classList.remove("open");

          menu?.setAttribute(
            "aria-expanded",
            "false"
          );

        }

      });

    });


  /* =====================================================
     CLOSE NAV WHEN RESIZING TO DESKTOP
     ===================================================== */

  window.addEventListener("resize", () => {

    if (window.innerWidth > 820) {

      nav?.classList.remove("open");

      menu?.setAttribute(
        "aria-expanded",
        "false"
      );

      document
        .querySelectorAll(".nav-item.open")
        .forEach(item => {
          item.classList.remove("open");
        });

    }

  });


  /* =====================================================
     SCROLL REVEAL
     ===================================================== */

  const io = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }

      });

    },
    {
      threshold: 0.12
    }
  );

  document
    .querySelectorAll(".reveal")
    .forEach(el => io.observe(el));


  /* =====================================================
     HERO VIDEO
     ===================================================== */

  const heroVideo =
    document.getElementById("heroVideo");

  if (heroVideo) {

    heroVideo.muted = true;

    const playVideo = () => {

      const promise = heroVideo.play();

      if (promise !== undefined) {
        promise.catch(() => {
          console.log(
            "Hero video autoplay was blocked."
          );
        });
      }

    };

    playVideo();

    document.addEventListener(
      "visibilitychange",
      () => {

        if (!document.hidden) {
          playVideo();
        }

      }
    );

  }

});


/* =========================================================
   FXCENTRUM24 — SECTION 02 LOADER
   Additive only: the locked hero code above is preserved.
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.querySelector(".next-section-placeholder");
  if (!placeholder || document.querySelector(".fx-market-section")) return;

  try {
    const cssId = "fx-market-overview-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "./sections/market-overview.css";
      document.head.appendChild(link);
    }

    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market section HTTP ${response.status}`);

    const markup = await response.text();
    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();

    initFxMarketOverview();
  } catch (error) {
    console.error("FXCentrum24 market section failed to load:", error);
  }
});


function initFxMarketOverview() {
  const section = document.querySelector(".fx-market-section");
  if (!section || section.dataset.initialized === "true") return;
  section.dataset.initialized = "true";

  const table = section.querySelector(".fx-market-table");
  const tabs = [...section.querySelectorAll(".fx-market-tab")];
  const chartHost = section.querySelector("#fxMarketChart");
  const chartSymbol = section.querySelector("#fxChartSymbol");
  const chartPair = section.querySelector("#fxChartPair");

  const marketMeta = {
    forex: { symbol: "FX:EURUSD", label: "EURUSD", name: "Euro / US Dollar" },
    commodities: { symbol: "OANDA:XAUUSD", label: "XAUUSD", name: "Gold / US Dollar" },
    indices: { symbol: "TVC:DJI", label: "US30", name: "Dow Jones Index" },
    shares: { symbol: "NASDAQ:AAPL", label: "AAPL", name: "Apple Inc." },
    crypto: { symbol: "COINBASE:BTCUSD", label: "BTCUSD", name: "Bitcoin / US Dollar" }
  };

  let activeCategory = "forex";
  let tvReady = false;

  const setActiveTab = category => {
    activeCategory = category;
    tabs.forEach(tab => {
      const active = tab.dataset.marketTab === category;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    table.className = "fx-market-table";
    if (category !== "forex") table.classList.add(`show-${category}`);

    const meta = marketMeta[category];
    if (meta) {
      if (chartSymbol) chartSymbol.textContent = meta.label;
      if (chartPair) chartPair.textContent = meta.label;
      if (chartHost && tvReady) renderFxTradingView(meta.symbol);
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.marketTab));
  });

  const loadTradingView = () => new Promise((resolve, reject) => {
    if (window.TradingView) return resolve();

    const existing = document.querySelector('script[data-fx-tradingview="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.dataset.fxTradingview = "true";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const renderFxTradingView = symbol => {
    if (!chartHost || !window.TradingView) return;

    chartHost.classList.remove("fx-chart-loaded");
    chartHost.innerHTML = "<div class=\"fx-chart-loading\"><span></span><b>Loading market chart…</b></div>";

    const widgetMount = document.createElement("div");
    widgetMount.id = `fx-tv-${Date.now()}`;
    widgetMount.style.width = "100%";
    widgetMount.style.height = "100%";
    chartHost.appendChild(widgetMount);

    new window.TradingView.widget({
      autosize: true,
      symbol,
      interval: "15",
      timezone: "Asia/Kolkata",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
      container_id: widgetMount.id
    });

    window.setTimeout(() => chartHost.classList.add("fx-chart-loaded"), 850);
  };

  loadTradingView()
    .then(() => {
      tvReady = true;
      renderFxTradingView(marketMeta[activeCategory].symbol);
    })
    .catch(error => {
      console.error("TradingView failed to load:", error);
      const loading = chartHost?.querySelector(".fx-chart-loading b");
      if (loading) loading.textContent = "Market chart unavailable";
    });
}


/* =========================================================
   FXCENTRUM24 — SECTION 02 LIVE TICKER POLISH
   Additive only. Does not replace hero or market markup.
   TradingView's current Web Component ticker provides the
   running market feed; the custom section remains intact.
   ========================================================= */

(() => {
  const mountLiveTicker = async () => {
    const section = document.querySelector(".fx-market-section");
    if (!section || section.dataset.liveTickerMounted === "true") return;
    section.dataset.liveTickerMounted = "true";

    const wrap = document.createElement("div");
    wrap.className = "fx-live-ticker-wrap";
    wrap.setAttribute("aria-label", "Live market ticker");
    wrap.innerHTML = `
      <div class="fx-live-ticker-fallback">
        <strong>LIVE MARKETS</strong>
        <span>Loading current market prices…</span>
      </div>
    `;

    const shell = section.querySelector(".fx-market-shell");
    if (!shell) return;
    shell.insertBefore(wrap, shell.firstElementChild);

    try {
      await import("https://www.tradingview-widget.com/w/en/tv-ticker-tape.js");

      const ticker = document.createElement("tv-ticker-tape");
      ticker.setAttribute(
        "symbols",
        "FX:EURUSD,FX:GBPUSD,FX:USDJPY,OANDA:XAUUSD,TVC:DJI,BITSTAMP:BTCUSD"
      );
      ticker.setAttribute("theme", "dark");
      ticker.setAttribute("transparent", "");
      ticker.setAttribute("locale", "en");
      ticker.setAttribute("item-size", "compact");
      ticker.setAttribute("show-hover", "false");

      wrap.replaceChildren(ticker);
    } catch (error) {
      console.error("FXCentrum24 live ticker failed to load:", error);
    }
  };

  const observeForMarketSection = () => {
    mountLiveTicker();

    if (document.querySelector(".fx-market-section")) return;

    const observer = new MutationObserver(() => {
      if (document.querySelector(".fx-market-section")) {
        observer.disconnect();
        mountLiveTicker();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeForMarketSection, { once: true });
  } else {
    observeForMarketSection();
  }
})();


/* =========================================================
   FXCENTRUM24 — HERO LIVE MARKET TAPE
   Additive patch: only enhances the existing hero ticker.
   ========================================================= */

(() => {
  const heroTicker = document.querySelector(".hero-ticker");
  const track = heroTicker?.querySelector(".hero-ticker-track");
  if (!heroTicker || !track) return;

  const markets = [
    { flag: "🇪🇺", symbol: "EURUSD", value: "1.0987", change: "+0.24%", tone: "positive" },
    { flag: "🇬🇧", symbol: "GBPUSD", value: "1.2794", change: "-0.12%", tone: "negative" },
    { flag: "🇺🇸", symbol: "USDJPY", value: "149.32", change: "+0.31%", tone: "positive" },
    { flag: "🟡", symbol: "XAUUSD", value: "2,447.32", change: "+0.18%", tone: "positive" },
    { flag: "🇺🇸", symbol: "US30", value: "40,823.6", change: "+0.36%", tone: "positive" },
    { flag: "₿", symbol: "BTCUSD", value: "112,840", change: "+1.12%", tone: "positive" }
  ];

  const createItems = () => markets.map(market => {
    const item = document.createElement("span");
    item.className = "hero-ticker-item";
    item.innerHTML = `
      <span class="hero-ticker-icon" aria-hidden="true">${market.flag}</span>
      <strong>${market.symbol}</strong>
      <b>${market.value}</b>
      <i class="${market.tone}">${market.change}</i>
    `;
    return item;
  });

  const fallback = document.createElement("div");
  fallback.className = "hero-ticker-fallback-track";
  fallback.append(...createItems(), ...createItems());

  track.replaceChildren(fallback);

  const setFallbackSpeed = () => {
    const firstSet = [...fallback.children].slice(0, markets.length);
    const gap = parseFloat(getComputedStyle(fallback).gap) || 0;
    const width = firstSet.reduce((total, item) => total + item.getBoundingClientRect().width, 0) + gap * (markets.length - 1);
    fallback.style.setProperty("--hero-ticker-distance", `${width}px`);
  };

  requestAnimationFrame(setFallbackSpeed);
  window.addEventListener("resize", setFallbackSpeed, { passive: true });

  // Try the live TradingView ticker feed. If it cannot load,
  // the animated local fallback remains visible and functional.
  import("https://www.tradingview-widget.com/w/en/tv-ticker-tape.js")
    .then(() => {
      const ticker = document.createElement("tv-ticker-tape");
      ticker.setAttribute(
        "symbols",
        "FX:EURUSD,FX:GBPUSD,FX:USDJPY,OANDA:XAUUSD,TVC:DJI,BITSTAMP:BTCUSD"
      );
      ticker.setAttribute("theme", "dark");
      ticker.setAttribute("transparent", "");
      ticker.setAttribute("locale", "en");
      ticker.setAttribute("item-size", "compact");
      ticker.setAttribute("show-hover", "false");

      ticker.className = "hero-tradingview-ticker";
      track.replaceChildren(ticker);
      heroTicker.classList.add("is-live");
    })
    .catch(error => {
      console.warn("Hero TradingView ticker unavailable; using animated fallback.", error);
    });
})();
