import { goBackToChats, HomePage, renderPosts } from './homepage.js';
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
            socket.send(JSON.stringify({ type: 'reaction', postid: likebutton.id, userid: User.id, reaction: 'like', username: User.username }))
        })
    }

    function connectWebSocket() {
        socket = new WebSocket(`ws://${window.location.host}/ws`);

        socket.addEventListener('open', () => {
            console.log("WebSocket connected.");
            socket.send(JSON.stringify({ type: 'getposts', username: User.id.toString() }));
            socket.send(JSON.stringify({ type: "chats", sender: User.id.toString(), username: User.username }))
        });

        if (!User) {
            waitForSocket(() => {
                let session = sessionStorage.getItem('session');
                socket.send(JSON.stringify({ type: 'getuser', session: session, username: User.username }));
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
                    socket.send(JSON.stringify({ type: "chats", sender: User.id.toString(), username: User.username }))
                    socket.send(JSON.stringify({ type: 'getposts', username: User.username }));
                    break;
                case 'reaction':
                    console.log('adding reaction')
                    let reaction = document.getElementById(data.id)
                    if (data.reaction === 'like') {
                        reaction.likecount.textContent = reaction.likecount + data.reaction
                    }
                    break;
                case 'getusers':
                    document.getElementById("chatListContainer").style.display = "none";
                    let userlist = document.getElementById("userListContainer")
                    userlist.innerHTML = ""
                    let hd = document.createElement('div');
                    hd.classList.add('header');
                    hd.textContent = "Users"
                    let bcbutton = document.createElement('button')
                    bcbutton.classList.add('back-button')
                    bcbutton.textContent = 'Back'
                    bcbutton.addEventListener('click', (e) => {
                        goBackToChats()
                    })
                    hd.appendChild(bcbutton)
                    userlist.appendChild(hd)
                    let chatlist = document.createElement('div')
                    chatlist.classList.add('chat-list')
                    data.users.forEach(elem => {
                        if (elem.username !== User.username) {
                            let item = document.createElement('div')
                            item.classList.add('chat')
                            item.textContent = elem.username
                            if (status(data.online, elem.username)) {
                                let statusIndicator = document.createElement('p');
                                statusIndicator.classList.add('status'); 
                                statusIndicator.textContent = "Online";
                                item.appendChild(statusIndicator); 
                            } else {
                                let statusIndicator = document.createElement('p');
                                statusIndicator.classList.add('status'); 
                                statusIndicator.textContent = "Offline";
                                item.appendChild(statusIndicator); 
                            }
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
                                name.style.flexDirection = 'column'
                                name.style.justifyContent = 'spacebetween'
                                name.style.textAlign = 'center'
                                name.style.whitespace = 'nowrap'
                                chatheader.appendChild(name)
                                let chatContainer = document.getElementById('chatContainer');
                                chatContainer.style.display = 'flex';
                            });
                            chatlist.appendChild(item)
                        }
                    });
                    userlist.appendChild(chatlist)
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
                case "chats":
                    if (data.users.length > 0) {
                        console.log(data.users)
                        let chatlist = document.getElementById('chatList')
                        chatlist.innerHTML = ""
                        data.users.forEach(elem => {
                            let chat = document.createElement('div')
                            chat.classList.add('chat')
                            chat.textContent = elem.username
                            if (status(data.online, elem.username)) {
                                let statusIndicator = document.createElement('p');
                                statusIndicator.classList.add('status'); 
                                statusIndicator.textContent = "Online";
                                chat.appendChild(statusIndicator); 
                            } else {
                                let statusIndicator = document.createElement('p');
                                statusIndicator.classList.add('status'); 
                                statusIndicator.textContent = "Offline";
                                chat.appendChild(statusIndicator); 
                            }
                            chatlist.appendChild(chat)
                            chat.addEventListener('click', (e) => {
                                e.preventDefault()
                                socket.send(JSON.stringify({ type: "conversation", sender: User.id.toString(), receiver: elem.id.toString(), username: User.username }))
                            })
                        })

                    }
                    break
                case 'conversation':
                    if (data.conversation.length > 0) {
                        document.getElementById('chatListContainer').style.display = 'none'
                        let chat = document.getElementById('chatContainer')
                        chat.style.display = 'flex'

                        let chatbox = document.getElementById('chatBox')
                        chatbox.innerHTML = ""
                        data.conversation.forEach(elem => {
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
                            name.id = "name"
                            name.textContent = data.user.username
                            name.style.color = 'white'
                            name.style.display = 'flex'
                            name.style.position = 'relative'
                            name.style.alignItems = 'center'
                            name.style.padding = '0 15px'
                            name.style.marginRight = '150px'
                            name.style.flexDirection = 'column'
                            name.style.justifyContent = 'spacebetween'
                            name.style.textAlign = 'center'
                            name.style.whitespace = 'nowrap'
                            chatheader.appendChild(name)
                            let chatContainer = document.getElementById('chatContainer');
                            chatContainer.style.display = 'flex';
                            if (elem.sender_id === User.id) {
                                let sent = document.createElement('div')
                                sent.classList.add("message", "sent");
                                sent.textContent = elem.body
                                chatbox.appendChild(sent)
                            } else {
                                let receive = document.createElement('div')
                                receive.textContent = elem.body
                                receive.classList.add('message', 'received')
                                chatbox.appendChild(receive)
                            }

                        })
                        break
                    }
                    break;
                case 'onlineusers':
                    let online = document.getElementById("chat status")
                    online.innerHTML = ''
                    data.users.forEach(user => {
                        let onlineUser = document.createElement('div')
                        onlineUser.classList.add('user-item')

                        let usernameSpan = document.createElement('span')
                        usernameSpan.textContent = user.username
                        let statusDot = document.createElement('span')
                        statusDot.classList.add('status-dot')
                        statusDot.style.backgroundColor = user.online ? 'green' : 'red'
                        onlineUser.appendChild(usernameSpan)
                        onlineUser.appendChild(statusDot)
                        onlineUser.textContent = user.username
                        online.appendChild(onlineUser)
                    })
                default:
                    console.log("Unknown message type:", data.type);
            }
        });

        socket.addEventListener('close', () => {
            console.log("WebSocket closed. Attempting to reconnect...");
            setTimeout(connectWebSocket, 3000);
        });

        socket.addEventListener('error', (err) => {
            console.error("WebSocket encountered an error:", err);
            socket.close();
        });

        let newChat = document.getElementById('newChat')
        if (newChat) {
            newChat.addEventListener('click', (e) => {
                e.preventDefault()
                socket.send(JSON.stringify({ type: 'getusers', username: User.username }))
            })
        }

        let send = document.getElementById('send')
        send.addEventListener('click', (e) => {
            e.preventDefault()
            let msg = document.getElementById('messageInput').value
            let user = document.getElementById('name')
            socket.send(JSON.stringify({ type: 'messaging', sender: User.username, receiver: user.textContent, message: msg, username: User.username }))
        })
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

function status(users, user) {
    console.log("userssssssssssss")
    console.log(users)
    for (let i = 0 ; i < users.length; i++) {
        if (users[i] === user) {
            return true
        }
    }
    return false
}