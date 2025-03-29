import { HomePage } from './homepage.js';
import { initPostCreation } from './post-handler.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    HomePage();
    
    // Initialize post creation
    initPostCreation();
    
    // Initialize theme toggler
    const themeToggler = document.querySelector('.theme-toggler');
    if (themeToggler) {
        themeToggler.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });
    }

    // Apply saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Setup WebSocket connection
    setupWebSocket();
});

// Function to setup WebSocket connection
function setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    socket.addEventListener('open', () => {
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
    });
    
    // Store socket in window object for global access
    window.forumSocket = socket;
    
    // Handle reconnection
    socket.addEventListener('close', () => {
        console.log('WebSocket closed. Attempting to reconnect...');
        setTimeout(setupWebSocket, 3000);
    });
    
    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
        socket.close();
    });
}

// Set up page state for refresh
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('pageState', 'home');
    // Save session if available
    if (sessionStorage.getItem('session')) {
        sessionStorage.setItem('session', sessionStorage.getItem('session'));
    }
});

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Function to fetch posts
function fetchPosts() {
    // Connect to WebSocket and request posts
    const socket = getWebSocket();
    
    // When socket is ready, request posts
    waitForWebSocket(socket, () => {
        socket.send(JSON.stringify({ type: 'getposts' }));
    });
}

// Setup real-time updates for posts, chats, and reactions
function setupRealtimeUpdates() {
    const socket = getWebSocket();
    
    // Add event listeners for post reactions with debounce
    document.addEventListener('click', debounce((e) => {
        const likeButton = e.target.closest('.like-button');
        const dislikeButton = e.target.closest('.dislike-button');
        const commentButton = e.target.closest('.comment-button');
        
        if (likeButton) {
            const postId = likeButton.id.split('-')[1];
            sendReaction(socket, postId, 'like');
        } else if (dislikeButton) {
            const postId = dislikeButton.id.split('-')[1];
            sendReaction(socket, postId, 'dislike');
        } else if (commentButton) {
            const postId = commentButton.closest('.post-actions').id;
            toggleCommentSection(postId);
        }
    }, 300));
    
    // Add event listeners for comment submissions
    document.addEventListener('submit', (e) => {
        const form = e.target.closest('form[id^="comment-form-"]');
        if (form) {
            e.preventDefault();
            const postId = form.querySelector('input[name="id"]').value;
            const comment = form.querySelector('input[name="comment"]').value;
            
            if (comment.trim()) {
                submitComment(socket, postId, comment);
                form.querySelector('input[name="comment"]').value = '';
            }
        }
    });
    
    // Add event listener for chat messages with debounce
    const sendButton = document.getElementById('send');
    if (sendButton) {
        sendButton.addEventListener('click', debounce((e) => {
            e.preventDefault();
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();
            
            if (message) {
                const receiver = document.getElementById('chatHeaderUser').textContent;
                sendChatMessage(socket, receiver, message);
                messageInput.value = '';
            }
        }, 300));
    }
}

// Function to send reactions to the server
function sendReaction(socket, postId, reactionType) {
    const userId = getCurrentUserId();
    if (userId) {
        socket.send(JSON.stringify({ 
            type: 'reaction', 
            postid: postId, 
            userid: userId, 
            reaction: reactionType 
        }));
    } else {
        console.error('User ID not available');
    }
}

// Function to toggle comment section visibility
function toggleCommentSection(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
        
        // If opening the section, fetch comments
        if (commentsSection.style.display === 'block') {
            fetchComments(postId);
        }
    }
}

// Function to fetch comments for a post
function fetchComments(postId) {
    const socket = getWebSocket();
    
    waitForWebSocket(socket, () => {
        socket.send(JSON.stringify({ 
            type: 'getcomments', 
            postid: postId 
        }));
    });
}

// Function to submit a comment
function submitComment(socket, postId, comment) {
    const userId = getCurrentUserId();
    if (userId) {
        socket.send(JSON.stringify({ 
            type: 'addcomment', 
            postid: postId, 
            userid: userId, 
            comment: comment 
        }));
    } else {
        console.error('User ID not available');
    }
}

// Function to send a chat message
function sendChatMessage(socket, receiver, message) {
    const sender = getCurrentUsername();
    if (sender) {
        socket.send(JSON.stringify({ 
            type: 'messaging', 
            sender: sender, 
            receiver: receiver, 
            message: message 
        }));
    } else {
        console.error('Username not available');
    }
}

// Helper function to get current user ID
function getCurrentUserId() {
    // This would normally come from your authentication system
    // For now, returning a placeholder or from localStorage if available
    return localStorage.getItem('userId') || '1';
}

// Helper function to get current username
function getCurrentUsername() {
    return localStorage.getItem('username') || 'user';
}

// Get or create WebSocket connection
function getWebSocket() {
    if (window.forumSocket && window.forumSocket.readyState === WebSocket.OPEN) {
        return window.forumSocket;
    }
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    socket.addEventListener('open', () => {
        console.log('WebSocket connected');
        
        // Request user info and posts
        socket.send(JSON.stringify({ type: 'getuser', session: sessionStorage.getItem('session') }));
        socket.send(JSON.stringify({ type: 'getposts' }));
        
        // Request online users
        socket.send(JSON.stringify({ type: 'onlineusers', username: getCurrentUsername() }));
    });
    
    socket.addEventListener('message', handleWebSocketMessage);
    
    socket.addEventListener('close', () => {
        console.log('WebSocket closed. Attempting to reconnect...');
        setTimeout(() => {
            window.forumSocket = getWebSocket();
        }, 3000);
    });
    
    socket.addEventListener('error', (err) => {
        console.error('WebSocket error:', err);
        socket.close();
    });
    
    window.forumSocket = socket;
    return socket;
}

// Function to wait for WebSocket to be ready
function waitForWebSocket(socket, callback) {
    if (socket.readyState === WebSocket.OPEN) {
        callback();
    } else {
        setTimeout(() => waitForWebSocket(socket, callback), 100);
    }
}

// Handle WebSocket messages
function handleWebSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        switch (data.type) {
            case 'posts':
                updatePosts(data);
                break;
                
            case 'getuser':
                updateUserProfile(data.user);
                break;
                
            case 'reaction':
                updateReactionCount(data);
                break;
                
            case 'getcomments':
                updateComments(data);
                break;
                
            case 'addcomment':
                addNewComment(data);
                break;
                
            case 'getusers':
                updateUserList(data.users);
                break;
                
            case 'chats':
                updateChatList(data.users);
                break;
                
            case 'conversation':
                displayConversation(data);
                break;
                
            case 'messaging':
                handleNewMessage(data);
                break;
                
            case 'onlineusers':
                updateOnlineUsers(data.online_users);
                break;
                
            case 'error':
                handleError(data.message);
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    } catch (err) {
        console.error('Error processing message:', err);
    }
}

// Update posts in the UI
function updatePosts(data) {
    const postsContainer = document.querySelector('.posts');
    if (postsContainer) {
        import('./homepage.js').then(module => {
            module.renderPosts(data, postsContainer);
            
            // Re-attach event listeners
            setupRealtimeUpdates();
        });
    }
}

// Update user profile in the UI
function updateUserProfile(user) {
    if (!user) return;
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (profileName) profileName.textContent = user.username || 'User';
    if (profileEmail) profileEmail.textContent = user.email || '';
    
    // Store user info for later use
    localStorage.setItem('userId', user.id);
    localStorage.setItem('username', user.username);
}

// Update reaction counts in the UI
function updateReactionCount(data) {
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
            
            // Add visual feedback
            reactionBtn.classList.add('active');
            setTimeout(() => {
                reactionBtn.classList.remove('active');
            }, 500);
        }
    }
}

// Update comments in the UI
function updateComments(data) {
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

// Add a new comment to the UI
function addNewComment(data) {
    const { postId, comment } = data;
    const commentList = document.getElementById(`comment-list-${postId}`);
    
    if (commentList) {
        addCommentToUI(commentList, comment);
        
        // Update comment count
        const countElement = document.querySelector(`#post-${postId} .comment-count`);
        if (countElement) {
            let count = parseInt(countElement.textContent) || 0;
            countElement.textContent = count + 1;
        }
    }
}

// Helper to add a comment to the UI
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
    
    // Add reaction buttons if needed
    const actions = document.createElement('div');
    actions.classList.add('comment-actions');
    
    commentElement.appendChild(actions);
    commentList.appendChild(commentElement);
}

// Update user list in the UI
function updateUserList(users) {
    if (!users || !Array.isArray(users)) return;
    
    const userlist = document.getElementById('userList');
    if (userlist) {
        userlist.innerHTML = '';
        
        const currentUsername = localStorage.getItem('username');
        
        users.forEach(user => {
            // Don't show current user in the list
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
                openChatWithUser(user);
            });
            
            userlist.appendChild(userItem);
        });
        
        document.getElementById('userListContainer').style.display = 'flex';
        document.getElementById('chatListContainer').style.display = 'none';
    }
}

// Update chat list in the UI
function updateChatList(users) {
    if (!users || !Array.isArray(users)) return;
    
    const chatList = document.getElementById('chatList');
    if (chatList) {
        chatList.innerHTML = '';
        
        if (users.length === 0) {
            const noChats = document.createElement('div');
            noChats.classList.add('no-chats');
            noChats.textContent = 'No active chats. Start a new conversation!';
            chatList.appendChild(noChats);
            return;
        }
        
        users.forEach(user => {
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
                openConversation(user);
            });
            
            chatList.appendChild(chatItem);
        });
    }
}

// Open chat with a specific user
function openChatWithUser(user) {
    document.getElementById('userListContainer').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    
    const chatHeader = document.getElementById('chatHeaderUser');
    if (chatHeader) {
        chatHeader.textContent = user.username;
    }
    
    // Clear previous chat
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.innerHTML = '';
    }
    
    // Request conversation history
    const socket = getWebSocket();
    waitForWebSocket(socket, () => {
        socket.send(JSON.stringify({ 
            type: 'conversation', 
            sender: localStorage.getItem('userId'), 
            receiver: user.id.toString() 
        }));
    });
}

// Open a conversation from the chat list
function openConversation(user) {
    document.getElementById('chatListContainer').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    
    const chatHeader = document.getElementById('chatHeaderUser');
    if (chatHeader) {
        chatHeader.textContent = user.username;
    }
    
    // Clear previous chat
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.innerHTML = '';
    }
    
    // Request conversation history
    const socket = getWebSocket();
    waitForWebSocket(socket, () => {
        socket.send(JSON.stringify({ 
            type: 'conversation', 
            sender: localStorage.getItem('userId'), 
            receiver: user.id.toString() 
        }));
    });
}

// Display conversation in the UI
function displayConversation(data) {
    if (!data.conversation || !Array.isArray(data.conversation)) return;
    
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.innerHTML = '';
        
        data.conversation.forEach(message => {
            const currentUserId = parseInt(localStorage.getItem('userId'));
            const isSent = message.sender_id === currentUserId;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isSent ? 'sent' : 'received');
            messageElement.textContent = message.body;
            
            chatBox.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // Set chat header
        if (data.user) {
            const chatHeader = document.getElementById('chatHeaderUser');
            if (chatHeader) {
                chatHeader.textContent = data.user.username;
            }
        }
    }
}

// Handle new chat message
function handleNewMessage(data) {
    if (data.status === "ok") {
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sent');
            messageElement.textContent = data.message;
            
            chatBox.appendChild(messageElement);
            
            // Scroll to bottom
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
}

// Update online users in the UI
function updateOnlineUsers(users) {
    if (!users) return;
    
    const onlineUsersList = document.getElementById('onlineUsersList');
    if (onlineUsersList) {
        onlineUsersList.innerHTML = '';
        
        const usernames = Object.keys(users);
        
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
}

// Handle error messages
function handleError(message) {
    console.error('Server error:', message);
    
    // Check for invalid session
    if (message === 'invalid session') {
        // Redirect to sign-in page
        window.location.href = '/signin';
    } else {
        // Display error message to user
        alert(`Error: ${message}`);
    }
}

// Helper function to format time
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (e) {
        return timestamp;
    }
}

// Add event listener for online/offline status
window.addEventListener('online', () => {
    const statusElement = document.querySelector('.status');
    if (statusElement) {
        statusElement.textContent = 'Online Users';
        statusElement.style.color = 'green';
    }
    
    // Reconnect WebSocket
    getWebSocket();
});

window.addEventListener('offline', () => {
    const statusElement = document.querySelector('.status');
    if (statusElement) {
        statusElement.textContent = 'Offline';
        statusElement.style.color = 'red';
    }
});
