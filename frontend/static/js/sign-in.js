export const SignInPage = () => {
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
    "/frontend/static/js/signin_validation.js",
  ];

  scriptFiles.forEach(src => {
    let script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  });
  let title = document.createElement('title');
  title.textContent = 'Sign In';
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
        <h2>Sign In</h2>
        <form action="/sign-in" id="signin-form" method="POST">
          <div class="input-group">
            <label for="email">Email</label>
            <input id="email" name="email" required />
          </div>

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

          <!-- <div class="line"></div> -->
          <button type="submit" class="sign-in-btn btn">Sign In</button>
        </form>

        <br />
        <p class="continue-with" style="font-size: small;">Or Continue With</p>

        <div class="oauth-buttons">
          <button style="width: 45%;"
            type="button"
            class="oauth-btn google-btn"
            onclick="window.location.href='/auth/google'"
          >
            <box-icon style="fill: white" type="logo" name="google"></box-icon>
            Google
          </button>
          <button style="width: 45%;"
            type="button"
            class="oauth-btn github-btn"
            onclick="window.location.href='/auth/github'"
          >
            <box-icon style="fill: white" type="logo" name="github"></box-icon>
            GitHub
          </button>
        </div>

        <p class="switch-form">
          Don't have an account? <a href="/sign-up">Sign Up</a>
        </p>
      </div>
    `
  document.body.appendChild(main)

  document.body.appendChild(document.createElement('script').src = 'https://unpkg.com/boxicons@2.1.4/dist/boxicons.js');


  let form = document.getElementById('signin-form')

  form.addEventListener("submit", function (event) {
    event.preventDefault()

    const formData = new FormData(form)

    fetch("/", {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log("HEre wer are")
        if (data.status === "success") {
          alert(data.Message);
          window.location.href = "/home";
        } else {
          alert('login failed: ' + data.Message)
        }
      })
      .catch(error => console.error('Error: ', error))
  })
}