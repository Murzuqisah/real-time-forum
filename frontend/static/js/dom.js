import {SignInPage} from './sign-in.js'
import { HomePage } from './homepage.js';
import {SignUpPage} from './sign-up.js'
import { ErrorPage } from './error.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === "/" || window.location.pathname === '/home') {
        HomePage();
    } else if (window.location.pathname === "/sign-in") {
        SignInPage();
    } else if (window.location.pathname === '/sign-up') {
        SignUpPage();
    } else {
        ErrorPage()
    }
});