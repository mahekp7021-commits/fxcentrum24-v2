(() => {
  'use strict';
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true });
    else fn();
  }
  function clean(v) { return String(v || '').replace(/\s+/g,' ').trim(); }
  function relativeRootPath(target) {
    const path = window.location.pathname.replace(/^\/+/, '');
    const depth = path ? path.split('/').length - 1 : 0;
    return '../'.repeat(Math.max(0, depth)) + target;
  }
  function ensureStyles() {
    if (document.getElementById('gocoiin-mobile-nav-hotfix-style')) return;
    const style = document.createElement('style');
    style.id = 'gocoiin-mobile-nav-hotfix-style';
    style.textContent = '@media (max-width:850px){
      html body .site-header .menu-toggle{display:flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:2147483000!important;flex:0 0 48px!important;width:48px!important;height:48px!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;gap:5px!important;margin-left:auto!important;cursor:pointer!important;pointer-events:auto!important}
      html body .site-header .menu-toggle span{display:block!important;visibility:visible!important;opacity:1!important;width:24px!important;height:3px!important;min-height:3px!important;max-height:3px!important;margin:0!important;padding:0!important;background:#17324a!important;border-radius:3px!important}
      html body .site-header .main-nav{position:fixed!important;top:var(--fxc-header-height,74px)!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:calc(100dvh - var(--fxc-header-height,74px))!important;max-height:calc(100dvh - var(--fxc-header-height,74px))!important;overflow-x:hidden!important;overflow-y:auto!important;z-index:2147482000!important;margin:0!important;pointer-events:none!important}
      html body .site-header .main-nav.is-open,html body .site-header .main-nav.open{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
      html body .site-header .main-nav .dropdown{display:none!important;position:static!important;width:100%!important;max-width:none!important;opacity:1!important;visibility:visible!important;transform:none!important;pointer-events:auto!important}
      html body .site-header .main-nav .nav-item.is-open>.dropdown,html body .site-header .main-nav .nav-item.open>.dropdown{display:block!important}
    }';
    document.head.appendChild(style);
  }
  function ensurePayment(nav) {
    nav.querySelectorAll('a').forEach(link => {
      const label=clean(link.textContent).toLowerCase();
      const href=(link.getAttribute('href')||'').toLowerCase();
      if(label==='live markets'||/tools\/live-markets\.html/.test(href)) link.remove();
    });
    let item=nav.querySelector('[data-gocoiin-payment-nav]');
    if(!item){
      item=document.createElement('div'); item.className='nav-item'; item.setAttribute('data-gocoiin-payment-nav','true');
      item.innerHTML='<button type="button" class="nav-trigger" aria-expanded="false"><span>Payment</span><em>⌄</em></button><div class="dropdown"></div>';
      const partnership=[...nav.children].find(el=>clean(el.textContent).toLowerCase()==='partnership');
      if(partnership) nav.insertBefore(item,partnership); else nav.appendChild(item);
    }
    const dd=item.querySelector('.dropdown'); if(!dd) return;
    dd.innerHTML='<a href="'+relativeRootPath('trading/deposit.html')+'"><span>Deposit</span><small>Bank transfer, QR &amp; UPI details</small></a><a href="'+relativeRootPath('trading/withdrawal.html')+'"><span>Withdrawal</span><small>Submit a withdrawal request</small></a>';
    const trig=item.querySelector('.nav-trigger');
    if(trig && !trig.dataset.gocoiinHotfixBound){
      trig.dataset.gocoiinHotfixBound='true';
      trig.addEventListener('click',e=>{
        if(innerWidth>850)return;
        e.preventDefault();e.stopPropagation();
        const open=!(item.classList.contains('is-open')||item.classList.contains('open'));
        nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(x=>{if(x!==item)x.classList.remove('is-open','open');});
        nav.querySelectorAll('.nav-trigger').forEach(x=>x.setAttribute('aria-expanded','false'));
        item.classList.toggle('is-open',open);item.classList.toggle('open',open);trig.setAttribute('aria-expanded',String(open));
      });
    }
  }
  function setup(){
    ensureStyles();
    const header=document.querySelector('.site-header'); const nav=header&&header.querySelector('.main-nav'); if(!nav)return;
    const inner=header.querySelector('.header-inner')||header;
    let toggle=inner.querySelector('.menu-toggle');
    if(!toggle){
      toggle=document.createElement('button'); toggle.type='button'; toggle.className='menu-toggle'; toggle.setAttribute('aria-label','Open navigation'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-controls',nav.id||'mainNavigation'); toggle.innerHTML='<span></span><span></span><span></span>';
      const actions=inner.querySelector('.header-actions'); if(actions) inner.insertBefore(toggle,actions); else inner.appendChild(toggle);
    }
    if(!toggle.dataset.gocoiinHotfixBound){
      toggle.dataset.gocoiinHotfixBound='true';
      toggle.addEventListener('click',e=>{
        if(innerWidth>850)return; e.preventDefault();e.stopPropagation();
        const open=!(nav.classList.contains('is-open')||nav.classList.contains('open'));
        nav.classList.toggle('is-open',open);nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.body.classList.toggle('menu-open',open);
        if(open)document.body.style.overflow='hidden'; else document.body.style.removeProperty('overflow');
      });
    }
    nav.querySelectorAll('.nav-trigger').forEach(trigger=>{
      if(trigger.closest('[data-gocoiin-payment-nav]')||trigger.dataset.gocoiinHotfixBound)return;
      trigger.dataset.gocoiinHotfixBound='true';
      trigger.addEventListener('click',e=>{
        if(innerWidth>850)return;e.preventDefault();e.stopPropagation();
        const item=trigger.closest('.nav-item');if(!item)return;
        const open=!(item.classList.contains('is-open')||item.classList.contains('open'));
        nav.querySelectorAll('.nav-item.is-open,.nav-item.open').forEach(x=>{if(x!==item)x.classList.remove('is-open','open');});
        nav.querySelectorAll('.nav-trigger').forEach(x=>x.setAttribute('aria-expanded','false'));
        item.classList.toggle('is-open',open);item.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));
      });
    });
    ensurePayment(nav);
  }
  ready(setup);
})();