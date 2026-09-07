(() => {
  'use strict';
  const isHome = /\/index\.html?$/.test(location.pathname) || location.pathname.endsWith('/');
  const isPartnership = /\/partnership(?:\/|$)/i.test(location.pathname);
  const isNested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(location.pathname);
  const prefix = () => isHome || !isNested ? './' : '../';
  const norm = value => (value || '').replace(/\s+/g, ' ').trim();
  const routes = {
    Forex:'markets/forex.html', Commodities:'markets/commodities.html', Indices:'markets/indices.html', 'Shares CFDs':'markets/shares-cfds.html', Cryptocurrency:'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html', 'Trading Conditions':'trading/trading-conditions.html', Platforms:'trading/platforms.html', 'How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html', 'MetaTrader 5':'platforms/metatrader-5.html', MT4:'platforms/metatrader-4.html', MT5:'platforms/metatrader-5.html', WebTrader:'platforms/webtrader.html',
    Standard:'accounts/standard.html', Premium:'accounts/premium.html', Professional:'accounts/professional.html',
    'Live Markets':'tools/live-markets.html', 'Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html', 'Contact Us':'company/contact.html', Benefits:'company/benefits.html',
    Partnership:'partnership/index.html', 'Open Account':'trading/account-opening.html', 'Open Account Now':'trading/account-opening.html'
  };
  const legal = {'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html','Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'};
  const fragments = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',markets:'tools/live-markets.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};

  const targetFor = (label, href) => {
    const key = norm(label).toLowerCase();
    if (/^(fx\s*centrum24\s*)?benefits$/.test(key) || key === 'why fx centrum24' || key === 'why fxcentrum24') return 'company/benefits.html';
    if (key === 'open account' || key === 'open account now') return isPartnership ? 'partnership/account-opening.html' : 'trading/account-opening.html';
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

  const socialMarkup = () => `
    <div class="footer-social-title">Stay Connected</div>
    <div class="social-row">
      <a class="social-link" href="#" aria-label="Facebook" aria-disabled="true" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4.5c-.5-.1-1.8-.2-3.3-.2-3.2 0-5.4 2-5.4 5.6V13H5v4h3.3v7H12v-7h3.5l.6-4H12V10.3c0-1.2.3-2.3 2-2.3z"/></svg></a>
      <a class="social-link" href="#" aria-label="X" aria-disabled="true" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4.3l3.1 4.4L16 4h2.9l-5.1 6 5.5 7.9H15L11.7 13 8 17.9H5.1l5.3-6.1L5 4z"/></svg></a>
      <a class="social-link" href="#" aria-label="LinkedIn" aria-disabled="true" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 8.2A1.9 1.9 0 1 0 6.2 4.4a1.9 1.9 0 0 0 0 3.8zM4.6 9.7H7.8V19H4.6V9.7zM9.4 9.7h3.1V11c.4-.8 1.5-1.6 3.2-1.6 3.4 0 4 2.2 4 5.1V19h-3.2v-4c0-1 0-2.3-1.4-2.3s-1.7 1.1-1.7 2.2V19H9.4V9.7z"/></svg></a>
      <a class="social-link" href="#" aria-label="YouTube" aria-disabled="true" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8.1a2.8 2.8 0 0 0-2-2C17.2 5.6 12 5.6 12 5.6s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2C2.5 9.9 2.5 12 2.5 12s0 2.1.5 3.9a2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-3.9.5-3.9s0-2.1-.5-3.9zM10 15.3V8.7l6 3.3-6 3.3z"/></svg></a>
      <a class="social-link" href="#" aria-label="Instagram" aria-disabled="true" tabindex="-1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.8h10A4.2 4.2 0 0 1 21.2 7v10a4.2 4.2 0 0 1-4.2 4.2H7A4.2 4.2 0 0 1 2.8 17V7A4.2 4.2 0 0 1 7 2.8zm0 2A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10a2.2 2.2 0 0 0 2.2-2.2V7A2.2 2.2 0 0 0 17 4.8H7zm5 2.6A4.6 4.6 0 1 1 7.4 12 4.6 4.6 0 0 1 12 7.4zm0 2A2.6 2.6 0 1 0 14.6 12 2.6 2.6 0 0 0 12 9.4zm5.1-2.1a1.1 1.1 0 1 1-1.1 1.1 1.1 0 0 1-1.1-1.1z"/></svg></a>
    </div>`;

  const ensureSocials = () => {
    document.querySelectorAll('.site-footer').forEach(footer => {
      const existing = footer.querySelector('.social-row');
      if (existing) {
        existing.querySelectorAll('a[aria-label]').forEach(a => {
          const label = (a.getAttribute('aria-label') || '').toLowerCase();
          if (['facebook','x','linkedin','youtube','instagram'].includes(label)) {
            a.setAttribute('aria-disabled','true');
            a.removeAttribute('href');
            a.tabIndex = -1;
          }
        });
        return;
      }
      const host = footer.querySelector('.footer-brand') || footer.querySelector('.footer-grid') || footer.querySelector('.footer-inner') || footer;
      const wrap = document.createElement('div');
      wrap.className = 'footer-social-standard';
      wrap.setAttribute('aria-label','Stay Connected');
      wrap.innerHTML = socialMarkup();
      host.appendChild(wrap);
    });
    if (!document.getElementById('fxc-social-standard-style')) {
      const style = document.createElement('style');
      style.id = 'fxc-social-standard-style';
      style.textContent = `.footer-social-standard{margin-top:18px}.footer-social-title{margin-bottom:10px;color:#f2f7fb;font-size:13px;font-weight:750}.footer-social-standard .social-row{display:flex;gap:8px;flex-wrap:wrap}.footer-social-standard .social-link{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(120,180,220,.22);border-radius:50%;background:#0a1724;color:#d6e5f0}.footer-social-standard .social-link[aria-disabled="true"]{cursor:default}.footer-social-standard .social-link svg{width:16px;height:16px;fill:currentColor}`;
      document.head.appendChild(style);
    }
  };

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
  const initPlatformTabs = () => {
    document.querySelectorAll('.platforms-section').forEach(section => {
      if (section.dataset.fxcPlatformTabs === '1') return;
      const tabs=[...section.querySelectorAll('.platform-tab[data-platform]')];
      const panels=[...section.querySelectorAll('.platform-features[data-platform-features]')];
      const learn=section.querySelector('#platformLearnMore');
      if(!tabs.length||!panels.length)return;
      const config={mt4:{label:'Learn More — MetaTrader 4',path:'platforms/metatrader-4.html'},mt5:{label:'Learn More — MetaTrader 5',path:'platforms/metatrader-5.html'},webtrader:{label:'Learn More — WebTrader',path:'platforms/webtrader.html'}};
      const select=platform=>{const item=config[platform]||config.mt4;tabs.forEach(tab=>{const active=tab.dataset.platform===platform;tab.classList.toggle('is-active',active);tab.setAttribute('aria-selected',active?'true':'false');});panels.forEach(panel=>{panel.hidden=panel.dataset.platformFeatures!==platform;});if(learn){learn.href=prefix()+item.path;learn.innerHTML=`${item.label} <b aria-hidden="true">→</b>`;}};
      tabs.forEach(tab=>tab.addEventListener('click',()=>select(tab.dataset.platform)));
      select(tabs.find(tab=>tab.classList.contains('is-active'))?.dataset.platform||'mt4');
      section.dataset.fxcPlatformTabs='1';
    });
  };
  const initFinlogixHome = () => {
    if(!isHome)return;
    const host=document.querySelector('.hero-ticker-track')||document.querySelector('.hero-ticker');
    if(!host||document.getElementById('fxc-finlogix-home-strip'))return;
    host.innerHTML='<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';
    const init=()=>{if(window.Widget&&typeof window.Widget.init==='function')window.Widget.init({widgetId:'87c63d8a-2d03-409f-ba57-599ea3a57013',type:'StripBar',language:'en',symbolPairs:[{symbolId:'19',symbolName:'EURUSD'},{symbolId:'36',symbolName:'USDJPY'},{symbolId:'20',symbolName:'GBPAUD'},{symbolId:'44',symbolName:'XAUUSD'},{symbolId:'128',symbolName:'USWTI'},{symbolId:'157',symbolName:'SP500'}],isAdaptive:true});};
    if(window.Widget)init();else{const script=document.createElement('script');script.src='https://widget.finlogix.com/Widget.js';script.async=true;script.addEventListener('load',init,{once:true});document.head.appendChild(script);}
  };
  const init=()=>{fixAll();ensureSocials();closeMenus();initNavigation();initPlatformTabs();initFinlogixHome();fixAll();new MutationObserver(()=>{fixAll();ensureSocials();initNavigation();initPlatformTabs();}).observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
