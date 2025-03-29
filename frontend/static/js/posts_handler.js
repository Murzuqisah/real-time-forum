import { debounce } from './utils.js';

export function initPostCreation() {
    // Add a create post button to the page
    addCreatePostButton();
    
    // Set up event listeners for the post form
    setupPostFormListeners();
}

function addCreatePostButton() {
    const container = document.querySelector('.middle-column');
    if (!container) return;
    
    // Check if button already exists
    if (document.querySelector('.create-post-button')) return;
    
    const button = document.createElement('button');
    button.classList.add('create-post-button');
    button.textContent = 'Create New Post';
    button.addEventListener('click', debounce(showPostForm, 300));
    
    // Add button before the posts container
    const posts = container.querySelector('.posts');
    if (posts) {
        container.insertBefore(button, posts);
    } else {
        container.appendChild(button);
    }
}

function showPostForm() {
    // Hide existing form if it exists
    hidePostForm();
    
    const container = document.querySelector('.middle-column');
    if (!container) return;
    
    const posts = container.querySelector('.posts');
    if (!posts) return;
    
    const form = document.createElement('div');
    form.id = 'postForm';
    form.classList.add('post-form');
    
    form.innerHTML = `
        <h3 class="post-form-title">Create New Post</h3>
        <input type="text" id="postTitle" placeholder="Enter post title..." class="form-control">
        <textarea id="postContent" placeholder="What's on your mind?"></textarea>
        <div class="post-form-actions">
            <button id="cancelPost" class="button">Cancel</button>
            <button id="submitPost" class="post-submit-button">Post</button>
        </div>
    `;
    
    // Insert form before posts
    container.insertBefore(form, posts);
    
    // Add event listeners to buttons
    document.getElementById('cancelPost').addEventListener('click', hidePostForm);
    document.getElementById('submitPost').addEventListener('click', debounce(submitPost, 300));
}

function hidePostForm() {
    const form = document.getElementById('postForm');
    if (form) {
        form.remove();
    }
}

function submitPost() {
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!title) {
        alert('Please enter a title for your post');
        return;
    }
    
    if (!content) {
        alert('Please enter content for your post');
        return;
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('You must be logged in to create a post');
        return;
    }
    
    const socket = window.forumSocket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert('Cannot connect to server. Please try again later.');
        return;
    }
    
    // Send post data to server
    socket.send(JSON.stringify({
        type: 'createpost',
        userid: userId,
        title: title,
        content: content
    }));
    
    // Hide the form
    hidePostForm();
    
    // Show loading indicator
    showLoadingIndicator();
}

function showLoadingIndicator() {
    const container = document.querySelector('.middle-column');
    if (!container) return;
    
    const loading = document.createElement('div');
    loading.id = 'postLoading';
    loading.classList.add('loading-indicator');
    loading.textContent = 'Creating your post...';
    
    container.appendChild(loading);
    
    // Remove after 2 seconds
    setTimeout(() => {
        const loadingElement = document.getElementById('postLoading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }, 2000);
}

function setupPostFormListeners() {
    // Listen for websocket messages related to post creation
    const originalHandler = window.forumSocket?.onmessage;
    
    if (window.forumSocket) {
        window.forumSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'postCreated') {
                    console.log('Post created successfully:', data);
                    // Post has been created, maybe show a notification
                    showPostCreatedNotification();
                }
                
                // Call the original handler if it exists
                if (typeof originalHandler === 'function') {
                    originalHandler(event);
                }
            } catch (err) {
                console.error('Error processing message:', err);
                
                // Call the original handler if it exists
                if (typeof originalHandler === 'function') {
                    originalHandler(event);
                }
            }
        };
    }
}

function showPostCreatedNotification() {
    const notification = document.createElement('div');
    notification.classList.add('notification', 'success');
    notification.textContent = 'Post created successfully!';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
