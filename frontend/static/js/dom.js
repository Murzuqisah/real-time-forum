import { HomePage, renderPosts } from './homepage.js';
import { SignInPage } from './sign-in.js';
import { SignUpPage } from './sign-up.js';

document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    let signin = document.getElementById('sign-in-btn');
    let signup = document.getElementById('sign-up-btn'); // Make sure this ID exists
    let signRedirect = document.getElementById('sign-in-redirect');
    let moveSignIn = document.getElementById('move-sign-in');
    let switchlink = document.getElementById('switchlink');

    SignInPage();


    if (signup) {
        signup.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Signing up...');

            let username = document.getElementById('username').value;
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;
            let confirmedPassword = document.getElementById('confirmed-password').value;

            if (password !== confirmedPassword) {
                alert('Passwords do not match');
                return;
            }
            if (!username || !email || !password || !confirmedPassword) {
                alert('Username, email, and password are required for sign up');
                return;
            }

            waitForSocket(() => {
                console.log('Sign-up request sent');
                socket.send(JSON.stringify({
                    type: 'signUp',
                    username,
                    email,
                    password
                }));
            });
        });
    }

    socket.addEventListener('open', () => {
        console.log("WebSocket connected.");
        // Ensure this function is correctly defined
    });

    const waitForSocket = (callback) => {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
        } else {
            console.log('Socket not ready, retrying...');
            setTimeout(() => waitForSocket(callback), 50);
        }
    };

    // ✅ Sign-in Button Event Listener
    if (signin) {
        signin.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Signing in...');
            let email = document.getElementById('email').value;
            let password = document.getElementById('password').value;

            waitForSocket(() => {
                socket.send(JSON.stringify({ type: "signIn", email, password }));
            });
        });
    }

  

    // ✅ Redirect Button Event Listeners
    if (signRedirect || moveSignIn || switchlink) {
        let redirectButton = signRedirect || moveSignIn || switchlink;
        redirectButton.addEventListener('click', (e) => {
            e.preventDefault();
            waitForSocket(() => {
                socket.send(JSON.stringify({ type: 'redirect', route: '/sign-in' }));
            });
        });
    }

    // ✅ WebSocket Message Handling
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

            case "signIn":
                console.log('Processing sign-in response');
                if (!data.error) {
                    HomePage();
                    getPosts();
                } else {
                    console.error("Login error:", data.error);
                }
                break;

            case "signUp":
                console.log("Sign-up response received");
                if (!data.error) {
                    alert("Sign-up successful! Redirecting...");
                    HomePage();
                } else {
                    console.error("Sign-up error:", data.error);
                    alert(data.error);
                }
                break;

            case 'redirect':
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

    // ✅ Handle WebSocket Closure
    socket.addEventListener('close', () => {
        console.log("WebSocket closed. Attempting to reconnect...");
    });

});

