(() => {
  'use strict';

  const path = location.pathname.toLowerCase();
  const isHome = /\/index\.html?$/.test(path) || path.endsWith('/');
  const isPartnership = /\/partnership(?:\/|$)/.test(path);
  const isNested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//.test(path);
  const prefix = () => (isHome || !isNested) ? './' : '../';
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();

  const routes = {
    'Forex':'markets/forex.html','Commodities':'markets/commodities.html','Indices':'markets/indices.html','Shares CFDs':'markets/shares-cfds.html','Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html','Trading Conditions':'trading/trading-conditions.html','Platforms':'trading/platforms.html','How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html','MetaTrader 5':'platforms/metatrader-5.html','MT4':'platforms/metatrader-4.html','MT5':'platforms/metatrader-5.html','WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html','FXCentrum24 Benefits':'company/benefits.html','Why FXCentrum24':'company/benefits.html',
    'Partnership':'partnership/index.html','Open Partner Account':'partnership/account-opening.html','Open Partner Account →':'partnership/account-opening.html'
  };
  const legal = {
    'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html',
    'Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'
  };
  const fragments = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',markets:null,calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};

  function targetFor(label, href) {
    const key = clean(label);
    const lower = key.toLowerCase();
    if (lower === 'open account' || lower === 'open account now' || lower === 'open account →') return isPartnership ? 'partnership/account-opening.html' : 'trading/account-opening.html';
    if (lower === 'open partner account' || lower === 'open partner account →') return 'partnership/account-opening.html';
    if (Object.prototype.hasOwnProperty.call(routes, key)) return routes[key];
    const routeKey = Object.keys(routes).find(k => k.toLowerCase() === lower);
    if (routeKey) return routes[routeKey];
    const legalKey = Object.keys(legal).find(k => k.toLowerCase() === lower);
    if (legalKey) return legal[legalKey];
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
      if (lower === 'login' || anchor.classList.contains('btn-login') || /(^|\/)login\.html(?:$|[?#])/i.test(href)) { anchor.remove(); return; }
      const target = targetFor(label, href);
      if (target) anchor.setAttribute('href', prefix() + target);
    });
  }

  const icon = {
    Facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4.5c-.5-.1-1.8-.2-3.3-.2-3.2 0-5.4 2-5.4 5.6V13H5v4h3.3v7H12v-7h3.5l.6-4H12V10.3c0-1.2.3-2.3 2-2.3z"/></svg>',
    X:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4.3l3.1 4.4L16 4h2.9l-5.1 6 5.5 7.9H15L11.7 13 8 17.9H5.1l5.3-6.1L5 4z"/></svg>',
    LinkedIn:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 8.2A1.9 1.9 0 1 0 6.2 4.4a1.9 1.9 0 0 0 0 3.8zM4.6 9.7H7.8V19H4.6V9.7zM9.4 9.7h3.1V11c.4-.8 1.5-1.6 3.2-1.6 3.4 0 4 2.2 4 5.1V19h-3.2v-4c0-1 0-2.3-1.4-2.3s-1.7 1.1-1.7 2.2V19H9.4V9.7z"/></svg>',
    YouTube:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.1a2.8 2.8 0 0 0-2-2C17.2 5.6 12 5.6 12 5.6s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2C2.5 9.9 2.5 12 2.5 12s0 2.1.5 3.9a2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-3.9.5-3.9s0-2.1-.5-3.9zM10 15.3V8.7l6 3.3-6 3.3z"/></svg>',
    Instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8zm0 2A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10a2.2 2.2 0 0 0 2.2-2.2V7A2.2 2.2 0 0 0 17 4.8H7zm5 2.6A4.6 4.6 0 1 1 7.4 12 4.6 4.6 0 0 1 12 7.4zm0 2A2.6 2.6 0 1 0 14.6 12 2.6 2.6 0 0 0 12 9.4zm5.1-2.1a1.1 1.1 0 1 1-1.1 1.1 1.1 0 0 1-1.1-1.1z"/></svg>'
  };

  function socialMarkup() {
    return Object.entries(icon).map(([name, svg]) => `<a class="social-link" href="#" aria-label="${name}" aria-disabled="true" tabindex="-1">${svg}</a>`).join('');
  }

  function normalizeSocials() {
    document.querySelectorAll('.site-footer').forEach(footer => {
      let col = [...footer.querySelectorAll('.footer-col')].find(el => clean(el.querySelector('h4')?.textContent).toLowerCase() === 'stay connected');
      if (!col) {
        const grid = footer.querySelector('.footer-grid') || footer.querySelector('.footer-columns');
        if (!grid) return;
        col = document.createElement('div');
        col.className = 'footer-col';
        grid.appendChild(col);
      }
      col.innerHTML = `<h4>Stay Connected</h4><div class="social-row">${socialMarkup()}</div>`;
    });
    if (!document.getElementById('fxc-social-standard-style')) {
      const style = document.createElement('style');
      style.id = 'fxc-social-standard-style';
      style.textContent = `.footer-col .social-row{display:flex;gap:8px;flex-wrap:wrap}.footer-col .social-link{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(120,180,220,.25);border-radius:50%;background:#0a1724;color:#d6e5f0}.footer-col .social-link svg{width:16px;height:16px;fill:currentColor}.footer-col .social-link[aria-disabled="true"]{cursor:default}`;
      document.head.appendChild(style);
    }
  }

  function fixBenefitsPage() {
    if (!/\/company\/benefits\.html$/.test(path)) return;
    const eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) eyebrow.textContent = 'FXCENTRUM24 BENEFITS';
    const title = document.querySelector('.hero h1');
    if (title) title.innerHTML = 'The benefits of a clearer <span>trading experience.</span>';
    document.title = 'FXCentrum24 Benefits | FXCentrum24';
  }

  function initMobileNav() {
    const menu = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!menu || !toggle || toggle.dataset.fxcBound === '1') return;
    toggle.dataset.fxcBound = '1';
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const open = !menu.classList.contains('is-open') && !menu.classList.contains('open');
      menu.classList.toggle('is-open', open); menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('.nav-item > .nav-trigger').forEach(trigger => {
      if (trigger.dataset.fxcBound === '1') return;
      trigger.dataset.fxcBound = '1';
      trigger.addEventListener('click', e => {
        if (innerWidth > 850) return;
        e.preventDefault();
        const item = trigger.closest('.nav-item');
        const wasOpen = item.classList.contains('is-open');
        menu.querySelectorAll('.nav-item.is-open').forEach(x => x.classList.remove('is-open'));
        trigger.setAttribute('aria-expanded', String(!wasOpen));
        if (!wasOpen) item.classList.add('is-open');
      });
    });
  }

  function initPlatformTabs() {
    document.querySelectorAll('.platforms-section').forEach(section => {
      if (section.dataset.fxcTabs === '1') return;
      const tabs = [...section.querySelectorAll('.platform-tab')];
      if (!tabs.length) return;
      section.dataset.fxcTabs = '1';
      const configs = {
        'metatrader 4': {id:'mt4', url:'platforms/metatrader-4.html', features:['Advanced charting tools','Wide range of indicators','Desktop, Android mobile and web']},
        'metatrader 5': {id:'mt5', url:'platforms/metatrader-5.html', features:['Multi-asset trading capabilities','Advanced analytical tools','Desktop, mobile and web access']},
        'webtrader': {id:'webtrader', url:'platforms/webtrader.html', features:['Browser-based trading','No desktop installation required','Fast access across supported devices']}
      };
      const list = section.querySelector('.platform-features');
      const actions = section.querySelector('.platform-actions');
      const select = tab => {
        tabs.forEach(t => t.classList.toggle('is-active', t === tab));
        tabs.forEach(t => t.setAttribute('aria-selected', t === tab ? 'true' : 'false'));
        const cfg = configs[clean(tab.textContent).toLowerCase()] || configs['metatrader 4'];
        if (list) list.innerHTML = cfg.features.map(item => `<li>${item}</li>`).join('');
        if (actions) actions.innerHTML = `<a id="platformLearnMore" class="platform-action" href="${prefix()+cfg.url}">Learn More — ${clean(tab.textContent)} <b aria-hidden="true">→</b></a>`;
      };
      tabs.forEach(tab => tab.addEventListener('click', () => select(tab)));
      select(tabs.find(t => t.classList.contains('is-active')) || tabs[0]);
    });
  }

  function initFinlogixHome() {
    if (!isHome) return;
    const host = document.querySelector('.hero-ticker-track') || document.querySelector('.hero-ticker');
    if (!host || document.getElementById('fxc-finlogix-home-strip')) return;
    host.innerHTML = '<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';
    const start = () => window.Widget?.init?.({widgetId:'87c63d8a-2d03-409f-ba57-599ea3a57013',type:'StripBar',language:'en',symbolPairs:[{symbolId:'19',symbolName:'EURUSD'},{symbolId:'36',symbolName:'USDJPY'},{symbolId:'20',symbolName:'GBPAUD'},{symbolId:'44',symbolName:'XAUUSD'},{symbolId:'128',symbolName:'USWTI'},{symbolId:'157',symbolName:'SP500'}],isAdaptive:true});
    if (window.Widget) start(); else { const s=document.createElement('script'); s.src='https://widget.finlogix.com/Widget.js'; s.async=true; s.addEventListener('load',start,{once:true}); document.head.appendChild(s); }
  }

  function init() {
    fixLinks();
    fixBenefitsPage();
    normalizeSocials();
    initMobileNav();
    initPlatformTabs();
    initFinlogixHome();
    fixLinks();
    new MutationObserver(() => { fixLinks(); normalizeSocials(); initPlatformTabs(); }).observe(document.body,{childList:true,subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
