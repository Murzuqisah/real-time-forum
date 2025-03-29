
import { debounce } from './utils.js';

/**
 * Initialize chat functionality
 */
export function initChat() {
    const newChatButton = document.getElementById('newChat');
    if (newChatButton) {
        newChatButton.addEventListener('click', showUserList);
    }
    
    const sendButton = document.getElementById('send');
    if (sendButton) {
        sendButton.addEventListener('click', debounce(sendMessage, 300));
    }
    
    // Allow sending messages with Enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

/**
 * Show the user list for starting a new chat
 */
function showUserList() {
    document.getElementById('chatListContainer').style.display = 'none';
    document.getElementById('userListContainer').style.display = 'flex';
    document.getElementById('chatContainer').style.display = 'none';
    
    // Request users from server
    const socket = getWebSocket();
    socket.send(JSON.stringify({ type: 'getusers' }));
}

/**
 * Send a chat message
 */
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput?.value?.trim();
    
    if (!message) return;
    
    const receiver = document.getElementById('chatHeaderUser')?.textContent;
    if (!receiver) {
        console.error('No receiver specified');
        return;
    }
    
    const socket = getWebSocket();
    
    // Use a flag to prevent duplicate sends
    if (socket.isProcessingMessage) return;
    socket.isProcessingMessage = true;
    
    socket.send(JSON.stringify({ 
        type: 'messaging', 
        sender: localStorage.getItem('username') || 'user', 
        receiver: receiver, 
        message: message 
    }));
    
    // Clear input field
    messageInput.value = '';
    
    // Reset flag after a short delay
    setTimeout(() => {
        socket.isProcessingMessage = false;
    }, 500);
}

/**
 * Display a conversation in the chat box
 * 
 * @param {Array} messages - Array of message objects
 * @param {Object} user - User object representing the conversation partner
 */
export function displayConversation(messages, user) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    
    chatBox.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        const noMessages = document.createElement('div');
        noMessages.classList.add('no-messages');
        noMessages.textContent = 'No messages yet. Start the conversation!';
        chatBox.appendChild(noMessages);
    } else {
        const currentUserId = parseInt(localStorage.getItem('userId'));
        
        messages.forEach(message => {
            const isSent = message.sender_id === currentUserId;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', isSent ? 'sent' : 'received');
            messageElement.textContent = message.body;
            
            chatBox.appendChild(messageElement);
        });
    }
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Update chat header
    if (user) {
        const chatHeader = document.getElementById('chatHeaderUser');
        if (chatHeader) {
            chatHeader.textContent = user.username;
            
            // Update status indicator if available
            const statusIndicator = document.createElement('span');
            statusIndicator.classList.add('status-dot', user.online ? 'online' : 'offline');
            chatHeader.appendChild(statusIndicator);
        }
    }
    
    // Show chat container with fixed dimensions
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.style.display = 'flex';
    document.getElementById('userListContainer').style.display = 'none';
    document.getElementById('chatListContainer').style.display = 'none';
}

/**
 * Add a new message to the current conversation
 * 
 * @param {string} message - The message text
 * @param {boolean} isSent - Whether the message was sent by the current user
 */
export function addMessageToConversation(message, isSent = true) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', isSent ? 'sent' : 'received');
    messageElement.textContent = message;
    
    chatBox.appendChild(messageElement);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Get WebSocket instance
 * 
 * @returns {WebSocket} - The WebSocket instance
 */
function getWebSocket() {
    return window.forumSocket;
}
