document.addEventListener("DOMContentLoaded",()=> {
  const menu=document.querySelector(".menu-toggle"), nav=document.querySelector(".main-nav");
  menu?.addEventListener("click",()=>nav.classList.toggle("open"));
  document.querySelectorAll(".nav-item>button").forEach(btn=>{
    btn.addEventListener("click",e=>{
      if(window.innerWidth<=820){
        e.preventDefault();
        btn.parentElement.classList.toggle("open");
      }
    });
  });

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add("visible")});
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  if(window.TradingView){
    new TradingView.widget({
      autosize:true,
      symbol:"FX:EURUSD",
      interval:"15",
      timezone:"Asia/Kolkata",
      theme:"dark",
      style:"1",
      locale:"en",
      enable_publishing:false,
      hide_top_toolbar:false,
      hide_legend:false,
      save_image:false,
      hide_volume:false,
      allow_symbol_change:true,
      container_id:"tradingview_chart"
    });
  }

  // Small visual price motion for the table/ticker. The authoritative live chart above
  // is supplied by TradingView.
  const rows=[...document.querySelectorAll(".market-row")];
  setInterval(()=>{
    rows.forEach(row=>{
      const cells=row.querySelectorAll("span");
      if(!cells.length) return;
      cells.forEach((cell,i)=>{
        if(i<2){
          const n=parseFloat(cell.textContent.replace(/,/g,""));
          if(Number.isFinite(n)){
            const delta=(Math.random()-.5)*n*.00008;
            cell.textContent=(n+delta).toLocaleString(undefined,{maximumFractionDigits: n>100 ? 3 : 5});
          }
        }
      });
    });
  },1800);
});