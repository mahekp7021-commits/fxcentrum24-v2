document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================================================
     FX CENTRUM24 — GLOBAL WEBSITE INTERACTIONS
     ========================================================= */

  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("nav-open", isOpen);
    });
  }

  /* Mobile dropdown handling */
  document.querySelectorAll(".nav-item > button").forEach((button) => {
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", (event) => {
      if (window.innerWidth <= 820) {
        event.preventDefault();

        const parent = button.closest(".nav-item");
        if (!parent) return;

        const currentlyOpen = parent.classList.contains("open");

        /* Close other dropdowns */
        document.querySelectorAll(".nav-item.open").forEach((item) => {
          if (item !== parent) {
            item.classList.remove("open");

            const itemButton = item.querySelector(":scope > button");
            itemButton?.setAttribute("aria-expanded", "false");
          }
        });

        parent.classList.toggle("open", !currentlyOpen);
        button.setAttribute("aria-expanded", String(!currentlyOpen));
      }
    });
  });

  /* Close mobile menu when normal nav link is clicked */
  document.querySelectorAll(".main-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        mainNav?.classList.remove("open");
        body.classList.remove("nav-open");

        document.querySelectorAll(".nav-item.open").forEach((item) => {
          item.classList.remove("open");

          const button = item.querySelector(":scope > button");
          button?.setAttribute("aria-expanded", "false");
        });

        menuToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* Reset mobile state when resizing to desktop */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      mainNav?.classList.remove("open");
      body.classList.remove("nav-open");

      document.querySelectorAll(".nav-item.open").forEach((item) => {
        item.classList.remove("open");

        const button = item.querySelector(":scope > button");
        button?.setAttribute("aria-expanded", "false");
      });

      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });


  /* =========================================================
     HEADER SCROLL EFFECT
     ========================================================= */

  let lastScroll = 0;

  function updateHeader() {
    const scrollY = window.scrollY;

    if (!header) return;

    if (scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = scrollY;
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();


  /* =========================================================
     SMOOTH ANCHOR NAVIGATION
     ========================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      const headerHeight = header?.offsetHeight || 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        12;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });


  /* =========================================================
     SCROLL REVEAL ANIMATION
     ========================================================= */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }


  /* =========================================================
     HERO VIDEO
     ========================================================= */

  const heroVideo = document.querySelector("#heroVideo");
  const videoFallback = document.querySelector(".video-fallback");

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;

    const playVideo = () => {
      const promise = heroVideo.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          heroVideo.classList.add("video-blocked");

          if (videoFallback) {
            videoFallback.classList.add("active");
          }
        });
      }
    };

    heroVideo.addEventListener("loadeddata", playVideo);

    heroVideo.addEventListener("error", () => {
      heroVideo.classList.add("video-error");

      if (videoFallback) {
        videoFallback.classList.add("active");
      }
    });

    /* Try immediately if already loaded */
    if (heroVideo.readyState >= 2) {
      playVideo();
    }
  }


  /* =========================================================
     MARKET TABS
     ========================================================= */

  const marketTabs = document.querySelectorAll(".tabs button");

  marketTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      marketTabs.forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");
    });
  });


  /* =========================================================
     PLATFORM TABS
     ========================================================= */

  const platformTabs = document.querySelectorAll(".platform-tabs button");

  platformTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      platformTabs.forEach((item) => {
        item.classList.remove("active");
      });

      tab.classList.add("active");
    });
  });


  /* =========================================================
     TRADINGVIEW LIVE MARKET CHART
     ========================================================= */

  function initializeTradingView() {
    const chartContainer = document.querySelector("#tradingview_chart");

    if (!chartContainer) return;

    if (typeof TradingView === "undefined") {
      console.warn("TradingView library is not available.");

      chartContainer.innerHTML = `
        <div style="
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#8fa8c0;
          font-size:12px;
          text-align:center;
          padding:20px;
        ">
          Live market chart is loading...
        </div>
      `;

      return;
    }

    chartContainer.innerHTML = "";

    new TradingView.widget({
      autosize: true,
      symbol: "FX:EURUSD",
      interval: "15",
      timezone: "Asia/Kolkata",

      theme: "dark",
      style: "1",

      locale: "en",

      enable_publishing: false,

      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,

      allow_symbol_change: true,
      save_image: false,

      withdateranges: true,
      details: false,

      container_id: "tradingview_chart"
    });
  }

  /*
   * TradingView script is loaded before script.js in HTML.
   * Small delay ensures the external library is ready.
   */
  if (typeof TradingView !== "undefined") {
    initializeTradingView();
  } else {
    window.addEventListener("load", initializeTradingView, {
      once: true
    });
  }


  /* =========================================================
     LIVE MARKET STATUS EFFECT
     ========================================================= */

  const liveDots = document.querySelectorAll(".live-dot");

  liveDots.forEach((dot) => {
    setInterval(() => {
      dot.classList.toggle("pulse");
    }, 1400);
  });


  /* =========================================================
     MARKET SPARKLINE ANIMATION
     ========================================================= */

  const sparks = document.querySelectorAll(".spark");

  sparks.forEach((spark, index) => {
    spark.style.animationDelay = `${index * 0.25}s`;
  });


  /* =========================================================
     HERO MARKET CHIPS — FLOATING MOTION
     ========================================================= */

  const marketChips = document.querySelectorAll(".market-chip");

  marketChips.forEach((chip, index) => {
    chip.style.animationDelay = `${index * -1.2}s`;
  });


  /* =========================================================
     ACTIVE SECTION DETECTION
     ========================================================= */

  const sections = document.querySelectorAll("main section[id]");

  const navLinks = document.querySelectorAll(
    '.main-nav a[href^="#"]'
  );

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.getAttribute("id");

          navLinks.forEach((link) => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }


  /* =========================================================
     BUTTON MICRO INTERACTION
     ========================================================= */

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("pointerdown", () => {
      button.classList.add("pressed");
    });

    button.addEventListener("pointerup", () => {
      button.classList.remove("pressed");
    });

    button.addEventListener("pointerleave", () => {
      button.classList.remove("pressed");
    });
  });


  /* =========================================================
     REDUCE MOTION ACCESSIBILITY
     ========================================================= */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add(
      "reduce-motion"
    );
  }


  /* =========================================================
     PAGE READY
     ========================================================= */

  requestAnimationFrame(() => {
    document.documentElement.classList.add("page-ready");
  });

});
