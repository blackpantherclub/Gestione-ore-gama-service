(function() {

  // Registra Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('SW registrato:', reg.scope))
        .catch(err => console.log('SW errore:', err));
    });
  }

  // Già installata come app?
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  if (!isIOS && !isAndroid) return;

  // Mostra solo una volta al giorno
  const oggi      = new Date().toDateString();
  const lastShown = localStorage.getItem('pwa_prompt_shown');
  if (lastShown === oggi) return;

  // Inietta stili
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gamaSlideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes gamaBounce {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(5px); }
    }
    #gama-pwa-banner {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #1a1a1a;
      border-top: 2px solid #ff6a00;
      padding: 14px 16px;
      z-index: 99999;
      display: flex; align-items: center; gap: 12px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.6);
      font-family: 'Inter', sans-serif;
      animation: gamaSlideUp 0.35s ease;
    }
    #gama-pwa-banner .gp-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: #0d0d0d; border: 1px solid #2a2a2a;
      overflow: hidden; flex-shrink: 0;
    }
    #gama-pwa-banner .gp-icon img { width:100%; height:100%; object-fit:cover; display:block; }
    #gama-pwa-banner .gp-text { flex: 1; }
    #gama-pwa-banner .gp-title { font-size:14px; font-weight:700; color:#f0f0f0; }
    #gama-pwa-banner .gp-sub   { font-size:12px; color:#888; margin-top:2px; }
    #gama-pwa-banner .gp-sub b { color:#ff6a00; }
    #gama-pwa-banner .gp-btn {
      background:#ff6a00; color:#fff; border:none;
      border-radius:8px; padding:9px 14px;
      font-size:13px; font-weight:700;
      font-family:'Inter',sans-serif;
      cursor:pointer; white-space:nowrap; flex-shrink:0;
    }
    #gama-pwa-banner .gp-close {
      background:none; border:none; color:#555;
      font-size:22px; cursor:pointer; padding:4px;
      line-height:1; flex-shrink:0;
    }
    #gama-ios-guide {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #1a1a1a;
      border-top: 2px solid #ff6a00;
      padding: 20px 20px 28px;
      z-index: 99999;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.7);
      animation: gamaSlideUp 0.35s ease;
    }
    #gama-ios-guide .gi-header {
      display:flex; justify-content:space-between; align-items:center;
      margin-bottom:16px;
    }
    #gama-ios-guide .gi-header span { font-size:15px; font-weight:700; color:#f0f0f0; }
    #gama-ios-guide .gi-close {
      background:none; border:none; color:#555;
      font-size:22px; cursor:pointer; line-height:1;
    }
    #gama-ios-guide .gi-step {
      display:flex; align-items:flex-start; gap:12px;
      margin-bottom:12px; font-size:13px; color:#aaa;
    }
    #gama-ios-guide .gi-step .gi-num {
      background:#ff6a00; color:#fff;
      width:24px; height:24px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:12px; font-weight:700; flex-shrink:0; margin-top:1px;
    }
    #gama-ios-guide .gi-step b { color:#f0f0f0; }
    #gama-ios-guide .gi-arrow {
      text-align:center; font-size:26px; margin-top:8px;
      animation: gamaBounce 1s infinite;
    }
  `;
  document.head.appendChild(style);

  // Crea banner
  const banner = document.createElement('div');
  banner.id = 'gama-pwa-banner';

  if (isAndroid) {
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
    });

    banner.innerHTML = `
      <div class="gp-icon"><img src="icon-192.png" alt=""/></div>
      <div class="gp-text">
        <div class="gp-title">Installa Gama Service</div>
        <div class="gp-sub">Aggiungila alla <b>schermata Home</b></div>
      </div>
      <button class="gp-btn" id="gp-install">Installa</button>
      <button class="gp-close" id="gp-close">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('gp-install').addEventListener('click', async () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        // Fallback manuale
        showAndroidManual();
      }
    });

    document.getElementById('gp-close').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
    });

  } else if (isIOS) {
    banner.innerHTML = `
      <div class="gp-icon"><img src="icon-192.png" alt=""/></div>
      <div class="gp-text">
        <div class="gp-title">Installa Gama Service</div>
        <div class="gp-sub">Disponibile come <b>app</b> sul tuo iPhone</div>
      </div>
      <button class="gp-btn" id="gp-install">Come fare</button>
      <button class="gp-close" id="gp-close">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('gp-install').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
      showIOSGuide();
    });

    document.getElementById('gp-close').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
    });
  }

  function showIOSGuide() {
    const guide = document.createElement('div');
    guide.id = 'gama-ios-guide';
    guide.innerHTML = `
      <div class="gi-header">
        <span>📲 Aggiungi alla schermata Home</span>
        <button class="gi-close" id="gi-close-btn">✕</button>
      </div>
      <div class="gi-step">
        <div class="gi-num">1</div>
        <div>Tocca il pulsante <b>Condividi</b> <span style="font-size:16px;">⬆️</span> in basso nella barra di Safari</div>
      </div>
      <div class="gi-step">
        <div class="gi-num">2</div>
        <div>Scorri verso il basso e tocca <b>"Aggiungi a schermata Home"</b></div>
      </div>
      <div class="gi-step">
        <div class="gi-num">3</div>
        <div>Tocca <b>"Aggiungi"</b> in alto a destra — fatto!</div>
      </div>
      <div class="gi-arrow">↓</div>
    `;
    document.body.appendChild(guide);
    document.getElementById('gi-close-btn').addEventListener('click', () => guide.remove());
  }

  function showAndroidManual() {
    alert('Tocca i ⋮ (tre puntini) in alto a destra nel browser → "Aggiungi a schermata Home"');
  }

})();
