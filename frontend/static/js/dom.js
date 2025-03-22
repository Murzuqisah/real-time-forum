import { HomePage, renderPosts } from './homepage.js';
import { SignInPage } from './sign-in.js';
import { SignUpPage } from './sign-up.js';

document.addEventListener('DOMContentLoaded', () => {
    SignInPage()
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    let signin = document.getElementById('sign-in-btn');
    let signRedirect = document.getElementById('sign-in-redirect');
    let signUp = document.getElementById('move-sign-up');
    let moveSignIn = document.getElementById('move-sign-in');
    let switchlink = document.getElementById('switchlink');

    // Sign-in button event listener
    if (signin) {
        signin.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Signing in...');

            waitForSocket(() => {
                let password = document.getElementById('password').value;
                let email = document.getElementById('email').value;
                socket.send(JSON.stringify({ type: "signIn", password, email }));
            });
        });
    }

    // Redirect buttons
    const redirectBtn = signRedirect || moveSignIn || switchlink;
    if (redirectBtn) {
        redirectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            waitForSocket(() => {
                socket.send(JSON.stringify({ type: 'redirect', route: '/sign-in' }));
            });
        });
    }

    // Sign-up button event listener
    if (signUp) {
        signUp.addEventListener('click', (e) => {
            e.preventDefault();
            waitForSocket(() => {
                socket.send(JSON.stringify({ type: 'redirect', route: '/sign-up' }));
            });
        });
    }

    // Handle WebSocket opening
    socket.addEventListener('open', () => {
        console.log("WebSocket connection established.");
    });

    // Function to wait for WebSocket to be open before sending
    const waitForSocket = (callback, attempts = 0) => {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
        } else if (attempts < 10) { // Limit to 10 attempts (~500ms)
            console.log('Waiting for WebSocket...');
            setTimeout(() => waitForSocket(callback, attempts + 1), 50);
        } else {
            console.error('WebSocket failed to open.');
        }
    };

    // Handle incoming messages from WebSocket
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        switch (data.type) {
            case "posts":
                let postcontainer = document.querySelector('.posts'); // Ensure the correct selector
                if (postcontainer) {
                    renderPosts(data, postcontainer);
                }
                break;

            case "signIn":
                console.log('Handling sign-in response');
                if (data.error === '<nil>') {
                    HomePage();
                    getPosts();
                } else {
                    console.error('Sign-in error:', data.error);
                }
                break;

            case "redirect":
                if (data.route === '/sign-in') {
                    SignInPage();
                } else if (data.route === '/sign-up') {
                    SignUpPage();
                }
                break;

            default:
                console.log("Unknown message type:", data.type);
        }
    });

    // Handle WebSocket closure
    socket.addEventListener('close', () => {
        console.warn("WebSocket connection closed.");
    });

    // Handle WebSocket errors
    socket.addEventListener('error', (error) => {
        console.error("WebSocket error:", error);
    });

    function getPosts() {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'getposts' }));
        } else {
            console.error('Socket not open');
        }
    }
});



// let button = document.getElementById('sign-up-btn');
// button.addEventListener('click', (e) => {
//   e.preventDefault();
//   let username = document.getElementById('username').value;
//   let email = document.getElementById('email').value;
//   let password = document.getElementById('password').value;
//   let confirmedPassword = document.getElementById('confirmed-password').value;
//   if (password !== confirmedPassword) {
//     alert('Passwords do not match')
//     return;
//   }
//   signUp(username, email, password);
// });


























// document.addEventListener('DOMContentLoaded', async () => {
//     window.addEventListener("popstate", renderPage);
//     await handleNavigation();
// });

// async function handleNavigation() {
//     console.log('handling navigation')
//     const path = window.location.pathname;

//     try {
//         const response = await fetch(path, { method: "GET" });
//         const contentType = response.headers.get("content-type");

//         if (contentType && contentType.includes("application/json")) {
//             const data = await response.json();
//             if (data.redirect) {
//                 history.pushState({}, "", data.redirect);
//                 renderPage();
//                 return;
//             }
//         }

//         renderPage();
//     } catch (error) {
//         console.error("Error handling navigation:", error);
//     }
// }
