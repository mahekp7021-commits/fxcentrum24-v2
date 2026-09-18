document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menu && nav) {
    menu.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }
  document.querySelectorAll(".nav-item > button").forEach(button => {
    button.addEventListener("click", event => {
      if (window.innerWidth <= 820) {
        event.preventDefault();
        const item = button.parentElement;
        document.querySelectorAll(".nav-item.open").forEach(openItem => {
          if (openItem !== item) openItem.classList.remove("open");
        });
        item.classList.toggle("open");
      }
    });
  });
  document.querySelectorAll(".main-nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        nav?.classList.remove("open");
        menu?.setAttribute("aria-expanded", "false");
      }
    });
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      nav?.classList.remove("open");
      menu?.setAttribute("aria-expanded", "false");
      document.querySelectorAll(".nav-item.open").forEach(item => item.classList.remove("open"));
    }
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo) {
    heroVideo.muted = true;
    const playVideo = () => {
      const promise = heroVideo.play();
      if (promise !== undefined) promise.catch(() => console.log("Hero video autoplay was blocked."));
    };
    playVideo();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) playVideo(); });
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.querySelector(".next-section-placeholder");
  if (!placeholder || document.querySelector(".fx-market-section")) return;
  try {
    const cssId = "fx-market-overview-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "./sections/market-overview.css?v=20260918-live-table";
      document.head.appendChild(link);
    }
    const response = await fetch("./sections/market-overview.html", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Market section HTTP ${response.status}`);
    const markup = await response.text();
    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();
    initFxMarketOverview();
  } catch (error) {
    console.error("GO COIIN market section failed to load:", error);
  }
});

function initFxMarketOverview() {
  const section = document.querySelector(".fx-market-section");
  const rowsHost = document.getElementById("fxMarketRows");
  if (!section || !rowsHost || section.dataset.initialized === "true") return;
  section.dataset.initialized = "true";

  const cryptoMarkets = [
    ["BTCUSDT","BTC","Bitcoin"],
    ["SOLUSDT","SOL","Solana"],
    ["ETHUSDT","ETH","Ethereum"],
    ["BNBUSDT","BNB","BNB"],
    ["DOGEUSDT","DOG","Dogecoin"],
    ["NEARUSDT","NEA","NEAR Protocol"],
    ["UNIUSDT","UNI","Uniswap"],
    ["XRPUSDT","XRP","XRP"],
    ["ARBUSDT","ARB","Arbitrum"],
    ["SUIUSDT","SUI","Sui"],
    ["ADAUSDT","ADA","Cardano"],
    ["LINKUSDT","LIN","Chainlink"],
    ["PEPEUSDT","PEP","Pepe"],
    ["AVAXUSDT","AVA","Avalanche"],
    ["AAVEUSDT","AAV","Aave"],
    ["TRXUSDT","TRX","TRON"],
    ["BCHUSDT","BCH","Bitcoin Cash"],
    ["LTCUSDT","LTC","Litecoin"],
    ["APTUSDT","APT","Aptos"],
    ["FETUSDT","FET","Fetch.ai"],
    ["DOTUSDT","DOT","Polkadot"],
    ["FILUSDT","FIL","Filecoin"],
    ["INJUSDT","INJ","Injective"],
    ["OPUSDT","OP","Optimism"],
    ["SANDUSDT","SAN","The Sandbox"],
    ["POLUSDT","POL","Polygon"],
    ["GRTUSDT","GRT","The Graph"],
    ["IMXUSDT","IMX","Immutable X"],
    ["MKRUSDT","MKR","Maker"],
    ["TONUSDT","TON","Toncoin"],
    ["ATOMUSDT","ATO","Cosmos"],
    ["ALGOUSDT","ALG","Algorand"],
    ["XLMUSDT","XLM","Stellar"],
    ["HBARUSDT","HBA","Hedera"],
    ["ETCUSDT","ETC","Ethereum Classic"],
    ["ICPUSDT","ICP","Internet Computer"],
    ["SEIUSDT","SEI","Sei"],
    ["TIAUSDT","TIA","Celestia"],
    ["SHIBUSDT","SHI","Shiba Inu"]
  ];

  const number = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    if (n >= 1000) return n.toLocaleString("en-US",{maximumFractionDigits:2});
    if (n >= 1) return n.toLocaleString("en-US",{maximumFractionDigits:4});
    return n.toLocaleString("en-US",{maximumFractionDigits:8});
  };
  const volume = value => {
    const n=Number(value);
    if(!Number.isFinite(n)) return "—";
    if(n>=1e9) return (n/1e9).toFixed(2)+"B";
    if(n>=1e6) return (n/1e6).toFixed(2)+"M";
    if(n>=1e3) return (n/1e3).toFixed(2)+"K";
    return n.toFixed(2);
  };
  const iconColors = ["#ff9d19","#8f43f5","#617fe9","#ebb21a","#cdb12b","#45a7ee","#7f4ee9","#3577ba","#6b61df","#58a6ed"];

  let marketData = [];
  let activeFilter = "all";
  let search = "";

  const renderFeatured = gold => {
    const featured = section.querySelectorAll(".fx-featured-card");
    featured.forEach(card=>{
      const symbol=card.dataset.symbol;
      let d = marketData.find(x=>x.symbol===symbol);
      if(symbol==="XAUUSD") d=gold;
      if(!d) return;
      const price=card.querySelector(".price");
      const change=card.querySelector(".change");
      price.textContent=number(d.price);
      change.textContent=(d.change==null?"—":(d.change>=0?"+":"")+Number(d.change).toFixed(2)+"%");
      change.classList.toggle("negative",Number(d.change)<0);
    });
  };

  const renderRows = gold => {
    const all = [...marketData];
    const goldRow = gold ? [{symbol:"XAUUSD",code:"XAU",name:"Gold",price:gold.price,change:gold.change,high:null,low:null,volume:null,isGold:true}] : [];
    let filtered=gold ? (all.length ? [all[0],...goldRow,...all.slice(1)] : goldRow) : all;
    if(activeFilter==="gainers") filtered=filtered.filter(x=>Number(x.change)>0);
    if(activeFilter==="losers") filtered=filtered.filter(x=>Number(x.change)<0);
    if(search) {
      const q=search.toLowerCase();
      filtered=filtered.filter(x=>String(x.code+" "+x.symbol+" "+x.name).toLowerCase().includes(q));
    }

    rowsHost.innerHTML=filtered.map((d,i)=>{
      const change=Number(d.change);
      const cls=Number.isFinite(change)?(change>=0?"fx-positive":"fx-negative"):"";
      return `<tr data-change="${Number.isFinite(change)?change:0}">
        <td>${i+1}</td>
        <td><div class="fx-pair"><span class="fx-row-icon" style="background:${iconColors[i%iconColors.length]}">${d.code}</span><span><strong>${d.code}/USDT</strong><small>${d.name}</small></span></div></td>
        <td class="fx-price">${number(d.price)}</td>
        <td class="${cls}">${Number.isFinite(change)?((change>=0?"+":"")+change.toFixed(2)+"%"):"—"}</td>
        <td>${number(d.high)}</td>
        <td>${number(d.low)}</td>
        <td>${volume(d.volume)}</td>
        <td><button class="fx-trade-btn" type="button" data-trade-symbol="${d.symbol}">Trade</button></td>
      </tr>`;
    }).join("") || '<tr><td colspan="8" class="fx-loading-row">No markets matched your search.</td></tr>';

    rowsHost.querySelectorAll("[data-trade-symbol]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        window.location.href="https://fxcetrumrealmt5.tgsm.io/";
      });
    });
  };

  const fetchCrypto = async () => {
    const symbols=cryptoMarkets.map(x=>x[0]);
    const url="https://api.binance.com/api/v3/ticker/24hr?symbols="+encodeURIComponent(JSON.stringify(symbols));
    const response=await fetch(url,{cache:"no-store"});
    if(!response.ok) throw new Error("Binance HTTP "+response.status);
    const data=await response.json();
    const map=new Map(data.map(x=>[x.symbol,x]));
    marketData=cryptoMarkets.filter(x=>map.has(x[0])).map((x,idx)=>{
      const d=map.get(x[0]);
      return {symbol:x[0],code:x[1],name:x[2],price:Number(d.lastPrice),change:Number(d.priceChangePercent),high:Number(d.highPrice),low:Number(d.lowPrice),volume:Number(d.quoteVolume),isGold:false};
    });
  };

  const fetchGold = async () => {
    try {
      const response=await fetch("https://xaus.com/api/v1/spot",{cache:"no-store"});
      if(!response.ok) throw new Error("XAUS HTTP "+response.status);
      const d=await response.json();
      return {symbol:"XAUUSD",code:"XAU",name:"Gold",price:Number(d.spot_usd_oz ?? d.xau?.price),change:null,high:null,low:null,volume:null,isGold:true};
    } catch(error) {
      console.warn("XAU feed unavailable",error);
      return null;
    }
  };

  const update = async () => {
    try {
      await Promise.all([fetchCrypto(), fetchGold().then(g=>{ update.gold=g; })]);
      renderFeatured(update.gold);
      renderRows(update.gold);
      const count=marketData.length+(update.gold?1:0);
      const countNode=document.getElementById("fxPairCount");
      if(countNode) countNode.textContent=count+" pairs";
      const updated=document.getElementById("fxUpdatedAt");
      if(updated) updated.textContent="Updated "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    } catch(error) {
      console.error("Live market feed failed",error);
      if(!marketData.length) rowsHost.innerHTML='<tr><td colspan="8" class="fx-loading-row">Live market data is temporarily unavailable. Please try again shortly.</td></tr>';
    }
  };
  update.gold=null;

  section.querySelectorAll(".fx-market-tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      activeFilter=tab.dataset.filter||"all";
      section.querySelectorAll(".fx-market-tab").forEach(t=>t.classList.toggle("is-active",t===tab));
      renderRows(update.gold);
    });
  });
  const searchInput=document.getElementById("fxMarketSearch");
  searchInput?.addEventListener("input",()=>{search=searchInput.value.trim();renderRows(update.gold);});
  update();
  window.setInterval(update,30000);
}

/* =========================================================
   FXCENTRUM24 — SECTION 04: ACCOUNT TYPES + PARTNERSHIP
   Loaded only after the global market categories are present.
   ========================================================= */
(() => {
  const loadAccountsSection = async () => {
    if (document.querySelector(".fx-accounts-section")) return true;
    const marketCategories = document.querySelector(".market-categories");
    if (!marketCategories) return false;
    try {
      const cssId = "fx-accounts-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "./sections/accounts.css";
        document.head.appendChild(link);
      }
      const response = await fetch("./sections/accounts.html", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Accounts section HTTP ${response.status}`);
      const markup = await response.text();
      marketCategories.insertAdjacentHTML("afterend", markup);
      return true;
    } catch (error) {
      console.error("FXCentrum24 accounts section failed to load:", error);
      return false;
    }
  };
  const start = async () => {
    if (await loadAccountsSection()) return;
    const observer = new MutationObserver(async () => {
      if (await loadAccountsSection()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
