(() => {
  const container = document.getElementById("bookmarks");
  const sentinel = document.getElementById("scroll-sentinel");
  if (!container || !sentinel) return;

  let allBookmarks = [];
  let currentIndex = 0;
  const pageSize = 12;
  let isLoading = false;

  function renderBatch() {
    if (isLoading || currentIndex >= allBookmarks.length) return;
    isLoading = true;

    try {
      const slice = allBookmarks.slice(currentIndex, currentIndex + pageSize);
      currentIndex += slice.length;

      const fragment = document.createDocumentFragment();

      for (const item of slice) {
        if (!item || !item.title) {
          console.warn("Geçersiz bookmark atlandı:", item);
          continue;
        }

        const wrapper = document.createElement("article");
        wrapper.className = "mb-4";

        const title = document.createElement("h2");
        title.className = "h5 mb-2";

        const link = document.createElement("a");
        link.href = typeof item.url === "string" && item.url ? item.url : "#";
        link.textContent = item.title;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        title.appendChild(link);
        wrapper.appendChild(title);

        if (item.summary) {
          const summary = document.createElement("p");
          summary.className = "mb-0";
          summary.innerHTML = item.summary;
          wrapper.appendChild(summary);
        }

        fragment.appendChild(wrapper);
      }

      container.appendChild(fragment);

      if (currentIndex >= allBookmarks.length) {
        observer.disconnect();
      }
    } finally {
      isLoading = false;
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) renderBatch();
    },
    { rootMargin: "300px" },
  );

  fetch("data/bookmarks.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML =
          '<p class="text-secondary caption">Henüz bookmark yok.</p>';
        return;
      }

      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }

      allBookmarks = data;
      renderBatch();
      observer.observe(sentinel);
    })
    .catch((error) => {
      console.error("Bookmark'lar yüklenirken hata oluştu:", error);
      container.innerHTML =
        '<p class="text-secondary caption">Bookmark\'lar yüklenemedi.</p>';
    });
})();
