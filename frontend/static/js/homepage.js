import { SignInPage } from "./sign-in.js";

export const HomePage = (data) => {
    document.head.innerHTML = ""
    document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    `
    document.body.innerHTML = ""
    document.body.innerHTML = `
    <div id="custom-alert" class="alert alert-error" style="display: none;"></div>
    <div id="custom-notification" class="notification" style="display: none;"></div>
    `
    let scriptFiles = [
        "/frontend/static/js/script.js",
    ];

    scriptFiles.forEach(src => {
        let script = document.createElement("script");
        script.src = src;
        script.defer = true;
        document.head.appendChild(script);
    });

    let title = document.createElement('title');
    title.textContent = 'Forum';
    document.head.appendChild(title);

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

    // Create sidebarfloating-create-post-btn
    let aside = document.createElement('aside');
    aside.classList.add('sidebar');
    let asideh2 = document.createElement('h2');
    asideh2.textContent = 'Filter By';
    aside.appendChild(asideh2)
    let asideform = document.createElement('form');
    asideform.classList.add('filter-form');
    let asideset = document.createElement('fieldset');
    asideset.innerHTML = `
       <legend>Categories</legend>
    `
    asideset = filterCategories(asideset)
    asideform.appendChild(asideset)
    aside.appendChild(asideform)
    document.body.appendChild(aside);


    let postsContainer = document.createElement('main');
    postsContainer.classList.add('posts');
    postsContainer.id = 'postcontainer';

    postsContainer = renderPosts(data, postsContainer);
    postsContainer.appendChild(postingform());
    document.body.appendChild(postsContainer);

    let profile = document.createElement('div');
    profile.classList.add('profile');

    profile = chat(profile, aside)
    document.body.appendChild(profile);
    themeToggler.addEventListener('click', toggleTheme)
};

export const renderPosts = (data, postsContainer) => {
    if (!data || !Array.isArray(data.posts)) {
        data.posts = [];
    }

    postsContainer.innerHTML = "";
    let floating = document.createElement('div');
    floating.classList.add('floating-create-post-btn-container');
    floating.style.display = 'flex';
    let createPost = document.createElement('p')
    createPost.textContent = 'Create a Post'
    let floatingButton = document.createElement('button')
    floatingButton.type = 'submit'
    floatingButton.classList.add('floating-create-post-btn')
    let img = document.createElement('img')
    img.classList.add('web-icon');
    img.src = '/frontend/static/assets/plus-solid.svg';
    img.alt = 'create-post';
    floatingButton.appendChild(img);
    floating.appendChild(createPost);
    floating.appendChild(floatingButton);
    postsContainer.appendChild(floating);

    data.posts.forEach(item => {
        item = item || {};

        let article = document.createElement('article');
        article.classList.add('post');
        article = postItem(article, item)
        postsContainer.appendChild(article);
    });

    floatingButton.addEventListener('click', function (e) {
        e.preventDefault();
        const createPostForm = document.querySelector('.create-post');
        if (createPostForm.classList.contains('hidden')) {
            createPostForm.classList.remove('hidden');
            createPostForm.style.opacity = 1;
            createPostForm.style.visibility = 'visible';
        } else {
            createPostForm.style.opacity = 0;
            createPostForm.style.visibility = 'hidden';
            setTimeout(() => createPostForm.classList.add('hidden'), 500);
        }
    });


    return postsContainer
}

const chat = (Profile, aside) => {
    let username = sessionStorage.getItem('username') || 'Username';

    // Create outer profile container
    let profile = document.createElement('aside');
    profile.classList.add('profile');

    // Profile Section (Image, Name, Email, Logout)
    let profileSection = document.createElement('div');
    profileSection.classList.add('profile-section');

    // Logout button (top-right)
    let logoutBtn = document.createElement('button');
    logoutBtn.classList.add('logout-button');
    logoutBtn.textContent = 'Log Out';
    profileSection.appendChild(logoutBtn);

    // Profile image
    const profileImgWrapper = document.createElement('div');
    profileImgWrapper.classList.add('profile-image');
    profileImgWrapper.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="50" height="50" viewBox="0 0 256 256" xml:space="preserve">
        <g style="stroke: none; top: 0.2rem; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
	    <path d="M 45 0 C 20.147 0 0 20.147 0 45 c 0 24.853 20.147 45 45 45 s 45 -20.147 45 -45 C 90 20.147 69.853 0 45 0 z M 45 22.007 c 8.899 0 16.14 7.241 16.14 16.14 c 0 8.9 -7.241 16.14 -16.14 16.14 c -8.9 0 -16.14 -7.24 -16.14 -16.14 C 28.86 29.248 36.1 22.007 45 22.007 z M 45 83.843 c -11.135 0 -21.123 -4.885 -27.957 -12.623 c 3.177 -5.75 8.144 -10.476 14.05 -13.341 c 2.009 -0.974 4.354 -0.958 6.435 0.041 c 2.343 1.126 4.857 1.696 7.473 1.696 c 2.615 0 5.13 -0.571 7.473 -1.696 c 2.083 -1 4.428 -1.015 6.435 -0.041 c 5.906 2.864 10.872 7.591 14.049 13.341 C 66.123 78.957 56.135 83.843 45 83.843 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round"/>
        </g>
    </svg>
    `;
    profileSection.appendChild(profileImgWrapper);

    let profileName = document.createElement('h3');
    profileName.classList.add('profile-name');
    profileName.textContent = username;

    let profileInfo = document.createElement('div');
    profileInfo.classList.add('profile-info');
    profileInfo.appendChild(profileName);

    profileSection.appendChild(profileInfo);
    profile.appendChild(profileSection);

    // Chat List Container
    let chatListContainer = document.createElement('div');
    chatListContainer.classList.add('chat-list-container');
    chatListContainer.id = 'chatListContainer';

    let chatHeader = document.createElement('div');
    chatHeader.classList.add('header');
    chatHeader.textContent = "Chats";

    let chatList = document.createElement('div');
    chatList.classList.add('chat-list');
    chatList.id = 'chatList';

    chatListContainer.appendChild(chatHeader);
    chatListContainer.appendChild(chatList);
    aside.appendChild(chatListContainer);

    let back = document.createElement('div');
    back.classList.add('header');
    let backButton = document.createElement('button');
    backButton.classList.add('back-button');
    backButton.textContent = 'Back';
    back.appendChild(backButton);
    back.textContent = 'Select User';

    // Chat Container
    let chatContainer = document.createElement('div');
    chatContainer.classList.add('chat-container');
    chatContainer.id = 'chatContainer';
    chatContainer.style.display = 'none';

    let chatHeaderBar = document.createElement('div');
    chatHeaderBar.classList.add('header');
    chatHeaderBar.id = 'chatHeader';

    let chatBackButton = document.createElement('button');
    chatBackButton.classList.add('back-button');
    chatBackButton.textContent = 'Back';

    let chatHeaderSpan = document.createElement('span');
    chatHeaderSpan.id = 'chatHeaderUser';
    chatHeaderBar.appendChild(chatBackButton);
    chatHeaderBar.appendChild(chatHeaderSpan);

    let chatBox = document.createElement('div');
    chatBox.classList.add('chat-box');
    chatBox.id = 'chatBox';

    let chatInput = document.createElement('div');
    chatInput.classList.add('chat-input');

    let input = document.createElement('input');
    input.type = 'text';
    input.id = 'messageInput';
    input.placeholder = 'Type a message...';

    let send = document.createElement('button');
    send.id = 'send';

    let sendImg = document.createElement('img');
    sendImg.classList.add('icon');
    sendImg.src = 'frontend/static/assets/paper-plane-regular.svg';
    sendImg.alt = 'Send';
    sendImg.style.height = 'auto';
    sendImg.style.width = 'fit-content';
    sendImg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)';
    sendImg.style.marginRight = '5px';

    send.appendChild(sendImg);
    chatInput.appendChild(input);
    chatInput.appendChild(send);

    chatContainer.appendChild(chatHeaderBar);
    chatContainer.appendChild(chatBox);
    chatContainer.appendChild(chatInput);
    profile.appendChild(chatContainer);

    return profile;
};


const postingform = () => {
    let postForm = document.createElement('section');
    postForm.classList.add('create-post', 'hidden');
    postForm.id = 'post-form';

    let postdiv = document.createElement('div');
    postdiv.classList.add('post-popup');

    // cancel button
    let cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.classList.add('close-modal');
    cancelBtn.textContent = 'X';
    cancelBtn.title = 'Close';

    cancelBtn.addEventListener('click', () => {
        postForm.classList.add('hidden');
    });

    postdiv.appendChild(cancelBtn);

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
    let categories = document.createElement('fieldset');
    categories.classList.add('categories');
    categories.name = 'categories'
    const categoryList = ["Technology", "Health", "Education", "Sports", "Entertainment", "Finance", "Travel", "Food", "Lifestyle", "Science"];
    categories = asideCategories(categories);
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
    upload.appendChild(categories);
    upload.appendChild(postOperation);
    upload.appendChild(button);
    postdiv.appendChild(upload)
    postForm.appendChild(postdiv);

    upload.addEventListener('submit', (e) => {
        e.preventDefault();
        let postTitle = inputTitle.value;
        let postBody = textarea.value;
        let postFile = fileInput.files[0];

        if (!postTitle || !postBody || postTitle.trim() === "" || postBody.trim() === "") {
            showAlert('Please fill in all fields.');
            return;
        }

        if (postFile) {
            let filetype = postFile.type;
            let validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(filetype)) {
                showAlert('Invalid file type. Please upload an image.');
                return;
            }
            if (postFile.size > 20 * 1024 * 1024) {
                showAlert('File size exceeds 20MB. Please upload a smaller image.');
                return;
            }
        }

        createPost(upload)
        const createPostForm = document.querySelector('.create-post');
        createPostForm.classList.add('hidden');
        upload.reset()
    });
    return postForm
}

export const formatTimestamp = (timestamp) => {
    const now = new Date();
    const pastTime = new Date(timestamp);
    const timeDifference = Math.floor((now - pastTime) / 1000);

    if (timeDifference < 60) {
        return timeDifference === 1
            ? '1 second ago'
            : `${timeDifference} seconds ago`;
    } else if (timeDifference < 3600) {
        return Math.floor(timeDifference / 60) === 1
            ? '1 minute ago'
            : `${Math.floor(timeDifference / 60)} minutes ago`;
    } else if (timeDifference < 86400) {
        return Math.floor(timeDifference / 3600) === 1
            ? '1 hour ago'
            : `${Math.floor(timeDifference / 3600)} hours ago`;
    } else if (timeDifference < 604800) {
        return Math.floor(timeDifference / 86400) === 1
            ? '1 day ago'
            : `${Math.floor(timeDifference / 86400)} days ago`;
    } else if (timeDifference < 2592000) {
        return Math.floor(timeDifference / 604800) === 1
            ? '1 week ago'
            : `${Math.floor(timeDifference / 604800)} weeks ago`;
    } else if (timeDifference < 31536000) {
        return Math.floor(timeDifference / 2592000) === 1
            ? '1 month ago'
            : `${Math.floor(timeDifference / 2592000)} months ago`;
    } else {
        return Math.floor(timeDifference / 31536000) === 1
            ? '1 year ago'
            : `${Math.floor(timeDifference / 31536000)} years ago`;
    }
}

const submitcomment = (addcomment, commentsection, commentcount, item) => {
    fetch('/comment', {
        method: "POST",
        body: new FormData(addcomment),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("unknown error occured");
            }
            return response.json();
        })
        .then(data => {
            if (data.error === 'ok') {
                let comment_item = commentItem(data.comment)
                commentsection.prepend(comment_item)
                item.comment_count += 1
                commentcount.textContent = item.comment_count
            } else {
                showAlert(data.error)
            }
        })
}

const commentItem = (comment) => {
    let comment_item = document.createElement('div')
    comment_item.classList.add('comment')

    let p = document.createElement('p')
    const rawTimestamp = comment.created_on
    const parsedTimestamp = new Date(rawTimestamp.replace(' +0000 UTC', 'Z'))
    comment.created_on = formatTimestamp(parsedTimestamp)
    p.innerHTML = `
    <p class="post-time"><time datetime="${comment.created_on || ''}">${comment.created_on || 'Unknown'}</time></p>
    <strong>${comment.username}</strong> ${comment.body}
    `
    comment_item.appendChild(p)


    let likebutton = document.createElement('button')
    likebutton.classList.add('like-button')
    likebutton.id = comment.id.toString()
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
    likecount.textContent = comment.likes
    likebutton.appendChild(likecount)
    comment_item.appendChild(likebutton)

    let dislikebutton = document.createElement('button')
    dislikebutton.classList.add('dislike-button')
    dislikebutton.id = comment.id.toString()
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
    dislikecount.textContent = comment.dislikes
    dislikebutton.appendChild(dislikecount)
    comment_item.appendChild(dislikebutton)

    dislikebutton.addEventListener('click', (e) => {
        e.preventDefault()
        reactionHandler(dislikecount, likecount, comment, 'Dislike')
    })

    likebutton.addEventListener('click', (e) => {
        e.preventDefault()
        reactionHandler(dislikecount, likecount, comment, 'like')
    })
    return comment_item
}

const reactionHandler = (dislikecount, likecount, item, type) => {
    fetch('/reaction', {
        method: "POST",
        body: JSON.stringify({ reaction: type, postid: item.id })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("unknown error occured");
            }
            return response.json();
        })
        .then(data => {
            if (data.error === 'ok') {
                dislikecount.textContent = data.item.dislikes
                likecount.textContent = data.item.likes
            } else {
                showAlert(data.error)
            }
        })
}

const createPost = (form) => {
    fetch('/post', {
        method: "POST",
        body: new FormData(form)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("unknown error occured");
            }
            return response.json();
        })
        .then(data => {
            if (data.error === 'ok') {
                let postsContainer = document.getElementById('postcontainer')
                let addBtn = document.querySelector('.floating-create-post-btn-container')
                let article = document.createElement('article');
                article.classList.add('post');
                article = postItem(article, data.item)
                postsContainer.prepend(article)
                postsContainer.prepend(addBtn)
            } else {
                showAlert(data.error)
            }
        })
};

const postItem = (article, item) => {
    let headerDiv = document.createElement('div');

    const rawTimestamp = item.created_on
    const parsedTimestamp = new Date(rawTimestamp.replace(' +0000 UTC', 'Z'))
    item.created_on = formatTimestamp(parsedTimestamp)
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

    if (Array.isArray(item.categorie)) {
        let categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category-div');
        item.categorie.forEach(cat => {
            let page = document.createElement('p');
            page.classList.add('post-category');
            page.innerHTML = `
                <span>${cat.category}</span>
            `
            categoryDiv.appendChild(page);
        });
        article.appendChild(categoryDiv);
    }

    let postactions = document.createElement('div')
    postactions.classList.add('post-actions')
    postactions.id = item.id.toString()

    let likebutton = document.createElement('button')
    likebutton.classList.add('like-button')
    likebutton.id = item.id.toString()
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
    likecount.textContent = item.likes;

    likebutton.appendChild(likecount);
    postactions.appendChild(likebutton);

    let dislikebutton = document.createElement('button')
    dislikebutton.classList.add('dislike-button')
    dislikebutton.id = item.id.toString()
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
    dislikecount.textContent = item.dislikes;

    dislikebutton.appendChild(dislikecount);
    postactions.appendChild(dislikebutton);

    // Create the comment button
    let commentbutton = document.createElement('button');
    commentbutton.classList.add('comment-button');
    commentbutton.setAttribute('aria-label', 'View or add comments');

    const commentSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" class="icon">
    <g transform="scale(2.81 2.91)">
        <path d="M 69.962 54.45 H 20.038 c -1.104 0 -2 -0.896 -2 -2 s 0.896 -2 2 -2 h 49.924 c 1.104 0 2 0.896 2 2 S 71.066 54.45 69.962 54.45 z" fill="currentColor"/>
        <path d="M 69.962 39.792 H 20.038 c -1.104 0 -2 -0.896 -2 -2 s 0.896 -2 2 -2 h 49.924 c 1.104 0 2 0.896 2 2 S 71.066 39.792 69.962 39.792 z" fill="currentColor"/>
        <path d="M 24.414 85.854 c -0.512 0 -1.023 -0.195 -1.414 -0.586 l -9.807 -9.806 H 9.094 C 4.08 75.462 0 71.382 0 66.367 V 23.874 c 0 -5.015 4.08 -9.094 9.094 -9.094 h 71.812 c 5.015 0 9.094 4.08 9.094 9.094 v 42.493 c 0 5.015 -4.079 9.095 -9.094 9.095 H 35.634 l -9.807 9.806 C 25.437 85.658 24.925 85.854 24.414 85.854 z" fill="currentColor"/>
    </g>
    </svg>
    `;

    commentbutton.innerHTML = commentSVG;

    // Add comment count
    let commentcount = document.createElement('span');
    commentcount.classList.add('comment-count');
    commentcount.textContent = item.comment_count;

    // Append count next to SVG
    commentbutton.appendChild(commentcount);

    // Append the button to the article
    postactions.appendChild(commentbutton);


    // Create the comment section (initially hidden)
    let commentsection = document.createElement('div')
    commentsection.classList.add('comments-section')
    commentsection.id = 'comments-section'
    commentsection.style.display = 'none';

    let h4 = document.createElement('h4')
    h4.textContent = 'Comments'
    commentsection.appendChild(h4)

    // Add comment input area
    let commentinput = document.createElement('div')
    commentinput.classList.add('comment-input')
    let addcomment = document.createElement('form')
    let input = document.createElement('input')
    input.classList.add("commentid")
    input.name = 'id'
    input.type = 'hidden'
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
    addbutton.id = 'submit-comment'
    let addimg = document.createElement('img')
    addimg.style.height = '20px'
    addimg.style.margin = '0'
    addimg.src = '/frontend/static/assets/paper-plane-regular.svg'
    addimg.alt = 'paper-plane-regular';
    addbutton.appendChild(addimg)

    addcomment.appendChild(addbutton)
    commentsection.appendChild(addcomment)

    let comments = document.createElement('div')
    comments.classList.add('comment-in')
    // Display existing comments
    if (item.comments) {
        item.comments.forEach(comment => {
            let comment_item = commentItem(comment)
            comments.appendChild(comment_item)
        })
    }

    commentsection.appendChild(comments)

    // Append the comment section to the article
    article.appendChild(commentsection)
    article.appendChild(postactions)

    // 👉 Toggle the visibility on button click
    commentbutton.addEventListener('click', () => {
        if (commentsection.style.display === 'none') {
            commentsection.style.display = 'block'
        } else {
            commentsection.style.display = 'none'
        }
    })

    addbutton.addEventListener('click', (e) => {
        e.preventDefault()
        submitcomment(addcomment, comments, commentcount, item)
        addcomment.reset()
    })

    dislikebutton.addEventListener('click', (e) => {
        e.preventDefault()
        reactionHandler(dislikecount, likecount, item, 'Dislike')
    })

    likebutton.addEventListener('click', (e) => {
        e.preventDefault()
        reactionHandler(dislikecount, likecount, item, 'like')
    })

    return article
}

export const showAlert = (message, type = "error") => {
    const alertBox = document.getElementById("custom-alert");
    alertBox.className = `alert alert-${type} show`;
    alertBox.textContent = message;

    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.style.display = "none";
    }, 4000);

    alertBox.style.display = "block";
}

export const notification = (message) => {
    const alertBox = document.getElementById("custom-notification");
    alertBox.className = `notification show`
    alertBox.textContent = message

    setTimeout(() => {
        alertBox.classList.remove('show');
        alertBox.style.display = 'none'
    }, 7000)

    alertBox.style.display = 'block'
}

const asideCategories = (asideform) => {
    const categories = ["Technology", "Health", "Education", "Sports", "Entertainment", "Finance", "Travel", "Food", "Lifestyle", "Science"];

    categories.forEach(category => {
        let label = document.createElement('label');
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'category';
        input.value = category;

        // Improved label structure (checkbox before text)
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${category}`));
        asideform.appendChild(label);
    });

    return asideform;
}

async function filter(categories) {
    let cat
    let err
    if (Array.isArray(categories)) {
        cat = categories
        err = 'something'
    } else {
        cat = []
        err = 'none'
    }
    try {
        const response = await fetch('/filter', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category: cat, error: err }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        const data = await response.json();
        if (data.error === 'ok') {
            const postsContainer = document.getElementById('postcontainer');
            renderPosts(data, postsContainer);
        } else {
            showAlert(data.error);
        }
    } catch (error) {
        showAlert(`Error: ${error.message}`);
    }
}

const filterCategories = (asideform) => {
    const categories = ["Technology", "Health", "Education", "Sports", "Entertainment", "Finance", "Travel", "Food", "Lifestyle", "Science"];

    categories.forEach(category => {
        let label = document.createElement('label');
        let input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'category';
        input.value = category;

        // Changed event from 'checked' to 'change' and updated handler
        input.addEventListener('change', () => {
            // Get all currently checked checkboxes
            const checkedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
                .map(checkbox => checkbox.value);

            // Determine what to send to the backend
            const categoriesToSend = checkedCategories.length > 0 ? checkedCategories : 'none';
            filter(categoriesToSend);
        });

        // Improved label structure (checkbox before text)
        label.appendChild(input);
        label.appendChild(document.createTextNode(` ${category}`));
        asideform.appendChild(label);
    });

    return asideform;
}

// Mobile hamburger
export function renderNavBar() {
    const body = document.getElementById('body');

    const nav = document.createElement('nav');
    nav.className = 'navbar';

    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.textContent = 'Logo';

    const navLinks = document.createElement('ul');
    navLinks.className = 'nav-links';
    ['Home', 'Features', 'Contact'].forEach(text => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text;
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = '☰';

    nav.appendChild(logo);
    nav.appendChild(navLinks);
    nav.appendChild(hamburger);
    body.prepend(nav);

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

export const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
};

export const toggleTheme = () => {
    const currentTheme = document.body.classList.contains('dark-theme')
        ? 'dark'
        : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    sessionStorage.setItem('theme', newTheme);
};

