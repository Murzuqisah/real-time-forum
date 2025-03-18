import {SignInPage} from './sign-in.js'
import { HomePage } from './homepage.js';
import {SignUpPage} from './sign-up.js'
import { ErrorPage } from './error.js';
import { getPosts } from './homepage.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname === "/" || window.location.pathname === '/home') {
        HomePage();
        getPosts()
    } else if (window.location.pathname === "/sign-in") {
        SignInPage();
    } else if (window.location.pathname === '/sign-up') {
        SignUpPage();
    } else if (window.location.pathname === '/error') {
        ErrorPage()
    } else {
        HomePage();
    } 
});