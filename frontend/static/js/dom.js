import {SignInPage} from './sign-in.js'
import { HomePage } from './homepage.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === "/") {
        HomePage();
    } else if (window.location.pathname == "/sign-in") {
        SignInPage()
    }
});