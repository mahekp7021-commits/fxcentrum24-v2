(() => {
  'use strict';
  const isHome = /\/index\.html?$/.test(location.pathname) || location.pathname.endsWith('/');
  const isNested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(location.pathname);
  const prefix = () => isHome || !isNested ? './' : '../';
  const norm = s => (s || '').replace(/\s+/g,' ').trim();

  const routes = {
    'Forex':'markets/forex.html','Commodities':'markets/commodities.html','Indices':'markets/indices.html','Shares CFDs':'markets/shares-cfds.html','Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html','Trading Conditions':'trading/trading-conditions.html','Platforms':'trading/platforms.html','How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html','MetaTrader 5':'platforms/metatrader-5.html','MT4':'platforms/metatrader-4.html','MT5':'platforms/metatrader-5.html','WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html','Partnership':'partnership/index.html',
    'Open Account':'trading/account-opening.html','Open Account Now':'trading/account-opening.html','Explore Markets':'tools/live-markets.html','Explore All Markets':'tools/live-markets.html','View All Markets':'tools/live-markets.html'
  };
  const legal = {'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html','Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'};

  const fix = a => {
    if (!(a instanceof HTMLAnchorElement)) return;
    const href = norm(a.getAttribute('href'));
    const text = norm(a.textContent);
    const aria = norm(a.getAttribute('aria-label'));
    const label = text || aria;
    const key = label.toLowerCase();

    if (key === 'login' || a.classList.contains('btn-login') || /(^|\/)login\.html(?:$|[?#])/i.test(href)) { a.remove(); return; }
    if (href === '#top') { a.href = prefix() + 'index.html'; return; }
    if (/(^|\/)terms\.html$/i.test(href)) { a.href = prefix() + 'legal/terms-and-conditions.html'; return; }
    if (/(^|\/)privacy\.html$/i.test(href)) { a.href = prefix() + 'legal/privacy-policy.html'; return; }

    const fragmentRoutes = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',markets:'tools/live-markets.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};
    if (href.startsWith('#')) {
      const target = fragmentRoutes[href.slice(1).toLowerCase()];
      if (target) { a.href = prefix() + target; return; }
      if (href === '#' && ['facebook','x','linkedin','youtube','instagram'].includes(key)) { a.removeAttribute('href'); a.setAttribute('aria-disabled','true'); a.tabIndex=-1; }
      return;
    }

    const routeKey = Object.keys(routes).find(k => k.toLowerCase() === key);
    if (routeKey) { a.href = prefix() + routes[routeKey]; return; }
    const legalKey = Object.keys(legal).find(k => k.toLowerCase() === key);
    if (legalKey) a.href = prefix() + legal[legalKey];
  };

  const fixAll = () => document.querySelectorAll('a').forEach(fix);

  const nav = () => {
    const menu = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!menu || !toggle || toggle.dataset.fxcBound === '1') return;
    toggle.dataset.fxcBound='1';
    toggle.addEventListener('click', e => { e.preventDefault(); const open=!menu.classList.contains('is-open')&&!menu.classList.contains('open'); menu.classList.toggle('is-open',open); menu.classList.toggle('open',open); toggle.setAttribute('aria-expanded',String(open)); document.body.style.overflow=open?'hidden':''; });
    menu.querySelectorAll('.nav-item > .nav-trigger').forEach(t => { if(t.dataset.fxcBound==='1')return; t.dataset.fxcBound='1'; t.addEventListener('click',e=>{ if(innerWidth>850)return; e.preventDefault(); const item=t.closest('.nav-item'); const open=item.classList.contains('is-open')||item.classList.contains('open'); menu.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(x=>x.classList.remove('is-open','open')); t.setAttribute('aria-expanded',String(!open)); if(!open)item.classList.add('is-open'); }); });
  };

  const finlogix = () => {
    if (!isHome) return;
    const host=document.querySelector('.hero-ticker-track')||document.querySelector('.hero-ticker');
    if(!host||document.getElementById('fxc-finlogix-home-strip'))return;
    host.innerHTML='<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';
    const init=()=>{if(window.Widget&&typeof Widget.init==='function')Widget.init({widgetId:'87c63d8a-2d03-409f-ba57-599ea3a57013',type:'StripBar',language:'en',symbolPairs:[{symbolId:'19',symbolName:'EURUSD'},{symbolId:'36',symbolName:'USDJPY'},{symbolId:'20',symbolName:'GBPAUD'},{symbolId:'44',symbolName:'XAUUSD'},{symbolId:'128',symbolName:'USWTI'},{symbolId:'157',symbolName:'SP500'}],isAdaptive:true});};
    if(window.Widget)init();else{const s=document.createElement('script');s.src='https://widget.finlogix.com/Widget.js';s.async=true;s.addEventListener('load',init,{once:true});document.head.appendChild(s);}
  };

  const run=()=>{fixAll();nav();finlogix();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  new MutationObserver(()=>{fixAll();nav();}).observe(document.documentElement,{childList:true,subtree:true});
})();
