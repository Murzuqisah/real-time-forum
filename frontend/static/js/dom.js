import { renderPage } from './homepage.js';

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener("popstate", renderPage)
    window.addEventListener("load", () => {
        renderPage();
    });
});