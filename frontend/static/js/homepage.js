export const HomePage = () => {
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
    header.innerHTML = `
        <nav class="navbar">
            <div class="logo">
                <a href="/">Forum</a>
            </div>
            <div class="right-container">
                <div class="auth-container">
                    {{if .IsLoggedIn}}{{ else}}
                    <a href="/sign-up">Sign Up</a>
                    <a href="/sign-in">Sign In</a>
                    {{ end }}
                </div>
                <div class="theme-toggler">
                    <img class="moon" src="/frontend/static/assets/moon-regular.svg" alt="Moon Icon" />
                    <img class="sunny" src="/frontend/static/assets/sun-regular.svg" alt="Sunny Icon" />
                </div>
            </div>
        </nav>
    `;
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

    // Create main content
    let main = document.createElement('main');
    main.classList.add('posts');
    main.innerHTML = `
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
    document.body.appendChild(main);

    // Add profile section
    let profile = document.createElement('aside');
    profile.classList.add('profile');
    profile.innerHTML = `<h2>Profile</h2>`;
    document.body.appendChild(profile);
};


