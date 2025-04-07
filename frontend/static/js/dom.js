import { HomePage, renderPosts } from './homepage.js';
import { SignInPage, login } from './sign-in.js';
import { goBack } from './homepage.js';
import { CONSTANTS, CHAT_HEADER_STYLES, applyStyles } from './constants.js';
import { SessionManager } from './session-manager.js';

// Page router
const Router = {
    routes: {
        '/': () => SessionManager.isAuthenticated() ? HomePage() : SignInPage(),
        '/sign-in': SignInPage,
        '/sign-up': SignUpPage,
    },
    navigate: (path) => {
        history.pushState(null, '', path);
        Router.render();
    },
    render: () => {
        const path = location.pathname;
        const route = Router.routes[path] || Router.routes['/'];
        route();
    }
};

// Improved session check
async function checkSession() {
    const { session } = SessionManager.get();
    if (!session) return false;

    try {
        const response = await fetch('/check', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session })
        });
        const data = await response.json();
        return data.error === 'ok';
    } catch (error) {
        console.error('Session check failed:', error);
        return false;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    if (await checkSession()) {
        Router.navigate('/');
    } else {
        SessionManager.clear();
        Router.navigate('/sign-in');
    }
});

function handleConversation(data, User, socket) {
    if (!data.conversation.length) return;
    
    hideElement('chatListContainer');
    showChatContainer();
    clearChatBox();
    
    const chatbox = document.getElementById('chatBox');
    const chatheader = createChatHeader(data.user.username);
    
    data.conversation.forEach(message => {
        const messageElement = createMessageElement(message, User.id);
        chatbox.appendChild(messageElement);
    });
    
    setupSendMessageHandler(socket, data.user.username);
}

function createMessageElement(message, userId) {
    const element = document.createElement('div');
    element.classList.add('message', message.sender_id === userId ? 'sent' : 'received');
    element.textContent = message.body;
    return element;
}

function setupSendMessageHandler(socket, receiverUsername) {
    const send = document.getElementById('send');
    send.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = document.getElementById('messageInput').value;
        socket.send(JSON.stringify({ 
            type: CONSTANTS.MESSAGE_TYPES.MESSAGING, 
            sender: User.username, 
            receiver: receiverUsername, 
            message: msg 
        }));
    });
}

function connectWebSocket() {
    try {
        const socket = new WebSocket(CONSTANTS.WEBSOCKET_URL);
        
        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            socket.send(JSON.stringify({ 
                type: CONSTANTS.MESSAGE_TYPES.REGISTER, 
                sender: User.id 
            }));
        });
        
        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            setTimeout(connectWebSocket, CONSTANTS.RECONNECT_DELAY);
        });
        
        return socket;
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setTimeout(connectWebSocket, CONSTANTS.RECONNECT_DELAY);
    }
}

// Update the existing checksession function to use SessionManager
async function checksession(session) {
    const isValid = await SessionManager.validateSession(session);
    if (isValid) {
        RealTime("", session);
    } else {
        SessionManager.saveState('');
        SignInPage();
    }
}

// Update the existing event listener
window.addEventListener('beforeunload', () => {
    SessionManager.saveState('home');
    sessionStorage.setItem('session', session);
});

// Export necessary functions
export {
    handleConversation,
    connectWebSocket,
    checksession
};
