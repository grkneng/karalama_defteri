(() => {
  const container = document.getElementById("notes");
  if (!container) return;

  fetch("data/notes.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) return;

      // Fisher-Yates shuffle
      for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
      }

      const limitedData = data.slice(0, 15);

      const fragment = document.createDocumentFragment();

      for (const item of limitedData) {
        if (!item || !item.title) continue;

        const wrapper = document.createElement("div");
        wrapper.className = "mt-3";

        const title = document.createElement("p");
        title.className = "label fw-bold mb-0";

        const link = document.createElement("a");
        link.href = typeof item.url === "string" && item.url ? item.url : "#";
        link.textContent = item.title;
        title.appendChild(link);

        wrapper.appendChild(title);

        if (item.summary) {
          const summary = document.createElement("p");
          summary.className = "small text-secondary mb-2";
          summary.textContent = item.summary;
          wrapper.appendChild(summary);
        }

        fragment.appendChild(wrapper);
      }

      container.replaceChildren(fragment);
    })
    .catch((error) => {
      console.error("Raporlar yüklenirken hata oluştu:", error);
    });
})();
