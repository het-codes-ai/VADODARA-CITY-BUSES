
/* VMC DESKTOP-ONLY 4-SECOND INTRO */



/* VMC ULTRA CINEMATIC CONTROLLER */



const DB={routes:window.VMC_ROUTES||[],translations:window.VMC_TRANSLATIONS||{}};
const state={
  lang:localStorage.getItem("vmc-lang")||"en",
  mode:"fromto",
  selectedRoute:null,
  mapStart:-1,
  mapEnd:-1,
  chatHistoryKey:"vmc-nova-chat-history-v1"
};
const $=id=>document.getElementById(id);
const t=k=>DB.translations[state.lang]?.[k] ?? DB.translations.en?.[k] ?? k;
const routes=DB.routes;
const stops=[...new Set(routes.flatMap(r=>r.stops))];

function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function norm(s){
  return String(s??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"").trim();
}
function foldText(s){
  return String(s??"").toLocaleLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu,"").trim();
}
function stopText(s){
  return state.lang==="en" ? s : (DB.translations.stopNames?.[s]?.[state.lang]||s);
}
const aliases={
  station:"Station",railwaystation:"Station",
  kalaghoda:"Kalaghoda Circle",kalaghodacircle:"Kalaghoda Circle",
  ktstambh:"Kirti Stambh",ktstamb:"Kirti Stambh",kirtistambh:"Kirti Stambh",
  ayappaground:"Ayappa Ground / Samras Boys Hostel",ayyappaground:"Ayappa Ground / Samras Boys Hostel",
  samrasboyshostel:"Ayappa Ground / Samras Boys Hostel",
  fatehganj:"Fatehgunj",fatehgunj:"Fatehgunj",
  deluxe:"Delux",delux:"Delux",
  abhilasha:"Abhilasha Circle",
  chanakyapuri:"Chanakya Puri Circle",
  sama:"Dumad / Sama Village",
  samavillage:"Dumad / Sama Village",
  varni:"Harni",varnivillage:"Harni",
  lalbagh:"Lalbagh Bridge",
  policehq:"Gujarat Police Station of Vadodara"
};
function canonicalStop(value){
  const q=String(value||"").trim(), n=norm(q);
  if(!n)return "";
  for(const s of stops){if(norm(s)===n)return s;}
  const fn=foldText(q);
  for(const s of stops){
    const sn=DB.translations.stopNames?.[s];
    if(sn && Object.values(sn).some(v=>foldText(v)===fn))return s;
  }
  if(aliases[n] && stops.includes(aliases[n]))return aliases[n];
  let best={s:"",score:0};
  for(const s of stops){
    const score=similarity(q,s);
    if(score>best.score)best={s,score};
  }
  return best.score>=0.82?best.s:"";
}
function similarity(a,b){
  const x=norm(a),y=norm(b);
  const fx=foldText(a),fy=foldText(b);
  if(!fx||!fy)return 0;
  if(x&&y&&(x===y||x.includes(y)||y.includes(x)))return x===y?1:.94;
  if(fx===fy)return 1;
  if(fx.includes(fy)||fy.includes(fx))return .94;
  const xa=String(a).toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const ya=String(b).toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if(!xa.length||!ya.length)return 0;
  const lev=(p,q)=>{
    const d=Array.from({length:p.length+1},(_,i)=>i);
    for(let j=1;j<=q.length;j++){let prev=d[0];d[0]=j;for(let i=1;i<=p.length;i++){const old=d[i];d[i]=Math.min(d[i]+1,d[i-1]+1,prev+(p[i-1]===q[j-1]?0:1));prev=old;}}
    return d[p.length];
  };
  let matched=0;
  for(const token of xa){
    let best=0;
    for(const target of ya){
      if(token===target||token.startsWith(target)||target.startsWith(token))best=1;
      else if(Math.max(token.length,target.length)>=4)best=Math.max(best,1-lev(token,target)/Math.max(token.length,target.length));
    }
    matched+=best;
  }
  return matched/Math.max(1,xa.length);
}
function findStopIndex(route,value){
  const canonical=canonicalStop(value);
  if(!canonical)return -1;
  return route.stops.findIndex(s=>s===canonical);
}
function routeMatches(from,to){
  const a=canonicalStop(from),b=canonicalStop(to);
  if(!a||!b||a===b)return [];
  return routes.map(r=>{
    const ai=r.stops.indexOf(a),bi=r.stops.indexOf(b);
    return {r,ai,bi};
  }).filter(x=>x.ai>=0&&x.bi>=0);
}
function fareFor(km){return km<=3?5:5+Math.ceil((km-3)/1.5)*2;}

function renderText(){
  $("brand").textContent=t("brand");
  $("tag").textContent=t("tag");
  $("hero").textContent=t("hero");
  $("sub").textContent=t("sub");
  $("mFromTo").textContent=t("fromTo");
  $("mBus").textContent=t("busNo");
  $("mRoute").textContent=t("route");
  $("mNearby").textContent=t("nearby");
  $("available").textContent=t("available");
  $("fareTitle").textContent=t("fareTitle");
  $("distanceLabel").textContent=t("distance");
  $("fareLabel").textContent=t("fare");
  $("smart").textContent=t("smart");
  $("smartSub").textContent=t("smartSub");
  $("timelineCard").textContent=t("stopTimeline");
  $("timelineSub").textContent=t("timeline");
  $("fareCard").textContent=t("fareRules");
  $("fareRuleText").textContent=t("fareRule");
  $("fareRuleCard").textContent=t("fareRule");
  $("botLauncherText").textContent=t("ai");
  $("sendChat").textContent=t("send");
  $("chatInput").placeholder=t("chatPlaceholder");
  $("novaBusTitle").textContent="🚌 "+t("selectBus");
  $("novaBusBack").textContent=t("back");
  $("mapTitle").textContent="🗺️ "+t("mapTitle");
  $("mapSub").textContent=t("mapSub");
  $("mapFitBtn").textContent="⛶ "+t("fitRoute");
  $("mapLocateBtn").textContent="📍 "+t("myLocation");
  $("nearbyBtn").textContent="📍 "+t("nearbyStops");
  $("transit").textContent=t("transit");
  $("theme").setAttribute("aria-label",t("theme"));
  $("lang").setAttribute("aria-label",t("language"));
  $("lang").options[0].text="🌐 "+t("english");
  $("lang").options[1].text="🌐 "+t("gujarati");
  $("lang").options[2].text="🌐 "+t("hindi");
  document.documentElement.lang=state.lang;
  document.title=t("brand");
}
function renderInputs(){
  const area=$("searchArea");
  if(state.mode==="fromto"){
    area.innerHTML=`<div class="field"><input id="from" autocomplete="off" placeholder="${esc(t("from"))}"></div>
      <div class="field"><input id="to" autocomplete="off" placeholder="${esc(t("to"))}"></div>
      <button id="searchBtn" type="button" class="searchbtn">${esc(t("search"))}</button>`;
  }else if(state.mode==="bus"){
    area.innerHTML=`<div class="field" style="grid-column:1/-1"><input id="from" inputmode="text" autocomplete="off" placeholder="${esc(t("busPlaceholder"))}"></div>
      <button id="searchBtn" type="button" class="searchbtn">${esc(t("search"))}</button>`;
  }else if(state.mode==="route"){
    area.innerHTML=`<div class="field" style="grid-column:1/-1"><input id="from" autocomplete="off" placeholder="${esc(t("routePlaceholder"))}"></div>
      <button id="searchBtn" type="button" class="searchbtn">${esc(t("search"))}</button>`;
  }else{
    area.innerHTML=`<div class="field" style="grid-column:1/-1"><input id="from" autocomplete="off" placeholder="${esc(t("nearbyPlaceholder"))}"></div>
      <button id="searchBtn" type="button" class="searchbtn">${esc(t("search"))}</button>`;
  }
  bindSearch();
}
function hideSuggestions(){ $("suggestions").classList.add("hidden"); $("suggestions").innerHTML=""; }
function clearSearch(){
  if($("from"))$("from").value="";
  if($("to"))$("to").value="";
  hideSuggestions();
}
function setMode(mode){
  state.mode=mode;
  document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  clearSearch();
  renderInputs();
  if(mode==="nearby"){
    $("busList").innerHTML=`<div class="meta">${t("nearbyHint")}</div>`;
  }else{
    renderList(routes);
  }
}
function bindSearch(){
  const f=$("from"), to=$("to");
  [f,to].filter(Boolean).forEach(input=>{
    input.addEventListener("input",()=>showSuggestions(input));
    input.addEventListener("focus",()=>showSuggestions(input));
    input.addEventListener("keydown",e=>{
      if(e.key==="Enter"){e.preventDefault();hideSuggestions();performSearch();}
      if(e.key==="Escape")hideSuggestions();
    });
  });
  $("searchBtn").addEventListener("click",e=>{e.preventDefault();hideSuggestions();performSearch();});
}
function showSuggestions(input){
  const q=input.value.trim();
  if(!q){hideSuggestions();return;}
  const panel=$("suggestions");
  if(state.mode==="bus"){
    const list=routes.map(r=>({r,score:Math.max(similarity(q,r.number),similarity(q,`${r.number} ${r.from} ${r.to}`))}))
      .filter(x=>x.score>=.35 || norm(x.r.number).startsWith(norm(q)))
      .sort((a,b)=>{
        const ap=norm(a.r.number).startsWith(norm(q))?1:0, bp=norm(b.r.number).startsWith(norm(q))?1:0;
        return bp-ap || b.score-a.score;
      }).slice(0,8);
    if(!list.length){hideSuggestions();return;}
    panel.innerHTML=list.map(x=>`<button type="button" class="suggestion bus-suggestion" data-bus="${esc(x.r.number)}"><span class="suggestion-icon">🚌</span><span><b>${esc(t("busNo"))} ${esc(x.r.number)}</b><small>${esc(stopText(x.r.from))} → ${esc(stopText(x.r.to))} · ${x.r.stops.length} ${esc(t("stops"))}</small></span><span class="suggestion-arrow">›</span></button>`).join("");
    panel.classList.remove("hidden");
    panel.querySelectorAll("[data-bus]").forEach(btn=>btn.addEventListener("mousedown",e=>{
      e.preventDefault();
      input.value=btn.dataset.bus;
      hideSuggestions();
      input.focus({preventScroll:true});
    }));
    return;
  }
  const list=stops.map(s=>({s,score:Math.max(similarity(q,s),similarity(q,DB.translations.stopNames?.[s]?.[state.lang]||""))}))
    .filter(x=>x.score>=.35).sort((a,b)=>b.score-a.score).slice(0,7);
  if(!list.length){hideSuggestions();return;}
  panel.innerHTML=list.map(x=>`<button type="button" class="suggestion" data-stop="${esc(x.s)}"><span class="suggestion-icon">📍</span><span><b>${esc(stopText(x.s))}</b><small>${esc(t("stop"))}</small></span><span class="suggestion-arrow">›</span></button>`).join("");
  panel.classList.remove("hidden");
  panel.querySelectorAll("[data-stop]").forEach(btn=>btn.addEventListener("mousedown",e=>{
    e.preventDefault();
    input.value=stopText(btn.dataset.stop);
    input.dataset.canonical=btn.dataset.stop;
    hideSuggestions();
    input.focus({preventScroll:true});
  }));
}
function performSearch(){
  if(state.mode==="bus"){
    const q=norm($("from").value);
    if(!q){renderList(routes);return;}
    const matches=routes.filter(r=>norm(r.number)===q || norm(r.number).startsWith(q));
    renderList(matches);
    if(matches.length)selectRoute(matches[0].id,false,-1,-1);
    else showSearchMessage(t("noMatch"));
    focusResults();
    return;
  }
  if(state.mode==="route"){
    const raw=$("from").value.trim();
    if(!raw){toast(t("askRoute"));return;}
    const exactBus=routes.find(r=>norm(r.number)===norm(raw));
    if(exactBus){renderList([exactBus]);selectRoute(exactBus.id,false,-1,-1);focusResults();return;}
    const parts=splitRouteQuery(raw);
    let matches=[];
    if(parts){
      matches=routeMatches(parts[0],parts[1]);
      renderList(matches.map(x=>x.r));
      if(matches.length)selectRoute(matches[0].r.id,false,matches[0].ai,matches[0].bi);
      else showSearchMessage(`${t("noMatch")}<br>${esc(t("both"))}`);
    }else{
      const target=canonicalStop(raw);
      matches=target?routes.filter(r=>r.stops.includes(target)):[];
      renderList(matches);
      if(matches.length)selectRoute(matches[0].id,false,-1,-1);
      else showSearchMessage(t("noMatch"));
    }
    focusResults();
    return;
  }
  if(state.mode==="nearby"){
    const raw=$("from").value.trim();
    if(raw){
      const target=canonicalStop(raw);
      if(!target){showSearchMessage(t("noMatch"));return;}
      const rs=routes.filter(r=>r.stops.includes(target));
      renderList(rs);
      if(rs.length){
        const r=rs[0],i=r.stops.indexOf(target);
        selectRoute(r.id,false,i,i);
        focusResults();
      }else showSearchMessage(t("noMatch"));
    }else{
      findNearbyStops();
    }
    return;
  }
  const from=$("from").value.trim(),to=$("to").value.trim();
  if(!from||!to){toast(t("bothRequired"));return;}
  const matches=routeMatches(from,to);
  renderList(matches.map(x=>x.r));
  if(matches.length){
    selectRoute(matches[0].r.id,false,matches[0].ai,matches[0].bi);
    focusResults();
  }else{
    showSearchMessage(`${t("noMatch")}<br>${t("both")}`);
  }
}
function splitRouteQuery(raw){
  const m=String(raw).match(/^(.+?)\s*(?:->|→|\bto\b|\bvia\b|થી|સુધી|से|तक)\s*(.+)$/i);
  return m?[m[1].trim(),m[2].trim()]:null;
}
function showSearchMessage(html){
  $("timeline").innerHTML=`<div class="meta">${html}</div>`;
}
function focusResults(){
  const routeCard=$("timeline")?.closest(".card");
  const fareCard=$("fareTitle")?.closest(".card");
  [routeCard,fareCard].forEach(c=>c?.classList.add("result-focus"));
  $("mapCard")?.classList.add("result-focus");
  routeCard?.scrollIntoView({behavior:"smooth",block:"nearest"});
}
let busFocusRaf=0;
function updateBusFocus(){
  const box=$("busList"); if(!box)return;
  const cards=[...box.querySelectorAll(".bus")]; if(!cards.length)return;
  const br=box.getBoundingClientRect();
  const center=br.top+br.height/2;

  let best=null,bestD=Infinity;
  cards.forEach(card=>{
    const r=card.getBoundingClientRect();
    const visible=r.bottom>br.top && r.top<br.bottom;
    if(!visible)return;
    const d=Math.abs((r.top+r.height/2)-center);
    if(d<bestD){bestD=d;best=card;}
  });

  // Edge-safe fallback: when scrolling reaches the top/bottom, explicitly
  // focus the first/last visible card rather than leaving the old card selected.
  if(cards.length){
    const atTop=box.scrollTop <= 4;
    const atBottom=(box.scrollTop + box.clientHeight) >= (box.scrollHeight - 4);
    if(atTop) best=cards[0];
    if(atBottom) best=cards[cards.length-1];
  }

  cards.forEach(c=>c.classList.toggle("focus",c===best));
  if(best){
    const route=routes.find(r=>r.id===best.dataset.route);
    if(route)renderBusQuickInfo(route);
  }
}
function scheduleBusFocus(){
  cancelAnimationFrame(busFocusRaf);
  busFocusRaf=requestAnimationFrame(updateBusFocus);
}
function bindBusFocus(){
  const box=$("busList"); if(!box||box._vmcFocusBound)return;
  box._vmcFocusBound=true;
  box.addEventListener("scroll",scheduleBusFocus,{passive:true});
  box.addEventListener("touchend",()=>setTimeout(scheduleBusFocus,80),{passive:true});
  window.addEventListener("resize",scheduleBusFocus,{passive:true});
  setTimeout(scheduleBusFocus,80);
}
function renderList(list){
  $("busList").innerHTML=list.length?list.map(r=>`
    <article class="bus" data-route="${esc(r.id)}">
      <div class="bushead">
        <div class="num">${esc(r.number)}</div>
        <div><h4>${esc(stopText(r.from))} → ${esc(stopText(r.to))}</h4>
        <div class="meta">${r.stops.length} ${esc(t("stops"))}${Array.isArray(r.distanceKm)?` · ${r.distanceKm.at(-1)} km`:""}</div></div>
        <button class="view" type="button" data-route="${esc(r.id)}">${esc(t("view"))}</button>
      </div>
    </article>`).join(""):`<div class="meta">${esc(t("noMatch"))}</div>`;
  $("busList").querySelectorAll("[data-route]").forEach(b=>b.addEventListener("click",()=>selectRoute(b.dataset.route,true,-1,-1)));
  bindBusFocus();
  scheduleBusFocus();
}
function selectRoute(id,scroll=true,ai=-1,bi=-1){
  const route=routes.find(r=>r.id===id);
  if(!route)return;
  state.selectedRoute=route;
  state.mapStart=ai;
  state.mapEnd=bi;
  renderTimeline();
  populateFare(ai,bi);
  window.vmcRenderMap?.();
  if(scroll)document.getElementById("mapCard")?.scrollIntoView({behavior:"smooth",block:"start"});
}
function renderTimeline(){
  const r=state.selectedRoute;if(!r)return;
  $("routeTitle").textContent=`${t("timeline")} · ${r.number}`;
  $("timeline").innerHTML=r.stops.map((s,i)=>`
    <div class="stop ${state.mapStart>=0&&state.mapEnd>=0&&i>=Math.min(state.mapStart,state.mapEnd)&&i<=Math.max(state.mapStart,state.mapEnd)?"selected-stop":""}">
      <span class="dot"></span><div><b>${esc(stopText(s))}</b>
      <small>${Array.isArray(r.distanceKm)&&r.distanceKm[i]!=null?`${r.distanceKm[i].toFixed(2)} km`:i===0?t("starting"):""}</small></div>
    </div>`).join("");
}
function populateFare(ai=-1,bi=-1){
  const r=state.selectedRoute;if(!r)return;
  $("fareFrom").innerHTML=`<option value="">${esc(t("from"))}</option>`+r.stops.map((s,i)=>`<option value="${i}">${esc(stopText(s))}</option>`).join("");
  $("fareTo").innerHTML=`<option value="">${esc(t("to"))}</option>`+r.stops.map((s,i)=>`<option value="${i}">${esc(stopText(s))}</option>`).join("");
  if(ai>=0)$("fareFrom").value=String(ai);
  if(bi>=0)$("fareTo").value=String(bi);
  updateFare();
}
function updateFare(){
  const r=state.selectedRoute,a=$("fareFrom").value,b=$("fareTo").value;
  if(!r||!Array.isArray(r.distanceKm)||a===""||b===""||a===b){
    $("distance").textContent="—";$("fare").textContent="—";return;
  }
  const km=Math.abs(Number(r.distanceKm[+b])-Number(r.distanceKm[+a]));
  if(!Number.isFinite(km)){$("distance").textContent="—";$("fare").textContent="—";return;}
  $("distance").textContent=`${km.toFixed(2)} km`;
  $("fare").textContent=`₹${fareFor(km)}`;
}
$("fareFrom").addEventListener("change",updateFare);
$("fareTo").addEventListener("change",updateFare);

function nearestStops(lat,lon,limit=5){
  const byStop=new Map();
  for(const r of routes){
    r.stops.forEach((s,i)=>{
      const c=r.coordinates?.[i];if(!c)return;
      const key=norm(s);
      const latKm=(c[0]-lat)*111.32;
      const lonKm=(c[1]-lon)*111.32*Math.cos(lat*Math.PI/180);
      const d=Math.sqrt(latKm*latKm+lonKm*lonKm);
      const old=byStop.get(key);
      if(!old||d<old.d)byStop.set(key,{s,c,d});
    });
  }
  return [...byStop.values()].sort((a,b)=>a.d-b.d).slice(0,limit);
}
function renderNearby(list){
  $("nearbyResults").innerHTML=list.length?list.map((x,i)=>`
    <button type="button" class="nearby-item" data-stop="${esc(x.s)}">
      <span>${i+1}</span><b>${esc(stopText(x.s))}</b><small>${x.d.toFixed(1)} km</small>
    </button>`).join(""):`<div class="meta">${esc(t("noNearby"))}</div>`;
  $("nearbyResults").querySelectorAll("[data-stop]").forEach(btn=>btn.addEventListener("click",()=>{
    const stop=btn.dataset.stop;
    const rs=routes.filter(r=>r.stops.includes(stop));
    renderList(rs);
    if(rs.length){
      const r=rs[0],i=r.stops.indexOf(stop);
      selectRoute(r.id,false,i,i);focusResults();
    }
  }));
}
function findNearbyStops(){
  const results=$("nearbyResults");
  results.innerHTML=`<div class="meta">${esc(t("findingLocation"))}</div>`;
  if(!navigator.geolocation){
    results.innerHTML=`<div class="meta">${esc(t("locationUnavailable"))}</div>`;return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const list=nearestStops(pos.coords.latitude,pos.coords.longitude,5);
    renderNearby(list);
    if(list.length)$("mapStatus").textContent=`${t("nearestStop")}: ${stopText(list[0].s)}`;
  },()=>{
    results.innerHTML=`<div class="meta">${esc(t("locationDenied"))}</div><button type="button" class="secondary-btn" id="retryLocation">${esc(t("retryLocation"))}</button>`;
    $("retryLocation").onclick=findNearbyStops;
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
}

function renderNovaOptions(){
  $("novaOptions").innerHTML=[
    ["bus","🚌 "+t("busNo")],["stop","📍 "+t("stop")],["route","🛣️ "+t("routeOption")],["fare","💰 "+t("fareOption")],["settings","⚙️ "+t("settings")]
  ].map(([k,label])=>`<button type="button" data-nova="${k}">${esc(label)}</button>`).join("");
  $("novaOptions").querySelectorAll("[data-nova]").forEach(b=>b.onclick=()=>novaChoice(b.dataset.nova));
}
function novaChoice(kind){
  if(kind==="bus"){openBusScreen();return;}
  if(kind==="stop"){addBot(t("askStop"));return;}
  if(kind==="route"){addBot(t("askRoute"));return;}
  if(kind==="fare"){addBot(t("askFare"));return;}
  addBot(t("askSettings"),[
    {label:t("theme"),fn:toggleTheme},
    {label:t("language"),fn:()=>toast(t("languageHelp"))}
  ]);
}
function openBusScreen(){
  $("novaOptions").style.display="none";
  $("novaBusScreen").classList.add("active");
  $("novaBusGrid").innerHTML=routes.map(r=>`<button type="button" data-bus="${esc(r.number)}">${esc(t("busNo"))} ${esc(r.number)}</button>`).join("");
  $("novaBusGrid").querySelectorAll("[data-bus]").forEach(b=>b.onclick=()=>showBusInNova(b.dataset.bu