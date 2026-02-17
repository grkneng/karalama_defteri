document.addEventListener("DOMContentLoaded", function () {
    let glossaryData = [];
    const container = document.getElementById("glossaryList");
    const searchInput = document.getElementById("searchInput");

    function renderList(data) {
        container.innerHTML = "";

        data.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "py-3";

            if (index !== data.length - 1) {
                div.classList.add("border-bottom");
            }

            div.innerHTML = `
                <h6 class="mb-1 fw-semibold">${item.term}</h6>
                <p class="mb-0 small text-muted">
                    ${item.definition}
                </p>
            `;

            container.appendChild(div);
        });
    }

    fetch("./data/glossary.json")
        .then((response) => response.json())
        .then((data) => {
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