(() => {
  'use strict';

  const path = window.location.pathname.toLowerCase();
  const nested = /\/(markets|trading|platforms|accounts|tools|company|legal|partnership)\//i.test(path);
  const isPartnership = /\/partnership(?:\/|$)/i.test(path);
  const prefix = nested ? '../' : './';
  const clean = value => (value || '').replace(/\s+/g, ' ').trim();
  const LOGIN_URL = 'https://fxcetrumrealmt5.tgsm.io/';
  const isHomepage = path === '/' || /\/index\.html$/i.test(path);

  function loadGlobalPremiumTheme() {
    const existing = document.getElementById('gocoiin-global-premium-theme');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'gocoiin-global-premium-theme';
    link.rel = 'stylesheet';
    link.href = '/premium-light.css?v=20260918-global-glossy4';
    document.head.appendChild(link);
  }

  loadGlobalPremiumTheme();

  function injectCriticalTheme() {
    if (document.getElementById('gocoiin-critical-theme')) return;
    const style = document.createElement('style');
    style.id = 'gocoiin-critical-theme';
    style.textContent = `

      html body .main-nav a[href$="tools/live-markets.html"],
      html body .main-nav a[href*="/tools/live-markets.html"]{display:none!important;visibility:hidden!important;width:0!important;min-width:0!important;padding:0!important;margin:0!important;overflow:hidden!important;}
      html body .site-header{position:sticky!important;top:0!important;z-index:5000!important;background:rgba(255,255,255,.96)!important;color:#17344c!important;box-shadow:0 8px 28px rgba(24,67,96,.10)!important;backdrop-filter:blur(18px) saturate(140%)!important;-webkit-backdrop-filter:blur(18px) saturate(140%)!important}
      html body .site-header .nav-trigger,html body .site-header .nav-link{color:#294761!important}
      html body .site-header .nav-trigger:hover,html body .site-header .nav-link:hover{color:#078fda!important}
      html body .site-header .dropdown{background:rgba(255,255,255,.985)!important;color:#24445d!important;border-color:#d6e5ee!important;box-shadow:0 20px 48px rgba(27,68,98,.16)!important}
      html body .site-header .dropdown a,html body .site-header .dropdown a span{color:#24445d!important;-webkit-text-fill-color:#24445d!important;opacity:1!important}
      html body .site-header .dropdown a small{color:#6d8598!important;-webkit-text-fill-color:#6d8598!important;opacity:1!important}
      html body .gocoiin-withdrawal-nav-link{color:#294761!important;-webkit-text-fill-color:#294761!important}
      html body .btn-login,html body .btn-outline{background:#fff!important;color:#17344c!important;border-color:#bdd3e1!important}
      @media(max-width:850px){
        html body .site-header .main-nav,
        html body .site-header .main-nav.is-open,
        html body .site-header .main-nav.open{
          position:absolute!important;top:100%!important;left:0!important;right:0!important;z-index:4999!important;
          display:block!important;visibility:visible!important;opacity:1!important;transform:none!important;
          max-height:calc(100vh - 74px)!important;overflow:auto!important;
          padding:10px 16px 20px!important;
          background:rgba(255,255,255,.985)!important;color:#17344c!important;
          border-top:1px solid #dce8ef!important;border-bottom:1px solid #dce8ef!important;
          box-shadow:0 22px 45px rgba(20,67,96,.15)!important;
          backdrop-filter:blur(18px) saturate(150%)!important;-webkit-backdrop-filter:blur(18px) saturate(150%)!important;
        }
        html body .site-header .main-nav:not(.is-open):not(.open){display:none!important}
        html body .site-header .main-nav .nav-item{border-bottom:1px solid #e3edf3!important}
        html body .site-header .main-nav .nav-trigger,
        html body .site-header .main-nav .nav-link{
          width:100%!important;height:auto!important;min-height:58px!important;padding:0 8px!important;
          display:flex!important;align-items:center!important;justify-content:space-between!important;
          color:#294761!important;background:transparent!important;
        }
        html body .site-header .main-nav .dropdown{
          position:static!important;width:auto!important;padding:0 0 8px!important;
          opacity:1!important;visibility:visible!important;transform:none!important;
          background:transparent!important;border:0!important;box-shadow:none!important;
        }
        html body .site-header .main-nav .dropdown a{
          color:#2a4a61!important;background:#f4faff!important;border-radius:9px!important;
          margin:4px 0!important;padding:11px 12px!important;
        }
        html body .site-header .main-nav .dropdown a span{color:#2a4a61!important}
        html body .site-header .main-nav .dropdown a small{color:#72889a!important}
      }
    `;
    document.head.appendChild(style);
  }

  injectCriticalTheme();

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
    'Standard':'accounts/standard.html','Premium':'accounts/premium.html','Professional':'accounts/professional.html','Economic Calendar':'tools/economic-calendar.html',
    'About Us':'company/about.html','Contact Us':'company/contact.html','Benefits':'company/benefits.html','GO COIIN Benefits':'company/benefits.html','Why GO COIIN':'company/benefits.html','Partnership':'partnership/index.html','Withdrawal':'trading/withdrawal.html'
  };
  const legal = {'Terms & Conditions':'legal/terms-and-conditions.html','Terms and Conditions':'legal/terms-and-conditions.html','Privacy Policy':'legal/privacy-policy.html','Risk Disclosure':'legal/risk-disclosure.html','AML Policy':'legal/aml-policy.html','Client Agreement':'legal/client-agreement.html'};
  const fragments = {accounts:'trading/account-types.html',conditions:'trading/trading-conditions.html',platforms:'trading/platforms.html',steps:'trading/how-to-start.html',calendar:'tools/economic-calendar.html',about:'company/about.html',contact:'company/contact.html',benefits:'company/benefits.html',partner:'partnership/index.html','open-account':'trading/account-opening.html'};

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

  function removeLiveMarketsFromNavigation() {
    document.querySelectorAll('.main-nav a').forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const label = clean(link.textContent).toLowerCase();
      if (label === 'live markets' || /(^|\/)tools\/live-markets\.html(?:$|[?#])/i.test(href)) {
        link.remove();
      }
    });
  }
  removeLiveMarketsFromNavigation();

  if (!window.__gocoiinLiveMarketsGuardInstalled) {
    window.__gocoiinLiveMarketsGuardInstalled = true;
    const navObserver = new MutationObserver(() => removeLiveMarketsFromNavigation());
    navObserver.observe(document.body, {childList:true, subtree:true});
  }

  function installGlobalUtilityNav() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    // Remove only standalone top-level Withdrawal links. Never touch the
    // Deposit/Withdrawal links inside Payment.
    Array.from(nav.children).forEach(child => {
      if (child.hasAttribute('data-gocoiin-payment-nav')) return;

      if (child.matches('a')) {
        const text = clean(child.textContent).toLowerCase();
        const href = (child.getAttribute('href') || '').toLowerCase();
        if (text === 'withdrawal' || /(?:^|\/)trading\/withdrawal\.html(?:$|[?#])/i.test(href)) child.remove();
        return;
      }

      if (child.matches('.nav-item') && !child.querySelector('.dropdown')) {
        const text = clean(child.textContent).toLowerCase();
        const href = (child.querySelector('a')?.getAttribute('href') || '').toLowerCase();
        if (text === 'withdrawal' || /(?:^|\/)trading\/withdrawal\.html(?:$|[?#])/i.test(href)) child.remove();
      }
    });

    let paymentItem = nav.querySelector('[data-gocoiin-payment-nav]');
    if (!paymentItem) {
      paymentItem = document.createElement('div');
      paymentItem.className = 'nav-item';
      paymentItem.setAttribute('data-gocoiin-payment-nav','true');
      paymentItem.innerHTML = [
        '<button type="button" class="nav-trigger" aria-expanded="false"><span>Payment</span><em>⌄</em></button>',
        '<div class="dropdown"></div>'
      ].join('');
      const partnership = Array.from(nav.children).find(el =>
        clean(el.textContent).toLowerCase() === 'partnership'
      );
      if (partnership) nav.insertBefore(paymentItem, partnership);
      else nav.appendChild(paymentItem);
    }

    const dropdown = paymentItem.querySelector('.dropdown');
    if (dropdown) {
      // Normalize the Payment menu to EXACTLY two entries.
      // This prevents duplicate Deposit items when the page HTML already
      // contains a Payment/Deposit entry and this global script runs again.
      const desired = [
        {
          key: 'deposit',
          href: prefix + 'trading/deposit.html',
          title: 'Deposit',
          desc: 'Bank transfer, QR &amp; UPI details'
        },
        {
          key: 'withdrawal',
          href: prefix + 'trading/withdrawal.html',
          title: 'Withdrawal',
          desc: 'Submit a withdrawal request'
        }
      ];

      const existing = Array.from(dropdown.querySelectorAll('a'));
      const byKey = new Map();

      existing.forEach(link => {
        const label = clean(link.textContent).toLowerCase();
        const href = (link.getAttribute('href') || '').toLowerCase();
        const key =
          label === 'deposit' || /(?:^|\/)trading\/deposit\.html(?:$|[?#])/i.test(href)
            ? 'deposit'
            : label === 'withdrawal' || /(?:^|\/)trading\/withdrawal\.html(?:$|[?#])/i.test(href)
              ? 'withdrawal'
              : null;

        if (!key) {
          link.remove();
          return;
        }

        if (byKey.has(key)) {
          link.remove(); // remove duplicate
          return;
        }

        byKey.set(key, link);
      });

      desired.forEach(item => {
        let link = byKey.get(item.key);
        if (!link) {
          link = document.createElement('a');
          dropdown.appendChild(link);
        }
        link.href = item.href;
        link.innerHTML = '<span>' + item.title + '</span><small>' + item.desc + '</small>';
      });

      // Put them in the correct order: Deposit, then Withdrawal.
      desired.forEach(item => dropdown.appendChild(byKey.get(item.key) || Array.from(dropdown.querySelectorAll('a')).find(a =>
        clean(a.textContent).toLowerCase() === item.key
      )));
    }

    // The Payment item is created dynamically, so give it a reliable desktop click handler too.
    if (!window.__gocoiinPaymentDesktopToggle) {
      window.__gocoiinPaymentDesktopToggle = true;
      document.addEventListener('click', function(event) {
        if (window.innerWidth <= 850) return; // mobile navigation has its own handler
        const trigger = event.target.closest('.main-nav [data-gocoiin-payment-nav] > .nav-trigger');
        if (!trigger) return;
        event.preventDefault();
        event.stopPropagation();
        const item = trigger.closest('[data-gocoiin-payment-nav]');
        const navRoot = trigger.closest('.main-nav');
        const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');
        navRoot.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => {
          if (other !== item) other.classList.remove('is-open','open');
        });
        item.classList.toggle('is-open', !wasOpen);
        item.classList.toggle('open', !wasOpen);
        trigger.setAttribute('aria-expanded', String(!wasOpen));
      }, true);
    }

    // Bind the Payment trigger directly on mobile. Page-specific click
    // handlers may differ, so this makes Payment independent of their scripts.
    const paymentTrigger = paymentItem.querySelector('.nav-trigger');
    if (paymentTrigger && !paymentTrigger.dataset.gocoiinMobileBound) {
      paymentTrigger.dataset.gocoiinMobileBound = 'true';
      paymentTrigger.addEventListener('click', function(event) {
        if (window.innerWidth > 850) return;
        event.preventDefault();
        event.stopPropagation();
        const item = paymentTrigger.closest('[data-gocoiin-payment-nav]');
        const root = paymentTrigger.closest('.main-nav');
        const opening = !(item.classList.contains('is-open') || item.classList.contains('open'));
        root.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => {
          if (other !== item) other.classList.remove('is-open','open');
        });
        root.querySelectorAll('.nav-trigger').forEach(btn => btn.setAttribute('aria-expanded','false'));
        item.classList.toggle('is-open', opening);
        item.classList.toggle('open', opening);
        paymentTrigger.setAttribute('aria-expanded', String(opening));
      });
    }

    nav.querySelectorAll('[data-gocoiin-admin-link]').forEach(link => link.remove());

    // Direct mobile listener for Payment. This intentionally bypasses any
    // page-specific navigation handlers so the submenu opens reliably.
    if (!window.__gocoiinPaymentMobileToggle) {
      window.__gocoiinPaymentMobileToggle = true;
      document.addEventListener('click', function(event) {
        if (window.innerWidth > 850) return;
        const trigger = event.target.closest('.main-nav [data-gocoiin-payment-nav] > .nav-trigger');
        if (!trigger) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const item = trigger.closest('[data-gocoiin-payment-nav]');
        const navRoot = trigger.closest('.main-nav');
        const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');
        navRoot.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => {
          if (other !== item) other.classList.remove('is-open','open');
        });
        navRoot.querySelectorAll('.nav-trigger').forEach(btn => btn.setAttribute('aria-expanded','false'));
        item.classList.toggle('is-open', !wasOpen);
        item.classList.toggle('open', !wasOpen);
        trigger.setAttribute('aria-expanded', String(!wasOpen));
      }, true);
    }

    if (!document.getElementById('gocoiin-payment-nav-style')) {
      const style = document.createElement('style');
      style.id = 'gocoiin-payment-nav-style';
      style.textContent = [
        '.main-nav [data-gocoiin-payment-nav]{position:relative!important;}',
        '.main-nav [data-gocoiin-payment-nav]>.nav-trigger{color:#294761!important;}', 
        '.main-nav [data-gocoiin-payment-nav]>.nav-trigger:hover{color:#078fda!important;}',
        '@media(min-width:851px){',
        '.main-nav [data-gocoiin-payment-nav]>.dropdown{display:none!important;position:absolute!important;top:calc(100% + 8px)!important;right:0!important;left:auto!important;min-width:230px!important;z-index:10000!important;}',
        '.main-nav [data-gocoiin-payment-nav]:hover>.dropdown,.main-nav [data-gocoiin-payment-nav].is-open>.dropdown,.main-nav [data-gocoiin-payment-nav].open>.dropdown{display:block!important;}',
        '}', 
        '@media(max-width:850px){',
        '.main-nav [data-gocoiin-payment-nav]>.nav-trigger{width:100%!important;min-height:58px!important;padding:0 8px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;color:#294761!important;}',
        '.main-nav [data-gocoiin-payment-nav]>.dropdown{display:none;}',
        '.main-nav [data-gocoiin-payment-nav].is-open>.dropdown{display:block;}',
        '}'
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

  function isLiveMarketChartSection(node) {
    const section = node.closest('section') || node.parentElement;
    if (!section) return false;
    return /real-time market prices|real-time market overview|live market dashboard/i.test(clean(section.textContent));
  }

  function installFinlogixWidgetShields() {
    // Intentionally disabled: running market tapes and Finlogix widgets remain directly interactive.
    document.querySelectorAll('.gocoiin-market-strip-overlay,.gocoiin-finlogix-shield').forEach(el => el.remove());
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

  function ensureMobileMenuToggle() {
    const nav = document.querySelector('.main-nav');
    const headerInner = document.querySelector('.site-header .header-inner');
    if (!nav || !headerInner) return null;

    let toggle = headerInner.querySelector('.menu-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'menu-toggle';
      toggle.setAttribute('aria-label','Open navigation');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-controls', nav.id || 'mainNavigation');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      const actions = headerInner.querySelector('.header-actions');
      if (actions) headerInner.insertBefore(toggle, actions);
      else headerInner.appendChild(toggle);
    } else if (!toggle.querySelector('span')) {
      toggle.innerHTML = '<span></span><span></span><span></span>';
    }
    return toggle;
  }

  function installMobileStyles() {
    if (document.getElementById('fxc-mobile-nav-final')) return;
    const style = document.createElement('style');
    style.id = 'fxc-mobile-nav-final';
    style.textContent = `@media(max-width:850px){
      .site-header{position:sticky!important;top:0!important;z-index:100000!important;overflow:visible!important}
      .header-inner{position:relative!important;z-index:100001!important}
      .menu-toggle{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:48px!important;height:48px!important;padding:0!important;position:relative!important;z-index:100002!important;overflow:visible!important}
      .menu-toggle span{display:block!important;visibility:visible!important;opacity:1!important;width:24px!important;height:3px!important;min-height:3px!important;max-height:3px!important;margin:0!important;padding:0!important;background:#17324a!important;border-radius:3px!important;flex:none!important}
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

    ensureMobileMenuToggle();
    installMobileStyles();
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight, { passive:true });

    let suppressClickUntil = 0;

    function handle(event) {
      if (window.innerWidth > 850) return;

      const toggle = event.target.closest('.menu-toggle');
      const trigger = event.target.closest('.main-nav .nav-trigger');

      if (!toggle && !trigger) return;

      // Payment has its own dedicated handler below in installGlobalUtilityNav().
      if (trigger && trigger.closest('[data-gocoiin-payment-nav]')) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Prevent the later synthetic click from toggling the menu a second time.
      suppressClickUntil = Date.now() + 900;

      if (toggle) {
        const nav = document.querySelector('.main-nav');
        const open = !(nav && (nav.classList.contains('is-open') || nav.classList.contains('open')));
        if (open) setMenuOpen(true);
        else closeMenu();
        return;
      }

      const item = trigger.closest('.nav-item');
      const nav = trigger.closest('.main-nav');
      if (!item || !nav) return;

      const wasOpen = item.classList.contains('is-open') || item.classList.contains('open');

      nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(other => {
        if (other !== item) other.classList.remove('is-open','open');
      });

      nav.querySelectorAll('.nav-trigger').forEach(btn => {
        btn.setAttribute('aria-expanded','false');
      });

      item.classList.toggle('is-open', !wasOpen);
      item.classList.toggle('open', !wasOpen);
      trigger.setAttribute('aria-expanded', String(!wasOpen));
    }

    // IMPORTANT: use pointerdown so mobile navigation opens on a normal tap,
    // not only after the finger is held/released.
    document.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      handle(event);
    }, true);

    document.addEventListener('click', event => {
      const menuTarget = event.target.closest('.menu-toggle,.main-nav .nav-trigger');

      if (Date.now() < suppressClickUntil && menuTarget) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      if (window.innerWidth > 850) return;

      const toggle = event.target.closest('.menu-toggle');
      const trigger = event.target.closest('.main-nav .nav-trigger');

      if (trigger && trigger.closest('[data-gocoiin-payment-nav]')) return;

      if (toggle || trigger) {
        handle(event);
        return;
      }

      if (event.target.closest('.main-nav a')) closeMenu();
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
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
    document.querySelectorAll('.gocoiin-chart-login-overlay').forEach(el => el.remove());
  }

  function installTickerActionHandlers() {
    // Intentionally disabled: running market tapes and Finlogix widgets remain directly interactive.
    document.querySelectorAll('.gocoiin-market-strip-overlay,.gocoiin-finlogix-shield').forEach(el => el.remove());
  }

  function installFinlogixStripOverlay() {
    // Intentionally disabled: running market tapes and Finlogix widgets remain directly interactive.
    document.querySelectorAll('.gocoiin-market-strip-overlay,.gocoiin-finlogix-shield').forEach(el => el.remove());
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
