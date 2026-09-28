document.addEventListener("DOMContentLoaded", () => {
  const tocContainer = document.getElementById("md-toc");
  const contentContainer = document.getElementById("markdown-content");

  // URL'den dosya parametresini al (örn: marked.html?file=documents/akiskanlar-mekanigi.md)
  const urlParams = new URLSearchParams(window.location.search);
  const targetFile = urlParams.get("file");

  // 1. JSON verisini çek ve TOC'u alfabetik oluştur
  fetch("data/md_index.json")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) return;

      // Başlığa göre alfabetik sıralama (Türkçe karakter duyarlı)
      data.sort((a, b) => a.title.localeCompare(b.title, "tr", { sensitivity: "base" }));

      const fragment = document.createDocumentFragment();

      data.forEach((item, index) => {
        if (!item || !item.title || !item.url) return;

        const li = document.createElement("li");
        li.className = "mb-1";

        const a = document.createElement("a");
        a.href = `marked.html?file=${encodeURIComponent(item.url)}`;
        a.textContent = item.title;
        a.className = "text-decoration-none";

        // Eğer seçilen dosyadaysa aktif sınıfı ekle
        if (targetFile === item.url || (!targetFile && index === 0)) {
          a.classList.add("text-danger");
        }

        li.appendChild(a);
        fragment.appendChild(li);
      });

      tocContainer.replaceChildren(fragment);

      // 2. Belirlenen Markdown dosyasını yükle ve render et
      const fileToLoad = targetFile || data[0].url;
      loadMarkdown(fileToLoad);
    })
    .catch((err) => {
      console.error("Index yüklenirken hata oluştu:", err);
      tocContainer.innerHTML = '<li class="text-danger small">Liste yüklenemedi.</li>';
    });

  // Markdown dosyasını çekip Marked ile işleme fonksiyonu
  function loadMarkdown(filePath) {
    fetch(`${filePath}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Dosya bulunamadı: ${res.status}`);
        return res.text();
      })
      .then((markdownText) => {
        // Marked.js ayarları ve güvenlik/yapılandırma
        marked.setOptions({
          gfm: true,
          breaks: true
        });

        const htmlContent = marked.parse(markdownText);
        contentContainer.innerHTML = htmlContent;

        // Tablolara Bootstrap sınıflarını otomatik ekleyerek şık durmasını sağlayalım
        const tables = contentContainer.querySelectorAll("table");
        tables.forEach((table) => {
          const wrapper = document.createElement("div");
          wrapper.className = "table-responsive";
          table.parentNode.insertBefore(wrapper, table);
          wrapper.appendChild(table);
          table.className = "table table-bordered table-sm small mb-3";
        });

        // Görsellere responsive sınıf ekleyelim
        const images = contentContainer.querySelectorAll("img");
        images.forEach((img) => {
          img.className = "img-fluid rounded shadow mb-3";
        });
      })
      .catch((err) => {
        console.error("Markdown yüklenemedi:", err);
        contentContainer.innerHTML = `<p class="text-danger">Makale yüklenirken bir hata oluştu: ${err.message}</p>`;
      });
  }
});