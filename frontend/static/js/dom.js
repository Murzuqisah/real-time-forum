import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';

document.addEventListener('DOMContentLoaded', () => {
    const previousState = sessionStorage.getItem('pageState');
    if (previousState === 'home') {
        sessionStorage.setItem('pageState', '');
        const session = sessionStorage.getItem('session');
        checksession(session);
    } else {
        SignInPage();
    }

    const signinBtn = document.getElementById('sign-in-btn');
    if (signinBtn) {
        signinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            login(email, password);
        });
    }
});

export function RealTime(User, session) {
    HomePage();
    let socket;

    const connectWebSocket = () => {
        socket = new WebSocket(`ws://${window.location.host}/ws`);

        if (!User) {
            waitForSocket(() => {
                const session = sessionStorage.getItem('session');
                socket.send(JSON.stringify({
                    type: 'getuser',
                    session,
                    username: User.username
                }));
            });
        }

        socket.addEventListener('open', () => {
            if (!User) {
                waitForSocket(() => {
                    const session = sessionStorage.getItem('session');
                    socket.send(JSON.stringify({
                        type: 'getuser',
                        session,
                        username: User.username
                    }));
                });
            }

            socket.send(JSON.stringify({
                type: "register",
                username: User.username,
                sender: User.id.toString(),
            }));
        });


        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);
            handleSocketMessage(data);
        });

        socket.addEventListener('close', () => {
            console.log("WebSocket closed. Reconnecting...");
            setTimeout(connectWebSocket, 3000);
        });

        socket.addEventListener('error', (err) => {
            console.error("WebSocket error:", err);
            socket.close();
        });

        attachUIEventListeners();
    };

    const handleSocketMessage = (data) => {
        switch (data.type) {
            case "posts":
                const postContainer = document.querySelector('.posts');
                if (postContainer) renderPosts(data, postContainer);
                break;
            case 'error':
                if (data.message === 'invalid session') {
                    sessionStorage.setItem('pageState', '');
                    sessionStorage.setItem('session', '');
                    SignInPage();
                    alert(data.message);
                } else {
                    alert(data.message);
                }
                break;
            case 'getuser':
                User = data.user;
                socket.send(JSON.stringify({
                    type: "register",
                    username: User.username,
                    sender: User.id.toString(),
                }));
                break;
            case 'reaction':
                console.log('adding reaction');
                const reaction = document.getElementById(data.id);
                if (data.reaction === 'like' && reaction?.likecount) {
                    reaction.likecount.textContent = reaction.likecount + data.reaction;
                }
                break;
            case 'getusers':
                showUsersList(data);
                break;
            case 'messaging':
                if (data.status === "ok") {
                    displayMessage(data);
                }
                break;
            case "chats":
                showChatList(data);
                break;
            case 'conversation':
                if (data.conversation) {
                    showConversation(data);
                } else {
                    showConversation({ ...data, conversation: [] });
                }
                break;
            case 'onlineusers':
                updateChatStatuses(data);
                break;
            default:
                console.log("Unknown message type:", data.type);
        }

        const  form = document.getElementById('upload');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let postTitle = document.getElementById('post-title').value;
                let postBody = document.getElementById('post-content').value;
                let postFile = document.getElementById('uploaded-file').files[0];
                
                if (!postTitle || !postBody) {
                    alert('Please fill in all fields.');
                    return;
                }
                
                const createPostForm = document.querySelector('.create-post');
                createPostForm.classList.add('hidden');
                
                if (postFile) {
                    let filetype = postFile.type;
                    let validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                    if (!validTypes.includes(filetype)) {
                        alert('Invalid file type. Please upload an image.');
                        return;
                    }
                    if (postFile.size > 20 * 1024 * 1024) {
                        alert('File size exceeds 20MB. Please upload a smaller image.');
                        return;
                    }
                    
                    let reader = new FileReader();
                    
                    reader.onloadend = function () {
                        let base64data = reader.result.split(',')[1];
                        socket.send(JSON.stringify({
                            type: 'post',
                            title: postTitle,
                            body: postBody,
                            file: base64data,
                            sender: User.id.toString(),
                        }));
                    }
                    reader.readAsDataURL(file);
                } else {
                    socket.send(JSON.stringify({
                        type: 'post',
                        title: postTitle,
                        body: postBody,
                        file: null,
                        sender: User.id.toString(),
                    }));
                }
                console.log('event for posting called')
            })
        }
    };

    const attachUIEventListeners = () => {
        // New chat button event
        const newChat = document.getElementById('newChat');
        if (newChat) {
            newChat.addEventListener('click', (e) => {
                e.preventDefault();
                socket.send(JSON.stringify({ type: 'getusers' }));
            });
        }

        // Send message event
        const sendBtn = document.getElementById('send');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const msg = document.getElementById('messageInput').value;
                const receiverElem = document.getElementById('name');
                socket.send(JSON.stringify({
                    type: 'messaging',
                    sender: User.username,
                    receiver: receiverElem?.textContent,
                    message: msg,
                    username: User.username
                }));
            });
        }

        const floatingButton = document.getElementById('floatingButton');
        if (floatingButton) {
            floatingButton.addEventListener('click', function (e) {
                e.preventDefault();
                const createPostForm = document.querySelector('.create-post');
                if (createPostForm.classList.contains('hidden')) {
                    createPostForm.classList.remove('hidden');
                    createPostForm.style.opacity = 1;
                    createPostForm.style.visibility = 'visible';
                } else {
                    createPostForm.style.opacity = 0;
                    createPostForm.style.visibility = 'hidden';
                    setTimeout(() => createPostForm.classList.add('hidden'), 500); // Delay hiding with a timeout to allow opacity transition
                }
                console.log('clicked post add')
            });
        }
    };

    const waitForSocket = (callback) => {
        if (socket.readyState === WebSocket.OPEN) {
            callback();
        } else {
            console.log('Socket not ready, retrying...');
            setTimeout(() => waitForSocket(callback), 50);
        }
    };

    const updateChatStatuses = (data) => {
        const chats = document.querySelectorAll('.chat');
        chats.forEach(chat => {
            const username = chat.dataset.username;
            // Clear previous content and set username as base content.
            chat.innerHTML = username;
            const statusIndicator = document.createElement('p');
            statusIndicator.classList.add('status');
            // Use the helper status() to determine if the user is online.
            statusIndicator.textContent = status(data.online, username) ? "Online" : "Offline";
            chat.appendChild(statusIndicator);
        });
    };

    // Helper functions for UI updates
    const showUsersList = (data) => {
        document.getElementById("chatListContainer").style.display = "none";
        const userList = document.getElementById("userListContainer");
        userList.innerHTML = "";
        const header = document.createElement('div');
        header.classList.add('header');
        header.textContent = "Users";
        const backBtn = createBackButton(() => {
            socket.send(JSON.stringify({
                type: "chats",
                sender: User.id.toString(),
                username: User.username
            }));
        });
        header.appendChild(backBtn);
        userList.appendChild(header);
        const chatList = document.createElement('div');
        chatList.classList.add('chat-list');
        data.users.forEach(elem => {
            if (elem.username !== User.username) {
                const item = document.createElement('div');
                item.classList.add('chat');
                item.textContent = elem.username;
                item.dataset.username = elem.username;
                const statusIndicator = document.createElement('p');
                statusIndicator.classList.add('status');
                statusIndicator.textContent = status(data.online, elem.username) ? "Online" : "Offline";
                item.appendChild(statusIndicator);
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    socket.send(JSON.stringify({
                        type: "conversation",
                        sender: User.id.toString(),
                        receiver: elem.id.toString(),
                        username: User.username
                    }));
                });
                chatList.appendChild(item);
            }
        });
        userList.appendChild(chatList);
        userList.style.display = 'flex';
    };

    const showChatList = (data) => {
        document.getElementById('userListContainer').style.display = 'none';
        document.getElementById("chatContainer").style.display = "none";
        document.getElementById("chatListContainer").style.display = "flex";
        if (data.users.length > 0) {
            const chatList = document.getElementById('chatList');
            chatList.innerHTML = "";
            data.users.forEach(elem => {
                const chat = document.createElement('div');
                chat.classList.add('chat');
                chat.textContent = elem.username;
                chat.dataset.username = elem.username;
                const statusIndicator = document.createElement('p');
                statusIndicator.classList.add('status');
                statusIndicator.textContent = status(data.online, elem.username) ? "Online" : "Offline";
                chat.appendChild(statusIndicator);
                chat.addEventListener('click', (e) => {
                    e.preventDefault();
                    socket.send(JSON.stringify({
                        type: "conversation",
                        sender: User.id.toString(),
                        receiver: elem.id.toString(),
                        username: User.username
                    }));
                });
                chatList.appendChild(chat);
            });
        }
    };

    const showConversation = (data) => {
        document.getElementById('chatListContainer').style.display = 'none';
        document.getElementById('userListContainer').style.display = 'none';
        const chat = document.getElementById('chatContainer');
        chat.style.display = 'flex';

        const chatBox = document.getElementById('chatBox');
        chatBox.innerHTML = "";
        const chatHeader = document.getElementById('chatHeader');
        chatHeader.innerHTML = "";
        const backBtn = createBackButton(() => {
            socket.send(JSON.stringify({
                type: "chats",
                sender: User.id.toString(),
                username: User.username
            }));
        });
        chatHeader.appendChild(backBtn);
        const headerSpan = document.createElement('span');
        headerSpan.id = 'chatHeader';
        chatHeader.appendChild(headerSpan);
        const nameDiv = document.createElement('div');
        nameDiv.id = "name";
        nameDiv.textContent = data.user.username;
        Object.assign(nameDiv.style, {
            color: 'white',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            padding: '0 15px',
            marginRight: '150px',
            flexDirection: 'column',
            justifyContent: 'spacebetween',
            textAlign: 'center',
            whitespace: 'nowrap'
        });
        chatHeader.appendChild(nameDiv);
        data.conversation.forEach(elem => {
            if (elem.sender_id === User.id) {
                const sent = document.createElement('div');
                sent.classList.add("message", "sent");
                sent.textContent = elem.body;
                chatBox.appendChild(sent);
            } else {
                const received = document.createElement('div');
                received.classList.add("message", "received");
                received.textContent = elem.body;
                chatBox.appendChild(received);
            }
        });
    };

    const displayMessage = (data) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", data.sender.username === User.username ? "sent" : "received");
        messageElement.innerText = data.message;
        document.getElementById("chatBox").appendChild(messageElement);
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = "";
            input.placeholder = 'Type a message...';
        }
    };

    const createBackButton = (onClick) => {
        const btn = document.createElement('button');
        btn.classList.add('back-button');
        btn.textContent = 'Back';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            onClick();
        });
        return btn;
    };


    const status = (onlineUsersList, username) => {
        return onlineUsersList.includes(username);
    };

    connectWebSocket();

    window.addEventListener('load', () => {
        if (!socket || socket.readyState === WebSocket.CLOSED) connectWebSocket();
    });

    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('pageState', "home");
        sessionStorage.setItem('session', session);
    });
}

async function checksession(session) {
    try {
        const response = await fetch('/check', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session })
        });
        if (!response.ok) throw new Error('Unexpected error occurred');
        const data = await response.json();
        if (data.error === 'ok') {
            RealTime("", session);
        } else {
            sessionStorage.setItem('pageState', '');
            SignInPage();
        }
    } catch (error) {
        console.error(error);
        SignInPage();
    }
}