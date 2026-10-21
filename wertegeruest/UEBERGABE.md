# Wertegerüst – Übergabe für einen neuen Chat

Stand: 20. Oktober 2026. Diese Datei fasst alles zusammen, was ein neuer Chat braucht, um am Wertegerüst nahtlos weiterzuarbeiten.

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
- Jede Änderung veröffentlichen: bauen, auf Deutsch committen, auf `main` pushen und warten, bis GitHub Pages fertig ist.
- Größere Änderungen vorher unabhängig gegen die veröffentlichte Version prüfen lassen (eigener Prüf-Agent, der nicht mitgebaut hat). Veröffentlicht wird nur, was nachweislich besser ist. Gleichwertiges bleibt draußen.
- Er mag Abläufe mit mehreren Agenten (Wettbewerbe, Jury, unabhängige Prüfer, Testpersonen) und Screenshots zwischen den Runden.
- Kurz berichten, nach Funktionen gegliedert.
- Ruhige Ästhetik: Dauerbewegung nur beim schimmernden nächsten Stab. Alles andere antwortet nur auf Berührung. Matt und flach, keine glänzenden Kugeln, keine plötzlichen Größensprünge. Kein Wackeln der Stäbe.
- Er testet auf dem iPhone und diktiert oft. Tippfehler sinnvoll deuten.

## Aufbau des Codes

Die App ist eine einzige HTML-Datei ohne Abhängigkeiten. `src/build.py` setzt sie zusammen und setzt den Versionsstempel `BUILD`, über den sich die App selbst aktualisiert:

- `shell.html`: Grundgerüst mit Kopfzeile, Hauptbereich und Reiterleiste, Platzhalter `/*CSS*/`, `/*DATA*/`, `/*MAIN*/`.
- `style.css`: das gesamte Design. Farbkonzept „Zwischentöne“: dunkler Verlauf #1D2850 → #29284A → #3A2B33, hell #E1E6F1 → #F2E5D3, warmer Pol #D9AE96 (hell #9A6F5A), Bereichsfarben als `--c-*`. Schriften: Bricolage Grotesque, Work Sans, JetBrains Mono.
- `werte.js`: `CATS` (fünf Bereiche), `EV` (Belegstufen), `WERTE` (40 Werte mit Wertequadrat), `QUAD` (Erklärungen zum Wertequadrat), `SAETZE` (41 Sätze für „Werte finden“).
- `impulse.js`: `IMPULSE`, 61 kurze Gedanken mit geprüften Quellen und Belegstufe.
- `ueben.js`: `PROBEN` (Belastungsproben) und `UEBUNGEN` (45 Übungen, jeder der 40 Werte hat mindestens eine). Jede Übung hat `p`, die Aufforderung für das Plan-Feld. IDs nie ändern, neue Übungen hinten anhängen.
- `personal.js`: Personalisierung (`PERSONAL_FRAGEN`, `ROLLEN` mit grammatischen Formen, `KONTEXTE`, `VARIANTEN`, `personalisiere`, `personalisiereUebung`). Übungen werden über wörtliche Textstellen (`ersetze`) angepasst, nicht über Indizes. Ohne Profil bleiben alle Texte neutral.
- `main.js`: die gesamte Logik.
- Icons: `icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `icon-maskable-512.png` (Motiv „Gegenüber“: zwei Stäbe lehnen sich zu, ein warmer Faden hält sie, beide stehen auf der Würde-Linie; per Blindtest mit drei Juroren gegen sechs Entwürfe gewählt; auch als `LOGO` in der Kopfzeile).

Bauen: `cd wertegeruest/src && python3 build.py`. Das schreibt `../index.html` und `artifact.html` (Vorschau, nicht im Repository).

Testen: Playwright mit Chromium und iPhone-15-Profil, echte Taps, Zeitsprünge über verschobenes `Date`. Schriften per Route auf lokale TTFs umleiten. Wichtig ist immer der Test mit einem alten Speicherstand: Es darf kein Bauteil verloren gehen.

## Die Logik (bewusst komplex, so soll es bleiben)

- **Stützen:** bis zu fünf Werte. Die Würde ist in jedem Gerüst als Fundament schon da. Ein freier Platz lässt sich direkt antippen und füllen.
- **Fünf Bauteile pro Stütze:** gewählt, Leitsatz formuliert, in einer Belastungsprobe geprüft, in einer Übung gelebt, Leitsatz zweimal bekräftigt. Höchstens 25.
- **Gelebt:** Beim Annehmen einer Übung wählt man die Stütze, für die man sie macht. Nur diese bekommt das Bauteil. Alte Abschlüsse zählen nach der alten Regel weiter (Wert und Bereich von damals sind festgehalten). Ein erreichtes Bauteil wird nie entzogen.
- **Übungen begleiten:** Plan-Feld auf der Karte, Tageseintrag „Gemacht / Keine Gelegenheit / Diesmal nicht“, geschafft ab etwa 70 % der Tage. `EINMAL`: ein „Gemacht“ genügt. `GELEG`: „Keine Gelegenheit“ zählt nicht dagegen. `FREIWERT`: Wert der Übung ist die gewählte Stütze. „Noch einmal“ behält den Verlauf (`runs`), „Beibehalten“ lässt eine Übung ohne Frist laufen. Kalender-Erinnerung mit wählbarer Uhrzeit.
- **Festigen:** Leitsätze werden nach 2, 7, 21, 60 und 150 Tagen erneut abgefragt.
- **Spannseile:** entstehen, wenn man in einer Probe zwischen zwei eigenen Stützen abwägt.
- **Nächster Schritt:** Die Startseite zeigt immer genau einen. Höchstens einmal am Tag fragt er nach einer laufenden Übung, sonst bleibt der Aufbauschritt.
- **Wertequadrat:** antippbare Begriffe mit Erklärung, Doppellinie für Balance, gestrichelt für „kippt ab“, Pfeile für den Weg heraus.
- **Abwählen und Rückgängig:** Erneutes Tippen wählt ab. Folgenreiche Schritte zeigen 6 Sekunden lang „Rückgängig“.
- **Haptik:** iOS über einen unsichtbaren Schalter in jedem Tippelement, Android über `navigator.vibrate`. Klickfamilien in `FAM`. Alles aus bei „Bewegung reduzieren“ und über die Einstellung „Vibration“.
- **Speicher:** `localStorage`, Schlüssel `wertegeruest-v1`. Kein Server. Neue Felder immer optional, alte Stände dürfen nie brechen.

## Das Design des Gerüsts (entschieden nach mehreren Runden)

Die Form ist eine Tensegrity-Wolke. Jedes Bauteil ist ein farbiger Stab, verteilt nach dem goldenen Winkel. Feine Seile halten die Wolke, drei nicht kreuzende Seile verbinden sie mit der warmen Linie „Würde · Fundament“. Antippen eines Stabs lässt die Seile einmal aufleuchten, die Stäbe bewegen sich nicht.

Verworfen wurden: Glückskompass-Stil, weiße Blöcke, Stab-Türme, Gerüstturm, Haus-Skelettbau und Abbund (Wettbewerb mit fünf Büros), das Würde-Band, ein Fundament als Platte oder mit Fußplatten (unabhängig geprüft, nicht besser).

## Veröffentlichen

1. `python3 build.py` im Ordner `src`.
2. Committen und auf `main` pushen. Commit-Nachrichten auf Deutsch.
3. Auf GitHub Pages warten, zum Beispiel mit `gh run list`.
4. Die App lädt neue Versionen auf dem iPhone von selbst.

## Offene Ideen

- Auf dem iPhone prüfen, ob das Zeitfeld der Erinnerung 19:00 im deutschen Format zeigt.
- Die Übungsbegleitung braucht etwas mehr Tipps als früher. Bei Gelegenheit vereinfachen, ohne die Ehrlichkeit des Abschlusses zu verlieren.
