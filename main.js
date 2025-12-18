/**
 * MAIN.JS - Final Sürüm (Index, Blog ve Data Sayfaları İçin Ortak Kontrolcü)
 */

/* ==========================================================================
   AYARLAR & GLOBAL DEĞİŞKENLER
   ========================================================================== */

// Google Sheet CSV Linki (Kendi linkinizi buraya yapıştırın)
const SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3DjzYkFR-P4bZ-Xg3F77W2tFM2Bj0NBm2VadOeK_F9kyf1364wr5IDsgKwlx6Gh8Ku1_VUcUCuryq/pub?output=csv";

// Blog Değişkenleri
let allBlogData = [];
let currentBlogIndex = 0;
const blogBatchSize = 5;
let isBlogLoading = false;

// Kaynak (Resource) Değişkenleri
let allResources = []; // Tüm ham veri
let filteredResources = []; // Filtrelenmiş veri
let currentResourceIndex = 0;
const resourceBatchSize = 50; // Performans için 50'şer gösterim

/* ==========================================================================
   BAŞLATICI (DOM LOADED)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Ortak Bileşenleri (MathJax, Highlight) Başlat
    initCommonComponents();

    // 2. Sayfa Özel Kontrolleri

    // A) Blog Sayfası (blog.html)
    if (document.getElementById("feed-stream")) {
        initFeed();
    }

    // B) Kaynaklar Sayfası (data.html)
    if (document.getElementById("resource-stream")) {
        initResources();
    }

    // C) Makale Sayfası - İçindekiler Tablosu (index.html)
    if (document.getElementById("toc-list")) {
        generateTableOfContents();
    }

    // D) Makale Sayfası - Grafik (index.html)
    if (document.getElementById("exampleChart")) {
        createChart(
            "exampleChart",
            "line",
            {
                labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs"],
                datasets: [
                    {
                        label: "Etkileşim Verisi",
                        data: [12, 19, 3, 5, 2, 3],
                        borderColor: "#0d6efd",
                        backgroundColor: "rgba(13, 110, 253, 0.1)",
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            {
                responsive: true,
                maintainAspectRatio: false
            }
        );
    }
});

/* ==========================================================================
   ORTAK BİLEŞENLER (MathJax & Highlight.js)
   ========================================================================== */
function initCommonComponents() {
    // 1. MathJax Konfigürasyonu ve Tetikleme
    // index.html'de script defer ile yüklendiği için window.MathJax nesnesi
    // DOMContentLoaded anında hazır olmayabilir veya config eksik olabilir.

    if (window.MathJax) {
        // Eğer config objesi yoksa oluştur
        window.MathJax.config = window.MathJax.config || {};

        // TeX ayarlarını yap (Hem $ inline hem $$ blok için)
        window.MathJax.config.tex = {
            inlineMath: [
                ["$", "$"],
                ["\\(", "\\)"]
            ],
            displayMath: [
                ["$$", "$$"],
                ["\\[", "\\]"]
            ],
            processEscapes: true
        };

        // Başlangıç ayarları
        window.MathJax.config.startup = {
            ready: () => {
                window.MathJax.startup.defaultReady();
            }
        };

        // Eğer MathJax yüklendiyse ve typesetPromise fonksiyonu varsa sayfayı tara
        if (window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise().catch((err) => console.log("MathJax Typeset Error:", err));
        }
    }

    // 2. Highlight.js (Kod Renklendirme)
    if (window.hljs) {
        document.querySelectorAll("pre code").forEach((el) => {
            // Zaten işlenmişse atla
            if (!el.dataset.highlighted) {
                hljs.highlightElement(el);
                el.dataset.highlighted = "yes";
            }
        });
    }
}

// Yardımcı: Diziyi Karıştırma
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Yardımcı: Scroll Algılama (Sonsuz Kaydırma İçin)
function handleScroll(callback) {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // Sayfa sonuna 100px kala tetikle
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        callback();
    }
}

/* ==========================================================================
   BÖLÜM 1: BLOG AKIŞI (data.json) - blog.html
   ========================================================================== */
async function initFeed() {
    const feedStream = document.getElementById("feed-stream");
    const loadingIndicator = document.getElementById("loading-indicator");

    try {
        const response = await fetch("data.json");
        const data = await response.json();

        allBlogData = shuffleArray(data); // Rastgele sırala
        loadMorePosts(); // İlk partiyi yükle

        window.addEventListener("scroll", () => handleScroll(loadMorePosts));
    } catch (error) {
        console.error("Blog verisi hatası:", error);
        if (loadingIndicator) loadingIndicator.style.display = "none";
        feedStream.innerHTML = '<div class="p-4 text-center text-danger">Blog verisi yüklenemedi.</div>';
    }
}

function loadMorePosts() {
    if (isBlogLoading) return;
    isBlogLoading = true;

    const loadingIndicator = document.getElementById("loading-indicator");
    const feedStream = document.getElementById("feed-stream");

    setTimeout(() => {
        const nextData = allBlogData.slice(currentBlogIndex, currentBlogIndex + blogBatchSize);

        if (nextData.length === 0) {
            if (loadingIndicator) loadingIndicator.innerHTML = '<p class="text-muted small">Tüm içerik yüklendi.</p>';
            isBlogLoading = false;
            return;
        }

        nextData.forEach((post) => renderPostCard(post, feedStream));
        currentBlogIndex += blogBatchSize;
        isBlogLoading = false;
    }, 400);
}

function renderPostCard(post, container) {
    let mediaContent = "";

    if (post.media_type === "image") {
        mediaContent = `<img src="${post.media_url[0]}" class="post-img mb-3" loading="lazy">`;
    } else if (post.media_type === "video") {
        mediaContent = `<div class="ratio ratio-16x9 mb-3"><iframe src="${post.media_url[0]}" allowfullscreen loading="lazy"></iframe></div>`;
    } else if (post.media_type === "gallery") {
        const cId = `carousel-${post.id}`;
        let indicators = post.media_url
            .map(
                (_, i) =>
                    `<button type="button" data-bs-target="#${cId}" data-bs-slide-to="${i}" class="${i === 0 ? "active" : ""}"></button>`
            )
            .join("");
        let items = post.media_url
            .map(
                (url, i) =>
                    `<div class="carousel-item ${i === 0 ? "active" : ""}"><img src="${url}" class="d-block w-100 post-img" loading="lazy"></div>`
            )
            .join("");

        mediaContent = `
        <div id="${cId}" class="carousel slide mb-3">
            <div class="carousel-indicators">${indicators}</div>
            <div class="carousel-inner">${items}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${cId}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
            <button class="carousel-control-next" type="button" data-bs-target="#${cId}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
        </div>`;
    }

    const html = `
    <article class="post-card d-flex gap-3">
        <div class="flex-shrink-0">
            <img src="${post.avatar}" class="author-avatar">
        </div>
        <div class="flex-grow-1">
            <div class="author-info mb-1">
                <span class="author-name">${post.author}</span>
                <span class="author-handle">${post.email}</span>
            </div>
            <div class="post-content">
                ${post.title ? `<h6 class="post-title">${post.title}</h6>` : ""}
                <p class="post-text">${post.text}</p>
            </div>
            ${mediaContent}
            <div class="post-meta d-flex justify-content-between align-items-center">
                <span>${post.meta_text}</span>
                <a href="${post.read_more || "#"}" class="btn btn-dark btn-sm rounded-pill px-3 fw-bold" style="font-size: 0.8rem;">Detay</a>
            </div>
        </div>
    </article>`;
    container.insertAdjacentHTML("beforeend", html);
}

/* ==========================================================================
   BÖLÜM 2: KAYNAKLAR (CSV) - data.html
   ========================================================================== */
async function initResources() {
    const container = document.getElementById("resource-stream");
    const loadingIndicator = document.getElementById("loading-indicator");
    const searchInput = document.getElementById("resource-search");
    const loadMoreBtn = document.getElementById("btn-load-more");

    try {
        let csvText = "";

        if (SHEET_CSV_URL.includes("docs.google.com")) {
            const response = await fetch(SHEET_CSV_URL);
            csvText = await response.text();
        } else {
            console.warn("CSV Linki girilmedi, test verisi.");
            csvText = `Kategori,Başlık,Açıklama,Link
Yapay Zeka,ChatGPT Rehberi,Prompt teknikleri.,https://openai.com
Frontend,Bootstrap 5,CSS Framework.,https://getbootstrap.com
Tasarım,Figma,UI Aracı.,https://figma.com
Backend,Node.js,Js Runtime.,https://nodejs.org
Yapay Zeka,Midjourney,Görsel üretim.,https://midjourney.com`;
        }

        allResources = parseCSV(csvText);
        allResources = shuffleArray(allResources);

        filteredResources = [...allResources];
        loadingIndicator.style.display = "none";

        setupCategoryFilters();

        if (searchInput) {
            searchInput.addEventListener("input", (e) => filterResources(e.target.value));
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", () => renderResourceBatch());
        }

        renderResourceBatch();
    } catch (error) {
        console.error("CSV Hatası:", error);
        loadingIndicator.style.display = "none";
        container.innerHTML = '<div class="alert alert-danger">Veri çekilemedi.</div>';
    }
}

function setupCategoryFilters() {
    const filterContainer = document.getElementById("category-filter-container");
    if (!filterContainer) return;

    const categories = [...new Set(allResources.map((item) => item.category))].sort();
    let html = `<button class="btn btn-sm btn-dark category-btn active" data-cat="all">Tümü</button>`;

    categories.forEach((cat) => {
        html += `<button class="btn btn-sm btn-outline-secondary category-btn" data-cat="${cat}">${cat}</button>`;
    });

    filterContainer.innerHTML = html;

    document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".category-btn").forEach((b) => {
                b.classList.remove("btn-dark", "active");
                b.classList.add("btn-outline-secondary");
            });
            e.target.classList.remove("btn-outline-secondary");
            e.target.classList.add("btn-dark", "active");

            const cat = e.target.getAttribute("data-cat");
            const searchText = document.getElementById("resource-search").value;
            filterResources(searchText, cat);
        });
    });
}

function filterResources(searchText = "", category = "all") {
    if (category === "all") {
        const activeBtn = document.querySelector(".category-btn.active");
        if (activeBtn) category = activeBtn.getAttribute("data-cat");
    }

    const term = searchText.toLowerCase().trim();

    filteredResources = allResources.filter((item) => {
        const matchesSearch =
            item.title.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term) ||
            item.desc.toLowerCase().includes(term);
        const matchesCategory = category === "all" || item.category === category;
        return matchesSearch && matchesCategory;
    });

    currentResourceIndex = 0;
    document.getElementById("resource-stream").innerHTML = "";
    document.getElementById("load-more-container").classList.add("d-none");

    renderResourceBatch();
}

function renderResourceBatch() {
    const container = document.getElementById("resource-stream");
    const loadMoreContainer = document.getElementById("load-more-container");

    if (filteredResources.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">Sonuç bulunamadı.</div>';
        loadMoreContainer.classList.add("d-none");
        return;
    }

    const nextBatch = filteredResources.slice(currentResourceIndex, currentResourceIndex + resourceBatchSize);
    nextBatch.forEach((item) => renderResourceItem(item, container));
    currentResourceIndex += resourceBatchSize;

    if (currentResourceIndex < filteredResources.length) {
        loadMoreContainer.classList.remove("d-none");
    } else {
        loadMoreContainer.classList.add("d-none");
    }
}

function renderResourceItem(item, container) {
    const html = `
    <div class="resource-item py-3">
        <h6 class="mb-1 fw-bold">
            <a href="${item.link}" target="_blank" class="text-decoration-none text-dark hover-primary">
                ${item.title}
                <i class="bi bi-box-arrow-up-right ms-1 text-muted small" style="font-size: 0.75rem;"></i>
            </a>
        </h6>
        <p class="text-muted small mb-2">${item.desc}</p>
        <div>
            <span class="badge bg-light text-dark border fw-normal">
                <i class="bi bi-hash me-1 text-secondary opacity-50"></i>${item.category}
            </span>
        </div>
    </div>
    <hr class="text-muted opacity-25 my-1" />
    `;
    container.insertAdjacentHTML("beforeend", html);
}

function parseCSV(text) {
    const lines = text.trim().split("\n");
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 3) {
            result.push({
                category: cols[0].replace(/"/g, "").trim(),
                title: cols[1].replace(/"/g, "").trim(),
                desc: cols[2].replace(/"/g, "").trim(),
                link: cols[3] ? cols[3].replace(/"/g, "").trim() : "#"
            });
        }
    }
    return result;
}

/* ==========================================================================
   BÖLÜM 3: MAKALE SAYFASI (index.html) - TOC & Chart
   ========================================================================== */

// 1. İçindekiler Tablosu (TOC) Oluşturucu
function generateTableOfContents() {
    const tocContainer = document.getElementById("toc-list");
    // Article içindeki Sectionların içindeki H5 başlıklarını hedefle
    const headings = document.querySelectorAll("article section > h5");

    if (!tocContainer || headings.length === 0) return;

    tocContainer.innerHTML = "";

    headings.forEach((heading, index) => {
        // Eğer başlığın içinde bulunduğu section'ın ID'si varsa onu al
        // Yoksa başlığın kendi ID'si, o da yoksa otomatik oluştur
        const parentSection = heading.closest("section");
        if (!parentSection.id) {
            parentSection.id = `section-${index}`;
        }
        const targetId = parentSection.id;

        const link = document.createElement("a");
        link.className = "nav-link";
        link.href = `#${targetId}`;
        link.innerText = heading.innerText;

        const listItem = document.createElement("li");
        listItem.className = "nav-item";
        listItem.appendChild(link);
        tocContainer.appendChild(listItem);
    });

    // ScrollSpy (Kaydırdıkça aktif olanı işaretle)
    window.addEventListener("scroll", () => {
        let current = "";
        const sections = document.querySelectorAll("article section");

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            // 150px ofset payı
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute("id");
            }
        });

        document.querySelectorAll("#toc-list .nav-link").forEach((a) => {
            a.classList.remove("active");
            // href="#id" olduğu için includes ile kontrol ediyoruz
            if (current && a.getAttribute("href").includes(current)) {
                a.classList.add("active");
            }
        });
    });
}

// 2. Chart.js Grafik Oluşturucu
function createChart(canvasId, type, data, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Chart.js yüklenmemişse hata vermesin
    if (typeof Chart === "undefined") {
        console.warn("Chart.js kütüphanesi yüklenemedi.");
        return;
    }

    // Varsa eski grafiği temizle (Canvas reuse hatasını önler)
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: type,
        data: data,
        options: options
    });
}