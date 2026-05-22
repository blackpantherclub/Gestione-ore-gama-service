// ── PWA INSTALL PROMPT ────────────────────────────────
// Da includere in tutte le pagine prima di </body>

(function() {

  // Registra Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // Rileva se già installata
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) return; // già installata, non mostrare nulla

  // Rileva iOS
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  if (!isIOS && !isAndroid) return; // solo mobile

  // Già mostrato oggi?
  const lastShown = localStorage.getItem('pwa_prompt_shown');
  const oggi = new Date().toDateString();
  if (lastShown === oggi) return;

  // Crea il banner
  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #1a1a1a;
    border-top: 2px solid #ff6a00;
    padding: 16px 20px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
    font-family: 'Inter', sans-serif;
    animation: slideUp 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    #pwa-banner .pwa-icon {
      width: 52px; height: 52px;
      border-radius: 12px;
      flex-shrink: 0;
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      overflow: hidden;
    }
    #pwa-banner .pwa-icon img { width: 100%; height: 100%; object-fit: cover; }
    #pwa-banner .pwa-text { flex: 1; }
    #pwa-banner .pwa-title { font-size: 14px; font-weight: 700; color: #f0f0f0; margin-bottom: 3px; }
    #pwa-banner .pwa-sub { font-size: 12px; color: #777; line-height: 1.4; }
    #pwa-banner .pwa-sub b { color: #ff6a00; }
    #pwa-banner .pwa-btn {
      background: #ff6a00; color: #fff;
      border: none; border-radius: 8px;
      padding: 10px 16px; font-size: 13px;
      font-weight: 700; cursor: pointer;
      font-family: 'Inter', sans-serif;
      white-space: nowrap; flex-shrink: 0;
    }
    #pwa-banner .pwa-close {
      background: none; border: none; color: #555;
      font-size: 20px; cursor: pointer; padding: 4px;
      line-height: 1; flex-shrink: 0;
    }
    /* Freccia iOS */
    #pwa-ios-guide {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #1a1a1a;
      border-top: 2px solid #ff6a00;
      padding: 20px;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.6);
      animation: slideUp 0.3s ease;
    }
    #pwa-ios-guide .ios-title { font-size: 15px; font-weight: 700; color: #f0f0f0; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    #pwa-ios-guide .ios-steps { display: flex; flex-direction: column; gap: 10px; }
    #pwa-ios-guide .ios-step { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #aaa; }
    #pwa-ios-guide .ios-step .num { background: #ff6a00; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    #pwa-ios-guide .ios-step b { color: #f0f0f0; }
    #pwa-ios-guide .ios-arrow { text-align: center; font-size: 28px; margin-top: 10px; animation: bounce 1s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
  `;
  document.head.appendChild(style);

  if (isAndroid) {
    // Android: mostra banner, usa deferredPrompt se disponibile
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
    });

    banner.innerHTML = `
      <div class="pwa-icon"><img src="img/icon-192.png" alt="Gama Service"/></div>
      <div class="pwa-text">
        <div class="pwa-title">Installa Gama Service</div>
        <div class="pwa-sub">Aggiungila alla <b>schermata Home</b> per accesso rapido</div>
      </div>
      <button class="pwa-btn" id="pwa-install-btn">Installa</button>
      <button class="pwa-close" id="pwa-close-btn">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        // Fallback: istruzioni manuali
        alert('Tocca i 3 puntini del browser → "Aggiungi a schermata Home"');
      }
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
    });

    document.getElementById('pwa-close-btn').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
    });

  } else if (isIOS) {
    // iOS: guida passo passo
    banner.innerHTML = `
      <div class="pwa-icon"><img src="img/icon-192.png" alt="Gama Service"/></div>
      <div class="pwa-text">
        <div class="pwa-title">Installa Gama Service</div>
        <div class="pwa-sub">Disponibile come app sul tuo iPhone!</div>
      </div>
      <button class="pwa-btn" id="pwa-install-btn">Come fare</button>
      <button class="pwa-close" id="pwa-close-btn">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', () => {
      banner.remove();
      // Mostra guida
      const guide = document.createElement('div');
      guide.id = 'pwa-ios-guide';
      guide.innerHTML = `
        <div class="ios-title">
          <span>📲 Aggiungi alla schermata Home</span>
          <button onclick="document.getElementById('pwa-ios-guide').remove(); localStorage.setItem('pwa_prompt_shown', '${oggi}');"
            style="background:none;border:none;color:#555;font-size:22px;cursor:pointer;line-height:1;">✕</button>
        </div>
        <div class="ios-steps">
          <div class="ios-step">
            <div class="num">1</div>
            <div>Tocca il pulsante <b>Condividi</b> in basso nel browser Safari</div>
          </div>
          <div class="ios-step">
            <div class="num">2</div>
            <div>Scorri e tocca <b>"Aggiungi a schermata Home"</b></div>
          </div>
          <div class="ios-step">
            <div class="num">3</div>
            <div>Tocca <b>"Aggiungi"</b> in alto a destra</div>
          </div>
        </div>
        <div class="ios-arrow">↓</div>
      `;
      document.body.appendChild(guide);
      localStorage.setItem('pwa_prompt_shown', oggi);
    });

    document.getElementById('pwa-close-btn').addEventListener('click', () => {
      banner.remove();
      localStorage.setItem('pwa_prompt_shown', oggi);
    });
  }

})();
