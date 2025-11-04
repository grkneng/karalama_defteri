// =================================================================
// UTILITY FONKSİYONLARI (js/utils.js)
// =================================================================

/**
 * HTML özel karakterlerini (>, <, & vb.) güveli hale getirir.
 * XSS saldırılarına karşı koruma sağlar.
 * @param {string} text - Temizlenecek metin.
 * @returns {string} Güvenli HTML metni.
 */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * ISO tarih dizesini yerel (tr-TR) okunabilir formata çevirir.
 * Örn: "2025-11-02" -> "2 Kasım 2025"
 * @param {string} dateString - ISO formatında tarih dizesi.
 * @returns {string} Formatlanmış tarih.
 */
function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("tr-TR", options);
}

/**
 * Bir URL'den temiz domain adını (hostname) çıkarır.
 * @param {string} url - URL adresi.
 * @returns {string} Temiz domain adı.
 */
function getDomainFromUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        // 'www.' önekini kaldır
        return hostname.startsWith("www.") ? hostname.substring(4) : hostname;
    } catch (e) {
        return "Kaynak";
    }
}

/**
 * Harici bir HTML dosyasını belirtilen DOM elementine yükler (Navbar/Footer gibi).
 * @param {string} elementId - İçeriğin yükleneceği DOM elementinin ID'si.
 * @param {string} filePath - Yüklenecek HTML dosyasının yolu.
 * @param {number} level - Göreceli yol için (0: kök, 1: posts/ klasörü).
 */
async function loadComponent(elementId, filePath, level = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // level 1 ise (posts/ içindeki sayfalar) yolu ../components/... yapar
    const pathPrefix = level === 1 ? "../" : "";
    const fullPath = `${pathPrefix}${filePath}`;

    try {
        const response = await fetch(fullPath);
        if (!response.ok) throw new Error(`Bileşen yüklenemedi: ${fullPath}`);

        element.innerHTML = await response.text();
    } catch (error) {
        console.error("Bileşen yükleme hatası:", error);
        element.innerHTML = `<div class="alert alert-danger">Bileşen yüklenirken hata oluştu.</div>`;
    }
}