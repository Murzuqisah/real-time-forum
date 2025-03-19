import { HomePage } from './homepage.js';
import { renderPage } from './homepage.js';

document.addEventListener('DOMContentLoaded', async () => {
    window.addEventListener("popstate", renderPage)
    window.addEventListener("load", () => {
        HomePage();
        renderPage();
    });
});