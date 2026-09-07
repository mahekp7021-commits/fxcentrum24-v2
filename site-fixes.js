(() => {
  'use strict';

  const path = window.location.pathname.toLowerCase();
  const nested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(path);
  const isPartnership = /\/partnership(?:\/|$)/i.test(path);
  const prefix = nested ? '../' : './';
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();

  const routes = {
    'Forex':'markets/forex.html',
    'Commodities':'markets/commodities.html',
    'Indices':'markets/indices.html',
    'Shares CFDs':'markets/shares-cfds.html',
    'Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html',
    'Trading Conditions':'trading/trading-conditions.html',
    'Platforms':'trading/platforms.html',
    'How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html',
    'MT4':'platforms/metatrader-4.html',
    'MetaTrader 5':'platforms/metatrader-5.html',
    'MT5':'platforms/metatrader-5.html',
    'WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html',
    'Premium':'accounts/premium.html',
    'Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html',
    'Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html',
    'Contact Us':'company/contact.html',
    'Benefits':'company/benefits.html',
    'FXCentrum24 Benefits':'company/benefits.html',
    'Why FXCentrum24':'company/benefits.html',
    'Partnership':'partnership/index.html'
  };

  const legal = {
    'Terms & Conditions':'legal/terms-and-conditions.html',
    'Terms and Conditions':'legal/terms-and-conditions.html',
    'Privacy Policy':'legal/privacy-policy.html',
    'Risk Disclosure':'legal/risk-disclosure.html',
    'AML Policy':'legal/aml-policy.html',
    'Client Agreement':'legal/client-agreement.html'
  };

  const fragments = {
    accounts:'trading/account-types.html',
    conditions:'trading/trading-conditions.html',
    platforms:'trading/platforms.html',
    steps:'trading/how-to-start.html',
    markets:'tools/live-markets.html',
    calendar:'tools/economic-calendar.html',
    about:'company/about.html',
    contact:'company/contact.html',
    benefits:'company/benefits.html',
    partner:'partnership/index.html',
    'open-account':'trading/account-opening.html'
  };

  function routeFor(label, href) {
    const text = clean(label);
    const lower = text.toLowerCase();
    if (/^open account(?:\s*→)?$/i.test(text)) {
      return isPartnership ? 'partnership/account-opening.html' : 'trading/account-opening.html';
    }
    if (/^open partner account(?:\s*→)?$/i.test(text)) return 'partnership/account-opening.html';
    const direct = Object.keys(routes).find(key => key.toLowerCase() === lower);
    if (direct) return routes[direct];
    const compliance = Object.keys(legal).find(key => key.toLowerCase() === lower);
    if (compliance) return legal[compliance];
    if (href === '#top') return 'index.html';
    if (href && href.startsWith('#')) return fragments[href.slice(1).toLowerCase()] || null;
    if (href && /(^|\/)terms\.html$/i.test(href)) return 'legal/terms-and-conditions.html';
    if (href && /(^|\/)privacy\.html$/i.test(href)) return 'legal/privacy-policy.html';
    return null;
  }

  function isExternalOrSpecial(href) {
    return !href || /^(?:https?:|mailto:|tel:|javascript:)/i.test(href);
  }

  function fixLinks(root = document) {
    root.querySelectorAll('a').forEach(anchor => {
      const href = clean(anchor.getAttribute('href'));
      const label = clean(anchor.textContent);
      const lower = label.toLowerCase();

      if (lower === 'login' || anchor.classList.contains('btn-login') || /(^|\/)login\.html(?:$|[?#])/i.test(href)) {
        anchor.remove();
        return;
      }

      const target = routeFor(label, href);
      if (!target) return;
      if (!isExternalOrSpecial(href) && !href.startsWith('#')) return;
      anchor.setAttribute('href', prefix + target);
    });

    root.querySelectorAll('.site-footer a').forEach(anchor => {
      const href = clean(anchor.getAttribute('href'));
      const label = clean(anchor.textContent);
      const target = routeFor(label, href);
      if (target) anchor.setAttribute('href', prefix + target);
    });
  }

  function fixFooterLinks() {
    document.querySelectorAll('.site-footer a').forEach(anchor => {
      const label = clean(anchor.textContent);
      const target = routeFor(label, clean(anchor.getAttribute('href')));
      if (target) {
        anchor.setAttribute('href', prefix + target);
      }
    });
  }

  function setHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (header) {
      document.documentElement.style.setProperty('--fxc-header-height', `${header.getBoundingClientRect().height}px`);
    }
  }

  function closeMenu() {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (nav) {
      nav.classList.remove('is-open', 'open');
      nav.querySelectorAll('.nav-item.is-open, .nav-item.open').forEach(item => item.classList.remove('is-open', 'open'));
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }
    document.body.classList.remove('menu-open');
    document.body.style.removeProperty('overflow');
  }

  function setMenuOpen(open) {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', open);
    if (open && window.innerWidth <= 850) document.body.style.overflow = 'hidden';
    else document.body.style.removeProperty('overflow');
  }

  function installMobileStyles() {
    if (document.getElementById('fxc-mobile-nav-final')) return;
    const style = document.createElement('style');
    style.id = 'fxc-mobile-nav-final';
    style.textContent = `
      @media (max-width:850px){
        .site-header{position:sticky!important;top:0!important;z-index:100000!important;}
        .main-nav{position:fixed!important;top:var(--fxc-header-height,70px)!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:calc(100dvh - var(--fxc-header-height,70px))!important;display:none!important;flex-direction:column!important;align-items:stretch!important;padding:12px 16px 28px!important;margin:0!important;background:#04101d!important;border:0!important;box-shadow:0 20px 50px rgba(0,0,0,.55)!important;overflow-x:hidden!important;overflow-y:auto!important;z-index:100001!important;pointer-events:none!important;}
        .main-nav.is-open,.main-nav.open{display:flex!important;pointer-events:auto!important;}
        .main-nav .nav-item{width:100%!important;position:static!important;border-bottom:1px solid rgba(120,180,220,.10)!important;}
        .main-nav .nav-trigger,.main-nav .nav-link{width:100%!important;min-height:56px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;border:0!important;background:transparent!important;color:#dce8f4!important;font-size:15px!important;line-height:1.2!important;text-align:left!important;white-space:normal!important;cursor:pointer!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;}
        .main-nav .nav-link{justify-content:flex-start!important;}
        .main-nav .dropdown{position:static!important;display:none!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 0 10px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;transform:none!important;}
        .main-nav .nav-item.is-open>.dropdown,.main-nav .nav-item.open>.dropdown{display:block!important;}
        .main-nav .dropdown a{display:block!important;width:100%!important;padding:12px 10px!important;color:#b8cbdb!important;touch-action:manipulation!important;}
        .main-nav .dropdown a span{font-size:14px!important;}
        .main-nav .dropdown a small{display:block!important;margin-top:3px!important;color:#71879d!important;font-size:10px!important;line-height:1.4!important;}
        .menu-toggle{position:relative!important;z-index:100002!important;display:flex!important;align-items:center!important;justify-content:center!important;touch-action:manipulation!important;}
        body.menu-open{overflow:hidden!important;}
        .site-footer a{position:relative!important;z-index:2!important;pointer-events:auto!important;touch-action:manipulation!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function installMobileNavigation() {
    if (window.__fxcMobileNavigationInstalled) return;
    window.__fxcMobileNavigationInstalled = true;
    installMobileStyles();
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight, {passive:true});

    let suppressClickUntil = 0;

    function handleMenuPointer(event) {
      if (window.innerWidth > 850) return;
      const toggle = event.target.closest('.menu-toggle');
      const trigger = event.target.closest('.main-nav .nav-trigger');
      if (!toggle && !trigger) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      suppressClickUntil = Date.now() + 700;

      if (toggle) {
        const nav = document.querySelector('.main-nav');
        const open = !(nav && (nav.classList.contains('is-open') || nav.classList.contains('open')));
        setMenuOpen(open);
        if (!open) closeMenu();
        return;
      }

      const item = trigger.closest('.nav-item');
      const nav = trigger.closest('.main-nav');
      if (!item || !nav) return;
      const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');
      nav.querySelectorAll('.nav-item.is-open, .nav-item.open').forEach(other => {
        if (other !== item) other.classList.remove('is-open', 'open');
      });
      nav.querySelectorAll('.nav-trigger').forEach(button => button.setAttribute('aria-expanded','false'));
      item.classList.toggle('is-open', !wasOpen);
      item.classList.toggle('open', !wasOpen);
      trigger.setAttribute('aria-expanded', String(!wasOpen));
    }

    document.addEventListener('pointerup', event => {
      if (event.pointerType === 'mouse') return;
      handleMenuPointer(event);
    }, true);

    document.addEventListener('click', event => {
      if (Date.now() < suppressClickUntil && (event.target.closest('.menu-toggle') || event.target.closest('.main-nav .nav-trigger'))) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }
      if (window.innerWidth > 850) return;
      const toggle = event.target.closest('.menu-toggle');
      const trigger = event.target.closest('.main-nav .nav-trigger');
      if (toggle || trigger) {
        handleMenuPointer(event);
        return;
      }
      const link = event.target.closest('.main-nav a');
      if (link) {
        closeMenu();
      }
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function neutralizePlaceholderSocials() {
    document.querySelectorAll('.site-footer a.social-link[href="#"]').forEach(link => {
      link.addEventListener('click', event => event.preventDefault(), {passive:false});
      link.setAttribute('aria-disabled','true');
    });
  }

  function init() {
    fixLinks();
    fixFooterLinks();
    installMobileNavigation();
    neutralizePlaceholderSocials();
    setTimeout(() => {
      fixLinks();
      fixFooterLinks();
      neutralizePlaceholderSocials();
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
