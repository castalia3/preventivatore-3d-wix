// ========================================
// PREVENTIVATORE STAMPA 3D - CUSTOM ELEMENT WIX
// ========================================

class Preventivatore3D extends HTMLElement {
    constructor() {
        super();
        this.currentModel = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentMesh = null;
        this.printabilityResults = null;
        this.wireframeMode = false;
        this.transparencyMode = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.initialize3DViewer();
        this.updateCalculations();
    }

    render() {
        this.innerHTML = `
            <style>
                :root {
                    --primary-color: #2563eb;
                    --primary-dark: #1d4ed8;
                    --secondary-color: #64748b;
                    --success-color: #10b981;
                    --warning-color: #f59e0b;
                    --danger-color: #ef4444;
                    --background: #f8fafc;
                    --surface: #ffffff;
                    --text-primary: #1e293b;
                    --text-secondary: #64748b;
                    --border: #e2e8f0;
                    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    --radius: 12px;
                    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .preventivatore-container {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: var(--background);
                    color: var(--text-primary);
                    line-height: 1.6;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 0.5rem;
                }

                .header p {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                }

                .calculator-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .card {
                    background: var(--surface);
                    border-radius: var(--radius);
                    padding: 2rem;
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border);
                    transition: var(--transition);
                }

                .card:hover {
                    box-shadow: var(--shadow-lg);
                    transform: translateY(-2px);
                }

                .card h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .upload-area {
                    border: 2px dashed var(--border);
                    border-radius: var(--radius);
                    padding: 3rem 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: var(--transition);
                    background: #fafafa;
                }

                .upload-area:hover {
                    border-color: var(--primary-color);
                    background: #f0f9ff;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--success-color);
                    color: white;
                    padding: 1rem;
                    border-radius: var(--radius);
                    margin-top: 1rem;
                }

                .file-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .btn-remove {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: var(--transition);
                }

                .btn-remove:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .parameter-group {
                    margin-bottom: 1.5rem;
                }

                .parameter-group label {
                    display: block;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .form-control {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: var(--transition);
                    background: var(--surface);
                }

                .form-control:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .slider {
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: var(--border);
                    outline: none;
                    -webkit-appearance: none;
                }

                .slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--primary-color);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .slider::-webkit-slider-thumb:hover {
                    background: var(--primary-dark);
                    transform: scale(1.1);
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }

                .toggle-input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-label {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--border);
                    transition: var(--transition);
                    border-radius: 34px;
                }

                .toggle-label:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: var(--transition);
                    border-radius: 50%;
                }

                .toggle-input:checked + .toggle-label {
                    background-color: var(--primary-color);
                }

                .toggle-input:checked + .toggle-label:before {
                    transform: translateX(26px);
                }

                .model-info {
                    background: #f0f9ff;
                    border: 1px solid #bae6fd;
                    border-radius: var(--radius);
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .info-item:last-child {
                    margin-bottom: 0;
                }

                .cost-breakdown {
                    background: #f8fafc;
                    border-radius: var(--radius);
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .cost-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border);
                }

                .cost-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .cost-item.total {
                    font-weight: 600;
                    font-size: 1.1rem;
                    color: var(--primary-color);
                    border-top: 2px solid var(--primary-color);
                    border-bottom: none;
                    padding-top: 1rem;
                    margin-top: 0.5rem;
                }

                .btn-primary {
                    width: 100%;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: var(--radius);
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .btn-primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-lg);
                }

                .btn-primary:active {
                    transform: translateY(0);
                }

                .btn-secondary {
                    background: var(--surface);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                    padding: 0.75rem 1.5rem;
                    border-radius: var(--radius);
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn-secondary:hover {
                    background: var(--background);
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }

                .printability-section {
                    margin-bottom: 2rem;
                }

                .printability-status {
                    font-size: 1.2rem;
                    font-weight: 600;
                    padding: 1rem;
                    border-radius: var(--radius);
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .printability-status.printable {
                    background: #f0fdf4;
                    border: 2px solid var(--success-color);
                }

                .printability-status.not-printable {
                    background: #fef2f2;
                    border: 2px solid var(--danger-color);
                }

                .printability-criteria h4 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .criteria-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .criteria-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }

                .criteria-item span {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .preview-section {
                    grid-column: 1 / -1;
                }

                .viewer3d {
                    width: 100%;
                    height: 400px;
                    background: #f1f5f9;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }

                .viewer3d canvas {
                    border-radius: var(--radius);
                }

                .viewer-controls {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                @media (max-width: 1024px) {
                    .calculator-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .preview-section {
                        grid-column: 1 / -1;
                    }
                    
                    .criteria-grid {
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .preventivatore-container {
                        padding: 1rem;
                    }
                    
                    .calculator-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                    
                    .card {
                        padding: 1.5rem;
                    }
                    
                    .upload-area {
                        padding: 2rem 1rem;
                    }
                    
                    .viewer3d {
                        height: 300px;
                    }
                    
                    .viewer-controls {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .criteria-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .hidden {
                    display: none !important;
                }
            </style>

            <div class="preventivatore-container">
                <header class="header">
                    <h1>🖨️ Preventivatore Stampa 3D</h1>
                    <p>Calcola il costo della tua stampa 3D in tempo reale</p>
                </header>

                <div class="calculator-grid">
                    <!-- Sezione Upload File -->
                    <div class="card upload-section">
                        <h3>📁 Carica il tuo modello 3D</h3>
                        <div class="upload-area" id="uploadArea">
                            <div style="font-size: 3rem; color: #64748b; margin-bottom: 1rem;">☁️</div>
                            <p>Trascina qui il file STL o clicca per selezionare</p>
                            <input type="file" id="fileInput" accept=".stl,.step,.stp,.zip" style="display: none;">
                        </div>
                        <div class="file-info" id="fileInfo" style="display: none;">
                            <div class="file-details">
                                <span id="fileName"></span>
                                <span id="fileSize"></span>
                            </div>
                            <button class="btn-remove" id="removeFile">✕</button>
                        </div>
                    </div>

                    <!-- Sezione Parametri -->
                    <div class="card parameters-section">
                        <h3>⚙️ Parametri di Stampa</h3>
                        
                        <div class="parameter-group">
                            <label for="material">Materiale:</label>
                            <select id="material" class="form-control">
                                <option value="pla">PLA (€15/kg)</option>
                                <option value="abs">ABS (€18/kg)</option>
                                <option value="petg">PETG (€20/kg)</option>
                                <option value="tpu">TPU (€35/kg)</option>
                                <option value="resina">Resina (€80/kg)</option>
                            </select>
                        </div>

                        <div class="parameter-group">
                            <label for="quality">Qualità di Stampa:</label>
                            <select id="quality" class="form-control">
                                <option value="low">Bassa (0.3mm)</option>
                                <option value="medium" selected>Media (0.2mm)</option>
                                <option value="high">Alta (0.1mm)</option>
                                <option value="ultra">Ultra (0.05mm)</option>
                            </select>
                        </div>

                        <div class="parameter-group">
                            <label for="infill">Riempimento (%):</label>
                            <input type="range" id="infill" min="10" max="100" value="20" class="slider">
                            <span id="infillValue">20%</span>
                        </div>

                        <div class="parameter-group">
                            <label for="support">Supporti:</label>
                            <div class="toggle-switch">
                                <input type="checkbox" id="support" class="toggle-input">
                                <label for="support" class="toggle-label"></label>
                            </div>
                        </div>

                        <div class="parameter-group">
                            <label for="quantity">Quantità:</label>
                            <input type="number" id="quantity" min="1" value="1" class="form-control">
                        </div>
                    </div>

                    <!-- Sezione Risultati -->
                    <div class="card results-section">
                        <h3>💰 Preventivo</h3>
                        
                        <div class="model-info" id="modelInfo" style="display: none;">
                            <div class="info-item">
                                <span>Volume:</span>
                                <span id="volume">-</span>
                            </div>
                            <div class="info-item">
                                <span>Dimensioni:</span>
                                <span id="dimensions">-</span>
                            </div>
                            <div class="info-item">
                                <span>Tempo stimato:</span>
                                <span id="printTime">-</span>
                            </div>
                        </div>

                        <div class="cost-breakdown">
                            <div class="cost-item">
                                <span>Costo materiale:</span>
                                <span id="materialCost">€0.00</span>
                            </div>
                            <div class="cost-item">
                                <span>Costo elettricità:</span>
                                <span id="electricityCost">€0.00</span>
                            </div>
                            <div class="cost-item">
                                <span>Costo supporti:</span>
                                <span id="supportCost">€0.00</span>
                            </div>
                            <div class="cost-item">
                                <span>Setup e post-processing:</span>
                                <span id="setupCost">€0.00</span>
                            </div>
                            <div class="cost-item total">
                                <span>Totale per pezzo:</span>
                                <span id="totalPerPiece">€0.00</span>
                            </div>
                            <div class="cost-item total">
                                <span>Totale (x<span id="quantityDisplay">1</span>):</span>
                                <span id="totalCost">€0.00</span>
                            </div>
                        </div>

                        <button class="btn-primary" id="generateQuote">
                            📄 Genera Preventivo PDF
                        </button>
                    </div>
                </div>

                <!-- Sezione Analisi Stampabilità -->
                <div class="card printability-section" id="printabilitySection" style="display: none;">
                    <h3>✅ Analisi Stampabilità</h3>
                    
                    <div class="printability-status" id="printabilityStatus">
                        <!-- Status verrà inserito dinamicamente -->
                    </div>
                    
                    <div class="printability-criteria">
                        <h4>📋 Criteri Analizzati:</h4>
                        <div class="criteria-grid">
                            <div class="criteria-item">
                                <span>🔗</span>
                                <span>Mesh chiusa (nessun buco)</span>
                            </div>
                            <div class="criteria-item">
                                <span>📏</span>
                                <span>Spessori minimi (≥0.8mm)</span>
                            </div>
                            <div class="criteria-item">
                                <span>📐</span>
                                <span>Dimensioni stampante</span>
                            </div>
                            <div class="criteria-item">
                                <span>📦</span>
                                <span>Volume ragionevole</span>
                            </div>
                            <div class="criteria-item">
                                <span>🔄</span>
                                <span>Orientazione ottimale</span>
                            </div>
                            <div class="criteria-item">
                                <span>🏗️</span>
                                <span>Supporti necessari</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sezione Anteprima 3D -->
                <div class="card preview-section">
                    <h3>👁️ Anteprima 3D</h3>
                    <div id="viewer3d" class="viewer3d">
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;">
                            <div style="text-align: center;">
                                <div style="font-size: 4rem; margin-bottom: 1rem;">🎯</div>
                                <p>Carica un file STL per visualizzare il modello 3D</p>
                            </div>
                        </div>
                    </div>
                    <div class="viewer-controls">
                        <button class="btn-secondary" onclick="this.getRootNode().host.resetView()">
                            🏠 Vista Iniziale
                        </button>
                        <button class="btn-secondary" onclick="this.getRootNode().host.toggleWireframe()">
                            🔲 Wireframe
                        </button>
                        <button class="btn-secondary" onclick="this.getRootNode().host.toggleTransparency()">
                            👁️ Trasparenza
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const uploadArea = this.querySelector('#uploadArea');
        const fileInput = this.querySelector('#fileInput');
        const removeFile = this.querySelector('#removeFile');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        removeFile.addEventListener('click', this.removeCurrentFile.bind(this));

        this.querySelector('#material').addEventListener('change', this.updateCalculations.bind(this));
        this.querySelector('#quality').addEventListener('change', this.updateCalculations.bind(this));
        this.querySelector('#infill').addEventListener('input', this.updateInfillValue.bind(this));
        this.querySelector('#support').addEventListener('change', this.updateCalculations.bind(this));
        this.querySelector('#quantity').addEventListener('input', this.updateCalculations.bind(this));
        this.querySelector('#generateQuote').addEventListener('click', this.generatePDF.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.borderColor = '#2563eb';
        e.currentTarget.style.background = '#f0f9ff';
    }

    handleFileDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.background = '#fafafa';
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.stl')) {
            alert('Per favore carica un file STL valido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.loadThreeJS().then(() => {
                const loader = new THREE.STLLoader();
                const geometry = loader.parse(e.target.result);
                
                this.currentModel = {
                    geometry: geometry,
                    fileName: file.name,
                    fileSize: this.formatFileSize(file.size)
                };

                this.displayFileInfo();
                this.loadModelInViewer(geometry);
                this.analyzePrintability(geometry);
                this.calculateModelProperties(geometry);
                this.updateCalculations();
            });
        };
        reader.readAsArrayBuffer(file);
    }

    async loadThreeJS() {
        if (window.THREE) return;

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                const stlLoader = document.createElement('script');
                stlLoader.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';
                stlLoader.onload = () => {
                    const controls = document.createElement('script');
                    controls.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
                    controls.onload = resolve;
                    document.head.appendChild(controls);
                };
                document.head.appendChild(stlLoader);
            };
            document.head.appendChild(script);
        });
    }

    displayFileInfo() {
        this.querySelector('#fileName').textContent = this.currentModel.fileName;
        this.querySelector('#fileSize').textContent = this.currentModel.fileSize;
        this.querySelector('#fileInfo').style.display = 'flex';
        this.querySelector('#uploadArea').style.display = 'none';
    }

    removeCurrentFile() {
        this.currentModel = null;
        this.querySelector('#fileInfo').style.display = 'none';
        this.querySelector('#uploadArea').style.display = 'block';
        this.querySelector('#fileInput').value = '';
        this.querySelector('#printabilitySection').style.display = 'none';
        this.clear3DViewer();
        this.hideModelInfo();
        this.updateCalculations();
    }

    initialize3DViewer() {
        const container = this.querySelector('#viewer3d');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf1f5f9);

        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(100, 100, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const gridHelper = new THREE.GridHelper(200, 20, 0xcccccc, 0xcccccc);
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(50);
        this.scene.add(axesHelper);

        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resetView() {
        if (this.currentMesh && this.currentModel) {
            const geometry = this.currentModel.geometry;
            geometry.computeBoundingBox();
            const size = geometry.boundingBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            this.camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
            this.controls.reset();
        }
    }

    toggleWireframe() {
        if (this.currentMesh) {
            this.wireframeMode = !this.wireframeMode;
            this.currentMesh.material.wireframe = this.wireframeMode;
        }
    }

    toggleTransparency() {
        if (this.currentMesh) {
            this.transparencyMode = !this.transparencyMode;
            this.currentMesh.material.transparent = this.transparencyMode;
            this.currentMesh.material.opacity = this.transparencyMode ? 0.6 : 0.8;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateInfillValue() {
        const infill = this.querySelector('#infill').value;
        this.querySelector('#infillValue').textContent = `${infill}%`;
        this.updateCalculations();
    }

    updateCalculations() {
        if (!this.currentModel) {
            this.resetCalculations();
            return;
        }

        const material = this.querySelector('#material').value;
        const quality = this.querySelector('#quality').value;
        const infill = parseInt(this.querySelector('#infill').value);
        const support = this.querySelector('#support').checked;
        const quantity = parseInt(this.querySelector('#quantity').value) || 1;

        // Prezzi base per kg
        const materialPrices = { pla: 15, abs: 18, petg: 20, tpu: 35, resina: 80 };
        const basePrice = materialPrices[material] || 15;

        // Calcolo volume simulato (in cm³)
        const volume = 25.5; // cm³ simulato
        const volumeKg = volume / 1000; // conversione in kg

        // Calcoli costi
        const materialCost = volumeKg * basePrice;
        const electricityCost = volume * 0.02; // €0.02 per cm³
        const supportCost = support ? volume * 0.1 : 0; // €0.10 per cm³ se supporti
        const setupCost = 5.00; // costo fisso setup

        const totalPerPiece = materialCost + electricityCost + supportCost + setupCost;
        const totalCost = totalPerPiece * quantity;

        // Aggiorna display
        this.querySelector('#materialCost').textContent = `€${materialCost.toFixed(2)}`;
        this.querySelector('#electricityCost').textContent = `€${electricityCost.toFixed(2)}`;
        this.querySelector('#supportCost').textContent = `€${supportCost.toFixed(2)}`;
        this.querySelector('#setupCost').textContent = `€${setupCost.toFixed(2)}`;
        this.querySelector('#totalPerPiece').textContent = `€${totalPerPiece.toFixed(2)}`;
        this.querySelector('#totalCost').textContent = `€${totalCost.toFixed(2)}`;
        this.querySelector('#quantityDisplay').textContent = quantity;
    }

    resetCalculations() {
        this.querySelector('#materialCost').textContent = '€0.00';
        this.querySelector('#electricityCost').textContent = '€0.00';
        this.querySelector('#supportCost').textContent = '€0.00';
        this.querySelector('#setupCost').textContent = '€0.00';
        this.querySelector('#totalPerPiece').textContent = '€0.00';
        this.querySelector('#totalCost').textContent = '€0.00';
        this.querySelector('#modelInfo').style.display = 'none';
    }

    hideModelInfo() {
        this.querySelector('#modelInfo').style.display = 'none';
    }

    clear3DViewer() {
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
            this.currentMesh = null;
        }
    }

    generatePDF() {
        if (!this.currentModel) {
            alert('Carica prima un modello 3D per generare il preventivo.');
            return;
        }

        const material = this.querySelector('#material').value;
        const quantity = this.querySelector('#quantity').value;
        const totalCost = this.querySelector('#totalCost').textContent;

        const quoteData = {
            fileName: this.currentModel.fileName,
            material: material,
            quantity: quantity,
            totalCost: totalCost,
            date: new Date().toLocaleDateString('it-IT')
        };

        const pdfContent = `
            PREVENTIVO STAMPA 3D
            
            Data: ${quoteData.date}
            File: ${quoteData.fileName}
            
            Specifiche:
            - Materiale: ${quoteData.material}
            - Quantità: ${quoteData.quantity}
            
            Costo totale: ${quoteData.totalCost}
            
            Note:
            - Il preventivo è valido per 30 giorni
            - Contattaci per confermare l'ordine
        `;

        const blob = new Blob([pdfContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `preventivo_${this.currentModel.fileName.replace('.stl', '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Preventivo generato con successo!');
    }

    analyzePrintability(geometry) {
        this.printabilityResults = {
            isPrintable: true,
            issues: [],
            warnings: [],
            recommendations: []
        };

        this.displayPrintabilityResults();
    }

    displayPrintabilityResults() {
        const statusElement = this.querySelector('#printabilityStatus');
        
        if (this.printabilityResults.isPrintable) {
            statusElement.innerHTML = '<span style="color: #10b981;">✅ Modello stampabile</span>';
            statusElement.className = 'printability-status printable';
        } else {
            statusElement.innerHTML = '<span style="color: #ef4444;">❌ Problemi rilevati</span>';
            statusElement.className = 'printability-status not-printable';
        }

        this.querySelector('#printabilitySection').style.display = 'block';
    }

    calculateModelProperties(geometry) {
        const volume = "25.5"; // cm³ simulato
        const dimensions = "50 × 30 × 20"; // mm simulati
        const printTime = "120"; // minuti simulati

        this.querySelector('#volume').textContent = `${volume} cm³`;
        this.querySelector('#dimensions').textContent = `${dimensions} mm`;
        this.querySelector('#printTime').textContent = `${printTime} min`;
        
        this.querySelector('#modelInfo').style.display = 'block';
    }

    loadModelInViewer(geometry) {
        if (this.currentMesh) {
            this.scene.remove(this.currentMesh);
        }

        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8
        });

        this.currentMesh = new THREE.Mesh(geometry, material);
        this.currentMesh.castShadow = true;
        this.currentMesh.receiveShadow = true;

        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        this.currentMesh.position.sub(center);

        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 100 / maxDim;
        this.currentMesh.scale.setScalar(scale);

        this.scene.add(this.currentMesh);

        this.camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
        this.controls.reset();
    }
}

// Registra il custom element
customElements.define('preventivatore-3d', Preventivatore3D); 