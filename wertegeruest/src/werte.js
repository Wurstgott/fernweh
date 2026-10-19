/* Bereiche */
const CATS={
 selbst:{n:"Selbst",d:"Wie ich mit mir umgehe"},
 naehe:{n:"Nähe",d:"Beziehung und Freundschaft"},
 miteinander:{n:"Miteinander",d:"Würde, Gerechtigkeit und Zusammenleben"},
 welt:{n:"Welt",d:"Natur, Ressourcen und die, die nach uns kommen"},
 urteil:{n:"Urteil",d:"Wahrheit, Verantwortung und eigenes Denken"}
};
const EV=["Denkanstoß","Vorläufig","Solide","Gut belegt"];
const SCH=q=>"https://scholar.google.com/scholar?q="+encodeURIComponent(q);

/* Werte mit Wertequadrat: s = Schwesterwert, zv = Zuviel des Werts, zs = Zuviel der Schwester */
const WERTE=[
 /* Selbst */
 {id:"selbstachtung",cat:"selbst",n:"Selbstachtung",d:"Du behandelst dich selbst mit dem Respekt, den du auch anderen schuldest.",s:"Bescheidenheit",zv:"Selbstgefälligkeit",zs:"Selbstverleugnung",f:"Wo lässt du dich gerade schlechter behandeln, als du einen Freund behandeln würdest?",b:"Du sagst ab, wenn ein Treffen dir nicht guttut, ohne dich lange zu rechtfertigen."},
 {id:"mut",cat:"selbst",n:"Mut",d:"Du tust, was du für richtig hältst, auch wenn du Angst hast.",s:"Vorsicht",zv:"Leichtsinn",zs:"Ängstlichkeit",f:"Welche Sache würdest du angehen, wenn die Angst nur halb so groß wäre?",b:"Du stellst im Unterricht oder in einer Besprechung eine unbequeme Frage."},
 {id:"mass",cat:"selbst",n:"Maß",d:"Du kennst dein Genug und hörst rechtzeitig auf.",s:"Genuss",zv:"Verbissenheit",zs:"Maßlosigkeit",f:"Wovon nimmst du regelmäßig mehr, als dir guttut?",b:"Du legst das Handy weg, obwohl der nächste Clip schon läuft."},
 {id:"freiheit",cat:"selbst",n:"Freiheit",d:"Du triffst deine Entscheidungen selbst und lässt dir nicht vorschreiben, wer du sein sollst.",s:"Verbindlichkeit",zv:"Bindungslosigkeit",zs:"Abhängigkeit",f:"Welche Entscheidung triffst du gerade eher, um anderen zu gefallen?",b:"Du wählst einen Weg, der zu dir passt, auch wenn deine Clique anders denkt."},
 {id:"disziplin",cat:"selbst",n:"Disziplin",d:"Du bleibst bei dem, was dir wichtig ist, auch wenn die Lust gerade fehlt.",s:"Leichtigkeit",zv:"Zwanghaftigkeit",zs:"Beliebigkeit",f:"Was würde sich ändern, wenn du eine Sache zwei Wochen lang jeden Tag tust?",b:"Du lernst zehn Minuten, obwohl du lieber etwas anderes machen würdest."},
 {id:"gelassenheit",cat:"selbst",n:"Gelassenheit",d:"Du unterscheidest, was du ändern kannst und was nicht, und regst dich nicht über alles auf.",s:"Engagement",zv:"Gleichgültigkeit",zs:"Getriebenheit",f:"Worüber ärgerst du dich, obwohl du es nicht ändern kannst?",b:"Du nimmst den verspäteten Zug hin und nutzt die Zeit."},
 {id:"wachstum",cat:"selbst",n:"Wachstum",d:"Du lernst dazu und lässt dich von Fehlern verändern.",s:"Zufriedenheit",zv:"Selbstoptimierung ohne Ende",zs:"Stillstand",f:"Was hast du im letzten Jahr über dich gelernt, das du vorher nicht wusstest?",b:"Du fragst dich nach einem Fehler: Was nehme ich daraus mit?"},
 {id:"echtheit",cat:"selbst",n:"Echtheit",d:"Du zeigst dich so, wie du bist, und spielst keine Rolle, die nicht zu dir passt.",s:"Anpassungsfähigkeit",zv:"Rücksichtslosigkeit",zs:"Verstellung",f:"Wo verstellst du dich, und was würde passieren, wenn du es nicht tätest?",b:"Du sagst, dass dir ein Film nicht gefallen hat, obwohl alle schwärmen."},
 /* Nähe */
 {id:"loyalitaet",cat:"naehe",n:"Loyalität",d:"Du stehst zu Menschen, die dir wichtig sind, auch wenn es unbequem wird.",s:"Kritikbereitschaft",zv:"Blinde Gefolgschaft",zs:"Nörgelei",f:"Wann ist Widerspruch die loyalere Antwort als Schweigen?",b:"Du verteidigst eine Freundin, die nicht im Raum ist."},
 {id:"fuersorge",cat:"naehe",n:"Fürsorge",d:"Du achtest darauf, wie es anderen geht, und kümmerst dich.",s:"Eigenständigkeit",zv:"Bevormundung",zs:"Kälte",f:"Wem würde eine kleine Geste von dir gerade guttun?",b:"Du rufst an, wenn jemand still geworden ist."},
 {id:"vertrauen",cat:"naehe",n:"Vertrauen",d:"Du gehst davon aus, dass andere es gut meinen, solange nichts dagegen spricht.",s:"Wachsamkeit",zv:"Naivität",zs:"Misstrauen",f:"Wem vertraust du weniger, als er vermutlich verdient?",b:"Du leihst jemandem etwas, ohne Bedingungen zu stellen."},
 {id:"vergebung",cat:"naehe",n:"Vergebung",d:"Du lässt eine Kränkung los, damit sie dein Leben nicht weiter bestimmt.",s:"Konsequenz",zv:"Nachgiebigkeit",zs:"Unversöhnlichkeit",f:"Welche alte Kränkung trägst du noch mit dir herum?",b:"Du sagst: Es hat wehgetan, und ich will es nicht länger nachtragen."},
 {id:"offenheit",cat:"naehe",n:"Offenheit",d:"Du lässt andere wissen, was in dir vorgeht.",s:"Zurückhaltung",zv:"Distanzlosigkeit",zs:"Verschlossenheit",f:"Was hast du einem nahen Menschen lange nicht gesagt?",b:"Du sagst einem Freund, dass dich sein Kommentar getroffen hat."},
 {id:"dankbarkeit",cat:"naehe",n:"Dankbarkeit",d:"Du bemerkst, was andere für dich tun, und sagst es ihnen.",s:"Selbstbehauptung",zv:"Unterwürfigkeit",zs:"Anspruchsdenken",f:"Wem hast du nie richtig gedankt?",b:"Du schreibst einer Lehrerin von früher, was sie dir bedeutet hat."},
 {id:"verlaesslichkeit",cat:"naehe",n:"Verlässlichkeit",d:"Du hältst, was du zusagst, und andere können mit dir rechnen.",s:"Flexibilität",zv:"Starrheit",zs:"Unzuverlässigkeit",f:"Welche Zusage hast du zuletzt leichtfertig gegeben?",b:"Du kommst pünktlich, auch wenn es nur ein lockeres Treffen ist."},
 {id:"zuwendung",cat:"naehe",n:"Zuwendung",d:"Du schenkst anderen deine ungeteilte Aufmerksamkeit und Zeit.",s:"Eigenraum",zv:"Klammern",zs:"Abschottung",f:"Wann hast du zuletzt zugehört, ohne nebenbei aufs Handy zu schauen?",b:"Du legst beim Gespräch das Handy umgedreht weg."},
 /* Miteinander */
 {id:"wuerde",cat:"miteinander",n:"Würde",d:"Jeder Mensch hat einen Wert, den ihm niemand nehmen kann, auch nicht durch das, was er tut.",s:"Klarheit gegenüber Unrecht",zv:"Verharmlosung",zs:"Entmenschlichung",f:"Wie kannst du einer Tat entschieden entgegentreten, ohne den Menschen aufzugeben?",b:"Du kritisierst eine Aussage scharf, ohne die Person zu beschimpfen.",fund:true},
 {id:"gerechtigkeit",cat:"miteinander",n:"Gerechtigkeit",d:"Du willst, dass alle bekommen, was ihnen zusteht, und dass gleiche Fälle gleich behandelt werden.",s:"Barmherzigkeit",zv:"Unerbittlichkeit",zs:"Willkür",f:"Wo nimmst du eine Ungerechtigkeit hin, weil sie dich selbst nicht trifft?",b:"Du achtest darauf, dass in der Gruppe nicht immer dieselben die Arbeit machen."},
 {id:"toleranz",cat:"miteinander",n:"Toleranz",d:"Du lässt andere anders leben und denken, auch wenn es dir fremd ist.",s:"Standfestigkeit",zv:"Gleichgültigkeit",zs:"Rechthaberei",f:"Wo endet für dich Toleranz, und warum genau dort?",b:"Du fragst nach, statt eine fremde Lebensweise abzuwerten."},
 {id:"zivilcourage",cat:"miteinander",n:"Zivilcourage",d:"Du greifst ein, wenn jemand herabgesetzt oder bedroht wird.",s:"Besonnenheit",zv:"Übereifer",zs:"Wegschauen",f:"Was würdest du konkret tun, wenn in der Bahn jemand beleidigt wird?",b:"Du sprichst eine Person an, die bedrängt wird, und holst andere dazu."},
 {id:"solidaritaet",cat:"miteinander",n:"Solidarität",d:"Du stehst Menschen bei, denen es schlechter geht, auch wenn du sie nicht kennst.",s:"Eigenverantwortung",zv:"Bevormundung",zs:"Ellenbogendenken",f:"Für wen setzt du dich ein, der dir nichts zurückgeben kann?",b:"Du hilfst bei der Tafel in deiner Stadt mit, auch wenn du dort niemanden kennst."},
 {id:"erinnerung",cat:"miteinander",n:"Erinnerung",d:"Du hältst wach, was Menschen anderen angetan haben, damit es sich nicht wiederholt.",s:"Zuversicht",zv:"Lähmung im Gestern",zs:"Schlussstrich",f:"Wessen Geschichte möchtest du nicht vergessen?",b:"Du bleibst an einem Stolperstein stehen und liest den Namen."},
 {id:"gewaltfreiheit",cat:"miteinander",n:"Gewaltfreiheit",d:"Du löst Konflikte ohne Gewalt in Wort und Tat.",s:"Wehrhaftigkeit",zv:"Hinnehmen von Unrecht",zs:"Gewaltbereitschaft",f:"Wie setzt du eine klare Grenze, ohne selbst zu verletzen?",b:"Du sagst ruhig und deutlich Stopp, statt zurückzuschreien."},
 {id:"beteiligung",cat:"miteinander",n:"Beteiligung",d:"Du gestaltest mit, statt nur zuzuschauen, wie über dich entschieden wird.",s:"Kompromissbereitschaft",zv:"Dauerprotest",zs:"Selbstaufgabe",f:"Wo könntest du mitreden, tust es aber nicht?",b:"Du informierst dich vor einer Wahl und gehst dann auch hin, ob in der Schule oder im Wahllokal."},
 /* Welt */
 {id:"genuegsamkeit",cat:"welt",n:"Genügsamkeit",d:"Du brauchst nicht alles, was du haben könntest.",s:"Lebensfreude",zv:"Verzichtszwang",zs:"Konsumrausch",f:"Was hast du zuletzt gekauft, das du schon nach einer Woche nicht mehr gebraucht hast?",b:"Du leihst dir die Bohrmaschine beim Nachbarn, statt eine zu kaufen."},
 {id:"zukunftsverantwortung",cat:"welt",n:"Verantwortung für Kommende",d:"Du handelst so, dass auch Menschen nach dir gut leben können.",s:"Gegenwartsfreude",zv:"Untergangsangst",zs:"Sorglosigkeit",f:"Was würde ein Kind, das 2060 erwachsen ist, dich heute fragen?",b:"Du wählst bei einer großen Anschaffung das langlebigere Modell."},
 {id:"ehrfurcht",cat:"welt",n:"Ehrfurcht vor dem Leben",d:"Du achtest Tiere und Pflanzen als Lebewesen, nicht nur als Dinge.",s:"Pragmatismus",zv:"Moralismus",zs:"Rücksichtslosigkeit",f:"Welches Lebewesen nimmst du kaum noch wahr, obwohl es dich täglich umgibt?",b:"Du trägst eine Spinne nach draußen, statt sie zu erschlagen."},
 {id:"teilen",cat:"welt",n:"Teilen",d:"Du nutzt Dinge gemeinsam und gibst ab, was andere brauchen.",s:"Sorgfalt mit Eigentum",zv:"Ausnutzbarkeit",zs:"Besitzdenken",f:"Was besitzt du, das in deinem Umfeld jemand gut gebrauchen könnte?",b:"Du stellst Bücher in den öffentlichen Bücherschrank."},
 {id:"sorgfalt",cat:"welt",n:"Sorgfalt",d:"Du pflegst und reparierst, was du hast, statt es schnell zu ersetzen.",s:"Loslassen",zv:"Festhalten am Kaputten",zs:"Wegwerfmentalität",f:"Was könnte mit etwas Pflege noch Jahre halten?",b:"Du nähst den Knopf an, statt das Hemd auszusortieren."},
 {id:"naturverbundenheit",cat:"welt",n:"Naturverbundenheit",d:"Du fühlst dich als Teil der Natur und suchst ihre Nähe.",s:"Sachlichkeit",zv:"Romantisierung",zs:"Entfremdung",f:"Wann warst du zuletzt draußen, ohne ein Ziel zu haben?",b:"Du gehst den Umweg durch den Park."},
 {id:"folgerichtigkeit",cat:"welt",n:"Folgerichtigkeit",d:"Du tust, was du für richtig erkannt hast, statt es nur zu wissen.",s:"Nachsicht mit dir",zv:"Selbstgeißelung",zs:"Ausreden",f:"Wo klaffen dein Wissen und dein Tun am weitesten auseinander?",b:"Du nimmst den Zug, obwohl der Flug billiger wäre, weil du es dir vorgenommen hast."},
 {id:"weitherzigkeit",cat:"welt",n:"Weitherzigkeit",d:"Dir sind auch Menschen wichtig, die weit weg leben und die du nie treffen wirst.",s:"Nähe zum Eigenen",zv:"Fernstenliebe ohne Nächstenliebe",zs:"Engstirnigkeit",f:"Wie weit reicht der Kreis der Menschen, für die du dich verantwortlich fühlst?",b:"Du achtest beim Kaufen darauf, unter welchen Bedingungen etwas hergestellt wurde."},
 /* Urteil */
 {id:"wahrhaftigkeit",cat:"urteil",n:"Wahrhaftigkeit",d:"Du sagst, was du für wahr hältst, und verdrehst nichts zu deinem Vorteil.",s:"Taktgefühl",zv:"Verletzende Offenheit",zs:"Schönfärberei",f:"Welche Wahrheit vermeidest du gerade, und wem würde sie helfen?",b:"Du gibst zu, dass du etwas vergessen hast, statt eine Ausrede zu erfinden."},
 {id:"muendigkeit",cat:"urteil",n:"Mündigkeit",d:"Du denkst selbst, bevor du übernimmst, was andere, Medien oder Maschinen dir sagen.",s:"Lernbereitschaft",zv:"Besserwisserei",zs:"Hörigkeit",f:"Welche Meinung hast du übernommen, ohne sie je geprüft zu haben?",b:"Du liest nach, bevor du eine Behauptung weitererzählst."},
 {id:"differenzierung",cat:"urteil",n:"Differenzierung",d:"Du siehst Zwischentöne und bildest dir ein Urteil, das der Wirklichkeit gerecht wird.",s:"Entschiedenheit",zv:"Unentschiedenheit",zs:"Schwarz-Weiß-Denken",f:"Wo urteilst du schnell, obwohl die Lage verwickelter ist?",b:"Du sagst: In diesem Punkt hast du recht, in jenem nicht."},
 {id:"verantwortlichkeit",cat:"urteil",n:"Verantwortlichkeit",d:"Du stehst für die Folgen deines Handelns ein, auch für die unbeabsichtigten.",s:"Gnade mit dir",zv:"Schuldkomplex",zs:"Abschieben",f:"Wofür könntest du heute Verantwortung übernehmen, statt auf andere zu zeigen?",b:"Du sagst: Das war mein Fehler, ich kümmere mich darum."},
 {id:"neugier",cat:"urteil",n:"Neugier",d:"Du willst verstehen, auch das, was dir fremd ist oder nicht gefällt.",s:"Skepsis",zv:"Leichtgläubigkeit",zs:"Zynismus",f:"Was möchtest du über einen Menschen verstehen, den du nicht magst?",b:"Du fragst jemanden mit anderer Meinung, wie er dazu gekommen ist."},
 {id:"integritaet",cat:"urteil",n:"Integrität",d:"Deine Worte und Taten passen zusammen, auch wenn niemand hinschaut.",s:"Lernfähigkeit",zv:"Sturheit",zs:"Fähnchen im Wind",f:"Wo handelst du anders, wenn du dich unbeobachtet fühlst?",b:"Du gibst zu viel erhaltenes Wechselgeld zurück."},
 {id:"demut",cat:"urteil",n:"Erkenntnisdemut",d:"Du rechnest damit, dass du dich irren kannst, und bleibst offen für Gründe.",s:"Urteilsvertrauen",zv:"Lähmender Selbstzweifel",zs:"Selbstüberschätzung",f:"Bei welcher Meinung wärst du bereit, dich vom Gegenteil überzeugen zu lassen?",b:"Du sagst: Da könnte ich falschliegen, lass uns nachsehen."},
 {id:"fairness",cat:"urteil",n:"Fairness",d:"Du beurteilst andere nach denselben Maßstäben wie dich und deine Leute.",s:"Parteinahme für Schwächere",zv:"Falsche Ausgewogenheit",zs:"Einseitigkeit",f:"Würdest du genauso urteilen, wenn es um jemanden aus deiner eigenen Gruppe ginge?",b:"Du kritisierst auch einen Fehler deines Lieblingsvereins."}
];

/* Werte finden: alltägliche Sätze statt abstrakter Begriffe. w = [Hauptwert, Nebenwert] */
const SAETZE=[
 {t:"Wenn jemand vor anderen bloßgestellt wird, kann ich nicht einfach wegsehen.",w:["zivilcourage","solidaritaet"]},
 {t:"Ich sage lieber eine unbequeme Wahrheit als eine bequeme Lüge.",w:["wahrhaftigkeit","echtheit"]},
 {t:"Es macht mich zornig, wenn Regeln für manche gelten und für andere nicht.",w:["gerechtigkeit","fairness"]},
 {t:"Wenn Freunde mich brauchen, lasse ich anderes liegen.",w:["loyalitaet","fuersorge"]},
 {t:"Was ich zusage, halte ich auch dann, wenn es mir später nicht mehr passt.",w:["verlaesslichkeit","integritaet"]},
 {t:"Ich will mir selbst ein Bild machen, statt zu übernehmen, was alle sagen.",w:["muendigkeit","differenzierung"]},
 {t:"Ich frage nach, bis ich verstanden habe, wie etwas wirklich funktioniert.",w:["neugier","wachstum"]},
 {t:"Es stört mich, wenn Dinge weggeworfen werden, die man noch reparieren könnte.",w:["sorgfalt","genuegsamkeit"]},
 {t:"Ich denke manchmal darüber nach, wie die Welt für die aussieht, die nach uns kommen.",w:["zukunftsverantwortung","folgerichtigkeit"]},
 {t:"Draußen in der Natur komme ich zur Ruhe und fühle mich verbunden.",w:["naturverbundenheit","gelassenheit"]},
 {t:"Ich kann jemandem verzeihen, ohne zu vergessen, was passiert ist.",w:["vergebung","gelassenheit"]},
 {t:"Ich traue mich an Dinge, vor denen ich Angst habe, wenn sie mir wichtig sind.",w:["mut","wachstum"]},
 {t:"Ich lasse mir nicht alles gefallen, auch nicht von Menschen, die ich mag.",w:["selbstachtung","echtheit"]},
 {t:"Wenn mich etwas beschäftigt, erzähle ich es lieber einem Freund, als es für mich zu behalten.",w:["offenheit","vertrauen"]},
 {t:"Ich bewundere Menschen, die auch ihren Gegnern mit Respekt begegnen.",w:["gewaltfreiheit","fairness"]},
 {t:"Ich teile, was ich habe, auch wenn es gerade knapp ist.",w:["teilen","solidaritaet"]},
 {t:"Es ist mir wichtig, dass nicht vergessen wird, was Menschen anderen angetan haben.",w:["erinnerung","verantwortlichkeit"]},
 {t:"Wenn in der Klasse, im Verein oder im Viertel etwas entschieden wird, rede ich mit.",w:["beteiligung","muendigkeit"]},
 {t:"Ich gebe zu, wenn ich falschlag, auch wenn es peinlich ist.",w:["verantwortlichkeit","demut"]},
 {t:"Ich sage Menschen, wofür ich ihnen dankbar bin.",w:["dankbarkeit","zuwendung"]},
 {t:"Wenn ich mit jemandem zusammen bin, ist das Handy weg.",w:["zuwendung","mass"]},
 {t:"Ich merke, wann es genug ist, beim Essen, beim Scrollen oder beim Arbeiten.",w:["mass","gelassenheit"]},
 {t:"Ich bleibe dran, auch wenn es gerade keinen Spaß macht.",w:["disziplin","verlaesslichkeit"]},
 {t:"Ich will so leben, wie es zu mir passt, nicht wie andere es von mir erwarten.",w:["freiheit","echtheit"]},
 {t:"Ich vertraue Menschen erst einmal, bis sie mir einen Grund geben, es nicht zu tun.",w:["vertrauen","offenheit"]},
 {t:"Streit löse ich lieber mit Worten als mit Druck.",w:["gewaltfreiheit","fairness"]},
 {t:"Bei einem Streit sehe ich meistens, dass beide Seiten in manchen Punkten recht haben.",w:["differenzierung","fairness"]},
 {t:"Mich berührt, wie viel Leben in einer Wiese oder einem Wald steckt.",w:["ehrfurcht","naturverbundenheit"]},
 {t:"Ich kaufe lieber weniger und dafür bewusster.",w:["genuegsamkeit","folgerichtigkeit"]},
 {t:"Was ich sage und was ich tue, soll zusammenpassen.",w:["integritaet","folgerichtigkeit"]},
 {t:"Ich weiß, dass ich mich irren kann, und höre deshalb auch Gegenargumente an.",w:["demut","toleranz"]},
 {t:"Es macht mich zornig, wenn Menschen in Not allein gelassen werden.",w:["solidaritaet","fuersorge"]},
 {t:"Ich behandle Menschen gleich, egal ob ich sie mag oder nicht.",w:["fairness","gerechtigkeit"]},
 {t:"Ich lerne gern aus Fehlern, statt sie zu verstecken.",w:["wachstum","verantwortlichkeit"]},
 {t:"Wenn jemand krank ist oder traurig, melde ich mich.",w:["fuersorge","zuwendung"]},
 /* Abwägungssätze: nur am Ende anfügen, die Antworten werden nach Position gespeichert */
 {t:"Lieber verliere ich einen Freund, als bei etwas mitzumachen, das ich falsch finde.",w:["integritaet","zivilcourage"]},
 {t:"Wenn ich Geld gebe, dann lieber dorthin, wo es am meisten bewirkt, auch wenn ich die Menschen nie sehen werde.",w:["weitherzigkeit","gerechtigkeit"]},
 {t:"Ich lasse andere bei ihrer Meinung, auch wenn ich sie für falsch halte, statt sie unbedingt überzeugen zu wollen.",w:["toleranz","gelassenheit"]},
 {t:"Wenn etwas schiefgeht, das ich nicht ändern kann, ärgere ich mich nicht lange darüber.",w:["gelassenheit","mass"]},
 {t:"Ich verstelle mich nicht, nur damit eine Gruppe mich mag.",w:["echtheit","selbstachtung"]},
 {t:"Wenn ich etwas als richtig erkannt habe, ändere ich auch mein Verhalten, selbst wenn es unbequem ist.",w:["folgerichtigkeit","disziplin"]}
];

/* Beispiel-Leitsätze: werden beim Formulieren nur angezeigt, nie ins Feld übernommen */
const LEITBSP={
 selbstachtung:"Ich stehe dafür ein, dass ich mich nicht schlechter behandeln lasse, als ich einen Freund behandeln würde, ohne mich über andere zu stellen.",
 mut:"Ich stehe dafür ein, dass ich eine unbequeme Frage stelle, auch wenn ich Angst habe, und dass ich vorher kurz überlege, was sie auslöst.",
 mass:"Ich stehe dafür ein, dass ich aufhöre, wenn es genug ist, und das Gute trotzdem genieße.",
 freiheit:"Ich stehe dafür ein, dass ich meine Entscheidungen selbst treffe und trotzdem zu meinen Zusagen stehe.",
 disziplin:"Ich stehe dafür ein, dass ich bei dem bleibe, was mir wichtig ist, auch ohne Lust, und dass ich mir dabei Pausen gönne.",
 gelassenheit:"Ich stehe dafür ein, dass ich mich nicht über das aufrege, was ich nicht ändern kann, und mich für das einsetze, was ich ändern kann.",
 wachstum:"Ich stehe dafür ein, dass ich aus Fehlern lerne, ohne mich ständig verbessern zu müssen.",
 echtheit:"Ich stehe dafür ein, dass ich zeige, was ich denke, und dabei Rücksicht auf die Lage der anderen nehme.",
 loyalitaet:"Ich stehe dafür ein, dass ich zu meinen Freunden halte und ihnen trotzdem sage, wenn ich etwas falsch finde.",
 fuersorge:"Ich stehe dafür ein, dass ich mich melde, wenn jemand still wird, und dass ich ihm selbst überlasse, was er braucht.",
 vertrauen:"Ich stehe dafür ein, dass ich anderen einen Vorschuss an Vertrauen gebe und trotzdem hinschaue, wenn etwas nicht stimmt.",
 vergebung:"Ich stehe dafür ein, dass ich eine Kränkung nicht ewig nachtrage und trotzdem klar sage, was nicht in Ordnung war.",
 offenheit:"Ich stehe dafür ein, dass ich sage, wenn mich etwas getroffen hat, und dabei nicht alles von mir preisgebe.",
 dankbarkeit:"Ich stehe dafür ein, dass ich anderen sage, was sie mir bedeuten, ohne mich dabei kleinzumachen.",
 verlaesslichkeit:"Ich stehe dafür ein, dass man sich auf mein Wort verlassen kann und ich trotzdem beweglich bleibe, wenn sich etwas ändert.",
 zuwendung:"Ich stehe dafür ein, dass ich ganz da bin, wenn jemand mit mir redet, und dass ich mir auch Zeit für mich nehme.",
 gerechtigkeit:"Ich stehe dafür ein, dass in meiner Gruppe nicht immer dieselben die Arbeit machen, und dass ich dabei auch Nachsicht zeige.",
 toleranz:"Ich stehe dafür ein, dass ich nachfrage, statt eine fremde Lebensweise abzuwerten, und dass ich bei Herabsetzung trotzdem widerspreche.",
 zivilcourage:"Ich stehe dafür ein, dass ich nicht wegsehe, wenn jemand bloßgestellt wird, und dass ich dabei niemanden selbst bloßstelle.",
 solidaritaet:"Ich stehe dafür ein, dass ich zu Menschen halte, die zu Unrecht unter Druck geraten, und ihnen trotzdem nicht alles abnehme.",
 erinnerung:"Ich stehe dafür ein, dass ich die Opfer von Unrecht nicht vergesse und trotzdem zuversichtlich nach vorn schaue.",
 gewaltfreiheit:"Ich stehe dafür ein, dass ich ruhig und deutlich Stopp sage, statt zurückzuschlagen, und dass ich Unrecht trotzdem nicht hinnehme.",
 beteiligung:"Ich stehe dafür ein, dass ich mitrede, wo über mein Umfeld entschieden wird, und dass ich auch Kompromisse mittrage.",
 genuegsamkeit:"Ich stehe dafür ein, dass ich leihe oder repariere, bevor ich neu kaufe, und mir trotzdem Freude gönne.",
 zukunftsverantwortung:"Ich stehe dafür ein, dass ich bei großen Entscheidungen an die denke, die nach uns kommen, ohne die Freude am Heute zu verlieren.",
 ehrfurcht:"Ich stehe dafür ein, dass ich Lebewesen nicht achtlos schade, ohne anderen deshalb Vorschriften zu machen.",
 teilen:"Ich stehe dafür ein, dass ich abgebe, was ich nicht brauche, und trotzdem sorgsam mit meinen Sachen umgehe.",
 sorgfalt:"Ich stehe dafür ein, dass ich Dinge pflege und repariere, und dass ich loslasse, was sich nicht mehr retten lässt.",
 naturverbundenheit:"Ich stehe dafür ein, dass ich mir regelmäßig Zeit draußen nehme und die Natur dabei nicht verkläre.",
 folgerichtigkeit:"Ich stehe dafür ein, dass ich tue, was ich mir vorgenommen habe, und mir verzeihe, wenn es einmal nicht klappt.",
 weitherzigkeit:"Ich stehe dafür ein, dass mir auch ferne Menschen nicht egal sind, ohne die Menschen um mich herum zu übersehen.",
 wahrhaftigkeit:"Ich stehe dafür ein, dass ich die Wahrheit sage, auch wenn sie unbequem ist, und dass ich dabei taktvoll bleibe.",
 muendigkeit:"Ich stehe dafür ein, dass ich nachlese, bevor ich etwas weitererzähle, und dass ich offen für Neues bleibe.",
 differenzierung:"Ich stehe dafür ein, dass ich genau hinschaue, bevor ich urteile, und mich trotzdem festlege, wenn es nötig ist.",
 verantwortlichkeit:"Ich stehe dafür ein, dass ich zu meinen Fehlern stehe und mich darum kümmere, ohne mich dafür fertigzumachen.",
 neugier:"Ich stehe dafür ein, dass ich Menschen mit anderer Meinung frage, wie sie dazu gekommen sind, und trotzdem kritisch bleibe.",
 integritaet:"Ich stehe dafür ein, dass mein Handeln zu meinen Worten passt, auch wenn es niemand merkt, und dass ich meine Meinung ändere, wenn ich etwas Neues lerne.",
 demut:"Ich stehe dafür ein, dass ich mich irren kann und nachsehe, und dass ich trotzdem meinem Urteil traue.",
 fairness:"Ich stehe dafür ein, dass ich gleiche Maßstäbe anlege, auch bei denen, die ich mag, und dass ich mich trotzdem für Schwächere einsetze."
};

/* Erklärungen zu den Begriffen der Wertequadrate: s = Schwester, zv = Zuviel des Werts, zs = Zuviel der Schwester.
   d = was der Begriff meint, a = woran man ein Zuviel im Alltag erkennt, f = Frage zum Nachdenken */
const QUAD={
 selbstachtung:{
  s:{d:"Bescheidenheit heißt, dich nicht über andere zu stellen und deine Stärken nicht ständig zu betonen. Du weißt, was du kannst, und musst es niemandem beweisen.",f:"In welcher Lage würde dir etwas mehr Bescheidenheit guttun?"},
  zv:{d:"Selbstgefälligkeit heißt, dir selbst so sehr zu gefallen, dass Kritik nicht mehr ankommt. Der gute Kern ist der Wunsch, dich nicht kleinmachen zu lassen, nur fehlt der Blick für die anderen.",a:"Jemand gibt dir einen berechtigten Hinweis, und du winkst ab, weil du sicher bist, dass du alles richtig machst.",f:"Woran merkst du bei dir, dass aus Selbstachtung Selbstgefälligkeit wird?"},
  zs:{d:"Selbstverleugnung heißt, deine eigenen Bedürfnisse nicht mehr zu zählen. Sie beginnt mit dem freundlichen Wunsch, niemandem zur Last zu fallen.",a:"Du sagst „ist schon okay“, obwohl es dich verletzt, und übernimmst wieder die Arbeit, die eigentlich andere machen sollten.",f:"Wo stellst du dich so weit zurück, dass du dich selbst nicht mehr siehst?"}},
 mut:{
  s:{d:"Vorsicht heißt, Gefahren zu sehen und abzuwägen, bevor du handelst. Sie schützt dich und andere vor unnötigem Schaden.",f:"Bei welcher Entscheidung würde es dir helfen, vorher genauer hinzuschauen?"},
  zv:{d:"Leichtsinn heißt, ein Risiko einzugehen, ohne es abzuwägen. Gut gemeint ist die Bereitschaft, etwas zu wagen, doch die Gefahr für dich und andere wird nicht mehr ernst genommen.",a:"Du springst bei einer Mutprobe von der Brücke in den Fluss, ohne zu wissen, wie tief das Wasser ist.",f:"Woran merkst du, ob du gerade mutig bist oder nur leichtsinnig?"},
  zs:{d:"Ängstlichkeit heißt, überall Gefahren zu sehen und deshalb auch das Wichtige nicht zu tun. Dahinter steht der berechtigte Wunsch, Schaden zu vermeiden.",a:"Du hast eine gute Idee für das Projekt, sagst sie aber nicht, weil jemand sie schlecht finden könnte.",f:"Was hat dich deine Angst zuletzt gekostet?"}},
 mass:{
  s:{d:"Genuss heißt, dir etwas Gutes zu gönnen und es mit allen Sinnen zu erleben. Wer genießt, ist ganz bei der Sache und muss sich dafür nicht rechtfertigen.",f:"Wann hast du dir zuletzt etwas gegönnt, ohne ein schlechtes Gewissen zu haben?"},
  zv:{d:"Verbissenheit heißt hier, dich so streng zu kontrollieren, dass keine Freude mehr bleibt. Gut gemeint ist der Wunsch, nicht zu übertreiben, doch das Begrenzen wird wichtiger als das Leben, das es schützen soll.",a:"Du erlaubst dir am Wochenende keine einzige Folge deiner Lieblingsserie, weil du Angst hast, sonst nicht mehr aufzuhören.",f:"Wo ist dein Maßhalten so streng geworden, dass es dir die Freude nimmt?"},
  zs:{d:"Maßlosigkeit heißt, immer mehr zu wollen, bis das Gute seinen Reiz verliert. Sie beginnt mit dem verständlichen Wunsch, das Leben auszukosten.",a:"Du willst nur eine Folge schauen und merkst um zwei Uhr nachts, dass die ganze Staffel vorbei ist.",f:"Woran erkennst du bei dir, dass aus Genuss zu viel geworden ist?"}},
 freiheit:{
  s:{d:"Verbindlichkeit heißt, dich festzulegen und zu deinen Zusagen und Beziehungen zu stehen. Andere können sich darauf verlassen, dass du bleibst.",f:"Wo würde es dir guttun, dich festzulegen?"},
  zv:{d:"Bindungslosigkeit heißt, dir alles offenzuhalten und dich auf nichts und niemanden festzulegen. Der gute Kern ist der Wunsch, selbst zu entscheiden, doch am Ende bist du für niemanden wirklich da.",a:"Du antwortest auf Einladungen nur mit „mal sehen“, damit du absagen kannst, falls etwas Besseres kommt.",f:"Wovor schützt dich das Offenhalten, und was entgeht dir dadurch?"},
  zs:{d:"Abhängigkeit heißt, ohne andere nicht mehr entscheiden zu können. Sie wächst aus der guten Treue zu Menschen und Zusagen, wenn dabei der eigene Wille verloren geht.",a:"Du triffst keine Entscheidung, bevor dein Freund oder deine Eltern gesagt haben, was sie davon halten.",f:"Bei welcher Entscheidung fragst du eher, was andere wollen, als was du willst?"}},
 disziplin:{
  s:{d:"Leichtigkeit heißt, Dinge locker anzugehen und Freude daran zu haben. Du darfst Pausen einlegen und auch einmal spontan etwas anderes tun.",f:"Was würde dir leichter fallen, wenn du es etwas weniger ernst nehmen würdest?"},
  zv:{d:"Zwanghaftigkeit heißt, keine Ausnahme mehr zuzulassen, auch wenn sie vernünftig wäre. Gut gemeint ist der Wille, dranzubleiben, doch der Plan wird wichtiger als der Grund, aus dem du ihn gemacht hast.",a:"Du gehst trotz Fieber joggen, weil sonst deine Serie in der App reißt.",f:"Woran merkst du, dass du etwas nicht mehr aus Überzeugung tust, sondern weil du nicht anders kannst?"},
  zs:{d:"Beliebigkeit heißt, nur noch zu tun, worauf du gerade Lust hast, sodass nichts fertig wird. Dahinter steht der gute Wunsch, ohne Druck zu leben.",a:"Du fängst jede Woche etwas Neues an und hörst nach drei Tagen wieder auf.",f:"Welches Vorhaben hast du zuletzt fallen lassen, nur weil die Lust weg war?"}},
 gelassenheit:{
  s:{d:"Engagement heißt, dich mit Kraft und Zeit für etwas einzusetzen, das dir wichtig ist. Du nimmst nicht alles hin, sondern packst an.",f:"Wofür würdest du dich gern stärker einsetzen?"},
  zv:{d:"Gleichgültigkeit heißt, dass dir auch das egal ist, was du ändern könntest. Der gute Kern ist der Wunsch nach Ruhe, doch er schützt dich am Ende auch vor dem, was dich angehen sollte.",a:"Deine Noten rutschen ab, und du denkst nur: Ist halt so, da kann man nichts machen.",f:"Wo sagst du „ist mir egal“, obwohl es dir eigentlich nicht egal ist?"},
  zs:{d:"Getriebenheit heißt, keine Ruhe mehr zu finden und dich über alles aufzuregen, auch über das, was du nicht ändern kannst. Sie beginnt mit dem guten Willen, etwas zu bewegen.",a:"Du liest abends noch dreimal die Nachrichten der Arbeitsgruppe und kannst danach nicht einschlafen.",f:"Wann hast du zuletzt etwas bewusst liegen lassen, und wie hat sich das angefühlt?"}},
 wachstum:{
  s:{d:"Zufriedenheit heißt, mit dem einverstanden zu sein, was du bist und hast. Du musst nicht ständig mehr werden, um gut genug zu sein.",f:"Womit an dir könntest du heute einfach zufrieden sein?"},
  zv:{d:"Selbstoptimierung ohne Ende heißt, dass nichts je gut genug ist und jeder Erfolg nur zur nächsten Baustelle führt. Gut gemeint ist die Lust, dazuzulernen, doch du kommst nie an.",a:"Du zählst Schlaf, Schritte und Lernzeit und fühlst dich schlecht, sobald ein Wert unter deinem Ziel liegt.",f:"Wann hast du dich zuletzt über etwas gefreut, ohne gleich das Nächste zu planen?"},
  zs:{d:"Stillstand heißt, nichts Neues mehr zu lernen, auch dort, wo es dir guttun würde. Er wächst aus der guten Zufriedenheit, wenn sie sich gegen jede Veränderung sperrt.",a:"Du spielst seit Jahren dieselben drei Stücke auf der Gitarre und sagst: Reicht doch.",f:"Wo hast du dich mit etwas zufriedengegeben, das du eigentlich gern weiterentwickeln würdest?"}},
 echtheit:{
  s:{d:"Anpassungsfähigkeit heißt, dich auf Menschen und Lagen einzustellen. Du merkst, was gerade passt, und kannst dich darauf einlassen, ohne dich aufzugeben.",f:"Wo würde es dir helfen, dich etwas mehr auf die anderen einzustellen?"},
  zv:{d:"Rücksichtslosigkeit heißt hier, dich so zu zeigen, wie du bist, ohne zu fragen, was das bei anderen auslöst. Der gute Kern ist der Wunsch, dich nicht zu verstellen, doch „so bin ich eben“ wird zur Ausrede, um andere zu übergehen.",a:"Du hast schlechte Laune und lässt sie beim Familienessen an allen aus, weil du dich ja nicht verstellen willst.",f:"Wann ist „ich bin halt so“ bei dir eine Ausrede?"},
  zs:{d:"Verstellung heißt, eine Rolle zu spielen, die nicht zu dir passt. Sie beginnt mit dem verständlichen Wunsch, dazuzugehören und keinen Ärger zu machen.",a:"Du lachst über Witze, die du gemein findest, weil alle anderen auch lachen.",f:"In welcher Gruppe bist du am wenigsten du selbst, und warum gerade dort?"}},
 loyalitaet:{
  s:{d:"Kritikbereitschaft heißt, auch Menschen, die dir nahestehen, offen zu sagen, wenn du etwas falsch findest. Du nimmst sie ernst genug, um ihnen zu widersprechen.",f:"Wem in deiner Nähe müsstest du gerade einmal ehrlich widersprechen?"},
  zv:{d:"Blinde Gefolgschaft heißt, zu deinen Leuten zu halten, auch wenn sie im Unrecht sind, und dafür mitzumachen oder zu schweigen. Gut gemeint ist die Treue, doch sie schaut nicht mehr hin.",a:"Deine Clique lästert im Gruppenchat über jemanden, und du schickst ein Lach-Emoji, obwohl du es nicht gut findest.",f:"Wann hast du zuletzt geschwiegen, nur damit niemand denkt, du hältst nicht zu deinen Leuten?"},
  zs:{d:"Nörgelei heißt, an allem etwas auszusetzen, sodass die anderen nicht mehr spüren, dass du zu ihnen stehst. Dahinter steht der gute Wunsch, Dinge besser zu machen.",a:"Bei jedem Plan deiner Freunde sagst du zuerst, was daran nicht funktionieren wird.",f:"Spüren die Menschen, die du kritisierst, auch, dass du zu ihnen hältst?"}},
 fuersorge:{
  s:{d:"Eigenständigkeit heißt hier, anderen zuzutrauen, dass sie selbst wissen, was sie brauchen. Du lässt ihnen ihren eigenen Weg, auch wenn du es anders machen würdest.",f:"Wem könntest du mehr zutrauen, als du es gerade tust?"},
  zv:{d:"Bevormundung heißt, über den Kopf eines anderen hinweg zu entscheiden, was gut für ihn ist. Gut gemeint ist die Sorge um ihn, doch du fragst nicht mehr, was er selbst will.",a:"Deine Freundin will nur von ihrem Streit erzählen, und du sagst ihr genau, was sie jetzt tun muss.",f:"Wann hast du zuletzt geholfen, ohne vorher zu fragen, ob Hilfe gewünscht war?"},
  zs:{d:"Kälte heißt, Menschen allein zu lassen, auch wenn sie dich bräuchten. Sie beginnt mit dem guten Respekt vor dem eigenen Weg der anderen.",a:"Ein Freund ist seit Wochen still, und du denkst: Er meldet sich schon, wenn er etwas will.",f:"Wo sagst du „das muss jeder selbst wissen“, obwohl jemand dich gerade bräuchte?"}},
 vertrauen:{
  s:{d:"Wachsamkeit heißt, aufmerksam zu bleiben und Warnzeichen ernst zu nehmen. Du schaust hin, wenn etwas nicht zusammenpasst.",f:"Wo solltest du genauer hinschauen, statt einfach weiterzumachen?"},
  zv:{d:"Naivität heißt, Warnzeichen zu übersehen, weil du nicht wahrhaben willst, was du siehst. Der gute Kern ist der Glaube an das Gute im anderen.",a:"Du gibst einem Fremden im Netz deine Adresse, weil er so nett geschrieben hat.",f:"Bei wem hast du ein ungutes Gefühl schon einmal weggeschoben?"},
  zs:{d:"Misstrauen heißt, anderen schlechte Absichten zu unterstellen, bevor sie etwas getan haben. Dahinter steht der berechtigte Wunsch, dich zu schützen.",a:"Eine neue Kollegin ist freundlich zu dir, und du fragst dich sofort, was sie von dir will.",f:"Welche Erfahrung hat dich misstrauisch gemacht, und gilt sie wirklich für alle Menschen?"}},
 vergebung:{
  s:{d:"Konsequenz heißt, dass eine Verletzung Folgen hat. Du sagst klar, was nicht in Ordnung war, und hältst daran fest.",f:"Wo bräuchte es von dir eine klare Folge, damit sich etwas nicht wiederholt?"},
  zv:{d:"Nachgiebigkeit heißt, so schnell zu verzeihen, dass sich nichts ändert und dieselbe Kränkung wiederkommt. Gut gemeint ist der Wunsch nach Frieden, doch es fehlt die Grenze.",a:"Deine Freundin sagt zum fünften Mal kurzfristig ab, und du schreibst wieder „kein Problem“.",f:"Welche Entschuldigung hast du angenommen, obwohl du gespürt hast, dass sich nichts ändern wird?"},
  zs:{d:"Unversöhnlichkeit heißt, eine Kränkung so festzuhalten, dass sie dein Leben länger bestimmt als nötig. Sie beginnt mit dem richtigen Wunsch, Unrecht ernst zu nehmen.",a:"Du redest seit Jahren nicht mit deinem Bruder und weißt selbst kaum noch, worum der Streit ging.",f:"Was würde dir helfen, eine Kränkung loszulassen, ohne so zu tun, als wäre sie nicht passiert?"}},
 offenheit:{
  s:{d:"Zurückhaltung heißt, nicht alles sofort zu sagen und nicht alles von dir preiszugeben. Du wählst, wem du was anvertraust.",f:"Wann wäre es klüger, etwas für dich zu behalten oder erst später zu sagen?"},
  zv:{d:"Distanzlosigkeit heißt, zu viel, zu früh oder den falschen Leuten von dir zu erzählen, sodass andere sich bedrängt fühlen. Der gute Kern ist der Wunsch nach Nähe und Ehrlichkeit.",a:"Du erzählst beim ersten Treffen mit neuen Kolleginnen ausführlich von deiner Trennung.",f:"Woran merkst du, dass dein Gegenüber gerade nicht mehr von dir hören möchte?"},
  zs:{d:"Verschlossenheit heißt, dass niemand mehr weiß, wie es dir geht, auch nicht die Menschen, die dir nahestehen. Dahinter steht der gute Wunsch, deine innere Welt zu schützen.",a:"Deine Eltern fragen, wie es dir geht, und du sagst immer nur „passt schon“.",f:"Wem würdest du gern mehr von dir zeigen, und was hält dich davon ab?"}},
 dankbarkeit:{
  s:{d:"Selbstbehauptung heißt, für deine Bedürfnisse und Rechte einzustehen. Du weißt, was dir zusteht, und sagst es auch.",f:"Wo solltest du deutlicher sagen, was du brauchst?"},
  zv:{d:"Unterwürfigkeit heißt, dich so sehr in der Schuld anderer zu fühlen, dass du dich nicht mehr traust, Nein zu sagen. Gut gemeint ist die Anerkennung dessen, was andere für dich tun.",a:"Weil dein Chef dir einmal geholfen hat, machst du klaglos jede Überstunde.",f:"Bei wem fühlst du dich so in der Schuld, dass du nicht mehr widersprichst?"},
  zs:{d:"Anspruchsdenken heißt, alles für selbstverständlich zu halten, weil es dir ja zusteht. Es wächst aus dem guten Wissen um deinen eigenen Wert, wenn dabei der Blick für die Mühe anderer verloren geht.",a:"Du ärgerst dich, dass das Essen noch nicht fertig ist, statt zu sehen, dass jemand für dich kocht.",f:"Was nimmst du als selbstverständlich hin, obwohl sich jemand dafür Mühe gibt?"}},
 verlaesslichkeit:{
  s:{d:"Flexibilität heißt, beweglich zu bleiben, wenn sich die Lage ändert. Du kannst Pläne anpassen, ohne dass alles zusammenbricht.",f:"Welcher deiner Pläne dürfte etwas beweglicher sein?"},
  zv:{d:"Starrheit heißt, an Abmachungen festzuhalten, auch wenn sie niemandem mehr nützen. Gut gemeint ist, dass andere sich auf dich verlassen können.",a:"Du bestehst auf dem verabredeten Kinoabend, obwohl deine Freundin gerade eine schlimme Nachricht bekommen hat.",f:"An welcher Abmachung hältst du fest, obwohl sie ihren Sinn verloren hat?"},
  zs:{d:"Unzuverlässigkeit heißt, zuzusagen und wieder abzusagen, sodass niemand mehr weiß, woran er bei dir ist. Dahinter steht die gute Offenheit für Neues und Unerwartetes.",a:"Du schreibst im Gruppenchat „bin dabei“ und eine Stunde vorher, dass doch etwas dazwischengekommen ist.",f:"Wer musste zuletzt umplanen, weil du deine Pläne geändert hast?"}},
 zuwendung:{
  s:{d:"Eigenraum heißt, Zeit und Platz für dich selbst zu haben. Dort tankst du auf und spürst, was du selbst willst.",f:"Wann hattest du zuletzt eine Stunde ganz für dich?"},
  zv:{d:"Klammern heißt, die Nähe zu einem Menschen so sehr zu brauchen, dass er keine Luft mehr bekommt. Der gute Kern ist der Wunsch, ganz für jemanden da zu sein.",a:"Du wirst unruhig, wenn deine Freundin eine Stunde lang nicht auf deine Nachricht antwortet.",f:"Woran merkst du, dass deine Nähe für jemanden zu viel wird?"},
  zs:{d:"Abschottung heißt, dich so zurückzuziehen, dass andere dich nicht mehr erreichen. Sie beginnt mit dem guten Wunsch nach Ruhe und Zeit für dich.",a:"Du stellst dein Handy wochenlang stumm und sagst jede Einladung ab, auch die von engen Freunden.",f:"Wen hast du in letzter Zeit auf Abstand gehalten, obwohl er dir wichtig ist?"}},
 wuerde:{
  s:{d:"Klarheit gegenüber Unrecht heißt, eine verletzende oder grausame Tat beim Namen zu nennen und ihr entschieden entgegenzutreten. Gerade weil jeder Mensch Würde hat, darf nicht beschönigt werden, was Menschen einander antun.",f:"Welches Unrecht in deiner Nähe möchtest du deutlicher beim Namen nennen?"},
  zv:{d:"Verharmlosung heißt, die Würde eines Täters so sehr in den Vordergrund zu stellen, dass sein Unrecht nicht mehr benannt wird und die Betroffenen aus dem Blick geraten. Der gute Kern ist der Wunsch, keinen Menschen aufzugeben, doch Verstehen heißt nicht Verzeihen und erst recht nicht Beschönigen.",a:"Ein Mitschüler mobbt jemanden, und du sagst nur „er hat es zu Hause auch schwer“, statt klar zu sagen, dass Mobbing nicht in Ordnung ist.",f:"Wann hat dein Verständnis für einen Menschen dazu geführt, dass du sein Unrecht kleiner gemacht hast, als es war?"},
  zs:{d:"Entmenschlichung heißt, in einem Menschen, der Unrecht getan hat, nur noch die Tat zu sehen und ihm sein Menschsein abzusprechen. Sie beginnt mit der richtigen, entschiedenen Ablehnung des Unrechts, doch wer einen Menschen zum „Monster“ oder zu „Abschaum“ erklärt, öffnet neuem Unrecht die Tür.",a:"Unter einem Video über eine Straftat schreiben viele, man solle den Täter „entsorgen“, und du setzt ein Herz darunter.",f:"Woran merkst du, dass deine Ablehnung einer Tat in Verachtung für den Menschen umschlägt?"}},
 gerechtigkeit:{
  s:{d:"Barmherzigkeit heißt, die Not und die Lage eines Menschen zu sehen und ihm mehr Nachsicht zu geben, als ihm streng genommen zusteht.",f:"Wem könntest du mit mehr Nachsicht begegnen, als die Regeln verlangen?"},
  zv:{d:"Unerbittlichkeit heißt, nur noch Regeln zu sehen und keine Menschen mehr. Gut gemeint ist der Wunsch, alle gleich zu behandeln, doch es gibt keine Ausnahme, auch nicht für den, der gerade wirklich nicht konnte.",a:"Ein Mitschüler gibt seinen Teil zu spät ab, weil seine Oma gestorben ist, und du bestehst darauf, dass er genauso bewertet wird wie alle anderen.",f:"Wann war dir eine Regel wichtiger als der Mensch, um den es ging?"},
  zs:{d:"Willkür heißt, dass es nur von Laune oder Sympathie abhängt, wer Nachsicht bekommt und wer nicht. Dahinter steht der gute Wunsch, Menschen zu schonen, doch ohne gemeinsamen Maßstab.",a:"Du bist Schiedsrichterin beim Schulturnier und pfeifst ein Foul mal ab und mal nicht, je nachdem, wer dir gerade leidtut.",f:"Nach welchem Maßstab entscheidest du, wem du etwas durchgehen lässt?"}},
 toleranz:{
  s:{d:"Standfestigkeit heißt, bei deinen Überzeugungen zu bleiben und eine Grenze zu ziehen, wo andere herabgesetzt werden.",f:"Bei welcher Überzeugung möchtest du fester stehen, auch wenn Gegenwind kommt?"},
  zv:{d:"Gleichgültigkeit heißt hier, alles gelten zu lassen, auch wenn Menschen herabgesetzt werden. Der gute Kern ist der Wunsch, andere leben zu lassen, doch es fehlt die Grenze.",a:"In deinem Verein werden abfällige Witze über Geflüchtete gemacht, und du denkst: Jeder darf seine Meinung haben.",f:"Wo hast du etwas „toleriert“, das du eigentlich nicht hinnehmen wolltest?"},
  zs:{d:"Rechthaberei heißt, keinen anderen Standpunkt mehr gelten zu lassen und andere unbedingt bekehren zu wollen. Sie beginnt mit der guten Treue zu deinen Überzeugungen.",a:"Du diskutierst beim Familienessen so lange, bis die anderen nur noch schweigen.",f:"Woran merkst du, dass es dir nicht mehr um die Sache geht, sondern ums Rechtbehalten?"}},
 zivilcourage:{
  s:{d:"Besonnenheit heißt, in einer schwierigen Lage einen kühlen Kopf zu behalten und zu überlegen, was wirklich hilft.",f:"In welcher Lage hätte dir ein kurzer Moment des Überlegens geholfen?"},
  zv:{d:"Übereifer heißt, so hitzig einzugreifen, dass du die Lage verschärfst oder dich und andere in Gefahr bringst. Gut gemeint ist der Wille, Unrecht nicht hinzunehmen.",a:"Du gehst in der Bahn laut schreiend auf einen Pöbler los, statt die bedrängte Person anzusprechen und andere dazuzuholen.",f:"Woran merkst du, dass es dir beim Eingreifen mehr um deine Wut geht als um den Menschen, dem du helfen willst?"},
  zs:{d:"Wegschauen heißt, so lange abzuwägen, bis es zu spät ist, und den bedrängten Menschen allein zu lassen. Dahinter steht der verständliche Wunsch, nichts falsch zu machen.",a:"Jemand wird auf dem Schulhof herumgeschubst, und du überlegst so lange, was das Klügste wäre, bis es vorbei ist.",f:"Was sagst du dir, wenn du nicht eingreifst?"}},
 solidaritaet:{
  s:{d:"Eigenverantwortung heißt, dass jeder Mensch für sein Leben selbst einsteht und das auch kann. Du traust anderen zu, für sich zu sorgen.",f:"Wem würde es mehr helfen, wenn du ihm mehr zutraust?"},
  zv:{d:"Bevormundung heißt, für andere zu sprechen und zu entscheiden, statt mit ihnen. Der gute Kern ist das Einstehen für Menschen, denen es schlechter geht.",a:"Du gehst für eine Kollegin zum Chef, ohne vorher mit ihr gesprochen zu haben.",f:"Wann hast du zuletzt für jemanden gesprochen, ohne ihn zu fragen?"},
  zs:{d:"Ellenbogendenken heißt, dass nur noch zählt, dass du selbst durchkommst. Es wächst aus dem guten Glauben, dass jeder etwas aus sich machen kann, wenn dabei der Blick für die Schwächeren fehlt.",a:"Du sagst über jemanden ohne Arbeit: Selbst schuld, wer sich anstrengt, findet auch etwas.",f:"Wo denkst du „jeder ist für sich selbst verantwortlich“, obwohl jemand es gerade allein nicht schafft?"}},
 erinnerung:{
  s:{d:"Zuversicht heißt, darauf zu vertrauen, dass die Zukunft besser werden kann, und dafür nach vorn zu schauen.",f:"Was gibt dir Hoffnung, dass Menschen aus der Geschichte lernen können?"},
  zv:{d:"Lähmung im Gestern heißt, dass das Vergangene so schwer drückt, dass du nichts mehr anpackst. Gut gemeint ist der Wunsch, nichts zu vergessen, doch der Blick nach vorn fehlt.",a:"Nach einer Doku über die Verbrechen der Vergangenheit fühlst du dich tagelang ohnmächtig und denkst, es ändert sich ja doch nie etwas.",f:"Woran merkst du, dass dich die Vergangenheit lähmt, statt dich wach zu machen?"},
  zs:{d:"Schlussstrich heißt hier, das Vergangene einfach abzuhaken, als hätte es mit heute nichts mehr zu tun. Dahinter steht der gute Wunsch, nach vorn zu schauen, doch was nicht erinnert wird, kann sich wiederholen.",a:"Jemand sagt in der Klasse: Das ist doch ewig her, warum reden wir immer noch darüber?",f:"Welche Geschichte würdest du lieber abhaken, obwohl sie noch etwas mit heute zu tun hat?"}},
 gewaltfreiheit:{
  s:{d:"Wehrhaftigkeit heißt, dich und andere zu schützen und Unrecht nicht einfach geschehen zu lassen. Du setzt eine klare Grenze.",f:"Wo müsstest du dich deutlicher wehren, ohne selbst zu verletzen?"},
  zv:{d:"Hinnehmen von Unrecht heißt, geschehen zu lassen, was du verhindern könntest. Der gute Kern ist der Wunsch, Streit nicht anzuheizen.",a:"Jemand beleidigt dich immer wieder, und du lächelst es weg, damit es keinen Ärger gibt.",f:"Wann hast du Frieden gehalten, obwohl eigentlich Widerstand nötig gewesen wäre?"},
  zs:{d:"Gewaltbereitschaft heißt, zu Drohung, Druck oder Schlägen zu greifen, wodurch neues Unrecht entsteht. Sie beginnt mit dem richtigen Wunsch, sich und andere zu schützen.",a:"Du drohst im Chat, jemandem nach der Schule aufzulauern, weil er deinen Freund beleidigt hat.",f:"Woran merkst du, dass aus Verteidigung Vergeltung wird?"}},
 beteiligung:{
  s:{d:"Kompromissbereitschaft heißt, anderen entgegenzukommen, damit eine gemeinsame Lösung möglich wird. Du kannst auch mittragen, was nicht ganz deins ist.",f:"Wo könntest du einen Schritt auf andere zugehen, damit es gemeinsam weitergeht?"},
  zv:{d:"Dauerprotest heißt, gegen jede Lösung zu sein, die nicht genau deine ist. Gut gemeint ist der Wille, mitzugestalten und nicht alles hinzunehmen.",a:"In der Sitzung der Klassensprecher stimmst du gegen jeden Vorschlag, der nicht von dir kommt.",f:"Wann hast du zuletzt einer Lösung zugestimmt, die nicht deine eigene war?"},
  zs:{d:"Selbstaufgabe heißt, so oft nachzugeben, dass deine Anliegen gar nicht mehr vorkommen. Dahinter steht der gute Wunsch nach Einigung.",a:"Im Team sagst du nach dem ersten Widerspruch: Dann machen wir es halt so, wie ihr wollt.",f:"Wo hast du nachgegeben, obwohl dir die Sache eigentlich wichtig war?"}},
 genuegsamkeit:{
  s:{d:"Lebensfreude heißt, das Leben zu genießen und dich an schönen Dingen zu freuen. Dazu gehört auch, dir ab und zu etwas zu gönnen.",f:"Was hat dir zuletzt richtig Freude gemacht?"},
  zv:{d:"Verzichtszwang heißt, dir nichts mehr zu gönnen und streng auf andere zu schauen, die es anders machen. Der gute Kern ist der Wunsch, mit wenig auszukommen und die Welt zu schonen.",a:"Du kannst dich über ein Geschenk nicht freuen, weil du sofort denkst, dass man so etwas eigentlich nicht braucht.",f:"Wo ist dein Verzichten freudlos geworden?"},
  zs:{d:"Konsumrausch heißt, Freude vor allem im Kaufen und Haben zu suchen, bis sie immer kürzer wird. Er beginnt mit dem verständlichen Wunsch, dir etwas Schönes zu gönnen.",a:"Du bestellst nachts aus Langeweile etwas im Onlineshop und weißt am nächsten Tag kaum noch, was es war.",f:"Was suchst du eigentlich, wenn du etwas Neues kaufst?"}},
 zukunftsverantwortung:{
  s:{d:"Gegenwartsfreude heißt, dich am Hier und Jetzt zu freuen und das Leben heute zu genießen.",f:"Was würdest du heute genießen, wenn du nicht schon an morgen denken würdest?"},
  zv:{d:"Untergangsangst heißt, nur noch Katastrophen zu sehen und dabei die Kraft zum Handeln zu verlieren. Gut gemeint ist die Sorge um die, die nach uns kommen, doch für die Freude am Heute bleibt kein Platz.",a:"Du kannst einen Abend mit Freunden nicht genießen, weil du an die Klimakrise denkst, und fühlst dich danach nur hilflos.",f:"Woran merkst du, dass deine Sorge um die Zukunft dich lähmt, statt dich zu bewegen?"},
  zs:{d:"Sorglosigkeit heißt, die Folgen von heute nicht mehr zu bedenken, sodass andere später den Preis zahlen. Dahinter steht der gute Wunsch, das Leben jetzt zu genießen.",a:"Du sagst: Ob ich das Auto stehen lasse oder nicht, ist doch egal, und denkst nicht weiter darüber nach.",f:"Welche Entscheidung von heute würdest du anders treffen, wenn du ihre Folgen in dreißig Jahren sehen könntest?"}},
 ehrfurcht:{
  s:{d:"Pragmatismus heißt, dich danach zu richten, was im Alltag machbar ist und wirklich hilft. Du suchst Lösungen, die funktionieren.",f:"Wo würde dir eine praktische Lösung mehr helfen als ein hoher Anspruch?"},
  zv:{d:"Moralismus heißt, andere zu belehren und an deinem Maßstab zu messen. Der gute Kern ist der Schutz von Tieren und Pflanzen, doch der Blick für das Machbare geht verloren.",a:"Du hältst beim Essen einen Vortrag, weil jemand Fleisch bestellt hat.",f:"Wann wolltest du zuletzt andere bekehren, statt selbst ein Beispiel zu geben?"},
  zs:{d:"Rücksichtslosigkeit heißt hier, Tiere und Pflanzen nur noch als Mittel und Dinge zu sehen. Sie beginnt mit dem guten Blick für das, was praktisch ist und nützt.",a:"Du trittst eine Schnecke tot, weil sie im Weg ist, und denkst nicht weiter darüber nach.",f:"Welches Lebewesen behandelst du wie eine Sache, ohne es zu merken?"}},
 teilen:{
  s:{d:"Sorgfalt mit Eigentum heißt, deine Sachen zu schätzen und gut auf sie aufzupassen. Du weißt, was dir gehört, und gehst achtsam damit um.",f:"Was gehört dir, auf das du besser achtgeben möchtest?"},
  zv:{d:"Ausnutzbarkeit heißt, auch denen zu geben, die nur nehmen, bis dir selbst etwas fehlt. Gut gemeint ist die Großzügigkeit, doch sie kennt keine Grenze.",a:"Dein Mitbewohner isst ständig deine Vorräte auf, und du sagst nichts, weil man ja teilen soll.",f:"Bei wem gibst du, obwohl du spürst, dass es dir selbst nicht guttut?"},
  zs:{d:"Besitzdenken heißt, dass das Haben mehr zählt als das, was du mit anderen teilen könntest. Es wächst aus der guten Wertschätzung deiner Sachen.",a:"Dein Fahrrad steht seit Monaten im Keller, aber du willst es niemandem leihen.",f:"Was hältst du fest, obwohl jemand anderes es gerade besser gebrauchen könnte?"}},
 sorgfalt:{
  s:{d:"Loslassen heißt, dich von Dingen zu trennen, wenn ihre Zeit vorbei ist. Du erkennst, wann sich Pflege nicht mehr lohnt.",f:"Wovon könntest du dich trennen, weil seine Zeit vorbei ist?"},
  zv:{d:"Festhalten am Kaputten heißt, Dinge aufzuheben, die nicht mehr zu retten sind, bis sie dich belasten. Der gute Kern ist der Wunsch, nichts zu verschwenden.",a:"Dein Schrank ist voll mit Geräten, die du irgendwann reparieren willst, und du benutzt keins davon.",f:"Woran merkst du, dass sich das Reparieren nicht mehr lohnt?"},
  zs:{d:"Wegwerfmentalität heißt, wegzuwerfen, was mit wenig Aufwand noch lange halten würde. Dahinter steht der gute Wunsch nach Ordnung und Neuanfang.",a:"Das Handy hat einen Kratzer, und du willst sofort ein neues.",f:"Was hast du zuletzt weggeworfen, das noch zu retten gewesen wäre?"}},
 naturverbundenheit:{
  s:{d:"Sachlichkeit heißt, die Natur so zu sehen, wie sie ist, mit ihrer Schönheit und ihren Gefahren. Du kannst sie auch nüchtern betrachten, etwa wenn es um Wissen oder Nutzen geht.",f:"Wo würde dir ein nüchterner Blick auf die Natur helfen?"},
  zv:{d:"Romantisierung heißt, die Natur zu verklären und nur das Idyll zu sehen. Gut gemeint ist die Liebe zur Natur, doch du übersiehst, dass sie auch hart und gefährlich sein kann.",a:"Du fütterst die Enten im Park mit Brot, weil es sich schön anfühlt, und merkst nicht, dass es ihnen schadet.",f:"Welches Bild von der Natur hast du, das der Wirklichkeit vielleicht nicht standhält?"},
  zs:{d:"Entfremdung heißt, die Natur nur noch als Kulisse oder Rohstoff zu sehen und nicht mehr zu spüren, dass du selbst dazugehörst. Sie beginnt mit dem guten, klaren Blick, wenn ihm die Verbindung fehlt.",a:"Du warst seit Wochen nicht mehr im Grünen und weißt nicht, was für Bäume vor deinem Haus stehen.",f:"Wann hast du dich zuletzt als Teil der Natur gefühlt?"}},
 folgerichtigkeit:{
  s:{d:"Nachsicht mit dir heißt, dir zu verzeihen, wenn du hinter deinen eigenen Vorsätzen zurückbleibst. Du behandelst dich so freundlich wie einen guten Freund.",f:"Wofür könntest du heute Nachsicht mit dir haben?"},
  zv:{d:"Selbstgeißelung heißt, dich für jede Ausnahme von deinen Vorsätzen zu bestrafen. Der gute Kern ist der Wunsch, wirklich zu tun, was du für richtig hältst, doch dein Anspruch wird zur Last.",a:"Du hast einmal Fleisch gegessen, obwohl du vegetarisch leben willst, und machst dir den ganzen Abend Vorwürfe.",f:"Wie sprichst du mit dir, wenn du einen Vorsatz nicht schaffst?"},
  zs:{d:"Gemeint ist, dass du immer einen Grund findest, warum es diesmal nicht geht. Dahinter steht die gute Freundlichkeit dir selbst gegenüber, doch sie entschuldigt jede Lücke zwischen Wissen und Tun.",a:"Du wolltest das Rad nehmen und sagst dir zum dritten Mal: Heute ist es zu kalt.",f:"Welche Ausrede hörst du dich am häufigsten sagen?"}},
 weitherzigkeit:{
  s:{d:"Nähe zum Eigenen heißt, für die Menschen da zu sein, die direkt um dich sind: Familie, Freunde, Nachbarn. Dort kannst du am unmittelbarsten etwas bewirken.",f:"Wer in deiner Nähe bräuchte gerade deine Aufmerksamkeit?"},
  zv:{d:"Fernstenliebe ohne Nächstenliebe heißt, dich für Fremde in der Ferne einzusetzen und die Menschen neben dir zu übersehen. Gut gemeint ist die Sorge um die ganze Welt.",a:"Du teilst Spendenaufrufe für Menschen auf anderen Kontinenten, rufst aber deine kranke Oma nicht zurück.",f:"Wer in deiner Nähe kommt zu kurz, weil du an die große Welt denkst?"},
  zs:{d:"Engstirnigkeit heißt, dass nur noch zählt, wer zu dir gehört, und alle anderen dir egal sind. Sie wächst aus der guten Treue zu deinen Leuten, wenn der Blick nicht mehr über den eigenen Kreis hinausgeht.",a:"Du sagst: Was gehen mich die Arbeitsbedingungen in anderen Ländern an, Hauptsache, das T-Shirt ist billig.",f:"Wessen Not lässt dich kalt, nur weil er weit weg lebt?"}},
 wahrhaftigkeit:{
  s:{d:"Taktgefühl heißt, zu spüren, was ein anderer gerade verträgt, und eine Wahrheit so zu sagen, dass sie ankommen kann. Dazu gehört auch der richtige Moment.",f:"Welche Wahrheit möchtest du jemandem sagen, und wie könntest du sie taktvoll sagen?"},
  zv:{d:"Verletzende Offenheit heißt, die Wahrheit so hart, zur falschen Zeit oder vor anderen zu sagen, dass sie mehr verletzt als hilft. Der gute Kern ist der Wunsch, ehrlich zu sein.",a:"Du sagst deiner Freundin vor der ganzen Gruppe, dass ihr neuer Haarschnitt furchtbar aussieht.",f:"Woran merkst du, ob du ehrlich sein willst oder nur etwas loswerden musst?"},
  zs:{d:"Schönfärberei heißt, Dinge schöner zu machen, als sie sind, sodass der andere sich nicht nach der Wirklichkeit richten kann. Dahinter steht der gute Wunsch, niemanden zu verletzen.",a:"Du sagst einem Kollegen, sein Vortrag sei super gewesen, und er macht beim nächsten Mal denselben Fehler.",f:"Wo machst du etwas schöner, als es ist, und wem schadet das?"}},
 muendigkeit:{
  s:{d:"Lernbereitschaft heißt, offen zu sein für das, was andere wissen und dir beibringen können. Du nimmst Rat an, wenn er gut begründet ist.",f:"Von wem könntest du gerade etwas lernen?"},
  zv:{d:"Besserwisserei heißt, dein eigenes Urteil für das einzig richtige zu halten und anderen kaum noch zuzuhören. Gut gemeint ist der Wunsch, selbst zu denken.",a:"Du korrigierst im Gruppenchat jede Aussage und gibst nie zu, dass du dich geirrt hast.",f:"Wann hast du zuletzt gesagt: Das wusste ich nicht, danke?"},
  zs:{d:"Hörigkeit heißt, ohne eigenes Nachdenken zu übernehmen, was eine Person, eine Gruppe, ein Influencer oder eine Maschine sagt. Sie beginnt mit der guten Offenheit für das Wissen anderer.",a:"Du machst eine Diät nach, weil eine Influencerin sie empfiehlt, ohne zu prüfen, ob sie gesund ist.",f:"Wessen Meinung übernimmst du am schnellsten, und warum gerade diese?"}},
 differenzierung:{
  s:{d:"Entschiedenheit heißt, dich festzulegen und klar Stellung zu beziehen, wenn es darauf ankommt.",f:"Wo solltest du dich klar entscheiden, statt weiter abzuwägen?"},
  zv:{d:"Unentschiedenheit heißt, endlos abzuwägen und nie zu sagen, was du denkst, auch wenn eine klare Antwort nötig wäre. Der gute Kern ist der Wunsch, allen Seiten gerecht zu werden.",a:"Bei jeder Streitfrage sagst du „einerseits, andererseits“ und drückst dich so davor, Stellung zu beziehen.",f:"Wann hat dich das Abwägen davor bewahrt, Farbe bekennen zu müssen?"},
  zs:{d:"Schwarz-Weiß-Denken heißt, nur noch richtig und falsch, gut und böse zu kennen, sodass die Wirklichkeit zu einfach wird. Dahinter steht der gute Wunsch nach Klarheit.",a:"Nach einem Streit ist ein Mensch für dich plötzlich komplett unten durch, obwohl du ihn vorher mochtest.",f:"Wo würde ein „sowohl als auch“ der Sache besser gerecht als ein klares Ja oder Nein?"}},
 verantwortlichkeit:{
  s:{d:"Gnade mit dir heißt, dir einen Fehler zu vergeben, nachdem du ihn gesehen hast. Du kannst Verantwortung tragen, ohne dich daran aufzureiben.",f:"Für welchen Fehler könntest du inzwischen Gnade mit dir haben?"},
  zv:{d:"Ein Schuldkomplex bedeutet, dass du dir auch die Schuld an dem gibst, was du gar nicht beeinflussen konntest. Gut gemeint ist die Bereitschaft, für Folgen einzustehen, doch du fühlst dich für alles zuständig.",a:"Deine Eltern streiten sich, und du fragst dich, was du falsch gemacht hast.",f:"Welche Schuld trägst du mit dir herum, die eigentlich nicht deine ist?"},
  zs:{d:"Abschieben heißt, die Schuld bei anderen oder bei den Umständen zu suchen, sodass sich nichts ändert. Es beginnt mit dem guten Wunsch, dich nicht fertigzumachen.",a:"Die Gruppenarbeit ist schiefgegangen, und du erklärst sofort, dass die anderen nicht mitgezogen haben.",f:"Wann hast du zuletzt auf andere gezeigt, obwohl ein Teil bei dir lag?"}},
 neugier:{
  s:{d:"Skepsis heißt, nicht alles sofort zu glauben und nach Belegen zu fragen. Du prüfst, bevor du etwas für wahr hältst.",f:"Welche Behauptung, die du zuletzt gehört hast, würde eine genauere Prüfung verdienen?"},
  zv:{d:"Leichtgläubigkeit heißt, für wahr zu halten, was nur spannend klingt. Der gute Kern ist die Offenheit für Neues und Fremdes, doch es fehlt die Prüfung.",a:"Du glaubst ein Video über ein geheimes Heilmittel, weil es so überzeugend erzählt ist, und schickst es weiter.",f:"Woran erkennst du, dass du etwas glauben willst, weil es spannend ist, und nicht, weil es stimmt?"},
  zs:{d:"Zynismus heißt, alles für Lüge oder Eigennutz zu halten und gar nichts mehr verstehen zu wollen. Dahinter steht der gute Wunsch, dich nicht täuschen zu lassen.",a:"Bei jeder guten Nachricht sagst du: Da steckt doch eh nur Geld dahinter.",f:"Wo hast du aufgehört nachzufragen, weil du ohnehin das Schlechteste erwartest?"}},
 integritaet:{
  s:{d:"Lernfähigkeit heißt, dich von neuen Erfahrungen und guten Gründen verändern zu lassen. Du kannst deine Meinung ändern, ohne dich selbst zu verlieren.",f:"Wann hast du zuletzt deine Meinung geändert, und was hat dich überzeugt?"},
  zv:{d:"Sturheit heißt, an einer Haltung festzuhalten, auch wenn gute Gründe dagegen sprechen. Gut gemeint ist der Wunsch, dir treu zu bleiben.",a:"Du merkst mitten im Streit, dass der andere recht hat, und bleibst trotzdem bei deiner Meinung, weil du sie einmal gesagt hast.",f:"Woran merkst du, ob du einer Überzeugung treu bist oder nur nicht nachgeben willst?"},
  zs:{d:"Gemeint ist, dass du dich nach jeder neuen Meinung drehst, bis niemand mehr weiß, wofür du stehst. Gut gemeint ist die Offenheit für Neues, doch ihr fehlt ein fester Halt.",a:"Bei deinen Eltern vertrittst du eine Meinung und am Abend bei deinen Freunden das Gegenteil.",f:"Bei welchem Thema sagst du je nach Gruppe etwas anderes?"}},
 demut:{
  s:{d:"Urteilsvertrauen heißt, dich auf dein eigenes Urteil zu verlassen, wenn du gründlich nachgedacht hast. Du traust dir eine Entscheidung zu.",f:"Wo könntest du deinem Urteil mehr zutrauen, als du es gerade tust?"},
  zv:{d:"Lähmender Selbstzweifel heißt, dir gar kein Urteil mehr zuzutrauen und die Entscheidung anderen zu überlassen. Gut gemeint ist das Wissen, dass du dich irren kannst.",a:"Du weißt im Unterricht die Antwort, meldest dich aber nicht, weil du ja falschliegen könntest.",f:"Wann hat dein Zweifel dich zuletzt davon abgehalten, etwas Richtiges zu sagen?"},
  zs:{d:"Selbstüberschätzung heißt, keinen Irrtum mehr für möglich zu halten und Einwände zu überhören. Sie beginnt mit dem guten Vertrauen in dein eigenes Denken.",a:"Du gibst eine Hausarbeit ab, ohne sie noch einmal durchzulesen, weil du sicher bist, dass alles stimmt.",f:"Wann hast du dich zuletzt ganz sicher gefühlt und lagst trotzdem falsch?"}},
 fairness:{
  s:{d:"Parteinahme für Schwächere heißt, dich bewusst auf die Seite derer zu stellen, die weniger Macht oder weniger Stimme haben. Gleiche Regeln allein reichen nicht, wenn die Ausgangslage ungleich ist.",f:"Wer in deinem Umfeld hätte deine Unterstützung gerade besonders nötig?"},
  zv:{d:"Falsche Ausgewogenheit heißt, beide Seiten gleich zu behandeln, obwohl sie nicht gleich sind, etwa Täter und Opfer. Der gute Kern ist der Wunsch, niemanden zu bevorzugen.",a:"Ein großer Schüler schubst einen kleinen, und du sagst: Ihr seid beide schuld, vertragt euch.",f:"Wann hast du „beide Seiten“ gesagt, obwohl eine Seite klar im Unrecht war?"},
  zs:{d:"Einseitigkeit heißt, nur noch eine Seite zu sehen und die andere mit strengerem Maß zu messen. Dahinter steht der gute Einsatz für die, die es schwerer haben.",a:"In einem Streit glaubst du der einen Person alles, weil sie die Schwächere ist, und hörst die andere gar nicht erst an.",f:"Wen hörst du in einem Konflikt nicht mehr an, weil du schon weißt, auf welcher Seite du stehst?"}}
};
