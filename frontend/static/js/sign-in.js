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
  header.innerHTML = `
    <nav class="navbar">
        <div class="logo">
          <a href="/">Forum</a>
        </div>

        <div class="right-container">
          <div class="theme-toggler">
            <span class="tooltip-text">Toggle Mode</span>

            <img
              style="
                height: 25px;
                width: 1.2rem;
                filter: invert(17%) sepia(27%) saturate(7051%)
                  hue-rotate(205deg) brightness(90%) contrast(99%);
              "
              class="moon"
              src="/frontend/static/assets/moon-regular.svg"
              alt="Moon Icon"
            />
            <img
              style="
                height: 25px;
                width: 1.2rem;
                filter: invert(100%) sepia(3%) saturate(2485%)
                  hue-rotate(188deg) brightness(112%) contrast(95%);
              "
              class="sunny"
              src="/frontend/static/assets/sun-regular.svg"
              alt="Sunny Icon"
            />
          </div>
        </div>
      </nav>
    `
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