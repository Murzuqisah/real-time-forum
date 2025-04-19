import { SignUpPage } from "./sign-up.js"
import { RealTime } from "./dom.js"
import { HomePage } from "./homepage.js"
import { showAlert } from "./homepage.js"

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
  .success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 10px 15px;
    margin-bottom: 20px;
    border-radius: 4px;
    text-align: center;
    width: 100%;
    max-width: 400px;
  }
  </style>
  <div id="custom-alert" class="alert alert-error" style="display: none;"></div>
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
  logoLink.id = 'sign-in-redirect'
  logoLink.href = '/'
  logoLink.textContent = 'Forum'
  logoLink.addEventListener('click', (e) => navigate(e, "/sign-in"))
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

  // Check if we're coming from the sign-up page
  if (sessionStorage.getItem('pagestate') === 'fromsignup') {
    sessionStorage.clear()
    // Add success message
    let successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.textContent = 'Account created successfully! Please sign in.';
    formContainer.appendChild(successMessage);
  }

  let signinForm = document.createElement('form')
  signinForm.id = 'signin-form'
  // Prevent default form submission which would expose credentials in URL
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
  })

  let div1 = document.createElement('div');
  div1.classList.add('input-group');
  let label1 = document.createElement('label');
  label1.htmlFor = 'email';
  label1.textContent = 'Nickname/Email';
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
  button1.type = 'submit'; // Keep as submit to work with form submission
  button1.classList.add('sign-in-btn', 'btn');
  button1.textContent = 'Sign In';

  signinForm.appendChild(div1);
  signinForm.appendChild(div2);
  signinForm.appendChild(button1);
  formContainer.appendChild(signinForm);


  let switchForm = document.createElement('div');
  switchForm.classList.add('switch-form');
  switchForm.textContent = `Don't have an account? `;
  let link = document.createElement('a');
  link.id = 'move-sign-up'
  link.textContent = 'Sign Up';
  link.addEventListener('click', (e) => navigate(e, '/sign-up'))
  switchForm.appendChild(link);
  formContainer.appendChild(switchForm);

  main.appendChild(formContainer)
  document.body.appendChild(main)
}

export const navigate = (event, page) => {
  event.preventDefault()
  history.pushState({ page }, "", "/");
  renderPage(page);
}

export const renderPage = (page) => {
  switch (page) {
    case "/sign-up":
      SignUpPage();
      break;
    case "/sign-in":
      SignInPage();
      break;
    default:
      showAlert('unknown page')
  }
}

export async function login(email, password) {
  try {
    const response = await fetch('/sign-in', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });

    if (!response.ok) {
      let data = await response.json()
      throw new Error(data.error);
    }

    const data = await response.json();

    if (data.error === 'ok') {
      console.log('Login successful:', data);
      // Store session in sessionStorage
      sessionStorage.setItem('session', data.session);
      sessionStorage.setItem('pageState', 'home');
      sessionStorage.setItem("username", data.user.username)
      sessionStorage.setItem("userId", data.user.id.toString())
      HomePage(data);
      await RealTime();
      // Update URL without exposing credentials
      history.pushState({}, '', '/');
    } else {
      showAlert(data.error);
    }
  } catch (error) {
    showAlert(`Error: ${error.message}`);
  }
}
