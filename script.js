// Configurazione materiali e costi
const MATERIALS = {
    pla: { name: 'PLA', price: 15, density: 1.24, color: 0x00ff88 },
    abs: { name: 'ABS', price: 18, density: 1.04, color: 0xff6600 },
    petg: { name: 'PETG', price: 20, density: 1.27, color: 0x0088ff },
    tpu: { name: 'TPU', price: 35, density: 1.21, color: 0xff0088 },
    resina: { name: 'Resina', price: 80, density: 1.1, color: 0x8800ff }
};

const QUALITY_SETTINGS = {
    low: { layerHeight: 0.3, speed: 60, multiplier: 0.8 },
    medium: { layerHeight: 0.2, speed: 50, multiplier: 1.0 },
    high: { layerHeight: 0.1, speed: 40, multiplier: 1.3 },
    ultra: { layerHeight: 0.05, speed: 30, multiplier: 1.8 }
};

// Configurazione controlli stampabilità
const PRINTABILITY_CONFIG = {
    minWallThickness: 0.8, // mm
    minFeatureSize: 0.4, // mm
    maxOverhang: 45, // gradi
    minLayerHeight: 0.1, // mm
    maxSize: 300, // mm per dimensione
    maxVolume: 1000 // cm³
};

// Variabili globali
let currentModel = null;
let scene, camera, renderer, controls;
let currentMesh = null;
let printabilityResults = null;
let wireframeMode = false;
let transparencyMode = false;

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    initialize3DViewer();
    setupEventListeners();
    updateCalculations();
});

// Setup event listeners
function setupEventListeners() {
    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const removeFile = document.getElementById('removeFile');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    removeFile.addEventListener('click', removeCurrentFile);

    // Parameter changes
    document.getElementById('material').addEventListener('change', updateCalculations);
    document.getElementById('quality').addEventListener('change', updateCalculations);
    document.getElementById('infill').addEventListener('input', updateInfillValue);
    document.getElementById('support').addEventListener('change', updateCalculations);
    document.getElementById('quantity').addEventListener('input', updateCalculations);

    // Generate quote
    document.getElementById('generateQuote').addEventListener('click', generatePDF);
}

// Controlli viewer 3D
function resetView() {
    if (currentMesh) {
        const geometry = currentModel.geometry;
        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
        controls.reset();
    }
}

function toggleWireframe() {
    if (currentMesh) {
        wireframeMode = !wireframeMode;
        currentMesh.material.wireframe = wireframeMode;
        
        const button = document.querySelector('button[onclick="toggleWireframe()"]');
        if (wireframeMode) {
            button.innerHTML = '<i class="fas fa-cube"></i> Solido';
        } else {
            button.innerHTML = '<i class="fas fa-border-all"></i> Wireframe';
        }
    }
}

function toggleTransparency() {
    if (currentMesh) {
        transparencyMode = !transparencyMode;
        currentMesh.material.transparent = transparencyMode;
        currentMesh.material.opacity = transparencyMode ? 0.6 : 0.8;
        
        const button = document.querySelector('button[onclick="toggleTransparency()"]');
        if (transparencyMode) {
            button.innerHTML = '<i class="fas fa-eye"></i> Opaco';
        } else {
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Trasparenza';
        }
    }
}

// Gestione drag & drop
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#2563eb';
    e.currentTarget.style.background = '#f0f9ff';
}

function handleFileDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.background = '#fafafa';
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Processamento file STL
function processFile(file) {
    if (!file.name.toLowerCase().endsWith('.stl')) {
        alert('Per favore carica un file STL valido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(e.target.result);
        
        currentModel = {
            geometry: geometry,
            fileName: file.name,
            fileSize: formatFileSize(file.size)
        };

        displayFileInfo();
        loadModelInViewer(geometry);
        analyzePrintability(geometry);
        calculateModelProperties(geometry);
        updateCalculations();
    };
    reader.readAsArrayBuffer(file);
}

// Analisi stampabilità del modello
function analyzePrintability(geometry) {
    printabilityResults = {
        isPrintable: true,
        issues: [],
        warnings: [],
        recommendations: []
    };

    // Controllo mesh chiusa
    const meshAnalysis = analyzeMeshClosure(geometry);
    if (!meshAnalysis.isClosed) {
        printabilityResults.isPrintable = false;
        printabilityResults.issues.push('Mesh non chiusa: il modello ha buchi o bordi aperti');
    }

    // Controllo dimensioni
    const sizeAnalysis = analyzeModelSize(geometry);
    if (sizeAnalysis.isTooLarge) {
        printabilityResults.warnings.push(`Modello molto grande: ${sizeAnalysis.maxDimension.toFixed(1)}mm`);
        printabilityResults.recommendations.push('Considera di ridimensionare il modello');
    }

    // Controllo spessori
    const thicknessAnalysis = analyzeWallThickness(geometry);
    if (thicknessAnalysis.hasThinWalls) {
        printabilityResults.issues.push(`Pareti troppo sottili rilevate: ${thicknessAnalysis.minThickness.toFixed(2)}mm (minimo ${PRINTABILITY_CONFIG.minWallThickness}mm)`);
        printabilityResults.recommendations.push('Aumenta lo spessore delle pareti');
    }

    // Controllo volume
    const volume = calculateVolume(geometry);
    if (volume > PRINTABILITY_CONFIG.maxVolume) {
        printabilityResults.warnings.push(`Volume molto grande: ${volume.toFixed(1)}cm³`);
        printabilityResults.recommendations.push('Considera di dividere il modello in parti più piccole');
    }

    // Controllo orientazione
    const orientationAnalysis = analyzeOrientation(geometry);
    if (orientationAnalysis.needsSupports) {
        printabilityResults.warnings.push('Il modello potrebbe richiedere supporti');
        printabilityResults.recommendations.push('Considera di riorientare il modello');
    }

    displayPrintabilityResults();
}

// Analisi chiusura mesh
function analyzeMeshClosure(geometry) {
    const positions = geometry.attributes.position.array;
    const edges = new Map();
    
    // Trova tutti i bordi
    for (let i = 0; i < positions.length; i += 9) {
        const v1 = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
        const v2 = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
        const v3 = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);
        
        // Crea chiavi per i bordi
        const edges1 = [v1, v2].sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
        const edges2 = [v2, v3].sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
        const edges3 = [v3, v1].sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
        
        const key1 = `${edges1[0].x},${edges1[0].y},${edges1[0].z}-${edges1[1].x},${edges1[1].y},${edges1[1].z}`;
        const key2 = `${edges2[0].x},${edges2[0].y},${edges2[0].z}-${edges2[1].x},${edges2[1].y},${edges2[1].z}`;
        const key3 = `${edges3[0].x},${edges3[0].y},${edges3[0].z}-${edges3[1].x},${edges3[1].y},${edges3[1].z}`;
        
        edges.set(key1, (edges.get(key1) || 0) + 1);
        edges.set(key2, (edges.get(key2) || 0) + 1);
        edges.set(key3, (edges.get(key3) || 0) + 1);
    }
    
    // Controlla se tutti i bordi sono condivisi da esattamente 2 triangoli
    let openEdges = 0;
    for (let count of edges.values()) {
        if (count !== 2) {
            openEdges++;
        }
    }
    
    return {
        isClosed: openEdges === 0,
        openEdges: openEdges
    };
}

// Analisi dimensioni modello
function analyzeModelSize(geometry) {
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    return {
        isTooLarge: maxDimension > PRINTABILITY_CONFIG.maxSize,
        maxDimension: maxDimension,
        dimensions: size
    };
}

// Analisi spessori pareti (approssimativo)
function analyzeWallThickness(geometry) {
    const positions = geometry.attributes.position.array;
    let minThickness = Infinity;
    let thinWallsCount = 0;
    
    // Analisi semplificata degli spessori
    for (let i = 0; i < positions.length; i += 9) {
        const v1 = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
        const v2 = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
        const v3 = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);
        
        // Calcola le lunghezze dei lati del triangolo
        const side1 = v1.distanceTo(v2);
        const side2 = v2.distanceTo(v3);
        const side3 = v3.distanceTo(v1);
        
        // Trova il lato più corto (potenziale parete sottile)
        const minSide = Math.min(side1, side2, side3);
        
        if (minSide < minThickness) {
            minThickness = minSide;
        }
        
        if (minSide < PRINTABILITY_CONFIG.minWallThickness) {
            thinWallsCount++;
        }
    }
    
    return {
        hasThinWalls: thinWallsCount > 0,
        minThickness: minThickness,
        thinWallsCount: thinWallsCount
    };
}

// Analisi orientazione
function analyzeOrientation(geometry) {
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    
    // Calcola il rapporto altezza/base
    const height = size.y;
    const baseArea = size.x * size.z;
    const aspectRatio = height / Math.sqrt(baseArea);
    
    // Se il modello è molto alto rispetto alla base, potrebbe aver bisogno di supporti
    const needsSupports = aspectRatio > 3;
    
    return {
        needsSupports: needsSupports,
        aspectRatio: aspectRatio,
        recommendedOrientation: aspectRatio > 3 ? 'Orizzontale' : 'Verticale'
    };
}

// Visualizzazione risultati stampabilità
function displayPrintabilityResults() {
    const statusElement = document.getElementById('printabilityStatus');
    const issuesElement = document.getElementById('printabilityIssues');
    const recommendationsElement = document.getElementById('printabilityRecommendations');
    
    if (!statusElement) return;
    
    // Aggiorna status
    if (printabilityResults.isPrintable) {
        statusElement.innerHTML = '<span style="color: #10b981;">✅ Modello stampabile</span>';
        statusElement.className = 'printability-status printable';
    } else {
        statusElement.innerHTML = '<span style="color: #ef4444;">❌ Problemi rilevati</span>';
        statusElement.className = 'printability-status not-printable';
    }
    
    // Mostra problemi
    if (printabilityResults.issues.length > 0) {
        issuesElement.innerHTML = '<h4>Problemi critici:</h4><ul>' + 
            printabilityResults.issues.map(issue => `<li>${issue}</li>`).join('') + '</ul>';
        issuesElement.style.display = 'block';
    } else {
        issuesElement.style.display = 'none';
    }
    
    // Mostra raccomandazioni
    if (printabilityResults.recommendations.length > 0) {
        recommendationsElement.innerHTML = '<h4>Raccomandazioni:</h4><ul>' + 
            printabilityResults.recommendations.map(rec => `<li>${rec}</li>`).join('') + '</ul>';
        recommendationsElement.style.display = 'block';
    } else {
        recommendationsElement.style.display = 'none';
    }
    
    // Mostra sezione stampabilità
    document.getElementById('printabilitySection').style.display = 'block';
}

// Visualizzazione info file
function displayFileInfo() {
    document.getElementById('fileName').textContent = currentModel.fileName;
    document.getElementById('fileSize').textContent = currentModel.fileSize;
    document.getElementById('fileInfo').style.display = 'flex';
    document.getElementById('uploadArea').style.display = 'none';
}

function removeCurrentFile() {
    currentModel = null;
    printabilityResults = null;
    wireframeMode = false;
    transparencyMode = false;
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
    document.getElementById('printabilitySection').style.display = 'none';
    clear3DViewer();
    hideModelInfo();
    updateCalculations();
}

// Inizializzazione viewer 3D
function initialize3DViewer() {
    const container = document.getElementById('viewer3d');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);

    // Camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(100, 100, 100);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0xcccccc, 0xcccccc);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    animate();
}

// Animazione loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Caricamento modello nel viewer
function loadModelInViewer(geometry) {
    if (currentMesh) {
        scene.remove(currentMesh);
    }

    const material = new THREE.MeshPhongMaterial({ 
        color: MATERIALS[document.getElementById('material').value].color,
        transparent: true,
        opacity: 0.8
    });

    currentMesh = new THREE.Mesh(geometry, material);
    currentMesh.castShadow = true;
    currentMesh.receiveShadow = true;

    // Centra il modello
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    currentMesh.position.sub(center);

    // Scala automatica
    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 100 / maxDim;
    currentMesh.scale.setScalar(scale);

    scene.add(currentMesh);

    // Aggiorna camera
    camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
    controls.reset();
}

// Calcolo proprietà del modello
function calculateModelProperties(geometry) {
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    const bbox = geometry.boundingBox;
    const size = bbox.getSize(new THREE.Vector3());
    const volume = calculateVolume(geometry);
    
    // Aggiorna info modello
    document.getElementById('volume').textContent = `${volume.toFixed(2)} cm³`;
    document.getElementById('dimensions').textContent = 
        `${size.x.toFixed(1)} × ${size.y.toFixed(1)} × ${size.z.toFixed(1)} mm`;
    
    // Calcola tempo di stampa
    const printTime = estimatePrintTime(volume, size);
    document.getElementById('printTime').textContent = formatPrintTime(printTime);
    
    document.getElementById('modelInfo').style.display = 'block';
}

// Calcolo volume (approssimativo)
function calculateVolume(geometry) {
    const positions = geometry.attributes.position.array;
    let volume = 0;
    
    for (let i = 0; i < positions.length; i += 9) {
        const v1 = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
        const v2 = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
        const v3 = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);
        
        volume += Math.abs(v1.dot(v2.cross(v3))) / 6;
    }
    
    return volume / 1000; // Converti in cm³
}

// Stima tempo di stampa
function estimatePrintTime(volume, size) {
    const quality = QUALITY_SETTINGS[document.getElementById('quality').value];
    const layerHeight = quality.layerHeight;
    const speed = quality.speed;
    
    const layers = size.y / layerHeight;
    const timePerLayer = (size.x * size.z) / (speed * 60); // secondi per layer
    
    return layers * timePerLayer * quality.multiplier;
}

// Aggiorna valore infill
function updateInfillValue() {
    const infill = document.getElementById('infill').value;
    document.getElementById('infillValue').textContent = `${infill}%`;
    updateCalculations();
}

// Calcoli principali
function updateCalculations() {
    if (!currentModel) {
        resetCalculations();
        return;
    }

    const material = MATERIALS[document.getElementById('material').value];
    const quality = QUALITY_SETTINGS[document.getElementById('quality').value];
    const infill = parseInt(document.getElementById('infill').value) / 100;
    const supports = document.getElementById('support').checked;
    const quantity = parseInt(document.getElementById('quantity').value);

    // Calcola volume effettivo
    const volume = calculateVolume(currentModel.geometry);
    const effectiveVolume = volume * infill;

    // Costi
    const materialCost = (effectiveVolume * material.density * material.price) / 1000;
    const electricityCost = estimatePrintTime(volume, currentModel.geometry.boundingBox.getSize(new THREE.Vector3())) * 0.0001; // €/secondo
    const supportCost = supports ? materialCost * 0.3 : 0;
    const setupCost = 2.50; // Costo fisso setup

    const totalPerPiece = materialCost + electricityCost + supportCost + setupCost;
    const totalCost = totalPerPiece * quantity;

    // Aggiorna display
    document.getElementById('materialCost').textContent = `€${materialCost.toFixed(2)}`;
    document.getElementById('electricityCost').textContent = `€${electricityCost.toFixed(2)}`;
    document.getElementById('supportCost').textContent = `€${supportCost.toFixed(2)}`;
    document.getElementById('setupCost').textContent = `€${setupCost.toFixed(2)}`;
    document.getElementById('totalPerPiece').textContent = `€${totalPerPiece.toFixed(2)}`;
    document.getElementById('totalCost').textContent = `€${totalCost.toFixed(2)}`;
    document.getElementById('quantityDisplay').textContent = quantity;

    // Aggiorna colore del modello
    if (currentMesh) {
        currentMesh.material.color.setHex(material.color);
    }
}

// Reset calcoli
function resetCalculations() {
    document.getElementById('materialCost').textContent = '€0.00';
    document.getElementById('electricityCost').textContent = '€0.00';
    document.getElementById('supportCost').textContent = '€0.00';
    document.getElementById('setupCost').textContent = '€0.00';
    document.getElementById('totalPerPiece').textContent = '€0.00';
    document.getElementById('totalCost').textContent = '€0.00';
    document.getElementById('modelInfo').style.display = 'none';
}

// Nascondi info modello
function hideModelInfo() {
    document.getElementById('modelInfo').style.display = 'none';
}

// Pulisci viewer 3D
function clear3DViewer() {
    if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh = null;
    }
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatPrintTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Generazione PDF (simulata)
function generatePDF() {
    if (!currentModel) {
        alert('Carica prima un modello 3D per generare il preventivo.');
        return;
    }

    const button = document.getElementById('generateQuote');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    button.disabled = true;

    // Simula generazione PDF
    setTimeout(() => {
        const material = MATERIALS[document.getElementById('material').value];
        const quality = document.getElementById('quality').value;
        const infill = document.getElementById('infill').value;
        const supports = document.getElementById('support').checked;
        const quantity = document.getElementById('quantity').value;

        const quoteData = {
            fileName: currentModel.fileName,
            material: material.name,
            quality: quality,
            infill: infill,
            supports: supports,
            quantity: quantity,
            totalCost: document.getElementById('totalCost').textContent,
            date: new Date().toLocaleDateString('it-IT'),
            printability: printabilityResults
        };

        // Crea contenuto PDF
        const pdfContent = generatePDFContent(quoteData);
        
        // Simula download
        downloadPDF(pdfContent, `preventivo_${currentModel.fileName.replace('.stl', '')}.pdf`);
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        alert('Preventivo generato con successo!');
    }, 2000);
}

// Genera contenuto PDF
function generatePDFContent(data) {
    let content = `
        PREVENTIVO STAMPA 3D
        
        Data: ${data.date}
        File: ${data.fileName}
        
        Specifiche:
        - Materiale: ${data.material}
        - Qualità: ${data.quality}
        - Riempimento: ${data.infill}%
        - Supporti: ${data.supports ? 'Sì' : 'No'}
        - Quantità: ${data.quantity}
        
        Costo totale: ${data.totalCost}
        
        Analisi Stampabilità:
        - Stato: ${data.printability.isPrintable ? 'Stampabile' : 'Problemi rilevati'}
    `;
    
    if (data.printability.issues.length > 0) {
        content += `\n- Problemi: ${data.printability.issues.join(', ')}`;
    }
    
    if (data.printability.recommendations.length > 0) {
        content += `\n- Raccomandazioni: ${data.printability.recommendations.join(', ')}`;
    }
    
    content += `
        
        Note:
        - Il preventivo è valido per 30 giorni
        - I tempi di consegna variano in base alla complessità
        - Contattaci per confermare l'ordine
    `;
    
    return content;
}

// Download PDF (simulato)
function downloadPDF(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Gestione responsive del viewer
window.addEventListener('resize', () => {
    const container = document.getElementById('viewer3d');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}); 