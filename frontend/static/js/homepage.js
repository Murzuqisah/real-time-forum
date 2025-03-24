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
    postOperation.appendChild(fileInput);
    let button = document.createElement('button');
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
    postsContainer.appendChild(floating)

    document.body.appendChild(postsContainer);

    let profile = document.createElement('aside');
    profile.classList.add('profile');
    profile.innerHTML = `<h2>Profile</h2>`;
    document.body.appendChild(profile);

    const createPostSection = document.querySelector('.create-post');
    const createPostBtn = document.querySelector('.floating-create-post-btn');

    if (createPostBtn && createPostSection) {
        console.log('here')
        createPostBtn.addEventListener('click', () => {
            console.log('clicked')
            createPostSection.classList.toggle('hidden');

            if (button) {
                button.addEventListener('click', async (e) => {
                    e.preventDefault()
                    const title = inputTitle.value;
                    const content = textarea.value;
                    const file = fileInput.files[0];
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append('content', content)
                    formData.append('file', file)
                    await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.redirect) {
                            history.pushState({}, "", data.redirect);
                            renderPage();
                            return;
                        }
                    })
                    .catch(error => console.error("Error creating post:", error));
                });
            }
        });
    }

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

        postsContainer.appendChild(article);
    });
}
