(() => {
  'use strict';

  const isHome = /\/index\.html?$/.test(location.pathname) || location.pathname.endsWith('/');

  const closeMenus = () => {
    document.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.main-nav.is-open,.main-nav.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.menu-toggle[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded','false'));
    document.body.style.overflow = '';
  };

  const routeMap = {
    'Account Types': 'trading/account-types.html',
    'Trading Conditions': 'trading/trading-conditions.html',
    'Platforms': 'trading/platforms.html',
    'How to Start': 'trading/how-to-start.html',
    'MetaTrader 4': 'platforms/metatrader-4.html',
    'MetaTrader 5': 'platforms/metatrader-5.html',
    'MT4': 'platforms/metatrader-4.html',
    'MT5': 'platforms/metatrader-5.html',
    'WebTrader': 'platforms/webtrader.html',
    'Standard': 'accounts/standard.html',
    'Premium': 'accounts/premium.html',
    'Professional': 'accounts/professional.html',
    'Live Markets': 'tools/live-markets.html',
    'Economic Calendar': 'tools/economic-calendar.html',
    'About Us': 'company/about.html',
    'Contact Us': 'company/contact.html',
    'Benefits': 'company/benefits.html',
    'Partnership': 'partnership/index.html',
    'Open Account': 'trading/account-opening.html',
    'Open Account Now': 'trading/account-opening.html',
    'Explore Markets': 'tools/live-markets.html',
    'Explore All Markets': 'tools/live-markets.html',
    'View All Markets': 'tools/live-markets.html'
  };

  const legalMap = {
    'Terms & Conditions': 'legal/terms-and-conditions.html',
    'Terms and Conditions': 'legal/terms-and-conditions.html',
    'Privacy Policy': 'legal/privacy-policy.html',
    'Risk Disclosure': 'legal/risk-disclosure.html',
    'AML Policy': 'legal/aml-policy.html',
    'Client Agreement': 'legal/client-agreement.html'
  };

  const normalize = value => (value || '').replace(/\s+/g, ' ').trim();

  const relativeToCurrentPage = target => {
    const depth = location.pathname.split('/').filter(Boolean).length - (location.pathname.endsWith('/') ? 0 : 1);
    const prefix = depth <= 0 ? './' : '../'.repeat(depth);
    return prefix + target;
  };

  const resolveRoute = target => {
    const rel = relativeToCurrentPage(target);
    return rel.replace(/\.\.\/index\.html$/, '../index.html');
  };

  const fixLink = anchor => {
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const href = normalize(anchor.getAttribute('href'));
    const text = normalize(anchor.textContent);
    const aria = normalize(anchor.getAttribute('aria-label'));
    const label = text || aria;
    const key = label.toLowerCase();

    // Login is intentionally not part of the product navigation.
    if (key === 'login' || anchor.classList.contains('btn-login') || /(^|\/)login\.html(?:$|[?#])/i.test(href)) {
      anchor.remove();
      return;
    }

    // Home/brand links.
    if (href === '#top') {
      anchor.setAttribute('href', resolveRoute('index.html'));
      return;
    }

    // Legacy legal routes are redirected to the approved filenames.
    if (/(^|\/)terms\.html$/i.test(href)) {
      anchor.setAttribute('href', resolveRoute('legal/terms-and-conditions.html'));
      return;
    }
    if (/(^|\/)privacy\.html$/i.test(href)) {
      anchor.setAttribute('href', resolveRoute('legal/privacy-policy.html'));
      return;
    }

    // Convert all known placeholder section links into real pages.
    if (href.startsWith('#')) {
      const fragment = href.slice(1).toLowerCase();
      const fragmentMap = {
        accounts: 'trading/account-types.html',
        conditions: 'trading/trading-conditions.html',
        platforms: 'trading/platforms.html',
        steps: 'trading/how-to-start.html',
        markets: 'tools/live-markets.html',
        calendar: 'tools/economic-calendar.html',
        about: 'company/about.html',
        contact: 'company/contact.html',
        benefits: 'company/benefits.html',
        partner: 'partnership/index.html',
        'open-account': 'trading/account-opening.html'
      };
      if (fragmentMap[fragment]) {
        anchor.setAttribute('href', resolveRoute(fragmentMap[fragment]));
        return;
      }
    }

    const routeKey = Object.keys(routeMap).find(k => k.toLowerCase() === key);
    if (routeKey) {
      anchor.setAttribute('href', resolveRoute(routeMap[routeKey]));
      return;
    }

    const legalKey = Object.keys(legalMap).find(k => k.toLowerCase() === key);
    if (legalKey) {
      anchor.setAttribute('href', resolveRoute(legalMap[legalKey]));
    }
  };

  const fixAllLinks = () => {
    document.querySelectorAll('a').forEach(fixLink);
  };

  const fixHomepageContentLinks = () => {
    if (!isHome) return;

    // Homepage-injected account cards and platform cards may contain placeholders.
    document.querySelectorAll('a').forEach(anchor => {
      const text = normalize(anchor.textContent).toLowerCase();
      const href = normalize(anchor.getAttribute('href'));
      const card = anchor.closest('[class*="account"],[class*="platform"]');

      if (!href || !card) return;

      if (text === 'learn more' || text === 'view details' || text === 'compare platforms') {
        const heading = normalize(card.querySelector('h2,h3,h4,strong')?.textContent).toLowerCase();
        if (heading === 'standard') anchor.setAttribute('href', './accounts/standard.html');
        else if (heading === 'premium') anchor.setAttribute('href', './accounts/premium.html');
        else if (heading === 'professional') anchor.setAttribute('href', './accounts/professional.html');
        else if (heading.includes('metatrader 4') || heading === 'mt4') anchor.setAttribute('href', './platforms/metatrader-4.html');
        else if (heading.includes('metatrader 5') || heading === 'mt5') anchor.setAttribute('href', './platforms/metatrader-5.html');
        else if (heading.includes('webtrader')) anchor.setAttribute('href', './platforms/webtrader.html');
      }
    });
  };

  const initNavigation = () => {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle || toggle.dataset.fxcBound === '1') return;
    toggle.dataset.fxcBound = '1';

    toggle.addEventListener('click', event => {
      event.preventDefault();
      const open = !nav.classList.contains('is-open') && !nav.classList.contains('open');
      nav.classList.toggle('is-open', open);
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-item > .nav-trigger').forEach(trigger => {
      if (trigger.dataset.fxcBound === '1') return;
      trigger.dataset.fxcBound = '1';
      trigger.addEventListener('click', event => {
        if (window.innerWidth > 850) return;
        event.preventDefault();
        const item = trigger.closest('.nav-item');
        const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');
        nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => other.classList.remove('is-open','open'));
        trigger.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  };

  const initSocials = () => {
    document.querySelectorAll('a[aria-label]').forEach(anchor => {
      const label = normalize(anchor.getAttribute('aria-label')).toLowerCase();
      if (['facebook','x','linkedin','youtube','instagram'].includes(label) && anchor.getAttribute('href') === '#') {
        anchor.removeAttribute('href');
        anchor.setAttribute('aria-disabled','true');
        anchor.setAttribute('tabindex','-1');
      }
    });
  };

  const initFinlogixHome = () => {
    if (!isHome) return;
    const host = document.querySelector('.hero-ticker-track') || document.querySelector('.hero-ticker');
    if (!host || document.getElementById('fxc-finlogix-home-strip')) return;

    host.innerHTML = '<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';

    const init = () => {
      if (!window.Widget || typeof window.Widget.init !== 'function') return;
      try {
        window.Widget.init({
          widgetId: '87c63d8a-2d03-409f-ba57-599ea3a57013',
          type: 'StripBar',
          language: 'en',
          symbolPairs: [
            {symbolId:'19',symbolName:'EURUSD'},
            {symbolId:'36',symbolName:'USDJPY'},
            {symbolId:'20',symbolName:'GBPAUD'},
            {symbolId:'44',symbolName:'XAUUSD'},
            {symbolId:'128',symbolName:'USWTI'},
            {symbolId:'157',symbolName:'SP500'}
          ],
          isAdaptive: true
        });
      } catch (error) {
        console.error('FXCentrum24 Finlogix homepage strip failed to initialize:', error);
      }
    };

    if (window.Widget) init();
    else {
      const existing = document.querySelector('script[data-fxc-finlogix="true"]');
      if (existing) existing.addEventListener('load', init, {once:true});
      else {
        const script = document.createElement('script');
        script.src = 'https://widget.finlogix.com/Widget.js';
        script.async = true;
        script.dataset.fxcFinlogix = 'true';
        script.addEventListener('load', init, {once:true});
        document.head.appendChild(script);
      }
    }
  };

  const run = () => {
    closeMenus();
    fixAllLinks();
    fixHomepageContentLinks();
    initNavigation();
    initSocials();
    initFinlogixHome();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();

  // script.js can inject homepage sections after this script runs.
  const observer = new MutationObserver(() => {
    fixAllLinks();
    fixHomepageContentLinks();
    initNavigation();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
})();
