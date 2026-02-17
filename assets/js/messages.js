async function loadMessages() {
    try {
        const response = await fetch("./data/messages.json");
        let messages = await response.json();

        // Tarihe göre artan sıralama
        messages.sort((a, b) => new Date(a.date) - new Date(b.date));

        const container = document.getElementById("messageContainer");

        messages.forEach((msg) => {
            const alignment = msg.editor ? "justify-content-end" : "justify-content-start";
            const bubbleColor = msg.editor ? "bg-primary text-white" : "bg-light";

            const imageHTML = msg.image ? `<img src="${msg.image}" class="img-fluid rounded mt-2" loading="lazy">` : "";

            const messageHTML = `
                    <div class="d-flex ${alignment} mb-3">
                      <div style="max-width: 75%;">
                        <div class="small text-muted mb-1">
                          ${msg.author} · ${msg.date}
                        </div>
                        <div class="p-2 rounded ${bubbleColor}">
                          ${msg.message}
                          ${imageHTML}
                        </div>
                      </div>
                    </div>
                  `;

            container.insertAdjacentHTML("beforeend", messageHTML);
        });

        container.scrollTop = container.scrollHeight;
    } catch (err) {
        console.error("Mesajlar yüklenemedi:", err);
    }
}

loadMessages();