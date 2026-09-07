(() => {
  'use strict';
  const isHome = /\/index\.html?$/.test(location.pathname) || location.pathname.endsWith('/');
  const isNested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(location.pathname);
  const prefix = () => isHome || !isNested ? './' : '../';
  const norm = value => (value || '').replace(/\s+/g, ' ').trim();
  const routes = {
    'Forex':'markets/forex.html','Commodities':'markets/commodities.html','Indices':'markets/indices.html','Shares CFDs':'markets/shares-cfds.html','Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html','Trading Conditions':'trading/trading-conditions.html','Platforms':'trading/platforms.html','How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html','MetaTrader 5':'platforms/metatrader-5.html','MT4':'platforms/metatrader-4.html','MT5':'platforms/metatrader-5.html','WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html',
    'Partnership':'partnership/index.html','Open Account':'trading/account-opening.html','Open Account Now':'trading/account-opening.html'
  };
  const legal = {'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html','Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'};
  const fragments = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',markets:'tools/live-markets.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};
  const targetFor = (label, href) => {
    const key = norm(label).toLowerCase();
    const direct = Object.keys(routes).find(k => k.toLowerCase() === key);
    if (direct) return routes[direct];
    const legalKey = Object.keys(legal).find(k => k.toLowerCase() === key);
    if (legalKey) return legal[legalKey];
    if (href === '#top') return 'index.html';
    if (href && href.startsWith('#')) return fragments[href.slice(1).toLowerCase()] || null;
    if (href && /(^|\/)terms\.html$/i.test(href)) return 'legal/terms-and-conditions.html';
    if (href && /(^|\/)privacy\.html$/i.test(href)) return 'legal/privacy-policy.html';
    return null;
  };
  const fixAnchor = anchor => {
    const href = norm(anchor.getAttribute('href'));
    const label = norm(anchor.textContent) || norm(anchor.getAttribute('aria-label'));
    const key = label.toLowerCase();
    if (key === 'login' || anchor.classList.contains('btn-login') || /(^|\/)login\.html(?:$|[?#])/i.test(href)) { anchor.remove(); return; }
    if (href === '#' && ['facebook','x','linkedin','youtube','instagram'].includes(key)) { anchor.removeAttribute('href'); anchor.setAttribute('aria-disabled','true'); anchor.tabIndex=-1; return; }
    const target = targetFor(label, href);
    if (target) anchor.setAttribute('href', prefix() + target);
  };
  const fixAll = () => document.querySelectorAll('a').forEach(fixAnchor);
  const closeMenus = () => {
    document.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.main-nav.is-open,.main-nav.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.menu-toggle[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded','false'));
    document.body.style.overflow='';
  };
  const initNavigation = () => {
    const menu=document.querySelector('.main-nav'), toggle=document.querySelector('.menu-toggle');
    if(!menu||!toggle||toggle.dataset.fxcBound==='1') return;
    toggle.dataset.fxcBound='1';
    toggle.addEventListener('click',e=>{e.preventDefault();const open=!menu.classList.contains('is-open')&&!menu.classList.contains('open');menu.classList.toggle('is-open',open);menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';});
    menu.querySelectorAll('.nav-item > .nav-trigger').forEach(t=>{if(t.dataset.fxcBound==='1')return;t.dataset.fxcBound='1';t.addEventListener('click',e=>{if(innerWidth>850)return;e.preventDefault();const item=t.closest('.nav-item');const wasOpen=item.classList.contains('is-open')||item.classList.contains('open');menu.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(x=>x.classList.remove('is-open','open'));t.setAttribute('aria-expanded',String(!wasOpen));if(!wasOpen)item.classList.add('is-open');});});
  };
  const initFinlogixHome = () => {
    if(!isHome) return;
    const host=document.querySelector('.hero-ticker-track')||document.querySelector('.hero-ticker');
    if(!host||document.getElementById('fxc-finlogix-home-strip')) return;
    host.innerHTML='<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';
    const init=()=>{if(window.Widget&&typeof window.Widget.init==='function')window.Widget.init({widgetId:'87c63d8a-2d03-409f-ba57-599ea3a57013',type:'StripBar',language:'en',symbolPairs:[{symbolId:'19',symbolName:'EURUSD'},{symbolId:'36',symbolName:'USDJPY'},{symbolId:'20',symbolName:'GBPAUD'},{symbolId:'44',symbolName:'XAUUSD'},{symbolId:'128',symbolName:'USWTI'},{symbolId:'157',symbolName:'SP500'}],isAdaptive:true});};
    if(window.Widget)init();else{const script=document.createElement('script');script.src='https://widget.finlogix.com/Widget.js';script.async=true;script.addEventListener('load',init,{once:true});document.head.appendChild(script);}
  };
  const init=()=>{fixAll();closeMenus();initNavigation();initFinlogixHome();fixAll();new MutationObserver(()=>{fixAll();initNavigation();}).observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
