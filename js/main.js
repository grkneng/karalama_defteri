// =================================================================
// 1. GLOBAL SABİTLER VE DEĞİŞKENLER
// =================================================================

// Feed verisini çekme ve Lazy Loading için değişkenler
let allPosts = [];
let loadedPosts = 0;
const POSTS_PER_PAGE = 3;
let isLoading = false;

// =================================================================
// 2. İLK BAŞLATMA
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
    // Bileşenleri yükle (index.html kök dizinde olduğu için level=0)
    if (window.loadComponent) {
        loadComponent("navbar-placeholder", "components/_navbar.html");
        loadComponent("footer-placeholder", "components/_footer.html");
    }

    // Ana Feed'i yükle
    loadFeedData();

    // Hacker News kartını yükle
    loadHackerNews("hackerNewsContainer");
});

// =================================================================
// 3. ANA FEED (POSTS) YÖNETİMİ
// =================================================================

async function loadFeedData() {
    try {
        const response = await fetch("feed.json");
        const data = await response.json();
        allPosts = data.posts;

        // Container'ı temizle
        const container = document.getElementById("feedContainer");
        container.innerHTML = "";

        // İlk batch'i yükle
        loadMorePosts();

        // Scroll event listener ekle (Lazy Loading)
        window.addEventListener("scroll", handleLazyLoading);
    } catch (error) {
        console.error("Feed verileri yüklenemedi:", error);
        document.getElementById("feedContainer").innerHTML =
            '<div class="alert alert-danger">Veriler yüklenirken hata oluştu.</div>';
    }
}

function loadMorePosts() {
    if (isLoading || loadedPosts >= allPosts.length) {
        return; // Zaten yükleniyorsa veya tüm postlar yüklendiyse dur
    }

    isLoading = true; // Yüklemeye başla, kilitle
    updateLoadingIndicator(); // Yükleme indikatörünü göster

    // Yükleme animasyonunu veya gecikmesini simüle etmek için timeout
    setTimeout(() => {
        const container = document.getElementById("feedContainer");
        const start = loadedPosts;
        const end = Math.min(start + POSTS_PER_PAGE, allPosts.length);

        // Önceki yükleme indikatörünü kaldır (varsa)
        let indicator = document.getElementById("loadingIndicator");
        if (indicator) {
            indicator.remove();
        }

        for (let i = start; i < end; i++) {
            const post = allPosts[i];
            const card = createCard(post);
            container.appendChild(card);
        }

        loadedPosts = end;
        isLoading = false; // Yükleme bitti, kilidi aç

        // Yükleme indikatörünü/son mesajı güncelle
        updateLoadingIndicator();
    }, 500); // 500ms simülasyon gecikmesi
}

function createCard(post) {
    const card = document.createElement("div");
    card.className = "card feed-card mb-4 fade-in";

    // Makale linkini articlePath ile oluştur
    const articleLink = `posts/${post.articlePath}?id=${post.id}`;

    // NOT: escapeHtml, formatDate utils.js'den otomatik geliyor.
    let cardContent = `
        <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="card-title mb-1">${escapeHtml(post.title)}</h5>
                    <p class="card-text text-muted small mb-0">${escapeHtml(post.description)}</p>
                </div>
                <span class="badge bg-primary">${post.category}</span>
            </div>
        </div>
        <div class="card-body">
    `;

    // Kart tipine göre içerik oluştur
    if (post.type === "text") {
        cardContent += `<p class="card-text">${escapeHtml(post.content)}</p>`;
    } else if (post.type === "image") {
        cardContent += `
            <img src="${post.image}" alt="${escapeHtml(post.title)}" class="card-img-top mb-3 rounded">
            <p class="card-text">${escapeHtml(post.content)}</p>
        `;
    } else if (post.type === "video") {
        cardContent += `
            <div class="ratio ratio-16x9 mb-3">
                <iframe src="${post.video}" title="${escapeHtml(post.title)}" allowfullscreen></iframe>
            </div>
            <p class="card-text">${escapeHtml(post.content)}</p>
        `;
    }

    cardContent += `
        </div>
        <div class="card-footer bg-light">
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                    <strong>${escapeHtml(post.author)}</strong> • ${formatDate(post.date)} • ${post.readTime} dk oku
                </small>
                <a href="${articleLink}" class="btn btn-sm btn-outline-primary">
                    Detay
                </a>
            </div>
        </div>
    `;

    card.innerHTML = cardContent;
    return card;
}

function handleLazyLoading() {
    const feedContainer = document.getElementById("feedContainer");
    const lastCard = feedContainer.lastElementChild;

    // Sadece tüm postlar yüklenmediyse ve o an bir yükleme yoksa devam et
    if (!lastCard || loadedPosts >= allPosts.length || isLoading) {
        return;
    }

    const rect = lastCard.getBoundingClientRect();

    // Son kart ekranın 300px altında görülürse, daha fazla post yükle
    if (rect.bottom - window.innerHeight < 300) {
        loadMorePosts();
    }
}

/**
 * Yükleme durumunu ve son mesajı günceller (Sadeleştirildi).
 */
function updateLoadingIndicator() {
    const container = document.getElementById("feedContainer");
    let indicator = document.getElementById("loadingIndicator");

    if (loadedPosts >= allPosts.length) {
        // Tüm postlar yüklendiğinde indikatörü kaldır
        if (indicator) indicator.remove();

        // Son mesajı göster (Eğer daha önce eklenmediyse)
        if (!container.querySelector(".alert-info.text-center")) {
            const endMessage = document.createElement("div");
            endMessage.className = "alert alert-info text-center mt-4";
            endMessage.textContent = "✓ Tüm yazılar yüklendi.";
            container.appendChild(endMessage);
        }
    } else if (isLoading && !indicator) {
        // Yükleme varsa ve indikatör yoksa, oluştur
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingIndicator";
        loadingDiv.className = "text-center mt-4";
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
        `;
        container.appendChild(loadingDiv);
    } else if (!isLoading && indicator) {
        indicator.remove();
    }
}

// =================================================================
// 4. HACKER NEWS ENTEGRASYONU (Optimize Edildi)
// =================================================================

/**
 * Hacker News'ten en yeni 20 haberi çeker ve kartı günceller.
 * getDomainFromUrl ve escapeHtml utils.js'den alınır.
 * @param {string} containerId - Haberlerin listeleneceği HTML elementinin ID'si
 */
async function loadHackerNews(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // API endpointleri fonksiyon içine taşındı
    const HN_NEW_STORIES = "https://hacker-news.firebaseio.com/v0/newstories.json";
    const HN_ITEM_BASE = "https://hacker-news.firebaseio.com/v0/item/";

    // Yükleniyor durumu
    container.innerHTML = `
        <div class="text-center p-3">
            <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
            <p class="mt-1 small text-muted mb-0">Hacker News verileri yükleniyor...</p>
        </div>
    `;

    try {
        // 1. En yeni 500 haberin ID'lerini çek
        const response = await fetch(HN_NEW_STORIES);
        if (!response.ok) throw new Error("HN ID'leri yüklenemedi.");

        const itemIds = await response.json();
        const top20Ids = itemIds.slice(0, 20);

        // 2. İlk 20 haberin detaylarını paralel olarak çek (Promise.all)
        const storyPromises = top20Ids.map((id) => fetch(`${HN_ITEM_BASE}${id}.json`).then((res) => res.json()));

        const stories = await Promise.all(storyPromises);

        // 3. HTML listesini oluştur
        const listHtml = stories
            .filter((story) => story && story.url)
            .map((story) => {
                // getDomainFromUrl utils.js'den geliyor.
                const domain = getDomainFromUrl(story.url);
                const timeAgo = new Date(story.time * 1000).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "numeric"
                });

                return `
                    <a href="${story.url}" class="list-group-item list-group-item-action text-decoration-none p-3" target="_blank">
                        <h6 class="mb-1 fw-normal text-dark">${escapeHtml(story.title)}</h6> 
                        <p class="small text-muted mb-0">
                            <i class="bi bi-link-45deg me-1"></i> ${domain} 
                            &bull; ${timeAgo}
                        </p>
                    </a>
                `;
            })
            .join("");

        // 4. Kartı güncel içerikle doldur
        container.innerHTML = listHtml;
    } catch (error) {
        console.error("Hacker News yüklenirken hata oluştu:", error);
        container.innerHTML = `
            <div class="alert alert-warning small m-2">
                HN verileri çekilemedi. Bağlantı hatası.
            </div>
        `;
    }
}