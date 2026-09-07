(() => {
  'use strict';

  const path = window.location.pathname.toLowerCase();
  const nested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(path);
  const isPartnership = /\/partnership(?:\/|$)/i.test(path);
  const prefix = nested ? '../' : './';
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();

  const routes = {
    'Forex':'markets/forex.html','Commodities':'markets/commodities.html','Indices':'markets/indices.html','Shares CFDs':'markets/shares-cfds.html','Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html','Trading Conditions':'trading/trading-conditions.html','Platforms':'trading/platforms.html','How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html','MetaTrader 5':'platforms/metatrader-5.html','WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html','FXCentrum24 Benefits':'company/benefits.html','Why FXCentrum24':'company/benefits.html',
    'Partnership':'partnership/index.html','Open Partner Account':'partnership/account-opening.html'
  };
  const legal = {
    'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html',
    'Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'
  };
  const fragments = {
    accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',
    markets:'tools/live-markets.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html',
    'open-account':'trading/account-opening.html'
  };

  function targetFor(label, href) {
    const lower = clean(label).toLowerCase();
    if (/^open account(?:\s*→)?$/i.test(clean(label))) return isPartnership ? 'partnership/account-opening.html' : 'trading/account-opening.html';
    if (/^open partner account(?:\s*→)?$/i.test(clean(label))) return 'partnership/account-opening.html';
    const route = Object.keys(routes).find(k => k.toLowerCase() === lower);
    if (route) return routes[route];
    const legalRoute = Object.keys(legal).find(k => k.toLowerCase() === lower);
    if (legalRoute) return legal[legalRoute];
    if (href === '#top') return 'index.html';
    if (href && href.startsWith('#')) return fragments[href.slice(1).toLowerCase()] || null;
    if (href && /(^|\/)terms\.html$/i.test(href)) return 'legal/terms-and-conditions.html';
    if (href && /(^|\/)privacy\.html$/i.test(href)) return 'legal/privacy-policy.html';
    return null;
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
      const target = targetFor(label, href);
      if (!target) return;
      if (!href || href === '#' || href === '#top' || href.startsWith('#') || /(^|\/)terms\.html$/i.test(href) || /(^|\/)privacy\.html$/i.test(href)) {
        anchor.setAttribute('href', prefix + target);
      }
    });
  }

  function setHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (header) document.documentElement.style.setProperty('--fxc-header-height', `${header.getBoundingClientRect().height}px`);
  }

  function installMobileNavigation() {
    if (window.__fxcMobileNavigationInstalled) return;
    window.__fxcMobileNavigationInstalled = true;

    const style = document.createElement('style');
    style.id = 'fxc-mobile-nav-final';
    style.textContent = `
      @media (max-width:850px){
        .site-header{position:sticky!important;top:0!important;z-index:10000!important;transform:none!important;filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
        .main-nav{position:fixed!important;top:var(--fxc-header-height,74px)!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:calc(100dvh - var(--fxc-header-height,74px))!important;display:none!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;padding:12px 16px 28px!important;margin:0!important;background:#04101d!important;border:0!important;box-shadow:0 20px 50px rgba(0,0,0,.45)!important;overflow-y:auto!important;overscroll-behavior:contain!important;transform:none!important;opacity:1!important;visibility:visible!important;z-index:10001!important;}
        .main-nav.is-open,.main-nav.open{display:flex!important;}
        .main-nav .dropdown{position:static!important;display:none!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 0 8px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;transform:none!important;}
        .main-nav .nav-item.is-open>.dropdown,.main-nav .nav-item.open>.dropdown{display:block!important;}
        .main-nav .nav-trigger,.main-nav .nav-link{width:100%!important;min-height:56px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;border:0!important;background:transparent!important;color:#dce8f4!important;font-size:15px!important;text-align:left!important;white-space:normal!important;cursor:pointer!important;touch-action:manipulation!important;}
        .main-nav .nav-link{justify-content:flex-start!important;}
        .main-nav .nav-item{width:100%!important;border-bottom:1px solid rgba(120,180,220,.10)!important;}
        .main-nav .dropdown a{display:block!important;width:100%!important;padding:11px 8px!important;}
        .menu-toggle{position:relative!important;z-index:10002!important;touch-action:manipulation!important;}
        body.menu-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(style);
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight, {passive:true});

    document.addEventListener('click', event => {
      if (window.innerWidth > 850) return;
      const toggle = event.target.closest('.menu-toggle');
      if (toggle) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const menu = document.querySelector('.main-nav');
        if (!menu) return;
        const open = !(menu.classList.contains('is-open') || menu.classList.contains('open'));
        menu.classList.toggle('is-open', open);
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        document.body.classList.toggle('menu-open', open);
        return;
      }
      const trigger = event.target.closest('.main-nav .nav-trigger');
      if (trigger) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const item = trigger.closest('.nav-item');
        const menu = trigger.closest('.main-nav');
        if (!item || !menu) return;
        const open = !(item.classList.contains('is-open') || item.classList.contains('open'));
        menu.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => { if (other !== item) other.classList.remove('is-open','open'); });
        menu.querySelectorAll('.nav-trigger').forEach(button => button.setAttribute('aria-expanded','false'));
        item.classList.toggle('is-open', open);
        item.classList.toggle('open', open);
        trigger.setAttribute('aria-expanded', String(open));
        return;
      }
      const link = event.target.closest('.main-nav a');
      if (link) {
        const menu = document.querySelector('.main-nav');
        const toggle = document.querySelector('.menu-toggle');
        if (menu) menu.classList.remove('is-open','open');
        if (toggle) { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); }
        document.body.classList.remove('menu-open');
      }
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || window.innerWidth > 850) return;
      const menu = document.querySelector('.main-nav');
      const toggle = document.querySelector('.menu-toggle');
      if (menu) menu.classList.remove('is-open','open');
      if (toggle) { toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open navigation'); }
      document.body.classList.remove('menu-open');
    });
  }

  function neutralizePlaceholderSocials() {
    document.querySelectorAll('.site-footer a.social-link[href="#"]').forEach(link => {
      link.addEventListener('click', event => event.preventDefault(), { passive:false });
      link.setAttribute('aria-disabled','true');
      link.setAttribute('tabindex','-1');
    });
  }

  function init() {
    fixLinks();
    installMobileNavigation();
    neutralizePlaceholderSocials();
    setTimeout(() => { fixLinks(); neutralizePlaceholderSocials(); }, 200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
