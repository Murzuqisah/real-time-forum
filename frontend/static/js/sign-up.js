import { navigate } from "./homepage.js";

export const SignUpPage = () => {
  document.head.innerHTML = ""
  document.head.innerHTML = `
  <link rel="stylesheet" href="/frontend/static/css/style.css" />
  <link rel="stylesheet" href="/frontend/static/css/sign-up.css" />
  `
  document.body.innerHTML = ""
  document.body.innerHTML = `
  <style>
  body {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}
  </style>
  `
  let scriptFiles = [
    "/frontend/static/js/script.js",
    "/frontend/static/js/signup_validation.js",
    "/frontend/static/css/sign-up.css",
  ];

  scriptFiles.forEach(src => {
    let script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  });
  let title = document.createElement('title');
  title.textContent = 'Sign Up';
  document.head.appendChild(title);

  let header = document.createElement('header')
  let navbar = document.createElement('nav')
  navbar.classList.add('navbar')
  let logo = document.createElement('div')
  logo.classList.add('logo')
  let logoLink = document.createElement('a')
  logoLink.href = '/'
  logoLink.textContent = 'Forum'
  logoLink.addEventListener('click', (e) => navigate(e, '/'));
  logo.appendChild(logoLink)
  navbar.appendChild(logo)
  let themeToggler = document.createElement('div')
  themeToggler.classList.add('theme-toggler')
  let moon = document.createElement('img')
  moon.classList.add('moon')
  moon.src = '/frontend/static/assets/moon-regular.svg'
  moon.alt = 'Moon Icon'
  let sunny = document.createElement('img')
  sunny.classList.add('sunny')
  sunny.src = '/frontend/static/assets/sun-regular.svg'
  sunny.alt = 'Sunny Icon'
  themeToggler.appendChild(moon)
  themeToggler.appendChild(sunny)
  navbar.appendChild(themeToggler)
  header.appendChild(navbar)


  document.body.appendChild(header)

  let main = document.createElement('main')
  main.innerHTML = `
      <p class="message-popup" id="message-popup"></p>
      <div class="form-container">
        <h2>Sign Up</h2>
        <form action="/sign-up" method="POST" id="signup-form">
          <div class="input-group">
            <label for="name">Username</label>
            <input type="text" id="username" name="username" required />
          </div>

          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div class="password">
            <div class="input-group">
              <label for="password">Password</label>
              <div class="password-wrapper">
                <input type="password" id="password" name="password" required />
                <button
                  type="button"
                  class="toggle-password"
                  data-target="password"
                >
                  <box-icon type="solid" name="show"></box-icon>
                </button>
              </div>
            </div>

            <div class="input-group">
              <label for="confirmed-password">Confirm Password</label>
              <div class="password-wrapper">
                <input
                  type="password"
                  id="confirmed-password"
                  name="confirmed-password"
                  required
                />
                <button
                  type="button"
                  class="toggle-password"
                  data-target="confirmed-password"
                >
                  <box-icon type="solid" name="show"></box-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- <div class="line"></div> -->
          <button type="submit" class="sign-up-btn btn">Create Account</button>
        </form>

        <br />

        <p class="continue-with" style="font-size: small">Or Continue With</p>

        <div class="oauth-buttons">
          <button
            style="width: 45%"
            type="button"
            class="oauth-btn google-btn"
            onclick="window.location.href='/auth/google'"
          >
            <box-icon style="fill: white" type="logo" name="google"></box-icon>
            Google
          </button>
          <button
            style="width: 45%"
            type="button"
            class="oauth-btn github-btn"
            onclick="window.location.href='/auth/github'"
          >
            <box-icon style="fill: white" type="logo" name="github"></box-icon>
            GitHub
          </button>
        </div>
        <p class="switch-form">
          Already have an account? <a href="/sign-in">Sign In</a>
        </p>
      </div>
    `
  document.body.appendChild(main)
}