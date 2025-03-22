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
  logoLink.id = 'sign-in-redirect'
  logoLink.href = '/'
  logoLink.textContent = 'Forum'
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


  let switchForm = document.createElement('div');
  switchForm.classList.add('switch-form');
  switchForm.textContent = `Don't have an account? `;
  let link = document.createElement('a');
  link.id = 'move-sign-up'
  link.textContent = 'Sign Up';
  switchForm.appendChild(link);
  formContainer.appendChild(switchForm);

  main.appendChild(formContainer)
  document.body.appendChild(main)
}