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
