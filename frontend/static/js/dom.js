import { HomePage, showAlert, notification, applyTheme } from './homepage.js';
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

    const savedTheme = sessionStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

});

export async function RealTime() {
    let socket;
    const Username = sessionStorage.getItem("username");
    const UserId = sessionStorage.getItem("userId");
    const MESSAGES_PER_PAGE = 10;
    let currentPage = 1;
    let conversationData = [];
    let logout = document.querySelector('.logout-button');
    let shouldreconnect = true;
    let typingTimeout;

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

            socket.addEventListener('close', () => {
                if (shouldreconnect) {
                    setTimeout(connectWebSocket, 3000);
                }
            })

            attachUIEventListeners()
        });
    };

    const attachUIEventListeners = () => {
        const sendBtn = document.getElementById('send');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let msg = document.getElementById('messageInput').value;
                if (msg.trim() === "") {
                    return
                }
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

        const input = document.getElementById('messageInput');
        if (input) {
            input.addEventListener('keydown', (e) => {
                const receiverElem = document.getElementById('name');
                if (e.key !== 'Enter') {
                    socket.send(JSON.stringify({
                        type: 'typing',
                        receiver: receiverElem?.textContent,
                        sender: Username,
                    }))
                    return;
                }
                // Sort all users alphabetically by username (case-insensitive)

                if (e.key === 'Enter' && !e.shiftKey) {
                    let msg = document.getElementById('messageInput').value;
                    if (msg.trim() === "") {
                        return
                    }
                    e.preventDefault();
                    msg = input.value;
                    socket.send(JSON.stringify({
                        type: 'messaging',
                        sender: Username,
                        receiver: receiverElem?.textContent,
                        message: msg,
                        username: Username,
                    }));
                }

            })
        }

        document.querySelectorAll('.chat-input-textarea').forEach(textarea => {
            textarea.addEventListener('input', function () {
                // Reset height to auto to get correct scrollHeight
                this.style.height = 'auto';

                // Calculate maximum allowed height (7 lines)
                const maxHeight = 184; // Should match CSS max-height

                if (this.scrollHeight <= maxHeight) {
                    // Expand to content height if under max
                    this.style.height = `${this.scrollHeight}px`;
                } else {
                    // Show scrollbar when reaching max height
                    this.style.height = `${maxHeight}px`;
                }
            });

            // Initialize with proper height
            textarea.dispatchEvent(new Event('input'));
        });
    };

    const showChatList = (data) => {
        let results;
        document.getElementById('chatContainer').style.display = 'none'
        document.getElementById("chatListContainer").style.display = "flex";
        if (data.allUsers) {
            if (data.allUsers.length > 0) {
                const chatList = document.getElementById('chatList');
                chatList.innerHTML = "";

                if (data.users) {
                    const userSet = new Set(data.users.map(user => user.username.toLowerCase()));

                    const sorted = data.allUsers.sort((a, b) => {
                        const nameA = a.username.toLowerCase();
                        const nameB = b.username.toLowerCase();
                        return nameA.localeCompare(nameB);
                    });

                    let filtered = sorted.filter(user =>
                        !userSet.has(user.username.toLowerCase())
                    );

                    const filtered1 = filtered.filter(user => user.username != Username)

                    results = data.users.concat(filtered1);
                } else {

                    const sorted = data.allUsers.sort((a, b) => {
                        const nameA = a.username.toLowerCase();
                        const nameB = b.username.toLowerCase();
                        return nameA.localeCompare(nameB);
                    });

                    const filtered = sorted.filter(user => user.username != Username)

                    results = filtered;
                }

                const loading = document.createElement('div');
                loading.textContent = "Loading chats...";
                chatList.appendChild(loading);
                chatList.innerHTML = ""
                results.forEach(elem => {
                    const chat = document.createElement('div');
                    chat.classList.add('chat');
                    chat.textContent = elem.username;
                    chat.dataset.username = elem.username;
                    const statusIndicator = document.createElement('span');
                    statusIndicator.classList.add('status-dot');
                    if (status(data.online, elem.username)) {
                        statusIndicator.classList.add('online');
                    } else {
                        statusIndicator.classList.add('offline');
                    }
                    chat.appendChild(statusIndicator);
                    const msgcount = document.createElement('p');
                    msgcount.classList.add('unread')
                    msgcount.textContent = unread(data.unread, elem.username)
                    if (unread(data.unread, elem.username) > 0) {
                        chat.appendChild(msgcount)
                    }
                    const handler = createHandler(elem, socket, msgcount);
                    chat.addEventListener('click', handler);
                    chatList.appendChild(chat);
                });
            }
        }
    };

    const createHandler = (elem, socket, msgcount) => {
        return function handleChatClick(e) {
            e.preventDefault();
            if (socket.readyState === WebSocket.OPEN) {
                sendConversation(elem);
                msgcount.textContent = "";
            } else {
                showAlert("Connection not ready. Please try again.");
            }
        };
    };

    const sendConversation = (elem) => {
        socket.send(JSON.stringify({
            type: "conversation",
            sender: UserId,
            receiver: elem.id.toString(),
            username: Username,
        }));
        socket.send(JSON.stringify({
            type: 'read',
            receiver: UserId,
            sender: elem.id.toString(),
        }))
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
        const typing = document.getElementById("typingIndicator")

        messagesToShow.forEach(elem => {
            let messageDiv = document.createElement('div');
            messageDiv.classList.add("message", elem.sender_id.toString() === UserId ? "sent" : "received");
            messageDiv = arrangemessage(messageDiv, elem)

            if (prepend) {
                chatBox.insertBefore(messageDiv, chatBox.firstChild);
            } else {
                chatBox.insertBefore(messageDiv, typing);
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
        nameDiv.classList.add('namediv')
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

        let typing = document.createElement('div');
        typing.id = "typingIndicator";
        typing.classList.add("typing-indicator")
        typing.style.display = 'none';
        typing.innerHTML = `
            <span></span><span></span><span></span>
        `
        chatBox.appendChild(typing)

    }, 100);


    const displayMessage = (data) => {
        if (Username !== data.sender.username) {
            notification(`Message received from ${data.sender.username}`)
        }

        if (document.getElementById('chatContainer').style.display === 'none') {
            socket.send(JSON.stringify({
                type: "chats",
                sender: UserId,
                username: Username,
            }));
            return
        } else if (document.getElementById('chatContainer').style.display === 'flex') {
            const nameDiv = document.getElementById('name');
            if (nameDiv?.textContent !== data.sender.username && data.sender.username != Username) {
                socket.send(JSON.stringify({
                    type: "chats",
                    sender: UserId,
                    username: Username,
                }));
                return
            }
        } 

        let messageElement = document.createElement("div");
        messageElement.classList.add("message", data.sender.username === Username ? "sent" : "received");
        messageElement = arrangemessage(messageElement, data.message)
        let chatBox = document.getElementById("chatBox")

        socket.send(JSON.stringify({
            type: 'read',
            receiver: UserId,
            sender: data.sender.id.toString(),
        }))

        let nameDiv = document.getElementById('name')



        if (Username === data.sender.username || (Username !== data.sender.username && data.sender.username == nameDiv.textContent)) {
            const typing = document.getElementById("typingIndicator")
            chatBox.insertBefore(messageElement, typing);
            chatBox.scrollTop = chatBox.scrollHeight;
            const input = document.getElementById('messageInput');
            if (Username === data.sender.username) {
                if (input) {
                    input.value = "";
                    input.placeholder = 'Type a message...';
                }
            }
        }

    };

    const displayTyping = (data) => {
        if (Username === data.receiver.username) {
            const nameDiv = document.getElementById('name');
            if (nameDiv?.textContent === data.sender.username) {
                const typing = document.getElementById("typingIndicator");
                const wasAlreadyVisible = typing.style.display === 'flex';

                typing.style.display = 'flex';

                // Scroll logic
                const chatBox = document.getElementById('chatBox');
                const isNearBottom =
                    chatBox.scrollHeight - chatBox.clientHeight - chatBox.scrollTop < 100;

                if (isNearBottom) {
                    chatBox.scrollTop = chatBox.scrollHeight - chatBox.clientHeight;
                }

                // Clear existing timeout regardless of visibility state
                clearTimeout(typingTimeout);

                // Reset timer (5000ms for visible state, 3000ms for new appearance)
                typingTimeout = setTimeout(() => {
                    typing.style.display = 'none';
                }, wasAlreadyVisible ? 350 : 350);
            }
        }
    };

    const updateChatStatuses = (data) => {
        const chats = document.querySelectorAll('.chat');
        chats.forEach(chat => {
            let unreadCount = 0
            const unread = chat.querySelector('.unread')
            if (unread) {
                unreadCount = unread.textContent
            }
            const username = chat.dataset.username;
            chat.innerHTML = username;
            const statusIndicator = document.createElement('span')
            statusIndicator.classList.add('status-dot');
            if (status(data.online, username)) {
                statusIndicator.classList.add('online');
                statusIndicator.classList.remove('offline')
            } else {
                statusIndicator.classList.add('offline');
                statusIndicator.classList.remove('online')
            }

            const msgcount = document.createElement('p');
            msgcount.classList.add('unread')
            msgcount.textContent = unreadCount;
            chat.appendChild(statusIndicator);
            if (unreadCount > 0) {
                chat.appendChild(msgcount)
            }
        });
    };

    const handleSocketMessage = (data) => {
        console.log(data.type)
        switch (data.type) {
            case 'error':
                if (data.message === 'invalid session') {
                    sessionStorage.clear();
                    SignInPage();
                    showAlert(data.message);
                } else {
                    showAlert(data.message);
                }
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
            case 'typing':
                displayTyping(data)
                break
            default:
                showAlert('unexpected error occured. Try again later')
        }
    }

    logout.addEventListener('click', (e) => {
        e.preventDefault()
        logOut()
    })

    async function logOut() {
        try {
            const response = await fetch('/logout')

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error)
            }
            shouldreconnect = false;
            sessionStorage.clear();
            socket.close();
            SignInPage();
            showAlert("Logged out successfully");
        } catch (error) {
            shouldreconnect = false;
            sessionStorage.clear();
            socket.close();
            showAlert(`Error: ${error.message}`);
        }
    }

    try {
        await connectWebSocket();
    } catch (error) {
        showAlert("Connection failed. Please refresh.");
        SignInPage();
        return;
    }

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

const unread = (unread, username) => {
    if (!unread) {
        return ""
    }

    if (username in unread) {
        return unread[username].toString()
    }
    return ""
}