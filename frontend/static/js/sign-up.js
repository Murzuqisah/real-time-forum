import { showAlert } from "./homepage.js"
import { navigate } from "./sign-in.js"
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
  <div id="custom-alert" class="alert alert-error" style="display: none;"></div>
  `

  let scriptFiles = [
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
  logoLink.id = 'move-sign-in'
  logoLink.textContent = 'Forum'
  logoLink.addEventListener('click', (e) => navigate(e, '/sign-in'))
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
  themeToggler.style.alignItems = 'flex-end';
  themeToggler.style.justifyContent = 'space-between';

  navbar.appendChild(themeToggler)
  header.appendChild(navbar)

  document.body.appendChild(header)

  let main = document.createElement('main')

  let formContainer = document.createElement('div');
  formContainer.classList.add = 'form-container'
  let h2 = document.createElement('h2');
  h2.textContent = 'Sign Up';
  h2.style.alignItems = 'center';
  h2.justifyContent = 'space-between';
  formContainer.appendChild(h2);

  let signupForm = document.createElement('form');
  signupForm.id = 'signup-form';

  let div1 = document.createElement('div');
  div1.classList.add('input-group');
  let label1 = document.createElement('label');
  label1.htmlFor = 'name';
  label1.textContent = 'Nickname';
  let input1 = document.createElement('input');
  input1.type = 'text';
  input1.id = 'username';
  input1.name = 'username';
  input1.required = true;
  div1.appendChild(label1);
  div1.appendChild(input1);

  let div8 = document.createElement('div');
  div8.classList.add('input-group');
  let label5 = document.createElement('label');
  label5.htmlFor = 'age';
  label5.textContent = 'Age';
  let input5 = document.createElement('input');
  input5.type = 'number';
  input5.id = 'age';
  input5.name = 'age';
  input5.min = 15;
  input5.required = true;
  input5.placeholder = 'Enter your age';

  div8.appendChild(label5);
  div8.appendChild(input5);

  let div9 = document.createElement('div');
  div9.classList.add('input-group');

  let label6 = document.createElement('label');
  label6.htmlFor = 'gender';
  label6.textContent = 'Gender';

  let select = document.createElement('select');
  select.id = 'gender';
  select.className = 'gender';
  select.name = 'gender';
  select.required = true;

  let genderOptions = ['Select gender', 'Male', 'Female', 'Non-binary', 'Prefer not to say'];
  genderOptions.forEach((gender, index) => {
    let genderOption = document.createElement('option');
    genderOption.value = index === 0 ? '' : gender.toLowerCase();
    genderOption.textContent = gender;
    if (index === 0) {
      genderOption.disabled = true;
      genderOption.selected = true;
    }
    select.appendChild(genderOption);
  })

  div9.appendChild(label6);
  div9.appendChild(select);

  let div10 = document.createElement('div');
  div10.classList.add('input-group');
  let label7 = document.createElement('label');
  label7.htmlFor = 'firstname';
  label7.textContent = 'First Name';
  let input7 = document.createElement('input');
  input7.type = 'text';
  input7.id = 'firstname';
  input7.name = 'firstname';
  input7.required = true;
  div10.appendChild(label7);
  div10.appendChild(input7);

  let div11 = document.createElement('div');
  div11.classList.add('input-group');
  let label8 = document.createElement('label');
  label8.htmlFor = 'lastname';
  label8.textContent = 'Last Name';
  let input8 = document.createElement('input');
  input8.type = 'text';
  input8.id = 'lastname';
  input8.name = 'lastname';
  input8.required = true;
  div11.appendChild(label8);
  div11.appendChild(input8);

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
  div3.classList.add('input-group');

  let passwordLabels = document.createElement('div');
  passwordLabels.classList.add('password-labels');

  let label3 = document.createElement('label');
  label3.htmlFor = 'password';
  label3.textContent = 'Password';

  let label4 = document.createElement('label');
  label4.htmlFor = 'confirmed-password';
  label4.textContent = 'Confirm Password';

  passwordLabels.appendChild(label3);
  passwordLabels.appendChild(label4);

  let passwordInputs = document.createElement('div');
  passwordInputs.classList.add('password-inputs');

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

  passwordInputs.appendChild(div5);
  passwordInputs.appendChild(div7);

  div3.appendChild(passwordLabels);
  div3.appendChild(passwordInputs);

  let button3 = document.createElement('button');
  button3.id = 'sign-up-btn';
  button3.type = 'submit';
  button3.classList.add('sign-up-btn', 'btn');
  button3.textContent = 'Create Account';
  button3.addEventListener('click', (e) => {
    e.preventDefault()
    let username = document.getElementById('username').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmedPassword = document.getElementById('confirmed-password').value;
    let age = document.getElementById('age').value;
    let firstname = document.getElementById('firstname').value;
    let lastname = document.getElementById('lastname').value;
    let gender = document.getElementById('gender').value;

    if (password !== confirmedPassword) {
      showAlert('Passwords do not match');
      return;
    }
    if (!username || !email || !password || !confirmedPassword || !firstname || !lastname || !age || !gender) {
      showAlert('Username, email, and password are required for sign up');
      return;
    }
    signUp(username, email, password, confirmedPassword, age, firstname, lastname, gender, e)

  })
  signupForm.appendChild(div1);
  signupForm.appendChild(div8);
  signupForm.appendChild(div9);
  signupForm.appendChild(div10);
  signupForm.appendChild(div11);
  signupForm.appendChild(div2);
  signupForm.appendChild(div3);
  signupForm.appendChild(button3);
  formContainer.appendChild(signupForm);
  formContainer.appendChild(document.createElement('br'));

  let switchForm = document.createElement('div');
  switchForm.classList.add('switch-form');
  switchForm.textContent = "Already have an account? ";
  let switchLink = document.createElement('a');
  switchLink.textContent = 'Sign In';
  switchLink.id = 'switchlink'
  switchLink.addEventListener('click', (e) => navigate(e, '/sign-in'))
  switchForm.appendChild(switchLink);
  formContainer.appendChild(switchForm);
  main.appendChild(formContainer);

  document.body.appendChild(main)
}

async function signUp(username, email, password, confirmedPassword, age, firstname, lastname, gender, e) {
  try {
    const response = await fetch('/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, confirmedPassword, age, firstname, lastname, gender })
    })

    if (!response.ok) {
      let data = await response.json()
      throw new Error(data.error);
    }
    const data = await response.json();

    if (data.error === 'ok') {
      sessionStorage.setItem('pagestate', 'fromsignup')
      navigate(e, '/sign-in');
    } else {
      showAlert(data.error);
    }
  } catch (error) {
    showAlert(`Error: ${error.message}`);
  }
}
