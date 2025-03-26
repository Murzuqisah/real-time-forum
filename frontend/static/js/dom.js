import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';
import { goBack } from './homepage.js';

document.addEventListener('DOMContentLoaded', () => {
    let previousState = sessionStorage.getItem('pageState');
    console.log(`previous state ${previousState}`)
    if (previousState === 'home') {
        sessionStorage.setItem('pageState', '')
        let session = sessionStorage.getItem('session')
        checksession(session)
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

export function RealTime(User, session) {
    HomePage();
    let socket;

    let likebutton = document.querySelector('.like-button')
    if (likebutton) {
        likebutton.addEventListener('click', (e) => {
            e.preventDefault()
            socket.send(JSON.stringify({ type: 'reaction', postid: likebutton.id, userid: User.id, reaction: 'like' }))
        })
    }

    function connectWebSocket() {
        socket = new WebSocket(`ws://${window.location.host}/ws`);

        socket.addEventListener('open', () => {
            console.log("WebSocket connected.");
            socket.send(JSON.stringify({ type: 'getposts' }));
        });

        if (!User) {
            waitForSocket(() => {
                let session = sessionStorage.getItem('session');
                socket.send(JSON.stringify({ type: 'getuser', session: session }));
            })
        }

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
                    User = data.user;
                    console.log(data.user)
                    socket.send(JSON.stringify({ type: 'getposts' }));
                    break;
                case 'reaction':
                    console.log('adding reaction')
                    let reaction = document.getElementById(data.id)
                    if (data.reaction === 'like') {
                        reaction.likecount.textContent = reaction.likecount + data.reaction
                    }
                    break
                case 'getusers':
                    document.getElementById("chatListContainer").style.display = "none";
                    let userlist = document.getElementById("userListContainer")
                    userlist.innerHTML = ""
                    data.users.forEach(elem => {
                        if (elem.username !== User.username) {
                            let item = document.createElement('div')
                            item.classList.add('user-item')
                            item.textContent = elem.username
                            item.addEventListener('click', (e) => {
                                e.preventDefault();
                                document.getElementById("userListContainer").style.display = 'none';
                                let chatheader = document.getElementById(`chatHeader`)
                                chatheader.innerHTML = ""
                                let bcbutton = document.createElement('button')
                                bcbutton.classList.add('back-button')
                                bcbutton.textContent = 'Back'
                                bcbutton.addEventListener('click', (e) => {
                                    goBack()
                                })
                                let span = document.createElement('span')
                                span.id = 'chatHeader'
                                chatheader.appendChild(bcbutton)
                                chatheader.appendChild(span)
                                let name = document.createElement('div')
                                name.textContent = elem.username
                                name.style.color = 'white'
                                name.style.display = 'flex'
                                name.style.position = 'relative'
                                name.style.alignItems = 'center'
                                name.style.padding = '0 15px'
                                name.style.marginRight = '150px'
                                name.style.flexDirection = 'columnf'
                                name.style.justifyContent = 'spacebetween'
                                name.style.textAlign = 'center'
                                name.style.whitespace = 'nowrap'
                                chatheader.appendChild(name)
                                let chatContainer = document.getElementById('chatContainer');
                                chatContainer.style.display = 'flex';

                                let send = document.getElementById('send')
                                send.addEventListener('click', (e) => {
                                    e.preventDefault()
                                    let msg = document.getElementById('messageInput').value
                                    console.log(User)
                                    socket.send(JSON.stringify({ type: 'messaging', sender: User.username, receiver: elem.username, message: msg }))
                                })
                            });
                            userlist.appendChild(item)
                        }
                    });
                    userlist.style.display = 'flex'
                    break
                case 'messaging':
                    if (data.status === "ok") {
                        let messageElement = document.createElement("div");
                        messageElement.classList.add("message", "sent");
                        messageElement.innerText = data.message;
                        document.getElementById("chatBox").appendChild(messageElement)
                        let input = document.getElementById('messageInput')
                        input.value = ""
                        input.placeholder = 'Type a message...'
                    }
                    break
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

        let newChat = document.getElementById('newChat')
        if (newChat) {
            newChat.addEventListener('click', (e) => {
                e.preventDefault()
                socket.send(JSON.stringify({ type: 'getusers' }))
            })
        }
    }

    connectWebSocket();

    window.addEventListener('load', () => {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            connectWebSocket();
        }
    });

    let state = sessionStorage.getItem('pageState');
    console.log(`state is ${state}`);

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
            console.log(data.error)
            if (data.error === 'ok') {
                RealTime("", session)
            } else {
                sessionStorage.setItem('pageState', '')
                SignInPage()
            }
        })
}