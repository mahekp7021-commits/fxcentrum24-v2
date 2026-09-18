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
      link.href = "./sections/market-overview.css?v=20260918-market-overview-final";
      document.head.appendChild(link);
    }

    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market Overview HTTP ${response.status}`);

    placeholder.insertAdjacentHTML("beforebegin", await response.text());
    const marketOverview = document.querySelector(".fx-market-section");
    if (!marketOverview) throw new Error("Market Overview section was not inserted.");

    // Exactly one Finlogix running tape, immediately before Market Overview.
    if (!document.querySelector(".fx-site-running-tape")) {
      const tape = document.createElement("div");
      tape.className = "fx-site-running-tape";
      tape.setAttribute("aria-label", "Live market prices");
      tape.innerHTML = '<iframe src="./widgets/finlogix-strip.html?v=20260918" title="Live market prices" scrolling="no"></iframe>';
      marketOverview.parentNode.insertBefore(tape, marketOverview);
    }

    const tickerScript = document.createElement("script");
    tickerScript.type = "module";
    tickerScript.src = "https://widgets.tradingview-widget.com/w/en/tv-market-overview.js";
    tickerScript.dataset.gocoiinMarketOverview = "true";
    if (!document.querySelector('script[data-gocoiin-market-overview="true"]')) {
      document.head.appendChild(tickerScript);
    }

    placeholder.remove();
  } catch (error) {
    console.error("GO COIIN market overview failed to load:", error);
  }
});


(() => {
  const loadMarketCategories = async () => {
    if (document.querySelector(".market-categories")) return true;
    const marketSection=document.querySelector(".fx-market-section"); if(!marketSection) return false;
    try {
      const cssId="fx-market-categories-css";
      if(!document.getElementById(cssId)){const link=document.createElement("link");link.id=cssId;link.rel="stylesheet";link.href="./sections/market-categories.css";document.head.appendChild(link);}
      const response=await fetch("./sections/market-categories.html",{cache:"no-cache"}); if(!response.ok) throw new Error(`Market categories HTTP ${response.status}`);
      const markup=await response.text(); marketSection.insertAdjacentHTML("afterend",markup); return true;
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
