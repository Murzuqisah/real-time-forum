import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';


document.addEventListener('DOMContentLoaded', () => {
    SignInPage();
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

export function RealTime(user) {
    HomePage()
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.addEventListener('open', () => {
        console.log("WebSocket connected.");
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
            default:
                console.log("Unknown message type:", data.type);
        }
    });


    socket.addEventListener('close', () => {
        console.log("WebSocket closed. Attempting to reconnect...");
    });
    

}






