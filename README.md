# Gama Service – Registro Ore Lavoro

## Struttura file
```
gama-service/
├── index.html          ← Pagina login (entry point)
├── registrati.html     ← Registrazione operai
├── operaio.html        ← Dashboard operaio
├── admin.html          ← Pannello amministratore
├── setup.html          ← ⚠️ Esegui UNA VOLTA poi elimina
├── css/
│   └── style.css
└── js/
    └── firebase-config.js
```

## Istruzioni setup (prima volta)

### 1. Carica su GitHub
- Crea repository su GitHub (es. `gama-service-ore`)
- Carica tutti i file
- Vai su Settings → Pages → Source: `main` branch → `/root`
- GitHub ti darà un URL tipo: `https://tuonome.github.io/gama-service-ore/`

### 2. Crea l'admin
- Apri nel browser: `https://tuonome.github.io/gama-service-ore/setup.html`
- Clicca "Crea Admin GamaService"
- Fatto! Poi **elimina setup.html** dal repository

### 3. Accesso
- **Admin** → Username: `GamaService` | Password: `GamaService@2026`
- **Operai** → Si registrano su `registrati.html` con email e password

### 4. Regole Firestore (dopo il test)
Vai su Firebase Console → Firestore → Regole e incolla:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Operaio vede solo i propri dati
    match /utenti/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /mesi/{mese} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    // Admin vede tutti
    match /utenti/{uid} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/utenti/$(request.auth.uid)).data.ruolo == 'admin';
      match /mesi/{mese} {
        allow read: if request.auth != null && 
          get(/databases/$(database)/documents/utenti/$(request.auth.uid)).data.ruolo == 'admin';
      }
    }
  }
}
```

## Come funziona

### Operaio
1. Si registra con nome, cognome, email, password
2. Accede e vede il suo registro ore mensile
3. Per ogni giorno seleziona: partenza, fine lavoro, pausa pranzo (modificabile), note
4. Può navigare tra i mesi
5. Può scaricare il PDF del mese

### Admin (GamaService)
1. Accede con username `GamaService` e password
2. Vede tutti gli operai registrati
3. Per ogni operaio vede le ore del mese selezionato
4. Può navigare tra i mesi
5. Può scaricare il PDF di ogni operaio
