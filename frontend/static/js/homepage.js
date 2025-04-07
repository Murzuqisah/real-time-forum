export const HomePage = () => {
    // Reset the document
    document.head.innerHTML = ""
    document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    `
    document.body.innerHTML = ""

    // Add scripts
    let scriptFiles = [
        "/frontend/static/js/script.js",
    ];

    scriptFiles.forEach(src => {
        let script = document.createElement("script");
        script.src = src;
        script.defer = true;
        document.head.appendChild(script);
    });

    // Create overlay for modals - this should be added first to ensure it's available
    let overlay = document.createElement('div')
    overlay.classList.add('overlay')
    document.body.appendChild(overlay)

    // Append the header
    let header = document.createElement('header');
    let navbar = document.createElement('nav');
    navbar.classList.add('navbar');
    let logo = document.createElement('div');
    logo.classList.add('logo');
    let logoLink = document.createElement('a');
    logoLink.textContent = "Forum";
    logo.appendChild(logoLink);
    navbar.appendChild(logo);

    let rightContainer = document.createElement('div');
    rightContainer.classList.add('right-container');
    let themeToggler = document.createElement('div');
    themeToggler.classList.add('theme-toggler');
    let moon = document.createElement('img');
    moon.classList.add('moon');
    moon.src = "/frontend/static/assets/moon-regular.svg";
    moon.alt = "Moon Icon";
    let sunny = document.createElement('img');
    sunny.classList.add('sunny');
    sunny.src = "/frontend/static/assets/sun-regular.svg";
    sunny.alt = "Sunny Icon";
    themeToggler.appendChild(moon);
    themeToggler.appendChild(sunny);
    rightContainer.appendChild(themeToggler);
    navbar.appendChild(rightContainer);
    header.appendChild(navbar);
    document.body.appendChild(header);

    // Create sidebar
    let aside = document.createElement('aside');
    aside.classList.add('sidebar');
    aside.innerHTML = `
        <h2>Filter By:</h2>
        <form class="filter-form" action="/filter" method="get">
            <fieldset>
                <legend>Categories</legend>
                <label><input type="checkbox" name="category" value="Technology" /> Technology</label>
                <label><input type="checkbox" name="category" value="Health" /> Health</label>
                <label><input type="checkbox" name="category" value="Education" /> Education</label>
                <label><input type="checkbox" name="category" value="Sports" /> Sports</label>
                <label><input type="checkbox" name="category" value="Entertainment" /> Entertainment</label>
                <label><input type="checkbox" name="category" value="Finance" /> Finance</label>
                <label><input type="checkbox" name="category" value="Travel" /> Travel</label>
                <label><input type="checkbox" name="category" value="Food" /> Food</label>
                <label><input type="checkbox" name="category" value="Lifestyle" /> Lifestyle</label>
                <label><input type="checkbox" name="category" value="Science" /> Science</label>
            </fieldset>
            <button class="apply">Apply Filter</button>
        </form>
    `;
    document.body.appendChild(aside);


    let postsContainer = document.createElement('main');
    postsContainer.classList.add('posts');

    // Create post form section
    let postForm = document.createElement('section');
    postForm.classList.add('create-post', 'hidden');
    postForm.id = 'post-form';

    // Get the post form content from the postingform function
    let postFormContent = postingform();
    postForm.appendChild(postFormContent);

    // Add the post form to the document body (not inside postsContainer)
    document.body.appendChild(postForm);

    // Create post button at the top of the page
    let createPostTop = document.createElement('main')
    createPostTop.classList.add('create-post-top');
    let createIcon = document.createElement('img')
    createIcon.src = '/frontend/static/assets/plus-solid.svg';
    createIcon.alt = 'create post'
    let createText = document.createElement('p')
    createText.textContent = 'Create a Post'
    createPostTop.appendChild(createIcon)
    createPostTop.appendChild(createText)
    postsContainer.appendChild(createPostTop)

    // We're using the postForm created earlier
    // The form is already added to the document body

    document.body.appendChild(postsContainer);

    let floating = document.createElement('div')
    floating.classList.add('floating-create-post-btn-container')
    let createPost = document.createElement('p')
    createPost.textContent = 'Create a Post'
    let floatingButton = document.createElement('button')
    floatingButton.id = 'floatingButton'
    floatingButton.classList.add('floating-create-post-btn')
    let img = document.createElement('img')
    img.classList.add('web-icon')
    img.src = '/frontend/static/assets/plus-solid.svg'
    img.alt = 'create-post'
    floatingButton.appendChild(img)
    floating.appendChild(createPost)
    floating.appendChild(floatingButton)
    document.body.appendChild(floating)

    // create post event listener
    createPostTop.addEventListener('click', function () {
        postForm.classList.remove('hidden');
        overlay.classList.add('active');
        overlay.style.display = 'block';
    });

    floatingButton.addEventListener('click', function (e) {
        e.preventDefault();
        postForm.classList.remove('hidden');
        overlay.classList.add('active');
        overlay.style.display = 'block';
    });

    // Make sure the close button properly hides both the form and overlay
    // Find the close button within the post form
    const closeButton = postForm.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            postForm.classList.add('hidden');
            overlay.classList.remove('active');
            overlay.style.display = 'none';
        });
    }

    document.body.appendChild(postsContainer);

    let profile = document.createElement('aside');
    profile.classList.add('profile');

    let profileSection = document.createElement('div');
    profileSection.classList.add('profile-section');

    let profileHeader = document.createElement('div')
    profileHeader.classList.add('profile-header')

    let profileImg = document.createElement('img')
    // profileImg.src = '/frontend/static/img/profile-image.jpeg' <- to style tomorrow
    profileImg.alt = 'User Icon'
    profileHeader.appendChild(profileImg)

    let profileName = document.createElement('h3')
    profileName.id = 'profileName'
    profileName.textContent = 'Username'

    let profileEmail = document.createElement('p')
    profileEmail.id = 'profileEmail'
    profileEmail.textContent = 'email'

    profileSection.appendChild(profileHeader)
    profileSection.appendChild(profileImg)
    profileSection.appendChild(profileName)
    profileSection.appendChild(profileEmail)

    profile.appendChild(profileSection)

    profile = chat(profile)
    document.body.appendChild(profile);
};


export function renderPosts(data, postsContainer) {
    if (!data || !Array.isArray(data.posts)) {
        return;
    }

    const createPostTop = document.querySelector('.create-post-top');
    postsContainer.innerHTML = '';

    if (createPostTop) {
        postsContainer.appendChild(createPostTop);
    }

    data.posts.forEach(item => {
        item = item || {};

        let article = document.createElement('article');
        article.classList.add('post', 'animate-slide-in');

        let headerDiv = document.createElement('div');
        headerDiv.classList.add('post-header');
        headerDiv.innerHTML = `
            <p class="post-author">@${item.username || "Unknown"}</p>
            <p class="post-time">Posted: <time datetime="${item.created_on || ''}">${item.created_on || 'Unknown'}</time></p>
        `;
        article.appendChild(headerDiv);

        let title = document.createElement('h2')
        title.textContent = item.post_title || "Untitled";
        article.appendChild(title);

        let content = document.createElement('p');
        content.textContent = item.body || "No content";
        article.appendChild(content);

        if (item.imageurl) {
            let img = document.createElement('img');
            img.classList.add('uploaded-file');
            img.src = item.imageurl;
            img.alt = item.post_title || "Image";
            article.appendChild(img);
        }

        if (Array.isArray(item.categories)) {
            let categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category-div');
            item.categories.forEach(cat => {
                let page = document.createElement('p');
                page.classList.add('post-category');
                page.textContent = cat;
                categoryDiv.appendChild(page);
            });
            article.appendChild(categoryDiv);
        }

        let postactions = document.createElement('div')
        postactions.classList.add('post-actions')
        postactions.id = item.id

        let likebutton = document.createElement('button')
        likebutton.classList.add('like-button')
        likebutton.id = `like-${item.id}`;
        likebutton.ariaLabel = 'like this post'
        let likeimg = document.createElement('img')
        likeimg.classList.add('icon')
        likeimg.src = '/frontend/static/assets/thumbs-up-regular.svg'
        likeimg.alt = 'thumbs-up-regular'
        likeimg.style.height = '25px'
        likeimg.style.width = '1.2rem'
        // likeimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
        // likeimg.style.marginRight = '5px'
        likebutton.appendChild(likeimg)
        let likecount = document.createElement('span')
        likecount.classList.add('like-count')
        likecount.textContent = item.likes || 0;
        likebutton.appendChild(likecount)
        article.appendChild(likebutton)

        let dislikebutton = document.createElement('button')
        dislikebutton.classList.add('dislike-button')
        dislikebutton.id = `like-${item.id}`
        dislikebutton.ariaLabel = 'Dislike this post'
        let dislikeimg = document.createElement('img')
        dislikeimg.classList.add('icon')
        dislikeimg.src = '/frontend/static/assets/thumbs-down-regular.svg'
        dislikeimg.style.height = '25px'
        dislikeimg.style.width = '1.2rem'
        dislikeimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
        dislikeimg.style.marginRight = '5px'
        dislikeimg.alt = 'thumbs-down-regular'
        dislikebutton.appendChild(dislikeimg)
        let dislikecount = document.createElement('span')
        dislikecount.classList.add('dislike-count')
        dislikecount.textContent = item.dislikes || 0;
        dislikebutton.appendChild(dislikecount)
        article.appendChild(dislikebutton)

        let commentbutton = document.createElement('button')
        commentbutton.classList.add('comment-button')
        commentbutton.ariaLabel = 'View or add comments'
        let commentimg = document.createElement('img')
        commentimg.classList.add('icon')
        commentimg.style.height = '25px'
        commentimg.style.width = '1.2rem'
        // commentimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
        // commentimg.style.marginRight = '5px'
        commentimg.src = '/frontend/static/assets/comment-regular.svg'
        commentimg.alt = 'comment-regular'
        let commentcount = document.createElement('span')
        commentcount.classList.add('comment-count')
        commentcount.textContent = item.comment_count || 0;
        commentbutton.appendChild(commentimg)
        commentbutton.append(commentcount)
        article.appendChild(commentbutton)

        article.appendChild(postactions);

        let commentList = document.createElement('div');
        commentList.classList.add('comment-list');
        commentList.id = `comment-list-${item.id}`;
        commentsection.appendChild(commentList);

        let commentinput = document.createElement('comment-input')
        commentinput.classList.add('comment-input')
        let addcomment = document.createElement('form')
        addcomment.id = `comment-form-${item.id}`;
        let input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'id'
        input.value = item.id
        addcomment.appendChild(input)
        let comment = document.createElement('input')
        comment.type = 'text'
        comment.name = 'comment'
        comment.classList.add('comment-box')
        comment.placeholder = 'Write a comment...';
        addcomment.appendChild(comment);
        let addbutton = document.createElement('button')
        addbutton.classList.add('submit-comment');
        addbutton.type = 'submit';
        let addimg = document.createElement('img')
        addimg.src = '/frontend/static/assets/paper-plane-regular.svg'
        addimg.alt = 'paper-plane-regular'
        // addimg.style.height = '20px'
        // addimg.style.margin = '0'
        addbutton.appendChild(addimg)
        addcomment.appendChild(addbutton)
        commentsection.appendChild(addcomment)
        commentsection.appendChild(commentinput)

        article.appendChild(commentsection)
        postsContainer.appendChild(article);
    });
}

function chat(profile) {
    let chatListContainer = document.createElement('div')
    chatListContainer.classList.add('chat-list-container')
    chatListContainer.id = 'chatListContainer';
    let header = document.createElement('div');
    header.classList.add('header')
    header.textContent = "Chats"
    let chatlist = document.createElement('div')
    chatlist.classList.add('chat-list')
    chatlist.id = 'chatList'
    let newchat = document.createElement('div')
    newchat.classList.add('new-chat')
    newchat.id = 'newChat'
    newchat.textContent = 'Start New Chat'
    chatListContainer.appendChild(header)
    chatListContainer.appendChild(chatlist)
    chatListContainer.appendChild(newchat)
    profile.appendChild(chatListContainer)

    let userlist = document.createElement('div')
    userlist.classList.add('user-list-container')
    userlist.id = 'userListContainer'
    userlist.style.display = 'none'

    let back = document.createElement('div')
    back.classList.add('header')
    let button = document.createElement('button')
    button.classList.add('back-button')
    button.textContent = 'Back'
    button.addEventListener('click', (e) => {
        e.preventDefault()
        goBackToChats()
    })
    back.appendChild(button)
    back.textContent = 'Select User'

   let list = document.createElement('div')
   list.classList.add('user-list')
   list.id = 'userList'

   userlist.appendChild(back)
   userlist.appendChild(list)
   profile.appendChild(userlist)


    let chatcontainer = document.createElement('div')
    chatcontainer.classList.add('chat-container')
    chatcontainer.id = 'chatContainer'
    chatcontainer.style.display = 'none'

    let backbutton = document.createElement('div')
    backbutton.classList.add('header')
    backbutton.id = 'chatHeader'
    let bcbutton = document.createElement('button')
    bcbutton.classList.add('back-button')
    bcbutton.textContent = 'Back'
    bcbutton.addEventListener('click', () => {
        goBack()
    })
    let span = document.createElement('span')
    span.id = 'chatHeader'
    backbutton.appendChild(bcbutton)
    backbutton.appendChild(span)
    let chatbox = document.createElement('div')
    chatbox.classList.add('chat-box')
    chatbox.id = 'chatBox'
    let chatinput = document.createElement('div')
    chatinput.classList.add('chat-input')
    let input = document.createElement('input')
    input.type = 'text'
    input.id = 'messageInput'
    input.placeholder = 'Type a message...'
    // Add a data attribute to help with event delegation
    input.dataset.chatInput = 'true'
    let send = document.createElement('button')
    send.id = 'send'
    send.innerHTML = '<img src="/frontend/static/assets/paper-plane-regular.svg" alt="Send" style="height: 16px; filter: invert(100%)">';
    chatinput.appendChild(input)
    chatinput.appendChild(send)

    chatcontainer.appendChild(backbutton)
    chatcontainer.appendChild(chatbox)
    chatcontainer.appendChild(chatinput)
    profile.appendChild(chatcontainer)

    return profile
}

function postingform() {
    let postdiv = document.createElement('div')
    postdiv.classList.add('post-popup')

    let closeButton = document.createElement('button');
    closeButton.classList.add('close-modal');
    closeButton.innerHTML = '&times;';
    postdiv.appendChild(closeButton);

    // Add title
    let postTitle = document.createElement('h2')
    postTitle.textContent = 'Create a Post';
    postdiv.appendChild(postTitle)

    let upload = document.createElement('form');
    upload.name = "upload";
    upload.id = "upload";
    upload.enctype = "multipart/form-data";

    let labelTitle = document.createElement('label');
    labelTitle.htmlFor = "post-title";
    labelTitle.textContent = "Title";
    let inputTitle = document.createElement('input');
    inputTitle.type = "text";
    inputTitle.id = "post-title";
    inputTitle.name = "post-title";
    inputTitle.placeholder = "Enter your post title";
    inputTitle.required = true;
    let labelContent = document.createElement('label');
    labelContent.htmlFor = "post-content";
    labelContent.textContent = "Content";
    let textarea = document.createElement('textarea');
    textarea.id = "post-content";
    textarea.name = "post-content";
    textarea.placeholder = "Write your post here...";
    textarea.required = true;
    let postOperation = document.createElement('div');
    postOperation.classList.add('post-operation');
    let fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.name = "uploaded-file";
    fileInput.id = "uploaded-file";
    postOperation.appendChild(fileInput);
    let button = document.createElement('button');
    button.type = "submit";
    button.id = 'posting'
    button.textContent = "Post";

    upload.appendChild(labelTitle);
    upload.appendChild(inputTitle);
    upload.appendChild(labelContent);
    upload.appendChild(textarea);
    upload.appendChild(postOperation);
    upload.appendChild(button);
    postdiv.appendChild(upload)
    return postdiv
}

export function goBack() {
    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("chatListContainer").style.display = "flex";
}


function goBackToChats() {
    document.getElementById("userListContainer").style.display = "none";
    document.getElementById("chatListContainer").style.display = "flex";
}

// Helper to format time - exported for use in other modules
export function formatTime(timestamp) {
    if (!timestamp) return 'Unknown';

    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (e) {
        console.error('Error formatting time:', e);
        return timestamp;
    }
}