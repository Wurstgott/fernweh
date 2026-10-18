(()=>{
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DAY=864e5,now=()=>Date.now();
const KEY="wertegeruest-v1";
let S={read:{},saved:{},kern:[],leit:{},proben:{},ueb:{},filter:"alle",history:[],cur:null};
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw))}catch(e){}
S.cur=null;S.filter="alle";
const I=Object.fromEntries(IMPULSE.map(b=>[b.id,b])),W=Object.fromEntries(WERTE.map(w=>[w.id,w])),P=Object.fromEntries(PROBEN.map(p=>[p.id,p])),U=Object.fromEntries(UEBUNGEN.map(u=>[u.id,u]));
S.kern=(S.kern||[]).filter(id=>W[id]&&!W[id].fund).slice(0,5);
S.settings=Object.assign({antiScroll:true,remindTime:"08:00",theme:"dunkel"},S.settings||{});
S.moments=S.moments||{};S.leit=S.leit||{};S.proben=S.proben||{};S.ueb=S.ueb||{};S.saved=S.saved||{};S.read=S.read||{};S.history=S.history||[];S.fresh=S.fresh||[];
const CATKEYS=Object.keys(CATS);
const cc=c=>`style="--c:var(--c-${c})"`;
const dot=c=>`<span class="dot" ${cc(c)}></span>`;
const evHTML=l=>`<span class="ev"><i>${[1,2,3].map(k=>`<b class="${l>=k?"on":""}"></b>`).join("")}</i>${EV[l]}</span>`;
const fmtDate=t=>new Date(t).toLocaleDateString("de-DE",{day:"numeric",month:"short"});
const CHEV='<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function toast(m){document.querySelectorAll(".toast").forEach(x=>x.remove());const t=document.createElement("div");t.className="toast";t.innerHTML=m;document.body.appendChild(t);setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),320)},2600)}
let anim=true,pendingGlow=false;
const applyTheme=()=>{document.documentElement.dataset.theme=S.settings.theme==="hell"?"light":"dark";const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=S.settings.theme==="hell"?"#F4F3EF":"#0B0D10"};
applyTheme();

/* ---------- Das Gerüst: Stützen, Stufen, Streben ---------- */
const MAXKERN=5,FIV=[2,7,21,60,150];
function tested(id){return Object.entries(S.proben).some(([pid,v])=>{const p=P[pid];return p&&v&&v.o!=null&&p.o[v.o]&&p.o[v.o].w.includes(id)})}
function lived(id){const w=W[id];return Object.entries(S.ueb).some(([uid,v])=>v&&v.status==="done"&&U[uid]&&(U[uid].w===id||U[uid].cat===w.cat))}
function hasLeit(id){return !!(S.leit[id]&&S.leit[id].t)}
function affirmed(id){return !!(S.leit[id]&&S.leit[id].n>=2)}
function steps(id){return [["Als Stütze gewählt",S.kern.includes(id)],["Leitsatz formuliert",hasLeit(id)],["In einer Belastungsprobe geprüft",tested(id)],["In einer Übung gelebt",lived(id)],["Leitsatz zweimal bekräftigt",affirmed(id)]]}
function level(id){if(!S.kern.includes(id))return 0;return steps(id).filter(s=>s[1]).length}
function dueLeit(){return S.kern.filter(id=>hasLeit(id)&&(S.leit[id].next||0)<=now())}
function tally(){const c={};Object.entries(S.proben).forEach(([pid,v])=>{const p=P[pid];if(p&&v&&v.o!=null&&p.o[v.o])p.o[v.o].w.forEach(w=>c[w]=(c[w]||0)+1)});return c}
function braces(){const set=new Set();Object.entries(S.proben).forEach(([pid,v])=>{const p=P[pid];if(!p||!v||v.o==null)return;const A=p.o[v.o].w,B=p.o.filter((_,i)=>i!==v.o).flatMap(o=>o.w);
  A.forEach(a=>B.forEach(b=>{if(a!==b&&S.kern.includes(a)&&S.kern.includes(b))set.add([a,b].sort().join("|"))}))});return [...set].map(k=>k.split("|"))}
const parts=()=>S.kern.reduce((a,id)=>a+level(id),0);
function stabWord(s){if(!S.kern.length)return "Bauplan";if(s<8)return "Im Aufbau";if(s<16)return "Trägt schon";if(s<25)return "Stabil";return "Steht fest"}
function nextFor(id){const w=W[id];
  if(!hasLeit(id))return {t:`Formuliere einen Leitsatz für ${w.n}.`,wert:id};
  if(!tested(id)){const p=PROBEN.find(p=>!S.proben[p.id]&&p.o.some(o=>o.w.includes(id)))||PROBEN.find(p=>p.o.some(o=>o.w.includes(id)));return {t:`Prüfe ${w.n} in einer Belastungsprobe.`,probe:p&&p.id}}
  if(!lived(id)){const u=UEBUNGEN.find(u=>u.w===id&&!(S.ueb[u.id]&&S.ueb[u.id].status==="active"))||UEBUNGEN.find(u=>u.cat===w.cat);const act=activeUeb().find(x=>U[x].w===id||U[x].cat===w.cat);
    return act?{t:`Schließ die Übung „${U[act].t}“ ab.`,tabgo:"ueben"}:{t:`Lebe ${w.n} in der Übung „${u.t}“.`,ueb:u.id}}
  if(!affirmed(id)){const L=S.leit[id];return {t:`Bekräftige deinen Leitsatz für ${w.n}, wenn die App nachfragt${L&&L.next>now()?`, voraussichtlich am ${fmtDate(L.next)}`:""}.`,wert:id,wait:true}}
  return null}
function nextStep(){
  if(!S.kern.length)return {t:"Finde heraus, welche Werte dich tragen. Es dauert etwa fünf Minuten.",finder:true,id:null};
  let wait=null;
  for(const id of S.kern){const n=nextFor(id);if(n&&!n.wait)return Object.assign(n,{id});if(n&&!wait)wait=Object.assign(n,{id})}
  if(S.kern.length<MAXKERN)return {t:"Wähle eine weitere Stütze.",tabgo:"werte",id:null};
  return wait||{t:"Dein Gerüst steht. Bleib im Gespräch mit dir: Impulse lesen, Proben entscheiden.",tabgo:"imp",id:null}}
const actAttr=n=>n.finder?`data-finder="1"`:n.wert?`data-wert="${n.wert}"`:n.ueb?`data-ueb="${n.ueb}"`:n.probe?`data-probe-open="${n.probe}"`:n.tabgo?`data-tabgo="${n.tabgo}"`:"";

/* Kurze Namen in zwei Zeilen fürs Gerüst */
const HY={selbstachtung:"Selbst-achtung",gelassenheit:"Gelassen-heit",loyalitaet:"Loyali-tät",verlaesslichkeit:"Verläss-lichkeit",dankbarkeit:"Dank-barkeit",gerechtigkeit:"Gerech-tigkeit",zivilcourage:"Zivil-courage",solidaritaet:"Solida-rität",gewaltfreiheit:"Gewalt-freiheit",beteiligung:"Betei-ligung",genuegsamkeit:"Genüg-samkeit",zukunftsverantwortung:"Verantwortung-für Kommende",ehrfurcht:"Ehrfurcht-vor dem Leben",naturverbundenheit:"Natur-verbundenheit",folgerichtigkeit:"Folge-richtigkeit",weitherzigkeit:"Weit-herzigkeit",wahrhaftigkeit:"Wahr-haftigkeit",differenzierung:"Differen-zierung",verantwortlichkeit:"Verant-wortlichkeit",demut:"Erkenntnis-demut",integritaet:"Integri-tät",zuwendung:"Zu-wendung",offenheit:"Offen-heit",vergebung:"Ver-gebung",muendigkeit:"Mündig-keit",echtheit:"Echt-heit",disziplin:"Diszi-plin",freiheit:"Frei-heit",wachstum:"Wachs-tum",fuersorge:"Für-sorge",vertrauen:"Ver-trauen",erinnerung:"Erin-nerung",toleranz:"Tole-ranz",sorgfalt:"Sorg-falt",fairness:"Fair-ness"};
const isWordBreak=id=>{const b=HY[id].split("-")[1];return b[0]===b[0].toLowerCase()};
const two=id=>{const n=W[id].n;if(n.length<=9||!HY[id])return [n];const [a,b]=HY[id].split("-");return [a+(isWordBreak(id)?"-":""),b]};
const shy=id=>HY[id]&&W[id].n.length>9?HY[id].replace("-",isWordBreak(id)?"&shy;":" "):W[id].n;

/* Das Gerüst als Tensegrity: Stäbe, die sich nicht stützen, sondern von Spannung gehalten werden.
   Jedes Bauteil ist ein Stab. Zusammen bilden sie eine Wolke, die umso runder und dichter wird, je mehr gebaut ist.
   Seile zwischen benachbarten Stabenden halten alles zusammen; geklärte Spannungen aus Belastungsproben werden zu farbigen Spannseilen. */
const CX=180,CY=146,RX=136,RY=112,BASE=292,GA=137.508*Math.PI/180;
const SHORT={zukunftsverantwortung:"Verantwortung",ehrfurcht:"Ehrfurcht"};
const rnd=(seed,k)=>(hashStr(seed+"#"+k)%1000)/1000;
function ext(a,b,e){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return [a[0]-dx/L*e,a[1]-dy/L*e,b[0]+dx/L*e,b[1]+dy/L*e]}
const ln=(p,cls,extra)=>`<line class="${cls}" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${p[2].toFixed(1)}" y2="${p[3].toFixed(1)}" ${extra||""}/>`;
/* Stab n (0 bis 24): Bauteil k der Stütze i liegt auf Platz n = k*5+i. Der goldene Winkel verteilt die Stäbe so, dass die Wolke in jedem Baustand ausgewogen ist. */
function rod(n,seed){const j=k=>rnd(seed||"plan",n*7+k);
  const t1=Math.PI/2+n*GA+(j(1)-.5)*.18,span=(118+j(2)*26)*Math.PI/180,t2=t1+span,r1=.8+j(3)*.2,r2=.8+j(4)*.2;
  const a=[CX+RX*r1*Math.cos(t1),CY+RY*r1*Math.sin(t1)],b=[CX+RX*r2*Math.cos(t2),CY+RY*r2*Math.sin(t2)];
  const z=Math.sin(t1+span/2);return {a,b,z,w:5.2+z*1.6}}
const slotsNow=()=>[0,1,2,3,4].map(i=>S.kern[i]||null);
function builtRods(slots){const out=[];slots.forEach((id,i)=>{if(!id)return;const l=level(id);for(let k=0;k<l;k++)out.push(Object.assign(rod(k*5+i,id),{id,k,i,cat:W[id].cat}))});return out.sort((p,q)=>p.z-q.z)}
function cables(rods){const pts=[];rods.forEach((r,ri)=>{pts.push([r.a,ri]);pts.push([r.b,ri])});const set=new Set(),out=[];
  pts.forEach(([p,ri],pi)=>{pts.map(([q,rj],qi)=>[Math.hypot(p[0]-q[0],p[1]-q[1]),qi,rj]).filter(x=>x[2]!==ri).sort((x,y)=>x[0]-y[0]).slice(0,2).forEach(([d,qi])=>{const k=Math.min(pi,qi)+"|"+Math.max(pi,qi);if(!set.has(k)&&d<120){set.add(k);out.push([p,pts[qi][0]])}})});return out}
function geruestSVG(){
  const slots=slotsNow(),ns=nextStep(),rods=builtRods(slots);let defs="",ghost="",glowS="",body="",nodes="",net="",ties="";
  const grad=(gid,p,c1,c2)=>{defs+=`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${p[2].toFixed(1)}" y2="${p[3].toFixed(1)}"><stop offset="0" style="stop-color:var(--c-${c1})"/><stop offset="1" style="stop-color:var(--c-${c2})"/></linearGradient>`;return `url(#${gid})`};
  /* Bauplan: alle 25 Plätze fein angedeutet, der nächste schimmert */
  for(let n=0;n<25;n++){const i=n%5,k=Math.floor(n/5),id=slots[i];if(id&&k<level(id))continue;const r=rod(n,id);
    const nx=(id&&ns.id===id&&k===level(id))||(!id&&!ns.id&&i===S.kern.length&&k===0);ghost+=ln(ext(r.a,r.b,2),nx?"gh nx":"gh",nx&&id?`style="stroke:var(--c-${W[id].cat})"`:"")}
  cables(rods).forEach(([p,q])=>{net+=ln([p[0],p[1],q[0],q[1]],"cb")});
  braces().forEach(([x,y],m)=>{const A=rods.filter(r=>r.id===x),B=rods.filter(r=>r.id===y);if(!A.length||!B.length)return;let best=null;
    A.forEach(r=>B.forEach(s2=>[[r.a,s2.b],[r.b,s2.a],[r.a,s2.a],[r.b,s2.b]].forEach(([p,q])=>{const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(!best||d<best[0])best=[d,p,q]})));
    const pq=[best[1][0],best[1][1],best[2][0],best[2][1]];ties+=ln(pq,"br",`data-br="${x}|${y}" style="stroke:${grad("bg"+m,pq,W[x].cat,W[y].cat)}"`)});
  rods.forEach(r=>{const p=ext(r.a,r.b,4),key=r.id+":"+r.k,op=(.78+r.z*.22).toFixed(2);
    body+=ln(p,"gap",`data-gap="${key}" style="stroke-width:${(r.w+3.5).toFixed(1)}"`)+ln(p,"rod",`data-seg="${key}" pathLength="100" style="stroke:var(--c-${r.cat});stroke-width:${r.w.toFixed(1)};opacity:${op}"`)+ln(p,"hitl",`data-pil="${r.id}"`);
    glowS+=ln(p,"",`style="stroke:var(--c-${r.cat})"`);nodes+=[r.a,r.b].map(q=>`<circle class="nd" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2.2"/>`).join("")});
  /* Die Wolke ruht über dem Fundament, gehalten von drei Seilen zu den untersten Punkten */
  let feet="";const low=rods.flatMap(r=>[r.a,r.b]).sort((p,q)=>q[1]-p[1]).slice(0,3);low.forEach((p,i)=>{feet+=ln([p[0],p[1],[110,180,250][i],BASE],"ft")});
  if(!rods.length)[110,180,250].forEach(x=>{feet+=ln([x,CY+RY*.9,x,BASE],"ft gh")});
  const legend=`<div class="glegend">${slots.map((id,i)=>{if(!id)return `<button class="lg free" data-finder="1"><span class="sw0"></span><span class="nm">frei</span></button>`;const w=W[id],l=level(id);
    return `<button class="lg" ${cc(w.cat)} data-pil="${id}" aria-label="${w.n}, Stufe ${l} von 5"><span class="nm">${id==="zukunftsverantwortung"||id==="ehrfurcht"?SHORT[id]:shy(id)}</span><span class="pips">${[0,1,2,3,4].map(k=>`<i class="${k<l?"on":""}"></i>`).join("")}</span></button>`}).join("")}</div>`;
  return `<svg class="gsvg" viewBox="0 6 360 300" role="img" aria-label="Dein Wertegerüst mit ${parts()} von 25 Bauteilen">
    <defs><filter id="gb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>${defs}</defs>
    <g class="ghost">${ghost}</g><g class="glow" filter="url(#gb)">${glowS}</g>${feet}${net}${body}${ties}${nodes}
    <g class="slab" role="button" aria-label="Fundament Würde">${ln([40,BASE,320,BASE],"base")}<rect class="hit" x="30" y="${BASE-10}" width="300" height="24"/></g>
    </svg><div class="fundlbl" data-wurde="1">Würde · Fundament</div>${legend}`}
/* Eine einzelne Stütze innerhalb der Wolke, für die Übersicht unter „Werte“ */
function pillarSVG(id,i){let g="";for(let k=0;k<5;k++){const r=rod(k*5+i,id),on=id&&k<level(id);
    g+=`<line x1="${r.a[0].toFixed(0)}" y1="${r.a[1].toFixed(0)}" x2="${r.b[0].toFixed(0)}" y2="${r.b[1].toFixed(0)}" ${on?`stroke="var(--c-${W[id].cat})" stroke-width="14"`:`stroke="var(--ghost)" stroke-width="5" stroke-dasharray="6 14"`} stroke-linecap="round"/>`}
  return `<svg class="psvg" viewBox="30 20 300 260" aria-hidden="true">${g}</svg>`}
/* Kleine Wolke für Logo und Momente; ohne eigene Stützen ein Beispiel */
const SAMPLE=["mut","vertrauen","gerechtigkeit","genuegsamkeit","wahrhaftigkeit"],SAMPLEL=[3,4,5,3,4];
function miniSVG(cls){const has=S.kern.length>0;let g="";const list=[];
  for(let i=0;i<5;i++){const id=has?S.kern[i]:SAMPLE[i];if(!id)continue;const l=has?level(id):SAMPLEL[i];for(let k=0;k<l;k++)list.push(Object.assign(rod(k*5+i,id),{cat:W[id].cat}))}
  list.sort((p,q)=>p.z-q.z).forEach(r=>{g+=`<line x1="${r.a[0].toFixed(0)}" y1="${r.a[1].toFixed(0)}" x2="${r.b[0].toFixed(0)}" y2="${r.b[1].toFixed(0)}" stroke="var(--c-${r.cat})" stroke-width="20" stroke-linecap="round"/>`});
  if(!list.length)for(let n=0;n<10;n++){const r=rod(n);g+=`<line x1="${r.a[0].toFixed(0)}" y1="${r.a[1].toFixed(0)}" x2="${r.b[0].toFixed(0)}" y2="${r.b[1].toFixed(0)}" stroke="var(--ghost)" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 16"/>`}
  return `<svg class="${cls||""}" viewBox="30 18 300 290" aria-hidden="true">${g}<line x1="70" y1="292" x2="290" y2="292" stroke="var(--lit)" stroke-width="18" stroke-linecap="round"/></svg>`}

/* ---------- Reiter ---------- */
const TABS=[["geruest","Gerüst"],["imp","Impulse"],["ueben","Üben"],["werte","Werte"]];
let tab="geruest";
function renderTabs(){const due=dueLeit().length,act=activeUeb().length,fr=S.fresh.length&&tab!=="geruest";
  $("#tabs").innerHTML=TABS.map(([id,n])=>`<button data-tab="${id}" ${tab===id?'aria-current="page"':""}><span>${n}</span>${id==="geruest"&&fr?`<i class="bd"></i>`:""}${id==="werte"&&due?`<em>${due}</em>`:""}${id==="ueben"&&act?`<em>${act}</em>`:""}</button>`).join("");
  let bar=document.querySelector(".tabs .tbar");if(!bar){bar=document.createElement("span");bar.className="tbar";bar.setAttribute("aria-hidden","true");$(".tabs").appendChild(bar)}
  bar.style.setProperty("--i",TABS.findIndex(t=>t[0]===tab))}
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;const to=b.dataset.tab;
  if(to===tab){if(to==="imp"&&(S.cur||shared)){backToImp();return}if(to==="imp"&&S.filter!=="alle"){S.filter="alle";persist();render()}window.scrollTo({top:0,behavior:calm()?"auto":"smooth"});return}
  if(tab==="imp"&&S.cur){S.cur=null;shared=null}
  anim=true;tab=to;persist();render();window.scrollTo(0,0);buzz(5)});

/* ---------- Impulse ---------- */
function pool(){const f=S.filter;return IMPULSE.filter(b=>f==="alle"||b.cat===f)}
function pickImp(){const p=pool(),unread=p.filter(b=>!S.read[b.id]);
  const list=unread.length?unread:p.slice().sort((a,b)=>S.read[a.id]-S.read[b.id]).slice(0,Math.max(3,Math.floor(p.length/3)));
  let c=list[Math.floor(Math.random()*list.length)];if(c&&S.cur===c.id&&list.length>1)c=list.find(b=>b.id!==S.cur);return c}
function openDaily(id,el){if(!document.startViewTransition||calm()){openImp(id);return}
  const tt=el.querySelector(".dt");if(tt)tt.style.viewTransitionName="btitle";document.documentElement.classList.add("morph");
  const vt=document.startViewTransition(()=>{openImp(id);const h=document.querySelector(".bite h2");if(h)h.style.viewTransitionName="btitle"});
  vt.finished.finally(()=>{document.documentElement.classList.remove("morph");document.querySelectorAll(".bite h2").forEach(x=>x.style.viewTransitionName="")})}
function openImp(id){if(!S.cur&&!shared)pushNav();anim=true;pendingGlow=true;S.cur=id;if(!S.read[id])S.read[id]=now();S.history=[id,...S.history.filter(x=>x!==id)].slice(0,12);tab="imp";persist();render();window.scrollTo(0,0)}
function backToImp(){anim=true;S.cur=null;shared=null;tab="imp";persist();render();window.scrollTo(0,0)}
function impCard(b){const w=W[b.w],u=U[b.ue],mine=w&&S.kern.includes(w.id);
  const gift=shared===b.id?`<div class="gift"><span class="label">Für dich geteilt</span><p>Jemand möchte dir diesen Gedanken zeigen. Er stammt aus dem Wertegerüst, einer kostenlosen App, mit der man sich Schritt für Schritt ein Gerüst aus eigenen Werten baut. Ohne Anmeldung, alles bleibt auf deinem Gerät.</p><button class="btn" id="explore">Selbst ausprobieren</button></div>`:"";
  return gift+`<article class="bite" ${cc(b.cat)}>
    <div class="meta"><span>${dot(b.cat)}${CATS[b.cat].n}</span>${evHTML(b.ev)}</div>
    <h2>${b.t}</h2>
    <p class="body">${b.x}</p>
    <button class="note tap" data-deep="tip"><span class="label">Für dich</span><span class="tipx">${b.tip}</span><span class="more">Vertiefen →</span></button>
    <button class="note tap" data-deep="ev"><span class="label">Wie sicher?</span><span>${b.c}</span><span class="more">Einordnung →</span></button>
    <p class="src"><a href="${esc(b.u)}" target="_blank" rel="noopener">${b.src} ↗</a></p>
    <div class="links">${w?`<button class="tag" ${cc(w.cat)} data-wert="${w.id}">${dot(w.cat)}${mine?"Deine Stütze":"Wert"}: ${w.n}</button>`:""}${u?`<button class="tag" ${cc(u.cat)} data-ueb="${u.id}">${dot(u.cat)}Übung: ${u.t}</button>`:""}</div>
    <div class="row"><button class="btn primary" id="next">Nächster Impuls</button><button class="btn" id="save" aria-pressed="${!!S.saved[b.id]}">${S.saved[b.id]?"Gemerkt":"Merken"}</button><button class="btn" id="share">Teilen</button></div>
    <button class="linkbtn" id="back">← Alle Impulse</button>
  </article>`}
function viewImp(){
  const nRead=Object.keys(S.read).length,p=pool(),unread=p.filter(b=>!S.read[b.id]).length;
  if(S.cur&&I[S.cur])return `<section class="view">${impCard(I[S.cur])}${matchMedia("(pointer:coarse)").matches&&nRead<6?'<p class="hint">Nach links wischen für den nächsten Impuls, nach rechts zurück</p>':''}</section>`;
  const cnt={alle:IMPULSE.length};CATKEYS.forEach(k=>cnt[k]=IMPULSE.filter(b=>b.cat===k).length);
  const recent=S.history.filter(id=>I[id]).slice(0,8);
  return `<section class="view">
    <header class="vh"><h1>Impulse</h1><p>Kurze Gedanken aus Philosophie, Geschichte und Forschung. Bei jedem steht die Quelle und wie gut er belegt ist.</p></header>
    <button class="draw" id="go"><span class="stack" aria-hidden="true"><i></i><i></i><i></i></span><span class="dtx"><b>Nächster Impuls</b><small>${unread?`${unread} noch neu${S.filter!=="alle"?" · "+CATS[S.filter].n:""}`:"alle gelesen · Wiederholung"}</small></span><span class="arr" aria-hidden="true">→</span></button>
    ${chips("filter",S.filter,cnt)}
    ${recent.length?`<div class="sec"><div class="sh"><span class="label">Zuletzt gelesen</span><span class="label">${nRead} von ${IMPULSE.length}</span></div><div class="list">${recent.map(id=>{const b=I[id];return `<button class="li" data-open="${id}">${dot(b.cat)}<span class="tx"><b>${b.t}</b><small>${b.src}</small></span><span class="aside">${fmtDate(S.read[id])}</span></button>`}).join("")}</div></div>`:""}
  </section>`}
function chips(attr,cur,counts){return `<div class="chips" role="group" aria-label="Bereich wählen">${[["alle","Alle"],...Object.entries(CATS).map(([k,v])=>[k,v.n])].map(([k,n])=>`<button class="chip" data-${attr}="${k}" aria-pressed="${cur===k}" ${k!=="alle"?cc(k):""}>${k!=="alle"?dot(k):""}${n}${counts?`<small>${counts[k]}</small>`:""}</button>`).join("")}</div>`}

/* ---------- Gerüst (Start) ---------- */
function festRow(id){const w=W[id],L=S.leit[id];
  return `<section class="fest" ${cc(w.cat)}><div class="sh"><span class="label">${dot(w.cat)}Festigen · ${w.n}</span><span class="label">${L.n?`${L.n}× bekräftigt`:"erste Nachfrage"}</span></div>
   <p class="q">Stehst du noch zu deinem Leitsatz?</p><blockquote>${esc(L.t)}</blockquote>
   <div class="row"><button class="btn primary" data-affirm="${id}">Ja, das trägt</button><button class="btn" data-wert="${id}">Anpassen</button></div></section>`}
function viewGeruest(){
  const due=dueLeit(),ns=nextStep(),pt=parts(),db=dailyImp(),dp=dailyProbe(),sp=specialToday();
  const leits=S.kern.filter(hasLeit);
  return `<section class="view home">
    <div class="stage"><div class="sh"><span class="label">Dein Gerüst</span><span class="label">${stabWord(pt)}</span></div>
      <div class="gwrap">${geruestSVG()}</div>
      <div id="ginfo" aria-live="polite"></div></div>
    ${due.length?festRow(due[0]):""}
    <button class="next" ${actAttr(ns)}><span class="label">Nächster Schritt</span><b>${ns.t}</b><span class="arr" aria-hidden="true">→</span></button>
    <div class="sec"><div class="sh"><span class="label">Heute</span><span class="label">${new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})}</span></div>
      <div class="list today">
        <button class="li daily" data-daily="${db.id}"><span class="k">Impuls</span><span class="tx"><b class="dt">${db.t}</b><small>${CATS[db.cat].n}</small></span><span class="aside">${S.read[db.id]?"gelesen":"→"}</span></button>
        <button class="li" data-probe-open="${dp.id}"><span class="k">Probe</span><span class="tx"><b>${dp.t}</b><small>${S.proben[dp.id]&&S.proben[dp.id].o!=null?"entschieden":"Was würdest du tun?"}</small></span><span class="aside">→</span></button>
        ${sp?`<div class="special"><p>${sp.t}</p><div class="links">${sp.b&&I[sp.b]?`<button class="tag" data-open="${sp.b}">${dot(I[sp.b].cat)}${I[sp.b].t}</button>`:""}${sp.u&&U[sp.u]?`<button class="tag" data-ueb="${sp.u}">${dot(U[sp.u].cat)}Übung: ${U[sp.u].t}</button>`:""}</div></div>`:""}
      </div></div>
    ${leits.length?`<div class="sec"><div class="sh"><span class="label">Deine Leitsätze</span></div><div class="leits">${leits.map(id=>`<button class="leit" ${cc(W[id].cat)} data-wert="${id}"><small>${dot(W[id].cat)}${W[id].n}${S.leit[id].n?` · ${S.leit[id].n}× bekräftigt`:""}</small><q>${esc(S.leit[id].t)}</q></button>`).join("")}</div></div>`:""}
    ${journalFold()}
    ${settingsFold()}
    ${aboutFold()}
    <p class="footcredit">Wertegerüst · © 2026 Carlo Maximilian Engeländer</p>
  </section>`}
function pillarTap(id){const svg=document.querySelector(".gsvg");if(!svg)return;const w=W[id],l=level(id),n=nextFor(id);
  const was=svg.dataset.sel===id;svg.dataset.sel=was?"":id;svg.querySelectorAll(".rod").forEach(r=>r.classList.toggle("on",!was&&r.dataset.seg.startsWith(id+":")));
  svg.classList.toggle("sel",!was);document.querySelectorAll(".glegend .lg").forEach(b=>b.classList.toggle("on",!was&&b.dataset.pil===id));buzz([6,30,8]);
  if(was){$("#ginfo").innerHTML="";return}
  const segs=[...svg.querySelectorAll(`.rod[data-seg^="${id}:"]`)];if(!calm())segs.forEach((s,i)=>s.animate([{opacity:1},{opacity:.45,offset:.35},{opacity:1}],{duration:650,delay:i*60,easing:"ease-out"}));
  if(segs.length)lightUp(segs[segs.length-1]);
  $("#ginfo").innerHTML=`<div class="pinfo" ${cc(w.cat)}><div class="sh"><span class="label">${dot(w.cat)}${w.n}</span><span class="label">Stufe ${l} von 5</span></div>
   <ul class="steps5">${steps(id).map(([t,ok])=>`<li class="${ok?"ok":""}"><i></i>${t}</li>`).join("")}</ul>
   <div class="row">${n?`<button class="btn primary" ${actAttr(n)}>${n.wait?"Leitsatz ansehen":n.wert?"Leitsatz schreiben":n.probe?"Probe öffnen":n.ueb?"Übung ansehen":"Weiter"}</button>`:""}<button class="btn" data-wert="${id}">Stütze öffnen</button></div></div>`;
  const pi=$("#ginfo .pinfo");if(pi&&!calm())pi.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"})}
function playFresh(){if(!S.fresh.length)return;const list=S.fresh.slice();S.fresh=[];persist();if(calm())return;
  list.forEach((key,i)=>{const r=document.querySelector(`.gsvg .rod[data-seg="${key}"]`);if(!r)return;const d=250+i*260,gp=document.querySelector(`.gsvg [data-gap="${key}"]`);
    [r,gp].forEach(x=>{if(!x)return;x.setAttribute("pathLength","100");x.style.strokeDasharray="100";x.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:850,delay:d,easing:"cubic-bezier(.5,0,.2,1)",fill:"backwards"}).onfinish=()=>{x.style.strokeDasharray=""}});
    setTimeout(()=>{lightUp(r,true);buzz([10,40,16])},d+700)})}

/* ---------- Bautagebuch, Einstellungen, Über ---------- */
function journalFold(){
  const nRead=Object.keys(S.read).length,nPr=nPrDone(),done=Object.entries(S.ueb).filter(([id,v])=>U[id]&&v.status==="done");
  const t=tally(),top=Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const journal=[...done.filter(([,v])=>v.note||v.mood).map(([id,v])=>({id,t:v.end,c:U[id].cat,title:U[id].t,sub:v.mood?{gut:"Hat mir gutgetan",mix:"Gemischt",nein:"Eher nicht"}[v.mood]:"Übung",note:v.note})),
    ...Object.entries(S.proben).filter(([id,v])=>P[id]&&v.r).map(([id,v])=>({id,t:v.t,c:P[id].cat,title:P[id].t,sub:"Belastungsprobe",note:v.r}))].sort((a,b)=>b.t-a.t);
  const saved=Object.keys(S.saved).filter(id=>I[id]);const got=MOMENTS.filter(m=>S.moments[m.id]);
  return `<details class="fold" id="jfold" ${S.jOpen?"open":""}><summary><span>Bautagebuch</span><span class="label">Notizen · Gemerktes</span>${CHEV}</summary><div class="fbody">
    <div class="tiles"><div><b>${nRead}</b><span>Impulse gelesen</span></div><div><b>${nPr}</b><span>Proben entschieden</span></div><div><b>${done.length}</b><span>Übungen geschafft</span></div></div>
    <p class="muted small">Hier verfällt nichts, wenn du eine Pause machst.</p>
    ${top.length?`<h3>Was in deinen Entscheidungen den Ausschlag gab</h3><div class="links">${top.map(([id,n])=>`<button class="tag" ${cc(W[id].cat)} data-wert="${id}">${dot(W[id].cat)}${W[id].n}<em>${n}</em></button>`).join("")}</div>`:""}
    <h3>Notizen</h3>${journal.length?`<div class="journal">${journal.map(j=>`<div class="jr" ${cc(j.c)}><small>${fmtDate(j.t)} · ${j.sub}</small><b>${j.title}</b>${j.note?`<p>${esc(j.note)}</p>`:""}</div>`).join("")}</div>`:`<p class="muted small">Wenn du eine Übung abschließt oder eine Entscheidung begründest, erscheinen deine Notizen hier.</p>`}
    <h3>Gemerkte Impulse</h3>${saved.length?`<div class="list">${saved.map(id=>{const b=I[id];return `<button class="li" data-open="${id}">${dot(b.cat)}<span class="tx"><b>${b.t}</b><small>${b.src}</small></span></button>`}).join("")}</div>`:`<p class="muted small">Tippe bei einem Impuls auf „Merken“, um ihn hier wiederzufinden.</p>`}
    ${got.length?`<h3>Momente</h3><div class="moms">${got.map(m=>`<span class="mom">${m.t}<small>${fmtDate(S.moments[m.id])}</small></span>`).join("")}</div>`:""}
  </div></details>`}
let confirmReset=false;
function aboutFold(){return `<details class="fold" id="aboutfold" ${S.aboutOpen||confirmReset?"open":""}><summary><span>Über diese App</span><span class="label">Haltung · Quellen</span>${CHEV}</summary><div class="fbody about">
  <p>Das Wertegerüst hilft dir, dir Schritt für Schritt klar zu werden, wofür du stehst. Es gibt keine richtigen Werte, die du übernehmen musst. Nur die Würde jedes Menschen ist als Fundament schon eingebaut, weil sie für alle gilt, auch für Menschen, deren Taten du entschieden ablehnst.</p>
  <p>Werte geraten oft in Spannung zueinander. Das ist kein Zeichen von Haltlosigkeit, sondern normal. Stabil wird ein Gerüst, wenn du deine Werte kennst, sie in schwierigen Lagen abwägst und sie im Alltag lebst. Darum gibt es Impulse zum Nachdenken, Belastungsproben zum Entscheiden und Übungen zum Tun.</p>
  <h3>So wächst eine Stütze</h3><p>Jede Stütze hat fünf Bauteile: gewählt, Leitsatz, geprüft, gelebt und bekräftigt. Die Stäbe berühren sich kaum. Wie bei einer Tensegrity-Skulptur hält Spannung das Ganze zusammen: feine Seile verbinden benachbarte Stabenden, und wenn du in einer Belastungsprobe zwischen zwei deiner Werte abgewogen hast, kommt ein farbiges Spannseil dazu. Werte dürfen also in Spannung zueinander stehen. Gerade das macht das Gerüst stabil.</p>
  <h3>Wie sicher ist ein Impuls?</h3><div class="legend">${[3,2,1,0].map(l=>`<div>${evHTML(l)}<span class="muted">${["Philosophie, Zeitzeugnis oder Denkmodell","eine einzelne Studie oder nur Zusammenhänge","mehrere Studien, aber mit Grenzen","Meta-Analysen, große Längsschnitte oder sehr viele Studien"][l]}</span></div>`).join("")}</div>
  <p class="muted small">Stand der Recherche: Oktober 2026. App-Version vom __BUILD__ Uhr. Die App ersetzt keine Beratung oder Therapie. Wenn es dir schlecht geht, ist die Telefonseelsorge rund um die Uhr erreichbar: 0800 111 0 111. Alles, was du hier wählst, schreibst und entscheidest, bleibt nur in diesem Browser auf diesem Gerät.</p>
  <div class="row"><button class="btn" id="shareapp">App weiterempfehlen</button></div>
  <div class="row">${confirmReset?`<span>Wirklich alles löschen?</span><button class="btn primary" id="resetyes">Ja, löschen</button><button class="btn" id="resetno">Abbrechen</button>`:`<button class="linkbtn" id="reset">Fortschritt zurücksetzen</button>`}</div>
  <div class="credit"><span class="label">Von wem</span><p>Das Wertegerüst ist ein privates Projekt von <b>Carlo Maximilian Engeländer</b>. Idee, Auswahl, Texte und Gestaltung stammen von ihm.</p><p class="muted small">© 2026 Carlo Maximilian Engeländer. Alle Rechte vorbehalten. Du darfst die App gern nutzen und den Link weitergeben, auch im Unterricht. Inhalte, Texte und Gestaltung dürfen aber nicht ohne Erlaubnis kopiert, verändert oder anderswo veröffentlicht werden.</p></div>
 </div></details>`}
function settingsFold(){const sw=(id,on,label,sub)=>`<button class="setrow" data-setting="${id}" role="switch" aria-checked="${on}"><span><b>${label}</b><small>${sub}</small></span><span class="sw"><i></i></span></button>`;
  return `<details class="fold" id="setfold" ${S.setOpen?"open":""}><summary><span>Einstellungen</span><span class="label">Ansicht · Erinnerung</span>${CHEV}</summary><div class="fbody">
   ${sw("hell",S.settings.theme==="hell","Helle Ansicht","Statt der dunklen Ansicht eine helle, zum Beispiel für draußen.")}
   ${sw("antiScroll",S.settings.antiScroll,"Hinweis gegen Endlos-Lesen","Nach fünf Impulsen hintereinander schlägt die App vor, etwas zu prüfen oder auszuprobieren.")}
   <div class="setrow static"><span><b>Tägliche Erinnerung</b><small>Ein täglicher Termin in deinem eigenen Kalender. Die App selbst schickt keine Nachrichten und sammelt keine Daten.</small></span></div>
   <div class="row"><input type="time" id="rtime" value="${S.settings.remindTime}" aria-label="Uhrzeit"><button class="btn" id="dailyics">Apple-Kalender</button><a class="btn" id="dailyg" href="${dailyGoogle()}" target="_blank" rel="noopener">Google Kalender</a></div>
  </div></details>`}

/* ---------- Werte ---------- */
function findCard(){const f=S.find&&S.find.v===2?S.find:null,n=f?Object.keys(f.a).length:0,done=f&&f.stage==="done";
  if(done)return `<button class="findcard small" data-finder="1"><span class="rods" aria-hidden="true">${CATKEYS.map(k=>`<i ${cc(k)}></i>`).join("")}</span><span class="tx"><b>Werte neu finden</b><small>Sätze einschätzen, abwägen, auswählen</small></span><span class="arr">→</span></button>`;
  return `<button class="findcard" data-finder="1"><span class="rods" aria-hidden="true">${CATKEYS.map(k=>`<i ${cc(k)}></i>`).join("")}</span><span class="tx"><b>${n?"Weiter beim Werte finden":"Werte finden"}</b><small>${n?`${n} von ${SAETZE.length} Sätzen eingeschätzt`:"Du schätzt alltägliche Sätze ein und wägst danach ab. Daraus ergeben sich deine Stützen. Etwa fünf Minuten."}</small></span><span class="arr">→</span></button>`}
let wFilter="alle";
function viewWerte(){
  const due=dueLeit();
  const list=WERTE.filter(w=>wFilter==="alle"||w.cat===wFilter),cnt={alle:WERTE.length};CATKEYS.forEach(k=>cnt[k]=WERTE.filter(w=>w.cat===k).length);
  return `<section class="view">
    <header class="vh"><h1>Werte</h1><p>Bis zu fünf Werte tragen dein Gerüst. Am leichtesten findest du sie Schritt für Schritt. Du kannst sie auch direkt aus der Liste wählen.</p></header>
    ${findCard()}
    <div class="slots">${[0,1,2,3,4].map(i=>{const id=S.kern[i];if(!id)return `<button class="slot" data-finder="1">${pillarSVG(null,i)}<span class="sn">frei</span></button>`;const w=W[id],l=level(id);return `<button class="slot on" ${cc(w.cat)} data-wert="${id}">${pillarSVG(id,i)}<span class="sn">${id==="zukunftsverantwortung"||id==="ehrfurcht"?SHORT[id]:shy(id)}</span></button>`}).join("")}</div>
    <p class="muted small fundline">Fundament in jedem Gerüst: <button class="linkbtn" data-wert="wuerde">die Würde jedes Menschen</button></p>
    ${due.length?due.map(festRow).join(""):""}
    <div class="sec" id="wlist"><div class="sh"><span class="label">Alle Werte</span><span class="label">${list.length}</span></div>${chips("wfilter",wFilter,cnt)}
      <div class="list">${list.map(w=>`<button class="li wli" data-wert="${w.id}" ${cc(w.cat)}>${dot(w.cat)}<span class="tx"><b>${w.n}</b><small>${w.d}</small></span>${w.fund?`<span class="pill">Fundament</span>`:S.kern.includes(w.id)?`<span class="pill on">Stütze</span>`:""}</button>`).join("")}</div></div>
    <details class="fold" id="wqfold" ${S.wqOpen?"open":""}><summary><span>Was ist ein Wertequadrat?</span><span class="label">Spannung verstehen</span>${CHEV}</summary><div class="fbody about">
      <p>Jeder Wert braucht eine Schwester, um gut zu bleiben. Ehrlichkeit ohne Taktgefühl wird verletzend, Taktgefühl ohne Ehrlichkeit wird zur Schönfärberei.</p>
      <p>Das Wertequadrat zeigt oben einen Wert und seine Schwester, unten jeweils ihr Zuviel. Wer zu einem Zuviel neigt, wächst am besten in Richtung der Schwester des eigenen Werts.</p>
      <p class="muted small">Das Modell stammt von Paul Helwig und wurde von Friedemann Schulz von Thun bekannt gemacht. Es hilft besonders, wenn du dich zwischen zwei Werten hin- und hergerissen fühlst. Diese Ambivalenz ist kein Fehler, sondern ein Zeichen, dass beide etwas Richtiges wollen.</p>
    </div></details>
  </section>`}
function wqHTML(w){
  return `<div class="wq" ${cc(w.cat)}><svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="30" y1="32" x2="70" y2="68" vector-effect="non-scaling-stroke"/><line x1="70" y1="32" x2="30" y2="68" vector-effect="non-scaling-stroke"/></svg>
    <div class="q top"><small>Wert</small><b>${w.n}</b></div><div class="q top"><small>Schwester</small><b>${w.s}</b></div>
    <div class="q bot"><small>Zuviel davon</small><b>${w.zv}</b></div><div class="q bot"><small>Zuviel davon</small><b>${w.zs}</b></div></div>
    <p class="muted small">Wer zu ${w.zv} neigt, wächst in Richtung ${w.s}. Wer zu ${w.zs} neigt, wächst in Richtung ${w.n}.</p>`}
function valueSheet(id){const w=W[id],isK=S.kern.includes(id),L=S.leit[id]||{};
  const imps=IMPULSE.filter(b=>b.w===id).slice(0,2),prs=PROBEN.filter(p=>p.o.some(o=>o.w.includes(id))).slice(0,2),ues=UEBUNGEN.filter(u=>u.w===id).slice(0,2);
  const status=isK?`<h3>Bauteile dieser Stütze</h3><ul class="steps5" ${cc(w.cat)}>${steps(id).map(([t,ok])=>`<li class="${ok?"ok":""}"><i></i>${t}</li>`).join("")}</ul>`:"";
  const leit=isK?`<h3>Dein Leitsatz</h3><div class="leitbox"><textarea id="leittext" placeholder="Ich stehe dafür ein, dass …">${esc(L.t||"")}</textarea><div class="row"><button class="btn primary" data-leitsave="${id}">Leitsatz speichern</button></div><p class="muted small">Ein guter Leitsatz ist konkret und gilt auch dann, wenn er dich etwas kostet. Die App fragt in wachsenden Abständen nach, ob du noch dazu stehst.</p></div>`:"";
  const btn=w.fund?`<div class="fundnote">Die Würde jedes Menschen ist das Fundament deines Gerüsts. Sie gilt für jeden, auch für Menschen, deren Taten du entschieden ablehnst. Deshalb ist sie in jedem Gerüst schon eingebaut.</div>`:
    `<div class="row">${isK?`<button class="btn" data-unkern="${id}">Nicht mehr als Stütze</button>`:`<button class="btn primary" data-kern="${id}" ${S.kern.length>=MAXKERN?"disabled":""}>Als Stütze wählen</button>`}</div>${!isK&&S.kern.length>=MAXKERN?`<p class="muted small">Du hast schon fünf Stützen. Nimm zuerst eine heraus, wenn du diese wählen möchtest.</p>`:""}`;
  sheet(`<div class="deep" ${cc(w.cat)}><div class="label">${dot(w.cat)}${CATS[w.cat].n} · ${w.fund?"Fundament":isK?"Deine Stütze":"Wert"}</div><h2>${w.n}</h2><p class="lead">${w.d}</p>
   ${btn}${status}${leit}
   <h3>Im Wertequadrat</h3>${wqHTML(w)}
   <h3>Frage an dich</h3><p class="ask">${w.f}</p>
   <p class="muted small">Zum Beispiel: ${w.b}</p>
   ${imps.length?`<h3>Gedanken dazu</h3>${imps.map(b=>goBtn("open",b.id,b.cat,EV[b.ev],b.t)).join("")}`:""}
   ${prs.length?`<h3>Auf die Probe stellen</h3>${prs.map(p=>goBtn("probe-open",p.id,p.cat,S.proben[p.id]&&S.proben[p.id].o!=null?"Belastungsprobe · entschieden":"Belastungsprobe",p.t)).join("")}`:""}
   ${ues.length?`<h3>Im Alltag leben</h3>${ues.map(u=>goBtn("ueb",u.id,u.cat,"Übung · "+(u.d===1?"heute":u.d+" Tage"),u.t)).join("")}`:""}
  </div>`,w.cat)}

/* ---------- Üben: Belastungsproben und Übungen ---------- */
let pFilter="alle",pcur=null,uFilter="alle",uMore=false;
const nPrDone=()=>Object.keys(S.proben).filter(id=>P[id]&&S.proben[id].o!=null).length;
function currentProbe(){if(pcur&&P[pcur])return P[pcur];const list=PROBEN.filter(p=>pFilter==="alle"||p.cat===pFilter);const open=list.filter(p=>!(S.proben[p.id]&&S.proben[p.id].o!=null));const src=open.length?open:list;const p=src[(S.pskip||0)%(src.length||1)];pcur=p&&p.id;return p}
function probeCard(p){const v=S.proben[p.id],done=v&&v.o!=null;
  return `<article class="probe" ${cc(p.cat)} id="probe"><div class="meta"><span>${dot(p.cat)}${CATS[p.cat].n}</span><span>Belastungsprobe</span></div>
   <h2>${p.t}</h2><p class="situ">${p.x}</p>
   <p class="label">${done?"Deine Entscheidung":"Was würdest du tun?"}</p>
   <div class="opts ${done?"done":""}">${p.o.map((o,i)=>`<button class="opt ${done&&v.o===i?"pick":""}" data-pick="${p.id}:${i}" ${done?'aria-disabled="true"':""}><span class="ok" aria-hidden="true"></span><span class="ot">${o.t}${done?`<span class="vw">${o.w.map(id=>`<span class="vchip" ${cc(W[id].cat)} data-wert="${id}">${W[id].n}</span>`).join("")}</span>`:""}</span></button>`).join("")}</div>
   ${done?`<div class="reveal"><span class="label">Was hier im Spiel ist</span><p>${p.h}</p><p class="ask">${p.f}</p>
     <label class="label" for="preason">Deine Begründung, nur für dich</label><textarea id="preason" placeholder="Warum hast du dich so entschieden?">${esc(v.r||"")}</textarea>
     <div class="row"><button class="btn primary" data-psave="${p.id}">Speichern</button><button class="btn" id="pnext">Nächste Probe</button><button class="linkbtn" data-previse="${p.id}">Anders entscheiden</button></div></div>`
     :`<div class="row"><button class="linkbtn" id="pnext">Andere Probe</button></div>`}
   <button class="mini" data-pshare="${p.id}">Mit jemandem besprechen</button>
  </article>`}
const MAXACT=3;
const activeUeb=()=>Object.entries(S.ueb).filter(([,v])=>v&&v.status==="active").map(([id])=>id).filter(id=>U[id]);
function suggestUeb(){const free=UEBUNGEN.filter(u=>!S.ueb[u.id]);if(!free.length)return null;
  const kc=new Set(S.kern.map(id=>W[id].cat)),kw=new Set(S.kern);const pref=free.filter(u=>kw.has(u.w)),pref2=free.filter(u=>kc.has(u.cat));
  const list=pref.length?pref:pref2.length?pref2:free;return list[(Math.floor(now()/DAY)+(S.uskip||0))%list.length]}
function uebCard(e,mode){const v=S.ueb[e.id];let extra="";
  if(mode==="active"){const total=e.d,el=Math.min(total,Math.floor((now()-v.start)/DAY)),left=Math.max(0,total-el);
    extra=`<div class="prog"><div class="meter"><span style="width:${Math.max(4,Math.round(el/total*100))}%"></span></div><span class="label">${left?`Noch ${left} Tag${left>1?"e":""} · bis ${fmtDate(v.start+total*DAY)}`:"Zeit ist um. Wie lief es?"}</span></div>
    <div class="row"><button class="btn primary" data-done="${e.id}">Geschafft</button><button class="btn" data-remind="${e.id}">Erinnern</button><button class="btn" data-ueb="${e.id}">Anleitung</button><button class="linkbtn" data-drop="${e.id}">Abbrechen</button></div>${checkRow(e.id)}<button class="mini" data-ushare="${e.id}">Mit jemandem machen</button>`}
  else extra=`<div class="row"><button class="btn primary" data-accept="${e.id}" ${activeUeb().length>=MAXACT?"disabled":""}>Annehmen</button><button class="btn" data-ueb="${e.id}">Mehr dazu</button>${mode==="suggest"?`<button class="linkbtn" id="uother">Anderer Vorschlag</button>`:""}</div><button class="mini" data-ushare="${e.id}">Mit jemandem machen</button>${activeUeb().length>=MAXACT?`<p class="muted small">Du hast schon ${MAXACT} Übungen laufen. Schließ zuerst eine ab, bevor du eine neue beginnst.</p>`:""}`;
  return `<article class="exp" ${cc(e.cat)}><div class="meta"><span>${dot(e.cat)}${W[e.w].n}</span><span>${e.d===1?"Heute":e.d+" Tage"}</span></div><h2>${e.t}</h2><p>${e.x}</p>${extra}</article>`}
function viewUeben(){
  const p=currentProbe(),act=activeUeb(),sug=suggestUeb();
  const pc={alle:PROBEN.length},uc={alle:UEBUNGEN.length};CATKEYS.forEach(k=>{pc[k]=PROBEN.filter(x=>x.cat===k).length;uc[k]=UEBUNGEN.filter(x=>x.cat===k).length});
  const nDone=nPrDone();
  let h=`<section class="view"><header class="vh"><h1>Üben</h1><p>In Belastungsproben entscheidest du dich in schwierigen Lagen. In Übungen lebst du einen Wert im Alltag. Beides baut an deinem Gerüst.</p></header>`;
  h+=`<div class="sec"><div class="sh"><span class="label">Belastungsprobe</span><span class="label">${nDone} von ${PROBEN.length} entschieden</span></div>${chips("pfilter",pFilter,pc)}${p?probeCard(p):""}</div>`;
  h+=`<div class="sec"><div class="sh"><span class="label">Übungen, die laufen</span><span class="label">${act.length} von ${MAXACT}</span></div>${act.length?act.map(id=>uebCard(U[id],"active")).join(""):`<p class="muted small">Übungen sind kleine Schritte, mit denen du einen Wert im Alltag lebst. Nichts davon muss perfekt gelingen.</p>`}</div>`;
  if(sug)h+=`<div class="sec"><div class="sh"><span class="label">Vorschlag für dich</span></div>${uebCard(sug,"suggest")}</div>`;
  const ul=UEBUNGEN.filter(u=>uFilter==="alle"||u.cat===uFilter),lim=uMore?ul.length:6;
  h+=`<details class="fold" id="uebfold" ${S.uebOpen?"open":""}><summary><span>Alle Übungen</span><span class="label">${UEBUNGEN.length}</span>${CHEV}</summary><div class="fbody">${chips("ufilter",uFilter,uc)}<div class="list">${ul.slice(0,lim).map(u=>{const v=S.ueb[u.id];const st=v?(v.status==="active"?"läuft":v.status==="done"?"geschafft":"abgebrochen"):(u.d===1?"heute":u.d+" Tage");return `<button class="li" data-ueb="${u.id}">${dot(u.cat)}<span class="tx"><b>${u.t}</b></span><span class="aside">${st}</span></button>`}).join("")}</div>${ul.length>lim?`<button class="linkbtn" id="umore">${ul.length-lim} weitere anzeigen</button>`:""}</div></details>`;
  h+=`<details class="fold" id="prfold" ${S.prOpen?"open":""}><summary><span>Alle Belastungsproben</span><span class="label">${nDone} / ${PROBEN.length}</span>${CHEV}</summary><div class="fbody"><div class="list">${PROBEN.map(x=>`<button class="li" data-probe-open="${x.id}">${dot(x.cat)}<span class="tx"><b>${x.t}</b></span><span class="aside">${S.proben[x.id]&&S.proben[x.id].o!=null?"entschieden":"offen"}</span></button>`).join("")}</div></div></details>`;
  return h+`</section>`}
function uebSheet(id){const e=U[id],v=S.ueb[id],w=W[e.w];
  sheet(`${invited===id?`<div class="gift"><span class="label">Eine Einladung</span><p>Jemand möchte diese Übung gemeinsam mit dir machen. Sie stammt aus dem Wertegerüst, einer kostenlosen App ohne Anmeldung.</p></div>`:""}<div class="label">${dot(e.cat)}${CATS[e.cat].n} · ${e.d===1?"Heute":e.d+" Tage"}</div><h2>${e.t}</h2><p class="lead">${e.x}</p><h3>So gehst du vor</h3><ol class="howto">${e.s.map(s=>`<li>${s}</li>`).join("")}</ol>
  <h3>Welcher Wert dahintersteht</h3>${goBtn("wert",w.id,w.cat,S.kern.includes(w.id)?"Deine Stütze":"Wert",w.n)}
  <div class="row">${!v||v.status==="dropped"?`<button class="btn primary" data-accept="${id}" ${activeUeb().length>=MAXACT?"disabled":""}>Annehmen</button>`:v.status==="active"?`<button class="btn primary" data-done="${id}">Geschafft</button>`:`<span class="label">Geschafft am ${fmtDate(v.end)}</span><button class="btn" data-accept="${id}" ${activeUeb().length>=MAXACT?"disabled":""}>Noch einmal</button>`}</div><button class="mini" data-ushare="${id}">Mit jemandem machen</button>`,e.cat)}
function doneSheet(id){const e=U[id],v=S.ueb[id]||{};
  sheet(`<div class="label">Geschafft</div><h2>${e.t}</h2>${v.checks&&Object.keys(v.checks).length?`<div class="dcurve"><span class="label">Deine Zwischenstationen</span>${spark(v)}</div>`:""}<p class="lead">Wie war es? Deine Antwort bleibt auf diesem Gerät.</p><div class="chips" id="moods">${[["gut","Hat mir gutgetan"],["mix","Gemischt"],["nein","Eher nicht"]].map(([k,n])=>`<button class="chip" data-mood="${k}" aria-pressed="false">${n}</button>`).join("")}</div><label class="label" for="note">Was nimmst du mit?</label><textarea id="note" placeholder="Ein, zwei Sätze reichen."></textarea><div class="row"><button class="btn primary" id="savedone" data-id="${id}">Speichern</button></div>`,e.cat);
  $("#moods").addEventListener("click",ev=>{const c=ev.target.closest("[data-mood]");if(!c)return;$("#moods").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===c))})}

/* ---------- Vertiefen ---------- */
const EVTXT=["Ein philosophischer Gedanke, ein Zeitzeugnis oder ein Denkmodell. Kein empirischer Befund, aber ein Denkanstoß.","Erste Studien deuten in diese Richtung, aber sie sind klein, neu oder widersprechen sich teilweise.","Mehrere gute Studien kommen zu einem ähnlichen Ergebnis. Die Größe des Effekts ist aber noch umstritten.","Viele Studien und Übersichtsarbeiten bestätigen den Befund. Daran zweifelt kaum noch jemand."];
function goBtn(kind,id,c,label,title){return `<button class="go" ${cc(c)} data-${kind}="${id}"><span class="tx"><small>${dot(c)}${label}</small><b>${title}</b></span><span class="arr" aria-hidden="true">→</span></button>`}
function deepSheet(b){const w=W[b.w],u=U[b.ue];const pr=PROBEN.find(p=>!S.proben[p.id]&&p.o.some(o=>o.w.includes(b.w)))||PROBEN.find(p=>p.o.some(o=>o.w.includes(b.w)));
  const rel=IMPULSE.filter(o=>o.cat===b.cat&&o.id!==b.id&&!S.read[o.id]);const more=(rel.length?rel:IMPULSE.filter(o=>o.cat===b.cat&&o.id!==b.id)).slice(0,2);
  sheet(`<div class="deep"><div class="label">Für dich</div><h2>${b.t}</h2><p class="ask">${b.tip}</p>
  ${w?`<h3>Der Wert dazu</h3>${goBtn("wert",w.id,w.cat,S.kern.includes(w.id)?"Deine Stütze":"Wert",w.n)}`:""}
  ${pr?`<h3>Auf die Probe stellen</h3>${goBtn("probe-open",pr.id,pr.cat,"Belastungsprobe",pr.t)}`:""}
  ${u?`<h3>Im Alltag leben</h3>${goBtn("ueb",u.id,u.cat,(S.ueb[u.id]&&S.ueb[u.id].status==="active")?"Läuft gerade":"Übung · "+(u.d===1?"heute":u.d+" Tage"),u.t)}`:""}
  <h3>Weiter im Bereich ${CATS[b.cat].n}</h3>${more.map(o=>goBtn("open",o.id,o.cat,EV[o.ev],o.t)).join("")}</div>`,b.cat)}
function evSheet(b){
  sheet(`<div class="deep"><div class="label">Wie sicher?</div><h2>${b.t}</h2><p class="lead">${b.c}</p>
  <h3>So ordnen wir die Gedanken ein</h3><div class="evscale">${[3,2,1,0].map(l=>`<div class="${b.ev===l?"on":""}">${evHTML(l)}<p>${EVTXT[l]}</p></div>`).join("")}</div>
  <p class="src"><a href="${esc(b.u)}" target="_blank" rel="noopener">${b.src} ↗</a></p>
  <p class="muted small">Forschung beschreibt meist Durchschnitte, Philosophie bietet Gründe zum Abwägen. Ob ein Gedanke für dich trägt, zeigt sich erst, wenn du ihn prüfst.</p></div>`,b.cat)}
function sheet(html,cat){const l=$("#layer");const fresh=!l.innerHTML;if(fresh)pushNav();l.innerHTML=`<div class="sheet${fresh?"":" swap"}" id="sh"><div class="panel" role="dialog" aria-modal="true" ${cat?cc(cat):""}><span class="grab" aria-hidden="true"></span><button class="close" id="shx" aria-label="Schließen">×</button>${html}</div></div>`;
  $("#sh").addEventListener("click",e=>{if(e.target.id==="sh"||e.target.id==="shx")closeSheet()})}
function closeSheet(){const l=$("#layer"),s=$("#sh");if(!s||calm()){l.innerHTML="";return}s.classList.add("out");setTimeout(()=>{if(l.contains(s))l.innerHTML=""},260)}

/* ---------- Werte finden: einschätzen, abwägen, auswählen ---------- */
const FORDER=WERTE.filter(w=>!w.fund).map(w=>w.id);
function F(){if(!S.find||S.find.v!==2)S.find={v:2,a:{},hist:[],stage:"sort"};return S.find}
/* Aus den Antworten auf alltägliche Sätze wird für jeden Wert ein Gewicht. Werte, die in mehr Sätzen vorkommen, werden etwas abgefedert. */
function fScores(){const f=F(),raw={},cap={};SAETZE.forEach((st,i)=>{const a=f.a[i];if(a==null)return;st.w.forEach((w,j)=>{const g=j?.6:1;raw[w]=(raw[w]||0)+a*g;cap[w]=(cap[w]||0)+2*g})});
  const sc={};Object.keys(raw).forEach(w=>{if(raw[w]>0)sc[w]=raw[w]/Math.sqrt(cap[w])});return sc}
function fWhy(id){const f=F();const i=SAETZE.findIndex((st,i)=>f.a[i]===2&&st.w[0]===id);const j=i>=0?i:SAETZE.findIndex((st,i)=>f.a[i]===2&&st.w.includes(id));return j>=0?SAETZE[j].t:""}
const fCount=v=>Object.values(F().a).filter(x=>x===v).length;
function fCands(){const sc=fScores();return Object.keys(sc).sort((a,b)=>(sc[b]-sc[a])||(FORDER.indexOf(a)-FORDER.indexOf(b))).slice(0,8)}
function fStartDuel(){const f=F(),c=fCands();if(c.length<=5){f.stage="result";f.c=c;f.sc={};f.pick=c.slice();persist();return}
  f.stage="duel";f.c=c;f.sc=Object.fromEntries(c.map(id=>[id,0]));f.round=1;f.rounds=c.length<=8?3:2;f.played=[];f.done=0;f.total=f.rounds*Math.floor(c.length/2);f.pairs=fPairs();f.pi=0;persist()}
function fPairs(){const f=F();const s=f.c.slice().sort((a,b)=>(f.sc[b]-f.sc[a])||(hashStr(a+f.round)-hashStr(b+f.round)));const pairs=[],used=new Set(),key=(a,b)=>[a,b].sort().join("|");
  for(let i=0;i<s.length;i++){if(used.has(s[i]))continue;let j=i+1;while(j<s.length&&(used.has(s[j])||f.played.includes(key(s[i],s[j]))))j++;
    if(j>=s.length){j=i+1;while(j<s.length&&used.has(s[j]))j++}if(j>=s.length){f.sc[s[i]]+=.5;used.add(s[i]);continue}used.add(s[i]);used.add(s[j]);pairs.push([s[i],s[j]])}
  return pairs}
function fRank(){const f=F();return f.c.slice().sort((a,b)=>((f.sc[b]||0)-(f.sc[a]||0))||(FORDER.indexOf(a)-FORDER.indexOf(b)))}
function fDuel(win){const f=F(),[a,b]=f.pairs[f.pi];if(win==="both"){f.sc[a]+=.5;f.sc[b]+=.5}else f.sc[win]+=1;f.played.push([a,b].sort().join("|"));f.pi++;f.done++;
  if(f.pi>=f.pairs.length){f.round++;f.pairs=f.round<=f.rounds?fPairs():[];f.pi=0;if(!f.pairs.length){f.stage="result";f.pick=fRank().slice(0,5)}}persist()}
function finderView(){const f=F(),steps=["Einschätzen","Abwägen","Auswählen"],si={sort:0,duel:1,result:2}[f.stage]||0;
  const head=`<div class="fsteps">${steps.map((t,i)=>`<span class="${i===si?"on":i<si?"ok":""}"><i></i>${t}</span>`).join("")}</div>`;
  if(f.stage==="sort"){const i=SAETZE.findIndex((_,k)=>f.a[k]==null);if(i<0){fStartDuel();return finderView()}const st=SAETZE[i],n=Object.keys(f.a).length,c2=fCount(2),w=W[st.w[0]];
    return head+`<div class="fbar"><i style="width:${Math.round(n/SAETZE.length*100)}%"></i></div><p class="fq">Wie sehr stimmt das für dich?</p>
     <div class="fcard" ${cc(w.cat)}><span class="rodmark" aria-hidden="true"></span><span class="label">Satz ${i+1} von ${SAETZE.length}</span><p class="fst">${st.t}</p></div>
     <div class="fbtns"><button class="btn primary" data-frate="2">Stimmt</button><button class="btn" data-frate="1">Teils</button><button class="btn" data-frate="0">Eher nicht</button></div>
     <div class="fmeta"><span class="label">${c2} × stimmt</span>${f.hist.length?`<button class="linkbtn" id="fundo">Zurück</button>`:""}</div>
     ${n>=18&&fCands().length>=5?`<button class="linkbtn" id="fskip">Genug Sätze, weiter zum Abwägen</button>`:""}
     <p class="muted small">Es gibt keine richtigen Antworten. Antworte so, wie du bist, nicht wie du gern wärst.</p>`}
  if(f.stage==="duel"){const [a,b]=f.pairs[f.pi],A=W[a],B=W[b];
    return head+`<div class="fbar"><i style="width:${Math.round(f.done/Math.max(1,f.total)*100)}%"></i></div><p class="fq">Angenommen, beides geht gerade nicht zusammen. Was wiegt für dich schwerer?</p>
     <div class="fduel">${[A,B].map(w=>`<button class="fopt" ${cc(w.cat)} data-fduel="${w.id}"><span class="rodmark" aria-hidden="true"></span><b>${w.n}</b><span>${w.d}</span></button>`).join(`<span class="fvs" aria-hidden="true">oder</span>`)}</div>
     <div class="fmeta"><span class="label">Abwägung ${f.done+1} von etwa ${f.total}</span><button class="linkbtn" data-fduel="both">Kann ich nicht entscheiden</button></div>`}
  const rank=f.c&&f.c.length?fRank().slice(0,8):[];f.pick=(f.pick||[]).filter(id=>rank.includes(id));
  return head+`<p class="fq">Diese Werte haben sich bei dir durchgesetzt. Du kannst noch tauschen, bis zu fünf bleiben.</p>
   <div class="fres">${rank.map((id,i)=>{const w=W[id],on=f.pick.includes(id);return `<button class="fr ${on?"on":""}" ${cc(w.cat)} data-fpick="${id}" aria-pressed="${on}"><span class="rodmark" aria-hidden="true"></span><span class="tx"><b>${w.n}</b><small>${w.d}</small>${fWhy(id)?`<em class="why">Du hast gesagt: „${fWhy(id)}“</em>`:""}</span><span class="ck" aria-hidden="true"></span></button>`}).join("")}</div>
   ${S.kern.length?`<p class="muted small">Deine bisherigen Stützen werden ersetzt. Deine Leitsätze bleiben gespeichert und tauchen wieder auf, wenn du einen Wert erneut wählst.</p>`:""}
   <div class="row"><button class="btn primary" id="fapply" ${f.pick.length?"":"disabled"}>${f.pick.length} als Stützen übernehmen</button><button class="linkbtn" id="frestart">Neu beginnen</button></div>`}
function finder(){const l=$("#layer");if(!$("#finder")){sheet(`<div id="finder" class="finder"></div>`);$("#sh").classList.add("fsheet")}
  const box=$("#finder");box.innerHTML=finderView();const c=box.querySelector(".fcard,.fduel,.fres");if(c&&!calm())c.animate([{opacity:0,transform:"translateX(18px)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"})}
function finderClick(t,d){const f=F();
  if(d.finder){finder();return true}
  if(d.frate){const id=SAETZE.findIndex((_,k)=>f.a[k]==null);if(id<0)return true;f.a[id]=+d.frate;f.hist.push(id);persist();buzz(+d.frate===2?[8,30,10]:6);if(+d.frate===2)lightUp(t);setTimeout(finder,calm()?0:140);return true}
  if(t.id==="fundo"){const id=f.hist.pop();if(id!=null)delete f.a[id];persist();finder();return true}
  if(t.id==="fskip"){fStartDuel();finder();return true}
  if(d.fduel){if(d.fduel!=="both"){buzz([8,30,10]);lightUp(t);t.classList.add("won")}fDuel(d.fduel);setTimeout(finder,calm()?0:260);return true}
  if(d.fpick){const id=d.fpick;if(f.pick.includes(id))f.pick=f.pick.filter(x=>x!==id);else if(f.pick.length<5)f.pick.push(id);else{toast("Höchstens fünf. Nimm zuerst einen heraus.");return true}persist();buzz(5);finder();return true}
  if(t.id==="frestart"){S.find={v:2,a:{},hist:[],stage:"sort"};persist();finder();return true}
  if(t.id==="fapply"){const rank=fRank();S.kern=rank.filter(id=>f.pick.includes(id)).slice(0,5);f.stage="done";buzz([10,50,10,50,18]);closeSheet();setTimeout(toBuild,calm()?0:260);return true}
  return false}

/* ---------- Teilen ---------- */
const APP_URL="https://wurstgott.github.io/fernweh/wertegeruest/";
let shared=null,invited=null;
function firstSentence(s){const m=s.match(/^.*?[.!?](\s|$)/);return (m?m[0]:s).trim()}
async function shareOut(title,text,url){const full=text+"\n\n"+url;
  if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){if(e&&e.name==="AbortError")return}}
  try{await navigator.clipboard.writeText(full);toast("Text und Link kopiert.");return}catch(e){}
  sheet(`<div class="label">Zum Verschicken</div><h2>Text kopieren</h2><textarea id="sharetext" readonly style="min-height:200px">${esc(full)}</textarea>`);const ta=$("#sharetext");ta.focus();ta.select()}
function shareImp(b){shareOut(b.t,`Das hier hat mich zum Nachdenken gebracht: „${b.t}“. ${firstSentence(b.x)}\n\nEs stammt aus dem Wertegerüst, einer kleinen, kostenlosen App zum Nachdenken über eigene Werte. Den ganzen Gedanken mit Quelle findest du hier:`,APP_URL+"#i-"+b.id)}
function shareProbe(p){shareOut(p.t,`Eine Frage an dich: ${p.x}\n\nWas würdest du tun? Ich bin gespannt auf deine Antwort. Die Situation stammt aus dem Wertegerüst, einer kostenlosen App zum Nachdenken über Werte:`,APP_URL+"#p-"+p.id)}
function shareUeb(id){const e=U[id],v=S.ueb[id],st=v&&v.status==="active"?new Date(v.start):new Date();
  shareOut(e.t,`Hast du Lust, mit mir eine kleine Übung zu machen? Sie heißt „${e.t}“: ${firstSentence(e.x)}\n\n${v&&v.status==="active"?"Ich habe am":"Ich fange am"} ${st.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})} ${v&&v.status==="active"?"angefangen":"an"}. ${e.d===1?"Es dauert nur einen Tag.":`Es dauert ${e.d} Tage.`} Zu zweit fällt es leichter, und wir können uns erzählen, wie es läuft. Die Anleitung steht im Wertegerüst, einer kostenlosen App ohne Anmeldung:`,APP_URL+"#u-"+id)}
function shareApp(){shareOut("Wertegerüst","Ich habe eine kleine App entdeckt, mit der man sich klarer darüber wird, wofür man steht: das Wertegerüst. Man wählt fünf Werte als Stützen und baut sie mit kurzen Gedanken, kniffligen Entscheidungen und kleinen Übungen Schritt für Schritt aus. Sie ist kostenlos und braucht keine Anmeldung. Magst du sie mal ausprobieren?",APP_URL)}

/* ---------- Licht & Vibration: nur als Antwort auf Berührung ---------- */
const calm=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
let hapt=null;
function haptic(){if(!hapt){const l=document.createElement("label");l.setAttribute("aria-hidden","true");l.style.cssText="position:fixed;left:-99px;top:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none";
  const i=document.createElement("input");i.type="checkbox";i.setAttribute("switch","");i.tabIndex=-1;l.appendChild(i);document.body.appendChild(l);hapt=l}try{hapt.click()}catch(e){}}
function buzz(p){if(calm())return;if(navigator.vibrate){try{navigator.vibrate(p)}catch(e){}return}
  const pulses=Array.isArray(p)?p.filter((_,k)=>k%2===0).length:1,gaps=Array.isArray(p)?p.filter((_,k)=>k%2===1):[];
  haptic();let t=0;for(let k=1;k<pulses;k++){t+=(gaps[k-1]||60)+(Array.isArray(p)?p[k*2-2]:0);setTimeout(haptic,t)}}
function fx(){let l=document.getElementById("fx");if(!l){l=document.createElement("div");l.id="fx";document.body.appendChild(l)}return l}
/* weiches, mattes Licht hinter einem Element */
function lightUp(el,strong){if(calm()||!el)return;const r=el.getBoundingClientRect(),sz=Math.max(r.width,r.height,40)*(strong?4.2:2.6);const d=document.createElement("span");d.className="lamp";
  Object.assign(d.style,{left:(r.left+r.width/2-sz/2)+"px",top:(r.top+r.height/2-sz/2)+"px",width:sz+"px",height:sz+"px"});fx().appendChild(d);
  d.animate([{transform:"scale(.4)",opacity:0},{transform:"scale(.9)",opacity:strong?.9:.55,offset:.3},{transform:"scale(1.15)",opacity:0}],{duration:strong?1400:1000,easing:"cubic-bezier(.2,.7,.2,1)",fill:"both"}).onfinish=()=>d.remove()}
/* eine Linie zeichnet sich einmal um das Element und verschwindet */
function trace(el,col){if(calm()||!el)return;const r=el.getBoundingClientRect(),cs=getComputedStyle(el),rad=parseFloat(cs.borderRadius)||0;
  const ns="http://www.w3.org/2000/svg",s=document.createElementNS(ns,"svg");s.setAttribute("class","trace");Object.assign(s.style,{left:(r.left-3)+"px",top:(r.top-3)+"px",width:(r.width+6)+"px",height:(r.height+6)+"px"});
  const q=document.createElementNS(ns,"rect");q.setAttribute("x",1);q.setAttribute("y",1);q.setAttribute("width",r.width+4);q.setAttribute("height",r.height+4);q.setAttribute("rx",rad+2);q.setAttribute("pathLength",100);q.style.stroke=col||"var(--lit)";s.appendChild(q);fx().appendChild(s);
  q.animate([{strokeDashoffset:100,opacity:1},{strokeDashoffset:0,opacity:1,offset:.6},{strokeDashoffset:0,opacity:0}],{duration:1100,easing:"cubic-bezier(.4,.1,.2,1)",fill:"both"}).onfinish=()=>s.remove()}
function ripple(e,el){if(calm())return;const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2;const d=document.createElement("span");d.className="ripple";
  Object.assign(d.style,{left:(e.clientX-r.left-s/2)+"px",top:(e.clientY-r.top-s/2)+"px",width:s+"px",height:s+"px"});el.appendChild(d);
  d.animate([{transform:"scale(0)",opacity:.2},{transform:"scale(1)",opacity:0}],{duration:700,easing:"cubic-bezier(.2,.7,.2,1)"}).onfinish=()=>d.remove()}
document.addEventListener("pointerdown",e=>{const el=e.target.closest(".btn,.chip,.opt,.li,.go,.next,.draw,.tag,.slot,.note");if(el&&!el.disabled&&!el.getAttribute("aria-disabled"))ripple(e,el)},{passive:true});

/* ---------- Erinnerungen über den eigenen Kalender ---------- */
const pad=n=>String(n).padStart(2,"0");
const icsDate=d=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const esc2=s=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
function remindPlan(id,mode){const e=U[id],v=S.ueb[id],start=new Date(),endDay=new Date(v.start+e.d*DAY);
  let first=new Date(),count=1,hour=8;
  if(mode==="morgen"){first.setDate(first.getDate()+1);hour=8}
  if(mode==="taeglich"){hour=19;if(first.getHours()>=19)first.setDate(first.getDate()+1);count=Math.max(1,Math.ceil((endDay-first)/DAY))}
  if(mode==="ende"){first=new Date(endDay.getTime()-DAY);hour=18;if(first<start)first=new Date()}
  first.setHours(hour,0,0,0);const end=new Date(first.getTime()+15*60000);
  return {e,first,end,count,text:`Wertegerüst: ${e.t}`,details:`${e.x}\n\n${e.s.map(s=>"• "+s).join("\n")}\n\n${APP_URL}#ueben`}}
function icsFor(p){return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wertegeruest//DE","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${p.e.id}-${Date.now()}@wertegeruest`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(p.first)}`,`DTEND:${icsDate(p.end)}`,p.count>1?`RRULE:FREQ=DAILY;COUNT=${p.count}`:"",`SUMMARY:${esc2(p.text)}`,`DESCRIPTION:${esc2(p.details)}`,`URL:${APP_URL}`,"BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${esc2(p.text)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n")}
function googleFor(p){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;let u=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(p.text)}&dates=${icsDate(p.first)}/${icsDate(p.end)}&ctz=${encodeURIComponent(tz)}&details=${encodeURIComponent(p.details)}`;if(p.count>1)u+=`&recur=${encodeURIComponent("RRULE:FREQ=DAILY;COUNT="+p.count)}`;return u}
let remindMode="taeglich";
function remindSheet(id){const e=U[id];const p=remindPlan(id,remindMode);const when=p.first.toLocaleString("de-DE",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
  sheet(`<div class="label">Erinnerung</div><h2>${e.t}</h2><p class="lead">Die Erinnerung landet in deinem eigenen Kalender. So meldet sich dein Handy zuverlässig, auch wenn die App geschlossen ist.</p>
  <div class="chips">${[["morgen","Morgen früh"],["taeglich","Jeden Abend bis zum Ende"],["ende","Am letzten Tag"]].map(([k,n])=>`<button class="chip" data-rmode="${k}" data-id="${id}" aria-pressed="${remindMode===k}">${n}</button>`).join("")}</div>
  <p class="label">${p.count>1?`${p.count}× täglich um 19 Uhr, zuerst ${when}`:when}</p>
  <div class="row"><button class="btn primary" data-ics="${id}">Apple- oder iPhone-Kalender</button><a class="btn" href="${googleFor(p)}" target="_blank" rel="noopener">Google Kalender</a></div>
  <p class="muted small">Der erste Knopf lädt eine Kalenderdatei, die auch Outlook und andere Kalender öffnen.</p>`,e.cat)}
function downloadFile(name,text){const url=URL.createObjectURL(new Blob([text],{type:"text/calendar;charset=utf-8"}));const l=document.createElement("a");l.href=url;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast("Kalenderdatei geöffnet. Du musst den Termin nur noch hinzufügen.")}

/* ---------- Navigation ---------- */
let shownDay=null;
function refreshHome(){const logo=$("#home"),newDay=shownDay&&todayKey()!==shownDay;shownDay=todayKey();
  window.scrollTo({top:0,behavior:calm()?"auto":"smooth"});buzz([6,40,6]);
  if(!calm()){logo.animate([{transform:"scale(1)"},{transform:"scale(.88)",offset:.3},{transform:"scale(1)"}],{duration:650,easing:"cubic-bezier(.3,.7,.2,1)"});lightUp(logo)}
  setTimeout(()=>{anim=true;render();const g=$(".gsvg .lit");if(g)lightUp(g);
    if(newDay){toast("Neuer Tag: Impuls und Probe des Tages sind frisch.");const d=document.querySelector(".today");if(d)setTimeout(()=>trace(d),300)}},calm()?0:300)}
function goHome(){anim=true;S.cur=null;shared=null;tab="geruest";persist();render();window.scrollTo(0,0)}
(()=>{let x0=null,y0=0,t0=0,card=null;
 document.addEventListener("touchstart",e=>{card=e.target.closest&&e.target.closest(".bite");if(!card||e.touches.length>1){card=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now()},{passive:true});
 document.addEventListener("touchmove",e=>{if(!card||x0===null)return;const dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;if(Math.abs(dx)>Math.abs(dy)*1.4&&!calm()){card.style.transform=`translateX(${dx*.3}px)`;card.style.opacity=1-Math.min(.35,Math.abs(dx)/600)}},{passive:true});
 document.addEventListener("touchend",e=>{if(!card||x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;const c=card;card=null;x0=null;
   const swipe=Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4&&Date.now()-t0<800;
   if(swipe&&dx<0){buzz(8);const b=pickImp();if(b){openImp(b.id);return}}
   if(swipe&&dx>0){buzz(8);backToImp();return}
   c.style.transition="transform .3s cubic-bezier(.2,.7,.2,1),opacity .3s";c.style.transform="";c.style.opacity="";setTimeout(()=>{c.style.transition=""},320)},{passive:true});
})();
let navDepth=0;
function pushNav(){try{history.pushState({wg:++navDepth},"")}catch(e){}}
window.addEventListener("popstate",()=>{navDepth=Math.max(0,navDepth-1);if($("#layer").innerHTML){closeSheet();return}if(tab==="imp"&&S.cur){backToImp();return}if(tab!=="geruest"){goHome()}});

/* ---------- Datum ---------- */
const dkey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey=()=>dkey(new Date());
const hashStr=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function dailyImp(){return IMPULSE[hashStr("wg-"+todayKey())%IMPULSE.length]}
function dailyProbe(){return PROBEN[hashStr("wgp-"+todayKey())%PROBEN.length]}
const SPECIAL={
 "01-27":{t:"Heute ist der Tag des Gedenkens an die Opfer des Nationalsozialismus. Am 27. Januar 1945 wurde Auschwitz befreit.",b:"namen",u:"namen"},
 "03-21":{t:"Heute ist der Internationale Tag gegen Rassismus.",b:"kontakt",u:"begegnung"},
 "04-22":{t:"Heute ist der Tag der Erde.",b:"grenzen",u:"fussabdruck"},
 "05-08":{t:"Heute vor über achtzig Jahren endete der Zweite Weltkrieg in Europa.",b:"grauzone",u:"namen"},
 "05-23":{t:"Heute ist der Tag des Grundgesetzes. Es beginnt mit dem Satz: Die Würde des Menschen ist unantastbar.",b:"kant",u:"grenzewuerde"},
 "06-05":{t:"Heute ist der Weltumwelttag.",b:"allmende",u:"genugwoche"},
 "09-21":{t:"Heute ist der Internationale Tag des Friedens.",b:"zornwaechter",u:"zivilplan"},
 "11-09":{t:"Heute wird an die Novemberpogrome von 1938 erinnert.",b:"entmenschlichung",u:"stolperstein"},
 "11-16":{t:"Heute ist der Internationale Tag der Toleranz.",b:"toleranzparadox",u:"gegenseite"},
 "12-10":{t:"Heute ist der Tag der Menschenrechte.",b:"kant",u:"grenzewuerde"}};
function specialToday(){const n=new Date();return SPECIAL[`${pad(n.getMonth()+1)}-${pad(n.getDate())}`]||null}

/* ---------- Zwischenstationen bei Übungen ---------- */
const CHECKW=["zäh","geht so","okay","gut","toll"];
const dayIdx=v=>Math.floor((new Date().setHours(0,0,0,0)-new Date(v.start).setHours(0,0,0,0))/DAY);
function spark(v){const c=v.checks||{},ks=Object.keys(c).map(Number).sort((a,b)=>a-b);if(!ks.length)return "";const w=120,h=28,mx=Math.max(...ks,1);
  const pts=ks.map(k=>[ks.length>1?4+(k/mx)*(w-8):w/2,h-4-(c[k]-1)/4*(h-8)]);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-label="Verlauf deiner Zwischenstationen">${pts.length>1?`<polyline points="${pts.map(p=>p.join(",")).join(" ")}"/>`:""}${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6"/>`).join("")}</svg>`}
function checkRow(id){const e=U[id],v=S.ueb[id];if(!(e.d>=3))return "";const di=dayIdx(v),has=v.checks&&v.checks[di]!=null;
  return `<div class="check"><div class="sh"><span class="label">Tag ${Math.min(e.d,di+1)} von ${e.d} · ${has?"heute eingetragen":"Wie läuft's?"}</span>${spark(v)}</div>${has?"":`<div class="cdots">${CHECKW.map((w,i)=>`<button class="cdot" data-check="${id}" data-val="${i+1}"><i></i><span>${w}</span></button>`).join("")}</div>`}</div>`}

/* ---------- Momente: selten und nüchtern ---------- */
const MOMENTS=[
 {id:"kern1",t:"Die erste Stütze",x:"Sie steht jetzt in deinem Gerüst. Mit jedem Bauteil kommt ein Stab dazu.",ok:()=>S.kern.length>=1},
 {id:"leit1",t:"Der erste Leitsatz",x:"Die App fragt in ein paar Tagen nach, ob du noch dazu stehst.",ok:()=>S.kern.some(hasLeit)},
 {id:"probe1",t:"Die erste Entscheidung",x:"Deine Wahl zählt für die Werte, die sie stärkt.",ok:()=>nPrDone()>=1},
 {id:"kern5",t:"Fünf Stützen",x:"Dein Gerüst hat jetzt alle Stützen. Ab jetzt geht es darum, sie zu festigen.",ok:()=>S.kern.length>=5},
 {id:"ueb1",t:"Die erste Übung",x:"Deine Notiz dazu findest du im Bautagebuch.",ok:()=>Object.values(S.ueb).some(v=>v&&v.status==="done")},
 {id:"fest1",t:"Zum ersten Mal bekräftigt",x:"Je öfter du einen Leitsatz bekräftigst, desto seltener fragt die App nach.",ok:()=>Object.values(S.leit).some(l=>l&&l.n>=1)},
 {id:"probe10",t:"Zehn Entscheidungen",x:"Im Bautagebuch zeigt sich jetzt deutlicher, welche Werte bei dir den Ausschlag geben.",ok:()=>nPrDone()>=10},
 {id:"steht",t:"Das Gerüst trägt",x:"Alle fünf Stützen stehen mindestens auf der dritten Stufe.",ok:()=>S.kern.length>=5&&S.kern.every(id=>level(id)>=3)},
 {id:"voll",t:"Das Gerüst steht",x:"Alle fünfundzwanzig Bauteile sind gesetzt. Es bleibt stabil, solange du es benutzt.",ok:()=>parts()>=25},
 {id:"all",t:"Alle Impulse gelesen",x:"Ab jetzt kommen die Impulse in größeren Abständen wieder.",ok:()=>Object.keys(S.read).length>=IMPULSE.length}];
let momentOpen=false;
function checkMoments(){if(momentOpen||$("#layer").innerHTML)return;const m=MOMENTS.find(m=>!S.moments[m.id]&&m.ok());if(!m)return;S.moments[m.id]=now();persist();const t0=now();setTimeout(()=>showMoment(m,t0),S.fresh.length||tab==="geruest"?1700:900)}
let lastTap=0;document.addEventListener("pointerdown",()=>{lastTap=now()},{passive:true,capture:true});
function showMoment(m,t0){if($("#layer").innerHTML||momentOpen||lastTap>t0){delete S.moments[m.id];persist();return}momentOpen=true;const d=document.createElement("div");d.className="moment";d.innerHTML=`<div class="mcard" role="dialog" aria-modal="true">${miniSVG("memb")}<p class="label">Ein Moment</p><h2>${m.t}</h2><p>${m.x}</p><button class="btn" id="mok">Weiter</button></div>`;
  document.body.appendChild(d);buzz([10,70,14]);setTimeout(()=>lightUp(d.querySelector(".memb"),true),200);
  const close=()=>{d.classList.add("out");momentOpen=false;setTimeout(()=>d.remove(),350)};d.addEventListener("click",e=>{if(e.target.closest("#mok")||e.target===d)close()})}

/* ---------- Gegen endloses Lesen ---------- */
let sessionReads=0,scrollHinted=false;
function maybeScrollHint(){if(!S.settings.antiScroll||scrollHinted||sessionReads<5)return false;scrollHinted=true;
  sheet(`<div class="label">Kleine Pause?</div><h2>Fünf Impulse am Stück</h2><p class="lead">Am meisten trägt ein Gedanke, wenn du ihn in einer Belastungsprobe prüfst oder im Alltag ausprobierst. Das baut auch an deinem Gerüst.</p>
   <div class="row"><button class="btn primary" data-tabgo="ueben">Eine Probe ansehen</button><button class="btn" id="shx2">Weiterlesen</button></div>
   <button class="linkbtn" id="nohint">Diesen Hinweis nicht mehr zeigen</button>`);return true}

/* ---------- Tägliche Erinnerung ---------- */
function dailyPlan(){const [h,mi]=(S.settings.remindTime||"08:00").split(":").map(Number);const f=new Date();f.setHours(h,mi,0,0);if(f<new Date())f.setDate(f.getDate()+1);
  return {first:f,end:new Date(f.getTime()+10*60000),text:"Wertegerüst: Impuls und Probe des Tages",details:`Ein kurzer Blick ins Wertegerüst: Impuls des Tages, Probe des Tages und dein nächster Bauschritt.\n\n${APP_URL}`}}
function dailyIcs(){const p=dailyPlan();downloadFile("wertegeruest-taeglich.ics",["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wertegeruest//DE","BEGIN:VEVENT",`UID:daily-${Date.now()}@wertegeruest`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(p.first)}`,`DTEND:${icsDate(p.end)}`,"RRULE:FREQ=DAILY",`SUMMARY:${esc2(p.text)}`,`DESCRIPTION:${esc2(p.details)}`,`URL:${APP_URL}`,"BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${esc2(p.text)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n"))}
function dailyGoogle(){const p=dailyPlan(),tz=Intl.DateTimeFormat().resolvedOptions().timeZone;return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(p.text)}&dates=${icsDate(p.first)}/${icsDate(p.end)}&ctz=${encodeURIComponent(tz)}&details=${encodeURIComponent(p.details)}&recur=${encodeURIComponent("RRULE:FREQ=DAILY")}`}

/* ---------- Willkommen ---------- */
function welcome(){if(S.welcomed||shared||invited)return;S.welcomed=now();persist();
  sheet(`<div class="wel">${miniSVG("memb")}<div class="label">Willkommen</div><h2>Ein Gerüst aus deinen Werten</h2>
   <p class="lead">Zuerst findest du in drei kurzen Schritten bis zu fünf Werte, die dich tragen. Sie werden die Stützen deines Gerüsts. Jede wächst um ein Bauteil, wenn du einen Leitsatz formulierst, dich in einer Belastungsprobe entscheidest, eine Übung machst und deinen Leitsatz später bekräftigst.</p>
   <p class="muted small">Es gibt keine richtigen Werte, die du übernehmen musst. Nur die Würde jedes Menschen ist als Fundament schon eingebaut. Alles bleibt auf deinem Gerät.</p>
   <div class="row"><button class="btn primary" data-finder="1">Meine Werte finden</button><button class="btn" id="shx2">Erst umsehen</button></div></div>`)}

/* ---------- Speichern: neue Bauteile erkennen ---------- */
const lvSnap=()=>Object.fromEntries(S.kern.map(id=>[id,level(id)]));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function save(){const cur=lvSnap(),old=S.lv||{},inc=[];Object.entries(cur).forEach(([id,l])=>{for(let k=(old[id]||0);k<l;k++)inc.push(id+":"+k)});
  S.lv=cur;if(inc.length){S.fresh=[...S.fresh.filter(x=>!inc.includes(x)),...inc];const last=inc[inc.length-1].split(":");
    setTimeout(()=>{if(tab!=="geruest")toast(`<b>Neues Bauteil</b> · ${W[last[0]].n} steht jetzt auf Stufe ${+last[1]+1}`);renderTabs()},500)}
  persist()}
if(!S.lv){S.lv=lvSnap();persist()}

/* ---------- Rendern & Ereignisse ---------- */
function render(){
  const v={geruest:viewGeruest,imp:viewImp,ueben:viewUeben,werte:viewWerte}[tab]();
  const M=$("#main");M.classList.remove("anim");M.innerHTML=v;void M.offsetWidth;if(anim)M.classList.add("anim");anim=false;renderTabs();
  $("#app").dataset.tab=tab;
  $("#home").innerHTML=miniSVG();$("#topline").textContent=`${parts()} / 25`;
  if(tab==="geruest")playFresh();
  if(pendingGlow){pendingGlow=false;const c=document.querySelector('.bite h2');if(c&&S.cur&&I[S.cur])setTimeout(()=>lightUp(c),700)}
  checkMoments()}
function openProbe(id){if($("#layer").innerHTML)$("#layer").innerHTML="";pcur=id;pFilter="alle";anim=true;tab="ueben";render();const el=$("#probe");if(el){el.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});setTimeout(()=>trace(el,`var(--c-${P[id].cat})`),350)}}
document.addEventListener("click",e=>{
  if(e.target.closest){const lg=e.target.closest(".glegend [data-pil]");if(lg){pillarTap(lg.dataset.pil);return}if(e.target.closest("[data-wurde]")){buzz(6);valueSheet("wuerde");return}const g=e.target.closest(".gsvg");if(g){const h=e.target.closest("[data-pil]");if(h){pillarTap(h.dataset.pil);return}const sl=e.target.closest("[data-slot]");if(sl){buzz(6);if(!S.kern.length){finder();return}anim=true;tab="werte";render();window.scrollTo(0,0);return}if(e.target.closest(".slab")){buzz(6);valueSheet("wuerde");return}}}
  const t=e.target.closest("button,a");if(!t)return;const d=t.dataset;
  if(finderClick(t,d))return;
  if(t.closest(".bite .links")&&!t.dataset.lit){t.dataset.lit=1;buzz([6,30,10]);trace(t,getComputedStyle(t).getPropertyValue("--c").trim()||null);
    setTimeout(()=>{t.click();delete t.dataset.lit},calm()?0:380);return}
  if(t.id==="go"){sessionReads++;if(maybeScrollHint())return;const b=pickImp();if(!b)return;buzz(10);lightUp(t.querySelector(".stack"));t.classList.add("pull");setTimeout(()=>requestAnimationFrame(()=>openImp(b.id)),calm()?0:420);return}
  if(t.id==="next"){sessionReads++;if(maybeScrollHint())return;const b=pickImp();if(b)openImp(b.id);return}
  if(d.pick&&!t.getAttribute("aria-disabled")){const [pid,i]=d.pick.split(":");const p=P[pid];S.proben[pid]=Object.assign(S.proben[pid]||{},{o:+i,t:now()});buzz([8,40,12]);
    t.classList.add("chosen");lightUp(t);setTimeout(()=>{save();render();const el=$("#probe");if(el){const pk=el.querySelector(".opt.pick");if(pk)trace(pk,`var(--c-${p.cat})`);const rv=el.querySelector(".reveal");if(rv)rv.scrollIntoView({block:"nearest",behavior:calm()?"auto":"smooth"})}},calm()?0:380);return}
  if(d.psave){const v=S.proben[d.psave];if(v){v.r=$("#preason").value.trim();save();buzz([8,40,8]);toast("Gespeichert.")}return}
  if(d.previse){const v=S.proben[d.previse];if(v){v.o=null;save();render()}return}
  if(t.id==="pnext"){const cur=pcur;pcur=null;S.pskip=(S.pskip||0)+1;persist();let p=currentProbe();if(p&&p.id===cur){pcur=null;S.pskip++;p=currentProbe()}anim=true;render();const el=$("#probe");if(el)el.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});return}
  if(d.pshare){shareProbe(P[d.pshare]);return}
  if(d.probeOpen){openProbe(d.probeOpen);return}
  if(d.affirm){const L=S.leit[d.affirm];L.n=(L.n||0)+1;L.next=now()+FIV[Math.min(L.n,FIV.length-1)]*DAY;buzz([10,50,16]);const card=t.closest(".fest");if(card)lightUp(card);toast("Bekräftigt. Die App fragt später wieder nach.");setTimeout(()=>{save();anim=true;render()},calm()?0:450);return}
  if(d.leitsave){const id=d.leitsave,txt=$("#leittext").value.trim();if(!txt){toast("Schreib zuerst einen Satz.");return}const L=S.leit[id]||{n:0};const isNew=!L.t;L.t=txt;L.at=L.at||now();if(isNew||!L.next)L.next=now()+FIV[0]*DAY;S.leit[id]=L;buzz([8,40,12]);closeSheet();toBuild();return}
  if(d.kern){if(S.kern.length>=MAXKERN)return;S.kern.push(d.kern);buzz([10,40,10]);lightUp(t);closeSheet();setTimeout(toBuild,calm()?0:200);return}
  if(d.unkern){S.kern=S.kern.filter(x=>x!==d.unkern);save();buzz(8);valueSheet(d.unkern);render();return}
  if(d.wert){if(t.closest(".opt"))return;valueSheet(d.wert);return}
  if(d.gowlist){const l=$("#wlist");if(l)l.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});return}
  if(d.tabgo){if($("#layer").innerHTML)$("#layer").innerHTML="";anim=true;tab=d.tabgo;S.cur=null;render();window.scrollTo(0,0);return}
  if(d.ueb){uebSheet(d.ueb);return}
  if(d.ushare){shareUeb(d.ushare);return}
  if(d.check){const v=S.ueb[d.check];v.checks=v.checks||{};v.checks[dayIdx(v)]=+d.val;save();buzz([8,40,8]);render();toast("Eingetragen.");return}
  if(d.setting){if(d.setting==="hell"){S.settings.theme=S.settings.theme==="hell"?"dunkel":"hell";applyTheme()}else S.settings[d.setting]=!S.settings[d.setting];persist();buzz(6);render();return}
  if(t.id==="dailyics"){dailyIcs();return}
  if(t.id==="shx2"){closeSheet();return}
  if(t.id==="nohint"){S.settings.antiScroll=false;persist();closeSheet();toast("Alles klar. Die Einstellung findest du unter „Gerüst“.");return}
  if(t.id==="home"||t.id==="home2"){if(tab!=="geruest"||S.cur){goHome();return}refreshHome();return}
  if(t.id==="back"){backToImp();return}
  if(t.id==="share"&&S.cur){shareImp(I[S.cur]);return}
  if(t.id==="shareapp"){shareApp();return}
  if(t.id==="explore"){shared=null;S.cur=null;try{history.replaceState(null,"",location.pathname)}catch(x){}goHome();return}
  if(t.id==="save"&&S.cur){if(S.saved[S.cur])delete S.saved[S.cur];else{S.saved[S.cur]=now();toast("Gemerkt. Du findest es im Bautagebuch.")}persist();render();return}
  if(d.filter){if(S.filter===d.filter)return;S.filter=d.filter;persist();buzz(5);render();return}
  if(d.deep&&S.cur){const b=I[S.cur];buzz([8,40,10]);trace(t,`var(--c-${b.cat})`);setTimeout(()=>{d.deep==="ev"?evSheet(b):deepSheet(b)},calm()?0:420);return}
  if(d.daily){const id=d.daily;if(t.classList.contains("go2"))return;t.classList.add("go2");buzz([8,40,12]);lightUp(t);setTimeout(()=>openDaily(id,t),calm()?0:320);return}
  if(d.open){if($("#layer").innerHTML)$("#layer").innerHTML="";openImp(d.open);return}
  if(d.pfilter){pFilter=d.pfilter;pcur=null;S.pskip=0;buzz(5);render();return}
  if(d.ufilter){uFilter=d.ufilter;uMore=false;buzz(5);render();return}
  if(d.wfilter){wFilter=d.wfilter;buzz(5);render();return}
  if(t.id==="umore"){uMore=true;render();return}
  if(d.accept){if(activeUeb().length>=MAXACT)return;S.ueb[d.accept]={status:"active",start:now()};save();if($("#layer").innerHTML)$("#layer").innerHTML="";anim=true;tab="ueben";render();buzz([10,40,10]);{const c=document.querySelector(`[data-done="${d.accept}"]`);const card=c&&c.closest(".exp");if(card){card.scrollIntoView({block:"center"});trace(card,`var(--c-${U[d.accept].cat})`)}}toast("Übung angenommen.");return}
  if(t.id==="uother"){S.uskip=(S.uskip||0)+1;persist();render();return}
  if(d.drop){S.ueb[d.drop]={status:"dropped",start:S.ueb[d.drop].start,end:now()};save();render();return}
  if(d.remind){remindSheet(d.remind);return}
  if(d.rmode){remindMode=d.rmode;remindSheet(d.id);return}
  if(d.ics){const p=remindPlan(d.ics,remindMode);downloadFile(`wertegeruest-${d.ics}.ics`,icsFor(p));S.ueb[d.ics].remind=remindMode;persist();return}
  if(d.done){doneSheet(d.done);return}
  if(t.id==="savedone"){const id=t.dataset.id,m=document.querySelector('#moods [aria-pressed="true"]');S.ueb[id]=Object.assign(S.ueb[id]||{start:now()},{status:"done",end:now(),mood:m?m.dataset.mood:null,note:$("#note").value.trim()});buzz([12,60,18]);closeSheet();toBuild();return}
  if(t.id==="reset"){confirmReset=true;render();return}
  if(t.id==="resetno"){confirmReset=false;render();return}
  if(t.id==="resetyes"){S={read:{},saved:{},kern:[],leit:{},proben:{},ueb:{},filter:"alle",history:[],cur:null,settings:S.settings,moments:{},welcomed:S.welcomed,fresh:[],lv:{}};persist();confirmReset=false;render();toast("Alles zurückgesetzt.");return}
});
/* Nach einem Bauschritt: zum Gerüst, damit man das neue Teil einrasten sieht */
function toBuild(){save();if(S.fresh.length){anim=false;tab="geruest";S.cur=null;render();window.scrollTo({top:0,behavior:"auto"})}else render()}
let lastSum=0;document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("summary"))lastSum=Date.now()},true);
document.addEventListener("change",e=>{if(e.target.id==="rtime"){S.settings.remindTime=e.target.value||"08:00";persist();const g=$("#dailyg");if(g)g.href=dailyGoogle()}});
document.addEventListener("toggle",e=>{const t=e.target;const map={jfold:"jOpen",aboutfold:"aboutOpen",uebfold:"uebOpen",prfold:"prOpen",setfold:"setOpen",wqfold:"wqOpen"};if(map[t.id]){S[map[t.id]]=t.open;persist()}if(t.classList&&t.classList.contains("fold")&&t.open&&Date.now()-lastSum<600){const b=t.querySelector(".fbody");if(b&&!calm())b.animate([{opacity:0,transform:"translateY(-4px)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});buzz(5)}},true);
document.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("textarea,input"))return;
  if((e.key==="Enter"||e.key===" ")&&e.target.dataset&&e.target.dataset.pil){e.preventDefault();pillarTap(e.target.dataset.pil);return}
  if(e.key==="Escape"){if($("#layer").innerHTML)closeSheet();else if(tab==="imp"&&S.cur)backToImp();return}
  if(tab==="imp"&&e.key==="ArrowRight"&&!$("#layer").innerHTML){e.preventDefault();const b=pickImp();if(b)openImp(b.id)}
  if(tab==="imp"&&e.key==="ArrowLeft"&&S.cur)backToImp()});
function fromHash(){const h=location.hash.slice(1);if(["imp","werte","ueben","geruest"].includes(h)){tab=h;return}
  if(h.startsWith("i-")&&I[h.slice(2)]){shared=h.slice(2);openImp(shared)}
  if(h.startsWith("p-")&&P[h.slice(2)]){invited="p";pcur=h.slice(2);tab="ueben"}
  if(h.startsWith("u-")&&U[h.slice(2)]){invited=h.slice(2);tab="ueben";setTimeout(()=>uebSheet(invited),400)}}
if(location.hash)fromHash();
window.addEventListener("hashchange",()=>{fromHash();render()});
shownDay=todayKey();render();
const BUILD="__BUILD__";
function checkUpdate(){if(!/github\.io$/.test(location.hostname))return;
  fetch(location.pathname,{cache:"reload"}).then(r=>r.text()).then(t=>{const m=t.match(/const BUILD="([^"]+)"/);if(!m||m[1]===BUILD)return;
    let done=null;try{done=sessionStorage.getItem("wg-upd")}catch(e){}if(done===m[1])return;
    const go=()=>{if($("#layer").innerHTML||momentOpen||document.activeElement&&/TEXTAREA|INPUT/.test(document.activeElement.tagName)){setTimeout(go,4000);return}try{sessionStorage.setItem("wg-upd",m[1])}catch(e){}location.reload()};go()}).catch(()=>{})}
setTimeout(checkUpdate,1500);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkUpdate()});setTimeout(welcome,700);
})();
