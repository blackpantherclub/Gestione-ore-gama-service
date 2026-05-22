(function () {

  const SCOPE = '/Gestione-ore-gama-service/';

  // Registra SW con scope corretto
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(SCOPE + 'sw.js', { scope: SCOPE })
        .then(r => console.log('[PWA] SW ok, scope:', r.scope))
        .catch(e => console.error('[PWA] SW errore:', e));
    });
  }

  // Già installata?
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  ) return;

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  if (!isIOS && !isAndroid) return;

  // Una volta al giorno
  const oggi = new Date().toDateString();
  if (localStorage.getItem('gama_pwa') === oggi) return;

  // Stili
  const s = document.createElement('style');
  s.textContent = `
    @keyframes gamaUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes gamaBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
    #gama-banner{
      position:fixed;bottom:0;left:0;right:0;
      background:#1a1a1a;border-top:3px solid #ff6a00;
      padding:14px 16px 22px;z-index:99999;
      display:flex;align-items:center;gap:12px;
      box-shadow:0 -6px 28px rgba(0,0,0,.75);
      font-family:'Inter',sans-serif;
      animation:gamaUp .35s ease;
    }
    #gama-banner .gb-ico{width:52px;height:52px;border-radius:13px;background:#0d0d0d;border:1px solid #333;overflow:hidden;flex-shrink:0}
    #gama-banner .gb-ico img{width:100%;height:100%;object-fit:cover;display:block}
    #gama-banner .gb-txt{flex:1}
    #gama-banner .gb-t1{font-size:14px;font-weight:700;color:#f0f0f0}
    #gama-banner .gb-t2{font-size:12px;color:#888;margin-top:2px}
    #gama-banner .gb-t2 b{color:#ff6a00}
    #gama-banner .gb-btn{background:#ff6a00;color:#fff;border:none;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;white-space:nowrap;flex-shrink:0;box-shadow:0 2px 10px rgba(255,106,0,.4)}
    #gama-banner .gb-x{background:none;border:none;color:#555;font-size:22px;cursor:pointer;padding:4px;line-height:1;flex-shrink:0}
    #gama-ios{position:fixed;bottom:0;left:0;right:0;background:#1a1a1a;border-top:3px solid #ff6a00;padding:20px 20px 32px;z-index:99999;font-family:'Inter',sans-serif;box-shadow:0 -6px 28px rgba(0,0,0,.8);animation:gamaUp .35s ease}
    #gama-ios .gi-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
    #gama-ios .gi-hd span{font-size:15px;font-weight:700;color:#f0f0f0}
    #gama-ios .gi-hd button{background:none;border:none;color:#555;font-size:22px;cursor:pointer;line-height:1}
    #gama-ios .gi-step{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;font-size:13px;color:#aaa;line-height:1.5}
    #gama-ios .gi-n{background:#ff6a00;color:#fff;min-width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px}
    #gama-ios .gi-step b{color:#f0f0f0}
    #gama-ios .gi-arr{text-align:center;font-size:28px;margin-top:10px;animation:gamaBounce 1s infinite}
  `;
  document.head.appendChild(s);

  const banner = document.createElement('div');
  banner.id = 'gama-banner';
  const iconSrc = SCOPE + 'icon-192.png';

  if (isAndroid) {
    let deferred = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferred = e;
      console.log('[PWA] beforeinstallprompt ✓');
    });

    banner.innerHTML = `
      <div class="gb-ico"><img src="${iconSrc}" alt=""/></div>
      <div class="gb-txt">
        <div class="gb-t1">Installa Gama Service</div>
        <div class="gb-t2">Aggiungila alla <b>schermata Home</b></div>
      </div>
      <button class="gb-btn" id="gb-ok">⬇ Installa</button>
      <button class="gb-x"  id="gb-no">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('gb-ok').addEventListener('click', async () => {
      banner.remove();
      localStorage.setItem('gama_pwa', oggi);
      if (deferred) {
        deferred.prompt();
        await deferred.userChoice;
        deferred = null;
      } else {
        alert('Apri il menu ⋮ del browser → "Aggiungi a schermata Home" oppure "Installa app"');
      }
    });
    document.getElementById('gb-no').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('gama_pwa', oggi);
    });

  } else if (isIOS) {
    banner.innerHTML = `
      <div class="gb-ico"><img src="${iconSrc}" alt=""/></div>
      <div class="gb-txt">
        <div class="gb-t1">Installa Gama Service</div>
        <div class="gb-t2">Disponibile come <b>app</b> sul tuo iPhone</div>
      </div>
      <button class="gb-btn" id="gb-ok">Come fare</button>
      <button class="gb-x"  id="gb-no">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('gb-ok').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('gama_pwa', oggi);
      const g = document.createElement('div');
      g.id = 'gama-ios';
      g.innerHTML = `
        <div class="gi-hd">
          <span>📲 Aggiungi alla schermata Home</span>
          <button onclick="this.closest('#gama-ios').remove()">✕</button>
        </div>
        <div class="gi-step"><div class="gi-n">1</div><div>Tocca il pulsante <b>Condividi</b> ⬆️ in basso nella barra di Safari</div></div>
        <div class="gi-step"><div class="gi-n">2</div><div>Scorri e tocca <b>"Aggiungi a schermata Home"</b></div></div>
        <div class="gi-step"><div class="gi-n">3</div><div>Tocca <b>"Aggiungi"</b> in alto a destra — fatto!</div></div>
        <div class="gi-arr">↓</div>
      `;
      document.body.appendChild(g);
    });
    document.getElementById('gb-no').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('gama_pwa', oggi);
    });
  }

})();
