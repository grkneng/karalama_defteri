// md.js içeriği

// 1. AYARLAR VE TANIMLAR
const menuContainer = document.getElementById("markdown-menu-container");
const contentViewer = document.getElementById("markdown-content-viewer");
const documentsPath = "documents/"; // MD dosyalarının bulunduğu klasör
const documentIndexFile = "md.json"; // Yeni JSON dosyamız

// loadComponent utils.js'den otomatik gelir.

document.addEventListener("DOMContentLoaded", () => {
    // Bileşenleri yükle (md.html kök dizinde olduğu için level=0)
    if (window.loadComponent) {
        loadComponent("navbar-placeholder", "components/_navbar.html");
        loadComponent("footer-placeholder", "components/_footer.html");
    }

    loadMenuData();
});

// 2. MENÜ VERİSİNİ ASENKRON OLARAK ÇEK
async function loadMenuData() {
    try {
        const response = await fetch(documentIndexFile);

        if (!response.ok) {
            throw new Error(`Dizin dosyası bulunamadı: ${documentIndexFile}`);
        }

        const documentIndex = await response.json();

        // Menüyü oluştur ve ilk dokümanı yükle
        buildMenu(documentIndex);

        // Başlangıçta ilk dokümanı yükle (Varsa)
        if (documentIndex.length > 0) {
            loadAndRenderMarkdown(documentIndex[0].file);
        }
    } catch (error) {
        menuContainer.innerHTML = `<div class="p-3 alert alert-danger small">Hata: ${error.message}</div>`;
        console.error("Menü verileri yüklenemedi:", error);
    }
}

// 3. MENÜ OLUŞTURMA FONKSİYONU
function buildMenu(index) {
    if (!menuContainer) return;
    menuContainer.innerHTML = "";

    // Kategorilere göre grupla
    const grouped = index.reduce((acc, doc) => {
        const category = doc.category || "Genel Dokümanlar";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
    }, {});

    // Gruplanmış veriyi Array.map/join kullanarak DOM'a ekle
    const menuHtml = Object.keys(grouped)
        .map((category) => {
            // Kategori Başlığı
            let categoryHtml = `<a href="#" class="list-group-item list-group-item-action list-group-item-primary fw-bold">${category}</a>`;

            // Doküman Bağlantıları
            const docLinks = grouped[category]
                .map(
                    (doc) => `
            <a href="#" class="list-group-item list-group-item-action" data-file="${doc.file}">
                <i class="bi bi-file-earmark-text me-2"></i> ${doc.title}
            </a>
        `
                )
                .join("");

            return categoryHtml + docLinks;
        })
        .join("");

    menuContainer.innerHTML = menuHtml;

    // Tıklama olaylarını dinle
    menuContainer.addEventListener("click", handleMenuClick);
}

// 4. MENÜ TIKLAMA İŞLEYİCİSİ
function handleMenuClick(event) {
    const target = event.target.closest("[data-file]");
    if (target) {
        event.preventDefault();

        // Aktif sınıfı temizle
        menuContainer.querySelectorAll(".list-group-item-action").forEach((item) => {
            item.classList.remove("active");
        });

        // Tıklananı aktif yap
        target.classList.add("active");

        const fileName = target.dataset.file;
        loadAndRenderMarkdown(fileName);
    }
}

// 5. MARKDOWN YÜKLEME VE RENDER ETME FONKSİYONU
async function loadAndRenderMarkdown(fileName) {
    if (!contentViewer) return;

    contentViewer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Doküman yükleniyor: ${fileName}</p>
        </div>
    `;

    try {
        const response = await fetch(`${documentsPath}${fileName}`);

        if (!response.ok) {
            throw new Error(`Dosya bulunamadı: ${fileName}`);
        }

        const markdownText = await response.text();

        // Marked.js kullanarak Markdown'ı HTML'e çevir
        const htmlContent = marked.parse(markdownText);

        // HTML içeriğini DOM'a yerleştir
        contentViewer.innerHTML = `
            <article class="p-4 article-content">
                ${htmlContent}
            </article>
        `;

        // Eğer varsa KaTeX formüllerini işle
        if (window.renderMathInElement) {
            window.renderMathInElement(contentViewer, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false }
                ]
            });
        }
        // Eğer varsa Highlight.js ile kod bloklarını renklendir
        if (window.hljs) {
            contentViewer.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    } catch (error) {
        contentViewer.innerHTML = `
            <div class="alert alert-danger m-4">
                <h4>Hata Oluştu!</h4>
                <p>Doküman yüklenirken bir sorun meydana geldi: ${error.message}</p>
                <p>Lütfen dosya yolunu ve adını kontrol edin: <code>${documentsPath}${fileName}</code></p>
            </div>
        `;
        console.error("Markdown yükleme hatası:", error);
    }
}