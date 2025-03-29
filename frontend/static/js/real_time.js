
import { displayConversation, addMessageToConversation } from './chat.js';
import { renderPosts } from './homepage.js';
import { formatTime, debounce } from './utils.js';

let socket;
let messageProcessing = false;

export function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    socket.addEventListener('open', handleSocketOpen);
    socket.addEventListener('message', handleSocketMessage);
    socket.addEventListener('close', handleSocketClose);
    socket.addEventListener('error', handleSocketError);
    
    window.forumSocket = socket;
    return socket;
}

function handleSocketOpen() {
    console.log('WebSocket connected');
    
    // Request initial data
    const session = sessionStorage.getItem('session');
    if (session) {
        socket.send(JSON.stringify({ type: 'getuser', session: session }));
    }
    
    socket.send(JSON.stringify({ type: 'getposts' }));
    
    // Register as online user
    const username = localStorage.getItem('username');
    if (username) {
        socket.send(JSON.stringify({ type: 'onlineusers', username: username }));
    }
}

const handleSocketMessage = debounce(function(event) {
    if (messageProcessing) return;
    
    messageProcessing = true;
    
    try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        // Route message to appropriate handler
        const handlers = {
            posts: handlePostsMessage,
            getuser: handleUserMessage,
            reaction: handleReactionMessage,
            getcomments: handleCommentsMessage,
            addcomment: handleNewCommentMessage,
            getusers: handleUsersMessage,
            chats: handleChatsMessage,
            conversation: handleConversationMessage,
            messaging: handleChatMessage,
            newMessage: handleIncomingMessage,
            onlineusers: handleOnlineUsersMessage,
            postCreated: handlePostCreatedMessage,
            error: handleErrorMessage
        };
        
        if (handlers[data.type]) {
            handlers[data.type](data);
        } else {
            console.log('Unknown message type:', data.type);
        }
    } catch (err) {
        console.error('Error processing message:', err);
    } finally {
        messageProcessing = false;
    }
}, 100);

function handleSocketClose() {
    console.log('WebSocket closed. Attempting to reconnect...');
    
    // Attempt to reconnect after delay
    setTimeout(() => {
        initWebSocket();
    }, 3000);
}

function handleSocketError(err) {
    console.error('WebSocket error:', err);
    socket.close();
}

function handlePostsMessage(data) {
    const postsContainer = document.querySelector('.posts');
    if (postsContainer) {
        renderPosts(data, postsContainer);
    }
}

function handleUserMessage(data) {
    if (!data.user) return;
    
    // Update profile display
    updateUserProfile(data.user);
    
    // Store user info
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('username', data.user.username);
}

function updateUserProfile(user) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName) profileName.textContent = user.username || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
}

function handleReactionMessage(data) {
    const { id, reaction, action } = data;
    
    const reactionBtn = document.getElementById(`${reaction}-${id}`);
    if (reactionBtn) {
        const countElement = reactionBtn.querySelector(`.${reaction}-count`);
        if (countElement) {
            let count = parseInt(countElement.textContent) || 0;
            
            if (action === 'add') {
                count++;
            } else if (action === 'remove') {
                count = Math.max(0, count - 1);
            }
            
            countElement.textContent = count;
            
            // Visual feedback
            reactionBtn.classList.add('active');
            setTimeout(() => {
                reactionBtn.classList.remove('active');
            }, 500);
        }
    }
}

function handleCommentsMessage(data) {
    if (!data.comments || !Array.isArray(data.comments)) return;
    
    const postId = data.postId;
    const commentList = document.getElementById(`comment-list-${postId}`);
    
    if (commentList) {
        commentList.innerHTML = '';
        
        data.comments.forEach(comment => {
            addCommentToUI(commentList, comment);
        });
    }
}

function handleNewCommentMessage(data) {
    const { postId, comment } = data;
    const commentList = document.getElementById(`comment-list-${postId}`);
    
    if (commentList) {
        addCommentToUI(commentList, comment);
        
        // Update comment count
        const countElement = document.querySelector(`#comment-${postId} .comment-count`);
        if (countElement) {
            let count = parseInt(countElement.textContent) || 0;
            countElement.textContent = count + 1;
        }
    }
}

function addCommentToUI(commentList, comment) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment', 'animate-slide-in');
    
    const author = document.createElement('p');
    author.classList.add('comment-author');
    author.innerHTML = `<strong>@${comment.username || 'Unknown'}</strong> <small>${formatTime(comment.created_on)}</small>`;
    
    const content = document.createElement('p');
    content.classList.add('comment-content');
    content.textContent = comment.body || '';
    
    commentElement.appendChild(author);
    commentElement.appendChild(content);
    
    // Add reactions if needed
    const actions = document.createElement('div');
    actions.classList.add('comment-actions');
    
    commentElement.appendChild(actions);
    commentList.appendChild(commentElement);
}

function handleUsersMessage(data) {
    if (!data.users || !Array.isArray(data.users)) return;
    
    const userlist = document.getElementById('userList');
    if (!userlist) return;
    
    userlist.innerHTML = '';
    
    const currentUsername = localStorage.getItem('username');
    
    data.users.forEach(user => {
        // Skip current user
        if (user.username === currentUsername) return;
        
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        
        // Determine user status
        let statusClass = 'offline';
        if (user.online) {
            statusClass = 'online';
        } else if (user.away) {
            statusClass = 'away';
        }
        
        userItem.innerHTML = `
            <div class="user-info">
                <div class="name">${user.username}</div>
                <div class="status">
                    <span class="status-dot ${statusClass}"></span>
                    ${statusClass}
                </div>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            socket.send(JSON.stringify({ 
                type: 'conversation', 
                sender: localStorage.getItem('userId'), 
                receiver: user.id.toString() 
            }));
        });
        
        userlist.appendChild(userItem);
    });
    
    document.getElementById('userListContainer').style.display = 'flex';
    document.getElementById('chatListContainer').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'none';
}

function handleChatsMessage(data) {
    if (!data.users || !Array.isArray(data.users)) return;
    
    const chatList = document.getElementById('chatList');
    if (!chatList) return;
    
    chatList.innerHTML = '';
    
    if (data.users.length === 0) {
        const noChats = document.createElement('div');
        noChats.classList.add('no-chats');
        noChats.textContent = 'No active chats. Start a new conversation!';
        chatList.appendChild(noChats);
        return;
    }
    
    data.users.forEach(user => {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        
        // Determine user status
        let statusClass = 'offline';
        if (user.online) {
            statusClass = 'online';
        } else if (user.away) {
            statusClass = 'away';
        }
        
        chatItem.innerHTML = `
            <div class="chat-info">
                <div class="name">${user.username}</div>
                <div class="status">
                    <span class="status-dot ${statusClass}"></span>
                    ${statusClass}
                </div>
            </div>
        `;
        
        chatItem.addEventListener('click', () => {
            socket.send(JSON.stringify({ 
                type: 'conversation', 
                sender: localStorage.getItem('userId'), 
                receiver: user.id.toString() 
            }));
        });
        
        chatList.appendChild(chatItem);
    });
}

function handleConversationMessage(data) {
    if (!data.conversation || !Array.isArray(data.conversation) || !data.user) return;
    
    displayConversation(data.conversation, data.user);
}

function handleChatMessage(data) {
    if (data.status === "ok") {
        addMessageToConversation(data.message, true);
    }
}

/**
 * Handle incoming message from another user
 * 
 * @param {Object} data - The incoming message data
 */
function handleIncomingMessage(data) {
    const currentChatUser = document.getElementById('chatHeaderUser')?.textContent;
    
    if (currentChatUser === data.sender) {
        addMessageToConversation(data.message, false);
    } else {
        // Show notification for message from user we're not currently chatting with
        showMessageNotification(data.sender, data.message);
    }
}

function showMessageNotification(sender, message) {
    const notification = document.createElement('div');
    notification.classList.add('message-notification');
    
    notification.innerHTML = `
        <div class="notification-header">
            <strong>${sender}</strong>
        </div>
        <div class="notification-body">
            ${message.length > 30 ? message.substring(0, 30) + '...' : message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

function handleOnlineUsersMessage(data) {
    if (!data.online_users) return;
    
    const onlineUsersList = document.getElementById('onlineUsersList');
    if (!onlineUsersList) return;
    
    onlineUsersList.innerHTML = '';
    
    const usernames = Object.keys(data.online_users);
    
    if (usernames.length === 0) {
        const noUsers = document.createElement('div');
        noUsers.classList.add('no-online-users');
        noUsers.textContent = 'No online users';
        onlineUsersList.appendChild(noUsers);
        return;
    }
    
    usernames.forEach(username => {
        const userItem = document.createElement('div');
        userItem.classList.add('online-user-item');
        
        const statusDot = document.createElement('span');
        statusDot.classList.add('status-dot', 'online');
        
        const userName = document.createElement('span');
        userName.classList.add('online-user-name');
        userName.textContent = username;
        
        userItem.appendChild(statusDot);
        userItem.appendChild(userName);
        onlineUsersList.appendChild(userItem);
    });
}


function handlePostCreatedMessage(data) {
    console.log('Post created successfully:', data);
    
    // Request updated posts
    socket.send(JSON.stringify({ type: 'getposts' }));
}

function handleErrorMessage(data) {
    console.error('Server error:', data.message);
    
    if (data.message === 'invalid session') {
        // Redirect to sign-in
        window.location.href = '/signin';
    } else {
        // Show error to user
        alert(`Error: ${data.message}`);
    }
}

export function sendWebSocketMessage(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return;
    }
    
    socket.send(JSON.stringify(data));
}

export function isWebSocketConnected() {
    return socket && socket.readyState === WebSocket.OPEN;
}

export function whenConnected(callback) {
    if (isWebSocketConnected()) {
        callback();
    } else {
        setTimeout(() => whenConnected(callback), 100);
    }
}
