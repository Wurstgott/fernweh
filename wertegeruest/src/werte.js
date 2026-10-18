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
 {id:"mut",cat:"selbst",n:"Mut",d:"Du tust, was du für richtig hältst, auch wenn du Angst hast.",s:"Vorsicht",zv:"Leichtsinn",zs:"Ängstlichkeit",f:"Welche Sache würdest du angehen, wenn die Angst nur halb so groß wäre?",b:"Du meldest dich in einer Besprechung mit einer unbequemen Frage."},
 {id:"mass",cat:"selbst",n:"Maß",d:"Du kennst dein Genug und hörst rechtzeitig auf.",s:"Genuss",zv:"Verbissenheit",zs:"Maßlosigkeit",f:"Wovon nimmst du regelmäßig mehr, als dir guttut?",b:"Du legst das Handy weg, obwohl der nächste Clip schon läuft."},
 {id:"freiheit",cat:"selbst",n:"Freiheit",d:"Du triffst deine Entscheidungen selbst und lässt dir nicht vorschreiben, wer du sein sollst.",s:"Verbindlichkeit",zv:"Bindungslosigkeit",zs:"Abhängigkeit",f:"Welche Entscheidung triffst du gerade eher, um anderen zu gefallen?",b:"Du wählst einen Weg, der zu dir passt, auch wenn deine Clique anders denkt."},
 {id:"disziplin",cat:"selbst",n:"Disziplin",d:"Du bleibst bei dem, was dir wichtig ist, auch wenn die Lust gerade fehlt.",s:"Leichtigkeit",zv:"Zwanghaftigkeit",zs:"Beliebigkeit",f:"Was würde sich ändern, wenn du eine Sache zwei Wochen lang jeden Tag tust?",b:"Du lernst zehn Minuten, obwohl du lieber etwas anderes machen würdest."},
 {id:"gelassenheit",cat:"selbst",n:"Gelassenheit",d:"Du unterscheidest, was du ändern kannst und was nicht, und regst dich nicht über alles auf.",s:"Engagement",zv:"Gleichgültigkeit",zs:"Getriebenheit",f:"Worüber ärgerst du dich, obwohl du es nicht ändern kannst?",b:"Du nimmst den verspäteten Zug hin und nutzt die Zeit."},
 {id:"wachstum",cat:"selbst",n:"Wachstum",d:"Du lernst dazu und lässt dich von Fehlern verändern.",s:"Zufriedenheit",zv:"Selbstoptimierung ohne Ende",zs:"Stillstand",f:"Was hast du im letzten Jahr über dich gelernt, das du vorher nicht wusstest?",b:"Du fragst nach einem Fehler: Was nehme ich daraus mit?"},
 {id:"echtheit",cat:"selbst",n:"Echtheit",d:"Du zeigst dich so, wie du bist, und spielst keine Rolle, die nicht zu dir passt.",s:"Anpassungsfähigkeit",zv:"Rücksichtslosigkeit",zs:"Verstellung",f:"Wo verstellst du dich, und was würde passieren, wenn du es nicht tätest?",b:"Du sagst, dass dir ein Film nicht gefallen hat, obwohl alle schwärmen."},
 /* Nähe */
 {id:"loyalitaet",cat:"naehe",n:"Loyalität",d:"Du stehst zu Menschen, die dir wichtig sind, auch wenn es unbequem wird.",s:"Kritikfähigkeit",zv:"Blinde Gefolgschaft",zs:"Nörgelei",f:"Wann ist Widerspruch die loyalere Antwort als Schweigen?",b:"Du verteidigst eine Freundin, die nicht im Raum ist."},
 {id:"fuersorge",cat:"naehe",n:"Fürsorge",d:"Du achtest darauf, wie es anderen geht, und kümmerst dich.",s:"Eigenständigkeit",zv:"Bevormundung",zs:"Kälte",f:"Wem würde eine kleine Geste von dir gerade guttun?",b:"Du rufst an, wenn jemand still geworden ist."},
 {id:"vertrauen",cat:"naehe",n:"Vertrauen",d:"Du gehst davon aus, dass andere es gut meinen, solange nichts dagegen spricht.",s:"Wachsamkeit",zv:"Naivität",zs:"Misstrauen",f:"Wem traust du weniger zu, als er vermutlich verdient?",b:"Du leihst etwas aus, ohne Bedingungen zu stellen."},
 {id:"vergebung",cat:"naehe",n:"Vergebung",d:"Du lässt eine Kränkung los, damit sie dein Leben nicht weiter bestimmt.",s:"Konsequenz",zv:"Nachgiebigkeit",zs:"Unversöhnlichkeit",f:"Welche alte Kränkung trägst du noch mit dir herum?",b:"Du sagst: Es hat wehgetan, und ich will es nicht länger nachtragen."},
 {id:"offenheit",cat:"naehe",n:"Offenheit",d:"Du lässt andere wissen, was in dir vorgeht.",s:"Zurückhaltung",zv:"Distanzlosigkeit",zs:"Verschlossenheit",f:"Was hast du einem nahen Menschen lange nicht gesagt?",b:"Du sagst einem Freund, dass dich sein Kommentar getroffen hat."},
 {id:"dankbarkeit",cat:"naehe",n:"Dankbarkeit",d:"Du bemerkst, was andere für dich tun, und sagst es ihnen.",s:"Selbstbehauptung",zv:"Unterwürfigkeit",zs:"Anspruchsdenken",f:"Wem hast du nie richtig gedankt?",b:"Du schreibst einer Lehrerin von früher, was sie dir bedeutet hat."},
 {id:"verlaesslichkeit",cat:"naehe",n:"Verlässlichkeit",d:"Du hältst, was du zusagst, und andere können mit dir rechnen.",s:"Flexibilität",zv:"Starrheit",zs:"Unzuverlässigkeit",f:"Welche Zusage hast du zuletzt leichtfertig gegeben?",b:"Du kommst pünktlich, auch wenn es nur ein lockeres Treffen ist."},
 {id:"zuwendung",cat:"naehe",n:"Zuwendung",d:"Du schenkst anderen deine ungeteilte Aufmerksamkeit und Zeit.",s:"Eigenraum",zv:"Klammern",zs:"Abschottung",f:"Wann hast du zuletzt zugehört, ohne nebenbei aufs Handy zu schauen?",b:"Du legst beim Gespräch das Handy umgedreht weg."},
 /* Miteinander */
 {id:"wuerde",cat:"miteinander",n:"Würde",d:"Jeder Mensch hat einen Wert, den ihm niemand nehmen kann, auch nicht durch das, was er tut.",s:"Klarheit gegenüber Unrecht",zv:"Verharmlosung",zs:"Entmenschlichung",f:"Wie kannst du einer Tat entschieden entgegentreten, ohne den Menschen aufzugeben?",b:"Du kritisierst eine Aussage scharf, ohne die Person zu beschimpfen.",fund:true},
 {id:"gerechtigkeit",cat:"miteinander",n:"Gerechtigkeit",d:"Du willst, dass alle bekommen, was ihnen zusteht, und dass gleiche Fälle gleich behandelt werden.",s:"Barmherzigkeit",zv:"Unerbittlichkeit",zs:"Willkür",f:"Wo nimmst du eine Ungerechtigkeit hin, weil sie dich selbst nicht trifft?",b:"Du achtest darauf, dass in der Gruppe nicht immer dieselben die Arbeit machen."},
 {id:"toleranz",cat:"miteinander",n:"Toleranz",d:"Du lässt andere anders leben und denken, auch wenn es dir fremd ist.",s:"Standfestigkeit",zv:"Gleichgültigkeit",zs:"Rechthaberei",f:"Wo endet für dich Toleranz, und warum genau dort?",b:"Du fragst nach, statt eine fremde Lebensweise abzuwerten."},
 {id:"zivilcourage",cat:"miteinander",n:"Zivilcourage",d:"Du greifst ein, wenn jemand herabgesetzt oder bedroht wird.",s:"Besonnenheit",zv:"Eiferertum",zs:"Wegschauen",f:"Was würdest du konkret tun, wenn in der Bahn jemand beleidigt wird?",b:"Du sprichst eine Person an, die bedrängt wird, und holst andere dazu."},
 {id:"solidaritaet",cat:"miteinander",n:"Solidarität",d:"Du stehst Menschen bei, denen es schlechter geht, auch wenn du sie nicht kennst.",s:"Eigenverantwortung",zv:"Bevormundung",zs:"Ellenbogendenken",f:"Für wen setzt du dich ein, der dir nichts zurückgeben kann?",b:"Du unterstützt eine Kollegin, die zu Unrecht kritisiert wird."},
 {id:"erinnerung",cat:"miteinander",n:"Erinnerung",d:"Du hältst wach, was Menschen anderen angetan haben, damit es sich nicht wiederholt.",s:"Zuversicht",zv:"Lähmung im Gestern",zs:"Schlussstrich",f:"Wessen Geschichte möchtest du nicht vergessen?",b:"Du bleibst an einem Stolperstein stehen und liest den Namen."},
 {id:"gewaltfreiheit",cat:"miteinander",n:"Gewaltfreiheit",d:"Du löst Konflikte ohne Gewalt in Wort und Tat.",s:"Wehrhaftigkeit",zv:"Hinnehmen von Unrecht",zs:"Gewaltbereitschaft",f:"Wie setzt du eine klare Grenze, ohne selbst zu verletzen?",b:"Du sagst ruhig und deutlich Stopp, statt zurückzuschreien."},
 {id:"beteiligung",cat:"miteinander",n:"Beteiligung",d:"Du gestaltest mit, statt nur zuzuschauen, wie über dich entschieden wird.",s:"Kompromissbereitschaft",zv:"Dauerprotest",zs:"Selbstaufgabe",f:"Wo könntest du mitreden, tust es aber nicht?",b:"Du gehst wählen und informierst dich vorher."},
 /* Welt */
 {id:"genuegsamkeit",cat:"welt",n:"Genügsamkeit",d:"Du brauchst nicht alles, was du haben könntest.",s:"Lebensfreude",zv:"Verzichtsdogmatik",zs:"Konsumrausch",f:"Was hast du zuletzt gekauft, das du schon nach einer Woche nicht mehr gebraucht hast?",b:"Du leihst die Bohrmaschine, statt eine zu kaufen."},
 {id:"zukunftsverantwortung",cat:"welt",n:"Verantwortung für Kommende",d:"Du handelst so, dass auch Menschen nach dir gut leben können.",s:"Gegenwartsfreude",zv:"Untergangsangst",zs:"Sorglosigkeit",f:"Was würde ein Kind, das 2060 erwachsen ist, dich heute fragen?",b:"Du wählst bei einer großen Anschaffung das langlebigere Modell."},
 {id:"ehrfurcht",cat:"welt",n:"Ehrfurcht vor dem Leben",d:"Du achtest Tiere und Pflanzen als Lebewesen, nicht nur als Dinge.",s:"Pragmatismus",zv:"Moralismus",zs:"Rücksichtslosigkeit",f:"Welches Lebewesen nimmst du kaum noch wahr, obwohl es dich täglich umgibt?",b:"Du trägst eine Spinne nach draußen, statt sie zu erschlagen."},
 {id:"teilen",cat:"welt",n:"Teilen",d:"Du nutzt Dinge gemeinsam und gibst ab, was andere brauchen.",s:"Sorgfalt mit Eigentum",zv:"Ausnutzbarkeit",zs:"Besitzdenken",f:"Was besitzt du, das in deinem Umfeld jemand gut gebrauchen könnte?",b:"Du stellst Bücher in den öffentlichen Bücherschrank."},
 {id:"sorgfalt",cat:"welt",n:"Sorgfalt",d:"Du pflegst und reparierst, was du hast, statt es schnell zu ersetzen.",s:"Loslassen",zv:"Festhalten am Kaputten",zs:"Wegwerfmentalität",f:"Was könnte mit etwas Pflege noch Jahre halten?",b:"Du nähst den Knopf an, statt das Hemd auszusortieren."},
 {id:"naturverbundenheit",cat:"welt",n:"Naturverbundenheit",d:"Du fühlst dich als Teil der Natur und suchst ihre Nähe.",s:"Weltoffenheit",zv:"Romantisierung",zs:"Entfremdung",f:"Wann warst du zuletzt draußen, ohne ein Ziel zu haben?",b:"Du gehst den Umweg durch den Park."},
 {id:"folgerichtigkeit",cat:"welt",n:"Folgerichtigkeit",d:"Du tust, was du für richtig erkannt hast, statt es nur zu wissen.",s:"Nachsicht mit dir",zv:"Selbstgeißelung",zs:"Ausreden",f:"Wo klaffen dein Wissen und dein Tun am weitesten auseinander?",b:"Du nimmst den Zug, obwohl der Flug billiger wäre, weil du es dir vorgenommen hast."},
 {id:"weitherzigkeit",cat:"welt",n:"Weitherzigkeit",d:"Dir sind auch Menschen wichtig, die weit weg leben und die du nie treffen wirst.",s:"Nähe zum Eigenen",zv:"Fernstenliebe ohne Nächstenliebe",zs:"Engstirnigkeit",f:"Wie weit reicht der Kreis der Menschen, für die du dich verantwortlich fühlst?",b:"Du achtest beim Kaufen darauf, unter welchen Bedingungen etwas hergestellt wurde."},
 /* Urteil */
 {id:"wahrhaftigkeit",cat:"urteil",n:"Wahrhaftigkeit",d:"Du sagst, was du für wahr hältst, und verdrehst nichts zu deinem Vorteil.",s:"Taktgefühl",zv:"Verletzende Offenheit",zs:"Schönfärberei",f:"Welche Wahrheit vermeidest du gerade, und wem würde sie helfen?",b:"Du gibst zu, dass du etwas vergessen hast, statt eine Ausrede zu erfinden."},
 {id:"muendigkeit",cat:"urteil",n:"Mündigkeit",d:"Du denkst selbst, bevor du übernimmst, was andere, Medien oder Maschinen dir sagen.",s:"Lernbereitschaft",zv:"Besserwisserei",zs:"Hörigkeit",f:"Welche Meinung hast du übernommen, ohne sie je geprüft zu haben?",b:"Du liest nach, bevor du eine Behauptung weitererzählst."},
 {id:"differenzierung",cat:"urteil",n:"Differenzierung",d:"Du siehst Zwischentöne und bildest dir ein Urteil, das der Wirklichkeit gerecht wird.",s:"Entschiedenheit",zv:"Beliebigkeit",zs:"Schwarz-Weiß-Denken",f:"Wo urteilst du schnell, obwohl die Lage verwickelter ist?",b:"Du sagst: In diesem Punkt hast du recht, in jenem nicht."},
 {id:"verantwortlichkeit",cat:"urteil",n:"Verantwortlichkeit",d:"Du stehst für die Folgen deines Handelns ein, auch für die unbeabsichtigten.",s:"Gnade mit dir",zv:"Schuldkomplex",zs:"Abschieben",f:"Wofür könntest du heute Verantwortung übernehmen, statt auf andere zu zeigen?",b:"Du sagst: Das war mein Fehler, ich kümmere mich darum."},
 {id:"neugier",cat:"urteil",n:"Neugier",d:"Du willst verstehen, auch das, was dir fremd ist oder nicht gefällt.",s:"Skepsis",zv:"Leichtgläubigkeit",zs:"Zynismus",f:"Was möchtest du über einen Menschen verstehen, den du nicht magst?",b:"Du fragst jemanden mit anderer Meinung, wie er dazu gekommen ist."},
 {id:"integritaet",cat:"urteil",n:"Integrität",d:"Deine Worte und Taten passen zusammen, auch wenn niemand hinschaut.",s:"Lernfähigkeit",zv:"Sturheit",zs:"Fähnchen im Wind",f:"Wo handelst du anders, wenn du dich unbeobachtet fühlst?",b:"Du gibst zu viel erhaltenes Wechselgeld zurück."},
 {id:"demut",cat:"urteil",n:"Erkenntnisdemut",d:"Du rechnest damit, dass du dich irren kannst, und bleibst offen für Gründe.",s:"Urteilsvertrauen",zv:"Lähmender Selbstzweifel",zs:"Selbstüberschätzung",f:"Bei welcher Überzeugung wärst du bereit, dich vom Gegenteil überzeugen zu lassen?",b:"Du sagst: Da könnte ich falschliegen, lass uns nachsehen."},
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
 {t:"Ich höre gern zu, auch wenn jemand ganz anders denkt als ich.",w:["offenheit","toleranz"]},
 {t:"Ich bewundere Menschen, die auch ihren Gegnern mit Respekt begegnen.",w:["weitherzigkeit","gewaltfreiheit"]},
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
 {t:"Bevor ich etwas weitererzähle, prüfe ich, ob es stimmt.",w:["differenzierung","wahrhaftigkeit"]},
 {t:"Mich berührt, wie viel Leben in einer Wiese oder einem Wald steckt.",w:["ehrfurcht","naturverbundenheit"]},
 {t:"Ich kaufe lieber weniger und dafür bewusster.",w:["genuegsamkeit","folgerichtigkeit"]},
 {t:"Was ich sage und was ich tue, soll zusammenpassen.",w:["integritaet","folgerichtigkeit"]},
 {t:"Ich weiß, dass ich mich irren kann, und höre deshalb auch Gegenargumente an.",w:["demut","toleranz"]},
 {t:"Es macht mich zornig, wenn Menschen in Not allein gelassen werden.",w:["solidaritaet","fuersorge"]},
 {t:"Ich behandle Menschen gleich, egal ob ich sie mag oder nicht.",w:["fairness","gerechtigkeit"]},
 {t:"Ich lerne gern aus Fehlern, statt sie zu verstecken.",w:["wachstum","verantwortlichkeit"]},
 {t:"Wenn jemand krank ist oder traurig, melde ich mich.",w:["fuersorge","zuwendung"]}
];
