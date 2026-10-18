exec(open('/tmp/claude-0/sc/wgfonts.py').read())
from playwright.sync_api import sync_playwright
import time,json
O='/tmp/claude-0/sc/wg/'
def dismiss(pg):
  time.sleep(1.9)
  for _ in range(3):
    if pg.query_selector('#mok'): pg.click('#mok');time.sleep(.5)
    if pg.query_selector('#shx2'): pg.click('#shx2');time.sleep(.4)
    if pg.query_selector('#shx'): pg.click('#shx');time.sleep(.4)
def C(pg,sel,**k):
  for i in range(6):
    if pg.query_selector('.moment #mok'):
      pg.click('.moment #mok');time.sleep(.5)
    try:
      pg.click(sel,timeout=1500,**k);return
    except Exception as ex:
      time.sleep(.6)
  raise Exception('click failed '+sel)
def tab(pg,t): C(pg,f'nav.tabs [data-tab={t}]');time.sleep(.7)
with sync_playwright() as p:
  b=p.chromium.launch()
  for th in ('dunkel','hell'):
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,accept_downloads=True);pg=ctx.new_page()
    e=[];pg.on('pageerror',lambda x:e.append(str(x)));pg.on('console',lambda m:m.type=='error' and e.append(m.text))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(status=200,content_type='text/css',body=css))
    if th=='hell': pg.add_init_script("if(!localStorage.getItem('wertegeruest-v1'))localStorage.setItem('wertegeruest-v1',JSON.stringify({settings:{theme:'hell'}}))")
    pg.goto('file:///home/claude/fernweh-repo/wertegeruest/index.html');time.sleep(1.4)
    pg.screenshot(path=O+f'{th}_welcome.png');dismiss(pg)
    pg.screenshot(path=O+f'{th}_home0.png',full_page=True)
    for wid in ['wahrhaftigkeit','mut','gerechtigkeit','fuersorge','genuegsamkeit']:
      tab(pg,'werte');pg.evaluate(f"document.querySelector('.wli[data-wert={wid}]').click()");time.sleep(.6)
      if wid=='mut': pg.screenshot(path=O+f'{th}_valuesheet.png')
      C(pg,'[data-kern]');time.sleep(2.2);dismiss(pg)
    pg.screenshot(path=O+f'{th}_home5.png',full_page=True)
    tab(pg,'werte');pg.screenshot(path=O+f'{th}_werte.png',full_page=True)
    pg.evaluate("document.querySelector('.slot.on').click()");time.sleep(.6)
    pg.fill('#leittext','Ich stehe dafür ein, dass ich auch dann die Wahrheit sage, wenn sie unbequem ist.');C(pg,'[data-leitsave]');time.sleep(2.5);dismiss(pg)
    tab(pg,'ueben');dismiss(pg);pg.screenshot(path=O+f'{th}_ueben.png',full_page=True)
    C(pg,'.opt >> nth=0');time.sleep(1.2);dismiss(pg);pg.screenshot(path=O+f'{th}_probe.png',full_page=True)
    pg.fill('#preason','Weil Ehrlichkeit wichtiger ist.');C(pg,'[data-psave]');time.sleep(.4)
    C(pg,'[data-accept] >> nth=0');time.sleep(.6);dismiss(pg)
    C(pg,'[data-done] >> nth=0');time.sleep(.6);C(pg,'[data-mood=gut]');pg.fill('#note','Lief gut.');C(pg,'#savedone');time.sleep(2.5);dismiss(pg)
    pg.screenshot(path=O+f'{th}_home_built.png',full_page=True)
    C(pg,'.glegend [data-pil=wahrhaftigkeit]',force=True);time.sleep(.8);pg.screenshot(path=O+f'{th}_pil.png',full_page=False)
    tab(pg,'imp');pg.screenshot(path=O+f'{th}_imp.png',full_page=True)
    C(pg,'#go');time.sleep(1.4);dismiss(pg);pg.screenshot(path=O+f'{th}_bite.png',full_page=True)
    C(pg,'[data-deep=tip]');time.sleep(1.2);pg.screenshot(path=O+f'{th}_deep.png');dismiss(pg)
    print(th,'errors',e)
    ctx.close()
