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
/* Persönliche Beispiele (personal.js). Das Profil liegt optional in S.profil ({v,phase,nah,gruppe}); S.pfAsk merkt sich das
   Angebot in der Probe. Angezeigt wird immer die angepasste Fassung, ohne Profil mit neutralen Familienrollen.
   Geteilt und in den Kalender exportiert wird die neutrale Fassung (Profil null). Werte und Reihenfolge der Optionen bleiben gleich. */
const PRO=()=>S.profil&&typeof S.profil==="object"?S.profil:null;
const pv=(p,pr)=>p&&typeof personalisiereProbe==="function"?personalisiereProbe(p,pr===undefined?PRO():pr):p;
const ptl=p=>pv(p).t;
const uv=u=>u&&typeof personalisiereUebung==="function"?personalisiereUebung(u,PRO()):u;
const wb=w=>typeof personalisiereWert==="function"?personalisiereWert(w,PRO()).b:w.b;
/* Einstellungen. „Vibration“ hieß früher „Haptik“ (settings.haptik); der alte Wert wird übernommen. */
{const old=S.settings&&typeof S.settings==="object"&&!Array.isArray(S.settings)?S.settings:{};
 S.settings=Object.assign({antiScroll:true,remindTime:"08:00",theme:"dunkel",uebTime:"19:00"},old);
 if(typeof S.settings.vibration!=="boolean")S.settings.vibration=old.haptik!==false;delete S.settings.haptik}
S.moments=S.moments||{};S.leit=S.leit||{};S.proben=S.proben||{};S.ueb=S.ueb||{};S.saved=S.saved||{};S.read=S.read||{};S.history=S.history||[];S.fresh=S.fresh||[];
const CATKEYS=Object.keys(CATS);
const cc=c=>`style="--c:var(--c-${c})"`;
const dot=c=>`<span class="dot" ${cc(c)}></span>`;
const evHTML=l=>`<span class="ev"><i>${[1,2,3].map(k=>`<b class="${l>=k?"on":""}"></b>`).join("")}</i>${EV[l]}</span>`;
const fmtDate=t=>new Date(t).toLocaleDateString("de-DE",{day:"numeric",month:"short"});
const CHEV='<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* Toast: kurze Rückmeldung unten über der Reiterleiste. toast(html) genügt.
   Die Dauer richtet sich nach der Textlänge (2 s + 45 ms je Zeichen, höchstens 5 s). Solange ein Moment offen ist,
   wartet der Toast und erscheint danach. Liegt er über einem sichtbaren Eingabefeld, rückt er nach oben. */
let toastHeld=null,toastTimer=0;
/* toast(html,true): Rückmeldung zu einem Erfolg; davor zeichnet sich ein Haken. */
const typing=el=>!!el&&/TEXTAREA|INPUT/.test(el.tagName)&&!(el.classList&&el.classList.contains("hap"));
/* Liegt die Meldung über einem sichtbaren Eingabefeld? */
const covers=t=>{const r=t.getBoundingClientRect();return [...document.querySelectorAll("textarea,input:not([type=checkbox])")].filter(f=>!f.closest(".sheet.out")).some(f=>{const q=f.getBoundingClientRect();return q.height&&q.bottom>r.top-8&&q.top<r.bottom+8&&q.bottom>0&&q.top<innerHeight})};
function toast(m,ok){if(momentOpen){toastHeld=[m,ok];return}
  document.querySelectorAll(".toast:not(.undo)").forEach(x=>x.remove());clearTimeout(toastTimer);
  const t=document.createElement("div");t.className="toast"+(ok?" ok":"");t.setAttribute("role","status");t.setAttribute("aria-live","polite");t.innerHTML=(ok?CK:"")+m;document.body.appendChild(t);
  if(covers(t)||typing(document.activeElement))t.classList.add("raise");stackToasts();
  const ms=Math.min(5000,2000+45*(t.textContent||"").length);
  toastTimer=setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),320)},ms)}
function releaseToast(){if(!toastHeld)return;const [m,ok]=toastHeld;toastHeld=null;setTimeout(()=>toast(m,ok),250)}
/* Rückgängig: Vor jeder Aktion, die den Speicherstand ändert und dabei ein Fenster schließt oder die Ansicht wechselt,
   merkt sich snap() eine tiefe Kopie des Speicherstands (dazu Reiter und Probenzustand). undoToast() zeigt die Meldung
   mit dem Textknopf „Rückgängig“ sechs Sekunden lang. Eine neue Aktion ersetzt das Angebot. Rückgängig setzt den Stand
   zurück, speichert, zeichnet neu und öffnet bei Bedarf das Fenster wieder (o.reopen; o.after läuft nach dem Neuzeichnen).
   Die Meldung liegt an der üblichen Stelle; andere Meldungen rücken darüber, statt sie zu verdecken. Während ein Moment
   offen ist, wartet das Angebot und erscheint danach mit voller Zeit. */
const UNDO_MS=6000;let undoState=null,undoTimer=0;
const snap=()=>({s:JSON.stringify(S),tab,pcur,pBlind,pHint});
function undoToast(m,ok,sn,o){clearTimeout(undoTimer);undoState=Object.assign({m,ok,sn},o||{});if(momentOpen){document.querySelectorAll(".toast.undo").forEach(x=>x.remove());return}showUndo()}
function showUndo(){const u=undoState;if(!u)return;document.querySelectorAll(".toast.undo").forEach(x=>x.remove());
  const t=document.createElement("div");t.className="toast undo"+(u.ok?" ok":"");t.setAttribute("role","status");t.setAttribute("aria-live","polite");
  t.innerHTML=`<span class="um">${u.ok?CK:""}${u.m}</span><button class="ubtn" type="button">Rückgängig</button>`;document.body.appendChild(t);stackToasts();
  clearTimeout(undoTimer);undoTimer=setTimeout(endUndo,UNDO_MS)}
function endUndo(){clearTimeout(undoTimer);undoState=null;document.querySelectorAll(".toast.undo").forEach(x=>{x.classList.add("out");setTimeout(()=>{x.remove();stackToasts()},320)});stackToasts()}
/* Stapeln: Die Rückgängig-Meldung bleibt an ihrem Platz (oben, wenn sie sonst ein Eingabefeld verdecken würde).
   Eine andere Meldung am selben Rand rückt um ihre Höhe weiter nach innen. */
function stackToasts(){const u=document.querySelector(".toast.undo:not(.out)");
  if(u){u.classList.remove("raise");if(covers(u)||typing(document.activeElement))u.classList.add("raise")}
  document.querySelectorAll(".toast:not(.undo)").forEach(t=>{t.style.top="";t.style.bottom="";if(!u||t.classList.contains("raise")!==u.classList.contains("raise"))return;const r=u.getBoundingClientRect();
    if(u.classList.contains("raise"))t.style.top=(r.bottom+8)+"px";else t.style.bottom=(innerHeight-r.top+8)+"px"})}
/* Beginnt man zu schreiben, rückt die Rückgängig-Meldung aus dem Weg (nur bei Textfeldern, nie beim Antippen der Meldung selbst). */
document.addEventListener("focusin",e=>{if(typing(e.target)&&document.querySelector(".toast.undo:not(.out)"))stackToasts()});
function doUndo(){const u=undoState;if(!u)return;endUndo();
  /* Reine Ansichts-Einstellungen (aufgeklappte Bereiche, Einstellungen) bleiben, wie sie gerade sind. */
  const keep={settings:S.settings};["jOpen","aboutOpen","uebOpen","prOpen","setOpen","wqOpen"].forEach(k=>{if(k in S)keep[k]=S[k]});
  const was=S;S=Object.assign(JSON.parse(u.sn.s),keep);
  /* Pläne auf laufenden Karten werden beim Tippen gespeichert und sind keine Aktion: Rückgängig lässt sie, wie sie sind. */
  Object.keys(S.ueb||{}).forEach(uid=>{const a=S.ueb[uid],b=was.ueb&&was.ueb[uid];if(a&&b&&a.status==="active"&&a.start===b.start&&typeof b.plan==="string")a.plan=b.plan});tab=u.sn.tab;pcur=u.sn.pcur;pBlind=u.sn.pBlind;pHint=u.sn.pHint;confirmReset=false;
  clearTimeout(momentTimer);persist();applyTheme();
  if(!u.reopen&&$("#layer").innerHTML)$("#layer").innerHTML="";
  anim=false;render();if(u.reopen)u.reopen();if(u.after)u.after();toast("Rückgängig gemacht.")}
let anim=true,pendingGlow=false,momentOpen=false;
const applyTheme=()=>{document.documentElement.dataset.theme=S.settings.theme==="hell"?"light":"dark";const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=S.settings.theme==="hell"?"#E1E6F1":"#1D2850"};
applyTheme();

/* ---------- Das Gerüst: Stützen, Stufen, Streben ---------- */
const MAXKERN=5,FIV=[2,7,21,60,150];
/* Werte einer Probe-Option. Entscheidungen von vor der Textprüfung (19.10.2026) behalten die Werte, mit denen sie getroffen wurden,
   damit niemand Bauteile verliert. Eine neue Entscheidung nutzt die aktuellen Werte. */
const OW_ALT={"chatwitz":[["zivilcourage","wuerde"],["gewaltfreiheit","loyalitaet"],["gelassenheit","toleranz"]],"flugreise":[["folgerichtigkeit","zukunftsverantwortung"],["zuwendung","verlaesslichkeit"],["beteiligung","teilen"]],"vater":[["vergebung","selbstachtung"],["gelassenheit","freiheit"],["selbstachtung","verantwortlichkeit"]],"reparieren":[["sorgfalt","zukunftsverantwortung"],["mass","verantwortlichkeit"],["teilen","genuegsamkeit"]],"billigshirt":[["weitherzigkeit","folgerichtigkeit"],["freiheit","zuwendung"],["disziplin","genuegsamkeit"]]};
if(!S.owMig){Object.keys(OW_ALT).forEach(pid=>{const v=S.proben&&S.proben[pid];if(v&&v.o!=null&&!v.ow)v.ow=OW_ALT[pid]});S.owMig=1;persist()}
const pw=(pid,v,i)=>(v&&v.ow&&v.ow[i])||(P[pid]&&P[pid].o[i]?P[pid].o[i].w:[]);
function tested(id){return Object.entries(S.proben).some(([pid,v])=>{const p=P[pid];return p&&v&&v.o!=null&&p.o[v.o]&&pw(pid,v,v.o).includes(id)})}
/* Übungen, die nur das Gerüst selbst betreffen, zählen nicht als „im Alltag gelebt“. Bei früher abgeschlossenen
   mehrtägigen Übungen steht in v.days, an wie vielen Tagen man sie gemacht hat; ab einem Tag zählt sie. */
const META=["werteinventur","leitsatz"];
/* Begleitung der Übungen (Stand 20.10.2026). Ein Eintrag S.ueb[uid] ist der aktuelle Durchgang; frühere Durchgänge liegen
   unverändert in S.ueb[uid].runs. Neue Durchgänge tragen v:2, die beim Annehmen gewählte Stütze (fuer, null = ohne Stütze),
   den Plan (plan), die Tageseinträge (log: Tag → "ja" | "keine" | "nein") und beim Abschluss ok (zählt als gelebt).
   Alte Durchgänge ohne v:2 zählen weiter nach der alten Regel (Wert oder Bereich der Übung, ab einem Tag); Wert und Bereich
   von damals sind in lw/lc festgehalten, damit spätere Textänderungen in ueben.js kein Bauteil entziehen.
   EINMAL: mit einer einmaligen Handlung geschafft. GELEG: „Keine Gelegenheit“ verkleinert die Zahl der nötigen Tage.
   FREIWERT: Der Wert der Übung ist die gewählte Stütze. */
const EINMAL=new Set(["ehrlichesfeedback","entschuldigung","stolperstein","begegnung","reparatur","anpacken","weitergeben","vergebungsbrief"]);
const GELEG=new Set(["wenndann","neinsagen","widerspruch","grenzewuerde","grenzechat","eigeneworte","verstehen"]);
const FREIWERT=new Set(["wenndann","werttag"]);
const LOGW=[["ja","Gemacht"],["keine","Keine Gelegenheit"],["nein","Diesmal nicht"]];
const runsOf=uid=>{const v=S.ueb[uid];return v&&typeof v==="object"?[...(Array.isArray(v.runs)?v.runs:[]),v]:[]};
const nJa=r=>r&&r.log?Object.values(r.log).filter(x=>x==="ja").length:0;
/* Tage, ab denen eine mehrtägige Übung als geschafft gilt: rund 70 % der Dauer, mindestens 1 */
function needDays(uid,r){const e=U[uid];if(!e||e.d<=1||EINMAL.has(uid)||(r&&r.alt))return 1;let n=e.d;
  if(GELEG.has(uid)&&r&&r.log)n=Math.max(1,n-Object.values(r.log).filter(x=>x==="keine").length);return Math.max(1,Math.round(n*.7))}
function runCounts(uid,r){if(!r||r.status!=="done"||META.includes(uid))return false;return r.v===2?!!r.ok:(r.days==null||r.days>=1)}
function runFor(uid,r,id){if(r.v===2)return r.fuer===id;const e=U[uid],w=r.lw||(e&&e.w),c=r.lc||(e&&e.cat);return w===id||(!!W[id]&&c===W[id].cat)}
function livedCount(id){let n=0;Object.keys(S.ueb).forEach(uid=>runsOf(uid).forEach(r=>{if(runCounts(uid,r)&&runFor(uid,r,id))n++}));return n}
function lived(id){return livedCount(id)>0}
/* Vorschlag für die Stütze: der Wert der Übung, sonst eine Stütze aus demselben Bereich; bei FREIWERT sonst die erste Stütze. */
function defFuer(uid,hint){const u=U[uid];if(!u||META.includes(uid)||!S.kern.length)return null;if(hint&&S.kern.includes(hint))return hint;
  /* Zuerst eine Stütze, die noch nicht gelebt ist (wichtig bei „Noch einmal“), sonst dieselbe Reihenfolge ohne diese Bedingung */
  const pick=f=>{if(S.kern.includes(u.w)&&f(u.w))return u.w;return S.kern.find(k=>W[k].cat===u.cat&&f(k))||S.kern.find(k=>W[u.w]&&W[k].cat===W[u.w].cat&&f(k))||(FREIWERT.has(uid)?S.kern.find(f):null)};
  return pick(k=>!lived(k))||pick(()=>true)||null}
/* Umzug alter Speicherstände: alte Abschlüsse merken sich Wert und Bereich; laufende alte Übungen bekommen die vorgeschlagene Stütze. */
if(!S.uebMig){Object.keys(S.ueb).forEach(uid=>{const v=S.ueb[uid];if(!v||typeof v!=="object")return;
  runsOf(uid).forEach(r=>{if(r.v!==2&&U[uid]){if(!r.lw)r.lw=U[uid].w;if(!r.lc)r.lc=U[uid].cat}});
  if(v.status==="active"&&v.v!==2){v.v=2;v.fuer=defFuer(uid);v.alt=1;if(v.checks&&!v.log){v.log={};Object.keys(v.checks).forEach(k=>v.log[k]="ja")}}});S.uebMig=1;persist()}
function hasLeit(id){return !!(S.leit[id]&&S.leit[id].t)}
function affirmed(id){return !!(S.leit[id]&&S.leit[id].n>=2)}
function steps(id){const nl=livedCount(id);return [["Als Stütze gewählt",S.kern.includes(id)],["Leitsatz formuliert",hasLeit(id)],["In einer Belastungsprobe geprüft",tested(id)],[nl>1?`In ${nl} Übungen gelebt`:"In einer Übung gelebt",nl>0],["Leitsatz zweimal bekräftigt",affirmed(id)]]}
function level(id){if(!S.kern.includes(id))return 0;return steps(id).filter(s=>s[1]).length}
function dueLeit(){return S.kern.filter(id=>hasLeit(id)&&(S.leit[id].next||0)<=now())}
function tally(){const c={};Object.entries(S.proben).forEach(([pid,v])=>{const p=P[pid];if(p&&v&&v.o!=null&&p.o[v.o])pw(pid,v,v.o).forEach(w=>c[w]=(c[w]||0)+1)});return c}
function braces(){const set=new Set();Object.entries(S.proben).forEach(([pid,v])=>{const p=P[pid];if(!p||!v||v.o==null)return;const A=pw(pid,v,v.o),B=p.o.map((_,i)=>i).filter(i=>i!==v.o).flatMap(i=>pw(pid,v,i));
  A.forEach(a=>B.forEach(b=>{if(a!==b&&S.kern.includes(a)&&S.kern.includes(b))set.add([a,b].sort().join("|"))}))});return [...set].map(k=>k.split("|"))}
const parts=()=>S.kern.reduce((a,id)=>a+level(id),0);
function stabWord(s){if(!S.kern.length)return "Bauplan";if(s<8)return "Im Aufbau";if(s<16)return "Trägt schon";if(s<25)return "Stabil";return "Steht fest"}
/* Entschiedene Proben kommen nach etwa 60 Tagen „blind“ wieder: ohne die alte Wahl, danach mit Vergleich. */
const BLIND=60*DAY;
const decided=pid=>!!(S.proben[pid]&&S.proben[pid].o!=null);
const blindDue=pid=>{const v=S.proben[pid];return !!(P[pid]&&v&&v.o!=null&&v.t&&now()-v.t>=BLIND)};
/* Eine Probe für einen Wert: zuerst eine offene, dann eine fällige zum Wiederholen, dann eine schon entschiedene
   (mit Hinweis), zuletzt eine aus demselben Bereich. So führt der nächste Schritt nie ins Leere. */
function probeFor(id){const has=p=>p.o.some(o=>o.w.includes(id));
  const open=PROBEN.find(p=>has(p)&&!decided(p.id));if(open)return {p:open};
  const old=PROBEN.filter(p=>has(p)&&blindDue(p.id)).sort((a,b)=>S.proben[a.id].t-S.proben[b.id].t)[0];if(old)return {p:old,blind:true};
  const done=PROBEN.find(has);if(done)return {p:done,revisit:true};
  const cat=PROBEN.find(p=>p.cat===W[id].cat&&!decided(p.id))||PROBEN.find(p=>p.cat===W[id].cat);return cat?{p:cat,other:true}:null}
function nextFor(id){const w=W[id];let soft=null;
  if(!hasLeit(id))return {t:`Formuliere einen Leitsatz für ${w.n}.`,wert:id};
  if(!tested(id)){const f=probeFor(id);
    if(f&&!f.revisit&&!f.other)return f.blind?{t:`Prüfe ${w.n} noch einmal in der Probe „${ptl(f.p)}“, ohne deine alte Antwort zu sehen.`,probe:f.p.id,blind:true}:{t:`Prüfe ${w.n} in einer Belastungsprobe.`,probe:f.p.id};
    /* Kein offener Weg: ein weicher Schritt, der andere Stützen nicht blockiert */
    soft=f?{t:f.other?`Zu ${w.n} gibt es noch keine eigene Probe. Probier eine aus demselben Bereich.`:`Denk die Probe „${ptl(f.p)}“ noch einmal durch.`,probe:f.p.id,hint:id,soft:true}:{t:"Sieh dir die Belastungsproben an.",tabgo:"ueben",soft:true}}
  if(!lived(id)){const rel=u=>!META.includes(u.id)&&(u.w===id||u.cat===w.cat),st=u=>S.ueb[u.id]&&S.ueb[u.id].status;
    const act=activeUeb().find(x=>S.ueb[x].v===2?S.ueb[x].fuer===id:rel(U[x]));if(act)return {t:`Schließ die Übung „${uv(U[act]).t}“ ab.`,uebrun:act};
    const u=UEBUNGEN.find(u=>rel(u)&&u.w===id&&!st(u))||UEBUNGEN.find(u=>rel(u)&&!st(u))||UEBUNGEN.find(u=>rel(u));
    if(u&&activeUeb().length>=MAXACT)return {t:`Schließ zuerst eine laufende Übung ab. Danach kannst du ${w.n} in einer Übung leben.`,tabgo:"ueben"};
    if(u)return {t:`Lebe ${w.n} in der Übung „${uv(u).t}“.`,ueb:u.id,uhint:id};
    soft=soft||{t:"Sieh dir die Übungen an.",tabgo:"ueben",soft:true}}
  if(soft)return soft;
  if(!affirmed(id)){const L=S.leit[id];return {t:`Bekräftige deinen Leitsatz für ${w.n}, wenn die App nachfragt${L&&L.next>now()?`, voraussichtlich am ${fmtDate(L.next)}`:""}.`,wert:id,wait:true}}
  return null}
function blindOffer(){const p=PROBEN.filter(p=>blindDue(p.id)).sort((a,b)=>S.proben[a.id].t-S.proben[b.id].t)[0];
  return p?{t:`Vor einiger Zeit hast du die Probe „${ptl(p)}“ entschieden. Wenn du magst, entscheide sie noch einmal, ohne deine alte Antwort zu sehen.`,probe:p.id,blind:true,id:null}:null}
/* Laufende Übungen im nächsten Schritt, zurückhaltend: höchstens eine Übungsfrage am Tag (S.askDay merkt sich den Tag,
   an dem man darauf getippt hat). Gefragt wird nur, wenn die Frist um ist, wenn eine Übung schon geschafft ist (einmal je
   Durchgang, v.doneAsk) oder wenn gestern und heute nichts eingetragen ist. Sonst bleibt der Aufbauschritt; die laufende
   Übung ist im Reiter Üben erreichbar. Übungen ohne Frist fragen nie. */
function uebAsk(){const tk=todayKey();if(S.askDay===tk)return null;const act=activeUeb().filter(uid=>!S.ueb[uid].keep&&dayIdx(S.ueb[uid])>=1);
  for(const uid of act){const v=S.ueb[uid],e=uv(U[uid]);if(dayIdx(v)>=e.d)return {t:`Die Zeit für „${e.t}“ ist um. Wie lief es?`,uebrun:uid,fuer:v.fuer}}
  for(const uid of act){const v=S.ueb[uid],e=uv(U[uid]);if(!v.doneAsk&&(!v.doneAskDay||v.doneAskDay===todayKey())&&(e.d>1)&&nJa(v)>=needDays(uid,v)){if(!v.doneAskDay){v.doneAskDay=todayKey();persist()}return {t:`„${e.t}“ ist geschafft. Magst du die Übung abschließen?`,uebrun:uid,fuer:v.fuer,doneAsk:1}}}
  for(const uid of act){const v=S.ueb[uid],e=uv(U[uid]),di=dayIdx(v),lg=v.log||{};if(e.d>1&&!lg[di]&&!lg[di-1]&&nJa(v)<needDays(uid,v))return {t:`Wie lief „${e.t}“ in den letzten Tagen?`,uebrun:uid,fuer:v.fuer}}
  return null}
function nextStep(){const n=nextBuild(),a=n.finder?null:uebAsk();if(!a)return n;return Object.assign(a,{id:a.fuer&&S.kern.includes(a.fuer)?a.fuer:n.id})}
function nextBuild(){
  if(!S.kern.length)return {t:"Finde heraus, welche Werte dich tragen. Es dauert etwa fünf Minuten.",finder:true,id:null};
  let wait=null,soft=null;
  for(const id of S.kern){const n=nextFor(id);if(!n)continue;if(n.wait){if(!wait)wait=Object.assign(n,{id})}else if(n.soft){if(!soft)soft=Object.assign(n,{id})}else return Object.assign(n,{id})}
  if(S.kern.length<MAXKERN)return {t:"Wähle eine weitere Stütze.",tabgo:"werte",id:null};
  return soft||blindOffer()||wait||{t:"Dein Gerüst steht. Bleib im Gespräch mit dir: Impulse lesen, Proben entscheiden.",tabgo:"imp",id:null}}
const actAttr=n=>n.finder?`data-finder="1"`:n.wert?`data-wert="${n.wert}"`:n.uebrun?`data-uebrun="${n.uebrun}"${n.doneAsk?` data-doneask="1"`:""}`:n.ueb?`data-ueb="${n.ueb}"${n.uhint?` data-uhint="${n.uhint}"`:""}`:n.probe?`data-probe-open="${n.probe}"${n.blind?` data-blind="1"`:""}${n.hint?` data-phint="${n.hint}"`:""}`:`data-tabgo="${n.tabgo||"ueben"}"`;

/* Kurze Namen in zwei Zeilen fürs Gerüst */
const HY={selbstachtung:"Selbst-achtung",gelassenheit:"Gelassen-heit",loyalitaet:"Loyali-tät",verlaesslichkeit:"Verläss-lichkeit",dankbarkeit:"Dank-barkeit",gerechtigkeit:"Gerech-tigkeit",zivilcourage:"Zivil-courage",solidaritaet:"Solida-rität",gewaltfreiheit:"Gewalt-freiheit",beteiligung:"Betei-ligung",genuegsamkeit:"Genüg-samkeit",zukunftsverantwortung:"Verantwortung-für Kommende",ehrfurcht:"Ehrfurcht-vor dem Leben",naturverbundenheit:"Natur-verbundenheit",folgerichtigkeit:"Folge-richtigkeit",weitherzigkeit:"Weit-herzigkeit",wahrhaftigkeit:"Wahr-haftigkeit",differenzierung:"Differen-zierung",verantwortlichkeit:"Verant-wortlichkeit",demut:"Erkenntnis-demut",integritaet:"Integri-tät",zuwendung:"Zu-wendung",offenheit:"Offen-heit",vergebung:"Ver-gebung",muendigkeit:"Mündig-keit",echtheit:"Echt-heit",disziplin:"Diszi-plin",freiheit:"Frei-heit",wachstum:"Wachs-tum",fuersorge:"Für-sorge",vertrauen:"Ver-trauen",erinnerung:"Erin-nerung",toleranz:"Tole-ranz",sorgfalt:"Sorg-falt",fairness:"Fair-ness"};
const isWordBreak=id=>{const b=HY[id].split("-")[1];return b[0]===b[0].toLowerCase()};
const two=id=>{const n=W[id].n;if(n.length<=9||!HY[id])return [n];const [a,b]=HY[id].split("-");return [a+(isWordBreak(id)?"-":""),b]};
/* Für die schmalen Kacheln (Legende, Stützen-Plätze): Trennstellen nach Wortteilen als &shy;. Der Browser trennt nur dort,
   wo es nötig ist. Geprüft für alle 40 Namen bei 320 bis 430 px Breite. */
const SY={zukunftsverantwortung:"Verant·wor·tung",selbstachtung:"Selbst·ach·tung",gelassenheit:"Gelas·sen·heit",loyalitaet:"Loyali·tät",verlaesslichkeit:"Ver·läss·lich·keit",dankbarkeit:"Dank·bar·keit",gerechtigkeit:"Gerech·tig·keit",zivilcourage:"Zivil·courage",solidaritaet:"Solida·rität",gewaltfreiheit:"Gewalt·frei·heit",beteiligung:"Betei·li·gung",genuegsamkeit:"Genüg·sam·keit",naturverbundenheit:"Natur·ver·bun·den·heit",folgerichtigkeit:"Folge·rich·tig·keit",weitherzigkeit:"Weit·her·zig·keit",wahrhaftigkeit:"Wahr·haf·tig·keit",differenzierung:"Diffe·ren·zie·rung",verantwortlichkeit:"Verant·wort·lich·keit",demut:"Erkennt·nis·demut",integritaet:"Integri·tät",zuwendung:"Zu·wendung",offenheit:"Offen·heit",vergebung:"Ver·gebung",muendigkeit:"Mündig·keit",echtheit:"Echt·heit",disziplin:"Diszi·plin",freiheit:"Frei·heit",wachstum:"Wachs·tum",fuersorge:"Für·sorge",vertrauen:"Ver·trauen",erinnerung:"Erin·nerung",toleranz:"Tole·ranz",sorgfalt:"Sorg·falt",fairness:"Fair·ness"};
const shy=id=>SY[id]?SY[id].replace(/·/g,"&shy;"):SHORT[id]||W[id].n;

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
  const slots=slotsNow(),ns=nextStep(),rods=builtRods(slots);let defs="",ghost="",glowS="",body="",nodes="",net="",ties="",hits="";
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
    glowS+=ln(p,"",`style="stroke:var(--c-${r.cat})"`);hits+=rhit(p,`data-pil="${r.id}"`);nodes+=[r.a,r.b].map(q=>`<circle class="nd" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2.2"/>`).join("")});
  /* Die Wolke ruht über dem Fundament, gehalten von drei Seilen zu den untersten Punkten */
  let feet="";const low=rods.flatMap(r=>[r.a,r.b]).sort((p,q)=>q[1]-p[1]).slice(0,3).sort((p,q)=>p[0]-q[0]);low.forEach((p,i)=>{feet+=ln([p[0],p[1],[110,180,250][i],BASE],"ft")});
  if(!rods.length)[110,180,250].forEach(x=>{feet+=ln([x,CY+RY*.9,x,BASE],"ft gh")});
  const legend=`<div class="glegend">${slots.map((id,i)=>{if(!id)return `<button class="lg free" data-addslot="1"><span class="sw0"></span><span class="nm">frei</span></button>`;const w=W[id],l=level(id);
    return `<button class="lg" ${cc(w.cat)} data-pil="${id}" aria-label="${w.n}, Stufe ${l} von 5"><span class="nm">${shy(id)}</span><span class="pips">${[0,1,2,3,4].map(k=>`<i class="${k<l?"on":""}"></i>`).join("")}</span></button>`}).join("")}</div>`;
  hits+=rhit([40,BASE,320,BASE],'data-wurde="1" data-fund="1"');
  return `<div class="gbox"><svg class="gsvg" viewBox="0 6 360 300" role="img" aria-label="Dein Wertegerüst mit ${parts()} von 25 Bauteilen">
    <defs><filter id="gb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>${defs}</defs>
    <g class="ghost">${ghost}</g><g class="glow" filter="url(#gb)">${glowS}</g>${feet}${net}${body}${ties}${nodes}
    <g class="slab" role="button" aria-label="Fundament Würde">${ln([40,BASE,320,BASE],"base")}<rect class="hit" x="30" y="${BASE-22}" width="300" height="44"/></g>
    </svg><div class="rhits" aria-hidden="true">${hits}</div></div><div class="fundlbl" data-wurde="1">Würde · Fundament</div>${legend}`}
/* Tippstreifen über einem Stab: liegt in Viewbox-Einheiten (1 Einheit = 100cqw/360) genau auf dem Stab, 44 px hoch.
   Als echtes HTML-Element kann er den unsichtbaren Schalter für die iPhone-Vibration tragen. */
function rhit(p,data){const L=Math.hypot(p[2]-p[0],p[3]-p[1]),a=Math.atan2(p[3]-p[1],p[2]-p[0])*180/Math.PI,u=v=>`calc(${v.toFixed(2)}*100cqw/360)`;
  return `<span class="rhit" ${data} style="left:${u(p[0])};top:calc(${u(p[1]-6)} - 22px);width:${u(L)};transform:rotate(${a.toFixed(2)}deg)"></span>`}
/* Wo sich Stäbe kreuzen, überlappen ihre Tippstreifen. Darum zählt der Stab, der dem Finger am nächsten liegt. */
function nearRod(e){const svg=document.querySelector(".gsvg");if(!svg||!e.detail||!svg.getScreenCTM)return null;
  const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());let best=null,bd=1e9;
  svg.querySelectorAll(".rod").forEach(l=>{const x1=+l.getAttribute("x1"),y1=+l.getAttribute("y1"),x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),dx=x2-x1,dy=y2-y1;
    const t=Math.max(0,Math.min(1,((q.x-x1)*dx+(q.y-y1)*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(q.x-x1-t*dx,q.y-y1-t*dy);if(d<bd){bd=d;best=l.dataset.seg.split(":")[0]}});return best}
/* Resonanz: Beim angetippten Stab leuchten die Seile an seinen Enden einmal leise auf; der Stab selbst bleibt ruhig. Ohne Stab (id=null) antworten Fundament und Halteseile. */
function resonate(id){if(calm())return;const svg=document.querySelector(".gsvg");if(!svg)return;
  const segs=id?[...svg.querySelectorAll(`.rod[data-seg^="${id}:"],.gap[data-gap^="${id}:"]`)]:[...svg.querySelectorAll(".slab .base")];
  if(!id)segs.forEach(s=>s.animate([{transform:"translateY(0)"},{transform:"translateY(1.2px)",offset:.2},{transform:"translateY(-.6px)",offset:.5},{transform:"translateY(0)"}],{duration:520,easing:"ease-out"}));
  const ends=[];segs.filter(s=>s.classList.contains("rod")||!id).forEach(s=>{const x1=+s.getAttribute("x1"),y1=+s.getAttribute("y1"),x2=+s.getAttribute("x2"),y2=+s.getAttribute("y2");ends.push([x1,y1],[x2,y2])});
  const near=(x,y)=>ends.some(([a,b])=>Math.hypot(a-x,b-y)<(id?7:3)||(!id&&Math.abs(b-y)<1));
  svg.querySelectorAll(id?".cb":".ft").forEach(c=>{const x1=+c.getAttribute("x1"),y1=+c.getAttribute("y1"),x2=+c.getAttribute("x2"),y2=+c.getAttribute("y2");
    if(!near(x1,y1)&&!near(x2,y2))return;const o=+getComputedStyle(c).opacity;c.animate([{opacity:o},{opacity:Math.min(1,o+.45),offset:.3},{opacity:o}],{duration:700,easing:"ease-out"})})}
/* Eine einzelne Stütze innerhalb der Wolke, für die Übersicht unter „Werte“ */
function pillarSVG(id,i){let g="";for(let k=0;k<5;k++){const r=rod(k*5+i,id),on=id&&k<level(id);
    g+=`<line x1="${r.a[0].toFixed(0)}" y1="${r.a[1].toFixed(0)}" x2="${r.b[0].toFixed(0)}" y2="${r.b[1].toFixed(0)}" ${on?`stroke="var(--c-${W[id].cat})" stroke-width="14"`:`stroke="var(--ghost)" stroke-width="5" stroke-dasharray="6 14"`} stroke-linecap="round"/>`}
  return `<svg class="psvg" viewBox="30 20 300 260" aria-hidden="true">${g}</svg>`}
/* Zeichen in der Kopfzeile: drei Stäbe, die sich nicht berühren, über der Würde. Farben folgen hell/dunkel. */
const LOGO=`<svg viewBox="112 115 800 800" aria-hidden="true" stroke-linecap="round"><line x1="540" y1="187" x2="627" y2="456" stroke="var(--c-selbst)" stroke-width="126"/><line x1="764" y1="674" x2="488" y2="615" stroke="var(--c-naehe)" stroke-width="126"/><line x1="230" y1="624" x2="419" y2="415" stroke="var(--c-miteinander)" stroke-width="126"/><line x1="222" y1="863" x2="802" y2="863" stroke="var(--logo-w)" stroke-width="86"/></svg>`;
/* Kleine Wolke für Willkommen und Momente; ohne eigene Stützen ein Beispiel */
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
  anim="quick";tab=to;persist();render();window.scrollTo(0,0)});

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
   <button class="linkbtn fask" data-fnote="${id}">Gab es eine Lage, in der er gefragt war?</button>
   <div class="fnote" id="fnb-${id}" hidden><label class="label" for="fn-${id}">Gab es seit dem letzten Mal eine Lage, in der er gefragt war?</label><textarea id="fn-${id}" placeholder="Was war los, und wie hast du gehandelt? Ein, zwei Sätze reichen."></textarea><p class="muted small">Das ist freiwillig. Die Notiz landet im Bautagebuch, wenn du auf „Ja, das trägt“ tippst. Ein Leitsatz trägt auch dann, wenn du ihm nicht immer gerecht wirst.</p></div>
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
    <div class="sec"><div class="sh"><span class="label">Heute</span><span class="sdate">${new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})}</span></div>
      <div class="list today">
        <button class="li daily" data-daily="${db.id}"><span class="k">Impuls</span><span class="tx"><b class="dt">${db.t}</b><small>${CATS[db.cat].n}</small></span><span class="aside">${S.read[db.id]?"gelesen":"→"}</span></button>
        <button class="li" data-probe-open="${dp.id}" ${blindDue(dp.id)?`data-blind="1"`:""}><span class="k">Probe</span><span class="tx"><b>${ptl(dp)}</b><small>${blindDue(dp.id)?"Länger her. Noch einmal entscheiden?":decided(dp.id)?"entschieden":"Was würdest du tun?"}</small></span><span class="aside">→</span></button>
        ${sp?`<div class="special"><p>${sp.t}</p><div class="links">${sp.b&&I[sp.b]?`<button class="tag" data-open="${sp.b}">${dot(I[sp.b].cat)}${I[sp.b].t}</button>`:""}${sp.u&&U[sp.u]?`<button class="tag" data-ueb="${sp.u}">${dot(U[sp.u].cat)}Übung: ${U[sp.u].t}</button>`:""}</div></div>`:""}
      </div></div>
    ${leits.length?`<div class="sec"><div class="sh"><span class="label">Deine Leitsätze</span></div><div class="leits">${leits.map(id=>`<button class="leit" ${cc(W[id].cat)} data-wert="${id}"><small>${dot(W[id].cat)}${W[id].n}${S.leit[id].n?` · ${S.leit[id].n}× bekräftigt`:""}</small><q>${esc(S.leit[id].t)}</q></button>`).join("")}</div></div>`:""}
    ${journalFold()}
    ${settingsFold()}
    ${aboutFold()}
    <p class="footcredit">Wertegerüst · © 2026 Carlo Maximilian Engeländer</p>
  </section>`}
function pillarTap(id){const svg=document.querySelector(".gsvg");if(!svg)return;const w=W[id],l=level(id),n=nextFor(id);
  const was=svg.dataset.sel===id;if(was)resonate(id);svg.dataset.sel=was?"":id;svg.querySelectorAll(".rod").forEach(r=>r.classList.toggle("on",!was&&r.dataset.seg.startsWith(id+":")));
  svg.classList.toggle("sel",!was);document.querySelectorAll(".glegend .lg").forEach(b=>b.classList.toggle("on",!was&&b.dataset.pil===id));
  if(was){$("#ginfo").innerHTML="";return}
  const segs=[...svg.querySelectorAll(`.rod[data-seg^="${id}:"]`)];resonate(id);
  if(segs.length)lightUp(segs[segs.length-1]);
  $("#ginfo").innerHTML=`<div class="pinfo" ${cc(w.cat)}><div class="sh"><span class="label">${dot(w.cat)}${w.n}</span><span class="label">Stufe ${l} von 5</span></div>
   <ul class="steps5">${steps(id).map(([t,ok])=>`<li class="${ok?"ok":""}"><i></i>${t}</li>`).join("")}</ul>
   <div class="row">${n?`<button class="btn primary" ${actAttr(n)}>${n.wait?"Leitsatz ansehen":n.wert?"Leitsatz schreiben":n.probe?"Probe öffnen":n.ueb||n.uebrun?"Übung ansehen":"Weiter"}</button>`:""}<button class="btn" data-wert="${id}">Stütze öffnen</button></div></div>`;
  const pi=$("#ginfo .pinfo");if(pi&&!calm())pi.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"})}
/* Neue Stäbe zeichnen sich nacheinander ein. freshUntil merkt sich, wann das letzte Aufleuchten endet,
   damit ein Moment erst danach erscheint. Die Vibration dazu gibt es schon beim Tippen (buzz("ok")), nicht hier. */
let freshUntil=0;
function playFresh(){if(!S.fresh.length)return;const list=S.fresh.slice();S.fresh=[];persist();if(calm())return;
  freshUntil=now()+250+(list.length-1)*260+700+1400;
  list.forEach((key,i)=>{const r=document.querySelector(`.gsvg .rod[data-seg="${key}"]`);if(!r)return;const d=250+i*260,gp=document.querySelector(`.gsvg [data-gap="${key}"]`);
    [r,gp].forEach(x=>{if(!x)return;x.setAttribute("pathLength","100");x.style.strokeDasharray="100";x.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:850,delay:d,easing:"cubic-bezier(.5,0,.2,1)",fill:"backwards"}).onfinish=()=>{x.style.strokeDasharray=""}});
    setTimeout(()=>lightUp(r,true),d+700)})}

/* ---------- Bautagebuch, Einstellungen, Über ---------- */
function journalFold(){
  const nRead=Object.keys(S.read).length,nPr=nPrDone();
  /* Alle Durchgänge einer Übung, auch frühere: Abschlüsse mit Stimmung, Tagen, Plan oder Notiz; beendete nur mit Plan */
  const runs=Object.keys(S.ueb).filter(id=>U[id]).flatMap(id=>runsOf(id).map(r=>[id,r]));
  const done=runs.filter(([,r])=>r.status==="done");
  const t=tally(),top=Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const lv=S.kern.map(id=>[id,livedCount(id)]).filter(x=>x[1]>0);
  const optT=(p,o)=>p.o[o]?p.o[o].t:"";
  const journal=[...runs.filter(([,v])=>v.status==="done"?(v.note||v.mood||v.days!=null||v.plan):(v.status==="dropped"&&v.plan)).map(([id,v])=>({id,t:v.end||v.start,c:U[id].cat,title:uv(U[id]).t,
      sub:[v.status==="dropped"?"Beendet":v.mood?{gut:"Hat mir gutgetan",mix:"Gemischt",nein:"Eher nicht"}[v.mood]:"Übung",v.days==null?"":EINMAL.has(id)&&v.v===2?(v.days?"gemacht":""):v.keep?`an ${v.days} ${v.days===1?"Tag":"Tagen"}, ohne Frist weitergeführt`:`an ${v.days} von ${U[id].d} Tagen`,v.v===2&&v.fuer&&W[v.fuer]?`für ${W[v.fuer].n}`:""].filter(Boolean).join(" · "),plan:v.plan,note:v.note})),
    ...Object.entries(S.proben).filter(([id,v])=>P[id]&&v&&v.r).map(([id,v])=>({id,t:v.t,c:P[id].cat,title:ptl(P[id]),sub:"Belastungsprobe",note:v.r})),
    ...Object.entries(S.proben).filter(([id,v])=>P[id]&&v&&v.wq).map(([id,v])=>({id,t:v.wqt||v.t,c:"miteinander",title:ptl(P[id]),sub:"Prüfstein Würde",note:v.wq})),
    ...Object.entries(S.proben).filter(([id,v])=>P[id]&&v&&Array.isArray(v.hist)&&v.hist.length&&v.o!=null).map(([id,v])=>{const h=v.hist[v.hist.length-1];const q=pv(P[id]);return {id,t:v.t,c:q.cat,title:q.t,sub:"Erneut entschieden",note:`Damals: ${optT(q,h.o)} Heute: ${optT(q,v.o)}`}}),
    ...Object.entries(S.leit).filter(([id,L])=>W[id]&&L&&Array.isArray(L.notes)).flatMap(([id,L])=>L.notes.map(x=>({id,t:x.t,c:W[id].cat,title:`Leitsatz für ${W[id].n}`,sub:"Festigen",note:x.x})))].sort((a,b)=>b.t-a.t);
  const saved=Object.keys(S.saved).filter(id=>I[id]);const got=MOMENTS.filter(m=>S.moments[m.id]);
  return `<details class="fold" id="jfold" ${S.jOpen?"open":""}><summary><span>Bautagebuch</span>${CHEV}</summary><div class="fbody">
    <div class="tiles"><div><b>${nRead}</b><span>Impulse gelesen</span></div><div><b>${nPr}</b><span>Proben entschieden</span></div><div><b>${done.length}</b><span>Übungen geschafft</span></div></div>
    <p class="muted small">Hier verfällt nichts, wenn du eine Pause machst.</p>
    ${top.length?`<h3>Was in deinen Entscheidungen den Ausschlag gab</h3><div class="links">${top.map(([id,n])=>`<button class="tag" ${cc(W[id].cat)} data-wert="${id}">${dot(W[id].cat)}${W[id].n}<em>${n}</em></button>`).join("")}</div>`:""}
    ${lv.length?`<h3>Im Alltag gelebt</h3><div class="links">${lv.map(([id,n])=>`<button class="tag" ${cc(W[id].cat)} data-wert="${id}">${dot(W[id].cat)}${W[id].n}<em>${n}</em></button>`).join("")}</div>`:""}
    <h3>Notizen</h3>${journal.length?`<div class="journal">${journal.map(j=>`<div class="jr" ${cc(j.c)}><small>${fmtDate(j.t)} · ${j.sub}</small><b>${j.title}</b>${j.plan?`<p class="jplan">${esc(j.plan)}</p>`:""}${j.note?`<p>${esc(j.note)}</p>`:""}</div>`).join("")}</div>`:`<p class="muted small">Wenn du eine Übung abschließt oder eine Entscheidung begründest, erscheinen deine Notizen hier.</p>`}
    <h3>Gemerkte Impulse</h3>${saved.length?`<div class="list">${saved.map(id=>{const b=I[id];return `<button class="li" data-open="${id}">${dot(b.cat)}<span class="tx"><b>${b.t}</b><small>${b.src}</small></span></button>`}).join("")}</div>`:`<p class="muted small">Tippe bei einem Impuls auf „Merken“, um ihn hier wiederzufinden.</p>`}
    ${got.length?`<h3>Momente</h3><div class="moms">${got.map(m=>`<span class="mom">${m.t}<small>${fmtDate(S.moments[m.id])}</small></span>`).join("")}</div>`:""}
  </div></details>`}
let confirmReset=false;
function aboutFold(){return `<details class="fold" id="aboutfold" ${S.aboutOpen||confirmReset?"open":""}><summary><span>Über diese App</span>${CHEV}</summary><div class="fbody about">
  <p>Das Wertegerüst hilft dir, dir Schritt für Schritt klar zu werden, wofür du stehst. Es gibt keine richtigen Werte, die du übernehmen musst. Nur die Würde jedes Menschen ist als Fundament schon eingebaut, weil sie für alle gilt, auch für Menschen, deren Taten du entschieden ablehnst.</p>
  <h3>Warum es diese App gibt</h3><p>Das Wertegerüst ist nach einem Besuch in Auschwitz entstanden, den Carlo Maximilian Engeländer als Lehrer gemacht hat. Seitdem beschäftigt ihn eine Frage: Wie kann ich etwas entschieden ablehnen, ohne den Menschen dahinter zu entmenschlichen? Diese Frage steckt in vielen Impulsen und Proben der App.</p>
  <p>Werte geraten oft in Spannung zueinander. Das ist kein Zeichen von Haltlosigkeit, sondern normal. Stabil wird ein Gerüst, wenn du deine Werte kennst, sie in schwierigen Lagen abwägst und sie im Alltag lebst. Darum gibt es Impulse zum Nachdenken, Belastungsproben zum Entscheiden und Übungen zum Tun.</p>
  <h3>So wächst eine Stütze</h3><p>Jede Stütze hat fünf Bauteile: gewählt, Leitsatz, geprüft, gelebt und bekräftigt. Die Stäbe berühren sich kaum. Wie bei einer Tensegrity-Skulptur hält Spannung das Ganze zusammen: feine Seile verbinden benachbarte Stabenden, und wenn du in einer Belastungsprobe zwischen zwei deiner Werte abgewogen hast, kommt ein farbiges Spannseil dazu. Werte dürfen also in Spannung zueinander stehen. Gerade das macht das Gerüst stabil.</p>
  <h3>Wie sicher ist ein Impuls?</h3><div class="legend">${[3,2,1,0].map(l=>`<div>${evHTML(l)}<span class="muted">${["Philosophie, Zeitzeugnis oder Denkmodell","eine einzelne Studie oder nur Zusammenhänge","mehrere Studien, aber mit Grenzen","Meta-Analysen, große Längsschnitte oder sehr viele Studien"][l]}</span></div>`).join("")}</div>
  <p class="muted small">Stand der Recherche: Oktober 2026. App-Version vom __BUILD__ Uhr. Die App ersetzt keine Beratung oder Therapie. Wenn es dir schlecht geht, ist die Telefonseelsorge rund um die Uhr erreichbar: 0800 111 0 111. Alles, was du hier wählst, schreibst und entscheidest, bleibt nur in diesem Browser auf diesem Gerät.</p>
  <div class="row"><button class="btn" id="shareapp">App weiterempfehlen</button></div>
  <div class="row">${confirmReset?`<span>Wirklich alles löschen?</span><button class="btn primary" id="resetyes">Ja, löschen</button><button class="btn" id="resetno">Abbrechen</button>`:`<button class="linkbtn" id="reset">Fortschritt zurücksetzen</button>`}</div>
  <div class="credit"><span class="label">Von wem</span><p>Das Wertegerüst ist ein privates Projekt von <b>Carlo Maximilian Engeländer</b>. Idee, Auswahl, Texte und Gestaltung stammen von ihm.</p><p class="muted small">© 2026 Carlo Maximilian Engeländer. Alle Rechte vorbehalten. Du darfst die App gern nutzen und den Link weitergeben, auch im Unterricht. Inhalte, Texte und Gestaltung dürfen aber nicht ohne Erlaubnis kopiert, verändert oder anderswo veröffentlicht werden.</p></div>
 </div></details>`}
function settingsFold(){const sw=(id,on,label,sub)=>`<button class="setrow" data-setting="${id}" role="switch" aria-checked="${on}"><span><b>${label}</b><small>${sub}</small></span><span class="sw"><i></i></span></button>`;
  return `<details class="fold" id="setfold" ${S.setOpen?"open":""}><summary><span>Einstellungen</span>${CHEV}</summary><div class="fbody">
   ${sw("hell",S.settings.theme==="hell","Helle Ansicht","Statt der dunklen Ansicht eine helle, zum Beispiel für draußen.")}
   ${sw("vibration",S.settings.vibration!==false,"Vibration","Ein kurzer Tick, wenn du einen Knopf antippst, etwas auswählst oder etwas abschließt.")}
   ${sw("antiScroll",S.settings.antiScroll,"Hinweis gegen Endlos-Lesen","Nach fünf Impulsen hintereinander schlägt die App vor, etwas zu prüfen oder auszuprobieren.")}
   <div class="setrow static"><span><b>Tägliche Erinnerung</b><small>Ein täglicher Termin in deinem eigenen Kalender. Die App selbst schickt keine Nachrichten und sammelt keine Daten.</small></span></div>
   <div class="row"><input type="time" id="rtime" value="${S.settings.remindTime}" aria-label="Uhrzeit"><button class="btn" id="dailyics">Apple-Kalender</button><a class="btn" id="dailyg" href="${dailyGoogle()}" target="_blank" rel="noopener">Google Kalender</a></div>
   <div class="setrow static"><span><b>Erinnerung an Übungen</b><small>Diese Uhrzeit schlägt die App vor, wenn sie dir nach dem Annehmen einer Übung eine Erinnerung anbietet.</small></span></div>
   <div class="row"><input type="time" id="utimedef" value="${S.settings.uebTime}" aria-label="Uhrzeit für Übungs-Erinnerungen"></div>
   <h3 id="pfhead">Beispiele anpassen</h3>
   <p class="muted small">Damit die Beispiele in Proben und Übungen zu deinem Leben passen. Jede Frage ist freiwillig. Deine Angaben bleiben auf diesem Gerät.</p>
   ${pfForm()}
  </div></details>`}
/* Der kurze Check: drei freiwillige Fragen als Chips. Antippen wählt, erneutes Antippen hebt die Wahl auf.
   Bei der Lebensphase gilt eine Antwort, sonst beliebig viele. Bei den nahen Menschen erscheint nur das Paar
   aus Schule, Studium oder Arbeit, das zur Lebensphase passt (und was schon gewählt ist). */
function pfForm(){const pr=PRO()||{},ph=pr.phase||null,nah=pr.nah||[],gr=pr.gruppe||[];
  if(typeof PERSONAL_FRAGEN==="undefined")return "";
  const chip=(q,v,t,on)=>`<button class="chip" data-pf="${q}:${v}" aria-pressed="${on}">${t}</button>`;
  const q=(f,body)=>`<div class="pfq" role="group" aria-label="${f.frage}"><p class="pfl">${f.frage}</p><div class="chips wrap">${body}</div><p class="muted small">${f.hinweis}</p></div>`;
  const [F1,F2,F3]=PERSONAL_FRAGEN;
  const roles=F2.gruppen.flatMap(g=>g.nachPhase?g.optionen.filter(id=>(g.nachPhase[ph]||g.nachPhase._).includes(id)||nah.includes(id)):g.optionen);
  return `<div class="pfbox">${q(F1,F1.optionen.map(o=>chip("phase",o.v,o.t,ph===o.v)).join(""))}
    ${q(F2,roles.map(id=>chip("nah",id,ROLLEN[id].label,nah.includes(id))).join(""))}
    ${q(F3,F3.optionen.map(o=>chip("gruppe",o.v,o.t,gr.includes(o.v))).join(""))}
    ${PRO()?`<div class="row"><button class="linkbtn" id="pfdel">Angaben löschen</button></div>`:""}</div>`}
/* Sanftes Angebot, einmal beim ersten Öffnen einer Probe mit einem nahen Menschen. „Später“ fragt frühestens
   nach einer Woche wieder, „Nicht mehr fragen“ nie mehr. Wer den Check einmal benutzt hat, wird nicht mehr gefragt. */
const PF_LATER=7*DAY;
function pfOffer(p){if(typeof hatPersonRolle!=="function"||!hatPersonRolle(p.id)||PRO())return "";const a=S.pfAsk;
  if(a&&(a.nie||now()-(a.t||0)<PF_LATER))return "";
  return `<div class="pfoffer"><p>Hier geht es um einen Menschen, der dir nahesteht. Magst du solche Beispiele an dein Leben anpassen? Es sind drei kurze Fragen, und alles bleibt auf deinem Gerät.</p>
   <div class="row"><button class="btn" id="pfgo">Anpassen</button><button class="linkbtn" id="pflater">Später</button><button class="linkbtn" id="pfnie">Nicht mehr fragen</button></div></div>`}
function pfSheet(){sheet(`<div class="label">Beispiele anpassen</div><h2>Drei kurze Fragen</h2><p class="lead">Damit die Beispiele zu deinem Leben passen. Jede Frage ist freiwillig. Du kannst alles später in den Einstellungen ändern oder löschen.</p>${pfForm()}<div class="row"><button class="btn primary" id="pfdone">Fertig</button></div>`)}
/* Nach jeder Änderung: Ansicht neu zeichnen (die Probe darunter zeigt sofort die angepasste Fassung) und den Check im Blatt erneuern. */
function pfRefresh(){render();const b=document.querySelector("#layer .pfbox");if(b)b.outerHTML=pfForm()}

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
    <div class="slots">${[0,1,2,3,4].map(i=>{const id=S.kern[i];if(!id)return `<button class="slot" data-addslot="1">${pillarSVG(null,i)}<span class="sn">frei</span></button>`;const w=W[id],l=level(id);return `<button class="slot on" ${cc(w.cat)} data-wert="${id}">${pillarSVG(id,i)}<span class="sn">${shy(id)}</span></button>`}).join("")}</div>
    <p class="muted small fundline">Fundament in jedem Gerüst: <button class="linkbtn" data-wert="wuerde">die Würde jedes Menschen</button></p>
    ${due.length?due.map(festRow).join(""):""}
    <div class="sec" id="wlist"><div class="sh"><span class="label">Alle Werte</span><span class="label">${list.length}</span></div>${chips("wfilter",wFilter,cnt)}
      <div class="list">${list.map(w=>`<button class="li wli" data-wert="${w.id}" ${cc(w.cat)}>${dot(w.cat)}<span class="tx"><b>${w.n}</b><small>${w.d}</small></span>${w.fund?`<span class="pill">Fundament</span>`:S.kern.includes(w.id)?`<span class="pill on">Stütze</span>`:""}</button>`).join("")}</div></div>
    <details class="fold" id="wqfold" ${S.wqOpen?"open":""}><summary><span>Was ist ein Wertequadrat?</span>${CHEV}</summary><div class="fbody about">
      <p>Jeder Wert braucht eine Schwester, um gut zu bleiben. Ehrlichkeit ohne Taktgefühl wird verletzend, Taktgefühl ohne Ehrlichkeit wird zur Schönfärberei.</p>
      <p>Das Wertequadrat zeigt oben einen Wert und seine Schwester, unten jeweils ihr Zuviel. Wer zum Zuviel eines Werts neigt, wächst am besten in Richtung seiner Schwester. Wer zum Zuviel der Schwester neigt, wächst in Richtung des Werts.</p>
      <p class="muted small">Das Modell stammt von Paul Helwig und wurde von Friedemann Schulz von Thun bekannt gemacht. Es hilft besonders, wenn du dich zwischen zwei Werten hin- und hergerissen fühlst. Diese Ambivalenz ist kein Fehler, sondern ein Zeichen, dass beide etwas Richtiges wollen.</p>
    </div></details>
  </section>`}
/* Wertequadrat: Jeder der vier Begriffe lässt sich antippen und erklärt sich selbst und seinen Platz im Quadrat.
   Oben stehen Wert und Schwesterwert im Gleichgewicht (Doppelstrich). Senkrecht kippt jeder ohne sein Gegengewicht
   in sein Zuviel (gestrichelt). Schräg führt ein Pfeil vom Zuviel zum Gegengewicht gegenüber, also zum Weg heraus
   (zv → Schwesterwert, zs → Wert). Pfeile stehen nur für den Weg heraus, damit keine Linie eine falsche Ursache nahelegt. */
/* Begriffe wie „Blinde Gefolgschaft“ beginnen mit einem Adjektiv; mitten im Satz wird es kleingeschrieben. */
const mid=t=>/^[A-ZÄÖÜ][a-zäöüß]+(e|er|es|en|em) [A-ZÄÖÜ]/.test(t)?t[0].toLowerCase()+t.slice(1):t;
/* Feldbeschriftungen, spiegelbildlich. Die Würde hat kein Zuviel, darum heißt es dort „Würde ohne Klarheit“ und „Klarheit ohne Würde“. */
const wqLab=(w,r)=>w.fund?{w:"Fundament",s:"Schwesterwert",zv:"Würde ohne Klarheit",zs:"Klarheit ohne Würde"}[r]
  :{w:"Wert",s:"Schwesterwert",zv:`Zuviel von ${mid(w.n)}`,zs:`Zuviel von ${mid(w.s)}`}[r];
/* Weiche Trennstellen in sehr langen Wörtern, damit nichts abgeschnitten wird, auch wo der Browser nicht selbst trennt. */
const WQSEG=/(bereitschaft|fähigkeit|verantwortung|verbundenheit|überschätzung|gefälligkeit|verleugnung|optimierung|losigkeit|lichkeit|lichung|losung|gefolgschaft|zweifel|sichtigkeit|haftigkeit|samkeit|zwang|eifer)/g;
const wqHy=t=>t.split(" ").map(x=>x.length>11?x.replace(WQSEG,(s,_,i)=>i>2?"&shy;"+s:s):x).join(" ");
const WQKEY=`<div class="wqkey" aria-hidden="true"><span><svg viewBox="0 0 20 12" class="bal"><path d="M3 4H17M3 8H17"/></svg>Gleichgewicht</span><span><svg viewBox="0 0 20 12" class="v"><path d="M10 0V12"/></svg>kippt ab</span><span><svg viewBox="0 0 20 12" class="d"><path d="M3 11L17 1M11 1.2H17V6.5"/></svg>Weg heraus</span></div>`;
function wqHTML(w){const q=(r,t)=>`<button class="q ${r==="w"||r==="s"?"top":"bot"}" data-wq="${w.id}" data-role="${r}" aria-pressed="false" aria-controls="wqi-${w.id}"><small>${wqHy(wqLab(w,r))}</small><b>${wqHy(t)}</b></button>`;
  return `<div class="wq" ${cc(w.cat)} data-on=""><svg aria-hidden="true" focusable="false"></svg>
    ${q("w",w.n)}${q("s",w.s)}${q("zv",w.zv)}${q("zs",w.zs)}</div>${WQKEY}
    <div class="wqinfo" id="wqi-${w.id}" aria-live="polite">${wqDefault(w)}</div>`}
/* Zeichnet die Linien in Pixeln nach den tatsächlichen Kästchen (offset* ist unabhängig von der Einblend-Animation des Blatts).
   Ein ResizeObserver zeichnet neu, wenn Schrift, Breite oder Zeilenumbruch sich ändern. */
function wqDraw(box){const svg=box&&box.querySelector("svg");if(!svg)return;const q={};
  box.querySelectorAll(".q").forEach(b=>q[b.dataset.role]={x:b.offsetLeft,y:b.offsetTop,w:b.offsetWidth,h:b.offsetHeight});
  const BW=box.clientWidth,BH=box.clientHeight;if(!BW||!BH||!q.w||!q.s||!q.zv||!q.zs)return;
  const f=n=>Math.round(n*2)/2,P=(...a)=>a.map(([x,y],i)=>(i?"L":"M")+f(x)+" "+f(y)).join(""),g=5;
  const head=(x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1),L=7,s=.5;return P([x2-L*Math.cos(a-s),y2-L*Math.sin(a-s)],[x2,y2],[x2-L*Math.cos(a+s),y2-L*Math.sin(a+s)])};
  const arrow=(x1,y1,x2,y2)=>P([x1,y1],[x2,y2])+head(x1,y1,x2,y2);
  const yb=q.w.y+q.w.h/2,xa=q.w.x+q.w.w+g,xb=q.s.x-g,cx=r=>q[r].x+q[r].w/2;
  const dv=[q.zv.x+q.zv.w*.84,q.zv.y-g,q.s.x+q.s.w*.16,q.s.y+q.s.h+g],ds=[q.zs.x+q.zs.w*.16,q.zs.y-g,q.w.x+q.w.w*.84,q.w.y+q.w.h+g];
  svg.setAttribute("viewBox",`0 0 ${BW} ${BH}`);
  svg.innerHTML=`<g class="bal"><path d="${P([xa,yb-2.5],[xb,yb-2.5])+P([xa,yb+2.5],[xb,yb+2.5])}"/></g>`
    +`<g class="v vw"><path d="${P([cx("w"),q.w.y+q.w.h+g],[cx("zv"),q.zv.y-g])}"/></g><g class="v vs"><path d="${P([cx("s"),q.s.y+q.s.h+g],[cx("zs"),q.zs.y-g])}"/></g>`
    +`<g class="d dv"><path d="${arrow(...dv)}"/></g><g class="d ds"><path d="${arrow(...ds)}"/></g>`}
let wqRO=null;const wqBoxes=new Set();
function wqMount(){document.querySelectorAll(".wq").forEach(box=>{wqDraw(box);if(wqBoxes.has(box))return;wqBoxes.add(box);
    if(typeof ResizeObserver==="function"){if(!wqRO)wqRO=new ResizeObserver(es=>es.forEach(e=>wqDraw(e.target)));wqRO.observe(box)}});
  wqBoxes.forEach(box=>{if(!box.isConnected){wqBoxes.delete(box);if(wqRO)wqRO.unobserve(box)}});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>wqBoxes.forEach(wqDraw)).catch(()=>{})}
addEventListener("resize",()=>wqBoxes.forEach(wqDraw));
/* Die Satzschablonen nennen die Begriffe nur im Nominativ, nach einem Doppelpunkt oder nach „mehr“. So passen sie zu jedem Begriff,
   auch zu Mehrwortbegriffen, Zählwörtern und Plural („Ausreden“), ohne dass Kasus oder Artikel falsch werden. */
const wqDefault=w=>`<p class="muted small">${w.fund
  ?`Würde gilt für jeden Menschen und lässt sich nicht übertreiben. Wer sie aber betont, ohne Unrecht klar zu benennen, kippt in die Verharmlosung. Der Weg heraus führt zu mehr ${mid(w.s)}. ${w.s} ohne Achtung vor der Würde kippt in die Entmenschlichung. Der Weg heraus führt zurück zur Würde des Menschen.`
  :`${w.n} ohne ${mid(w.s)} kippt ins Zuviel: ${mid(w.zv)}. Der Weg heraus führt zu mehr ${mid(w.s)}. ${w.s} ohne ${w.n} kippt ins Zuviel: ${mid(w.zs)}. Der Weg heraus führt zu mehr ${w.n}.`} Tippe auf einen Begriff, um mehr zu erfahren.</p>`;
function wqInfo(w,r){const Q=(typeof QUAD!=="undefined"&&QUAD[w.id])||{},x=Q[r]||{};let name,lab,def,rel,sign="",ask;
  if(r==="w"){name=w.n;lab=w.fund?"Fundament":"Wert";def=w.d;ask=w.f;
    rel=w.fund?`Die Würde selbst lässt sich nicht übertreiben. Einseitig werden kann aber, wie man sie betont: Wer nur noch die Würde eines Menschen sieht und sein Unrecht nicht mehr benennt, kippt in die Verharmlosung. Darum braucht Würde als Gegengewicht ${mid(w.s)}. Beide halten sich im Gleichgewicht.`
      :`${w.n} braucht als Gegengewicht ${mid(w.s)}. Beide wollen etwas Richtiges und halten sich im Gleichgewicht. Fehlt das Gegengewicht, kippt ${w.n} leicht ins Zuviel: ${mid(w.zv)}.`}
  else if(r==="s"){name=w.s;lab=`Schwesterwert von ${w.n}`;def=x.d;ask=x.f;
    rel=w.fund?`${w.s} steht nicht gegen die Würde, sondern folgt aus ihr: Weil jeder Mensch zählt, zählt auch, was ihm angetan wird. Beide halten sich im Gleichgewicht. Fehlt aber die Achtung vor der Würde dessen, der Unrecht getan hat, kippt ${mid(w.s)} in die Entmenschlichung.`
      :`${w.s} steht nicht gegen ${w.n}. Beide wollen etwas Richtiges und halten sich im Gleichgewicht. Fehlt ${w.n}, kippt ${mid(w.s)} leicht ins Zuviel: ${mid(w.zs)}.`}
  else if(r==="zv"){name=w.zv;lab=wqLab(w,"zv");def=x.d;ask=x.f;sign=x.a;
    rel=w.fund?`Verharmlosung entsteht, wenn die Würde eines Menschen betont wird, ohne sein Unrecht klar zu benennen. Der Weg heraus führt schräg hinüber zu mehr ${mid(w.s)}. Wer nur das Gegenteil sucht, landet leicht in der Entmenschlichung.`
      :`Dieses Zuviel entsteht, wenn ${w.n} ohne ${mid(w.s)} gelebt wird. Der Weg heraus führt schräg hinüber zu mehr ${mid(w.s)}. Wer nur das Gegenteil sucht, landet leicht beim anderen Zuviel: ${mid(w.zs)}.`}
  else{name=w.zs;lab=wqLab(w,"zs");def=x.d;ask=x.f;sign=x.a;
    rel=w.fund?`Entmenschlichung entsteht, wenn ${mid(w.s)} die Würde des Menschen vergisst. Der Weg heraus führt schräg hinüber zurück zur Würde: Du lehnst die Tat entschieden ab und erkennst den Menschen trotzdem als Menschen an. Wer nur das Gegenteil sucht, landet leicht in der Verharmlosung.`
      :`Dieses Zuviel entsteht, wenn ${mid(w.s)} ohne ${w.n} gelebt wird. Der Weg heraus führt schräg hinüber zu mehr ${w.n}. Wer nur das Gegenteil sucht, landet leicht beim anderen Zuviel: ${mid(w.zv)}.`}
  return `<div class="wqcard" data-role="${r}"><div class="label">${lab}</div><h4>${name}</h4>${r==="zv"||r==="zs"?`<p class="wqless">${w.fund?(r==="zv"?`Hier fehlt ${mid(w.s)}.`:`Hier fehlt die Achtung vor der Würde.`):`Zu viel ${mid(r==="zv"?w.n:w.s)} ist zugleich zu wenig ${mid(r==="zv"?w.s:w.n)}.`}</p>`:""}${def?`<p>${def}</p>`:""}<p class="muted">${rel}</p>
    ${sign?`<div class="wqsign"><span class="label">Woran du es merkst</span><p>${sign}</p></div>`:""}${ask?`<p class="ask">${ask}</p>`:""}</div>`}
function wqTap(t){const box=t.closest(".wq"),id=t.dataset.wq,r=t.dataset.role,w=W[id],info=document.getElementById("wqi-"+id);if(!box||!w||!info)return;
  const was=box.dataset.on===r;box.dataset.on=was?"":r;box.querySelectorAll(".q").forEach(b=>b.setAttribute("aria-pressed",String(!was&&b.dataset.role===r)));
  info.innerHTML=was?wqDefault(w):wqInfo(w,r);if(!was&&!calm())info.firstElementChild.animate([{opacity:0},{opacity:1}],{duration:220,easing:"ease-out"})}
function valueSheet(id){const w=W[id],isK=S.kern.includes(id),L=S.leit[id]||{};
  const imps=IMPULSE.filter(b=>b.w===id).slice(0,2),prs=PROBEN.filter(p=>p.o.some(o=>o.w.includes(id))).slice(0,2),ues=UEBUNGEN.filter(u=>u.w===id).slice(0,2);
  const status=isK?`<h3>Bauteile dieser Stütze</h3><ul class="steps5" ${cc(w.cat)}>${steps(id).map(([t,ok])=>`<li class="${ok?"ok":""}"><i></i>${t}</li>`).join("")}</ul>`:"";
  const bsp=typeof LEITBSP!=="undefined"&&LEITBSP[id];
  const help=`<div class="lhelp"><p>${w.f}</p><p class="muted small">Denk auch an die Schwester von ${w.n}: ${w.s}. Ohne sie kippt ${w.n} leicht ins Zuviel: ${mid(w.zv)}.</p>${bsp?`<button class="linkbtn" data-lbsp="${id}">Beispiel ansehen</button><p class="lbsp muted small" hidden>Ein Beispiel, nicht zum Abschreiben: „${bsp}“ Dein eigener Satz darf ganz anders klingen.</p>`:""}</div>`;
  const leit=isK?`<h3>Dein Leitsatz</h3>${L.t?"":help}<div class="leitbox"><textarea id="leittext" placeholder="Ich stehe dafür ein, dass …">${esc(L.t||"")}</textarea><div class="row"><button class="btn primary" data-leitsave="${id}">Leitsatz speichern</button></div><p class="muted small">Ein guter Leitsatz ist konkret und gilt auch dann, wenn er dich etwas kostet. Die App fragt in wachsenden Abständen nach, ob du noch dazu stehst.</p></div>`:"";
  const btn=w.fund?`<div class="fundnote">Die Würde jedes Menschen ist das Fundament deines Gerüsts. Sie gilt für jeden, auch für Menschen, deren Taten du entschieden ablehnst. Deshalb ist sie in jedem Gerüst schon eingebaut.</div>`:
    `<div class="row">${isK?`<button class="btn" data-unkern="${id}">Nicht mehr als Stütze</button>`:`<button class="btn primary" data-kern="${id}" ${S.kern.length>=MAXKERN?"disabled":""}>Als Stütze wählen</button>`}</div>${!isK&&S.kern.length>=MAXKERN?`<p class="muted small">Du hast schon fünf Stützen. Nimm zuerst eine heraus, wenn du diese wählen möchtest.</p>`:""}`;
  sheet(`<div class="deep" ${cc(w.cat)}><div class="label">${dot(w.cat)}${CATS[w.cat].n} · ${w.fund?"Fundament":isK?"Deine Stütze":"Wert"}</div><h2>${w.n}</h2><p class="lead">${w.d}</p>
   ${btn}${status}${leit}
   <h3>Im Wertequadrat</h3>${wqHTML(w)}
   <h3>Frage an dich</h3><p class="ask">${w.f}</p>
   <p class="muted small">So kann ${w.n} im Alltag aussehen: ${wb(w)}</p>
   ${imps.length?`<h3>Gedanken dazu</h3>${imps.map(b=>goBtn("open",b.id,b.cat,EV[b.ev],b.t)).join("")}`:""}
   ${prs.length?`<h3>Auf die Probe stellen</h3>${prs.map(p=>goBtn("probe-open",p.id,p.cat,S.proben[p.id]&&S.proben[p.id].o!=null?"Belastungsprobe · entschieden":"Belastungsprobe",ptl(p))).join("")}`:""}
   ${ues.length?`<h3>Im Alltag leben</h3>${ues.map(u=>goBtn("ueb",u.id,u.cat,"Übung · "+(u.d===1?"heute":u.d+" Tage"),u.t)).join("")}`:""}
  </div>`,w.cat);wqMount()}

/* ---------- Üben: Belastungsproben und Übungen ---------- */
let pFilter="alle",pcur=null,uFilter="alle",uMore=false;
const nPrDone=()=>Object.keys(S.proben).filter(id=>P[id]&&S.proben[id].o!=null).length;
function currentProbe(){if(pcur&&P[pcur])return P[pcur];const list=PROBEN.filter(p=>pFilter==="alle"||p.cat===pFilter);const open=list.filter(p=>!(S.proben[p.id]&&S.proben[p.id].o!=null));const src=open.length?open:list;const p=src[(S.pskip||0)%(src.length||1)];pcur=p&&p.id;return p}
/* pBlind: diese Probe wird gerade „blind“ erneut entschieden. pHint: Wert, für den der nächste Schritt hierher geführt hat. */
let pBlind=null,pHint=null;
const dayFmt=t=>new Date(t).toLocaleDateString("de-DE",{day:"numeric",month:"long"});
function probeHint(p,v,done){const id=pHint;if(!id||!W[id]||!S.kern.includes(id)||tested(id))return "";const w=W[id],has=p.o.some(o=>o.w.includes(id));
  if(!has)return `<p class="phint muted small">Zu ${w.n} gibt es noch keine eigene Probe. Diese stammt aus demselben Bereich. Sie setzt kein Bauteil für ${w.n}, aber du übst dasselbe Abwägen.</p>`;
  if(done)return `<p class="phint muted small">Diese Probe hast du schon entschieden. Deine Wahl hat ${w.n} nicht berührt. Du kannst sie mit „Anders entscheiden“ neu durchdenken oder auf eine neue Probe warten.</p>`;
  return ""}
function compareHTML(p,v){if(!Array.isArray(v.hist)||!v.hist.length||!v.again)return "";const h=v.hist[v.hist.length-1],a=p.o[h.o],b=p.o[v.o];if(!a||!b)return "";
  return `<div class="compare"><span class="label">Damals und heute</span>${h.o===v.o?`<p>Am ${dayFmt(h.t)} hast du genauso entschieden: „${a.t}“</p>`:`<p>Am ${dayFmt(h.t)} hast du „${a.t}“ gewählt. Heute hast du „${b.t}“ gewählt.</p>`}${h.r?`<p class="muted small">Deine Begründung damals: ${esc(h.r)}</p>`:""}</div>`}
function probeCard(p){p=pv(p);const v=S.proben[p.id],blind=pBlind===p.id&&v&&v.o!=null,done=v&&v.o!=null&&!blind;
  return `<article class="probe" ${cc(p.cat)} id="probe"><div class="meta"><span>${dot(p.cat)}${CATS[p.cat].n}</span><span>Belastungsprobe</span></div>
   <h2>${p.t}</h2>${blind?`<p class="phint muted small">Du hast diese Probe am ${dayFmt(v.t)} schon entschieden. Deine alte Antwort bleibt verborgen, bis du neu gewählt hast.</p>`:probeHint(p,v,done)}${pfOffer(p)}<p class="situ">${p.x}</p>
   <p class="label">${done?"Deine Entscheidung":"Was würdest du tun?"}</p>
   <div class="opts ${done?"done":""}">${p.o.map((o,i)=>`<button class="opt ${done&&v.o===i?"pick":""}" data-pick="${p.id}:${i}" ${done?(v.o===i?'aria-pressed="true"':'aria-disabled="true"'):""}><span class="ok" aria-hidden="true">${done&&v.o===i?CK:""}</span><span class="ot">${o.t}${done?`<span class="vw">${(done?pw(p.id,v,i):o.w).map(id=>`<span class="vchip" ${cc(W[id].cat)} data-wert="${id}">${W[id].n}</span>`).join("")}</span>`:""}</span></button>`).join("")}</div>
   ${done?`<div class="reveal">${compareHTML(p,v)}<span class="label">Was hier im Spiel ist</span><p>${p.h}</p><p class="ask">${p.f}</p>
     <label class="label" for="preason">Deine Begründung, nur für dich</label><textarea id="preason" placeholder="${v.again?"Was hat sich verändert, oder was ist geblieben?":"Warum hast du dich so entschieden?"}">${esc(v.r||"")}</textarea>
     <div class="wstone"><span class="label">Prüfstein Würde · freiwillig</span><p>Achtet deine Antwort die Würde aller Beteiligten? Wie begegnest du dabei dem Menschen, mit dem du nicht einverstanden bist?</p><textarea id="pwq" aria-label="Antwort zum Prüfstein Würde" placeholder="Ein Satz reicht.">${esc(v.wq||"")}</textarea></div>
     <div class="row"><button class="btn primary" data-psave="${p.id}">Speichern</button><button class="btn" id="pnext">Nächste Probe</button><button class="linkbtn" data-previse="${p.id}">Anders entscheiden</button></div>
     ${blindDue(p.id)?`<button class="linkbtn" data-blindgo="${p.id}">Noch einmal entscheiden, ohne die alte Antwort zu sehen</button>`:""}</div>`
     :`<div class="row"><button class="linkbtn" id="pnext">Andere Probe</button></div>`}
   <button class="mini" data-pshare="${p.id}">Mit jemandem besprechen</button>
  </article>`}
/* Abwählen: Der Eintrag kehrt genau in den Zustand vor dieser Wahl zurück (prev), samt Begründung, Vergleich und Verlauf.
   Ältere Einträge ohne prev: Eine blinde Wiederholung fällt auf die frühere Wahl zurück, sonst entfällt der Eintrag.
   Momente, die erst durch diese Wahl erreicht wurden, werden wieder offen. Spannseile, Bauteile und Bautagebuch leiten sich aus S.proben ab. */
function unpick(pid){const v=S.proben[pid];if(!v||v.o==null)return;delete v.ow;const since=v.t||0;
  if(v.prev&&typeof v.prev==="object")S.proben[pid]=v.prev;
  else if(v.again&&Array.isArray(v.hist)&&v.hist.length){const h=v.hist.pop();Object.assign(v,{o:h.o,t:h.t,r:h.r||"",again:false})}
  else delete S.proben[pid];
  pruneMoments(since)}
const scrollProbe=()=>{const el=$("#probe");if(el)el.scrollIntoView({block:"nearest",behavior:"auto"})};
const MAXACT=3;
const activeUeb=()=>Object.entries(S.ueb).filter(([,v])=>v&&v.status==="active").map(([id])=>id).filter(id=>U[id]);
function suggestUeb(){const free=UEBUNGEN.filter(u=>!S.ueb[u.id]);if(!free.length)return null;
  const kc=new Set(S.kern.map(id=>W[id].cat)),kw=new Set(S.kern);const pref=free.filter(u=>kw.has(u.w)),pref2=free.filter(u=>kc.has(u.cat));
  const list=pref.length?pref:pref2.length?pref2:free;return list[(Math.floor(now()/DAY)+(S.uskip||0))%list.length]}
/* Laufende Übung: oben das freiwillige Feld für Plan, Satz oder Notiz (Aufforderung aus u.p; p:false heißt kein Feld),
   dann der Stand, der Tageseintrag (Gemacht / Keine Gelegenheit / Diesmal nicht) mit kleinen Tagesmarken und die Knöpfe.
   „Früher abschließen“ ist ein Textknopf; Hauptknopf ist „Geschafft“ erst, wenn die Zeit um ist oder die Übung schon geschafft ist. */
const PLAN_DEF="Dein Plan oder deine Notiz, nur für dich";
const Tg=x=>x===1?"einem Tag":`${x} Tagen`;
let logBack={};
function logHTML(e,v){if(!(e.d>1||v.keep))return "";const di=dayIdx(v),maxD=v.keep?di:e.d-1,lg=v.log||{};
  const canT=di<=maxD,canY=di>=1&&di-1<=maxD;
  /* Einmal-Übung mit „Gemacht“: keine Tageszeile mehr, nur der Stand und ein Weg, den Eintrag zurückzunehmen */
  if(EINMAL.has(e.id)&&nJa(v)>=1){const k=+Object.keys(lg).find(x=>lg[x]==="ja");
    return `<div class="ulog done1"><p class="muted small ustand">Gemacht am ${fmtDate(new Date(v.start).setHours(12,0,0,0)+k*DAY).replace(/\.$/,"")}. Damit ist die Übung geschafft. Du kannst sie abschließen, wann du magst.</p><button class="linkbtn" data-log="${e.id}" data-day="${k}" data-val="ja">Eintrag zurücknehmen</button></div>`}
  if(!canT&&!canY)return "";
  const back=!canT||(!!logBack[e.id]&&canY),k=back?di-1:di,cur=lg[k]||null;
  const from=v.keep?Math.max(0,di-6):0,to=v.keep?di:e.d-1;let marks="";
  for(let i=from;i<=to;i++)marks+=`<i class="${lg[i]||"leer"}${i>di?" fut":""}${i===k?" now":""}"></i>`;
  const n=nJa(v),need=needDays(e.id,v);
  const stand=EINMAL.has(e.id)?(n?"Gemacht. Damit ist die Übung geschafft. Du kannst sie abschließen, wann du magst.":"Ein einziges Mal genügt. Trag „Gemacht“ ein, sobald es so weit ist.")
    :n>=need?`An ${Tg(n)} gemacht. Damit gilt die Übung als geschafft.`
    :`${n?`Bisher an ${Tg(n)} gemacht. `:""}Ab ${Tg(need)} gilt die Übung als geschafft. ${GELEG.has(e.id)?"Tage ohne Gelegenheit zählen nicht mit.":"Ein verpasster Tag ändert nichts."}`;
  const sw=canT&&canY?`<button class="linkbtn" data-logback="${e.id}">${back?"Zurück zu heute":"Gestern nachtragen"}</button>`:"";
  return `<div class="ulog"><div class="sh"><span class="label">${back?"Gestern":"Heute"} · Tag ${k+1}${v.keep?"":` von ${e.d}`}</span>${sw}</div>
   <div class="chips wrap lchips" role="group" aria-label="Eintrag für ${back?"gestern":"heute"}">${LOGW.map(([x,t])=>`<button class="chip" aria-label="${t}" data-log="${e.id}" data-day="${k}" data-val="${x}" aria-pressed="${cur===x}">${t.replace("Gelegenheit","Gelegen&shy;heit")}</button>`).join("")}</div>
   <div class="marks" aria-hidden="true">${marks}</div><p class="muted small ustand">${stand}</p></div>`}
function uebCard(e,mode){e=uv(e);const v=S.ueb[e.id];let extra="",meta=W[e.w]?W[e.w].n:"",dur=e.d===1?"Heute":e.d+" Tage";
  if(mode==="active"){const di=dayIdx(v),total=e.d,keep=!!v.keep,fw=v.fuer&&W[v.fuer]?W[v.fuer]:null;
    /* Kopfzeile: die Stütze, für die man übt (sonst der Wert der Übung); rechts die Frist */
    if(fw)meta=fw.n;dur=keep?"ohne Frist":total===1?"Heute":`bis ${fmtDate(v.start+(total-1)*DAY)}`;
    const lab=e.p===false?null:(e.p||PLAN_DEF);
    const plan=lab?`<div class="uplan"><label class="pl" for="plan-${e.id}">${esc(lab)}</label><textarea id="plan-${e.id}" data-plan="${e.id}" rows="2" placeholder="Freiwillig. Ein, zwei Sätze reichen.">${esc(v.plan||"")}</textarea><span class="psaved" aria-live="polite"></span></div>`:"";
    const lg=logHTML(e,v);
    /* Ohne Tageszeile (eintägig oder nach Fristende) steht der Stand in einer Zeile; sonst zeigen Tageszeile und Marken ihn. */
    const prog=lg?"":`<div class="prog"><span class="label">${keep?`Läuft ohne Frist · seit ${fmtDate(v.start)}`:di<total?(total===1?"Heute":`Tag ${di+1} von ${total}`):"Zeit ist um. Wie lief es?"}</span></div>`;
    const ea=early(e.id),reached=nJa(v)>=needDays(e.id,v)&&(total>1||keep),main=!ea||reached,up=!keep&&di>=total;
    const forBtn=META.includes(e.id)?"":`<button class="linkbtn" data-fuer="${e.id}">${fw?"Stütze ändern":"Ohne Stütze · ändern"}</button>`;
    extra=`${plan}${META.includes(e.id)?`<p class="muted small ufor">Diese Übung ordnet dein Gerüst. Sie setzt kein Bauteil.</p>`:""}${prog}${lg}
    <div class="row">${main?`<button class="btn primary" data-done="${e.id}">Geschafft</button>`:""}${up&&total>1&&!EINMAL.has(e.id)?`<button class="btn" data-keep="${e.id}">Beibehalten</button>`:""}<button class="btn" data-remind="${e.id}">Erinnern</button></div>
    <div class="row urow2">${main?"":`<button class="linkbtn" data-done="${e.id}">Früher abschließen</button>`}<button class="linkbtn" data-ueb="${e.id}">Anleitung</button>${forBtn}<button class="linkbtn" data-drop="${e.id}">Abbrechen</button></div><button class="mini" data-ushare="${e.id}">Mit jemandem machen</button>`;
    return `<article class="exp run" ${cc(e.cat)} data-run="${e.id}"><div class="meta"><span>${dot(fw?fw.cat:e.cat)}${meta}</span><span class="nowrap">${dur}</span></div><h2>${e.t}</h2>${extra}</article>`}
  extra=`<div class="row"><button class="btn primary" data-accept="${e.id}" ${activeUeb().length>=MAXACT?"disabled":""}>Annehmen</button><button class="btn" data-ueb="${e.id}">Mehr dazu</button>${mode==="suggest"?`<button class="linkbtn" id="uother">Anderer Vorschlag</button>`:""}</div><button class="mini" data-ushare="${e.id}">Mit jemandem machen</button>${activeUeb().length>=MAXACT?`<p class="muted small">Du hast schon ${MAXACT} Übungen laufen. Schließ zuerst eine ab, bevor du eine neue beginnst.</p>`:""}`;
  return `<article class="exp" ${cc(e.cat)}><div class="meta"><span>${dot(e.cat)}${FREIWERT.has(e.id)?"Wert nach Wahl":meta}</span><span>${dur}</span></div><h2>${e.t}</h2><p>${e.x}</p>${extra}</article>`}
const lastRun=id=>{const r=runsOf(id).filter(x=>x.status==="done");return r[r.length-1]||null};
function viewUeben(){
  const p=currentProbe(),act=activeUeb(),sug=suggestUeb();
  const pc={alle:PROBEN.length},uc={alle:UEBUNGEN.length};CATKEYS.forEach(k=>{pc[k]=PROBEN.filter(x=>x.cat===k).length;uc[k]=UEBUNGEN.filter(x=>x.cat===k).length});
  const nDone=nPrDone();
  let h=`<section class="view"><header class="vh"><h1>Üben</h1><p>In Belastungsproben entscheidest du dich in schwierigen Lagen. In Übungen lebst du einen Wert im Alltag. Beides baut an deinem Gerüst.</p></header>`;
  const run=`<div class="sec"><div class="sh"><span class="label">Übungen, die laufen</span><span class="label">${act.length} von ${MAXACT}</span></div>${act.length?act.map(id=>uebCard(U[id],"active")).join(""):`<p class="muted small">Übungen sind kleine Schritte, mit denen du einen Wert im Alltag lebst. Nichts davon muss perfekt gelingen.</p>`}</div>`;
  /* Laufen Übungen, stehen sie oben, damit man nicht jedes Mal an der Probe vorbeiscrollt. */
  if(act.length)h+=run;
  h+=`<div class="sec"><div class="sh"><span class="label">Belastungsprobe</span><span class="label">${nDone} von ${PROBEN.length} entschieden</span></div>${chips("pfilter",pFilter,pc)}${p?probeCard(p):""}</div>`;
  if(!act.length)h+=run;
  if(sug)h+=`<div class="sec"><div class="sh"><span class="label">Vorschlag für dich</span></div>${uebCard(sug,"suggest")}</div>`;
  const ul=UEBUNGEN.filter(u=>uFilter==="alle"||u.cat===uFilter),lim=uMore?ul.length:6;
  h+=`<details class="fold" id="uebfold" ${S.uebOpen?"open":""}><summary><span>Alle Übungen</span><span class="label">${UEBUNGEN.length}</span>${CHEV}</summary><div class="fbody">${chips("ufilter",uFilter,uc)}<div class="list">${ul.slice(0,lim).map(u=>{const v=S.ueb[u.id],lr=lastRun(u.id);const st=v?(v.status==="active"?"läuft":v.status==="done"?(v.ok===false?"beendet":"geschafft"):lr?"geschafft":"abgebrochen"):(u.d===1?"heute":u.d+" Tage");return `<button class="li" data-ueb="${u.id}">${dot(u.cat)}<span class="tx"><b>${uv(u).t}</b></span><span class="aside">${st}</span></button>`}).join("")}</div>${ul.length>lim?`<button class="linkbtn" id="umore">${ul.length-lim} weitere anzeigen</button>`:""}</div></details>`;
  h+=`<details class="fold" id="prfold" ${S.prOpen?"open":""}><summary><span>Alle Belastungsproben</span><span class="label">${nDone} / ${PROBEN.length}</span>${CHEV}</summary><div class="fbody"><div class="list">${PROBEN.map(x=>`<button class="li" data-probe-open="${x.id}">${dot(x.cat)}<span class="tx"><b>${ptl(x)}</b></span><span class="aside">${S.proben[x.id]&&S.proben[x.id].o!=null?"entschieden":"offen"}</span></button>`).join("")}</div></div></details>`;
  return h+`</section>`}
function uebSheet(id,hint){const e=uv(U[id]),v=S.ueb[id],w=W[e.w],nd=runsOf(id).filter(r=>r.status==="done").length,full=activeUeb().length>=MAXACT;
  const acc=lab=>`<button class="btn${lab==="Annehmen"?" primary":""}" data-accept="${id}" ${hint?`data-uhint="${hint}"`:""} ${full?"disabled":""}>${lab}</button>`;
  sheet(`${invited===id?`<div class="gift"><span class="label">Eine Einladung</span><p>Jemand möchte diese Übung gemeinsam mit dir machen. Sie stammt aus dem Wertegerüst, einer kostenlosen App ohne Anmeldung.</p></div>`:""}<div class="label">${dot(e.cat)}${CATS[e.cat].n} · ${e.d===1?"Heute":e.d+" Tage"}</div><h2>${e.t}</h2><p class="lead">${e.x}</p><h3>So gehst du vor</h3><ol class="howto">${e.s.map(s=>`<li>${s}</li>`).join("")}</ol>
  <h3>Welcher Wert dahintersteht</h3>${FREIWERT.has(id)?`<p class="muted small">Den Wert wählst du selbst: Beim Annehmen nimmst du dir eine deiner Stützen vor.</p>`:goBtn("wert",w.id,w.cat,S.kern.includes(w.id)?"Deine Stütze":"Wert",w.n)}
  ${META.includes(id)?`<p class="muted small">Diese Übung ordnet dein Gerüst. Sie setzt kein Bauteil, steht aber danach im Bautagebuch.</p>`:""}
  <div class="row">${!v||v.status==="dropped"?acc("Annehmen"):v.status==="active"?`<button class="btn primary" data-done="${id}">${early(id)&&nJa(v)<needDays(id,v)?"Früher abschließen":"Geschafft"}</button>`:`<span class="label">${v.ok===false?"Beendet":"Geschafft"} am ${fmtDate(v.end)}</span>${acc("Noch einmal")}`}</div>
  ${nd>1?`<p class="muted small">Du hast diese Übung schon ${nd}-mal abgeschlossen. Alle Durchgänge stehen im Bautagebuch.</p>`:""}<button class="mini" data-ushare="${id}">Mit jemandem machen</button>`,e.cat)}
/* Annehmen: Für welche Stütze? Vorgeschlagen wird die Stütze mit dem Wert der Übung, sonst eine aus demselben Bereich.
   Die Wahl lässt sich abwählen (dann ohne Stütze) und später auf der Karte ändern (change=true). */
let accSel=null;
function fuerNote(uid,k){if(!k)return "Ohne Stütze setzt die Übung kein Bauteil. Sie steht trotzdem in deinem Bautagebuch.";const n=W[k].n;
  if(lived(k))return `${n} ist schon gelebt. Die Übung zählt dort als weitere gelebte Übung und steht im Bautagebuch.`;
  return `${FREIWERT.has(uid)?`Die Übung gilt dann für ${n}. `:""}Wenn du sie schaffst, bekommt ${n} das Bauteil „gelebt“.`}
function acceptSheet(id,hint,from,change){const e=uv(U[id]),meta=META.includes(id);accSel=change?(S.ueb[id]&&S.ueb[id].fuer)||null:defFuer(id,hint);
  const body=meta?`<p class="lead">Diese Übung ordnet dein Gerüst. Sie setzt kein Bauteil, aber sie steht danach in deinem Bautagebuch.</p>`
   :S.kern.length?`<p class="lead">${FREIWERT.has(id)?"Welchen Wert nimmst du dir vor? Wähle eine deiner Stützen.":"Für welche deiner Stützen machst du sie?"}</p><div class="chips wrap" id="fsel" role="group" aria-label="Stütze wählen">${S.kern.map(k=>`<button class="chip" ${cc(W[k].cat)} data-fsel="${k}" aria-pressed="${accSel===k}">${dot(W[k].cat)}${W[k].n}</button>`).join("")}</div><p class="muted small" id="fselnote">${fuerNote(id,accSel)}</p>`
   :`<p class="lead">Du hast noch keine Stützen. Du kannst die Übung trotzdem machen. Sie steht danach in deinem Bautagebuch.</p>`;
  sheet(`<div class="label">${dot(e.cat)}${change?"Stütze ändern":`Übung annehmen · ${e.d===1?"heute":e.d+" Tage"}`}</div><h2>${e.t}</h2>${body}<div>${change?"":`<div class="accrem"><button class="chip" id="accrem" aria-pressed="false">Erinnerung im Kalender</button><span class="accat"><label class="label" for="acctime">um</label><input type="time" id="acctime" value="${S.settings.uebTime||"19:00"}"></span></div><p class="muted small">Freiwillig. ${e.d===1?"Ein Termin":"Ein Termin an jedem Tag der Übung"} in deinem eigenen Kalender. Mehr Möglichkeiten gibt es auf der Karte unter „Erinnern“.</p>`}</div><div class="row">${change?`<button class="btn primary" id="fuergo" data-id="${id}">Speichern</button>`:`<button class="btn primary" id="acceptgo" data-id="${id}" data-from="${from?1:""}">Annehmen</button>`}</div>`,e.cat)}
/* Mehrtägige Übung vor ihrem Ende abschließen. Eine Übung, die ohne Frist weiterläuft, ist nie „früher“. */
function early(id){const e=U[id],v=S.ueb[id];return !!(e&&v&&v.status==="active"&&!v.keep&&e.d>1&&dayIdx(v)+1<e.d)}
/* Abschluss: Bei mehrtägigen Übungen stehen die Tage aus den Einträgen schon da; ohne Einträge fragt die App danach.
   pre: Werte, mit denen das Blatt nach „Rückgängig“ wieder gefüllt wird (Stimmung, Notiz, Tage) */
function doneSheet(id,pre){const e=uv(U[id]),v=S.ueb[id]||{},ea=early(id),multi=e.d>1||!!v.keep,n=nJa(v),need=needDays(id,v),hasLog=!!(v.log&&Object.keys(v.log).length);
  const one=multi&&EINMAL.has(id);
  let mx=one?1:multi?(ea||v.keep?dayIdx(v)+1:e.d):0;if(!v.keep&&!one)mx=Math.min(mx,e.d);if(!one)mx=Math.max(mx,n);
  const num=mx>7,lab=k=>one?(k?"Ja, gemacht":"Noch nicht"):num?String(k):k===0?"Noch an keinem":k===1?"An einem Tag":`An ${k} Tagen`;
  const UDN0=`Für das Bauteil zählt die Übung ab ${Tg(need)}.${GELEG.has(id)&&!EINMAL.has(id)?" Tage ohne Gelegenheit zählen nicht mit.":""} Die Zahl steht in deinem Bautagebuch.`;
  const lead=one?"Hast du es gemacht?":hasLog?`Nach deinen Einträgen hast du die Übung an ${Tg(n)} gemacht. Du kannst die Zahl noch ändern.`:ea?`Die Übung ist auf ${e.d} Tage angelegt. An wie vielen Tagen hast du sie gemacht?`:`An wie vielen Tagen hast du die Übung gemacht?`;
  const fw=v.fuer&&W[v.fuer]?W[v.fuer]:null;
  const info=META.includes(id)?`<p class="muted small">Diese Übung ordnet dein Gerüst. Sie setzt kein Bauteil.</p>`:v.v===2&&!fw?`<p class="muted small">Die Übung läuft ohne Stütze. Sie setzt kein Bauteil und steht im Bautagebuch.</p>`:"";
  sheet(`<div class="label">${ea&&n<need?"Früher abschließen":"Geschafft"}</div><h2>${e.t}</h2>${info}${multi?`<p class="lead">${lead}</p><div class="chips wrap${num?" num":""}" id="udays">${Array.from({length:mx+1},(_,k)=>`<button class="chip" data-udays="${k}" aria-pressed="false">${lab(k)}</button>`).join("")}</div>${num?`<p class="muted small">Zahl der Tage, an denen du sie gemacht hast.</p>`:""}<p class="muted small udnote" id="udaysnote">${one?"Ein einziges Mal genügt.":UDN0}</p>`:""}${v.checks&&Object.keys(v.checks).length?`<div class="dcurve"><span class="label">Deine Zwischenstationen</span>${spark(v)}</div>`:""}<p class="lead">Wie war es? Deine Antwort bleibt auf diesem Gerät.</p><div class="chips wrap" id="moods">${[["gut","Hat mir gutgetan"],["mix","Gemischt"],["nein","Eher nicht"]].map(([k,n])=>`<button class="chip" data-mood="${k}" aria-pressed="false">${n}</button>`).join("")}</div><label class="label" for="note">Was nimmst du mit?</label><textarea id="note" placeholder="Ein, zwei Sätze reichen."></textarea><div class="row"><button class="btn primary" id="savedone" data-id="${id}">Speichern</button></div>`,e.cat);
  /* Tage und Stimmung: Antippen wählt, erneutes Antippen der gewählten Antwort hebt die Wahl auf */
  const ud=$("#udays");
  const setDays=c=>{ud.querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===c));const k=c?+c.dataset.udays:null;
    $("#udaysnote").textContent=k==null?(one?"Ein einziges Mal genügt.":UDN0):k===0?"Dann setzt diese Übung noch kein Bauteil. Du kannst sie auch weiterlaufen lassen und später abschließen."
      :one?"Danke. Damit ist die Übung geschafft.":k<need?`Danke für die ehrliche Zahl. Für das Bauteil zählt die Übung ab ${Tg(need)}. Du kannst sie auch weiterlaufen lassen.`:"Danke für die ehrliche Zahl. Sie steht in deinem Bautagebuch."};
  if(ud)ud.addEventListener("click",ev=>{const c=ev.target.closest("[data-udays]");if(!c)return;setDays(c.getAttribute("aria-pressed")==="true"?null:c)});
  const setMood=c=>$("#moods").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===c));
  $("#moods").addEventListener("click",ev=>{const c=ev.target.closest("[data-mood]");if(!c)return;setMood(c.getAttribute("aria-pressed")==="true"?null:c)});
  if(ud&&hasLog&&!pre){const c=ud.querySelector(`[data-udays="${Math.min(n,mx)}"]`);if(c)setDays(c)}
  if(pre){if(ud&&pre.days!=null){const c=ud.querySelector(`[data-udays="${pre.days}"]`);if(c)setDays(c)}if(pre.mood)setMood($(`#moods [data-mood="${pre.mood}"]`));if(pre.note)$("#note").value=pre.note}}

/* ---------- Vertiefen ---------- */
const EVTXT=["Ein philosophischer Gedanke, ein Zeitzeugnis oder ein Denkmodell. Kein empirischer Befund, aber ein Denkanstoß.","Erste Studien deuten in diese Richtung, aber sie sind klein, neu oder widersprechen sich teilweise.","Mehrere gute Studien kommen zu einem ähnlichen Ergebnis. Die Größe des Effekts ist aber noch umstritten.","Viele Studien und Übersichtsarbeiten bestätigen den Befund. Daran zweifelt kaum noch jemand."];
function goBtn(kind,id,c,label,title){return `<button class="go" ${cc(c)} data-${kind}="${id}"><span class="tx"><small>${dot(c)}${label}</small><b>${title}</b></span><span class="arr" aria-hidden="true">→</span></button>`}
function deepSheet(b){const w=W[b.w],u=U[b.ue];const pr=PROBEN.find(p=>!S.proben[p.id]&&p.o.some(o=>o.w.includes(b.w)))||PROBEN.find(p=>p.o.some(o=>o.w.includes(b.w)));
  const rel=IMPULSE.filter(o=>o.cat===b.cat&&o.id!==b.id&&!S.read[o.id]);const more=(rel.length?rel:IMPULSE.filter(o=>o.cat===b.cat&&o.id!==b.id)).slice(0,2);
  sheet(`<div class="deep"><div class="label">Für dich</div><h2>${b.t}</h2><p class="ask">${b.tip}</p>
  ${w?`<h3>Der Wert dazu</h3>${goBtn("wert",w.id,w.cat,S.kern.includes(w.id)?"Deine Stütze":"Wert",w.n)}`:""}
  ${pr?`<h3>Auf die Probe stellen</h3>${goBtn("probe-open",pr.id,pr.cat,"Belastungsprobe",ptl(pr))}`:""}
  ${u?`<h3>Im Alltag leben</h3>${goBtn("ueb",u.id,u.cat,(S.ueb[u.id]&&S.ueb[u.id].status==="active")?"Läuft gerade":"Übung · "+(u.d===1?"heute":u.d+" Tage"),u.t)}`:""}
  <h3>Weiter im Bereich ${CATS[b.cat].n}</h3>${more.map(o=>goBtn("open",o.id,o.cat,EV[o.ev],o.t)).join("")}</div>`,b.cat)}
function evSheet(b){
  sheet(`<div class="deep"><div class="label">Wie sicher?</div><h2>${b.t}</h2><p class="lead">${b.c}</p>
  <h3>So ordnen wir die Gedanken ein</h3><div class="evscale">${[3,2,1,0].map(l=>`<div class="${b.ev===l?"on":""}">${evHTML(l)}<p>${EVTXT[l]}</p></div>`).join("")}</div>
  <p class="src"><a href="${esc(b.u)}" target="_blank" rel="noopener">${b.src} ↗</a></p>
  <p class="muted small">Forschung beschreibt meist Durchschnitte, Philosophie bietet Gründe zum Abwägen. Ob ein Gedanke für dich trägt, zeigt sich erst, wenn du ihn prüfst.</p></div>`,b.cat)}
function sheet(html,cat){const l=$("#layer");const fresh=!l.innerHTML;if(fresh)pushNav();l.innerHTML=`<div class="sheet${fresh?"":" swap"}" id="sh"><div class="panel" role="dialog" aria-modal="true" ${cat?cc(cat):""}><span class="grab" aria-hidden="true"></span><button class="close" id="shx" aria-label="Schließen">×</button>${html}</div></div>`;
  $("#sh").addEventListener("click",e=>{if(e.target.id==="sh"||e.target.id==="shx")closeSheet()})}
/* Schließen: erst nach dem Ausblenden ist #layer leer; danach prüfen, ob ein Moment fällig ist. */
function closeSheet(){const l=$("#layer"),s=$("#sh");if(l.contains(document.activeElement))document.activeElement.blur();if(!s||calm()){l.innerHTML="";checkMoments();return}s.classList.add("out");setTimeout(()=>{if(l.contains(s)){l.innerHTML="";checkMoments()}},260)}
/* Blatt am Griff nach unten ziehen: Der Kopfbereich (obere 56 px) zieht immer, der übrige Inhalt nur, wenn er ganz
   oben steht und der Finger nach unten geht. Ab 110 px Weg oder schnellem Wisch schließt das Blatt, sonst gleitet es zurück. */
(()=>{let y0=0,t0=0,dy=0,drag=null,arm=null;
  const panelOf=e=>e.target.closest&&e.target.closest("#sh .panel");
  document.addEventListener("touchstart",e=>{const p=panelOf(e);if(!p||e.touches.length>1||e.target.closest("textarea,input:not(.hap),.close"))return;
    const head=e.touches[0].clientY-p.getBoundingClientRect().top<56;arm={p,head,x:e.touches[0].clientX};y0=e.touches[0].clientY;t0=now();dy=0},{passive:true});
  document.addEventListener("touchmove",e=>{if(!arm)return;const d=e.touches[0].clientY-y0,dx=e.touches[0].clientX-arm.x;
    if(!drag){if(Math.abs(d)<6)return;if(d<0||Math.abs(dx)>Math.abs(d)||(!arm.head&&arm.p.scrollTop>0)){arm=null;return}drag=arm.p;drag.style.transition="none";drag.style.animation="none"}
    dy=Math.max(0,d);if(e.cancelable)e.preventDefault();drag.style.transform=`translateY(${dy}px)`;const sh=drag.parentNode;if(sh)sh.style.opacity=String(1-Math.min(.5,dy/600))},{passive:false});
  const end=()=>{const p=drag;arm=null;drag=null;if(!p)return;const v=dy/Math.max(1,now()-t0),sh=p.parentNode;
    if(dy>110||(v>.5&&dy>40)){p.style.transition="transform .22s ease-in";p.style.transform="translateY(100%)";if(sh){sh.style.transition="opacity .22s";sh.style.opacity="0"}
      setTimeout(()=>{const l=$("#layer");if(l.contains(p)){l.innerHTML="";checkMoments()}},220);return}
    p.style.transition="transform .25s var(--ease)";p.style.transform="";if(sh){sh.style.transition="opacity .25s";sh.style.opacity=""}setTimeout(()=>{p.style.transition=""},260)};
  document.addEventListener("touchend",end,{passive:true});document.addEventListener("touchcancel",end,{passive:true})})();

/* ---------- Werte finden: einschätzen, abwägen, auswählen ---------- */
const FORDER=WERTE.filter(w=>!w.fund).map(w=>w.id);
function F(){if(!S.find||S.find.v!==2)S.find={v:2,a:{},hist:[],stage:"sort"};return S.find}
/* Aus den Antworten auf alltägliche Sätze wird für jeden Wert ein Gewicht. Werte, die in mehr Sätzen vorkommen, werden etwas abgefedert. */
function fScores(){const f=F(),raw={},cap={};SAETZE.forEach((st,i)=>{const a=f.a[i];if(a==null)return;st.w.forEach((w,j)=>{const g=j?.6:1;raw[w]=(raw[w]||0)+a*g;cap[w]=(cap[w]||0)+2*g})});
  const sc={};Object.keys(raw).forEach(w=>{if(raw[w]>0)sc[w]=raw[w]/Math.sqrt(cap[w])});return sc}
function fWhy(id){const f=F();const i=SAETZE.findIndex((st,i)=>f.a[i]===2&&st.w[0]===id);const j=i>=0?i:SAETZE.findIndex((st,i)=>f.a[i]===2&&st.w.includes(id));return j>=0?SAETZE[j].t:""}
const fCount=v=>Object.values(F().a).filter(x=>x===v).length;
function fCands(){const sc=fScores();return Object.keys(sc).sort((a,b)=>(sc[b]-sc[a])||(FORDER.indexOf(a)-FORDER.indexOf(b))).slice(0,8)}
/* Rückblick beim Einschätzen: f.rev ist der Satz, zu dem man mit „Zurück“ gegangen ist (seine Antwort bleibt und ist markiert),
   f.fwd die Sätze dahinter, die schon beantwortet sind. fSettle() schließt den Rückblick ab. */
function fSettle(){const f=F();if(f.rev!=null&&f.a[f.rev]!=null)f.hist.push(f.rev);while(f.fwd&&f.fwd.length)f.hist.push(f.fwd.pop());f.rev=null;f.fwd=[]}
function fStartDuel(){fSettle();const f=F(),c=fCands();f.dh=[];f.drev=null;if(c.length<=5){f.stage="result";f.c=c;f.sc={};f.pick=c.slice();persist();return}
  f.stage="duel";f.c=c;f.sc=Object.fromEntries(c.map(id=>[id,0]));f.round=1;f.rounds=c.length<=8?3:2;f.played=[];f.done=0;f.total=f.rounds*Math.floor(c.length/2);f.pairs=fPairs();f.pi=0;persist()}
function fPairs(){const f=F();const s=f.c.slice().sort((a,b)=>(f.sc[b]-f.sc[a])||(hashStr(a+f.round)-hashStr(b+f.round)));const pairs=[],used=new Set(),key=(a,b)=>[a,b].sort().join("|");
  for(let i=0;i<s.length;i++){if(used.has(s[i]))continue;let j=i+1;while(j<s.length&&(used.has(s[j])||f.played.includes(key(s[i],s[j]))))j++;
    if(j>=s.length){j=i+1;while(j<s.length&&used.has(s[j]))j++}if(j>=s.length){f.sc[s[i]]+=.5;used.add(s[i]);continue}used.add(s[i]);used.add(s[j]);pairs.push([s[i],s[j]])}
  return pairs}
function fRank(){const f=F();return f.c.slice().sort((a,b)=>((f.sc[b]||0)-(f.sc[a]||0))||(FORDER.indexOf(a)-FORDER.indexOf(b)))}
/* Jede Abwägung merkt sich den Stand davor (f.dh). „Zurück“ stellt ihn her und markiert die damalige Wahl (f.drev). */
const DKEYS=["sc","played","pi","done","round","pairs","stage","pick"];
function fDuel(win){const f=F(),[a,b]=f.pairs[f.pi];const st={win};DKEYS.forEach(k=>{if(f[k]!==undefined)st[k]=JSON.parse(JSON.stringify(f[k]))});f.dh=(f.dh||[]).concat([st]);f.drev=null;if(win==="both"){f.sc[a]+=.5;f.sc[b]+=.5}else f.sc[win]+=1;f.played.push([a,b].sort().join("|"));f.pi++;f.done++;
  if(f.pi>=f.pairs.length){f.round++;f.pairs=f.round<=f.rounds?fPairs():[];f.pi=0;if(!f.pairs.length){f.stage="result";f.pick=fRank().slice(0,5)}}persist()}
function finderView(){const f=F(),steps=["Einschätzen","Abwägen","Auswählen"],si={sort:0,duel:1,result:2}[f.stage]||0;
  const head=`<div class="fsteps">${steps.map((t,i)=>`<span class="${i===si?"on":i<si?"ok":""}"><i></i>${t}</span>`).join("")}</div>`;
  if(f.stage==="sort"){const rv=f.rev!=null&&SAETZE[f.rev]?f.rev:null,i=rv!=null?rv:SAETZE.findIndex((_,k)=>f.a[k]==null);if(i<0){fStartDuel();return finderView()}const st=SAETZE[i],n=Object.keys(f.a).length,c2=fCount(2),w=W[st.w[0]],cur=f.a[i];
    return head+`<div class="fbar"><i style="width:${Math.round(n/SAETZE.length*100)}%"></i></div><p class="fq">Wie sehr stimmt das für dich?</p>
     <div class="fcard" ${cc(w.cat)}><span class="rodmark" aria-hidden="true"></span><span class="label">Satz ${i+1} von ${SAETZE.length}</span><p class="fst">${st.t}</p></div>
     <div class="fbtns">${[[2,"Stimmt"],[1,"Teils"],[0,"Eher nicht"]].map(([k,t])=>`<button class="btn${k===2?" primary":""}" data-frate="${k}" aria-pressed="${cur===k}">${t}</button>`).join("")}</div>
     <div class="fmeta"><span class="label">${c2} × stimmt</span><span class="fnav">${f.hist.length?`<button class="linkbtn" id="fundo">Zurück</button>`:""}${rv!=null&&cur!=null?`<button class="linkbtn" id="ffwd">Weiter</button>`:""}</span></div>
     ${n>=Math.ceil(SAETZE.length/2)&&fCands().length>=5?`<button class="linkbtn" id="fskip">Genug Sätze, weiter zum Abwägen</button>`:""}
     <p class="muted small">Es gibt keine richtigen Antworten. Antworte so, wie du bist, nicht wie du gern wärst.</p>`}
  if(f.stage==="duel"){const [a,b]=f.pairs[f.pi],A=W[a],B=W[b];
    return head+`<div class="fbar"><i style="width:${Math.round(f.done/Math.max(1,f.total)*100)}%"></i></div><p class="fq">Angenommen, beides geht gerade nicht zusammen. Was wiegt für dich schwerer?</p>
     <div class="fduel">${[A,B].map(w=>`<button class="fopt${f.drev===w.id?" on":""}" ${cc(w.cat)} data-fduel="${w.id}" aria-pressed="${f.drev===w.id}"><span class="rodmark" aria-hidden="true"></span><b>${w.n}</b><span>${w.d}</span></button>`).join(`<span class="fvs" aria-hidden="true">oder</span>`)}</div>
     <div class="fmeta"><span class="label">Abwägung ${f.done+1} von etwa ${f.total}</span><span class="fnav">${f.dh&&f.dh.length?`<button class="linkbtn" id="fdback">Zurück</button>`:""}<button class="linkbtn" data-fduel="both" aria-pressed="${f.drev==="both"}">Kann ich nicht entscheiden</button></span></div>`}
  const rank=f.c&&f.c.length?fRank().slice(0,8):[];f.pick=(f.pick||[]).filter(id=>rank.includes(id));
  return head+`<p class="fq">Diese Werte haben sich bei dir durchgesetzt. Du kannst noch tauschen, bis zu fünf bleiben.</p>
   <div class="fres">${rank.map((id,i)=>{const w=W[id],on=f.pick.includes(id);return `<button class="fr ${on?"on":""}" ${cc(w.cat)} data-fpick="${id}" aria-pressed="${on}"><span class="rodmark" aria-hidden="true"></span><span class="tx"><b>${w.n}</b><small>${w.d}</small>${fWhy(id)?`<em class="why">Du hast gesagt: „${fWhy(id)}“</em>`:""}</span><span class="ck" aria-hidden="true"></span></button>`}).join("")}</div>
   ${S.kern.length?`<p class="muted small">Deine bisherigen Stützen werden ersetzt. Deine Leitsätze bleiben gespeichert und tauchen wieder auf, wenn du einen Wert erneut wählst.</p>`:""}
   <div class="row"><button class="btn primary" id="fapply" ${f.pick.length?"":"disabled"}>${f.pick.length} als Stützen übernehmen</button>${f.dh&&f.dh.length?`<button class="linkbtn" id="fdback">Zurück zum Abwägen</button>`:""}<button class="linkbtn" id="frestart">Neu beginnen</button></div>`}
function finder(still){const l=$("#layer");if(!$("#finder")){sheet(`<div id="finder" class="finder"></div>`);$("#sh").classList.add("fsheet")}
  const box=$("#finder");box.innerHTML=finderView();const c=box.querySelector(".fcard,.fduel,.fres");if(c&&!still&&!calm())c.animate([{opacity:0,transform:"translateX(18px)"},{opacity:1,transform:"none"}],{duration:420,easing:"cubic-bezier(.2,.8,.2,1)"})}
/* Freier Platz: eine einzelne Stütze ergänzen, ohne das Werte-Finden neu zu beginnen und ohne die anderen Stützen zu ersetzen.
   Vorschläge kommen aus dem eigenen Werte-Finden; ohne Ergebnis je ein Wert aus den Bereichen, die noch fehlen. */
function addSheet(){if(!S.kern.length){finder();return}if(S.kern.length>=MAXKERN)return;
  const f=S.find&&S.find.v===2&&S.find.c&&S.find.sc?S.find:null,free=id=>W[id]&&!W[id].fund&&!S.kern.includes(id);
  let sug=f?fRank().filter(free).slice(0,5):[];
  if(!sug.length){const have=new Set(S.kern.map(id=>W[id].cat));sug=CATKEYS.filter(k=>!have.has(k)).map(k=>WERTE.find(w=>w.cat===k&&free(w.id))).filter(Boolean).map(w=>w.id).slice(0,5)}
  if(!sug.length)sug=WERTE.filter(w=>free(w.id)).slice(0,5).map(w=>w.id);
  sheet(`<div class="label">Freier Platz · ${S.kern.length+1} von 5</div><h2>Eine Stütze ergänzen</h2>
    <p class="lead">Wähle einen Wert, der dir noch fehlt. Deine anderen Stützen bleiben, wie sie sind.</p>
    <p class="label" style="margin-top:18px">${f?"Aus deinem Werte-Finden":"Vorschläge aus Bereichen, die dir noch fehlen"}</p>
    <div class="fres">${sug.map(id=>{const w=W[id],why=f?fWhy(id):"";return `<button class="fr" ${cc(w.cat)} data-kern="${id}"><span class="rodmark" aria-hidden="true"></span><span class="tx"><b>${w.n}</b><small>${w.d}</small>${why?`<em class="why">Du hast gesagt: „${why}“</em>`:""}</span></button>`}).join("")}</div>
    <div class="row"><button class="btn" data-tabgo="werte">Alle Werte ansehen</button><button class="linkbtn" data-finder="1">Werte neu finden</button></div>`)}
function finderClick(t,d){if(!(d.finder||d.frate||d.fduel||d.fpick||/^f(undo|skip|restart|apply|fwd|dback)$/.test(t.id)))return false;const f=F();
  if(d.finder){finder();return true}
  /* Einschätzen. Im Rückblick hebt erneutes Antippen der markierten Antwort sie auf; der Satz bleibt stehen. */
  if(d.frate){const v=+d.frate,rv=f.rev!=null&&SAETZE[f.rev]?f.rev:null;
    if(rv!=null&&f.a[rv]===v){delete f.a[rv];persist();finder(true);return true}
    const id=rv!=null?rv:SAETZE.findIndex((_,k)=>f.a[k]==null);if(id<0)return true;f.a[id]=v;f.hist.push(id);f.rev=rv!=null&&f.fwd&&f.fwd.length?f.fwd.pop():null;
    persist();t.setAttribute("aria-pressed","true");if(v===2)lightUp(t);setTimeout(finder,calm()?0:220);return true}
  if(t.id==="fundo"){const id=f.hist.pop();if(id!=null){if(f.rev!=null&&f.a[f.rev]!=null)(f.fwd=f.fwd||[]).push(f.rev);f.rev=id}persist();finder();return true}
  if(t.id==="ffwd"){if(f.rev!=null){f.hist.push(f.rev);f.rev=f.fwd&&f.fwd.length?f.fwd.pop():null}persist();finder();return true}
  if(t.id==="fdback"){const st=(f.dh||[]).pop();if(st){DKEYS.forEach(k=>{if(k in st)f[k]=st[k];else delete f[k]});f.drev=st.win}persist();finder();return true}
  if(t.id==="fskip"){fStartDuel();finder();return true}
  /* Abwägen. Nach „Zurück“ ist die damalige Wahl markiert; erneutes Antippen hebt sie auf, die Abwägung bleibt offen. */
  if(d.fduel){if(f.drev!=null&&f.drev===d.fduel){f.drev=null;persist();finder(true);return true}
    if(d.fduel!=="both"){lightUp(t);t.classList.add("won")}fDuel(d.fduel);setTimeout(finder,calm()?0:260);return true}
  if(d.fpick){const id=d.fpick;if(f.pick.includes(id))f.pick=f.pick.filter(x=>x!==id);else if(f.pick.length<5)f.pick.push(id);else{buzz("err");shake(t);toast("Höchstens fünf. Nimm zuerst einen heraus.");return true}persist();finder();return true}
  if(t.id==="frestart"){const sn=snap();S.find={v:2,a:{},hist:[],stage:"sort"};persist();finder();undoToast("Deine Antworten sind gelöscht.",false,sn,{reopen:()=>finder()});return true}
  if(t.id==="fapply"){const sn=snap(),rank=fRank();S.kern=rank.filter(id=>f.pick.includes(id)).slice(0,5);f.stage="done";buzz("ok");closeSheet();setTimeout(()=>{toBuild();undoToast(`${S.kern.length===1?"Deine Stütze steht":"Deine Stützen stehen"}.`,true,sn,{reopen:()=>finder()})},calm()?0:260);return true}
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

/* ---------- Licht, Klickbild & Vibration: nur als Antwort auf Berührung ---------- */
const calm=()=>matchMedia("(prefers-reduced-motion:reduce)").matches;
const vibOn=()=>S.settings.vibration!==false;
/* Klickfamilien. Jedes antippbare Element gehört bewusst zu genau einer:
   Aktion (Knöpfe, große Karten): Tick und eine matte Welle vom Berührungspunkt.
   Auswahl (Chips, Skalen, Abwägen, Legende, Optionen einer Probe): Tick, die Füllung läuft vom Finger aus ein.
   Schalter (Einstellungen): Tick, der Knopf dehnt sich beim Drücken (CSS).  Logo und Titel: Tick, das kleine Gerüst federt.
   Navigation (Listen, Reiter, Zurück, Aufklappen, Verweise, Links): kein Tick, nur leichtes Abdunkeln (CSS :active).
   Erfolg und Fehler sind Ausgänge einer Aktion: buzz("ok") oder buzz("err") im Klick-Handler. Erfolg zeigt einen Haken
   in der Meldung (toast(…,true)), Fehler eine kleine Seitwärtsbewegung (shake). */
const FAM=[["logo","#home,#home2"],["rod",".rhit"],["sw",".setrow[role=switch]"],["sel",".chip,.fbtns .btn,.fopt,.fr,.lg:not(.free),.cdot,.opt,.wq .q"],["act",".btn,.next,.draw,.findcard,.li.daily,.ubtn,.lg.free"]];
const HAPSEL=FAM.map(f=>f[1]).join(",");
const PAT={rod:10,sel:10,sw:10,logo:10,act:12,ok:[10,60,14],err:[24,60,24]};
const famHost=t=>{const el=t&&t.closest&&t.closest(HAPSEL);return el&&el.tagName!=="A"&&!el.disabled&&el.getAttribute("aria-disabled")!=="true"?el:null};
const famOf=el=>{for(const [k,s] of FAM)if(el.matches(s))return k;return null};
/* Android: navigator.vibrate mit eigenem Muster je Situation, synchron am Ende desselben Klicks (Listener auf window,
   läuft nach allen Handlern). Handler wählen mit buzz() Erfolg oder Fehler statt des Familienmusters. */
let buzzKind=null;
function buzz(k){buzzKind=k}
function vib(k){if(!vibOn()||!PAT[k]||typeof navigator.vibrate!=="function")return;try{navigator.vibrate(PAT[k])}catch(e){}}
/* iPhone: Safari vibriert nur, wenn ein Finger selbst einen <input type="checkbox" switch> umlegt; programmierte,
   mehrfache oder verzögerte Ticks spielt iOS nicht ab. Darum liegt in jedem Element, das ticken soll, ein unsichtbarer
   Schalter über der ganzen Fläche. Der Klick darauf läuft zum Element hoch, closest() findet dessen data-Attribute,
   die Aktion läuft also genau einmal. Neu gezeichnete Elemente bekommen den Schalter über den MutationObserver.
   Nicht in Links, ausgeblendet bei deaktivierten Knöpfen (CSS), für Screenreader und Tastatur unsichtbar. */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
/* Bei ausgeschalteter Vibration bleibt nur der Schalter „Vibration“ selbst versorgt, damit das Einschalten tickt. */
function armHaps(){const on=vibOn(),keep="[data-setting=vibration]";if(!on)document.querySelectorAll("input.hap").forEach(i=>{if(!i.parentElement.matches(keep))i.remove()});
  document.querySelectorAll(on?HAPSEL:keep).forEach(el=>{if(el.tagName==="A"||el.querySelector(":scope>input.hap"))return;
    const i=document.createElement("input");i.type="checkbox";i.setAttribute("switch","");i.className="hap";i.tabIndex=-1;i.setAttribute("aria-hidden","true");el.appendChild(i)})}
if(IOS){armHaps();new MutationObserver(armHaps).observe(document.body,{childList:true,subtree:true})}
const CK='<svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
/* Welle: eine weiche, matte Scheibe breitet sich vom Finger aus und verblasst in 600 ms. Erst beim Loslassen,
   damit Scrollen über große Karten ruhig bleibt; das sofortige Feedback beim Drücken gibt :active. */
function wave(el,x,y){const r=el.getBoundingClientRect(),sz=2*Math.hypot(Math.max(x,r.width-x),Math.max(y,r.height-y));
  const w=document.createElement("span"),i=document.createElement("i");w.className="wave";w.setAttribute("aria-hidden","true");
  Object.assign(i.style,{left:x+"px",top:y+"px",width:sz+"px",height:sz+"px"});w.appendChild(i);el.appendChild(w);
  i.animate([{transform:"translate(-50%,-50%) scale(.12)",opacity:1},{transform:"translate(-50%,-50%) scale(1)",opacity:0}],{duration:600,easing:"cubic-bezier(.2,.6,.3,1)",fill:"both"}).onfinish=()=>w.remove()}
/* Füllung: Wird ein Element durch das Tippen ausgewählt, läuft seine Füllung vom Fingerpunkt aus ein (Radius --fr über
   @property animiert). Wird das Element dabei neu gezeichnet, findet tapKey das neue wieder. */
let tapMark=null;
function tapKey(el){const a=[...el.attributes].filter(x=>x.name.startsWith("data-")&&x.name!=="data-lit").map(x=>`[${x.name}="${CSS.escape(x.value)}"]`).join("");
  return a?el.tagName.toLowerCase()+"."+el.classList[0]+a:(el.id?"#"+CSS.escape(el.id):null)}
const selNow=el=>el.getAttribute("aria-pressed")==="true"||["on","won","chosen"].some(c=>el.classList.contains(c));
function settleFill(src,x,y){let el=src.isConnected?src:null;if(!el&&tapMark&&tapMark.key){try{el=document.querySelector(tapMark.key)}catch(e){}}
  if(!el||!selNow(el)||calm())return;el.style.setProperty("--px",x+"px");el.style.setProperty("--py",y+"px");el.classList.remove("fillin");void el.offsetWidth;el.classList.add("fillin")}
document.addEventListener("pointerdown",e=>{const el=famHost(e.target);if(!el){tapMark=null;return}const r=el.getBoundingClientRect();
  tapMark={el,key:tapKey(el),x:e.clientX-r.left,y:e.clientY-r.top,t:now()}},{passive:true,capture:true});
/* Der unsichtbare Schalter soll keinen Fokus behalten (sonst gälte er als Eingabefeld). */
document.addEventListener("click",e=>{if(e.target.classList&&e.target.classList.contains("hap"))e.target.blur()},true);
addEventListener("click",()=>{buzzKind=null},true);
addEventListener("click",e=>{const k=buzzKind;buzzKind=null;if(!e.isTrusted)return;const el=famHost(e.target);
  const fam=el?famOf(el):(e.target.closest&&e.target.closest(".gsvg [data-pil]")?"sel":null);vib(k||fam);
  if(!el||!fam)return;const m=tapMark&&tapMark.el===el&&now()-tapMark.t<1500?tapMark:null;let x,y;
  if(m){x=m.x;y=m.y}else{const r=el.getBoundingClientRect();x=e.detail?e.clientX-r.left:r.width/2;y=e.detail?e.clientY-r.top:r.height/2}
  if(fam==="act"&&el.isConnected&&!calm())wave(el,x,y);
  if(fam==="sel")settleFill(el,x,y);tapMark=null});
/* Fehler: eine kleine, einmalige Seitwärtsbewegung */
function shake(el){if(calm()||!el)return;el.animate([{transform:"none"},{transform:"translateX(-4px)",offset:.2},{transform:"translateX(3px)",offset:.45},{transform:"translateX(-1.5px)",offset:.7},{transform:"none"}],{duration:360,easing:"ease-out"})}
/* Logo und Titel: Das kleine Gerüst federt einmal in seiner Spannung nach, unter dem Titel zeichnet sich ein feiner Strich
   vom kühlen zum warmen Ton und verblasst. */
function logoMove(){if(calm())return;const s=$("#home svg");
  if(s)s.animate([{transform:"rotate(0)"},{transform:"rotate(-5deg)",offset:.28},{transform:"rotate(2.5deg)",offset:.62},{transform:"rotate(0)"}],{duration:760,easing:"cubic-bezier(.3,.6,.3,1)"});
  const m=$("#home2");if(!m)return;m.querySelectorAll(".mline").forEach(x=>x.remove());const l=document.createElement("span");l.className="mline";l.setAttribute("aria-hidden","true");m.appendChild(l);
  l.animate([{transform:"scaleX(0)",opacity:1},{transform:"scaleX(1)",opacity:1,offset:.55},{transform:"scaleX(1)",opacity:0}],{duration:900,easing:"cubic-bezier(.4,.1,.2,1)",fill:"both"}).onfinish=()=>l.remove()}
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

/* ---------- Erinnerungen über den eigenen Kalender ---------- */
const pad=n=>String(n).padStart(2,"0");
const icsDate=d=>`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const esc2=s=>s.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
/* Uhrzeit: im Erinnern-Blatt wählbar (remindAt), sonst die Standard-Uhrzeit aus den Einstellungen (S.settings.uebTime). */
let remindMode="taeglich",remindAt=null;
const remTime=()=>remindAt||S.settings.uebTime||"19:00";
function remindPlan(id,mode,tm){const e=U[id],v=S.ueb[id],start=new Date(),lastDay=new Date(v.keep?now()+13*DAY:v.start+(e.d-1)*DAY);lastDay.setHours(23,59,0,0);
  const [h,mi]=(tm||remTime()).split(":").map(Number);let first=new Date(),count=1;const at=d=>{d.setHours(h||0,mi||0,0,0);return d};
  if(mode==="morgen")first.setDate(first.getDate()+1);
  /* Täglich bis einschließlich zum letzten Tag der Übung */
  if(mode==="taeglich"){if(at(new Date())<=start)first.setDate(first.getDate()+1);const f0=new Date(first);f0.setHours(0,0,0,0);const l0=new Date(lastDay);l0.setHours(0,0,0,0);count=Math.max(1,Math.round((l0-f0)/DAY)+1)}
  if(mode==="ende"){first=new Date(lastDay);if(at(new Date(first))<start)first=new Date();if(at(new Date(first))<start)first.setDate(first.getDate()+1)}
  at(first);const end=new Date(first.getTime()+15*60000);
  return {e,first,end,count,text:`Wertegerüst: ${e.t}`,details:`${e.x}\n\n${e.s.map(s=>"• "+s).join("\n")}\n\n${APP_URL}#ueben`}}
function icsFor(p){return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Wertegeruest//DE","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${p.e.id}-${Date.now()}@wertegeruest`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(p.first)}`,`DTEND:${icsDate(p.end)}`,p.count>1?`RRULE:FREQ=DAILY;COUNT=${p.count}`:"",`SUMMARY:${esc2(p.text)}`,`DESCRIPTION:${esc2(p.details)}`,`URL:${APP_URL}`,"BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:${esc2(p.text)}`,"TRIGGER:PT0M","END:VALARM","END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n")}
function googleFor(p){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;let u=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(p.text)}&dates=${icsDate(p.first)}/${icsDate(p.end)}&ctz=${encodeURIComponent(tz)}&details=${encodeURIComponent(p.details)}`;if(p.count>1)u+=`&recur=${encodeURIComponent("RRULE:FREQ=DAILY;COUNT="+p.count)}`;return u}
/* offer: einmal direkt nach dem Annehmen, freiwillig, mit „Ohne Erinnerung weiter“ und „Nicht mehr anbieten“ */
function remindSheet(id,offer){if(S.ueb[id]&&S.ueb[id].keep&&remindMode==="ende")remindMode="taeglich";const e=uv(U[id]),tm=remTime(),p=remindPlan(id,remindMode,tm);const when=p.first.toLocaleString("de-DE",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"});
  const o=offer?` data-offer="1"`:"";
  sheet(`<div class="label">${offer?"Übung angenommen":"Erinnerung"}</div><h2>${offer?"Soll dich dein Kalender erinnern?":e.t}</h2><p class="lead">${offer?`Für „${e.t}“. Das ist freiwillig. `:""}Die Erinnerung landet in deinem eigenen Kalender. So meldet sich dein Handy zuverlässig, auch wenn die App geschlossen ist.</p>
  <div class="chips wrap">${(S.ueb[id]&&S.ueb[id].keep?[["morgen","Morgen"],["taeglich","Jeden Tag, zwei Wochen lang"]]:[["morgen","Morgen"],["taeglich","Jeden Tag bis zum Ende"],["ende","Am letzten Tag"]]).map(([k,n])=>`<button class="chip" data-rmode="${k}" data-id="${id}"${o} aria-pressed="${remindMode===k}">${n}</button>`).join("")}</div>
  <div class="rtime"><label class="label" for="utime">Uhrzeit</label><input type="time" id="utime" value="${tm}" data-id="${id}"${o}></div>
  <p class="label rwhen">${p.count>1?`${p.count}× täglich um ${tm} Uhr, zuerst am ${p.first.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})}`:`${when} Uhr`}</p>
  <div class="row"><button class="btn primary" data-ics="${id}">Apple- oder iPhone-Kalender</button><a class="btn" href="${googleFor(p)}" target="_blank" rel="noopener">Google Kalender</a></div>
  <p class="muted small">Der erste Knopf lädt eine Kalenderdatei, die auch Outlook und andere Kalender öffnen. Die Standard-Uhrzeit stellst du in den Einstellungen ein.</p>
  ${offer?`<div class="row"><button class="btn" id="shx2">Ohne Erinnerung weiter</button><button class="linkbtn" id="nooffer">Nicht mehr anbieten</button></div>`:""}`,e.cat)}
function downloadFile(name,text){const url=URL.createObjectURL(new Blob([text],{type:"text/calendar;charset=utf-8"}));const l=document.createElement("a");l.href=url;l.download=name;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);toast("Kalenderdatei geöffnet. Du musst den Termin nur noch hinzufügen.")}

/* ---------- Navigation ---------- */
let shownDay=null;
function refreshHome(){const logo=$("#home"),newDay=shownDay&&todayKey()!==shownDay;shownDay=todayKey();
  window.scrollTo({top:0,behavior:calm()?"auto":"smooth"});
  if(!calm())lightUp(logo);
  setTimeout(()=>{anim=true;render();const g=$(".gsvg .lit");if(g)lightUp(g);
    if(newDay){toast("Neuer Tag: Impuls und Probe des Tages sind frisch.");const d=document.querySelector(".today");if(d)setTimeout(()=>trace(d),300)}},calm()?0:300)}
function goHome(){anim=true;S.cur=null;shared=null;tab="geruest";persist();render();window.scrollTo(0,0)}
(()=>{let x0=null,y0=0,t0=0,card=null;
 document.addEventListener("touchstart",e=>{card=e.target.closest&&e.target.closest(".bite");if(!card||e.touches.length>1){card=null;return}x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now()},{passive:true});
 document.addEventListener("touchmove",e=>{if(!card||x0===null)return;const dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;if(Math.abs(dx)>Math.abs(dy)*1.4&&!calm()){card.style.transform=`translateX(${dx*.3}px)`;card.style.opacity=1-Math.min(.35,Math.abs(dx)/600)}},{passive:true});
 document.addEventListener("touchend",e=>{if(!card||x0===null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;const c=card;card=null;x0=null;
   const swipe=Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.4&&Date.now()-t0<800;
   if(swipe&&dx<0){const b=pickImp();if(b){openImp(b.id);return}}
   if(swipe&&dx>0){backToImp();return}
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

/* ---------- Tage einer Übung; spark zeigt die Zwischenstationen (zäh bis toll) aus älteren Speicherständen ---------- */
const dayIdx=v=>Math.floor((new Date().setHours(0,0,0,0)-new Date(v.start).setHours(0,0,0,0))/DAY);
function spark(v){const c=v.checks||{},ks=Object.keys(c).map(Number).sort((a,b)=>a-b);if(!ks.length)return "";const w=120,h=28,mx=Math.max(...ks,1);
  const pts=ks.map(k=>[ks.length>1?4+(k/mx)*(w-8):w/2,h-4-(c[k]-1)/4*(h-8)]);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-label="Verlauf deiner Zwischenstationen">${pts.length>1?`<polyline points="${pts.map(p=>p.join(",")).join(" ")}"/>`:""}${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.6"/>`).join("")}</svg>`}

/* ---------- Momente: selten und nüchtern ---------- */
const MOMENTS=[
 {id:"kern1",t:"Die erste Stütze",x:"Sie steht jetzt in deinem Gerüst. Sie wächst um einen Stab, wenn du einen Leitsatz schreibst, dich in einer Probe entscheidest, eine Übung machst und den Leitsatz später bekräftigst.",ok:()=>S.kern.length>=1},
 {id:"leit1",t:"Der erste Leitsatz",x:"Die App fragt in ein paar Tagen nach, ob du noch dazu stehst.",ok:()=>S.kern.some(hasLeit)},
 {id:"probe1",t:"Die erste Entscheidung",x:"Deine Wahl zählt für die Werte, die sie stärkt.",ok:()=>nPrDone()>=1},
 {id:"kern5",t:"Fünf Stützen",x:"Dein Gerüst hat jetzt alle Stützen. Ab jetzt geht es darum, sie zu festigen.",ok:()=>S.kern.length>=5},
 {id:"ueb1",t:"Die erste Übung",x:"Deine Notiz dazu findest du im Bautagebuch.",ok:()=>Object.keys(S.ueb).some(uid=>runsOf(uid).some(r=>r.status==="done"))},
 {id:"fest1",t:"Zum ersten Mal bekräftigt",x:"Je öfter du einen Leitsatz bekräftigst, desto seltener fragt die App nach.",ok:()=>Object.values(S.leit).some(l=>l&&l.n>=1)},
 {id:"probe10",t:"Zehn Entscheidungen",x:"Im Bautagebuch zeigt sich jetzt deutlicher, welche Werte bei dir den Ausschlag geben.",ok:()=>nPrDone()>=10},
 {id:"steht",t:"Das Gerüst trägt",x:"Alle fünf Stützen stehen mindestens auf der dritten Stufe.",ok:()=>S.kern.length>=5&&S.kern.every(id=>level(id)>=3)},
 {id:"voll",t:"Das Gerüst steht",x:"Alle fünfundzwanzig Bauteile sind gesetzt. Es bleibt stabil, solange du es benutzt.",ok:()=>parts()>=25},
 {id:"all",t:"Alle Impulse gelesen",x:"Ab jetzt kommen die Impulse in größeren Abständen wieder.",ok:()=>Object.keys(S.read).length>=IMPULSE.length}];
/* Ein Moment erscheint nur auf der Startseite, ohne offenes Blatt und erst, wenn das Einzeichnen neuer Stäbe
   fertig ist (freshUntil + 400 ms). Passt es gerade nicht (Blatt offen, anderer Reiter, Nutzer tippt), bleibt er
   vorgemerkt und kommt beim nächsten ruhigen Besuch der Startseite. checkMoments() darf man jederzeit aufrufen.
   Toasts warten, solange ein Moment offen ist (siehe toast). */
let momentTimer=0,lastTap=0;
document.addEventListener("pointerdown",()=>{lastTap=now()},{passive:true,capture:true});
const momentFits=()=>tab==="geruest"&&!S.cur&&!$("#layer").innerHTML&&!momentOpen;
function checkMoments(){clearTimeout(momentTimer);if(!momentFits())return;const m=MOMENTS.find(m=>!S.moments[m.id]&&m.ok());if(!m)return;
  const t0=now(),wait=Math.max(900,freshUntil-t0+400);momentTimer=setTimeout(()=>{if(!momentFits()||lastTap>t0||S.moments[m.id]||!m.ok())return;showMoment(m)},wait)}
/* Momente, die seit since erreicht wurden und deren Bedingung nicht mehr gilt (etwa nach dem Abwählen einer Entscheidung), werden wieder offen. */
function pruneMoments(since){MOMENTS.forEach(m=>{if(S.moments[m.id]&&S.moments[m.id]>=since&&!m.ok())delete S.moments[m.id]})}
function showMoment(m){S.moments[m.id]=now();persist();momentOpen=true;clearTimeout(undoTimer);document.querySelectorAll(".toast").forEach(x=>{x.classList.add("out");setTimeout(()=>x.remove(),320)});const d=document.createElement("div");d.className="moment";d.innerHTML=`<div class="mcard" role="dialog" aria-modal="true" aria-labelledby="mtitle">${miniSVG("memb")}<p class="label">Ein Moment</p><h2 id="mtitle">${m.t}</h2><p>${m.x}</p><button class="btn" id="mok">Weiter</button></div>`;
  document.body.appendChild(d);setTimeout(()=>lightUp(d.querySelector(".memb"),true),200);
  const close=()=>{d.classList.add("out");momentOpen=false;setTimeout(()=>d.remove(),350);releaseToast();if(undoState)setTimeout(showUndo,250)};d.addEventListener("click",e=>{if(e.target.closest("#mok")||e.target===d)close()})}

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
   <p class="lead">Hier baust du dir ein Gerüst aus deinen eigenen Werten. Zuerst findest du in etwa fünf Minuten heraus, welche dich tragen. Danach wächst dein Gerüst mit jedem Gedanken, jeder Entscheidung und jeder kleinen Übung.</p>
   <p class="muted small">Alles bleibt auf deinem Gerät.</p>
   <div class="row"><button class="btn primary" data-finder="1">Meine Werte finden</button><button class="btn" id="shx2">Erst umsehen</button></div></div>`)}

/* ---------- Speichern: neue Bauteile erkennen ---------- */
const lvSnap=()=>Object.fromEntries(S.kern.map(id=>[id,level(id)]));
/* true, wenn seit dem letzten save() ein Bauteil dazugekommen ist; nur für die Stärke der Haptik */
const gains=()=>{const o=S.lv||{};return S.kern.some(id=>level(id)>(o[id]||0))};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
/* save(true) zeigt die Meldung „Neues Bauteil“ nicht selbst, sondern gibt ihren Text zurück (für eine Meldung mit Rückgängig).
   save("restore") nach dem Abwählen: Bauteile, die dadurch zurückkehren, gab es schon; sie gelten nicht als neu.
   Bauteile, die es nicht mehr gibt (abgewählt, zurückgenommen), verschwinden aus S.fresh. */
const nbText=key=>{const [id,k]=key.split(":");return `<b>Neues Bauteil</b> · ${W[id].n} steht jetzt auf Stufe ${+k+1}`};
const partExists=key=>{const [id,k]=key.split(":");return S.kern.includes(id)&&+k<level(id)};
function save(silent){const cur=lvSnap(),old=S.lv||{},inc=[];Object.entries(cur).forEach(([id,l])=>{for(let k=(old[id]||0);k<l;k++)inc.push(id+":"+k)});
  S.lv=cur;S.fresh=S.fresh.filter(partExists);let msg="";
  if(inc.length&&silent!=="restore"){S.fresh=[...S.fresh.filter(x=>!inc.includes(x)),...inc];const last=inc[inc.length-1];if(tab!=="geruest")msg=nbText(last);
    setTimeout(()=>{if(!silent&&tab!=="geruest"&&partExists(last))toast(nbText(last));renderTabs()},500)}
  persist();return silent?msg:undefined}
if(!S.lv){S.lv=lvSnap();persist()}

/* ---------- Rendern & Ereignisse ---------- */
let logoHTML="";
function render(){
  const v={geruest:viewGeruest,imp:viewImp,ueben:viewUeben,werte:viewWerte}[tab]();
  const M=$("#main");M.classList.remove("anim","quick");M.innerHTML=v;void M.offsetWidth;if(anim)M.classList.add("anim");if(anim==="quick")M.classList.add("quick");anim=false;renderTabs();
  $("#app").dataset.tab=tab;
  if(!logoHTML){logoHTML=LOGO;$("#home").innerHTML=LOGO}$("#topline").textContent=`${parts()} / 25`;
  if(tab==="geruest")playFresh();
  if(pendingGlow){pendingGlow=false;const c=document.querySelector('.bite h2');if(c&&S.cur&&I[S.cur])setTimeout(()=>lightUp(c),700)}
  checkMoments()}
function openProbe(id){if($("#layer").innerHTML)$("#layer").innerHTML="";pcur=id;pFilter="alle";anim=true;tab="ueben";render();const el=$("#probe");if(el){el.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});setTimeout(()=>trace(el,`var(--c-${P[id].cat})`),350)}}
document.addEventListener("click",e=>{
  if(e.target.closest){const rh=e.target.closest(".rhit");if(rh){if(rh.dataset.fund){resonate(null);valueSheet("wuerde")}else pillarTap(nearRod(e)||rh.dataset.pil);return}const lg=e.target.closest(".glegend [data-pil]");if(lg){pillarTap(lg.dataset.pil);return}if(e.target.closest("[data-wurde]")){valueSheet("wuerde");return}const g=e.target.closest(".gsvg");if(g){const h=e.target.closest("[data-pil]");if(h){pillarTap(h.dataset.pil);return}const sl=e.target.closest("[data-slot]");if(sl){if(!S.kern.length){finder();return}anim=true;tab="werte";render();window.scrollTo(0,0);return}if(e.target.closest(".slab")){valueSheet("wuerde");return}}}
  const t=e.target.closest("button,a");if(!t)return;const d=t.dataset;
  if(t.classList.contains("ubtn")){doUndo();return}
  if(d.addslot){addSheet();return}
  if(finderClick(t,d))return;
  if(t.closest(".bite .links")&&!t.dataset.lit){t.dataset.lit=1;trace(t,getComputedStyle(t).getPropertyValue("--c").trim()||null);
    setTimeout(()=>{t.click();delete t.dataset.lit},calm()?0:380);return}
  if(t.id==="go"){sessionReads++;if(maybeScrollHint())return;const b=pickImp();if(!b)return;lightUp(t.querySelector(".stack"));t.classList.add("pull");setTimeout(()=>requestAnimationFrame(()=>openImp(b.id)),calm()?0:420);return}
  if(t.id==="next"){sessionReads++;if(maybeScrollHint())return;const b=pickImp();if(b)openImp(b.id);return}
  /* Wert-Chips in einer entschiedenen Option öffnen den Wert, ohne die Wahl zu berühren */
  {const vc=e.target.closest(".opt .vchip");if(vc){valueSheet(vc.dataset.wert);return}}
  if(d.pick){const [pid,i]=d.pick.split(":");const p=P[pid];const old=S.proben[pid],blindNow=pBlind===pid&&old&&old.o!=null;
    /* Erneutes Antippen der gewählten Option hebt die Entscheidung auf */
    if(!blindNow&&old&&old.o===+i){const sn=snap();unpick(pid);save("restore");render();undoToast("Deine Entscheidung ist aufgehoben.",false,sn,{after:scrollProbe});return}
    if(t.getAttribute("aria-disabled"))return;
    const sn=snap(),prev=old?JSON.parse(JSON.stringify(old)):null;
    if(blindNow){old.hist=(Array.isArray(old.hist)?old.hist:[]).concat([{o:old.o,t:old.t,r:old.r||""}]);old.r="";old.wq="";old.again=true}else if(old)old.again=false;
    pBlind=null;S.proben[pid]=Object.assign(S.proben[pid]||{},{o:+i,t:now(),prev});delete S.proben[pid].ow;buzz("ok");
    t.classList.add("chosen");lightUp(t);setTimeout(()=>{const nb=save(true);render();const el=$("#probe");if(el){const pk=el.querySelector(".opt.pick");if(pk){pk.classList.add("drawn");trace(pk,`var(--c-${p.cat})`)}const rv=el.querySelector(".reveal");if(rv)rv.scrollIntoView({block:"nearest",behavior:calm()?"auto":"smooth"})}
      undoToast(nb||"Deine Entscheidung ist gespeichert.",true,sn,{after:scrollProbe})},calm()?0:380);return}
  if(d.psave){const v=S.proben[d.psave];if(v){v.r=$("#preason").value.trim();const wq=$("#pwq")?$("#pwq").value.trim():"";if(wq!==(v.wq||"")){v.wq=wq;v.wqt=now()}save();buzz("ok");toast(wq||v.r?"Gespeichert. Du findest es im Bautagebuch.":"Gespeichert.",true)}return}
  if(d.blindgo){pBlind=d.blindgo;pHint=null;render();const el=$("#probe");if(el)el.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});return}
  if(d.previse){const v=S.proben[d.previse];if(v&&v.o!=null){const sn=snap(),since=v.t||0;v.o=null;delete v.ow;pruneMoments(since);save();render();undoToast("Du kannst jetzt neu entscheiden.",false,sn,{after:scrollProbe})}return}
  if(t.id==="pnext"){pBlind=null;pHint=null;const cur=pcur;pcur=null;S.pskip=(S.pskip||0)+1;persist();let p=currentProbe();if(p&&p.id===cur){pcur=null;S.pskip++;p=currentProbe()}anim=true;render();const el=$("#probe");if(el)el.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});return}
  if(d.pshare){shareProbe(pv(P[d.pshare],null));return}
  if(d.probeOpen){const id=d.probeOpen;pBlind=d.blind&&blindDue(id)?id:null;pHint=d.phint||null;openProbe(id);return}
  if(d.wq){wqTap(t);return}
  if(d.pf){const [q,v]=d.pf.split(":"),p=S.profil=Object.assign({v:1,phase:null,nah:[],gruppe:[]},PRO()||{});
    if(q==="phase")p.phase=p.phase===v?null:v;else{const a=Array.isArray(p[q])?p[q]:[];p[q]=a.includes(v)?a.filter(x=>x!==v):a.concat([v])}
    S.pfAsk={t:now(),nie:true};persist();pfRefresh();return}
  if(t.id==="pfdel"){const sn=snap(),inSheet=!!document.querySelector("#layer .pfbox");delete S.profil;persist();pfRefresh();
    undoToast("Deine Angaben sind gelöscht.",false,sn,inSheet?{reopen:pfSheet}:null);return}
  if(t.id==="pfgo"){S.pfAsk={t:now(),nie:false};persist();pfSheet();return}
  if(t.id==="pfdone"){closeSheet();render();return}
  if(t.id==="pflater"){S.pfAsk={t:now(),nie:false};persist();render();return}
  if(t.id==="pfnie"){const sn=snap();S.pfAsk={t:now(),nie:true};persist();render();undoToast("Die App fragt nicht mehr. Die Fragen findest du in den Einstellungen.",false,sn);return}
  if(d.lbsp){const p=t.parentNode.querySelector(".lbsp");if(p){p.hidden=!p.hidden;t.textContent=p.hidden?"Beispiel ansehen":"Beispiel ausblenden"}return}
  if(d.fnote){const b=$("#fnb-"+d.fnote);if(b){b.hidden=false;t.hidden=true;const ta=b.querySelector("textarea");if(ta)ta.focus()}return}
  if(d.affirm){const id=d.affirm,sn=snap(),L=S.leit[id];const fn=$("#fn-"+id),nt=fn?fn.value.trim():"";if(nt)L.notes=(Array.isArray(L.notes)?L.notes:[]).concat([{t:now(),x:nt}]);L.n=(L.n||0)+1;L.next=now()+FIV[Math.min(L.n,FIV.length-1)]*DAY;buzz("ok");const card=t.closest(".fest");if(card)lightUp(card);
    const msg=nt?"Bekräftigt. Deine Notiz steht im Bautagebuch.":"Bekräftigt. Die App fragt später wieder nach.";
    /* Rückgängig: Die Karte kommt wieder, die Notiz steht wieder im Feld */
    const back=()=>{if(!nt)return;const b=$("#fnb-"+id),q=document.querySelector(`[data-fnote="${id}"]`);if(b){b.hidden=false;if(q)q.hidden=true;const ta=b.querySelector("textarea");if(ta)ta.value=nt}};
    setTimeout(()=>{const nb=save(true);anim=true;render();undoToast(nb||msg,true,sn,{after:back})},calm()?0:450);return}
  if(d.leitsave){const id=d.leitsave,txt=$("#leittext").value.trim();if(!txt){buzz("err");shake($("#leittext"));toast("Schreib zuerst einen Satz.");return}const sn=snap(),L=S.leit[id]||{n:0};const isNew=!L.t;L.t=txt;L.at=L.at||now();if(isNew||!L.next)L.next=now()+FIV[0]*DAY;S.leit[id]=L;buzz("ok");closeSheet();toBuild();
    undoToast("Leitsatz gespeichert.",true,sn,{reopen:()=>{valueSheet(id);const ta=$("#leittext");if(ta)ta.value=txt}});return}
  if(d.kern){if(S.kern.length>=MAXKERN)return;const id=d.kern,sn=snap();S.kern.push(id);buzz("ok");lightUp(t);closeSheet();const wn=W[id].n;setTimeout(()=>{toBuild();undoToast(`${wn} ist jetzt eine Stütze.`,true,sn,{reopen:()=>valueSheet(id)})},calm()?0:200);return}
  if(d.unkern){const id=d.unkern,sn=snap();S.kern=S.kern.filter(x=>x!==id);save();valueSheet(id);render();undoToast(`${W[id].n} ist keine Stütze mehr.`,false,sn,{reopen:()=>valueSheet(id)});return}
  if(d.wert){if(t.closest(".opt"))return;valueSheet(d.wert);return}
  if(d.gowlist){const l=$("#wlist");if(l)l.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});return}
  if(d.tabgo){if($("#layer").innerHTML)$("#layer").innerHTML="";anim=true;tab=d.tabgo;S.cur=null;render();window.scrollTo(0,0);return}
  if(d.ueb){uebSheet(d.ueb,d.uhint);return}
  if(d.ushare){shareUeb(d.ushare);return}
  /* Tageseintrag: Gemacht / Keine Gelegenheit / Diesmal nicht. Dieselbe Antwort noch einmal antippen löscht den Eintrag. */
  if(d.log){const v=S.ueb[d.log],k=+d.day;if(!v||!LOGW.some(x=>x[0]===d.val))return;const sn=snap();v.log=v.log||{};const off=v.log[k]===d.val;if(off)delete v.log[k];else{v.log[k]=d.val;buzz("ok")}
    save();render();undoToast(off?"Der Eintrag ist gelöscht.":`Eingetragen: ${LOGW.find(x=>x[0]===d.val)[1]}.`,!off,sn);return}
  if(d.logback){logBack[d.logback]=!logBack[d.logback];render();const c=document.querySelector(`[data-run="${d.logback}"] .ulog`);if(c)c.scrollIntoView({block:"nearest"});return}
  if(d.keep){const v=S.ueb[d.keep];if(!v)return;const sn=snap();v.keep=true;save();render();undoToast("Die Übung läuft weiter, ohne Frist.",false,sn);return}
  if(d.fuer){acceptSheet(d.fuer,null,false,true);return}
  if(d.fsel){accSel=accSel===d.fsel?null:d.fsel;document.querySelectorAll("#fsel [data-fsel]").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.fsel===accSel)));const n=$("#fselnote"),id=($("#acceptgo")||$("#fuergo")||{dataset:{}}).dataset.id;if(n&&id)n.textContent=fuerNote(id,accSel);return}
  if(t.id==="fuergo"){const id=t.dataset.id,v=S.ueb[id];if(!v)return;const sn=snap();v.fuer=accSel;save();closeSheet();render();
    undoToast(accSel?`Die Übung gilt jetzt für ${W[accSel].n}.`:"Die Übung läuft jetzt ohne Stütze.",false,sn,{reopen:()=>acceptSheet(id,null,false,true)});return}
  if(d.uebrun){const id=d.uebrun,v=S.ueb[id];if(!v)return;if(t.closest(".next")){S.askDay=todayKey();if(t.dataset.doneask)v.doneAsk=1;persist()}if($("#layer").innerHTML)$("#layer").innerHTML="";anim=true;tab="ueben";S.cur=null;render();
    const c=document.querySelector(`[data-run="${id}"]`);if(c){c.scrollIntoView({block:"start",behavior:calm()?"auto":"smooth"});setTimeout(()=>trace(c,`var(--c-${U[id].cat})`),350)}return}
  if(t.id==="nooffer"){const sn=snap();S.settings.uebOffer=false;persist();closeSheet();undoToast("Die App bietet keine Erinnerung mehr an. „Erinnern“ auf der Karte bleibt.",false,sn,{after:()=>{S.settings.uebOffer=true;persist()}});return}
  /* Schalter: nur der Zustand wechselt, ohne Neuzeichnen, damit der Knopf sichtbar hinübergleitet */
  if(d.setting){let on;if(d.setting==="hell"){S.settings.theme=S.settings.theme==="hell"?"dunkel":"hell";applyTheme();on=S.settings.theme==="hell"}else{S.settings[d.setting]=S.settings[d.setting]===false;on=S.settings[d.setting]}
    persist();t.setAttribute("aria-checked",on);if(d.setting==="vibration"&&IOS)armHaps();return}
  if(t.id==="dailyics"){dailyIcs();return}
  if(t.id==="shx2"){closeSheet();return}
  if(t.id==="nohint"){const sn=snap();S.settings.antiScroll=false;persist();closeSheet();undoToast("Alles klar. Die Einstellung findest du unter „Gerüst“.",false,sn,{after:()=>{S.settings.antiScroll=true;persist()}});return}
  if(t.id==="home"||t.id==="home2"){if(tab!=="geruest"||S.cur){goHome();logoMove();return}logoMove();refreshHome();return}
  if(t.id==="back"){backToImp();return}
  if(t.id==="share"&&S.cur){shareImp(I[S.cur]);return}
  if(t.id==="shareapp"){shareApp();return}
  if(t.id==="explore"){shared=null;S.cur=null;try{history.replaceState(null,"",location.pathname)}catch(x){}goHome();return}
  if(t.id==="save"&&S.cur){const sn=snap(),on=!S.saved[S.cur];if(on){S.saved[S.cur]=now();buzz("ok")}else delete S.saved[S.cur];persist();render();undoToast(on?"Gemerkt. Du findest es im Bautagebuch.":"Nicht mehr gemerkt.",on,sn);return}
  /* Filter: ein gewählter Bereich wird durch erneutes Antippen abgewählt, dann gilt wieder „Alle“. „Alle“ selbst bleibt gewählt. */
  if(d.filter){const nf=S.filter===d.filter?"alle":d.filter;if(nf===S.filter)return;S.filter=nf;persist();render();return}
  if(d.deep&&S.cur){const b=I[S.cur];trace(t,`var(--c-${b.cat})`);setTimeout(()=>{d.deep==="ev"?evSheet(b):deepSheet(b)},calm()?0:420);return}
  if(d.daily){const id=d.daily;if(t.classList.contains("go2"))return;t.classList.add("go2");lightUp(t);setTimeout(()=>openDaily(id,t),calm()?0:320);return}
  if(d.open){if($("#layer").innerHTML)$("#layer").innerHTML="";openImp(d.open);return}
  if(d.pfilter){const nf=pFilter===d.pfilter?"alle":d.pfilter;if(nf===pFilter)return;pFilter=nf;pcur=null;pBlind=null;pHint=null;S.pskip=0;render();return}
  if(d.ufilter){const nf=uFilter===d.ufilter?"alle":d.ufilter;if(nf===uFilter)return;uFilter=nf;uMore=false;render();return}
  if(d.wfilter){const nf=wFilter===d.wfilter?"alle":d.wfilter;if(nf===wFilter)return;wFilter=nf;render();return}
  if(t.id==="umore"){uMore=true;render();return}
  if(d.accept){if(activeUeb().length>=MAXACT)return;acceptSheet(d.accept,d.uhint,!!$("#layer").innerHTML);return}
  /* Annehmen: Ein früherer Durchgang wandert unverändert in runs; der Plan wird als Vorschlag übernommen. */
  if(t.id==="accrem"){t.setAttribute("aria-pressed",String(t.getAttribute("aria-pressed")!=="true"));return}
  if(t.id==="acceptgo"){const aid=t.dataset.id;if(!U[aid]||activeUeb().length>=MAXACT)return;const sn=snap(),prev=S.ueb[aid],fromSheet=!!t.dataset.from;
    let runs=[];if(prev){const r=JSON.parse(JSON.stringify(prev));runs=Array.isArray(r.runs)?r.runs:[];delete r.runs;delete r.ask;runs.push(r)}
    S.ueb[aid]={v:2,status:"active",start:now(),fuer:META.includes(aid)?null:accSel,plan:prev&&prev.plan||""};if(runs.length)S.ueb[aid].runs=runs;buzz("ok");
    {const rb0=$("#accrem");if(rb0)S.uebRem=rb0.getAttribute("aria-pressed")==="true"}
    save();anim=false;tab="ueben";S.cur=null;render();const card=document.querySelector(`[data-run="${aid}"]`);if(card)card.scrollIntoView({block:"center"});
    /* Erinnerung direkt aus dem Annehmen-Blatt: lädt die Kalenderdatei im selben Tippen; die Wahl wird für das nächste Mal gemerkt */
    const rt=$("#acctime"),rem=!!S.uebRem&&!!rt;
    if(rem){const tm=(rt&&rt.value)||S.settings.uebTime||"19:00";remindMode="taeglich";S.ueb[aid].remind="taeglich";persist();downloadFile(`wertegeruest-${aid}.ics`,icsFor(remindPlan(aid,"taeglich",tm)))}
    $("#layer").innerHTML="";if(card)setTimeout(()=>trace(card,`var(--c-${U[aid].cat})`),200);
    undoToast("Übung angenommen.",false,sn,fromSheet?{reopen:()=>uebSheet(aid)}:null);return}
  if(t.id==="uother"){S.uskip=(S.uskip||0)+1;persist();render();return}
  if(d.drop){const sn=snap();Object.assign(S.ueb[d.drop],{status:"dropped",end:now()});delete S.ueb[d.drop].ask;save();render();undoToast("Die Übung ist abgebrochen.",false,sn);return}
  if(d.remind){remindAt=null;remindSheet(d.remind);return}
  if(d.rmode){remindMode=d.rmode;remindSheet(d.id,!!d.offer);return}
  if(d.ics){const p=remindPlan(d.ics,remindMode,remTime());downloadFile(`wertegeruest-${d.ics}.ics`,icsFor(p));S.ueb[d.ics].remind=remindMode;persist();return}
  if(d.done){doneSheet(d.done);return}
  if(t.id==="savedone"){const id=t.dataset.id,m=document.querySelector('#moods [aria-pressed="true"]'),ud=$("#udays");let days;
    if(ud){const c=ud.querySelector('[aria-pressed="true"]');if(!c){buzz("err");shake(ud);toast("Wähl zuerst, an wie vielen Tagen du die Übung gemacht hast.");return}days=+c.dataset.udays}
    const sn=snap(),pre={mood:m?m.dataset.mood:null,note:$("#note").value.trim(),days},e=U[id],r=S.ueb[id]=S.ueb[id]||{start:now()};
    Object.assign(r,{status:"done",end:now(),mood:pre.mood,note:pre.note});if(days!=null)r.days=days;else delete r.days;delete r.ask;
    if(r.v!==2){r.v=2;if(!("fuer" in r))r.fuer=defFuer(id)}if(typeof r.plan==="string")r.plan=r.plan.trim();
    /* Gelebt: eintägig mit dem Abschluss, mehrtägig ab rund 70 % der Tage, bei EINMAL ab einem Tag */
    r.ok=!META.includes(id)&&(days==null?true:days>=needDays(id,r));buzz("ok");closeSheet();toBuild();
    undoToast(r.ok?"Übung geschafft.":"Gespeichert. Die Notiz steht im Bautagebuch.",true,sn,{reopen:()=>doneSheet(id,pre)});return}
  if(t.id==="reset"){confirmReset=true;render();return}
  if(t.id==="resetno"){confirmReset=false;render();return}
  if(t.id==="resetyes"){const sn=snap();S={read:{},saved:{},kern:[],leit:{},proben:{},ueb:{},filter:"alle",history:[],cur:null,settings:S.settings,moments:{},welcomed:S.welcomed,fresh:[],lv:{},owMig:1};persist();confirmReset=false;render();undoToast("Alles zurückgesetzt.",false,sn);return}
});
/* Nach einem Bauschritt: zum Gerüst, damit man das neue Teil einrasten sieht */
function toBuild(){save();if(S.fresh.length){anim=false;tab="geruest";S.cur=null;render();window.scrollTo({top:0,behavior:"auto"})}else render()}
let lastSum=0;document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("summary"))lastSum=Date.now()},true);
document.addEventListener("change",e=>{if(e.target.id==="rtime"){S.settings.remindTime=e.target.value||"08:00";persist();const g=$("#dailyg");if(g)g.href=dailyGoogle()}
  if(e.target.id==="utimedef"){S.settings.uebTime=e.target.value||"19:00";persist()}
  if(e.target.id==="utime"&&e.target.value){remindAt=e.target.value;remindSheet(e.target.dataset.id,!!e.target.dataset.offer)}});
/* Plan auf der laufenden Karte: wird beim Tippen gespeichert; ein leiser Hinweis bestätigt es. */
let planTimer=0;document.addEventListener("input",e=>{const id=e.target.dataset&&e.target.dataset.plan;if(!id||!S.ueb[id])return;S.ueb[id].plan=e.target.value;persist();
  const st=e.target.parentNode.querySelector(".psaved");clearTimeout(planTimer);if(st)st.textContent="";planTimer=setTimeout(()=>{if(st&&st.isConnected)st.textContent="Gespeichert. Beim Abschluss steht es im Bautagebuch."},700)});
document.addEventListener("toggle",e=>{const t=e.target;const map={jfold:"jOpen",aboutfold:"aboutOpen",uebfold:"uebOpen",prfold:"prOpen",setfold:"setOpen",wqfold:"wqOpen"};if(map[t.id]){S[map[t.id]]=t.open;persist()}if(t.classList&&t.classList.contains("fold")&&t.open&&Date.now()-lastSum<600){const b=t.querySelector(".fbody");if(b&&!calm())b.animate([{opacity:0,transform:"translateY(-4px)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"})}},true);
document.addEventListener("keydown",e=>{if(e.target.closest&&e.target.closest("textarea,input:not(.hap)"))return;
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
    const go=()=>{if($("#layer").innerHTML||momentOpen||typing(document.activeElement)){setTimeout(go,4000);return}try{sessionStorage.setItem("wg-upd",m[1])}catch(e){}location.reload()};go()}).catch(()=>{})}
setTimeout(checkUpdate,1500);document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkUpdate()});setTimeout(welcome,700);
})();
