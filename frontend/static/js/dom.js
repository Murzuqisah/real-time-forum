import { renderPage } from './homepage.js';

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener("popstate", renderPage);
    await handleNavigation();
});

async function handleNavigation() {
    console.log('handling navigation')
    const path = window.location.pathname;

    try {
        const response = await fetch(path, { method: "GET" });
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.redirect) {
                history.pushState({}, "", data.redirect);
                renderPage();
                return;
            }
        }

        renderPage();
    } catch (error) {
        console.error("Error handling navigation:", error);
    }
}
