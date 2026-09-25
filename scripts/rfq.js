/**
 * rfq.js — Talepler Galerisi listesi
 *
 * - data/rfq_index.json → dosya listesi (manifest)
 * - data/rfq.json, data/rfq-2.json, ... → kayıtlar
 * - id'ye göre artan sıralanır, hepsi tek seferde basılır
 */

(() => {
  "use strict";

  const MANIFEST_PATH = "data/rfq_index.json";
  const DATA_DIR = "data/";

  const listEl = document.getElementById("rfqList");

  // ==== Yardımcılar ====
  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  // id string ("01") veya number (1) olabilir; doğal sırada karşılaştır
  const byId = (a, b) => Number(a.id) - Number(b.id);

  // ==== Render ====
  function renderMedia(media) {
    if (!media || !media.src) return "";

    const caption = media.caption
      ? `<figcaption class="caption text-center">${escapeHtml(media.caption)}</figcaption>`
      : "";

    let inner;
    if (media.type === "video") {
      inner = `
        <div class="ratio ratio-16x9">
          <iframe src="${escapeHtml(media.src)}"
                  title="${escapeHtml(media.caption || "Video")}"
                  class="rounded"
                  loading="lazy"
                  allowfullscreen></iframe>
        </div>`;
    } else {
      inner = `
        <img src="${escapeHtml(media.src)}"
             class="figure-img img-fluid rounded"
             loading="lazy"
             alt="${escapeHtml(media.alt || "")}" />`;
    }

    return `<figure>${inner}${caption}</figure>`;
  }

  function renderArticle(rfq) {
    const titleHtml = rfq.url
      ? `<a href="${escapeHtml(rfq.url)}">${escapeHtml(rfq.title)}</a>`
      : escapeHtml(rfq.title);

    const descHtml = String(rfq.description || "")
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join("");

    const metaHtml = rfq.meta
      ? `<span class="caption d-block mb-3 text-secondary">${escapeHtml(rfq.meta)}</span>`
      : "";

    const summaryHtml = rfq.summary
      ? `<p class="lead text-secondary">${escapeHtml(rfq.summary)}</p>`
      : "";

    return `
      <article class="mb-4" id="rfq-${escapeHtml(rfq.id)}">
        <h2>${titleHtml}</h2>
        ${metaHtml}
        ${summaryHtml}
        ${renderMedia(rfq.media)}
        ${descHtml}
      </article>`;
  }

  function renderList(records) {
    if (!listEl) return;

    if (!records.length) {
      listEl.innerHTML = `<p class="text-secondary">Kayıt bulunamadı.</p>`;
      return;
    }

    listEl.innerHTML = records.map(renderArticle).join("");
  }

  // ==== Veri yükleme ====
  async function loadManifest() {
    const res = await fetch(MANIFEST_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Manifest yüklenemedi: HTTP ${res.status}`);
    const data = await res.json();

    // Şema doğrulaması: files dizisi olmalı, içi string olmalı
    if (!data || !Array.isArray(data.files)) {
      throw new Error("Manifest şeması geçersiz: 'files' dizisi yok.");
    }
    return data.files.filter((f) => typeof f === "string" && f);
  }

  async function loadFile(name) {
    const res = await fetch(DATA_DIR + name, { cache: "no-store" });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // ==== Başlat ====
  async function init() {
    if (!listEl) return;

    try {
      listEl.innerHTML = `<p class="text-secondary">Yükleniyor…</p>`;

      const fileNames = await loadManifest();

      if (!fileNames.length) {
        listEl.innerHTML = `<p class="text-secondary">Henüz kayıt yok.</p>`;
        return;
      }

      // Manifest hangi dosyaların var olduğunu söylediği için paralel yükleyebiliriz.
      // Promise.all: biri düşerse tümü düşsün — manifest doğruysa dosyalar da olmalı.
      const chunks = await Promise.all(fileNames.map(loadFile));
      const all = chunks.flat();

      if (!all.length) {
        listEl.innerHTML = `<p class="text-secondary">Henüz kayıt yok.</p>`;
        return;
      }

      // Başlıksız kayıtları at, id'ye göre sırala
      const records = all.filter((r) => r && r.title).sort(byId);

      renderList(records);
    } catch (err) {
      console.error("RFQ listesi yüklenemedi:", err);
      listEl.innerHTML = `
        <p class="text-danger">
          İçerik yüklenemedi. Sayfayı yenileyin veya daha sonra tekrar deneyin.
        </p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
