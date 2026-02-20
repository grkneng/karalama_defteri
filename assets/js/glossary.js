document.addEventListener("DOMContentLoaded", function () {
    let glossaryData = [];
    const container = document.getElementById("glossaryList");
    const searchInput = document.getElementById("searchInput");

    // 1. Linkleri tespit eden yardımcı fonksiyonu ekliyoruz
    function linkify(text) {
        const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlPattern, function(url) {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-underline">${url}</a>`;
        });
    }

    function renderList(data) {
        container.innerHTML = "";

        data.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "py-3";

            if (index !== data.length - 1) {
                div.classList.add("border-bottom");
            }

            // 2. Tanım (definition) kısmını linkify fonksiyonundan geçiriyoruz
            div.innerHTML = `
                <h6 class="mb-1 fw-semibold">${item.term}</h6>
                <p class="mb-0 small text-muted">
                    ${linkify(item.definition)}
                </p>
            `;

            container.appendChild(div);
        });
    }

    fetch("./data/glossary.json")
        .then((response) => response.json())
        .then((data) => {
            // Türkçe karakter duyarlı alfabetik sıralama
            glossaryData = data.sort((a, b) => a.term.localeCompare(b.term, "tr", { sensitivity: "base" }));
            renderList(glossaryData);
        });

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const filtered = glossaryData.filter(
            (item) => item.term.toLowerCase().includes(query) || item.definition.toLowerCase().includes(query)
        );
        renderList(filtered);
    });
});