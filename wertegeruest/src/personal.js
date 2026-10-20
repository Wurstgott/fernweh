/* Personalisierung der Beispiele („kurzer Check“).
   Alles bleibt auf dem Gerät. Die Datei hat keine Abhängigkeiten und ändert keine Originaltexte:
   Sie liefert nur Fassungen mit Platzhaltern, die zur Laufzeit aufgelöst werden.

   Platzhalter in den Texten:
   {slot.form}          Rolle eines nahen Menschen, z. B. {nah.deinen} → „deine Schwester“ / „deinen Bruder“.
   {Slot.form}          dasselbe, erster Buchstabe groß (Satzanfang).
   {slot.g:m|f|n}       Text je nach grammatischem Geschlecht der gewählten Rolle.
   {slot.ist:a,b?ja|nein}  Text je nachdem, ob die gewählte Rolle eine der genannten ist.
   {k.name}/{K.name}    Wort aus KONTEXTE, je nach Lebensphase.
   {gm.name}/{GM.name}  Wort aus GEMEINSCHAFT, je nach Gruppe (oder ersatzweise Lebensphase).
   Ein Feld kann statt eines Textes ein Objekt nach Lebensphase sein: {schule:"…",beruf:"…"}.
   Fehlt die Phase darin, gilt der Originaltext. „schicht“ erbt von „beruf“, „ruhestand“ von „anderes“ (siehe ERBE).
   Hat ein Rollen-Slot keinen Rückfall (rueckfall:null) und passt niemand aus dem Profil, gilt ebenfalls der Originaltext.

   Formen einer Rolle (Schlüssel nach dem männlichen Muster, damit man sie leicht liest):
   dein/deinen/deinem   erste Nennung in der Du-Ansprache (Nominativ/Akkusativ/Dativ)
   dein2/deinen2/deinem2  spätere Nennung (bei Rückfallrollen „dein Freund“ statt „ein Freund“)
   mein/meinen/meinem   in Optionen, die in der Ich-Form stehen
   der/den/dem, zum     mit bestimmtem Artikel, „zum Bruder“/„zur Schwester“
   er/ihn/ihm           Personalpronomen
   sein/seine/seinen/seinem/seiner  Possessivbegleiter der Person („sein“/„ihr“ …)
   nomen                nur das Nomen */

/* ---------- Die Fragen des Checks ---------- */
const PERSONAL_FRAGEN=[
 {id:"phase",typ:"eins",
  frage:"Womit verbringst du gerade die meiste Zeit?",
  hinweis:"Danach richten sich Orte wie Klasse, Betrieb, Hochschule oder Team in den Beispielen.",
  optionen:[{v:"schule",t:"Schule"},{v:"ausbildung",t:"Ausbildung"},{v:"studium",t:"Studium"},{v:"beruf",t:"Arbeit"},
   {v:"schicht",t:"Arbeit im Schichtdienst"},{v:"ruhestand",t:"Ruhestand"},{v:"anderes",t:"Etwas anderes"}]},
 {id:"nah",typ:"mehrere",
  frage:"Wer ist dir nah und darf in den Beispielen vorkommen?",
  hinweis:"Wähle so viele, wie du magst. Diese Menschen kommen dann in den Beispielen vor, wenn es um jemanden geht, der dir nahesteht.",
  gruppen:[
   {t:"Familie",optionen:["mutter","vater","schwester","bruder","oma","opa","tochter","sohn","enkelin","enkel"]},
   {t:"Freundschaft und Beziehung",optionen:["freundin","freund","partnerin","partner"]},
   /* Nur das Paar, das zur gewählten Lebensphase passt, wird gezeigt. */
   {t:"Schule, Studium oder Arbeit",optionen:["mitschuelerin","mitschueler","kommilitonin","kommilitone","kollegin","kollege"],
    nachPhase:{schule:["mitschuelerin","mitschueler"],studium:["kommilitonin","kommilitone"],ausbildung:["kollegin","kollege"],beruf:["kollegin","kollege"],
     schicht:["kollegin","kollege"],ruhestand:[],_:["kollegin","kollege"]}},
   {t:"Jemand anderes",optionen:["mensch"]}]},
 {id:"gruppe",typ:"mehrere",
  frage:"Wo bist du regelmäßig mit anderen zusammen?",
  hinweis:"Zum Beispiel in deiner freien Zeit. Wenn nichts davon passt, überspring die Frage einfach.",
  optionen:[{v:"sport",t:"Sportverein oder Mannschaft"},{v:"musik",t:"Musik in einer Gruppe"},{v:"ehrenamt",t:"Ehrenamt oder Initiative"},{v:"jugend",t:"Jugendgruppe oder Pfadfinder"},{v:"gemeinde",t:"Gemeinde oder Glaubensgemeinschaft"}]}
];
const PHASEN=["schule","ausbildung","studium","beruf","schicht","ruhestand","anderes"];
/* Lebensphasen, die von einer anderen erben: Was für „schicht“ fehlt, kommt aus „beruf“, was für „ruhestand“ fehlt, aus „anderes“. */
const ERBE={schicht:"beruf",ruhestand:"anderes"};
const _kette=ph=>{const k=[];while(ph&&!k.includes(ph)){k.push(ph);ph=ERBE[ph]}return k};

/* ---------- Rollen mit allen Formen ---------- */
const ROLLEN=(()=>{
 const POSS={m:["","en","em"],f:["e","e","er"],n:["","","em"]};      /* dein|deinen|deinem, ein|einen|einem */
 const DEF={m:["der","den","dem"],f:["die","die","der"],n:["das","das","dem"]};
 const ADJ_GEM={m:["er","en","en"],f:["e","e","en"],n:["es","es","en"]}; /* nach dein/ein */
 const ADJ_SCHW={m:["e","en","en"],f:["e","e","en"],n:["e","e","en"]};  /* nach der */
 const PRON={m:["er","ihn","ihm","sein"],f:["sie","sie","ihr","ihr"],n:["es","es","ihm","sein"]};
 const ZU={m:"zum",f:"zur",n:"zum"};
 const K=["","2"];
 function formen(g,n,adj){
  const f={},a=i=>adj?adj+ADJ_GEM[g][i]+" ":"",as=i=>adj?adj+ADJ_SCHW[g][i]+" ":"";
  ["dein","mein"].forEach(st=>{["","en","em"].forEach((suf,i)=>{f[st+suf]=st+POSS[g][i]+" "+a(i)+n[i]})});
  ["","en","em"].forEach((suf,i)=>{f["dein"+suf+"2"]=f["dein"+suf]});
  ["der","den","dem"].forEach((k,i)=>{f[k]=DEF[g][i]+" "+as(i)+n[i]});
  f.zum=ZU[g]+" "+as(2)+n[2];
  const p=PRON[g];f.er=p[0];f.ihn=p[1];f.ihm=p[2];
  ["","e","en","em","er"].forEach(s=>{f["sein"+s]=p[3]+s});
  f.nomen=n[0];return f}
 /* Rückfallrollen mit unbestimmtem Artikel: erste Nennung „ein Freund“, spätere „dein Freund“ */
 function unbestimmt(g,n,adj){
  const f=formen(g,n,null),a=i=>adj?adj+ADJ_GEM[g][i]+" ":"";
  ["","en","em"].forEach((suf,i)=>{f["dein"+suf]="ein"+POSS[g][i]+" "+a(i)+n[i]});
  return f}
 const R={},add=(id,g,label,f,extra)=>{R[id]=Object.assign({id,g,label,f},extra||{})};
 const s=w=>[w,w,w],sw=w=>[w,w+"n",w+"n"];
 add("mutter","f","Mutter",formen("f",s("Mutter")));
 add("vater","m","Vater",formen("m",s("Vater")));
 add("schwester","f","Schwester",formen("f",s("Schwester")));
 add("bruder","m","Bruder",formen("m",s("Bruder")));
 add("oma","f","Oma",formen("f",s("Oma")));
 add("opa","m","Opa",formen("m",s("Opa")));
 add("tochter","f","Tochter",formen("f",s("Tochter")));
 add("sohn","m","Sohn",formen("m",s("Sohn")));
 add("enkelin","f","Enkelin",formen("f",s("Enkelin")));
 add("enkel","m","Enkel",formen("m",s("Enkel")));
 add("freundin","f","Beste Freundin",formen("f",s("Freundin"),"best"));
 add("freund","m","Bester Freund",formen("m",s("Freund"),"best"));
 add("partnerin","f","Partnerin",formen("f",s("Partnerin")));
 add("partner","m","Partner",formen("m",s("Partner")));
 add("mitschuelerin","f","Mitschülerin",formen("f",s("Mitschülerin")));
 add("mitschueler","m","Mitschüler",formen("m",s("Mitschüler")));
 add("kommilitonin","f","Kommilitonin",formen("f",s("Kommilitonin")));
 add("kommilitone","m","Kommilitone",formen("m",sw("Kommilitone")));
 add("kollegin","f","Kollegin",formen("f",s("Kollegin")));
 add("kollege","m","Kollege",formen("m",sw("Kollege")));
 /* Neutraler Rückfall und zugleich wählbar als „Jemand anderes“. \u0001 = Komma, falls der Satz weitergeht. */
 {const f=formen("m",["Mensch","Menschen","Menschen"]),rel=", der dir nahesteht\u0001";
  f.dein="ein Mensch"+rel;f.deinen="einen Menschen"+rel;f.deinem="einem Menschen"+rel;
  ["dein2","mein","der"].forEach(k=>f[k]="dieser Mensch");["deinen2","meinen","den"].forEach(k=>f[k]="diesen Menschen");
  ["deinem2","meinem","dem"].forEach(k=>f[k]="diesem Menschen");f.zum="zu diesem Menschen";
  add("mensch","m","Ein anderer Mensch, der mir nahesteht",f)}
 /* Rückfallrollen, die den Originaltext genau wiedergeben. Nicht wählbar. */
 add("ein_freund","m","",unbestimmt("m",s("Freund")),{intern:true});
 add("enger_freund","m","",unbestimmt("m",s("Freund"),"eng"),{intern:true});
 add("alter_freund","m","",unbestimmt("m",s("Freund"),"alt"),{intern:true});
 add("eine_freundin","f","",unbestimmt("f",s("Freundin")),{intern:true});
 add("gute_freundin","f","",unbestimmt("f",s("Freundin"),"gut"),{intern:true});
 return R})();

const FAMILIE=["mutter","vater","schwester","bruder","oma","opa","tochter","sohn","enkelin","enkel"];
const RG={eltern:["mutter","vater"],geschwister:["schwester","bruder"],gross:["oma","opa"],kinder:["tochter","sohn"],enkel:["enkelin","enkel"],
 freunde:["freundin","freund"],partner:["partnerin","partner"],
 kollegial:["mitschuelerin","mitschueler","kommilitonin","kommilitone","kollegin","kollege"],arbeit:["kollegin","kollege"]};
const _pool=(...g)=>g.flatMap(x=>RG[x]||[x]);

/* ---------- Lebensphase: Orte, Gruppen, Menschen ----------
   _ ist der Rückfall und gibt den Wortlaut der Originaltexte wieder. „anderes“ fällt auf _ zurück, wo nichts steht. */
const KONTEXTE={
 _:{gruppe:"Klasse",inGruppe:"in deiner Klasse",chat:"Klassenchat",pause:"Pause",ort:"Arbeit",nachDem:"nach der Schule",
    leitung:"Lehrkraft",leitungDat:"der Lehrkraft",chefin:"deine Chefin",chefinDat:"der Chefin",einspringen:"einzuspringen",
    einMitglied:"ein Mitschüler",eineKollegin:"eine Kollegin",einerKollegin:"einer Kollegin",einladen:"etwa in meine Gruppe",
    pruefungSatz:"hast du eine wichtige Prüfung",lerneDanach:"lerne danach",deinerPruefung:"deiner Prüfung",
    inBesprechung:"im Unterricht oder in einer Besprechung",clique:"deine Clique",geld:"Dein Geld vom Nebenjob ist knapp.",imUmfeld:"an der Schule"},
 schule:{gruppe:"Klasse",inGruppe:"in deiner Klasse",chat:"Klassenchat",pause:"Pause",ort:"Schule",nachDem:"nach der Schule",
    leitung:"Lehrkraft",leitungDat:"der Lehrkraft",chefin:"deine Lehrerin",chefinDat:"der Lehrerin",einspringen:"bei einer Schulveranstaltung einzuspringen",
    einMitglied:"ein Mitschüler",eineKollegin:"eine Mitschülerin",einerKollegin:"einer Mitschülerin",einladen:"etwa in meine Gruppe",
    pruefungSatz:"schreibst du eine wichtige Klassenarbeit",lerneDanach:"lerne danach",deinerPruefung:"deiner Klassenarbeit",
    inBesprechung:"im Unterricht",clique:"deine Clique",geld:"Dein Taschengeld ist knapp.",imUmfeld:"an der Schule"},
 ausbildung:{gruppe:"Berufsschulklasse",inGruppe:"in deiner Berufsschulklasse",chat:"Gruppenchat der Azubis",pause:"Mittagspause",ort:"Betrieb",nachDem:"nach Feierabend",
    leitung:"Ausbilderin",leitungDat:"der Ausbilderin",chefin:"deine Ausbilderin",chefinDat:"der Ausbilderin",
    einMitglied:"ein anderer Azubi",eineKollegin:"eine andere Auszubildende",einerKollegin:"einer anderen Auszubildenden",einladen:"etwa in meine Lerngruppe",
    pruefungSatz:"hast du eine wichtige Prüfung in der Berufsschule",lerneDanach:"lerne danach",deinerPruefung:"deiner Prüfung",
    inBesprechung:"in der Berufsschule",clique:"dein Freundeskreis",geld:"Deine Ausbildungsvergütung ist knapp.",imUmfeld:"im Viertel"},
 studium:{gruppe:"Seminar",inGruppe:"in deinem Studiengang",chat:"Semesterchat",pause:"Pause zwischen den Veranstaltungen",ort:"Hochschule",nachDem:"nach den Veranstaltungen",
    leitung:"Dozentin",leitungDat:"der Dozentin",chefin:"deine Chefin beim Nebenjob",chefinDat:"der Chefin",
    einMitglied:"ein Kommilitone",eineKollegin:"eine Kommilitonin",einerKollegin:"einer Kommilitonin",einladen:"etwa in meine Lerngruppe",
    pruefungSatz:"hast du eine wichtige Prüfung",lerneDanach:"lerne danach",deinerPruefung:"deiner Prüfung",
    inBesprechung:"im Seminar",clique:"dein Freundeskreis",geld:"Dein Geld im Studium ist knapp.",imUmfeld:"im Viertel"},
 beruf:{gruppe:"Team",inGruppe:"in deinem Team",chat:"Teamchat",pause:"Mittagspause",ort:"Arbeit",nachDem:"nach Feierabend",
    leitung:"Chefin",leitungDat:"der Chefin",chefin:"deine Chefin",chefinDat:"der Chefin",
    einMitglied:"ein Kollege",eineKollegin:"eine Kollegin",einerKollegin:"einer Kollegin",einladen:"etwa zum Mittagessen",
    pruefungSatz:"musst du bei der Arbeit eine wichtige Präsentation halten",lerneDanach:"bereite mich danach vor",deinerPruefung:"deiner Präsentation",
    inBesprechung:"in einer Besprechung",clique:"dein Freundeskreis",geld:"Am Ende des Monats ist dein Geld knapp.",imUmfeld:"im Viertel"},
 /* Erbt alles Übrige von „beruf“ */
 schicht:{nachDem:"nach der Schicht",pause:"Pause",einspringen:"eine zusätzliche Schicht zu übernehmen",einladen:"etwa in der Pause an meinen Tisch",
    pruefungSatz:"hast du eine wichtige Prüfung in einer Fortbildung",lerneDanach:"lerne danach",deinerPruefung:"deiner Prüfung",
    inBesprechung:"in einer Teambesprechung"},
 anderes:{clique:"dein Freundeskreis",geld:"Dein Geld ist gerade knapp.",imUmfeld:"im Viertel",chat:"Gruppenchat",pause:"Pause"},
 /* Erbt alles Übrige von „anderes“, dann vom Original */
 ruhestand:{gruppe:"Verein",inGruppe:"in deinem Verein",ort:"Verein",nachDem:"am Nachmittag",
    chefin:"die Leiterin deines Vereins",chefinDat:"der Leiterin",einspringen:"auszuhelfen",
    leitung:"Kursleitung",leitungDat:"der Kursleitung",
    einMitglied:"ein Mitglied",eineKollegin:"eine Mitstreiterin",einerKollegin:"einer Mitstreiterin",einladen:"etwa zum Kaffee",
    pruefungSatz:"hast du einen wichtigen Termin, für den du noch viel vorbereiten musst",lerneDanach:"bereite mich danach vor",deinerPruefung:"deinem Termin",
    inBesprechung:"in einer Versammlung",geld:"Deine Rente ist knapp."}
};

/* ---------- Gemeinschaft: zuerst eine gewählte Gruppe, sonst die Lebensphase, sonst _ (Original) ---------- */
const GEMEINSCHAFT={
 _:{tAus:"aus der Mannschaft",mitglied:"ein Spieler aus deiner Mannschaft",ausUns:"aus dem Team",leitung:"dem Trainer",traeger:"der Verein",traegerEin:"ein Verein",
    brauchtDich:"Eine Initiative, für die du dich engagierst, braucht dich aber gerade jetzt für eine wichtige Aktion.",wichtig:"Es geht um etwas Wichtiges."},
 sport:{tAus:"aus der Mannschaft",mitglied:"ein Spieler aus deiner Mannschaft",ausUns:"aus dem Team",leitung:"dem Trainer",traeger:"der Verein",traegerEin:"ein Verein",
    brauchtDich:"Deine Mannschaft braucht dich aber gerade jetzt für ein wichtiges Spiel.",wichtig:"Die anderen zählen auf mich."},
 musik:{tAus:"aus der Musikgruppe",mitglied:"jemand aus deiner Musikgruppe",ausUns:"aus der Musikgruppe",leitung:"der Leiterin",traeger:"sie",traegerEin:"eine Leitung",
    brauchtDich:"Deine Musikgruppe braucht dich aber gerade jetzt für einen wichtigen Auftritt.",wichtig:"Die anderen zählen auf mich."},
 ehrenamt:{tAus:"aus der Initiative",mitglied:"jemand aus deiner Initiative",ausUns:"aus der Initiative",leitung:"den Verantwortlichen",traeger:"die Initiative",traegerEin:"eine Initiative",
    brauchtDich:"Deine Initiative braucht dich aber gerade jetzt für eine wichtige Aktion.",wichtig:"Es geht um etwas Wichtiges."},
 jugend:{tAus:"aus der Jugendgruppe",mitglied:"jemand aus deiner Jugendgruppe",ausUns:"aus der Jugendgruppe",leitung:"der Gruppenleiterin",traeger:"sie",traegerEin:"eine Gruppenleitung",
    brauchtDich:"Deine Jugendgruppe braucht dich aber gerade jetzt für eine wichtige Aktion.",wichtig:"Es geht um etwas Wichtiges."},
 gemeinde:{tAus:"aus der Gemeinde",mitglied:"jemand aus deiner Gemeinde",ausUns:"aus der Gemeinde",leitung:"den Verantwortlichen",traeger:"die Gemeinde",traegerEin:"eine Gemeinde",
    brauchtDich:"Deine Gemeinde braucht dich aber gerade jetzt für eine wichtige Aktion.",wichtig:"Es geht um etwas Wichtiges."},
 schule:{tAus:"aus der Klasse",mitglied:"ein Mitschüler aus deiner Klasse",ausUns:"aus der Klasse",leitung:"der Klassenlehrerin",traeger:"die Schule",traegerEin:"eine Schule",
    brauchtDich:"Deine Klasse braucht dich aber gerade jetzt, um das Schulfest vorzubereiten.",wichtig:"Die anderen zählen auf mich."},
 ausbildung:{tAus:"aus dem Betrieb",mitglied:"ein anderer Azubi aus deinem Betrieb",ausUns:"aus dem Betrieb",leitung:"der Ausbilderin",traeger:"der Betrieb",traegerEin:"ein Betrieb",
    brauchtDich:"Dein Team im Betrieb braucht dich aber gerade jetzt für einen wichtigen Auftrag.",wichtig:"Die anderen zählen auf mich."},
 studium:{tAus:"aus dem Studiengang",mitglied:"ein Kommilitone aus deinem Studiengang",ausUns:"aus dem Studiengang",leitung:"der Studiengangsleitung",traeger:"die Hochschule",traegerEin:"eine Hochschule",
    brauchtDich:"Deine Lerngruppe braucht dich aber gerade jetzt für ein wichtiges Referat.",wichtig:"Die anderen zählen auf mich."},
 beruf:{tAus:"aus dem Team",mitglied:"ein Kollege",ausUns:"aus dem Team",leitung:"der Chefin",traeger:"die Firma",traegerEin:"eine Firma",
    brauchtDich:"Dein Team braucht dich aber gerade jetzt für ein wichtiges Projekt.",wichtig:"Die anderen zählen auf mich."},
 /* „schicht“ erbt von „beruf“ */
 schicht:{brauchtDich:"Dein Team braucht dich aber gerade jetzt, weil mehrere Schichten nicht besetzt sind."},
 ruhestand:{tAus:"aus dem Verein",mitglied:"ein Mitglied aus deinem Verein",ausUns:"aus dem Verein",leitung:"dem Vorstand",traeger:"der Verein",traegerEin:"ein Verein",
    brauchtDich:"Dein Verein braucht dich aber gerade jetzt für eine wichtige Aktion.",wichtig:"Die anderen zählen auf mich."}
};

/* ---------- Varianten ----------
   Schlüssel: p:<Probe>, u:<Übung>, b:<Wert> (Beispiel b). rollen: Slots mit Pool und Rückfall (Reihenfolge zählt,
   eine Person wird pro Text nur einmal vergeben). felder: personalisierte Fassungen; o ist nach Index ausgerichtet,
   null = unverändert. Die Werte w der Optionen kommen immer aus dem Original.
   neutral:true heißt: Auch ohne Check weicht der Text bewusst vom Original ab (Familienrolle → neutral). */
const VARIANTEN={
 /* ----- Rollen: nahe Menschen ----- */
 "p:beleidigung":{neutral:true,
  rollen:{nah:{pool:_pool("geschwister","eltern","gross","kinder","enkel","freunde","partner","kollegial","mensch"),rueckfall:"mensch"}},
  felder:{x:"Jemand beleidigt {nah.deinen} vor deinen Augen grob. Du spürst, wie der Zorn in dir hochkocht.",
   o:[null,"Ich lasse meinem Zorn freien Lauf und beleidige den Angreifer zurück. Alle sollen sehen, auf wessen Seite ich stehe.","Ich gehe mit {nah.meinem} weg und kümmere mich um {nah.ihn}."]}},
 "p:geschenk":{neutral:true,
  rollen:{v:{pool:_pool("gross","eltern","geschwister","freunde","partner"),rueckfall:"mensch"}},
  felder:{x:"{V.dein} hat dir einen Pullover gestrickt, der überhaupt nicht dein Geschmack ist. {V.er} fragt erwartungsvoll, ob dir der Pullover gefällt.",
   f:"Was will {v.er} eigentlich wissen, wenn {v.er} fragt?"}},
 "p:zelten":{neutral:true,
  rollen:{fam:{pool:_pool("eltern","geschwister","gross","kinder","enkel","partner"),rueckfall:"mensch"},fr:{pool:_pool("freunde"),rueckfall:"freund"}},
  felder:{x:"Du hast mit {fam.deinem} ein Wochenende zum Zelten an einem See geplant, ohne Handyempfang. {Fam.er} freut sich riesig darauf. Am selben Samstag feiert {fr.dein} Geburtstag.",
   o:["Ich fahre mit. Draußen am See bin ich gern, und {fam.mein} freut sich.","Ich gehe zur Party. Ich habe {fr.meinem} schon lange zugesagt.",null],
   h:"Hier ziehen zwei Arten von Nähe gegeneinander. Eine gehaltene Zusage sagt etwas über dich. Ein Wochenende draußen mit {fam.deinem2} lässt sich später schwer nachholen. Ein Kompromiss ist oft gut, solange er nicht beide Seiten nur halb bedient."}},
 "p:vater":{neutral:true,
  /* Bewusst keine Rolle aus dem Check: Hier geht es um einen Menschen, der verletzt hat. */
  felder:{x:"Jemand aus deiner Familie hat dich früher oft verletzt. Ihr hattet lange keinen Kontakt. Jetzt meldet er sich und möchte dich treffen."}},
 "p:geschaeftsidee":{
  rollen:{v:{pool:_pool("freunde","geschwister","partner","eltern","arbeit"),rueckfall:"gute_freundin"}},
  felder:{x:"{V.dein} will {v.seinen} sicheren Job kündigen, um ein Café zu eröffnen. {V.er} fragt dich begeistert nach deiner Meinung. Du hältst den Plan für schlecht durchdacht.",
   o:[null,"Ich ermutige {v.ihn}. Es ist {v.sein} Leben, und Begeisterung braucht Rückenwind.","Ich stelle Fragen, damit {v.er} selbst die Schwachstellen findet."]}},
 "p:betrug":{
  rollen:{v:{pool:_pool("freunde","geschwister"),rueckfall:"enger_freund"}},
  felder:{x:"{V.dein} erzählt dir, dass {v.er} {v.g:seine Partnerin|ihren Partner} betrügt. Du kennst {v.g:sie|ihn} gut und magst {v.g:sie|ihn}. {V.er} bittet dich, es für dich zu behalten.",
   o:["Ich behalte es für mich, sage {v.ihm} aber deutlich, was ich davon halte.","Ich sage {v.ihm}, dass {v.er} es {v.g:ihr|ihm} selbst sagen muss, sonst tue ich es.",null],
   h:"Loyalität {v.zum} und Wahrhaftigkeit gegenüber {v.g:der Partnerin|dem Partner} lassen sich hier kaum vollständig vereinen. Wichtig ist, dass du die Last nicht still trägst, ohne deine Haltung zu zeigen."}},
 "p:wochenende":{
  rollen:{fr:{pool:_pool("freunde","geschwister","eltern","gross"),rueckfall:"ein_freund"}},
  felder:{x:"{K.chefin} bittet dich zum dritten Mal in Folge, am Wochenende {k.einspringen}. Du hast {fr.deinem} versprochen, {fr.ihm} beim Renovieren zu helfen.",
   o:["Ich sage {k.chefinDat} ab und halte mein Versprechen.",null,null]}},
 "p:verschwoerung":{
  rollen:{v:{pool:_pool("freunde","geschwister","eltern","gross"),rueckfall:"alter_freund"}},
  felder:{t:"Im Kaninchenbau",x:"{V.dein} teilt immer öfter Verschwörungsbeiträge. Wenn du widersprichst, wird {v.er} wütend. {v.ist:freund,freundin,alter_freund?Ihr kennt euch seit der Grundschule.|Eigentlich steht ihr euch sehr nah.}",
   f:"Was braucht {v.dein2} vielleicht, das {v.er} in diesen Beiträgen sucht?"}},
 "p:kommentare":{
  rollen:{v:{pool:_pool("freunde","geschwister","eltern","gross","partner","kollegial"),rueckfall:"ein_freund"}},
  felder:{x:"Unter einer Meldung über ein schweres Verbrechen an einem Kind fordern viele, man solle den Täter „wie ein Tier behandeln“. {V.dein} schickt dir einen dieser Kommentare und schreibt dazu: „Genau so.“",
   o:[null,null,"Ich antworte nicht im Chat, sondern frage {v.ihn} {v.ist:freund,freundin,ein_freund?beim nächsten Treffen|später in Ruhe}, was {v.ihn} an dem Fall so mitnimmt."]}},
 "p:screenshot":{
  rollen:{v:{pool:_pool("freunde","geschwister","partner"),rueckfall:"freundin"}},
  felder:{x:"{V.dein} hat einen privaten Chat von dir als Screenshot an andere weitergeschickt. Es war dir sehr peinlich. Jetzt entschuldigt {v.er} sich und sagt, {v.er} habe nicht nachgedacht.",
   o:["Ich nehme die Entschuldigung an. Ein Fehler macht {v.ihn} nicht zu einem schlechten Menschen.","Ich nehme die Entschuldigung an, aber Persönliches erzähle ich {v.ihm} vorerst nicht mehr.","Ich sage {v.ihm}, dass ich erst einmal Abstand brauche, und erkläre, was das mit mir gemacht hat."],
   f:"Was müsste passieren, damit du {v.ihm} wieder ganz vertraust?"}},
 "p:familienessen":{
  /* Nur wenn jemand nahe Menschen gewählt hat, aber niemanden aus der Familie. Ohne Check gilt das Original. */
  wenn:pr=>pr.nah.length>0&&!pr.nah.some(r=>FAMILIE.includes(r)),
  felder:{t:"Am großen Tisch",x:"Bei einem großen Essen mit Freunden macht der Vater eines Freundes eine abfällige Bemerkung über Geflüchtete. Die anderen schweigen betreten. Du weißt, dass er dich mag und auf dich hört."}},

 /* ----- Lebensphase ----- */
 "p:kitext":{
  felder:{x:{ausbildung:"Ein anderer Azubi hat sein Berichtsheft für mehrere Wochen komplett von einer KI schreiben lassen und gibt es als eigene Arbeit ab. Er weiß, dass du es mitbekommen hast, und bittet dich, nichts zu sagen.",
    studium:"Ein Kommilitone hat seine Hausarbeit komplett von einer KI schreiben lassen und gibt sie als eigene ab. Er weiß, dass du es mitbekommen hast, und bittet dich, nichts zu sagen.",
    beruf:"Ein Kollege lässt einen wichtigen Bericht komplett von einer KI schreiben und gibt ihn als eigene Arbeit aus, obwohl das bei euch nicht erlaubt ist. Er weiß, dass du es mitbekommen hast, und bittet dich, nichts zu sagen.",
    ruhestand:"Ein Bekannter aus deinem Kurs an der Volkshochschule hat seine Abschlussarbeit komplett von einer KI schreiben lassen und gibt sie als eigene ab. Er weiß, dass du es mitbekommen hast, und bittet dich, nichts zu sagen."},
   o:[null,null,"Ich sage {k.leitungDat} Bescheid, weil es den anderen gegenüber unfair ist."]}},
 "p:fehler":{
  felder:{x:{schule:"Beim Verkauf auf dem Schulfest hast du dich verrechnet, und ein Kunde hat zu viel bezahlt. Niemand hat es bemerkt, und es würde vermutlich nie auffallen.",
    studium:"Bei deinem Nebenjob ist dir ein Fehler passiert, der einen Kunden etwas Geld kostet. Niemand hat es bemerkt, und es würde vermutlich nie auffallen.",
    ausbildung:"Im Betrieb ist dir ein Fehler passiert, der einen Kunden etwas Geld kostet. Niemand hat es bemerkt, und es würde vermutlich nie auffallen.",
    ruhestand:"Beim Kuchenverkauf auf einem Fest hast du dich verrechnet, und eine Kundin hat zu viel bezahlt. Niemand hat es bemerkt, und es würde vermutlich nie auffallen."}}},
 "p:umzug":{
  felder:{x:"Ein älterer Nachbar, der allein lebt, fragt, ob du ihm am Samstag beim Umzug in eine kleinere Wohnung hilfst. Am Montag {k.pruefungSatz}.",
   o:["Ich helfe ein paar Stunden und {k.lerneDanach}.",null,null],
   f:"Was würde dein Nachbar sagen, wenn er von {k.deinerPruefung} wüsste?"}},
 "p:ausschluss":{
  felder:{x:"{K.inGruppe} wird {k.einMitglied} seit Wochen ausgeschlossen und belächelt. Der Anführer ist ein guter Freund von dir.",
   o:["Ich lade den Ausgeschlossenen bewusst ein, {k.einladen}.",null,null]}},
 "p:lob":{
  felder:{x:"Du wirst vor allen für eine Idee gelobt. Ein wichtiger Teil davon stammt aber von {k.einerKollegin}, die gerade nicht da ist."}},
 "p:spottvideo":{
  felder:{x:{ausbildung:"Ein früherer Mitschüler hat dich in der Schule zwei Jahre lang gemobbt. Jetzt geht ein Video herum, in dem er selbst ausgelacht wird. Im Chat eurer alten Klasse feiern es alle, und jemand schreibt: „Endlich trifft es mal den Richtigen.“",
    studium:"Ein früherer Mitschüler hat dich in der Schule zwei Jahre lang gemobbt. Jetzt geht ein Video herum, in dem er selbst ausgelacht wird. Im Chat eurer alten Klasse feiern es alle, und jemand schreibt: „Endlich trifft es mal den Richtigen.“",
    beruf:"Ein früherer Mitschüler hat dich in der Schule zwei Jahre lang gemobbt. Jetzt geht ein Video herum, in dem er selbst ausgelacht wird. Im Chat eurer alten Klasse feiern es alle, und jemand schreibt: „Endlich trifft es mal den Richtigen.“",
    anderes:"Ein früherer Mitschüler hat dich in der Schule zwei Jahre lang gemobbt. Jetzt geht ein Video herum, in dem er selbst ausgelacht wird. Im Chat eurer alten Klasse feiern es alle, und jemand schreibt: „Endlich trifft es mal den Richtigen.“"}}},
 "p:gedenkselfie":{
  felder:{x:{ausbildung:"Deine Berufsschulklasse besucht eine KZ-Gedenkstätte. Ein anderer Azubi macht vor dem Lagertor grinsend Selfies und will sie in seine Story stellen. Ein paar lachen.",
    studium:"Dein Seminar besucht eine KZ-Gedenkstätte. Ein Kommilitone macht vor dem Lagertor grinsend Selfies und will sie in seine Story stellen. Ein paar lachen.",
    beruf:"Du besuchst mit einer Reisegruppe eine KZ-Gedenkstätte. Ein junger Mann aus der Gruppe macht vor dem Lagertor grinsend Selfies und will sie in seine Story stellen. Ein paar lachen.",
    anderes:"Du besuchst mit einer Reisegruppe eine KZ-Gedenkstätte. Ein junger Mann aus der Gruppe macht vor dem Lagertor grinsend Selfies und will sie in seine Story stellen. Ein paar lachen."}}},
 "p:schulwald":{
  felder:{t:{ausbildung:"Das Wäldchen",studium:"Das Wäldchen",beruf:"Das Wäldchen",anderes:"Das Wäldchen"},
   x:{ausbildung:"Das kleine Wäldchen neben deinem Betrieb soll für einen neuen Sportplatz gerodet werden. Viele freuen sich auf den Platz. Du bist oft in dem Wäldchen, in der Mittagspause und nach Feierabend.",
    studium:"Das kleine Wäldchen neben deiner Hochschule soll für einen neuen Sportplatz gerodet werden. Viele freuen sich auf den Platz. Du bist oft in dem Wäldchen, zwischen den Veranstaltungen und danach.",
    beruf:"Das kleine Wäldchen neben deiner Arbeitsstelle soll für einen neuen Sportplatz gerodet werden. Viele freuen sich auf den Platz. Du bist oft in dem Wäldchen, in der Mittagspause und nach Feierabend.",
    schicht:"Das kleine Wäldchen neben deiner Arbeitsstelle soll für einen neuen Sportplatz gerodet werden. Viele freuen sich auf den Platz. Du bist oft in dem Wäldchen, in den Pausen und nach der Schicht.",
    anderes:"Das kleine Wäldchen in deinem Viertel soll für einen neuen Sportplatz gerodet werden. Viele freuen sich auf den Platz. Du gehst oft in dem Wäldchen spazieren."},
   o:[null,"Ich bin für den Platz. Viele {k.imUmfeld} haben keinen Verein und brauchen einen Ort zum Spielen.",null]}},
 "p:billigshirt":{
  felder:{x:"Ein Shop auf Social Media verkauft Kleidung extrem billig. Du hast gelesen, unter welchen Bedingungen solche Kleidung oft genäht wird. Deine Freundinnen bestellen gemeinsam und fragen, ob du mitmachst. {k.geld}"}},

 /* ----- Gruppe (ersatzweise Lebensphase) ----- */
 "p:vereinspost":{
  felder:{t:"Der Post {gm.tAus}",
   x:"{GM.mitglied} postet ein Bild mit einem abfälligen Spruch über Geflüchtete. Ein paar {gm.ausUns} haben Screenshots gemacht und wollen ihn in einer großen Gruppe vorführen. Sie fragen, ob du dabei bist.",
   o:[null,null,"Ich sage {gm.leitung} Bescheid und verlasse mich darauf, dass {gm.traeger} das klärt."],
   h:"Alle drei Wege lehnen den Post ab. Sie unterscheiden sich darin, was danach mit dem Menschen geschieht. Bloßstellen kann wirken, treibt Menschen aber oft tiefer in ihre Ecke. Ein direktes Gespräch ist mühsamer, und {gm.traegerEin} kann nur handeln, wenn jemand Bescheid sagt."}},
 "p:erschoepft":{
  felder:{x:"Du bist erschöpft und brauchst dringend Ruhe. {gm.brauchtDich}",
   o:[null,"Ich mache mit. {gm.wichtig}",null]}},

 /* ----- Übungen -----
    Übungen werden nicht nach Index angepasst, sondern über ersetze: [{alt, neu, in?}]. alt ist ein wörtliches Stück
    aus ueben.js, neu ein Text (mit Platzhaltern) oder ein Objekt nach Lebensphase. in schränkt auf ein Feld ein
    (t, x, s oder p). Fehlt alt im Original (weil ueben.js umformuliert wurde), bleibt der Text einfach unverändert;
    der Test in scratchpad/uebtest meldet das. Rollen-Slots ohne Rückfall (rueckfall:null) erwähnen nahe Menschen
    nur, wenn sie im Profil stehen; ohne Profil bleibt jede Übung wörtlich wie im Original. */
 "u:begegnung":{
  ersetze:[{in:"s",alt:"Sprachcafé, Gemeinde, Ehrenamt oder Arbeit",
   neu:{schule:"Sprachcafé, Gemeinde, Ehrenamt oder Schule",ausbildung:"Sprachcafé, Gemeinde, Ehrenamt, Berufsschule oder Betrieb",
    studium:"Sprachcafé, Gemeinde, Ehrenamt oder Hochschule",anderes:"Sprachcafé, Gemeinde oder Ehrenamt"}}]},
 "u:wenndann":{
  ersetze:[{in:"x",alt:"Wenn im Chat über jemanden gelästert wird",
   neu:{schule:"Wenn im Klassenchat über jemanden gelästert wird",ausbildung:"Wenn im Gruppenchat der Azubis über jemanden gelästert wird",
    studium:"Wenn im Semesterchat über jemanden gelästert wird",beruf:"Wenn im Teamchat über jemanden gelästert wird",
    ruhestand:"Wenn im Familienchat über jemanden gelästert wird"}}]},
 "u:neinsagen":{
  rollen:{v:{pool:_pool("kollegial","eltern","geschwister","gross","kinder","enkel","freunde","partner"),rueckfall:null}},
  ersetze:[
   {in:"x",alt:"Wo ein Nein kaum möglich ist, etwa weil bei der Arbeit Leute fehlen, liegt das nicht an dir. Das gehört dann in ein Gespräch mit der Leitung.",
    neu:{schule:"Wo ein Nein kaum möglich ist, etwa bei Pflichten in der Schule, liegt das nicht an dir. Wird es dir zu viel, sprich mit deiner Klassenleitung oder einem anderen Erwachsenen, dem du vertraust.",
     ausbildung:"Wo ein Nein kaum möglich ist, etwa weil im Betrieb Leute fehlen, liegt das nicht an dir. Das gehört dann in ein Gespräch mit deiner Ausbilderin oder deinem Ausbilder.",
     studium:"Wo ein Nein kaum möglich ist, etwa weil beim Nebenjob Leute fehlen, liegt das nicht an dir. Das gehört dann in ein Gespräch mit der Leitung.",
     schicht:"Wo ein Nein kaum möglich ist, etwa weil im Dienstplan Leute fehlen, liegt das nicht an dir. Das gehört dann in ein Gespräch mit der Leitung.",
     anderes:"Wo ein Nein kaum möglich ist, etwa weil sonst alles an dir hängen bleibt, liegt das nicht an dir. Das gehört dann in ein offenes Gespräch mit den anderen.",
     ruhestand:"Wo ein Nein kaum möglich ist, etwa weil in der Familie oder im Ehrenamt sonst alles an dir hängen bleibt, liegt das nicht an dir. Das gehört dann in ein offenes Gespräch mit den anderen."}},
   {in:"s",alt:"Achte auf Momente, in denen du automatisch Ja sagst",neu:"Achte auf Momente, in denen du automatisch Ja sagst, etwa gegenüber {v.deinem}"},
   {in:"s",alt:"Gegenüber Erwachsenen oder Vorgesetzten hilft eine Alternative",
    neu:{schule:"Gegenüber Erwachsenen, etwa Lehrkräften, hilft eine Alternative",ausbildung:"Gegenüber Vorgesetzten im Betrieb hilft eine Alternative",
     beruf:"Gegenüber Vorgesetzten hilft eine Alternative",anderes:"Gegenüber Menschen, die viel von dir erwarten, hilft eine Alternative"}}]},
 "u:zuhoeren":{
  rollen:{v:{pool:_pool("eltern","geschwister","gross","kinder","enkel","freunde","partner","kollegial"),rueckfall:null}},
  ersetze:[{in:"s",alt:"Wähle eine Person, gern auch jeden Tag eine andere",neu:"Wähle eine Person, etwa {v.deinen}, gern auch jeden Tag eine andere"}]},
 "u:ehrlichesfeedback":{
  rollen:{v:{pool:_pool("eltern","geschwister","gross","kinder","enkel","freunde","partner","kollegial"),rueckfall:null}},
  ersetze:[{in:"x",alt:"Gib einem Menschen, der dir wichtig ist, einen",neu:"Gib einem Menschen, der dir wichtig ist, etwa {v.deinem}, einen"}]},
 "u:widerspruch":{
  rollen:{v:{pool:_pool("eltern","geschwister","gross","kinder","enkel","freunde","partner","kollegial"),rueckfall:null}},
  ersetze:[{in:"x",alt:"wann du bei Menschen, die dir nahe sind, nur aus Höflichkeit nickst",neu:"wann du bei Menschen, die dir nahe sind, etwa bei {v.deinem}, nur aus Höflichkeit nickst"}]},
 "u:zivilplan":{
  ersetze:[{in:"s",alt:"Bus, Schulhof, Bahnhof, Supermarkt",
   neu:{ausbildung:"Bus, Berufsschule, Bahnhof, Supermarkt",studium:"Bus, Mensa, Bahnhof, Supermarkt",beruf:"Bus, Arbeitsweg, Bahnhof, Supermarkt",
    schicht:"Bus, Parkplatz nach der Spätschicht, Bahnhof, Supermarkt",anderes:"Bus, Bahnhof, Supermarkt, Park",ruhestand:"Bus, Wochenmarkt, Bahnhof, Supermarkt"}}]},
 "u:fussabdruck":{
  ersetze:[
   {in:"x",alt:"etwa der Weg zur Arbeit oder die Heizung in der Mietwohnung",
    neu:{schule:"etwa der Schulweg oder die Heizung zu Hause",ausbildung:"etwa der Weg zum Betrieb oder die Heizung in der Mietwohnung",
     studium:"etwa der Weg zur Hochschule oder die Heizung in der Mietwohnung",schicht:"etwa der Weg zur Schicht, wenn um diese Zeit kein Bus fährt, oder die Heizung in der Mietwohnung",
     anderes:"etwa ein weiter Weg oder die Heizung in der Mietwohnung",ruhestand:"etwa ein weiter Weg zum Einkaufen oder die Heizung in der Mietwohnung"}},
   {in:"s",alt:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Schule, Verein oder Betrieb",
    neu:{schule:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Klasse oder Verein",ausbildung:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Verein oder Betrieb",
     studium:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Verein oder Hochschule",beruf:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Verein oder Betrieb",
     schicht:"eine Fahrgemeinschaft mit Leuten aus deiner Schicht oder ein Vorschlag in Familie, Verein oder Betrieb",ruhestand:"eine Fahrgemeinschaft oder ein Vorschlag in Familie, Verein oder Gemeinde"}}]},
 "u:brief2060":{
  /* Enkel haben Vorrang: Sie sind 2060 eher erwachsen als die Kinder schon erwachsener Eltern. */
  rollen:{v:{pool:_pool("kinder","enkel"),vorrang:RG.enkel,rueckfall:null}},
  ersetze:[{in:"x",alt:"einen Brief: einem Kind aus deiner Familie,",neu:"einen Brief: {v.deinem},"}]},
 "u:grenzechat":{
  ersetze:[{in:"x",alt:"In Gruppenchats wird oft über andere gelästert",
   neu:{schule:"In Gruppenchats wie dem Klassenchat wird oft über andere gelästert",ausbildung:"In Gruppenchats wie dem Azubi-Chat wird oft über andere gelästert",
    studium:"In Gruppenchats wie dem Semesterchat wird oft über andere gelästert",beruf:"In Gruppenchats wie dem Teamchat wird oft über andere gelästert",
    ruhestand:"In Gruppenchats, auch in der Familie oder im Verein, wird oft über andere gelästert"}}]},
 "u:verstehen":{
  ersetze:[{in:"s",alt:"Familie, Klasse, Verein, Arbeit oder Nachbarschaft",
   neu:{schule:"Familie, Klasse, Verein oder Nachbarschaft",ausbildung:"Familie, Betrieb, Berufsschule, Verein oder Nachbarschaft",
    studium:"Familie, Hochschule, Nebenjob, Verein oder Nachbarschaft",beruf:"Familie, Arbeit, Verein oder Nachbarschaft",
    anderes:"Familie, Verein, Freundeskreis oder Nachbarschaft",ruhestand:"Familie, Verein, Gemeinde oder Nachbarschaft"}}]},
 "u:kleinegeste":{
  rollen:{v:{pool:_pool("eltern","geschwister","gross","kinder","enkel","freunde","partner","kollegial"),rueckfall:null}},
  ersetze:[{in:"s",alt:"die gerade still geworden sind oder viel zu tragen haben",neu:"die gerade still geworden sind oder viel zu tragen haben. Vielleicht gehört {v.dein} dazu."}]},
 "u:anpacken":{
  ersetze:[{in:"x",alt:"eine Sammelaktion in der Schule",
   neu:{ausbildung:"eine Sammelaktion im Betrieb",studium:"eine Sammelaktion an der Hochschule",beruf:"eine Sammelaktion bei der Arbeit",
    anderes:"eine Sammelaktion in der Nachbarschaft",ruhestand:"eine Sammelaktion in der Gemeinde"}}]},

 /* ----- Wertebeispiele (b) ----- */
 "b:mut":{felder:{b:"Du stellst {k.inBesprechung} eine unbequeme Frage."}},
 "b:freiheit":{felder:{b:"Du wählst einen Weg, der zu dir passt, auch wenn {k.clique} anders denkt."}},
 "b:loyalitaet":{
  rollen:{v:{pool:_pool("freunde","geschwister","partner","kollegial"),rueckfall:"eine_freundin"}},
  felder:{b:"Du verteidigst {v.deinen}, {v.g:der|die} nicht im Raum ist."}},
 "b:offenheit":{
  rollen:{v:{pool:_pool("freunde","geschwister","partner","eltern"),rueckfall:"ein_freund"}},
  felder:{b:"Du sagst {v.deinem}, dass dich {v.sein} Kommentar getroffen hat."}}
};

/* ---------- Auflösen ---------- */
function _hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
/* Profil prüfen: Unbekanntes fällt weg. Aus fehlenden Angaben wird nie etwas geschlossen. */
function normProfil(p){p=p&&typeof p==="object"?p:{};
 const ok=id=>ROLLEN[id]&&!ROLLEN[id].intern,grp=Object.keys(GEMEINSCHAFT).filter(k=>!PHASEN.includes(k)&&k!=="_");
 return {phase:PHASEN.includes(p.phase)?p.phase:null,
  nah:Array.isArray(p.nah)?p.nah.filter(ok):[],gruppe:Array.isArray(p.gruppe)?p.gruppe.filter(g=>grp.includes(g)):[]}}
/* Stabile Wahl: Jede passende Person bekommt pro Schlüssel und Slot eine feste Punktzahl, die höchste gewinnt.
   Kommt später eine Person dazu, ändert sich die Wahl nur, wenn genau sie gewinnt. */
function _waehle(kand,key,slot){let best=null,bs=-1;kand.forEach(c=>{const s=_hash(key+"|"+slot+"|"+c);if(s>bs){bs=s;best=c}});return best}
/* vorrang: Stehen Personen daraus im Profil, wird nur unter ihnen gewählt. rueckfall:null = niemand (Originaltext). */
function rollenWahl(schluessel,profil){const pr=normProfil(profil),v=VARIANTEN[schluessel]||{},res={},used=[];
 Object.keys(v.rollen||{}).forEach(slot=>{const d=v.rollen[slot];let kand=d.pool.filter(r=>pr.nah.includes(r)&&!used.includes(r));
  if(d.vorrang&&kand.some(r=>d.vorrang.includes(r)))kand=kand.filter(r=>d.vorrang.includes(r));
  const r=kand.length?_waehle(kand,schluessel,slot):(d.rueckfall==null?null:d.rueckfall);if(r)used.push(r);res[slot]=r});return res}
function _gemeinschaft(pr,key){if(pr.gruppe.length)return GEMEINSCHAFT[_waehle(pr.gruppe,key,"gm")];
 return Object.assign({},GEMEINSCHAFT._,..._kette(pr.phase).reverse().map(k=>GEMEINSCHAFT[k]||{}))}
const _gross=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;

/* personalisiere(text, profil, schluessel): löst Platzhalter auf. text ist ein Text oder ein Objekt nach Lebensphase.
   Gibt null zurück, wenn es für diese Lebensphase keine eigene Fassung gibt; dann gilt der Originaltext.
   Ohne Profil (null) greifen die Rückfälle: Kontexte wie im Original, Familienrollen neutral. */
function personalisiere(text,profil,schluessel){
 const pr=normProfil(profil),kette=_kette(pr.phase);
 if(text&&typeof text==="object"){const ph=kette.find(k=>typeof text[k]==="string");text=ph?text[ph]:null}
 if(typeof text!=="string")return null;
 if(text.indexOf("{")<0)return text;
 const wahl=rollenWahl(schluessel,pr),gm=_gemeinschaft(pr,schluessel),
  kt=Object.assign({},KONTEXTE._,...kette.slice().reverse().map(k=>KONTEXTE[k]||{}));
 let niemand=false;
 let out=text.replace(/\{([A-Za-z]+)\.([^{}]*)\}/g,(m,slot,form)=>{
  const gross=slot.charAt(0)!==slot.charAt(0).toLowerCase(),s=slot.toLowerCase();let r;
  if(s==="k")r=kt[form];
  else if(s==="gm")r=gm[form]!=null?gm[form]:GEMEINSCHAFT._[form];
  else{if(wahl[s]===null){niemand=true;return ""}
   const rolle=ROLLEN[wahl[s]];if(!rolle)return "⟦"+m+"⟧";
   if(form.startsWith("g:")){const t=form.slice(2).split("|");r=t[{m:0,f:1,n:2}[rolle.g]];if(r==null)r=t[0]}
   else if(form.startsWith("ist:")){const q=form.slice(4),i=q.indexOf("?"),ids=q.slice(0,i).split(","),t=q.slice(i+1).split("|");r=ids.includes(rolle.id)?t[0]:t[1]}
   else r=rolle.f[form]}
  if(r==null)return "⟦"+m+"⟧";
  return gross?_gross(r):r});
 /* Ein Slot ohne Rückfall hat niemanden gefunden: Dann gilt der Originaltext. */
 if(niemand)return null;
 /* Relativsatz der neutralen Rolle: Komma setzen, wenn der Satz weitergeht */
 out=out.replace(/\u0001(?=\s+[^\s.,;:!?“”])/g,",").replace(/\u0001/g,"");
 return out}

function _aktiv(v,profil){return !!v&&(!v.wenn||v.wenn(normProfil(profil)))}
function _feld(tpl,orig,profil,key){if(tpl==null)return orig;const r=personalisiere(tpl,profil,key);return r==null?orig:r}
/* Ersetzt wörtliche Stücke (alt) im Originaltext. Unabhängig von Index und Reihenfolge der Schritte. */
function _ersetze(text,liste,profil,key,feld){if(typeof text!=="string"||!liste)return text;
 liste.forEach(e=>{if(e.in&&e.in!==feld||text.indexOf(e.alt)<0)return;const neu=personalisiere(e.neu,profil,key);
  if(neu!=null)text=text.split(e.alt).join(neu)});return text}
/* Kopie einer Probe mit personalisierten Texten. Werte (w) und Reihenfolge der Optionen bleiben gleich. */
function personalisiereProbe(p,profil){const key="p:"+p.id,v=VARIANTEN[key];if(!_aktiv(v,profil))return p;const F=v.felder||{};
 const out=Object.assign({},p),E=v.ersetze;["t","x","h","f"].forEach(k=>{out[k]=_ersetze(_feld(F[k],p[k],profil,key),E,profil,key,k)});
 out.o=p.o.map((o,i)=>Object.assign({},o,{t:_ersetze(_feld(F.o&&F.o[i],o.t,profil,key),E,profil,key,"o"),w:o.w}));return out}
/* Übungen: t, x, p und jeder Schritt in s. felder (nach Index) wird noch verstanden, Übungen nutzen aber ersetze. */
function personalisiereUebung(u,profil){const key="u:"+u.id,v=VARIANTEN[key];if(!_aktiv(v,profil))return u;const F=v.felder||{},E=v.ersetze;
 const out=Object.assign({},u);["t","x","p"].forEach(k=>{if(typeof u[k]==="string")out[k]=_ersetze(_feld(F[k],u[k],profil,key),E,profil,key,k)});
 out.s=(u.s||[]).map((s,i)=>_ersetze(_feld(F.s&&F.s[i],s,profil,key),E,profil,key,"s"));return out}
function personalisiereWert(w,profil){const key="b:"+w.id,v=VARIANTEN[key];if(!_aktiv(v,profil))return w;
 return Object.assign({},w,{b:_feld(v.felder.b,w.b,profil,key)})}
/* Für den sanften Hinweis: Hängt diese Probe von einem nahen Menschen ab? */
const hatPersonRolle=id=>{const v=VARIANTEN["p:"+id];return !!(v&&(v.rollen||v.neutral))};

if(typeof module!=="undefined")module.exports={PERSONAL_FRAGEN,PHASEN,ERBE,ROLLEN,KONTEXTE,GEMEINSCHAFT,VARIANTEN,
 personalisiere,personalisiereProbe,personalisiereUebung,personalisiereWert,rollenWahl,normProfil,hatPersonRolle};
