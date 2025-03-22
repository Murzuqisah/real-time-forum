import { HomePage, renderPosts } from './homepage.js';
import { SignInPage } from './sign-in.js';
import { SignUpPage } from './sign-up.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`);
    console.log(socket)

    let signin = document.getElementById('sign-in-btn');
    let signRedirect = document.getElementById('sign-in-redirect')
    let signUp = document.getElementById('move-sign-up')
    let moveSignIn = document.getElementById('move-sign-in')
    let switchlink = document.getElementById('switchlink')

    if (signin)  {
        signin.addEventListener('click', (e) => {
            console.log('signing in');
            e.preventDefault();

            waitForSocket(() => {
                console.log('socket is ready');
                let password = document.getElementById('password').value;
                let email = document.getElementById('email').value;
                socket.send(JSON.stringify({ type: "signIn", password, email }));
            });
        });
    }

    if (signRedirect || moveSignIn || switchlink) {
        let bt = signRedirect
        if (moveSignIn) {
            bt = moveSignIn
        } else if (switchlink) {
            bt = switchlink
        }else {
            bt = signRedirect
        }
        bt.addEventListener('click', (e) => {
            e.preventDefault()
            waitForSocket(() => {
                socket.send(JSON.stringify({ type: 'redirect', route: '/sign-in' }))
            })
        })
    }

    if (signUp) {
        signUp.addEventListener('click', (e) => {
            e.preventDefault()
            waitForSocket(() => {
                socket.send(JSON.stringify({ type: 'redirect', route: '/sign-up' }))
            })
        })
    }

    socket.addEventListener('open', () => {
        SignInPage();
    });

    socket.onopen = () => console.log("Connected to WebSocket");
    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onmessage = (event) => console.log("Message from server:", event.data);
    socket.onclose = () => console.log("WebSocket Closed");

    const waitForSocket = (callback) => {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
        } else {
            console.log('socket not ready')
            setTimeout(() => waitForSocket(callback), 50);
        }
    };




    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('gotten message')

        switch (data.type) {
            case "posts":
                postcontainer = document.querySelector('posts')
                renderPosts(data, postcontainer);
            case "signIn":
                console.log('message sign in')
                if (!data.error) {
                    HomePage()
                    getPosts()
                } else {
                    console.log(data.error)
                }
            case 'redirect':
                if (data.route === '/sign-in') {
                    SignInPage()
                } else if (data.route === '/sign-up') {
                    SignUpPage()
                }
            default:
                console.log("no message")
        }

    });

})

function getPosts() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'getposts' }));
    } else {
        console.error('Socket not open');
    }
}


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
