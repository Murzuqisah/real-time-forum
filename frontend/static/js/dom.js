import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';

document.addEventListener('DOMContentLoaded', () => {
    let previousState = sessionStorage.getItem('pageState');
    console.log(`previous state ${previousState}`)
    if (previousState === 'home') {
        sessionStorage.setItem('pageState', 'new')
        let session = sessionStorage.getItem('session')
        checksession(session, previousState)
    } else {
        SignInPage();
    }

    let signin = document.getElementById('sign-in-btn');

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

    let likebutton = document.querySelector('.like-button')
    if (likebutton) {
        likebutton.addEventListener('click', (e) => {
            e.preventDefault()
            socket.send(JSON.stringify({ type: 'reaction', postid: likebutton.id, userid: user.id, reaction: 'like' }))
        })
    }

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
                    console.log(data.user)
                    socket.send(JSON.stringify({ type: 'getposts' }));
                    break;
                case 'reaction':
                    console.log('adding reaction')
                    let reaction = document.getElementById(data.id)
                    if (data.reaction === 'like') {
                        reaction.likecount.textContent = reaction.likecount + data.reaction
                    }
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

    if (state === 'new') {
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

async function checksession(session) {
    await fetch('/check', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: session })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('unexpected error occured')
            }
            return response.json()
        })
        .then(data => {
            if (data.error === 'ok') {
                RealTime()
            } else {
                SignInPage()
            }
        })
}