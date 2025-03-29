// Chat Sidebar component with vanilla JS
class ChatSidebar {
    constructor(container) {
      this.container = container;
      // this.currentUser = MessengerData.getCurrentUser();
      this.conversations = [];
      this.activeConversationId = null;
      
      // Initialize the component
      this.socket = null; // Initialize with null or replace with a WebSocket connection
      
      // Add event listeners
      this.addEventListeners();
    }
    
    // Initialize the component
    init() {
      // Load conversations
      this.loadConversations();
      
      // Render the component
      this.render();
    }
    
    // Load conversations from the backend
    async loadConversations() {
      const response = await fetch(`/api/conversations?userId=${this.currentUser.id}`);
      if (response.ok) {
        this.conversations = await response.json();
      } else {
        console.error("Failed to load conversations");
      }
    }
    
    // Add event listeners
    addEventListeners() {
      // Listen for viewport changes
      document.addEventListener('viewportChanged', (e) => {
        if (e.detail.isMobile) {
          // On mobile, show sidebar by default if no active conversation
          if (!this.activeConversationId) {
            this.container.classList.remove('mobile-hidden');
          } else {
            this.container.classList.add('mobile-hidden');
          }
        } else {
          // On desktop, always show sidebar
          this.container.classList.remove('mobile-hidden');
        }
      });
      
      // Listen for conversation clicks from document
      document.addEventListener('conversationClicked', (e) => {
        this.setActiveConversation(e.detail.conversationId);
        
        // On mobile, hide sidebar when conversation clicked
        if (isMobile()) {
          this.container.classList.add('mobile-hidden');
        }
      });
      
      // Listen for back button clicks from document
      document.addEventListener('backToConversations', () => {
        // On mobile, show sidebar when back button clicked
        if (isMobile()) {
          this.container.classList.remove('mobile-hidden');
        }
      });
      
      // Listen for new message events
      document.addEventListener('newMessageSent', () => {
        this.loadConversations();
        this.renderConversationList();
      });
      
      // Listen for new conversation events
      document.addEventListener('newConversationCreated', (e) => {
        this.loadConversations();
        this.renderConversationList();
        this.setActiveConversation(e.detail.conversationId);
      });
  
      // Add WebSocket event listener for new messages
      document.addEventListener('newMessageReceived', (e) => {
        this.loadConversations();
        this.renderConversationList();
      });
  
      document.addEventListener('conversationUpdated', (e) => {
        this.loadConversations();
        this.renderConversationList();
      });
    }
    
    // Set active conversation
    setActiveConversation(conversationId) {
      this.activeConversationId = conversationId;
      
      // Update active class in list
      const conversationItems = this.container.querySelectorAll('.conversation-item');
      conversationItems.forEach(item => {
        const itemId = parseInt(item.dataset.id);
        if (itemId === conversationId) {
          item.classList.add('bg-gray-100');
        } else {
          item.classList.remove('bg-gray-100');
        }
      });
      
      // Dispatch event to conversation view
      const event = new CustomEvent('conversationSelected', { 
        detail: { conversationId } 
      });
      document.dispatchEvent(event);
    }
    
    // Show new chat dialog
    showNewChatDialog() {
      const dialog = document.getElementById('new-chat-dialog');
      dialog.classList.remove('hidden');
      
      // Get available users
      const availableUsers = MessengerData.getAvailableUsers();
      
      // Create dialog content
      const dialogContent = dialog.querySelector('div');
      dialogContent.innerHTML = `
        <div class="p-4 h-full flex flex-col">
          <div class="flex items-center mb-4">
            <button id="new-chat-back" class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 class="text-lg font-semibold">New Chat</h2>
          </div>
          
          <div class="mb-4">
            <input type="text" id="new-chat-search" class="w-full px-3 py-2 border rounded-md" placeholder="Search users...">
          </div>
          
          <div class="flex-1 overflow-y-auto">
            <ul id="new-chat-user-list" class="divide-y">
              ${availableUsers.map(user => `
                <li class="new-chat-user-item p-2 hover:bg-gray-100 cursor-pointer" data-id="${user.id}">
                  <div class="flex items-center">
                    <div class="relative mr-3">
                      <img src="${user.avatar}" alt="${user.name}" class="w-12 h-12 rounded-full">
                      <span class="absolute bottom-0 right-0 w-3 h-3 ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></span>
                    </div>
                    <div>
                      <div class="font-semibold">${user.name}</div>
                      <div class="text-sm text-gray-500">${user.status === 'online' ? 'Active now' : 'Offline'}</div>
                    </div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
      
      // Add event listeners
      const backButton = dialogContent.querySelector('#new-chat-back');
      backButton.addEventListener('click', () => {
        dialog.classList.add('hidden');
      });
      
      const searchInput = dialogContent.querySelector('#new-chat-search');
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const userItems = dialogContent.querySelectorAll('.new-chat-user-item');
        
        userItems.forEach(item => {
          const userName = item.querySelector('.font-semibold').textContent.toLowerCase();
          if (userName.includes(searchTerm)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
      
      // Add click listeners to user items
      const userItems = dialogContent.querySelectorAll('.new-chat-user-item');
      userItems.forEach(item => {
        item.addEventListener('click', () => {
          const userId = parseInt(item.dataset.id);
          this.startNewConversation(userId);
          dialog.classList.add('hidden');
        });
      });
    }
    
    // Start new conversation
    async startNewConversation(userId) {
      const response = await fetch(`/api/conversations/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
  
      if (response.ok) {
        const conversation = await response.json();
        window.chatSocket.send(JSON.stringify({
          type: "newConversation",
          userId,
          conversationId: conversation.id,
        }));
  
        // Dispatch event
        const event = new CustomEvent('newConversationCreated', { 
          detail: { conversationId: conversation.id } 
        });
        document.dispatchEvent(event);
      } else {
        console.error("Failed to create new conversation");
      }
    }
    
    // Render the component
    render() {
      this.container.innerHTML = `
        <div class="h-full flex flex-col">
          <!-- Header -->
          <div class="p-4 border-b">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="w-10 h-10 rounded-full mr-3">
                <div class="font-semibold">${this.currentUser.name}</div>
              </div>
              <div>
                <button id="new-chat-button" class="p-2 rounded-full hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Search -->
          <div class="p-4 border-b">
            <div class="relative">
              <input type="text" id="search-conversations" class="w-full pl-10 pr-4 py-2 border rounded-full" placeholder="Search or start new chat">
              <div class="absolute left-3 top-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Conversation List -->
          <div id="conversation-list" class="flex-1 overflow-y-auto">
            <ul class="divide-y">
              ${this.renderConversationListItems()}
            </ul>
          </div>
        </div>
      `;
      
      // Add event listeners
      const newChatButton = this.container.querySelector('#new-chat-button');
      newChatButton.addEventListener('click', () => {
        this.showNewChatDialog();
      });
      
      const searchInput = this.container.querySelector('#search-conversations');
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        this.filterConversations(searchTerm);
      });
      
      // Add click listeners to conversation items
      this.addConversationItemListeners();
    }
    
    // Render conversation list
    renderConversationList() {
      const listContainer = this.container.querySelector('#conversation-list ul');
      listContainer.innerHTML = this.renderConversationListItems();
      
      // Add click listeners to conversation items
      this.addConversationItemListeners();
    }
    
    // Render conversation list items
    renderConversationListItems() {
      return this.conversations.map(conversation => {
        const partner = conversation.partner;
        const isActive = conversation.id === this.activeConversationId;
        const unreadClass = conversation.unreadCount > 0 ? 'font-bold' : '';
        
        return `
          <li class="conversation-item ${isActive ? 'bg-gray-100' : ''}" data-id="${conversation.id}">
            <div class="p-3 hover:bg-gray-50 cursor-pointer">
              <div class="flex items-center">
                <div class="relative mr-3">
                  <img src="${partner.avatar}" alt="${partner.name}" class="w-12 h-12 rounded-full">
                  <span class="absolute bottom-0 right-0 w-3 h-3 ${partner.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between">
                    <div class="${unreadClass} truncate">${partner.name}</div>
                    <div class="text-xs text-gray-500">${formatTime(conversation.lastMessage.timestamp)}</div>
                  </div>
                  <div class="flex justify-between mt-1">
                    <div class="text-sm text-gray-500 truncate ${unreadClass}">
                      ${conversation.lastMessage.sender === MessengerData.currentUser ? 'You: ' : ''}
                      ${conversation.lastMessage.text}
                    </div>
                    ${conversation.unreadCount > 0 ? `
                      <div class="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        ${conversation.unreadCount}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          </li>
        `;
      }).join('');
    }
    
    // Add conversation item listeners
    addConversationItemListeners() {
      const conversationItems = this.container.querySelectorAll('.conversation-item');
      conversationItems.forEach(item => {
        item.addEventListener('click', () => {
          const conversationId = parseInt(item.dataset.id);
          
          // Dispatch event
          const event = new CustomEvent('conversationClicked', { 
            detail: { conversationId } 
          });
          document.dispatchEvent(event);
        });
      });
    }
    
    // Filter conversations by search term
    filterConversations(searchTerm) {
      const conversationItems = this.container.querySelectorAll('.conversation-item');
      
      conversationItems.forEach(item => {
        const name = item.querySelector('.truncate').textContent.toLowerCase();
        const lastMessage = item.querySelector('.text-sm').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }
  }
  
  // Make class globally accessible
  window.ChatSidebar = ChatSidebar;
  