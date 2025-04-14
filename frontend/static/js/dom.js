import { HomePage, showAlert } from './homepage.js';
import { SignInPage } from './sign-in.js';

document.addEventListener('DOMContentLoaded', () => {
    const previousState = sessionStorage.getItem('pageState');
    if (previousState === 'home') {
        sessionStorage.setItem('pageState', '');
        const session = sessionStorage.getItem('session');
        checksession(session);
    } else {
        SignInPage();
    }
});

export async function RealTime() {
    let socket;
    const Username = sessionStorage.getItem("username");
    const UserId = sessionStorage.getItem("userId");
    const MESSAGES_PER_PAGE = 10;
    let currentPage = 1;
    let conversationData = [];

    const connectWebSocket = () => {
        return new Promise((resolve, reject) => {
            socket = new WebSocket(`ws://${window.location.host}/ws`);

            if (!Username || !UserId || Username.length === 0 || UserId.length === 0) {
                showAlert("Invalid session");
                sessionStorage.clear();
                SignInPage();
                reject(new Error("Invalid session"));
                return;
            }

            socket.addEventListener('open', () => {
                socket.send(JSON.stringify({
                    type: 'register',
                    username: Username,
                    sender: UserId,
                }));
                resolve();
            });

            socket.addEventListener('error', (error) => {
                reject(error);
            });

            socket.addEventListener('message', (e) => {
                const data = JSON.parse(e.data);
                handleSocketMessage(data);
            });

            attachUIEventListeners()
        });
    };

    const attachUIEventListeners = () => {
        const newChat = document.getElementById('newChat');
        if (newChat) {
            newChat.addEventListener('click', (e) => {
                e.preventDefault();
                socket.send(JSON.stringify({ type: 'getusers' }));
            });
        }

        const sendBtn = document.getElementById('send');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const msg = document.getElementById('messageInput').value;
                const receiverElem = document.getElementById('name');
                socket.send(JSON.stringify({
                    type: 'messaging',
                    sender: Username,
                    receiver: receiverElem?.textContent,
                    message: msg,
                    username: Username,
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
                    setTimeout(() => createPostForm.classList.add('hidden'), 500);
                }
                console.log('clicked post add')
            });
        }
    };

    const showChatList = (data) => {
        document.getElementById('userListContainer').style.display = 'none';
        document.getElementById("chatContainer").style.display = "none";
        document.getElementById("chatListContainer").style.display = "flex";
        if (data.users.length > 0) {
            const chatList = document.getElementById('chatList');
            chatList.innerHTML = "";

            const loading = document.createElement('div');
            loading.textContent = "Loading chats...";
            chatList.appendChild(loading);
            chatList.innerHTML = ""
            data.users.forEach(elem => {
                const chat = document.createElement('div');
                chat.classList.add('chat');
                chat.textContent = elem.username;
                chat.dataset.username = elem.username;
                const statusIndicator = document.createElement('p');
                statusIndicator.classList.add('status');
                statusIndicator.textContent = status(data.online, elem.username) ? "Online" : "Offline";
                chat.appendChild(statusIndicator);
                const handler = createHandler(elem, socket);
                chat.addEventListener('click', handler);
                chatList.appendChild(chat);
            });
        }
    };

    const createHandler = (elem, socket) => {
        return function handleChatClick(e) {
            e.preventDefault();
            console.log('conversation clicked')
            if (socket.readyState === WebSocket.OPEN) {
                console.log('conversation sending')
                sendConversation(elem);
            } else {
                showAlert("Connection not ready. Please try again.");
            }
        };
    };

    const sendConversation = (elem) => {
        console.log('entered the sending feature')
        socket.send(JSON.stringify({
            type: "conversation",
            sender: UserId,
            receiver: elem.id.toString(),
            username: Username,
        }));
        console.log('conversation sent')
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    const createBackButton = (onClick) => {
        const btn = document.createElement('button');
        btn.classList.add('back-button');
        btn.textContent = 'Back';

        const handler = createBackHandler(onClick);
        btn.removeEventListener('click', handler);
        btn.addEventListener('click', handler);
        return btn;
    };

    const createBackHandler = (onClick) => {
        return function handleback(e) {
            e.preventDefault();
            console.log('clicked back')
            onClick()
        }
    }

    const loadMessages = (page, prepend = false) => {
        const chatBox = document.getElementById('chatBox');
        const totalMessages = conversationData.length;
        const start = Math.max(totalMessages - (page * MESSAGES_PER_PAGE), 0);
        const end = totalMessages - ((page - 1) * MESSAGES_PER_PAGE);
        const messagesToShow = conversationData.slice(start, end);
        const oldScrollHeight = chatBox.scrollHeight;

        messagesToShow.forEach(elem => {
            console.log(elem)
            let messageDiv = document.createElement('div');
            messageDiv.classList.add("message", elem.sender_id.toString() === UserId ? "sent" : "received");
            messageDiv = arrangemessage(messageDiv, elem)

            if (prepend) {
                chatBox.insertBefore(messageDiv, chatBox.firstChild);
            } else {
                chatBox.appendChild(messageDiv);
            }
        });

        if (prepend) {
            chatBox.scrollTop = chatBox.scrollHeight - oldScrollHeight;
        } else {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    const showConversation = throttle((data) => {
        conversationData = data.conversation;
        currentPage = 1;

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
                sender: UserId,
                username: Username,
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

        loadMessages(currentPage);

        chatBox.addEventListener('scroll', () => {
            if (chatBox.scrollTop === 0) {
                currentPage++;
                loadMessages(currentPage, true);
            }
        });
    }, 100);

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
                sender: UserId,
                username: Username,
            }));

        });
        header.appendChild(backBtn);
        userList.appendChild(header);
        const chatList = document.createElement('div');
        chatList.classList.add('chat-list');
        data.users.sort((a, b) => a.username.localeCompare(b.username))
        data.users.forEach(elem => {
            if (elem.username !== Username) {
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
                        sender: UserId,
                        receiver: elem.id.toString(),
                        username: Username,
                    }));
                });
                chatList.appendChild(item);
            }
        });
        userList.appendChild(chatList);
        userList.style.display = 'flex';
    };

    const displayMessage = (data) => {
        let messageElement = document.createElement("div");
        messageElement.classList.add("message", data.sender.username === Username ? "sent" : "received");
        messageElement = arrangemessage(messageElement, data.message)
        let chatBox = document.getElementById("chatBox")
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = "";
            input.placeholder = 'Type a message...';
        }
    };

    const updateChatStatuses = (data) => {
        const chats = document.querySelectorAll('.chat');
        chats.forEach(chat => {
            const username = chat.dataset.username;
            chat.innerHTML = username;
            const statusIndicator = document.createElement('p');
            statusIndicator.classList.add('status');
            statusIndicator.textContent = status(data.online, username) ? "Online" : "Offline";
            chat.appendChild(statusIndicator);
        });
    };

    const handleSocketMessage = (data) => {
        switch (data.type) {
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
        }
    }

    try {
        await connectWebSocket();
    } catch (error) {
        showAlert("Connection failed. Please refresh.");
        SignInPage();
        return;
    }
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
            HomePage(data)
            await RealTime();
        } else {
            sessionStorage.clear();
            SignInPage();
        }
    } catch (error) {
        showAlert(error);
        SignInPage();
    }
}

const arrangemessage = (messageDiv, elem) => {
    const rawTimestamp = elem.sent_on;
    const parsedTimestamp = new Date(rawTimestamp.replace(' +0000 UTC', 'Z'));

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    };

    elem.sent_on = parsedTimestamp.toLocaleString('en-US', options)
        .replace(/,/, ', ')
        .replace(/(\d{1,2}:\d{2})\s/, '$1 ');
    let puser = document.createElement('span')
    puser.classList.add('message-author')
    let content = document.createElement('p')
    content.classList.add("message-content")
    content.textContent = decodeHTML(elem.body)
    puser.textContent = elem.username

    let p = document.createElement('p');
    p.classList.add('message-time')
    p.innerHTML = `
    <time datetime="${elem.sent_on || ''}">${elem.sent_on || 'Unknown'}</time>
    `
    messageDiv.appendChild(puser)
    messageDiv.appendChild(content)
    messageDiv.appendChild(p)
    return messageDiv
}

const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const status = (onlineUsersList, username) => {
    if (!onlineUsersList) {
        return false
    }
    return onlineUsersList.includes(username);
};