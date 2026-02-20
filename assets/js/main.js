let posts = [];
let allPostsShuffled = [];
let filteredPosts = [];
let currentIndex = 0;
const batchSize = 4;
let activeTag = "all";

const container = document.getElementById("postContainer");
const sentinel = document.getElementById("scrollSentinel");
const tagFilters = document.getElementById("tagFilters");

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createMedia(media, id) {
    if (!media) return "";

    if (media.type === "image") {
        return `
            <div>
                <img src="${media.url}" class="card-img-top object-fit-cover" alt="${media.alt || ""}" loading="lazy">
            </div>`;
    }

    if (media.type === "gallery") {
        const carouselId = `carousel-${id}`;
        const slides = media.images
            .map(
                (img, i) => `
            <div class="carousel-item ${i === 0 ? "active" : ""}">
                <div class="ratio ratio-16x9">
                    <img src="${img}" class="d-block w-100 object-fit-cover" loading="lazy">
                </div>
            </div>
        `
            )
            .join("");

        return `
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">${slides}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>
        </div>`;
    }

    if (media.type === "video") {
        if (media.embed) {
            return `
            <div class="ratio ratio-16x9">
                <iframe src="${media.embed}" allowfullscreen loading="lazy"></iframe>
            </div>`;
        } else {
            return `
            <div class="ratio ratio-16x9">
                <video class="w-100 h-100 object-fit-cover" controls preload="metadata">
                    <source src="${media.url}">
                    Tarayıcınız video etiketini desteklemiyor.
                </video>
            </div>`;
        }
    }
    return "";
}

function createCard(post, index) {
    const tagsHtml = post.tags.map((t) => `<span class="badge bg-light text-dark border me-1">${t}</span>`).join("");

    return `
    <article class="card shadow-sm">
      ${createMedia(post.media, index)}
      <div class="card-body">
        <h5 class="card-title fw-bold">${post.title}</h5>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <small class="text-muted"><i class="bi bi-person"></i> ${post.author}</small>
          ${/* Yorum bölümü tamamen kaldırıldı */ ""}
        </div>
        <p class="card-text text-secondary">${post.summary}</p>
        ${post.readmore ? `<a href="${post.readmore}" class="btn btn-sm btn-outline-dark mt-2">Devamını Oku</a>` : ""}
      </div>
    </article>
  `;
}

function loadMore() {
    if (currentIndex >= filteredPosts.length) {
        sentinel.innerText = filteredPosts.length === 0 ? "Sonuç bulunamadı." : "Tüm gönderiler yüklendi.";
        return;
    }

    const nextBatch = filteredPosts.slice(currentIndex, currentIndex + batchSize);

    let batchHTML = "";
    nextBatch.forEach((post, i) => {
        batchHTML += createCard(post, currentIndex + i);
    });

    container.insertAdjacentHTML("beforeend", batchHTML);
    currentIndex += batchSize;

    if (currentIndex >= filteredPosts.length) {
        sentinel.innerText = "Tüm gönderiler yüklendi.";
    } else {
        sentinel.innerText = "Yükleniyor...";
    }
}

const observerCallback = (entries) => {
    if (entries[0].isIntersecting) {
        if (currentIndex < filteredPosts.length) {
            loadMore();
        }
    }
};

const observer = new IntersectionObserver(observerCallback, {
    root: null,
    rootMargin: "100px",
    threshold: 0.1
});

function updateFilterButtons() {
    const buttons = tagFilters.querySelectorAll("[data-tag]");
    buttons.forEach((btn) => {
        const tag = btn.dataset.tag;
        if (tag === activeTag) {
            btn.classList.remove("bg-secondary", "text-white");
            btn.classList.add("bg-dark", "text-white");
        } else {
            btn.classList.remove("bg-dark", "text-white");
            btn.classList.add("bg-light", "text-dark");
        }
    });
}

function initFilters() {
    const allTags = [...new Set(posts.flatMap((p) => p.tags))];

    let filtersHTML = `<span class="badge p-2 user-select-none border" role="button" data-tag="all">Tümü</span>`;

    allTags.forEach((tag) => {
        filtersHTML += `<span class="badge p-2 user-select-none border" role="button" data-tag="${tag}">${tag}</span>`;
    });

    tagFilters.innerHTML = filtersHTML;
    updateFilterButtons();

    tagFilters.addEventListener("click", (e) => {
        const target = e.target.closest("[data-tag]");
        if (!target) return;

        const newTag = target.dataset.tag;
        if (newTag === activeTag) return;

        activeTag = newTag;
        updateFilterButtons();

        // Reset
        currentIndex = 0;
        container.innerHTML = "";
        sentinel.innerText = "Yükleniyor...";

        if (activeTag === "all") {
            filteredPosts = [...allPostsShuffled];
        } else {
            filteredPosts = allPostsShuffled.filter((p) => p.tags.includes(activeTag));
        }

        loadMore();

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

async function init() {
    try {
        const response = await fetch("./data/posts.json");

        if (!response.ok) throw new Error("Dosya bulunamadı");

        posts = await response.json();

        allPostsShuffled = shuffle([...posts]);
        filteredPosts = [...allPostsShuffled];

        initFilters();

        loadMore();

        observer.observe(sentinel);
    } catch (error) {
        sentinel.innerText = "Veri yüklenemedi. Lütfen sayfayı yenileyin.";
        sentinel.className = "text-danger text-center py-4";
        console.error("Hata:", error);
    }
}

init();