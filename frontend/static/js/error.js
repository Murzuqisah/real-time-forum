export const ErrorPage = (page) => {
  document.head.innerHTML = ""
  document.head.innerHTML = `
    <link rel="stylesheet" href="/frontend/static/css/style.css" />
    <link rel="stylesheet" href="/frontend/static/css/error-page.css" />
  `
  document.body.innerHTML = `
  <style>
  body {
  height: 100vh;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: var(--dark-text-color);
  color: var(--dark-bg-color);
  transition: var(--transition);
}
  </style>
  `
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

  let errDiv = document.createElement('div')
  errDiv.classList.add('container')
  fetch('/' + page, {
    headers: { 'Accept': 'application/json' }
  })
    .then(response => response.json())
    .then(data => {
      errDiv.innerHTML = `
      <pre class="status-code">${data.Code}</pre>
      <pre class="status-msg">${data.ErrMessage}</pre>
      <button><a href="/">Back To HomePage</a></button>
      `
    })
    .catch(error => console.error('Error showing error message:', error));

  div.appendChild(errDiv)

  document.body.appendChild(div)
  let footer = document.createElement('footer')
  footer.classList.add('footer')
  footer.innerHTML = `
    <p class="footer-text">@2025 . All rights Reserved.</p>
    `
  document.body.appendChild(footer)
}

const getError = () => {

}