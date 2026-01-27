import { defineToolbarApp } from "astro/toolbar";

export default defineToolbarApp({
    init(canvas, app) {
        app.onToggled(({ state }) => {
            if (state) {
                window.location.assign("/style-guide");
            }
        });

        const container = document.createElement("div");
        container.style.padding = "20px";
        container.innerText = "Redirecting to Style Guide...";
        container.style.color = "white";
        canvas.appendChild(container);
    },
});
