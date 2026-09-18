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
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "./sections/market-overview.css?v=20260918-tv-summary";
      document.head.appendChild(link);
    }

    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market section HTTP ${response.status}`);

    const markup = await response.text();
    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();

    await loadTradingViewMarketSummary();
  } catch (error) {
    console.error("GO COIIN market section failed to load:", error);
  }
});

function loadTradingViewMarketSummary() {
  const tag = document.querySelector("tv-market-summary");
  if (!tag) return Promise.resolve();

  if (customElements.get("tv-market-summary")) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gocoiin-tradingview-summary="true"]');

    if (existing) {
      customElements.whenDefined("tv-market-summary").then(resolve).catch(reject);
      return;
    }

    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.src = "https://widgets.tradingview-widget.com/w/en/tv-market-summary.js";
    moduleScript.dataset.gocoiinTradingviewSummary = "true";

    moduleScript.addEventListener("error", () => {
      reject(new Error("TradingView Market Summary module failed to load."));
    }, { once: true });

    document.head.appendChild(moduleScript);

    customElements.whenDefined("tv-market-summary").then(resolve).catch(reject);
  });
}

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
