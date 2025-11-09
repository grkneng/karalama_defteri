// =================================================================
// UTILITY FONKSİYONLARI (js/utils.js) - KESİN ÇÖZÜM
// Not: Yol çözümlemesi sorumluluğu çağıran dosyaya (article_00X.html) aittir.
// =================================================================

/**
 * HTML özel karakterlerini (>, <, & vb.) güveli hale getirir.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * ISO tarih dizesini yerel (tr-TR) okunabilir formata çevirir.
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

/**
 * Bir URL'den temiz domain adını (hostname) çıkarır.
 */
function getDomainFromUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    } catch (e) {
        return 'Kaynak';
    }
}

/**
 * Harici bir HTML dosyasını belirtilen DOM elementine yükler (Navbar/Footer gibi).
 * @param {string} elementId - İçeriğin yükleneceği DOM elementinin ID'si.
 * @param {string} filePath - Yüklenecek HTML dosyasının yolu (Örn: components/_navbar.html VEYA ../components/_navbar.html).
 */
async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Yol çözümlemesi çağrı yapan tarafından yapıldığı için, direkt olarak çağrılan yolu kullan
    const finalPath = filePath; 
    
    try {
        const response = await fetch(finalPath);
        if (!response.ok) {
            console.error(`Bileşen yüklenemedi: ${finalPath} (HTTP ${response.status})`);
            throw new Error(`Bileşen yüklenemedi (Yol: ${finalPath})`);
        }
        
        element.innerHTML = await response.text();
    } catch (error) {
        console.error('Bileşen yükleme hatası:', error);
        element.innerHTML = `<div class="alert alert-danger">Bileşen yüklenirken hata oluştu: ${error.message}</div>`;
    }
}