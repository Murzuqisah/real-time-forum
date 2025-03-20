import { navigate } from "./homepage.js";
import { renderPage } from "./homepage.js";

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

  let formContainer = document.createElement('div');
  formContainer.classList.add = 'form-container'
  let h2 = document.createElement('h2');
  h2.textContent = 'Sign Up';
  formContainer.appendChild(h2);

  let signupForm = document.createElement('form');
  signupForm.id = 'signup-form';

  let div1 = document.createElement('div');
  div1.classList.add('input-group');
  let label1 = document.createElement('label');
  label1.htmlFor = 'name';
  label1.textContent = 'Username';
  let input1 = document.createElement('input');
  input1.type = 'text';
  input1.id = 'username';
  input1.name = 'username';
  input1.required = true;
  div1.appendChild(label1);
  div1.appendChild(input1);

  let div2 = document.createElement('div');
  div2.classList.add('input-group');
  let label2 = document.createElement('label');
  label2.htmlFor = 'email';
  label2.textContent = 'Email';
  let input2 = document.createElement('input');
  input2.type = 'email';
  input2.id = 'email';
  input2.name = 'email';
  input2.required = true;
  div2.appendChild(label2);
  div2.appendChild(input2);

  let div3 = document.createElement('div');
  div3.classList.add('password');
  let div4 = document.createElement('div');
  div4.classList.add('input-group');
  let label3 = document.createElement('label');
  label3.htmlFor = 'password';
  label3.textContent = 'Password';
  let div5 = document.createElement('div');
  div5.classList.add('password-wrapper');
  let input3 = document.createElement('input');
  input3.type = 'password';
  input3.id = 'password';
  input3.name = 'password';
  input3.required = true;
  let button1 = document.createElement('button');
  button1.type = 'button';
  button1.classList.add('toggle-password');
  button1.dataset.target = 'password';
  let boxIcon1 = document.createElement('box-icon');
  boxIcon1.type = 'solid';
  boxIcon1.name = 'show';
  button1.appendChild(boxIcon1);
  div5.appendChild(input3);
  div5.appendChild(button1);
  div4.appendChild(label3);
  div4.appendChild(div5);
  let div6 = document.createElement('div');
  div6.classList.add('input-group');
  let label4 = document.createElement('label');
  label4.htmlFor = 'confirmed-password';
  label4.textContent = 'Confirm Password';
  let div7 = document.createElement('div');
  div7.classList.add('password-wrapper');
  let input4 = document.createElement('input');
  input4.type = 'password';
  input4.id = 'confirmed-password';
  input4.name = 'confirmed-password';
  input4.required = true;
  let button2 = document.createElement('button');
  button2.type = 'button';
  button2.classList.add('toggle-password');
  button2.dataset.target = 'confirmed-password';
  let boxIcon2 = document.createElement('box-icon');
  boxIcon2.type = 'solid';
  boxIcon2.name = 'show';
  button2.appendChild(boxIcon2);
  div7.appendChild(input4);
  div7.appendChild(button2);
  div6.appendChild(label4);
  div6.appendChild(div7);
  div4.appendChild(div6);

  let button3 = document.createElement('button');
  button3.id = 'sign-up-btn';
  button3.type = 'submit';
  button3.classList.add('sign-up-btn', 'btn');
  button3.textContent = 'Create Account';
  signupForm.appendChild(div1);
  signupForm.appendChild(div2);
  signupForm.appendChild(div3);
  signupForm.appendChild(div4);
  signupForm.appendChild(button3);
  formContainer.appendChild(signupForm);
  formContainer.appendChild(document.createElement('br'));

  let continueWith = document.createElement('p');
  continueWith.classList.add('continue-with');
  continueWith.textContent = 'Or Continue With';
  formContainer.appendChild(continueWith);

  let oauthButtons = document.createElement('div');
  oauthButtons.classList.add('oauth-buttons');
  let googleButton = document.createElement('button');
  googleButton.type = 'button';
  googleButton.classList.add('oauth-btn', 'google-btn');
  googleButton.textContent = 'Google';
  googleButton.style.width = '45%';
  googleButton.addEventListener('click', () => window.location.href = '/auth/google');
  let googleIcon = document.createElement('box-icon');
  googleIcon.style.fill = 'white';
  googleIcon.type = 'logo';
  googleIcon.name = 'google';
  googleButton.prepend(googleIcon);
  let githubButton = document.createElement('button');
  githubButton.type = 'button';
  githubButton.classList.add('oauth-btn', 'github-btn');
  githubButton.textContent = 'GitHub';
  githubButton.style.width = '45%';
  githubButton.addEventListener('click', () => window.location.href = '/auth/github');
  let githubIcon = document.createElement('box-icon');
  githubIcon.style.fill = 'white';
  githubIcon.type = 'logo';
  githubIcon.name = 'github';
  githubButton.prepend(githubIcon);
  oauthButtons.appendChild(googleButton);
  oauthButtons.appendChild(githubButton);
  formContainer.appendChild(oauthButtons);

  let switchForm = document.createElement('p');
  switchForm.classList.add('switch-form');
  switchForm.textContent = "Already have an account? ";
  let switchLink = document.createElement('a');
  switchLink.href = '/sign-in';
  switchLink.textContent = 'Sign In';
  switchLink.addEventListener('click', (e) => navigate(e, '/sign-in'));
  switchForm.appendChild(switchLink);
  formContainer.appendChild(switchForm);
  main.appendChild(formContainer);

  document.body.appendChild(main)
  
  let button = document.getElementById('sign-up-btn');
  button.addEventListener('click', (e) => {
    e.preventDefault();
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmedPassword = document.getElementById('confirmed-password').value;
    if (password !== confirmedPassword) {
      alert('Passwords do not match')
      return;
    }
    signUp(username, email, password);
  });
}


async function signUp(username, email, password){
  console.log('here signup')
  await fetch("sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data.redirect)
      if (data.redirect) {
        history.pushState({}, "", data.redirect);
        renderPage();
      }
    })
    .catch(error => console.error("Error:", error));
}