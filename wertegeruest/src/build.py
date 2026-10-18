import datetime,zoneinfo,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
R=lambda f:open(f).read()
stamp=datetime.datetime.now(zoneinfo.ZoneInfo('Europe/Berlin')).strftime('%d.%m.%Y, %H:%M')
page=R('shell.html').replace('/*CSS*/',R('style.css')).replace('/*DATA*/',R('werte.js')+'\n'+R('impulse.js')+'\n'+R('ueben.js')).replace('/*MAIN*/',R('main.js')).replace('__BUILD__',stamp)
open('artifact.html','w').write(page)
U='https://wurstgott.github.io/fernweh/wertegeruest/'
D='Ein stabiles Gerüst aus eigenen Werten, Schritt für Schritt.'
head=f'''<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Wertegerüst"><link rel="apple-touch-icon" sizes="180x180" href="{U}apple-touch-icon.png"><meta property="og:image" content="{U}icon-512.png"><meta property="og:image:width" content="512"><meta property="og:image:height" content="512"><meta property="og:url" content="{U}"><meta property="og:type" content="website"><meta property="og:site_name" content="Wertegerüst"><meta name="twitter:card" content="summary"><link rel="manifest" href="manifest.json"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="theme-color" content="#0B0D10">
<meta name="description" content="{D}"><meta name="author" content="Carlo Maximilian Engeländer"><meta name="copyright" content="© 2026 Carlo Maximilian Engeländer. Alle Rechte vorbehalten.">
<meta property="og:title" content="Wertegerüst"><meta property="og:description" content="{D}">
<link rel="icon" type="image/png" sizes="192x192" href="{U}icon-192.png"><link rel="icon" type="image/png" sizes="512x512" href="{U}icon-512.png"><link rel="shortcut icon" href="{U}icon-192.png">
<style>:root{{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
'''
i=page.index('<div class="app"')
open('../index.html','w').write(head+page[:i]+'</head><body>'+page[i:]+'</body></html>')
print(stamp,len(page))
