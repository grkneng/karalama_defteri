let posts = [];
let shuffledPosts = [];
let filteredPosts = [];
let currentIndex = 0;
const batchSize = 4;

const container = document.getElementById("postContainer");
const sentinel = document.getElementById("scrollSentinel");
const tagFilters = document.getElementById("tagFilters");

// =============================
// Shuffle (Fisher–Yates)
// =============================
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// =============================
// Medya Oluşturma
// =============================
function createMedia(media, id) {
    if (!media) return "";

    if (media.type === "image") {
        return `
      <img src="${media.url}" class="card-img-top" alt="${media.alt || ""}" loading="lazy">
    `;
    }

    if (media.type === "gallery") {
        const carouselId = `carousel-${id}`;
        const slides = media.images
            .map(
                (img, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${img}" class="d-block w-100" loading="lazy">
      </div>
    `
            )
            .join("");

        return `
      <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${slides}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    `;
    }

    if (media.type === "video") {
        if (media.embed) {
            return `
        <div class="ratio ratio-16x9">
          <iframe src="${media.embed}" allowfullscreen loading="lazy"></iframe>
        </div>
      `;
        } else {
            return `
        <video class="w-100" controls preload="none">
          <source src="${media.url}">
        </video>
      `;
        }
    }

    return "";
}

// =============================
// Kart Oluşturma
// =============================
function createCard(post, index) {
    return `
    <article class="card">
      ${createMedia(post.media, index)}
      <div class="card-body">
        <h5 class="card-title">${post.title}</h5>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">${post.author}</small>
          <small class="text-muted">${post.comments} yorum</small>
        </div>
        <p class="card-text mt-2">${post.summary}</p>
        ${post.readmore ? `<a href="${post.readmore}" class="btn btn-sm btn-dark mt-2">Devamını Oku</a>` : ""}
      </div>
    </article>
  `;
}

// =============================
// Infinite Scroll
// =============================
function loadMore() {
    const nextBatch = filteredPosts.slice(currentIndex, currentIndex + batchSize);

    nextBatch.forEach((post, i) => {
        container.insertAdjacentHTML("beforeend", createCard(post, currentIndex + i));
    });

    currentIndex += batchSize;

    if (currentIndex >= filteredPosts.length) {
        sentinel.innerText = "Tüm gönderiler yüklendi.";
        observer.disconnect();
    }
}

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadMore();
    }
});

// =============================
// Filtreleme
// =============================
function initFilters() {
    const allTags = [...new Set(posts.flatMap((p) => p.tags))];

    tagFilters.innerHTML = `
    <span class="badge bg-dark" role="button" data-tag="all">Tümü</span>
  `;

    allTags.forEach((tag) => {
        tagFilters.insertAdjacentHTML(
            "beforeend",
            `<span class="badge bg-secondary" role="button" data-tag="${tag}">${tag}</span>`
        );
    });

    tagFilters.addEventListener("click", (e) => {
        if (!e.target.dataset.tag) return;

        const tag = e.target.dataset.tag;

        currentIndex = 0;
        container.innerHTML = "";
        sentinel.innerText = "Yükleniyor...";
        observer.observe(sentinel);

        if (tag === "all") {
            filteredPosts = shuffle([...posts]);
        } else {
            filteredPosts = shuffle(posts.filter((p) => p.tags.includes(tag)));
        }

        loadMore();
    });
}

// =============================
// Başlatma
// =============================
async function init() {
    try {
        const response = await fetch("./data/posts.json");
        posts = await response.json();

        shuffledPosts = shuffle([...posts]);
        filteredPosts = [...shuffledPosts];

        initFilters();
        observer.observe(sentinel);
        loadMore();
    } catch (error) {
        sentinel.innerText = "Veri yüklenemedi.";
        console.error("JSON yüklenirken hata oluştu:", error);
    }
}

init();