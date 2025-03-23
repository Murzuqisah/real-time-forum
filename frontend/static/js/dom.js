import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';

document.addEventListener('DOMContentLoaded', () => {
    SignInPage();
    let signin = document.getElementById('sign-in-btn');

    let previousState = sessionStorage.getItem('pageState');
    console.log(`previous state ${previousState}`)
    console.log(reload)
    if (previousState) {
        if (previousState === 'home' && reload === true) {
            RealTime()
        }
    }

    if (signin) {
        signin.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Signing in...');
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;
            login(email, password)
        });
    }
});

export function RealTime(user, session) {
    HomePage();
    let socket;

    function connectWebSocket() {
        socket = new WebSocket(`ws://${window.location.host}/ws`);

        socket.addEventListener('open', () => {
            console.log("WebSocket connected.");
            socket.send(JSON.stringify({ type: 'getposts' }));
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            switch (data.type) {
                case "posts":
                    let postContainer = document.querySelector('.posts');
                    if (postContainer) {
                        renderPosts(data, postContainer);
                    } else {
                        console.error("Post container not found.");
                    }
                    break;
                case 'error':
                    if (data.message === 'invalid session') {
                        SignInPage();
                        alert(data.message);
                    } else {
                        alert(data.message);
                    }
                    break;
                case 'getuser':
                    console.log('Got user data');
                    user = data.user;
                    socket.send(JSON.stringify({ type: 'getposts' }));
                    break;
                default:
                    console.log("Unknown message type:", data.type);
            }
        });

        socket.addEventListener('close', () => {
            console.log("WebSocket closed. Attempting to reconnect...");
            setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
        });

        socket.addEventListener('error', (err) => {
            console.error("WebSocket encountered an error:", err);
            socket.close(); 
        });
    }

    connectWebSocket(); 

    window.addEventListener('load', () => {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
    });

    let state = sessionStorage.getItem('pageState');
    console.log(`state is ${state}`);

    if (state === 'home') {
        console.log('Getting user...');
        waitForSocket(() => {
            console.log('State found');
            let session = sessionStorage.getItem('session');
            sessionStorage.setItem('pageState', '');
            socket.send(JSON.stringify({ type: 'getuser', session: session }));
        });
    }

    window.addEventListener('beforeunload', () => {
        let currentPage = "home";
        sessionStorage.setItem('pageState', currentPage);
        sessionStorage.setItem('session', session);
    });

    function waitForSocket(callback) {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
        } else {
            console.log('Socket not ready, retrying...');
            setTimeout(() => waitForSocket(callback), 50);
        }
    }
}







