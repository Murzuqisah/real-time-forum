export const HomePage = (data) => {
    document.head.innerHTML = ""
    document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    `
    document.body.innerHTML = ""
    document.body.innerHTML = `
    <div id="custom-alert" class="alert alert-error" style="display: none;"></div>
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
    postsContainer.id = 'postcontainer'
    postsContainer = renderPosts(data, postsContainer)
    postsContainer.appendChild(postingform());

    let floating = document.createElement('div')
    floating.classList.add('floating-create-post-btn-container')
    let createPost = document.createElement('p')
    createPost.textContent = 'Create a Post'
    let floatingButton = document.createElement('button')
    floatingButton.type = 'submit'
    floatingButton.classList.add('floating-create-post-btn')
    floatingButton.id = 'floatingButton'
    floatingButton.ariaLabel = 'Create a new post'
    let img = document.createElement('img')
    img.classList.add('web-icon')
    img.src = '/frontend/static/assets/plus-solid.svg'
    img.alt = 'create-post'
    floatingButton.appendChild(img)

    floating.appendChild(createPost)
    floating.appendChild(floatingButton)
    document.body.appendChild(floating)


    document.body.appendChild(postsContainer);
    let profile = document.createElement('aside');
    profile.classList.add('profile');
    profile = chat(profile)
    document.body.appendChild(profile);
};

export function renderPosts(data, postsContainer) {
    if (!data || !Array.isArray(data.posts)) {
        console.log("error in the data posts")
        console.log(data)
        return postsContainer;
    }

    postsContainer.innerHTML = "";

    data.posts.forEach(item => {
        item = item || {};

        let article = document.createElement('article');
        article.classList.add('post');
        article = postItem(article, item)
        postsContainer.appendChild(article);
    });


    return postsContainer
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
    send.id = 'send'
    chatinput.appendChild(input)
    chatinput.appendChild(send)

    chatcontainer.appendChild(backbutton)
    chatcontainer.appendChild(chatbox)
    chatcontainer.appendChild(chatinput)
    profile.appendChild(chatcontainer)

    return profile
}

function postingform() {
    let postForm = document.createElement('section');
    postForm.classList.add('create-post', 'hidden');
    postForm.id = 'post-form'

    let postdiv = document.createElement('div')
    postdiv.classList.add('post-popup')

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
    postForm.appendChild(postdiv);

    upload.addEventListener('submit', (e) => {
        e.preventDefault();
        let postTitle = inputTitle.value;
        let postBody = textarea.value;
        let postFile = fileInput.files[0];

        if (!postTitle || !postBody) {
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

export function formatTimestamp(timestamp) {
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

function submitcomment(addcomment, commentsection, commentcount, item) {
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

function commentItem(comment) {
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

function reactionHandler(dislikecount, likecount, item, type) {
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
                console.log(data)
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
                let article = document.createElement('article');
                article.classList.add('post');
                article = postItem(article, data.item)
                postsContainer.prepend(article)
            } else {
                showAlert(data.error)
            }
        })
};

function postItem(article, item) {
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
    likecount.textContent = item.likes
    likebutton.appendChild(likecount)
    article.appendChild(likebutton)

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
    dislikecount.textContent = item.dislikes
    dislikebutton.appendChild(dislikecount)
    article.appendChild(dislikebutton)

    // Create the comment button
    let commentbutton = document.createElement('button')
    commentbutton.classList.add('comment-button')
    commentbutton.ariaLabel = 'View or add comments'

    // Icon for the comment button
    let commentimg = document.createElement('img')
    commentimg.classList.add('icon')
    commentimg.style.height = '25px'
    commentimg.style.width = '1.2rem'
    commentimg.style.filter = 'invert(17%) sepia(27%) saturate(7051%) hue-rotate(205deg) brightness(90%) contrast(99%)'
    commentimg.style.marginRight = '5px'
    commentimg.src = '/frontend/static/assets/comment-regular.svg'
    commentimg.alt = 'comment-regular'

    // Comment count
    let commentcount = document.createElement('span')
    commentcount.classList.add('comment-count')
    commentcount.textContent = item.comment_count

    // Append icon and count to the button
    commentbutton.appendChild(commentimg)
    commentbutton.append(commentcount)

    // Append the button to the article
    article.appendChild(commentbutton)

    // Create the comment section (initially hidden)
    let commentsection = document.createElement('div')
    commentsection.classList.add('comments-section')
    commentsection.id = 'comments-section'
    commentsection.style.display = 'none'  // HIDE by default

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
    addimg.alt = 'paper-plane-regular'
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


export function showAlert(message, type = "error") {
    const alertBox = document.getElementById("custom-alert");
    alertBox.className = `alert alert-${type} show`;
    alertBox.textContent = message;
  
    setTimeout(() => {
      alertBox.classList.remove("show");
      alertBox.style.display = "none";
    }, 4000);
  
    alertBox.style.display = "block";
  }