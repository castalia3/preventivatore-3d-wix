# Preventivatore Stampa 3D per Wix

Un preventivatore professionale e completo per servizi di stampa 3D, progettato per essere integrato facilmente in siti web Wix.

## 🚀 Funzionalità

### ✨ Caratteristiche Principali
- **Upload file STL** con drag & drop
- **Visualizzazione 3D interattiva** del modello
- **Calcolo automatico dei costi** in tempo reale
- **Analisi del volume** e dimensioni del modello
- **Stima tempi di stampa** basata su parametri
- **Generazione preventivi PDF**
- **Design responsive** per tutti i dispositivi

### 🎛️ Parametri Configurabili
- **Materiali**: PLA, ABS, PETG, TPU, Resina
- **Qualità di stampa**: Bassa, Media, Alta, Ultra
- **Riempimento**: 10% - 100% (slider interattivo)
- **Supporti**: Attivazione/disattivazione
- **Quantità**: Numero di pezzi da stampare

### 💰 Calcolo Costi
- Costo materiale (basato su volume e densità)
- Costo elettricità (basato su tempo di stampa)
- Costo supporti (se necessari)
- Setup e post-processing
- **Totale per pezzo e totale ordine**

## 📁 Struttura Progetto

```
preventivatore-3d/
├── index.html          # Pagina principale
├── styles.css          # Stili CSS
├── script.js           # Logica JavaScript
└── README.md           # Documentazione
```

## 🔧 Integrazione in Wix

### Metodo 1: HTML Personalizzato (Raccomandato)

1. **Accedi al tuo sito Wix**
2. **Vai su "Modifica sito"**
3. **Aggiungi un nuovo elemento** → "HTML personalizzato"
4. **Copia tutto il contenuto** di `index.html`
5. **Incolla nel widget HTML**
6. **Salva e pubblica**

### Metodo 2: Hosting Esterno + Embed

1. **Carica i file** su un hosting web (es. GitHub Pages, Netlify)
2. **Ottieni l'URL** della pagina
3. **In Wix**: Aggiungi → "Embed" → "Sito web"
4. **Incolla l'URL** del preventivatore
5. **Configura dimensioni** e opzioni di visualizzazione

### Metodo 3: Sottodominio

1. **Configura un sottodominio** (es. `preventivo.tuosito.com`)
2. **Carica i file** nella directory del sottodominio
3. **Aggiungi link** nel menu principale del sito Wix

## 🎨 Personalizzazione

### Colori e Stile
Modifica le variabili CSS in `styles.css`:

```css
:root {
    --primary-color: #2563eb;    /* Colore principale */
    --secondary-color: #64748b;  /* Colore secondario */
    --background: #f8fafc;       /* Sfondo */
    --surface: #ffffff;          /* Superfici */
}
```

### Materiali e Prezzi
Aggiorna i costi in `script.js`:

```javascript
const MATERIALS = {
    pla: { name: 'PLA', price: 15, density: 1.24, color: 0x00ff88 },
    // Aggiungi o modifica materiali
};
```

### Logo e Branding
1. **Sostituisci il titolo** in `index.html`
2. **Aggiungi il tuo logo** nell'header
3. **Modifica i testi** secondo il tuo brand

## 📱 Responsive Design

Il preventivatore è completamente responsive:
- **Desktop**: Layout a 3 colonne
- **Tablet**: Layout a 2 colonne
- **Mobile**: Layout a 1 colonna

## 🔒 Sicurezza e Privacy

- **Nessun upload server**: I file STL vengono processati solo nel browser
- **Nessun dato salvato**: I calcoli sono temporanei
- **Privacy completa**: Nessun tracking o analytics

## 🛠️ Tecnologie Utilizzate

- **HTML5**: Struttura semantica
- **CSS3**: Design moderno con Grid e Flexbox
- **JavaScript ES6+**: Logica interattiva
- **Three.js**: Visualizzazione 3D
- **STL Loader**: Parsing file STL
- **Font Awesome**: Icone

## 📊 Compatibilità Browser

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE11 (limitato)

## 🚀 Performance

- **Caricamento veloce**: < 2 secondi
- **Calcoli istantanei**: Aggiornamento in tempo reale
- **Visualizzazione fluida**: 60 FPS nel viewer 3D
- **File STL**: Supporto fino a 50MB

## 📞 Supporto

### Problemi Comuni

**Il preventivatore non si carica:**
- Verifica che tutti i file siano caricati
- Controlla la console del browser per errori
- Assicurati che JavaScript sia abilitato

**I file STL non si caricano:**
- Verifica che il file sia in formato STL valido
- Controlla la dimensione del file (< 50MB)
- Prova con un file STL diverso

**I calcoli non sono accurati:**
- I calcoli sono approssimativi
- Il volume viene calcolato tramite triangolazione
- I tempi sono stime basate su parametri standard

## 🔄 Aggiornamenti

### Versione 1.0
- ✅ Upload file STL
- ✅ Visualizzazione 3D
- ✅ Calcolo costi
- ✅ Generazione PDF
- ✅ Design responsive

### Prossime Versioni
- 🔄 Supporto file OBJ/3MF
- 🔄 Più materiali e finiture
- 🔄 Calcolo supporti automatico
- 🔄 Integrazione e-commerce
- 🔄 Sistema di ordini online

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Puoi utilizzarlo liberamente per progetti commerciali e personali.

## 🤝 Contributi

Contributi sono benvenuti! Apri una issue o invia una pull request per migliorare il progetto.

---

**Creato con ❤️ per la comunità della stampa 3D** 