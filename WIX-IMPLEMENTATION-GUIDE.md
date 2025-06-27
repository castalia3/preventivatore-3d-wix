# 🚀 GUIDA IMPLEMENTAZIONE PREVENTIVATORE STAMPA 3D SU WIX

## 📋 INDICE
1. [Setup Database](#database-setup)
2. [Componenti Wix](#wix-components)
3. [Configurazione Velo](#velo-setup)
4. [Layout Pagina](#page-layout)
5. [Test e Deploy](#test-deploy)

---

## 🗄️ DATABASE SETUP

### 1. Crea le Collection nel Database Wix

#### Collection: `UploadedFiles`
```json
{
  "_id": "Auto-generated",
  "fileName": "Text",
  "fileSize": "Number",
  "fileType": "Text",
  "uploadDate": "Date",
  "status": "Text"
}
```

#### Collection: `FileAnalysis`
```json
{
  "_id": "Auto-generated",
  "fileName": "Text",
  "volume": "Number",
  "dimensions": "Text",
  "weight": "Number",
  "printTime": "Number",
  "analysisDate": "Date"
}
```

#### Collection: `Quotes`
```json
{
  "_id": "Auto-generated",
  "fileName": "Text",
  "volume": "Text",
  "material": "Text",
  "technology": "Text",
  "quantity": "Number",
  "color": "Text",
  "totalPrice": "Text",
  "quoteDate": "Date",
  "status": "Text"
}
```

#### Collection: `Orders`
```json
{
  "_id": "Auto-generated",
  "email": "Text",
  "name": "Text",
  "phone": "Text",
  "address": "Text",
  "notes": "Text",
  "orderDate": "Date",
  "status": "Text",
  "totalAmount": "Text"
}
```

---

## 🧩 COMPONENTI WIX

### 1. SEZIONE UPLOAD (🟢)

#### Componenti necessari:
- **UploadButton** (ID: `uploadButton1`)
- **ProgressBar** (ID: `uploadProgress`)
- **Text** (ID: `errorText`, `successText`)
- **Repeater** (ID: `filesRepeater`)

#### Configurazione UploadButton:
```
- Label: "Carica File 3D"
- Accept: .stl,.step,.stp,.zip
- Max Size: 150MB
- Multiple: false
```

#### Configurazione Repeater:
```
- Items per row: 3
- Columns: 1
- Rows: 3
```

### 2. SEZIONE ANALISI (🟡)

#### Componenti necessari:
- **Container** (ID: `analysisSection`)
- **Text** (ID: `fileNameText`, `volumeText`, `dimensionsText`, `weightText`, `printTimeText`)

#### Layout Container:
```
- Background: #f0f9ff
- Border: 1px solid #bae6fd
- Border Radius: 12px
- Padding: 20px
- Initially Hidden: true
```

### 3. SEZIONE CONFIGURAZIONE (🟠)

#### Componenti necessari:
- **Dropdown** (ID: `materialDropdown`, `technologyDropdown`, `colorDropdown`)
- **NumberInput** (ID: `quantityInput`)
- **Text** (ID: `totalPrice`)

#### Opzioni Dropdown:

**MaterialDropdown:**
```
- PLA
- ABS
- PETG
- TPU
- Resina
- Nylon
- Metallo
```

**TechnologyDropdown:**
```
- FDM
- SLA
- SLS
- DLP
```

**ColorDropdown:**
```
- Nero
- Bianco
- Grigio
- Rosso
- Blu
- Verde
- Giallo
- Personalizzato
```

### 4. SEZIONE PREVENTIVO (🔵)

#### Componenti necessari:
- **Container** (ID: `quoteSection`)
- **Text** (ID: `materialCostText`, `setupCostText`, `techMultiplierText`, `quantityDiscountText`, `costPerPieceText`)
- **Button** (ID: `generateQuoteButton`)

#### Configurazione Button:
```
- Label: "Genera Preventivo PDF"
- Style: Primary
- Icon: fa-file-pdf
```

### 5. SEZIONE CHECKOUT (🟣)

#### Componenti necessari:
- **TextInput** (ID: `emailInput`, `nameInput`, `phoneInput`, `addressInput`)
- **TextArea** (ID: `notesInput`)
- **Button** (ID: `checkoutButton`)

#### Configurazione Input:
```
- Placeholder appropriati
- Required: true (per email, nome, telefono)
- Validation: Email per emailInput
```

---

## ⚙️ VELO SETUP

### 1. Apri Velo Development
```
1. Vai su "Developer Tools" → "Velo by Wix"
2. Crea nuovo file: "preventivatore.js"
3. Copia il contenuto di wix-velo-integration.js
```

### 2. Configura Permissions
```javascript
// Nel file wix-velo-integration.js, aggiungi:
import { permissions } from 'wix-permissions';

// Richiedi permessi per email
permissions.request('email');
```

### 3. Configura Email Settings
```
1. Vai su "Settings" → "Email"
2. Configura SMTP o usa Wix Email
3. Aggiungi lab@castaliaweb.com ai destinatari
```

---

## 📐 LAYOUT PAGINA

### Struttura Consigliata:

```
┌─────────────────────────────────────┐
│           HEADER                    │
│     Preventivatore Stampa 3D        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         🟢 UPLOAD SECTION           │
│  [UploadButton] [ProgressBar]       │
│  [ErrorText] [SuccessText]          │
│  [FilesRepeater]                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         🟡 ANALYSIS SECTION         │
│  [AnalysisContainer] (Hidden)       │
│  File: xxx.stl | Volume: 25.5 cm³   │
│  Dimensions: 50×30×20 mm            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        🟠 CONFIGURATION SECTION     │
│  Material: [Dropdown]               │
│  Technology: [Dropdown]             │
│  Quantity: [NumberInput]            │
│  Color: [Dropdown]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         🔵 QUOTE SECTION            │
│  [QuoteContainer] (Hidden)          │
│  Material Cost: €15.50              │
│  Setup Cost: €20.00                 │
│  Total: €35.50                      │
│  [GenerateQuoteButton]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         🟣 CHECKOUT SECTION         │
│  Email: [TextInput]                 │
│  Name: [TextInput]                  │
│  Phone: [TextInput]                 │
│  Address: [TextInput]               │
│  Notes: [TextArea]                  │
│  [CheckoutButton]                   │
└─────────────────────────────────────┘
```

---

## 🔗 CONNESSIONI COMPONENTI

### 1. Event Handlers
```javascript
// Nel file Velo, collega questi eventi:
uploadButton1_change
materialDropdown_change
technologyDropdown_change
quantityInput_change
colorDropdown_change
generateQuoteButton_click
checkoutButton_click
```

### 2. Data Binding
```javascript
// Repeater binding
$w("#filesRepeater").onItemReady(($item, itemData) => {
    $item("#fileName").text = itemData.fileName;
    $item("#fileSize").text = formatFileSize(itemData.fileSize);
    $item("#uploadDate").text = itemData.uploadDate.toLocaleDateString();
});
```

---

## 🧪 TEST E DEPLOY

### 1. Test Locale
```javascript
// Testa ogni sezione:
1. Upload file STL (dimensione < 150MB)
2. Verifica analisi automatica
3. Cambia parametri e verifica calcolo prezzi
4. Genera preventivo
5. Completa checkout
6. Verifica email inviate
```

### 2. Test Database
```javascript
// Verifica che i dati vengano salvati:
1. UploadedFiles collection
2. FileAnalysis collection
3. Quotes collection
4. Orders collection
```

### 3. Test Email
```javascript
// Verifica invio email:
1. Email conferma cliente
2. Email richiesta laboratorio (lab@castaliaweb.com)
```

### 4. Deploy
```
1. Pubblica il sito
2. Testa in produzione
3. Configura backup database
4. Monitora errori Velo
```

---

## 🎨 PERSONALIZZAZIONE

### 1. Colori e Stile
```css
/* Modifica nel CSS di Wix */
:root {
    --primary-color: #2563eb;    /* Il tuo colore */
    --success-color: #10b981;    /* Verde successo */
    --warning-color: #f59e0b;    /* Giallo warning */
    --danger-color: #ef4444;     /* Rosso errore */
}
```

### 2. Prezzi Materiali
```javascript
// Modifica in wix-velo-integration.js
const MATERIALS = {
    "PLA": { price: 0.15, density: 1.24, setupCost: 15 },
    // Aggiungi/modifica i tuoi prezzi
};
```

### 3. Email Template
```javascript
// Personalizza le email in sendConfirmationEmail() e sendLabRequest()
```

---

## 🚨 TROUBLESHOOTING

### Problemi Comuni:

**1. Upload non funziona**
```
- Verifica permessi file
- Controlla dimensione massima
- Verifica estensioni consentite
```

**2. Calcolo prezzi non aggiorna**
```
- Verifica binding event handlers
- Controlla ID componenti
- Verifica logica calculatePrice()
```

**3. Email non inviate**
```
- Verifica configurazione SMTP
- Controlla permessi email
- Verifica indirizzi destinatari
```

**4. Database errori**
```
- Verifica struttura collection
- Controlla permessi database
- Verifica query syntax
```

---

## 📞 SUPPORTO

Per problemi o personalizzazioni:
- Controlla log Velo in Developer Tools
- Verifica Network tab per errori HTTP
- Controlla Database per dati mancanti

---

**🎯 Il preventivatore è ora pronto per la produzione!** 