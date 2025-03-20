import { navigate } from "./homepage.js";
import { renderPage } from "./homepage.js";

export const SignInPage = () => {
  document.head.innerHTML = ""
  document.head.innerHTML = `
  <link rel="stylesheet" href="/frontend/static/css/style.css" />
  <link rel="stylesheet" href="/frontend/static/css/sign-in.css" />
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

  let formContainer = document.createElement('div')
  formContainer.classList.add('form-container')

  let h2 = document.createElement('h2')
  h2.textContent = 'Sign In'
  formContainer.appendChild(h2)

  let signinForm = document.createElement('form')

  let div1 = document.createElement('div');
  div1.classList.add('input-group');
  let label1 = document.createElement('label');
  label1.htmlFor = 'email';
  label1.textContent = 'Email';
  let input1 = document.createElement('input');
  input1.id = 'email';
  input1.name = 'email';
  input1.required = true;
  div1.appendChild(label1);
  div1.appendChild(input1);

  let div2 = document.createElement('div');
  div2.classList.add('input-group');
  let label2 = document.createElement('label');
  label2.htmlFor = 'password';
  label2.textContent = 'Password';
  let div2Wrapper = document.createElement('div');
  div2Wrapper.classList.add('password-wrapper');
  let input2 = document.createElement('input');
  input2.type = 'password';
  input2.id = 'password';
  input2.name = 'password';
  input2.required = true;
  let button = document.createElement('button');
  button.type = 'button';
  button.classList.add('toggle-password');
  button.dataset.target = 'password';
  let boxIcon = document.createElement('box-icon');
  boxIcon.type = 'solid';
  boxIcon.name = 'show';
  button.appendChild(boxIcon);
  div2Wrapper.appendChild(input2);
  div2Wrapper.appendChild(button);
  div2.appendChild(label2);
  div2.appendChild(div2Wrapper);

  let button1 = document.createElement('button');
  button1.id = 'sign-in-btn'
  button1.type = 'submit';
  button1.classList.add('sign-in-btn', 'btn');
  button1.textContent = 'Sign In';

  signinForm.appendChild(div1);
  signinForm.appendChild(div2);
  signinForm.appendChild(button1);
  formContainer.appendChild(signinForm);
  formContainer.appendChild(document.createElement('br'));

  let p = document.createElement('p');
  p.classList.add('continue-with');
  p.textContent = 'Or Continue With';
  formContainer.appendChild(p);

  let oauthButtons = document.createElement('div');
  oauthButtons.classList.add('oauth-buttons');
  let googleBtn = document.createElement('button');
  googleBtn.style.width = '45%';
  googleBtn.type = 'button';
  googleBtn.classList.add('oauth-btn', 'google-btn');
  googleBtn.textContent = 'Google';
  googleBtn.addEventListener('click', () => window.location.href = '/auth/google');
  let githubBtn = document.createElement('button');
  githubBtn.style.width = '45%';
  githubBtn.type = 'button';
  githubBtn.classList.add('oauth-btn', 'github-btn');
  githubBtn.textContent = 'GitHub';
  githubBtn.addEventListener('click', () => window.location.href = '/auth/github');
  let box = document.createElement('box-icon');
  box.type = 'logo';
  box.name = 'google';
  box.style.fill = 'white';
  googleBtn.prepend(box);
  let box1 = document.createElement('box-icon');
  box1.type = 'logo';
  box1.name = 'github';
  box1.style.fill = 'white';
  githubBtn.prepend(box1);
  oauthButtons.appendChild(googleBtn);
  oauthButtons.appendChild(githubBtn);
  formContainer.appendChild(oauthButtons);

  let switchForm = document.createElement('p');
  switchForm.classList.add('switch-form');
  switchForm.textContent = `Don't have an account? `;
  let link = document.createElement('a');
  link.textContent = 'Sign Up';
  link.addEventListener('click', (e) => navigate(e, '/sign-up'));
  switchForm.appendChild(link);
  formContainer.appendChild(switchForm);

  main.appendChild(formContainer)
  document.body.appendChild(main)

  let signin = document.getElementById('sign-in-btn')
  if (signin) {
    signin.addEventListener('click', (e) => {
      e.preventDefault();
      let password = document.getElementById('password').value;
      let email = document.getElementById('email').value;
      signIn(email, password)
    })
  }
}

async function signIn(email, password) {
  console.log('post signin')
  await fetch("/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.redirect)
      if (data.redirect) {
        history.pushState({}, "", data.redirect);
        renderPage();
        return
      }
    })
    .catch(error => console.error("Error:", error));
}