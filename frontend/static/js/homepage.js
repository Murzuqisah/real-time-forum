export const HomePage = () => {
    document.head.innerHTML = ""
    document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    `
    document.body.innerHTML = ""
    let scriptFiles = [
        "/frontend/static/js/script.js",
        "/frontend/static/js/comments_toggler.js",
        "/frontend/static/js/reactions.js",
        "/frontend/static/js/format_time.js"
    ];

    scriptFiles.forEach(src => {
        let script = document.createElement("script");
        script.src = src;
        script.defer = true;
        document.head.appendChild(script);
    });

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

    let postForm = document.createElement('section');
    postForm.classList.add('create-post', 'hidden');

    let postdiv = document.createElement('div')
    postdiv.classList.add('post-popup')

    let upload = document.createElement('form');
    upload.name = "upload";
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
    button.id = 'posting'
    button.type = "submit";
    button.textContent = "Post";

    upload.appendChild(labelTitle);
    upload.appendChild(inputTitle);
    upload.appendChild(labelContent);
    upload.appendChild(textarea);
    upload.appendChild(postOperation);
    upload.appendChild(button);
    postdiv.appendChild(upload)
    postForm.appendChild(postdiv);
    postsContainer.appendChild(postForm);

    let floating = document.createElement('div')
    floating.classList.add('floating-create-post-btn-container')
    let createPost = document.createElement('p')
    createPost.textContent = 'Create a Post'
    let floatingButton = document.createElement('button')
    floatingButton.type = 'submit'
    floatingButton.classList.add('floating-create-post-btn')
    let img = document.createElement('img')
    img.classList.add('web-icon')
    img.src = '/frontend/static/assets/plus-solid.svg'
    img.alt = 'create-post'
    floatingButton.appendChild(img)
    floating.appendChild(createPost)
    floating.appendChild(floatingButton)
    document.body.appendChild(floating)

    document.body.appendChild(postsContainer);

    // online status indicator
    let onlineStatus = document.createElement('div')
    onlineStatus.classList.add('online-status')
    let status = document.createElement('div')
    status.textContent = 'Online Users'
    status.classList.add('status')
    onlineStatus.appendChild(status)

    let profile = document.createElement('aside');
    profile.classList.add('profile');
    profile = chat(profile)
    document.body.appendChild(profile);
};

export function renderPosts(data, postsContainer) {
    console.log('Rendering posts:', data);

    if (!data || !Array.isArray(data.posts)) {
        console.error("Invalid posts data:", data.posts);
        return;
    }

    postsContainer.innerHTML = "";

    data.posts.forEach(item => {
        item = item || {};

        let article = document.createElement('article');
        article.classList.add('post');

        let headerDiv = document.createElement('div');
        headerDiv.innerHTML = `
            <p class="post-author">@${item.username || "Unknown"}</p>
            <p class="post-time">Posted: <time datetime="${item.created_on || ''}">${item.created_on || 'Unknown'}</time></p>
        `;
        article.appendChild(headerDiv);

        article.innerHTML += `
            <h3>${item.post_title || "Untitled"}</h3>
            <p>${item.body || "No content"}</p>
        `;

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
        likebutton.id = item.id
        likebutton.ariaLabel = 'like this post'
        let likeimg = document.createElement('img')
        likeimg.classList.add('icon')
        likeimg.src = '/frontend/static/assets/thumbs-up-regular.svg'
        likeimg.alt = 'thumbs-up-regular'
        likeimg.style.height = '25px'
        likeimg.style.width = '1.2rem'
        likeimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
        likeimg.style.marginRight = '5px'
        likebutton.appendChild(likeimg)
        let likecount = document.createElement('span')
        likecount.classList.add('like-count')
        likecount.textContent = item.likes
        likebutton.appendChild(likecount)
        article.appendChild(likebutton)

        let dislikebutton = document.createElement('button')
        dislikebutton.id = item.id
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
        dislikecount.textContent = item.dislikes
        dislikebutton.appendChild(dislikecount)
        article.appendChild(dislikebutton)

        let commentbutton = document.createElement('button')
        commentbutton.classList.add('comment-button')
        commentbutton.ariaLabel = 'View or add comments'
        let commentimg = document.createElement('img')
        commentimg.classList.add('icon')
        commentimg.style.height = '25px'
        commentimg.style.width = '1.2rem'
        commentimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
        commentimg.style.marginRight = '5px'
        commentimg.src = '/frontend/static/assets/comment-regular.svg'
        commentimg.alt = 'comment-regular'
        let commentcount = document.createElement('span')
        commentcount.classList.add('comment-count')
        commentcount.textContent = item.comment_count
        commentbutton.appendChild(commentimg)
        commentbutton.append(commentcount)
        article.appendChild(commentbutton)

        let commentsection = document.createElement('div')
        commentsection.classList.add('comments-section')
        let h4 = document.createElement('h4')
        h4.textContent = 'Comments'
        commentsection.appendChild(h4)

        let commentinput = document.createElement('comment-input')
        commentinput.classList.add('comment-input')
        let addcomment = document.createElement('form')
        let input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'id'
        input.value = item.id
        addcomment.appendChild(input)
        let comment = document.createElement('input')
        comment.type = 'text'
        comment.name = 'comment'
        comment.classList.add('comment-box')
        comment.placeholder = 'Write a comment...'
        addcomment.appendChild(comment)
        let addbutton = document.createElement('button')
        addbutton.classList.add('submit-comment')
        let addimg = document.createElement('img')
        addimg.style.height = '20px'
        addimg.style.margin = '0'
        addimg.src = '/frontend/static/assets/paper-plane-regular.svg'
        addimg.alt = 'paper-plane-regular'
        addbutton.appendChild(addimg)
        addcomment.appendChild(addbutton)
        commentsection.appendChild(addcomment)

        article.appendChild(commentsection)


        postsContainer.appendChild(article);
    });
}

function chat(profile) {
    let chatListContainer = document.createElement('div')
    chatListContainer.classList.add('chat-list-container')
    chatListContainer.id = 'chatListContainer'
    let header = document.createElement('div')
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
    let bcbutton = document.createElement('button')
    bcbutton.classList.add('back-button')
    bcbutton.textContent = 'Back'
    bcbutton.addEventListener('click', (e) => {
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
    let send = document.createElement('button')
    send.addEventListener('click', (e) =>{
        e.preventDefault()
        sendMessage()
    })
    chatinput.appendChild(input)
    chatinput.appendChild(send)

    chatcontainer.appendChild(backbutton)
    chatcontainer.appendChild(chatbox)
    chatcontainer.appendChild(chatinput)
    profile.appendChild(chatcontainer)

    return profile
}

function goBack() {
    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("chatListContainer").style.display = "flex";
}

function sendMessage() {
    let messageInput = document.getElementById("messageInput");
    let messageText = messageInput.value.trim();
    if (messageText !== "") {
        let messageElement = document.createElement("div");
        messageElement.classList.add("message", "sent");
        messageElement.innerText = messageText;
        document.getElementById("chatBox").appendChild(messageElement);
        messageInput.value = "";
    }
}

function goBackToChats() {
    document.getElementById("userListContainer").style.display = "none";
    document.getElementById("chatListContainer").style.display = "flex";
}