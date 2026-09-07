(() => {
  'use strict';
  const isHome = /\/index\.html?$/.test(location.pathname) || location.pathname.endsWith('/');

  const closeMenus = () => {
    document.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.main-nav.is-open,.main-nav.open').forEach(el => el.classList.remove('is-open','open'));
    document.querySelectorAll('.menu-toggle[aria-expanded="true"]').forEach(el => el.setAttribute('aria-expanded','false'));
    document.body.style.overflow = '';
  };

  const initNavigation = () => {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle || toggle.dataset.fxcBound === '1') return;
    toggle.dataset.fxcBound = '1';
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const open = !nav.classList.contains('is-open') && !nav.classList.contains('open');
      nav.classList.toggle('is-open', open);
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav-item > .nav-trigger').forEach(trigger => {
      trigger.addEventListener('click', e => {
        if (window.innerWidth > 850) return;
        e.preventDefault();
        const item = trigger.closest('.nav-item');
        const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');
        nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => other.classList.remove('is-open','open'));
        trigger.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
        if (!wasOpen) item.classList.add('is-open');
      });
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (window.innerWidth <= 850) closeMenus(); }));
  };

  const initSocials = () => {
    document.querySelectorAll('a[aria-label]').forEach(a => {
      const label = (a.getAttribute('aria-label') || '').toLowerCase();
      if (['facebook','x','linkedin','youtube','instagram'].includes(label) && a.getAttribute('href') === '#') a.removeAttribute('href');
    });
  };

  const initFinlogixHome = () => {
    if (!isHome) return;
    const host = document.querySelector('.hero-ticker-track') || document.querySelector('.hero-ticker');
    if (!host || document.getElementById('fxc-finlogix-home-strip')) return;
    host.innerHTML = '<div id="fxc-finlogix-home-strip" class="fxc-finlogix-home-strip"><div class="finlogix-container"></div></div>';
    const init = () => {
      if (!window.Widget || typeof window.Widget.init !== 'function') return;
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
    };
    if (window.Widget) init();
    else {
      const script = document.createElement('script');
      script.src = 'https://widget.finlogix.com/Widget.js';
      script.async = true;
      script.addEventListener('load', init, {once:true});
      document.head.appendChild(script);
    }
  };

  const init = () => { closeMenus(); initNavigation(); initSocials(); initFinlogixHome(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
