export const ErrorPage = () => {
    let script = document.createElement('script');
    script.src = '/frontend/static/js/script.js';
    script.defer = true;
    document.head.appendChild(script);
    let header = document.createElement('header')
    header.innerHTML = `
      <nav class="navbar">
        <div class="logo">
          <a href="/">Forum</a>
        </div>

        <div class="right-container">
          <div class="theme-toggler">
            <img
              class="web-icon moon"
              src="/frontend/static/assets/moon-regular.svg"
              alt="Moon Icon"
            />
            <img
              class="web-icon sunny"
              src="/frontend/static/assets/sun-regular.svg"
              alt="Sunny Icon"
            />
          </div>
        </div>
      </nav>
    `
    document.body.appendChild(header)

    let div = document.createElement('div');
    div.classList.add('wrapper')
    div.innerHTML = `
    <div class="container">
        <pre class="status-code">{{ .Code }}</pre>
        <pre class="status-msg">{{ .ErrMessage }}</pre>
        <button><a href="/">Back To Homepage</a></button>
    </div>
    `
    document.body.appendChild(div)
    let footer = document.createElement('footer')
    footer.classList.add('footer')
    footer.innerHTML = `
    <p class="footer-text">@2025 . All rights Reserved.</p>
    `
    document.body.appendChild(footer)
}