import { SignUpPage } from './sign-up.js';
import { SignInPage } from './sign-in.js';

export const HomePage = () => {
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
    logoLink.href = "/";
    logoLink.textContent = "Forum";
    logoLink.addEventListener('click', (e) => navigate(e, '/'));
    logo.appendChild(logoLink);
    navbar.appendChild(logo);

    let rightContainer = document.createElement('div');
    rightContainer.classList.add('right-container');
    let authContainer = document.createElement('div');
    authContainer.classList.add('auth-container');
    let signUpLink = document.createElement('a');
    signUpLink.href = "/sign-up";
    signUpLink.textContent = "Sign Up";
    signUpLink.addEventListener('click', (e) => navigate(e, 'sign-up'));
    let signInLink = document.createElement('a');
    signInLink.href = "/sign-in";
    signInLink.textContent = "Sign In";
    signInLink.addEventListener('click', (e) => navigate(e, 'sign-in'));
    authContainer.appendChild(signUpLink);
    authContainer.appendChild(signInLink);
    rightContainer.appendChild(authContainer);
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

    let article = document.createElement('article');
    article.classList.add('post');

    getPosts(article);

    document.body.appendChild(article);

    let profile = document.createElement('aside');
    profile.classList.add('profile');
    profile.innerHTML = `<h2>Profile</h2>`;
    document.body.appendChild(profile);
};

export async function getPosts(article) {
    await fetch('/posts', {
        headers: { "Accept": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            if (!data) {
                data = {}
            }

            if (!data.Posts) {
                data.Posts = {}
            }


            console.log(data.Posts)
            let postsContainer = document.createElement('main'); method: 'POST',
                postsContainer.classList.add('posts');
            postsContainer.innerHTML = `
            <section class="create-post hidden">
                <h2>Create a New Post</h2>
                <form name="upload" enctype="multipart/form-data" action="/upload" method="POST">
                    <label for="post-title">Title</label>
                    <input type="text" id="post-title" name="post-title" placeholder="Enter your post title" required />
                    <label for="post-content">Content</label>
                    <textarea id="post-content" name="post-content" placeholder="Write your post here..." required></textarea>
                    <button type="submit">Post</button>
                </form>
            </section>
            <div class="floating-create-post-btn-container">
                <p>Create a Post</p>
                <button class="floating-create-post-btn">
                    <img class="web-icon" src="/frontend/static/assets/plus-solid.svg" alt="create-post" />
                </button>
            </div>
        `;

            data.Posts.forEach(item => {
                if (!item) {
                    item = {}
                }
                if (!item.categories) {
                    item.categories = []
                }

                if (!item.commments) {
                    item.commments = []
                }
                if (!item.parent_id) {
                    item.parent_id = ''
                }
                console.log(item)

                let headerDiv = document.createElement('div');
                console.log(`${item.username}`)
                headerDiv.innerHTML = `
                <p class="post-author">@${item.username}</p>
                <p class="post-time">
                Posted: <time datetime="${item.created_on}"> {{ .CreatedOn }}</time>
                </p>
                `

                article.appendChild(headerDiv);
                article.innerHTML = `
                    <h3>${item.post_title}</h3>
                    <p>${item.body}</p>
                `

                if (item.imageurl !== "") {
                    let img = document.createElement('img');
                    img.classList.add('uploaded-file');
                    img.src = item.imageurl;
                    img.alt = item.post_title;
                    article.appendChild(img);
                }

                if (item.categories) {
                    let categoryDiv = document.createElement('div');
                    categoryDiv.classList.add('category-div');
                    item.categories.forEach(cat => {
                        let page = document.createElement('p');
                        page.classList.add('post-category');
                        page.textContent = cat;
                        categoryDiv.appendChild(p);
                    });
                    article.appendChild(categoryDiv);
                }
                postsContainer.appendChild(article);
            });
            document.body.appendChild(postsContainer)
        })
        .catch(error => console.error("Error fetching posts:", error));
}


export function navigate(event, page) {
    if (!page.startsWith('/')) {
        page = '/' + page;
    }

    if (location.origin + page !== location.href) {
        history.pushState({ page }, "", page);
        renderPage();
    }
}

export function renderPage() {
    const page = location.pathname.substring(1) || "home";
    console.log(page);
    if (page === "home" || page === "/") {
        HomePage();
    } else if (page === "sign-up") {
        SignUpPage();
    } else if (page === "sign-in") {
        SignInPage();
    }
}