import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';


document.addEventListener('DOMContentLoaded', () => {
    SignInPage();
    let signin = document.getElementById('sign-in-btn');

    let previousState = sessionStorage.getItem('pageState');
    if (previousState) {
        if (previousState === 'home') {
            RealTime()
        }
        console.log(previousState)
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

export function RealTime(user) {
    HomePage()
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    window.addEventListener('beforeunload', () => {
        let currentPage = "home"
        sessionStorage.setItem('pageState', currentPage)
    })

    socket.addEventListener('open', () => {
        console.log("WebSocket connected.");
        socket.send(JSON.stringify({ type: 'getposts' }))
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
            case 'restoreState':
                if (data.page === 'home') {
                    HomePage()
                }
                break
            default:
                console.log("Unknown message type:", data.type);
        }
    });


    socket.addEventListener('close', () => {
        console.log("WebSocket closed. Attempting to reconnect...");
    });


}






