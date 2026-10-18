# Wertegerüst – Übergabe für einen neuen Chat

Stand: 18. Oktober 2026. Diese Datei fasst alles zusammen, was ein neuer Chat braucht, um am Wertegerüst nahtlos weiterzuarbeiten.

## Worum es geht

Das Wertegerüst ist eine kostenlose Web-App von Carlo Maximilian Engeländer. Man baut sich darin Schritt für Schritt ein stabiles Gerüst aus eigenen Werten auf, das Klarheit und Selbstvertrauen gibt, auch wenn man zwischen Werten hin- und hergerissen ist. Der Anlass war ein Besuch in Auschwitz als Lehrer. Die Frage dahinter lautet: Wie kann ich etwas entschieden ablehnen, ohne den Menschen dahinter zu entmenschlichen? Zentrale Gedanken sind „Verstehen heißt nicht Verzeihen“, „Würde ist unantastbar“, „Harmonie heißt nicht, das Störende zu beseitigen“ und Zorn als Grenze, die den Menschen nicht aufgibt.

Zielgruppe sind Schülerinnen und Schüler und alle anderen. Die App soll durch regelmäßige Nutzung stabilisieren, nicht nur informieren. Sie ist die Schwester-App zum Glückskompass (gleiches Niveau, aber bewusst eigenes Design).

- Live: https://wurstgott.github.io/fernweh/wertegeruest/
- Repository: Wurstgott/fernweh, Ordner `wertegeruest/`
- Quellcode: `wertegeruest/src/`
- Rechte: alle Rechte vorbehalten, siehe `LICENSE` im Repository-Hauptordner

## Arbeitsweise, die Carlo sich wünscht

- Antworten auf Deutsch in einfachen, ganzen Sätzen. Keine Satzfragmente, kein Pathos, nichts Kitschiges.
- Nur ändern, was er verlangt. Wenn ihm etwas nicht gefällt, schnell zurückbauen.
- Jede Änderung veröffentlichen: auf GitHub pushen und warten, bis GitHub Pages fertig ist. Der Versionsstempel aktualisiert sich beim Bauen von selbst.
- Kurz berichten, nach Funktionen gegliedert.
- Ruhige Ästhetik: Dauerbewegung nur beim Hauptelement (hier der schimmernde nächste Stab). Alles andere leuchtet nur als Antwort auf Berührung auf. Matt und flach, keine glänzenden Kugeln, keine plötzlichen Größen-Sprünge.
- Er testet auf dem iPhone und diktiert oft. Tippfehler sinnvoll deuten.

## Aufbau des Codes

Die App ist eine einzige HTML-Datei ohne Abhängigkeiten. `src/build.py` setzt sie zusammen:

- `shell.html`: Grundgerüst mit Kopfzeile, Hauptbereich und Reiterleiste, Platzhalter `/*CSS*/`, `/*DATA*/`, `/*MAIN*/`.
- `style.css`: das gesamte Design. Dunkel ist Standard, Hell gibt es als Schalter in den Einstellungen. Schriften: Bricolage Grotesque (Überschriften), Work Sans (Text), JetBrains Mono (kleine Etiketten).
- `werte.js`: `CATS` (fünf Bereiche Selbst, Nähe, Miteinander, Welt, Urteil), `EV` (Belegstufen), `WERTE` (40 Werte mit Wertequadrat: Schwester, Zuviel, Leitfrage, Beispiel; Würde ist als Fundament markiert) und `SAETZE` (35 alltägliche Sätze für „Werte finden“, je mit Haupt- und Nebenwert).
- `impulse.js`: `IMPULSE`, 61 kurze Gedanken mit geprüften Quellen und Belegstufe.
- `ueben.js`: `PROBEN` (24 Belastungsproben mit Optionen, die je Werte stärken) und `UEBUNGEN` (25 Übungen).
- `main.js`: die gesamte Logik.

Bauen: `cd wertegeruest/src && python3 build.py`. Das schreibt `../index.html` (die echte App mit PWA-Kopf) und `artifact.html` (für eine Vorschau, nicht im Repository).

Testen: `wgtest.py` ist ein Playwright-Durchlauf in Hell und Dunkel. `wgfonts.py` bindet lokale Schriften ein; die Pfade dort müssen an die neue Umgebung angepasst werden.

## Die Logik (bewusst komplex, so soll es bleiben)

- **Stützen:** Man wählt bis zu fünf Werte. Die Würde ist in jedem Gerüst als Fundament schon eingebaut.
- **Fünf Bauteile pro Stütze:** gewählt, Leitsatz formuliert, in einer Belastungsprobe geprüft (eine gewählte Option enthält den Wert), in einer Übung gelebt (Übung zum Wert oder zum selben Bereich geschafft), Leitsatz zweimal bekräftigt. Höchstens 25 Bauteile.
- **Festigen:** Leitsätze werden nach 2, 7, 21, 60 und 150 Tagen erneut abgefragt („Stehst du noch dazu?“).
- **Spannseile:** Wählt man in einer Probe eine Option mit Wert A, während eine andere Option Wert B enthielt, und sind A und B beide Stützen, entsteht ein farbiges Spannseil zwischen ihnen.
- **Nächster Schritt:** Die Startseite zeigt immer genau einen konkreten nächsten Schritt.
- **Neue Bauteile:** `save()` vergleicht die Stufen mit dem letzten Stand (`S.lv`) und merkt neue Teile in `S.fresh`. Auf der Startseite zeichnet sich jeder neue Stab ein und leuchtet kurz auf.
- **Werte finden (geführt statt Liste):** erstens 35 alltägliche Sätze mit „Stimmt / Teils / Eher nicht“ bewerten (ab 18 kann man weiter), zweitens die acht stärksten Werte paarweise abwägen, drittens bis zu fünf auswählen, jeweils mit dem Satz, aus dem der Wert kam. Die Liste aller Werte gibt es zusätzlich unter „Werte“.
- **Reiter:** Gerüst (Start), Impulse, Üben (Proben und Übungen), Werte.
- **Weiteres:** Impuls und Probe des Tages, besondere Gedenktage, Momente (selten und nüchtern), Bautagebuch, Teilen von App, Impuls, Probe und Übung per Link (`#i-`, `#p-`, `#u-`), Kalender-Erinnerungen, Selbst-Aktualisierung über den `BUILD`-Stempel, Hinweis gegen Endlos-Lesen.
- **Speicher:** Alles liegt in `localStorage` unter dem Schlüssel `wertegeruest-v1`. Es gibt keinen Server.

## Das Design des Gerüsts (entschieden nach mehreren Runden)

Die Form ist eine Tensegrity-Wolke. Jedes Bauteil ist ein farbiger Stab, verteilt nach dem goldenen Winkel (Platz n = Stufe × 5 + Stütze). Die Stäbe überlagern sich zu einer runden Wolke, feine Seile zwischen benachbarten Stabenden halten sie, und drei Seile verbinden sie mit dem Fundament „Würde“. Begründung: Bei einer Tensegrity trägt Spannung das Ganze. Genau das ist die Idee der App, dass Werte in Spannung zueinander stehen dürfen und gerade das stabil macht.

Verworfen wurden der Glückskompass-Stil (zu ähnlich), schlichte weiße Blöcke (zu technisch, Schrift zu schmal) und senkrechte Stab-Türme (wirkten instabil und chaotisch).

## Veröffentlichen

1. `python3 build.py` im Ordner `src`.
2. Committen und auf `main` pushen. Commit-Nachrichten auf Deutsch.
3. Auf GitHub Pages warten, zum Beispiel mit `gh run list`.
4. Die App lädt neue Versionen auf dem iPhone von selbst.

## Offene Ideen

- Carlo prüft die Tensegrity-Wolke noch auf dem iPhone.
- Kalender-Erinnerungen funktionieren in der GitHub-Version, nicht in einer Vorschau ohne Download-Rechte.
