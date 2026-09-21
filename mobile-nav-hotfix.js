(() => {
  'use strict';

  /*
   * GO COIIN mobile navigation fallback.
   * site-fixes.js is the primary controller. This file is only a fallback
   * for pages where the primary controller is unavailable or cached.
   */
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else fn();
  }

  function clean(v) {
    return String(v || '').replace(/\s+/g, ' ').trim();
  }

  function relativeRootPath(target) {
    const path = window.location.pathname.replace(/^\/+/, '');
    const depth = path ? path.split('/').length - 1 : 0;
    return '../'.repeat(Math.max(0, depth)) + target;
  }

  function ensureStyles() {
    if (document.getElementById('gocoiin-mobile-nav-hotfix-style')) return;
    const style = document.createElement('style');
    style.id = 'gocoiin-mobile-nav-hotfix-style';
    style.textContent = `
      @media (max-width:850px){
        html body .site-header{position:sticky!important;top:0!important;z-index:100000!important;overflow:visible!important}
        html body .site-header .header-inner{position:relative!important;z-index:100001!important}
        html body .site-header .menu-toggle{display:flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:100002!important;flex:0 0 48px!important;width:48px!important;height:48px!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:5px!important;margin-left:auto!important;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation!important}
        html body .site-header .menu-toggle span{display:block!important;visibility:visible!important;opacity:1!important;width:24px!important;height:3px!important;min-height:3px!important;max-height:3px!important;margin:0!important;padding:0!important;background:#17324a!important;border-radius:3px!important}
        html body .site-header .main-nav{position:fixed!important;top:var(--fxc-header-height,74px)!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:calc(100dvh - var(--fxc-header-height,74px))!important;max-height:calc(100dvh - var(--fxc-header-height,74px))!important;overflow-x:hidden!important;overflow-y:auto!important;z-index:100001!important}
        html body .site-header .main-nav:not(.is-open):not(.open){display:none!important}
        html body .site-header .main-nav.is-open,html body .site-header .main-nav.open{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
        html body .site-header .main-nav .dropdown{display:none!important;position:static!important;width:100%!important;max-width:none!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important}
        html body .site-header .main-nav .nav-item.is-open>.dropdown,html body .site-header .main-nav .nav-item.open>.dropdown{display:block!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePayment(nav) {
    if (!nav) return;
    let item = nav.querySelector('[data-gocoiin-payment-nav]');
    if (!item) {
      item = document.createElement('div');
      item.className = 'nav-item';
      item.setAttribute('data-gocoiin-payment-nav', 'true');
      item.innerHTML = '<button type="button" class="nav-trigger" aria-expanded="false"><span>Payment</span><em>⌄</em></button><div class="dropdown"></div>';
      const partnership = [...nav.children].find(el => clean(el.textContent).toLowerCase() === 'partnership');
      partnership ? nav.insertBefore(item, partnership) : nav.appendChild(item);
    }
    const dd = item.querySelector('.dropdown');
    if (dd) {
      dd.innerHTML =
        '<a href="' + relativeRootPath('trading/deposit.html') + '"><span>Deposit</span><small>Bank transfer, QR &amp; UPI details</small></a>' +
        '<a href="' + relativeRootPath('trading/withdrawal.html') + '"><span>Withdrawal</span><small>Submit a withdrawal request</small></a>';
    }
  }

  function setOpen(nav, toggle, open) {
    nav.classList.toggle('is-open', open);
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', open);
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.removeProperty('overflow');
  }

  function closeSubmenus(nav, except) {
    nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(item => {
      if (item !== except) item.classList.remove('is-open', 'open');
    });
    nav.querySelectorAll('.nav-trigger').forEach(btn => {
      if (!except || !btn.closest('.nav-item') || btn.closest('.nav-item') !== except) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function setupFallback() {
    ensureStyles();
    const header = document.querySelector('.site-header');
    const nav = header && header.querySelector('.main-nav');
    const toggle = header && header.querySelector('.menu-toggle');
    if (!nav || !toggle) return;

    ensurePayment(nav);

    // Do not compete with the primary controller.
    if (window.__fxcMobileNavigationInstalled) return;
    if (window.__gocoiinMobileFallbackInstalled) return;
    window.__gocoiinMobileFallbackInstalled = true;

    const handle = event => {
      if (window.innerWidth > 850) return;

      const menuButton = event.target.closest('.menu-toggle');
      const trigger = event.target.closest('.main-nav .nav-trigger');
      if (!menuButton && !trigger) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (menuButton) {
        setOpen(nav, toggle, !(nav.classList.contains('is-open') || nav.classList.contains('open')));
        return;
      }

      const item = trigger.closest('.nav-item');
      if (!item) return;
      const opening = !(item.classList.contains('is-open') || item.classList.contains('open'));
      closeSubmenus(nav, item);
      item.classList.toggle('is-open', opening);
      item.classList.toggle('open', opening);
      trigger.setAttribute('aria-expanded', String(opening));
    };

    document.addEventListener('pointerup', e => {
      if (e.pointerType !== 'mouse') handle(e);
    }, true);

    document.addEventListener('click', e => handle(e), true);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setOpen(nav, toggle, false);
    });
  }

  ready(setupFallback);
})();