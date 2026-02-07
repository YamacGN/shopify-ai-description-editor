// Global state
let products = [];
let currentProduct = null;
let selectedProducts = new Set();
let API_BASE_URL = ''; // Will be loaded from config

// DOM Elements
const searchInput = document.getElementById('search-input');
const loadProductsBtn = document.getElementById('load-products-btn');
const productsContainer = document.getElementById('products-container');
const editorSection = document.getElementById('editor-section');
const productTitle = document.getElementById('product-title');
const productId = document.getElementById('product-id');
const currentDescription = document.getElementById('current-description');
const improvedDescription = document.getElementById('improved-description');
const improveBtn = document.getElementById('improve-btn');
const saveBtn = document.getElementById('save-btn');
const statusIndicator = document.getElementById('status-indicator');
const messageContainer = document.getElementById('message-container');

// Batch elements
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const processBatchBtn = document.getElementById('process-batch-btn');
const batchProducts = document.getElementById('batch-products');
const batchProgress = document.getElementById('batch-progress');
const batchResults = document.getElementById('batch-results');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// Load API configuration
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        API_BASE_URL = config.apiBaseUrl || '';
        console.log('API Base URL:', API_BASE_URL || 'Same server');
    } catch (error) {
        console.warn('Could not load config, using same-server API:', error);
        API_BASE_URL = '';
    }
}

// Helper function to build API URL
function getApiUrl(endpoint) {
    return API_BASE_URL + endpoint;
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Load batch products when switching to batch tab
        if (tabName === 'batch' && products.length > 0) {
            renderBatchProducts();
        }
    });
});

// Check server health
async function checkHealth() {
    try {
        const response = await fetch(getApiUrl('/api/health'));
        const data = await response.json();
        
        if (data.status === 'ok' && data.shopifyConfigured && data.openaiConfigured) {
            statusIndicator.style.background = '#008060';
            showMessage('Sistem hazır', 'success');
        } else {
            statusIndicator.style.background = '#ffc453';
            showMessage('Konfigürasyon eksik. .env dosyasını kontrol edin', 'error');
        }
    } catch (error) {
        statusIndicator.style.background = '#d82c0d';
        showMessage('Sunucu bağlantısı kurulamadı', 'error');
    }
}

// Show message
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messageContainer.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Load products
loadProductsBtn.addEventListener('click', async () => {
    loadProductsBtn.disabled = true;
    loadProductsBtn.innerHTML = '<span class="loading"></span> Yükleniyor...';
    
    try {
        const response = await fetch(getApiUrl('/api/products'));
        if (!response.ok) throw new Error('Ürünler yüklenemedi');
        
        products = await response.json();
        renderProducts(products);
        showMessage(`${products.length} ürün yüklendi`, 'success');
    } catch (error) {
        showMessage(error.message, 'error');
        productsContainer.innerHTML = '<div class="empty-state"><p>❌ Ürünler yüklenirken hata oluştu</p></div>';
    } finally {
        loadProductsBtn.disabled = false;
        loadProductsBtn.innerHTML = 'Ürünleri Yükle';
    }
});

// Search products
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.body_html && p.body_html.toLowerCase().includes(query))
    );
    renderProducts(filtered);
});

// Render products
function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productsContainer.innerHTML = '<div class="empty-state"><p>Ürün bulunamadı</p></div>';
        return;
    }
    
    productsContainer.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            ${product.image ? `<img src="${product.image.src}" alt="${product.title}" class="product-image">` : '<div class="product-image"></div>'}
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>ID: ${product.id}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const product = products.find(p => p.id.toString() === id);
            if (product) selectProduct(product);
        });
    });
}

// Select product
function selectProduct(product) {
    currentProduct = product;
    
    productTitle.textContent = product.title;
    productId.textContent = `ID: ${product.id}`;
    currentDescription.innerHTML = product.body_html || '<p style="color: #999;">Açıklama yok</p>';
    improvedDescription.innerHTML = '';
    
    editorSection.style.display = 'block';
    saveBtn.style.display = 'none';
    
    // Scroll to editor
    editorSection.scrollIntoView({ behavior: 'smooth' });
}

// Improve description
improveBtn.addEventListener('click', async () => {
    if (!currentProduct) return;
    
    improveBtn.disabled = true;
    improveBtn.innerHTML = '<span class="loading"></span> İyileştiriliyor...';
    
    try {
        const response = await fetch(getApiUrl('/api/improve-description'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentDescription: currentProduct.body_html,
                productTitle: currentProduct.title
            })
        });
        
        if (!response.ok) throw new Error('İyileştirme başarısız');
        
        const data = await response.json();
        improvedDescription.innerHTML = data.improvedDescription;
        saveBtn.style.display = 'block';
        showMessage('Açıklama iyileştirildi!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        improveBtn.disabled = false;
        improveBtn.innerHTML = '✨ AI ile İyileştir';
    }
});

// Save description
saveBtn.addEventListener('click', async () => {
    if (!currentProduct) return;
    
    const newDescription = improvedDescription.innerHTML;
    if (!newDescription.trim()) {
        showMessage('Açıklama boş olamaz', 'error');
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading"></span> Kaydediliyor...';
    
    try {
        const response = await fetch(getApiUrl(`/api/products/${currentProduct.id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newDescription })
        });
        
        if (!response.ok) throw new Error('Kayıt başarısız');
        
        currentProduct.body_html = newDescription;
        currentDescription.innerHTML = newDescription;
        saveBtn.style.display = 'none';
        
        showMessage('Ürün Shopify\'a kaydedildi!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Shopify\'a Kaydet';
    }
});

// Batch processing
function renderBatchProducts() {
    if (products.length === 0) {
        batchProducts.innerHTML = '<div class="empty-state"><p>Önce "Tekli Düzenleme" sekmesinden ürünleri yükleyin</p></div>';
        return;
    }
    
    batchProducts.innerHTML = products.map(product => `
        <div class="batch-item">
            <input type="checkbox" class="batch-checkbox" data-id="${product.id}">
            ${product.image ? `<img src="${product.image.src}" alt="${product.title}" class="product-image">` : '<div class="product-image"></div>'}
            <div class="product-info">
                <h3>${product.title}</h3>
                <p>ID: ${product.id}</p>
            </div>
        </div>
    `).join('');
    
    // Add checkbox handlers
    document.querySelectorAll('.batch-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) {
                selectedProducts.add(id);
            } else {
                selectedProducts.delete(id);
            }
            updateBatchButton();
        });
    });
}

function updateBatchButton() {
    processBatchBtn.disabled = selectedProducts.size === 0;
    processBatchBtn.textContent = `Seçilenleri İşle (${selectedProducts.size})`;
}

selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.batch-checkbox').forEach(checkbox => {
        checkbox.checked = true;
        selectedProducts.add(checkbox.getAttribute('data-id'));
    });
    updateBatchButton();
});

deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.batch-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedProducts.clear();
    updateBatchButton();
});

processBatchBtn.addEventListener('click', async () => {
    if (selectedProducts.size === 0) return;
    
    const selectedProductsArray = products.filter(p => selectedProducts.has(p.id.toString()));
    
    processBatchBtn.disabled = true;
    selectAllBtn.disabled = true;
    deselectAllBtn.disabled = true;
    
    batchProgress.style.display = 'block';
    batchResults.innerHTML = '';
    
    let processed = 0;
    const total = selectedProductsArray.length;
    
    progressFill.style.width = '0%';
    progressText.textContent = `0 / ${total}`;
    
    try {
        const response = await fetch(getApiUrl('/api/improve-bulk'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                products: selectedProductsArray.map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.body_html
                }))
            })
        });
        
        if (!response.ok) throw new Error('Toplu işlem başarısız');
        
        const data = await response.json();
        
        // Display results
        data.results.forEach((result, index) => {
            processed++;
            const progress = (processed / total) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${processed} / ${total}`;
            
            const product = selectedProductsArray.find(p => p.id.toString() === result.id.toString());
            const resultDiv = document.createElement('div');
            resultDiv.className = `result-item ${result.success ? 'success' : 'error'}`;
            resultDiv.innerHTML = `
                <strong>${product.title}</strong><br>
                ${result.success ? '✅ İyileştirildi' : `❌ Hata: ${result.error}`}
            `;
            batchResults.appendChild(resultDiv);
        });
        
        showMessage('Toplu işlem tamamlandı!', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        processBatchBtn.disabled = false;
        selectAllBtn.disabled = false;
        deselectAllBtn.disabled = false;
    }
});

// Initialize
(async function init() {
    await loadConfig();
    checkHealth();
})();
