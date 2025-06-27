// ========================================
// PREVENTIVATORE STAMPA 3D - WIX VELO
// ========================================

import wixData from 'wix-data';
import { sendEmail } from 'wix-email';
import { fetch } from 'wix-fetch';

// Configurazione materiali e costi
const MATERIALS = {
    "PLA": { price: 0.15, density: 1.24, setupCost: 15 },
    "ABS": { price: 0.18, density: 1.04, setupCost: 18 },
    "PETG": { price: 0.20, density: 1.27, setupCost: 20 },
    "TPU": { price: 0.35, density: 1.21, setupCost: 25 },
    "Resina": { price: 0.80, density: 1.1, setupCost: 30 },
    "Nylon": { price: 0.25, density: 1.13, setupCost: 22 },
    "Metallo": { price: 0.75, density: 8.9, setupCost: 50 }
};

const TECHNOLOGIES = {
    "FDM": { multiplier: 1.0, timeMultiplier: 1.0 },
    "SLA": { multiplier: 1.5, timeMultiplier: 0.7 },
    "SLS": { multiplier: 2.0, timeMultiplier: 0.5 },
    "DLP": { multiplier: 1.3, timeMultiplier: 0.8 }
};

// ========================================
// 1. UPLOAD DEI FILE
// ========================================

export function uploadButton1_change(event) {
    const file = $w("#uploadButton1").value[0];
    const maxSize = 150 * 1024 * 1024; // 150MB
    
    if (!file) {
        $w("#errorText").text = "Nessun file selezionato";
        return;
    }
    
    // Controllo dimensione
    if (file.size > maxSize) {
        $w("#errorText").text = "File troppo grande! Massimo 150MB";
        return;
    }
    
    // Controllo estensione
    const allowedExtensions = ['.stl', '.step', '.stp', '.zip'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
        $w("#errorText").text = "Formato file non supportato. Usa .stl, .step, .stp o .zip";
        return;
    }
    
    // Mostra progress
    $w("#uploadProgress").show();
    $w("#uploadProgress").value = 0;
    
    // Simula upload progress
    const progressInterval = setInterval(() => {
        const currentProgress = $w("#uploadProgress").value;
        if (currentProgress < 90) {
            $w("#uploadProgress").value = currentProgress + 10;
        }
    }, 200);
    
    // Salva file nel database
    saveFileToDatabase(file)
        .then(() => {
            clearInterval(progressInterval);
            $w("#uploadProgress").value = 100;
            
            setTimeout(() => {
                $w("#uploadProgress").hide();
                $w("#successText").text = "File caricato con successo!";
                $w("#successText").show();
                
                // Aggiorna lista file
                loadUploadedFiles();
                
                // Analizza file
                analyzeFile(file);
            }, 500);
        })
        .catch(error => {
            clearInterval(progressInterval);
            $w("#uploadProgress").hide();
            $w("#errorText").text = "Errore nel caricamento: " + error.message;
        });
}

async function saveFileToDatabase(file) {
    try {
        // Salva info file nel database
        const fileRecord = await wixData.insert("UploadedFiles", {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadDate: new Date(),
            status: "uploaded"
        });
        
        // Salva file in Media Manager (opzionale)
        // const uploadedFile = await wixMediaManager.upload(file);
        
        return fileRecord;
    } catch (error) {
        console.error("Errore salvataggio file:", error);
        throw error;
    }
}

// ========================================
// 2. ANALISI E ANTEPRIMA
// ========================================

async function analyzeFile(file) {
    try {
        // Simula analisi del file (in produzione, usa API esterne)
        const analysis = await simulateFileAnalysis(file);
        
        // Salva analisi nel database
        await wixData.insert("FileAnalysis", {
            fileName: file.name,
            volume: analysis.volume,
            dimensions: analysis.dimensions,
            weight: analysis.weight,
            printTime: analysis.printTime,
            analysisDate: new Date()
        });
        
        // Mostra risultati
        displayAnalysisResults(analysis);
        
    } catch (error) {
        console.error("Errore analisi file:", error);
        $w("#errorText").text = "Errore nell'analisi del file";
    }
}

async function simulateFileAnalysis(file) {
    // Simula analisi basata su dimensione file
    const baseVolume = file.size / 1000; // cm³ approssimativo
    const volume = Math.max(1, baseVolume * (0.5 + Math.random() * 1.5));
    
    return {
        volume: volume.toFixed(2),
        dimensions: {
            x: (10 + Math.random() * 50).toFixed(1),
            y: (10 + Math.random() * 50).toFixed(1),
            z: (10 + Math.random() * 50).toFixed(1)
        },
        weight: (volume * 1.2).toFixed(2), // peso stimato
        printTime: Math.floor(volume * 30 + Math.random() * 60), // minuti
        isPrintable: true,
        issues: []
    };
}

function displayAnalysisResults(analysis) {
    // Aggiorna UI con risultati analisi
    $w("#volumeText").text = analysis.volume + " cm³";
    $w("#dimensionsText").text = `${analysis.dimensions.x} × ${analysis.dimensions.y} × ${analysis.dimensions.z} mm`;
    $w("#weightText").text = analysis.weight + " g";
    $w("#printTimeText").text = analysis.printTime + " min";
    
    // Mostra sezione analisi
    $w("#analysisSection").show();
    
    // Aggiorna calcolo prezzi
    updatePriceCalculation();
}

// ========================================
// 3. CONFIGURAZIONE STAMPA
// ========================================

export function materialDropdown_change(event) {
    updatePriceCalculation();
}

export function technologyDropdown_change(event) {
    updatePriceCalculation();
}

export function quantityInput_change(event) {
    updatePriceCalculation();
}

export function colorDropdown_change(event) {
    updatePriceCalculation();
}

function updatePriceCalculation() {
    const material = $w("#materialDropdown").value;
    const technology = $w("#technologyDropdown").value;
    const quantity = parseInt($w("#quantityInput").value) || 1;
    const color = $w("#colorDropdown").value;
    
    // Ottieni volume dal file analizzato
    const volumeText = $w("#volumeText").text;
    const volume = parseFloat(volumeText) || 0;
    
    if (volume === 0) {
        $w("#totalPrice").text = "€0.00";
        return;
    }
    
    // Calcola prezzo
    const price = calculatePrice(volume, material, technology, quantity, color);
    
    // Mostra breakdown
    displayPriceBreakdown(price, volume, material, technology, quantity);
}

function calculatePrice(volume, material, technology, quantity, color) {
    const materialData = MATERIALS[material] || MATERIALS["PLA"];
    const techData = TECHNOLOGIES[technology] || TECHNOLOGIES["FDM"];
    
    // Costo base materiale
    const materialCost = volume * materialData.price * materialData.density;
    
    // Costo setup
    const setupCost = materialData.setupCost;
    
    // Moltiplicatore tecnologia
    const techMultiplier = techData.multiplier;
    
    // Sconto quantità
    let quantityDiscount = 1;
    if (quantity >= 10) quantityDiscount = 0.9;
    if (quantity >= 50) quantityDiscount = 0.8;
    if (quantity >= 100) quantityDiscount = 0.7;
    
    // Costo per pezzo
    const costPerPiece = (materialCost + setupCost) * techMultiplier;
    
    // Totale con sconto
    const total = costPerPiece * quantity * quantityDiscount;
    
    return {
        materialCost: materialCost,
        setupCost: setupCost,
        techMultiplier: techMultiplier,
        quantityDiscount: quantityDiscount,
        costPerPiece: costPerPiece,
        total: total,
        quantity: quantity
    };
}

function displayPriceBreakdown(price, volume, material, technology, quantity) {
    $w("#materialCostText").text = "€" + price.materialCost.toFixed(2);
    $w("#setupCostText").text = "€" + price.setupCost.toFixed(2);
    $w("#techMultiplierText").text = "x" + price.techMultiplier.toFixed(2);
    $w("#quantityDiscountText").text = (price.quantityDiscount * 100).toFixed(0) + "%";
    $w("#costPerPieceText").text = "€" + price.costPerPiece.toFixed(2);
    $w("#totalPrice").text = "€" + price.total.toFixed(2);
    
    // Mostra sezione preventivo
    $w("#quoteSection").show();
}

// ========================================
// 4. PREVENTIVO DINAMICO
// ========================================

export function generateQuoteButton_click(event) {
    const quoteData = collectQuoteData();
    
    if (!quoteData) {
        $w("#errorText").text = "Completa tutti i campi per generare il preventivo";
        return;
    }
    
    // Salva preventivo nel database
    saveQuoteToDatabase(quoteData)
        .then(quoteId => {
            // Genera PDF (simulato)
            generateQuotePDF(quoteData, quoteId);
            
            // Mostra conferma
            $w("#successText").text = "Preventivo generato! ID: " + quoteId;
            $w("#successText").show();
        })
        .catch(error => {
            $w("#errorText").text = "Errore nella generazione del preventivo";
        });
}

function collectQuoteData() {
    const fileName = $w("#fileNameText").text;
    const volume = $w("#volumeText").text;
    const material = $w("#materialDropdown").value;
    const technology = $w("#technologyDropdown").value;
    const quantity = $w("#quantityInput").value;
    const color = $w("#colorDropdown").value;
    const totalPrice = $w("#totalPrice").text;
    
    if (!fileName || !volume || !material || !technology || !quantity) {
        return null;
    }
    
    return {
        fileName: fileName,
        volume: volume,
        material: material,
        technology: technology,
        quantity: quantity,
        color: color,
        totalPrice: totalPrice,
        quoteDate: new Date(),
        status: "pending"
    };
}

async function saveQuoteToDatabase(quoteData) {
    try {
        const quote = await wixData.insert("Quotes", quoteData);
        return quote._id;
    } catch (error) {
        console.error("Errore salvataggio preventivo:", error);
        throw error;
    }
}

function generateQuotePDF(quoteData, quoteId) {
    // Simula generazione PDF
    const pdfContent = `
        PREVENTIVO STAMPA 3D
        ID: ${quoteId}
        Data: ${quoteData.quoteDate.toLocaleDateString('it-IT')}
        
        File: ${quoteData.fileName}
        Volume: ${quoteData.volume} cm³
        Materiale: ${quoteData.material}
        Tecnologia: ${quoteData.technology}
        Quantità: ${quoteData.quantity}
        Colore: ${quoteData.color}
        
        Totale: ${quoteData.totalPrice}
        
        Note: Preventivo valido per 30 giorni
    `;
    
    // In produzione, usa una libreria PDF come jsPDF
    console.log("PDF generato:", pdfContent);
}

// ========================================
// 5. CHECKOUT E INVIO EMAIL
// ========================================

export function checkoutButton_click(event) {
    const customerData = collectCustomerData();
    
    if (!customerData) {
        $w("#errorText").text = "Completa tutti i campi cliente";
        return;
    }
    
    // Salva ordine
    saveOrder(customerData)
        .then(orderId => {
            // Invia email di conferma
            sendConfirmationEmail(customerData, orderId);
            
            // Invia richiesta al laboratorio
            sendLabRequest(customerData, orderId);
            
            // Mostra conferma
            $w("#successText").text = "Ordine inviato! ID: " + orderId;
            $w("#successText").show();
        })
        .catch(error => {
            $w("#errorText").text = "Errore nell'invio dell'ordine";
        });
}

function collectCustomerData() {
    const email = $w("#emailInput").value;
    const name = $w("#nameInput").value;
    const phone = $w("#phoneInput").value;
    const address = $w("#addressInput").value;
    const notes = $w("#notesInput").value;
    
    if (!email || !name || !phone) {
        return null;
    }
    
    return {
        email: email,
        name: name,
        phone: phone,
        address: address,
        notes: notes,
        orderDate: new Date()
    };
}

async function saveOrder(customerData) {
    try {
        const order = await wixData.insert("Orders", {
            ...customerData,
            status: "pending",
            totalAmount: $w("#totalPrice").text
        });
        return order._id;
    } catch (error) {
        console.error("Errore salvataggio ordine:", error);
        throw error;
    }
}

async function sendConfirmationEmail(customerData, orderId) {
    try {
        await sendEmail({
            to: customerData.email,
            subject: "Conferma Ordine Stampa 3D - " + orderId,
            body: `
                Gentile ${customerData.name},
                
                Grazie per il tuo ordine di stampa 3D!
                
                ID Ordine: ${orderId}
                Data: ${new Date().toLocaleDateString('it-IT')}
                Totale: ${$w("#totalPrice").text}
                
                Il nostro laboratorio ti contatterà entro 24 ore per confermare i dettagli.
                
                Cordiali saluti,
                Il team di stampa 3D
            `
        });
    } catch (error) {
        console.error("Errore invio email conferma:", error);
    }
}

async function sendLabRequest(customerData, orderId) {
    try {
        await sendEmail({
            to: "lab@castaliaweb.com",
            subject: "Nuova Richiesta Stampa 3D - " + orderId,
            body: `
                NUOVA RICHIESTA STAMPA 3D
                
                ID Ordine: ${orderId}
                Cliente: ${customerData.name}
                Email: ${customerData.email}
                Telefono: ${customerData.phone}
                Indirizzo: ${customerData.address}
                
                DETTAGLI STAMPA:
                File: ${$w("#fileNameText").text}
                Volume: ${$w("#volumeText").text}
                Materiale: ${$w("#materialDropdown").value}
                Tecnologia: ${$w("#technologyDropdown").value}
                Quantità: ${$w("#quantityInput").value}
                Colore: ${$w("#colorDropdown").value}
                
                Totale: ${$w("#totalPrice").text}
                
                Note cliente: ${customerData.notes || "Nessuna nota"}
                
                Data richiesta: ${new Date().toLocaleString('it-IT')}
            `
        });
    } catch (error) {
        console.error("Errore invio richiesta laboratorio:", error);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function loadUploadedFiles() {
    wixData.query("UploadedFiles")
        .descending("uploadDate")
        .limit(10)
        .find()
        .then(results => {
            $w("#filesRepeater").data = results.items;
        })
        .catch(error => {
            console.error("Errore caricamento file:", error);
        });
}

export function clearForm() {
    $w("#uploadButton1").value = null;
    $w("#materialDropdown").value = "PLA";
    $w("#technologyDropdown").value = "FDM";
    $w("#quantityInput").value = "1";
    $w("#colorDropdown").value = "Nero";
    $w("#emailInput").value = "";
    $w("#nameInput").value = "";
    $w("#phoneInput").value = "";
    $w("#addressInput").value = "";
    $w("#notesInput").value = "";
    
    $w("#analysisSection").hide();
    $w("#quoteSection").hide();
    $w("#errorText").text = "";
    $w("#successText").text = "";
}

// Inizializzazione
export function page_ready() {
    loadUploadedFiles();
    clearForm();
} 