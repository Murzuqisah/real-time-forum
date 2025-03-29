// Conversation View component with vanilla JS
class ConversationView {
    constructor(container) {
      this.container = container;
      this.currentUser = MessengerData.getCurrentUser();
      this.activeConversationId = null;
      this.messages = [];
      this.partner = null;
      
      // Initialize the component
      this.init();
      
      // Add event listeners
      this.addEventListeners();
    }
    
    // Initialize the component
    init() {
      // Render the empty state
      this.renderEmptyState();
    }
    
    // Add event listeners
    addEventListeners() {
      // Listen for conversation selection
      document.addEventListener('conversationSelected', (e) => {
        this.loadConversation(e.detail.conversationId);
      });
      
      // Listen for viewport changes
      document.addEventListener('viewportChanged', (e) => {
        if (e.detail.isMobile) {
          // On mobile, hide conversation view if no active conversation
          if (!this.activeConversationId) {
            this.container.classList.add('mobile-hidden');
          } else {
            this.container.classList.remove('mobile-hidden');
          }
        } else {
          // On desktop, always show conversation view
          this.container.classList.remove('mobile-hidden');
        }
      });
  
      // Add WebSocket event listener for new messages
      document.addEventListener('newMessageReceived', (e) => {
        const { conversationId, message } = e.detail;
        if (this.activeConversationId === conversationId) {
          this.messages.push(message);
          this.renderMessages();
          this.scrollToBottom();
        }
      });
    }
    
    // Load conversation messages from the backend
    async loadConversation(conversationId) {
      this.activeConversationId = conversationId;
  
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        this.messages = data;
        this.partner = data.partner;
      } else {
        console.error("Failed to load conversation messages");
      }
  
      // Render the conversation
      this.renderConversation();
      this.scrollToBottom();
    }
    
    // Send message
    async sendMessage(text) {
      if (!text.trim() || !this.activeConversationId) return;
  
      // Send message to the backend
      const response = await fetch(`/api/messages/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: this.activeConversationId,
          text,
        }),
      });
  
      if (response.ok) {
        const newMessage = await response.json();
        this.messages.push(newMessage);
        this.renderMessages();
        this.scrollToBottom();
  
        // Notify server via WebSocket
        window.chatSocket.send(JSON.stringify({
          type: "newMessage",
          conversationId: this.activeConversationId,
          message: text,
        }));
  
        // Dispatch event for sidebar to update
        const event = new CustomEvent('newMessageSent', { 
          detail: { conversationId: this.activeConversationId } 
        });
        document.dispatchEvent(event);
      } else {
        console.error("Failed to send message");
      }
    }
    
    // Handle back button click
    handleBackClick() {
      this.activeConversationId = null;
      this.messages = [];
      this.partner = null;
      
      // Render empty state
      this.renderEmptyState();
      
      // Dispatch event for sidebar
      const event = new CustomEvent('backToConversations');
      document.dispatchEvent(event);
    }
    
    // Scroll to bottom of messages
    scrollToBottom() {
      setTimeout(() => {
        const messagesContainer = this.container.querySelector('#messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
    
    // Render empty state
    renderEmptyState() {
      this.container.innerHTML = `
        <div class="h-full flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <div class="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold mb-2">Welcome to Messenger</h2>
            <p class="text-gray-500 max-w-xs mx-auto">Select a conversation or start a new chat to begin messaging.</p>
          </div>
        </div>
      `;
      
      // Handle mobile view
      if (isMobile()) {
        this.container.classList.add('mobile-hidden');
      }
    }
    
    // Render conversation
    renderConversation() {
      if (!this.partner) return;
      
      this.container.innerHTML = `
        <div class="h-full flex flex-col">
          <!-- Header -->
          <div class="p-3 border-b flex items-center">
            ${isMobile() ? `
              <button id="back-button" class="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ` : ''}
            <div class="flex items-center flex-1">
              <div class="relative mr-3">
                <img src="${this.partner.avatar}" alt="${this.partner.name}" class="w-10 h-10 rounded-full">
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 ${this.partner.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></span>
              </div>
              <div>
                <div class="font-semibold">${this.partner.name}</div>
                <div class="text-xs text-gray-500">${this.partner.status === 'online' ? 'Active now' : 'Offline'}</div>
              </div>
            </div>
          </div>
          
          <!-- Messages -->
          <div id="messages-container" class="flex-1 overflow-y-auto p-4 bg-gray-100">
            <div class="space-y-6">
              ${this.renderMessages()}
            </div>
          </div>
          
          <!-- Input -->
          <div class="p-3 border-t">
            <div class="flex items-center">
              <input id="message-input" type="text" class="flex-1 border rounded-full px-4 py-2" placeholder="Type a message...">
              <button id="send-button" class="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners
      const backButton = this.container.querySelector('#back-button');
      if (backButton) {
        backButton.addEventListener('click', () => {
          this.handleBackClick();
        });
      }
      
      const messageInput = this.container.querySelector('#message-input');
      const sendButton = this.container.querySelector('#send-button');
      
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage(messageInput.value);
          messageInput.value = '';
        }
      });
      
      sendButton.addEventListener('click', () => {
        this.sendMessage(messageInput.value);
        messageInput.value = '';
      });
      
      // Handle mobile view
      if (isMobile()) {
        this.container.classList.remove('mobile-hidden');
      }
    }
    
    // Render messages
    renderMessages() {
      if (!this.messages.length) {
        return `
          <div class="text-center py-8">
            <p class="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        `;
      }
      
      // Group messages by date
      const groups = getMessageGroups(this.messages);
      
      return groups.map(group => {
        return `
          <div class="message-group">
            <div class="flex justify-center mb-4">
              <div class="bg-white px-3 py-1 rounded-full text-xs text-gray-500">
                ${formatMessageDate(group.date)}
              </div>
            </div>
            
            <div class="space-y-2">
              ${group.messages.map(message => {
                const isCurrentUser = message.sender === this.currentUser.id;
                const user = isCurrentUser ? this.currentUser : this.partner;
                
                return `
                  <div class="flex ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                    <div class="flex items-end">
                      ${!isCurrentUser ? `
                        <div class="mr-2 flex-shrink-0">
                          <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full">
                        </div>
                      ` : ''}
                      
                      <div class="${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white'} px-4 py-2 rounded-2xl max-w-xs">
                        <div>${sanitizeHTML(message.text)}</div>
                        <div class="text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} text-right mt-1">
                          ${formatTime(message.timestamp)}
                        </div>
                      </div>
                      
                      ${isCurrentUser ? `
                        <div class="ml-2 flex-shrink-0">
                          <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full">
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }
  
  // Make class globally accessible
  window.ConversationView = ConversationView;
  