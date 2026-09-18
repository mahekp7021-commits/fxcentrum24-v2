(() => {
  'use strict';

  const path = window.location.pathname.toLowerCase();
  const nested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(path);
  const isPartnership = /\/partnership(?:\/|$)/i.test(path);
  const prefix = nested ? '../' : './';
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();
  const LOGIN_URL = 'https://fxcetrumrealmt5.tgsm.io/';
  const isHomepage = path === '/' || /\/index\.html$/i.test(path);

  function applyGoCoiinBrand() {
    const oldBrand = /FXCentrum24/gi;
    const oldBrandSpaced = /FX\s*Centrum\s*24/gi;
    document.title = clean(document.title).replace(oldBrand, 'GO COIIN').replace(oldBrandSpaced, 'GO COIIN');

    document.querySelectorAll('meta[content], [aria-label], [title], [alt]').forEach(el => {
      ['content','aria-label','title','alt'].forEach(attr => {
        if (el.hasAttribute(attr)) {
          const value = el.getAttribute(attr) || '';
          el.setAttribute(attr, value.replace(oldBrand, 'GO COIIN').replace(oldBrandSpaced, 'GO COIIN'));
        }
      });
    });

    document.querySelectorAll('body *').forEach(el => {
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
          node.nodeValue = node.nodeValue.replace(oldBrand, 'GO COIIN').replace(oldBrandSpaced, 'GO COIIN');
        }
      });
    });

    document.querySelectorAll('.brand-name').forEach(el => { el.innerHTML = '<strong>GO</strong> COIIN'; });
    document.querySelectorAll('.home-footer-logo').forEach(el => {
      const small = el.querySelector('small');
      if (small) el.innerHTML = '<span class="home-footer-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><strong>GO</strong> COIIN<small>Trade Today · A Brighter Tomorrow</small></span>';
    });
  }

  const routes = {
    'Forex':'markets/forex.html','Commodities':'markets/commodities.html','Indices':'markets/indices.html','Shares CFDs':'markets/shares-cfds.html','Cryptocurrency':'markets/cryptocurrency.html',
    'Account Types':'trading/account-types.html','Trading Conditions':'trading/trading-conditions.html','Platforms':'trading/platforms.html','How to Start':'trading/how-to-start.html',
    'MetaTrader 4':'platforms/metatrader-4.html','MT4':'platforms/metatrader-4.html','MetaTrader 5':'platforms/metatrader-5.html','MT5':'platforms/metatrader-5.html','WebTrader':'platforms/webtrader.html',
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html',
    'Live Markets':'tools/live-markets.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html','GO COIIN Benefits':'company/benefits.html','Why GO COIIN':'company/benefits.html','Partnership':'partnership/index.html','Withdrawal':'trading/withdrawal.html'
  };
  const legal = {'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html','Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'};
  const fragments = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',markets:'tools/live-markets.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};

  function routeFor(label, href) {
    const text = clean(label), lower = text.toLowerCase();
    if (/^open account(?:\s*→)?$/i.test(text)) return isPartnership ? 'partnership/account-opening.html' : 'trading/account-opening.html';
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

  function fixLinks(root=document) {
    root.querySelectorAll('a').forEach(anchor => {
      const href = clean(anchor.getAttribute('href'));
      const label = clean(anchor.textContent);
      const lower = label.toLowerCase();
      if (lower === 'login' || anchor.classList.contains('btn-login')) {
        anchor.setAttribute('href', LOGIN_URL);
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
        return;
      }
      const target = routeFor(label, href);
      if (!target) return;
      if (!/^(?:https?:|mailto:|tel:|javascript:)/i.test(href) && !href.startsWith('#')) return;
      anchor.setAttribute('href', prefix + target);
    });
    root.querySelectorAll('.site-footer a').forEach(anchor => {
      const target = routeFor(clean(anchor.textContent), clean(anchor.getAttribute('href')));
      if (target) anchor.setAttribute('href', prefix + target);
    });
  }

  function removeLegacyHomepageFooter() {
    if (!isHomepage) return;
    document.querySelectorAll('footer:not(.home-footer), .site-footer').forEach(el => el.remove());
  }

  function installHomepageFooterGuard() {
    if (!isHomepage || window.__gocoiinFooterGuardInstalled) return;
    window.__gocoiinFooterGuardInstalled = true;

    const remove = () => {
      document.querySelectorAll('footer:not(.home-footer), .site-footer').forEach(el => el.remove());
    };

    remove();
    const observer = new MutationObserver(() => remove());
    observer.observe(document.documentElement, { childList:true, subtree:true });

    const style = document.createElement('style');
    style.id = 'gocoiin-home-footer-guard';
    style.textContent = 'footer:not(.home-footer), .site-footer { display:none!important; visibility:hidden!important; height:0!important; min-height:0!important; margin:0!important; padding:0!important; overflow:hidden!important; }';
    document.head.appendChild(style);
  }

  function neutralizePlaceholderSocials() {
    document.querySelectorAll('.site-footer a.social-link[href="#"]').forEach(link => {
      link.addEventListener('click', e => e.preventDefault(), {passive:false});
      link.setAttribute('aria-disabled','true');
    });
  }

  function installGlobalUtilityNav() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    if (!nav.querySelector('[data-gocoiin-withdrawal-link]')) {
      const withdrawal = document.createElement('a');
      withdrawal.href = prefix + 'trading/withdrawal.html';
      withdrawal.textContent = 'Withdrawal';
      withdrawal.className = 'gocoiin-withdrawal-nav-link';
      withdrawal.setAttribute('data-gocoiin-withdrawal-link','true');
      nav.appendChild(withdrawal);
    }

    nav.querySelectorAll('[data-gocoiin-admin-link]').forEach(link => link.remove());

    if (!document.getElementById('gocoiin-withdrawal-nav-style')) {
      const style = document.createElement('style');
      style.id = 'gocoiin-withdrawal-nav-style';
      style.textContent = [
        '.main-nav .gocoiin-withdrawal-nav-link{',
        'display:inline-flex!important;',
        'align-items:center!important;',
        'white-space:nowrap!important;',
        'padding:10px 9px!important;',
        'margin:0!important;',
        'font-size:11px!important;',
        'line-height:1.2!important;',
        'font-weight:700!important;',
        'color:#d9e6f2!important;',
        'text-decoration:none!important;',
        'flex:0 0 auto!important;',
        'letter-spacing:0!important;',
        '}',
        '.main-nav .gocoiin-withdrawal-nav-link:hover{color:#fff!important;}',
        '@media(max-width:850px){.main-nav .gocoiin-withdrawal-nav-link{font-size:10px!important;}}'
      ].join('');
      document.head.appendChild(style);
    }
  }

  function normalizeHeaderActions() {
    document.querySelectorAll('.header-actions').forEach(actions => {
      const loginLinks = Array.from(actions.querySelectorAll('a')).filter(anchor => {
        const text = clean(anchor.textContent).toLowerCase();
        return text === 'login' || anchor.classList.contains('btn-login');
      });

      if (loginLinks.length) {
        const primaryLogin = loginLinks[0];
        primaryLogin.setAttribute('href', LOGIN_URL);
        primaryLogin.setAttribute('target', '_blank');
        primaryLogin.setAttribute('rel', 'noopener noreferrer');
        primaryLogin.classList.add('btn-login');
        primaryLogin.textContent = 'Login';

        loginLinks.slice(1).forEach(link => link.remove());
      }

      const openLinks = Array.from(actions.querySelectorAll('a')).filter(anchor => {
        return /^open account(?:\\s*→)?$/i.test(clean(anchor.textContent));
      });

      if (openLinks.length) {
        const open = openLinks[0];
        open.setAttribute('href', prefix + 'trading/account-opening.html');
        open.target = '';
        open.removeAttribute('rel');
        open.textContent = 'Open Account';
        openLinks.slice(1).forEach(link => link.remove());
      }

      if (!document.getElementById('gocoiin-mobile-header-action-style')) {
        const style = document.createElement('style');
        style.id = 'gocoiin-mobile-header-action-style';
        style.textContent = [
          '@media(max-width:850px){',
          'html body .header-actions{display:flex!important;align-items:center!important;gap:8px!important;margin-left:auto!important;flex-wrap:nowrap!important}',
          'html body .header-actions .btn-login{display:inline-flex!important}',
          'html body .header-actions .btn-primary{display:inline-flex!important}',
          'html body .header-actions .btn{white-space:nowrap!important}',
          'html body .header-actions .btn-login{padding-left:10px!important;padding-right:10px!important}',
          'html body .header-actions .btn-primary{padding-left:11px!important;padding-right:11px!important}',
          '}'
        ].join('');
        document.head.appendChild(style);
      }
    });
  }

  function installFinlogixWidgetShields() {
    ensureMarketActionModal();

    const candidates = new Set();
    document.querySelectorAll(
      '.market-strip,.fx-market-strip,.fx-live-ticker-wrap,.finlogix-live-strip,' +
      '.finlogix-container,[class*="finlogix"],' +
      'iframe[src*="finlogix"],iframe[src*="finlogix.com"],iframe[src*="widget.finlogix"]'
    ).forEach(el => {
      if (el.closest('#gocoiin-market-action-modal')) return;

      let target = el;
      const frame = el.tagName === 'IFRAME';
      if (frame) target = el.parentElement || el;
      const wrapper = target.closest('.market-strip,.fx-market-strip,.widget-frame');
      if (wrapper) target = wrapper;

      if (target && target !== document.body && target !== document.documentElement) {
        candidates.add(target);
      }
    });

    candidates.forEach(target => {
      if (target.querySelector(':scope > .gocoiin-finlogix-shield')) return;

      const position = getComputedStyle(target).position;
      if (position === 'static') target.style.position = 'relative';

      target.querySelectorAll('iframe').forEach(frame => {
        const src = frame.getAttribute('src') || '';
        if (/finlogix/i.test(src)) frame.style.pointerEvents = 'none';
      });

      const shield = document.createElement('button');
      shield.type = 'button';
      shield.className = 'gocoiin-finlogix-shield';
      shield.setAttribute('aria-label', 'Open trading options');
      shield.title = 'Open trading options';
      shield.style.cssText = [
        'position:absolute',
        'inset:0',
        'z-index:2147483000',
        'display:block',
        'width:100%',
        'height:100%',
        'min-height:1px',
        'padding:0',
        'margin:0',
        'border:0',
        'outline:0',
        'background:transparent',
        'cursor:pointer',
        'touch-action:manipulation',
        'pointer-events:auto'
      ].join(';');
      shield.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openMarketActionModal();
      }, true);
      shield.addEventListener('pointerup', event => {
        if (event.pointerType === 'mouse') return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openMarketActionModal();
      }, true);
      target.appendChild(shield);
    });
  }

  function setHeaderHeight() {
    const header = document.querySelector('.site-header');
    if (header) document.documentElement.style.setProperty('--fxc-header-height', `${header.getBoundingClientRect().height}px`);
  }

  function closeMenu() {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (nav) {
      nav.classList.remove('is-open','open');
      nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(item => item.classList.remove('is-open','open'));
    }
    if (toggle) {
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Open navigation');
    }
    document.body.classList.remove('menu-open');
    document.body.style.removeProperty('overflow');
  }

  function setMenuOpen(open) {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open',open);
    nav.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open',open);
    if (open && innerWidth <= 850) document.body.style.overflow='hidden';
    else document.body.style.removeProperty('overflow');
  }

  function installMobileStyles() {
    if (document.getElementById('fxc-mobile-nav-final')) return;
    const style = document.createElement('style');
    style.id = 'fxc-mobile-nav-final';
    style.textContent = `@media(max-width:850px){
      .site-header{position:sticky!important;top:0!important;z-index:100000!important;overflow:visible!important}
      .header-inner{position:relative!important;z-index:100001!important}
      .menu-toggle{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:48px!important;height:48px!important;padding:0!important;position:relative!important;z-index:100002!important;overflow:visible!important}
      .menu-toggle span{display:block!important;visibility:visible!important;opacity:1!important;width:24px!important;height:3px!important;min-height:3px!important;max-height:3px!important;margin:0!important;padding:0!important;background:#fff!important;border-radius:3px!important;flex:none!important}
      .main-nav{position:fixed!important;top:var(--fxc-header-height,70px)!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:calc(100dvh - var(--fxc-header-height,70px))!important;display:none!important;flex-direction:column!important;align-items:stretch!important;padding:12px 16px 28px!important;margin:0!important;background:#04101d!important;border:0!important;box-shadow:0 20px 50px rgba(0,0,0,.55)!important;overflow-x:hidden!important;overflow-y:auto!important;z-index:100001!important;pointer-events:none!important;transform:none!important}
      .main-nav.is-open,.main-nav.open{display:flex!important;pointer-events:auto!important}
      .main-nav .nav-item{width:100%!important;position:static!important;border-bottom:1px solid rgba(120,180,220,.10)!important}
      .main-nav .nav-trigger,.main-nav .nav-link{width:100%!important;min-height:56px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;padding:0 4px!important;border:0!important;background:transparent!important;color:#dce8f4!important;font-size:15px!important;line-height:1.2!important;text-align:left!important;white-space:normal!important;cursor:pointer!important;touch-action:manipulation!important}
      .main-nav .nav-link{justify-content:flex-start!important}
      .main-nav .dropdown{position:static!important;display:none!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 0 10px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1!important;visibility:visible!important;transform:none!important}
      .main-nav .nav-item.is-open>.dropdown,.main-nav .nav-item.open>.dropdown{display:block!important}
      .main-nav .dropdown a{display:block!important;width:100%!important;padding:12px 10px!important;color:#b8cbdb!important;touch-action:manipulation!important}
      .main-nav .dropdown a span{font-size:14px!important}.main-nav .dropdown a small{display:block!important;margin-top:3px!important;color:#71879d!important;font-size:10px!important;line-height:1.4!important}
    }`;
    document.head.appendChild(style);
  }

  function installMobileNavigation() {
    if (window.__fxcMobileNavigationInstalled) return;
    window.__fxcMobileNavigationInstalled = true;
    installMobileStyles();
    setHeaderHeight();
    window.addEventListener('resize',setHeaderHeight,{passive:true});
    let suppressClickUntil=0;

    function handle(event) {
      if (innerWidth>850) return;
      const toggle=event.target.closest('.menu-toggle');
      const trigger=event.target.closest('.main-nav .nav-trigger');
      if(!toggle&&!trigger) return;
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      suppressClickUntil=Date.now()+700;
      if(toggle){
        const nav=document.querySelector('.main-nav');
        const open=!(nav&&(nav.classList.contains('is-open')||nav.classList.contains('open')));
        if(open)setMenuOpen(true);else closeMenu();
        return;
      }
      const item=trigger.closest('.nav-item'),nav=trigger.closest('.main-nav');
      if(!item||!nav)return;
      const wasOpen=item.classList.contains('is-open')||item.classList.contains('open');
      nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other=>{if(other!==item)other.classList.remove('is-open','open')});
      nav.querySelectorAll('.nav-trigger').forEach(b=>b.setAttribute('aria-expanded','false'));
      item.classList.toggle('is-open',!wasOpen);item.classList.toggle('open',!wasOpen);
      trigger.setAttribute('aria-expanded',String(!wasOpen));
    }

    document.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')handle(e)},true);
    document.addEventListener('click',e=>{
      if(Date.now()<suppressClickUntil&&(e.target.closest('.menu-toggle')||e.target.closest('.main-nav .nav-trigger'))){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return;}
      if(innerWidth>850)return;
      const toggle=e.target.closest('.menu-toggle'),trigger=e.target.closest('.main-nav .nav-trigger');
      if(toggle||trigger){handle(e);return;}
      if(e.target.closest('.main-nav a'))closeMenu();
    },true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  }

  function ensureMarketActionModal() {
    if (document.getElementById('gocoiin-market-action-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'gocoiin-market-action-modal';
    modal.innerHTML = [
      '<div class="gocoiin-market-action-backdrop" data-close-market-modal></div>',
      '<div class="gocoiin-market-action-card" role="dialog" aria-modal="true" aria-labelledby="gocoiin-market-action-title">',
      '<button class="gocoiin-market-action-close" type="button" aria-label="Close" data-close-market-modal>×</button>',
      '<div class="gocoiin-market-action-kicker">GO COIIN</div>',
      '<h3 id="gocoiin-market-action-title">What would you like to do?</h3>',
      '<p>Choose an option to continue.</p>',
      '<div class="gocoiin-market-action-buttons">',
      '<a class="gocoiin-market-action-primary" href="https://gocoiin.com/trading/account-opening.html">Open New Account</a>',
      '<a class="gocoiin-market-action-secondary" href="' + LOGIN_URL + '">Login</a>',
      '</div></div>'
    ].join('');

    const style = document.createElement('style');
    style.id = 'gocoiin-market-action-modal-style';
    style.textContent = [
      '#gocoiin-market-action-modal{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;padding:22px}',
      '#gocoiin-market-action-modal.is-open{display:flex}',
      '.gocoiin-market-action-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.68);backdrop-filter:blur(5px)}',
      '.gocoiin-market-action-card{position:relative;width:min(430px,100%);padding:30px;border:1px solid rgba(0,168,255,.24);border-radius:20px;background:linear-gradient(145deg,#0b2034,#071725);box-shadow:0 30px 90px rgba(0,0,0,.5);text-align:center;color:#fff}',
      '.gocoiin-market-action-close{position:absolute;top:10px;right:10px;width:36px;height:36px;border:1px solid rgba(120,180,220,.18);border-radius:9px;background:#061421;color:#fff;font-size:22px;line-height:1;cursor:pointer}',
      '.gocoiin-market-action-kicker{margin-bottom:8px;color:#00a8ff;font-size:11px;font-weight:800;letter-spacing:2px}',
      '.gocoiin-market-action-card h3{margin:0;font-size:26px;letter-spacing:-.8px}',
      '.gocoiin-market-action-card p{margin:10px 0 22px;color:#8fa5ba;font-size:13px}',
      '.gocoiin-market-action-buttons{display:grid;gap:10px}',
      '.gocoiin-market-action-buttons a{display:flex;align-items:center;justify-content:center;min-height:50px;border-radius:9px;padding:0 18px;text-decoration:none;font-size:13px;font-weight:800}',
      '.gocoiin-market-action-primary{background:linear-gradient(135deg,#ff3154,#ff4766);color:#fff}',
      '.gocoiin-market-action-secondary{border:1px solid rgba(120,180,220,.42);background:#061421;color:#fff}',
      '.gocoiin-market-action-buttons a:focus-visible,.gocoiin-market-action-close:focus-visible{outline:2px solid #00a8ff;outline-offset:2px}'
    ].join('');
    document.head.appendChild(style);
    document.body.appendChild(modal);

    const close = () => modal.classList.remove('is-open');
    modal.querySelectorAll('[data-close-market-modal]').forEach(el => el.addEventListener('click', close));
    modal.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  }

  function openMarketActionModal() {
    ensureMarketActionModal();
    const modal = document.getElementById('gocoiin-market-action-modal');
    if (modal) {
      modal.classList.add('is-open');
      const close = modal.querySelector('.gocoiin-market-action-close');
      if (close) close.focus();
    }
  }

  function installChartLoginOverlay() {
    if (document.querySelector('.gocoiin-chart-login-overlay')) return;

    const heading = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,.eyebrow')).find(el =>
      /real-time market prices|real-time market overview|live market dashboard/i.test(clean(el.textContent))
    );
    if (!heading) return;

    const scope = heading.closest('section') || heading.parentElement;
    if (!scope) return;

    const selectors = [
      '.tradingview-widget-container','[class*="tradingview"]','.chart-container','[class*="chart-container"]','[id*="chart"]','[class*="chart"]','.widget-frame','.finlogix-container','iframe','canvas'
    ];
    let chart=null;
    for(const selector of selectors){
      const candidates=scope.querySelectorAll(selector);
      for(const candidate of candidates){
        const rect=candidate.getBoundingClientRect();
        if(rect.width>=300&&rect.height>=120){chart=candidate;break;}
      }
      if(chart)break;
    }
    if(!chart)return;
    const host=chart.parentElement;
    if(!host)return;
    if(getComputedStyle(host).position==='static')host.style.position='relative';

    const overlay=document.createElement('button');
    overlay.type='button';
    overlay.className='gocoiin-chart-login-overlay';
    overlay.setAttribute('aria-label','Open trading options');
    overlay.title='Open trading options';
    overlay.style.cssText='position:absolute;inset:0;z-index:2147483000;display:block;width:100%;height:100%;padding:0;margin:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;';
    overlay.addEventListener('click', openMarketActionModal);
    host.appendChild(overlay);
  }

  function installTickerActionHandlers() {
    if (window.__gocoiinTickerActionsInstalled) return;
    window.__gocoiinTickerActionsInstalled = true;

    const selector = 'tv-ticker-tape,.fx-live-ticker-wrap,.hero-ticker,.hero-ticker-fallback-track';
    const openFromEvent = event => {
      const node = event.target && event.target.closest ? event.target.closest(selector) : null;
      if (!node) return;
      if (event.target.closest && event.target.closest('a,button,input,select,textarea')) return;
      event.preventDefault();
      event.stopPropagation();
      openMarketActionModal();
    };

    document.addEventListener('click', openFromEvent, true);
    document.addEventListener('pointerup', event => {
      if (event.pointerType === 'mouse') return;
      openFromEvent(event);
    }, true);

    if (!document.getElementById('gocoiin-ticker-click-style')) {
      const style = document.createElement('style');
      style.id = 'gocoiin-ticker-click-style';
      style.textContent = 'tv-ticker-tape,.fx-live-ticker-wrap,.hero-ticker,.hero-ticker-fallback-track{cursor:pointer!important;touch-action:manipulation}';
      document.head.appendChild(style);
    }
  }
  function installFinlogixStripOverlay() {
    const install = () => {
      const strips = document.querySelectorAll('.fx-market-strip');
      let installed = false;

      strips.forEach(strip => {
        if (strip.querySelector('.gocoiin-market-strip-overlay')) {
          installed = true;
          return;
        }

        if (getComputedStyle(strip).position === 'static') {
          strip.style.position = 'relative';
        }

        const iframe = strip.querySelector('iframe');
        if (iframe) {
          iframe.style.pointerEvents = 'none';
        }

        const overlay = document.createElement('button');
        overlay.type = 'button';
        overlay.className = 'gocoiin-market-strip-overlay';
        overlay.setAttribute('aria-label', 'Open trading options');
        overlay.title = 'Open trading options';
        overlay.style.cssText = [
          'position:absolute',
          'inset:0',
          'z-index:2147483647',
          'display:block',
          'width:100%',
          'height:100%',
          'min-height:52px',
          'padding:0',
          'margin:0',
          'border:0',
          'outline:0',
          'background:transparent',
          'cursor:pointer',
          'touch-action:manipulation',
          'pointer-events:auto'
        ].join(';');

        const open = event => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          openMarketActionModal();
        };

        overlay.addEventListener('click', open, true);
        overlay.addEventListener('pointerup', open, true);
        overlay.addEventListener('touchend', open, {passive:false, capture:true});

        strip.appendChild(overlay);
        installed = true;
      });

      return installed;
    };

    if (install()) return;

    if (window.__gocoiinFinlogixStripObserver) return;
    window.__gocoiinFinlogixStripObserver = new MutationObserver(() => {
      if (install()) {
        window.__gocoiinFinlogixStripObserver.disconnect();
        window.__gocoiinFinlogixStripObserver = null;
      }
    });

    window.__gocoiinFinlogixStripObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    applyGoCoiinBrand();
    fixLinks();
    normalizeHeaderActions();
    installGlobalUtilityNav();
    installFinlogixWidgetShields();
    removeLegacyHomepageFooter();
    installHomepageFooterGuard();
    installMobileNavigation();
    neutralizePlaceholderSocials();
    ensureMarketActionModal();
    installChartLoginOverlay();
    installTickerActionHandlers();
    installFinlogixStripOverlay();
    setTimeout(() => { applyGoCoiinBrand(); fixLinks(); normalizeHeaderActions(); installGlobalUtilityNav(); removeLegacyHomepageFooter(); installHomepageFooterGuard(); neutralizePlaceholderSocials(); ensureMarketActionModal(); installChartLoginOverlay(); installTickerActionHandlers(); installFinlogixStripOverlay(); installFinlogixWidgetShields(); }, 250);
    setTimeout(installChartLoginOverlay, 1000);
    setTimeout(installChartLoginOverlay, 2500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
