// Apply theme based on the value in localStorage
const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
};

const toggleTheme = () => {
  const currentTheme = document.body.classList.contains('dark-theme')
    ? 'dark'
    : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
};
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

document.querySelector('.theme-toggler').addEventListener('click', toggleTheme);


// Password toggle
document.querySelectorAll('.toggle-password').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.target);
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  });
});
