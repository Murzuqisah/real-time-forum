export const HomePage = (data) => {
    document.head.innerHTML = ""
    document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    `
    document.body.innerHTML = ""
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
    postsContainer = renderPosts(data, postsContainer)
    postsContainer.classList.add('posts');
    // postsContainer.appendChild(postingform());

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

const attachPostReactionListeners = () => {
    const likeButtons = document.querySelectorAll(".like-button");
    likeButtons.forEach((button) => {
        button.removeEventListener('click', handleLike); // Prevent duplicate listeners
        button.addEventListener('click', handleLike);
    });

    const dislikeButtons = document.querySelectorAll(".dislike-button");
    dislikeButtons.forEach((button) => {
        button.removeEventListener('click', handleDislike);
        button.addEventListener('click', handleDislike);
    });

    document.querySelectorAll('.submit-comment').forEach(button => {
        button.removeEventListener('click', handlecomment);
        button.addEventListener('click', handlecomment);
    });

    function handleLike(e) {
        e.preventDefault();
        const button = e.currentTarget;
        waitForSocket(() => {
            socket.send(JSON.stringify({
                type: "reaction",
                userid: User.id.toString(),
                postid: button.id,
                reactionType: "like"
            }));
        })
    }

    function handleDislike(e) {
        e.preventDefault();
        const button = e.currentTarget;
        waitForSocket(() => {
            socket.send(JSON.stringify({
                type: "reaction",
                userid: User.id.toString(),
                postid: button.id,
                reactionType: "Dislike"
            }));
        })
    }


    function handlecomment(e) {
        e.preventDefault();

        // In case image inside button was clicked
        const button = e.target.closest('.submit-comment');
        if (!button) return;

        const form = button.closest('form');
        const commentInput = form.querySelector('.comment-box');
        const commentIdInput = form.querySelector('.commentid');

        if (!commentInput || !commentIdInput) {
            console.error('Missing input or comment ID');
            return;
        }

        const commentText = commentInput.value.trim();
        const commentId = commentIdInput.value;

        if (!commentText) {
            console.warn("Comment is empty.");
            return;
        }
        console.log(commentText)

        waitForSocket(() => {
            console.log('sending')
            socket.send(JSON.stringify({
                type: "comment",
                commentid: commentId,
                comment: commentText,
                userid: User.id.toString(),
            }));
        });

        commentInput.value = "";
        commentInput.placeholder = 'Write a comment...';
    }


};

export function renderPosts(data, postsContainer) {
    if (!data || !Array.isArray(data.posts)) {
        console.log("error in the data posts")
        console.log(data)
        return postsContainer;
    }

    postsContainer.innerHTML = "";
    postsContainer.appendChild(postingform());

    data.posts.forEach(item => {
        item = item || {};

        let article = document.createElement('article');
        article.classList.add('post');

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

        // Display existing comments
        if (item.comments) {
            item.comments.forEach(comment => {
                let comment_item = commentItem(comment)
                commentsection.appendChild(comment_item)
                
                addbutton.addEventListener('click', (e) => {
                    e.preventDefault()
                    submitcomment(addcomment, commentsection)
                })
            })
        }

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
    return postForm
}

function formatTimestamp(timestamp) {
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

function submitcomment(addcomment, commentsection) {
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
                commentsection.appendChild(comment_item)
            } else {
                alert(data.error)
            }
        })
}

function commentItem(comment) {
    let comment_item = document.createElement('div')
    comment_item.classList.add('comment')

    let p = document.createElement('p')
    p.innerHTML = `<strong>${comment.username}</strong> ${comment.body}`
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
    return comment_item
}