document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('#main-nav');
  const observeButton = document.querySelector('#observe-button');
  const countOutput = document.querySelector('#observation-count');
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  let count = 0;
  if (observeButton && countOutput) {
    observeButton.addEventListener('click', () => {
      count += 1;
      countOutput.textContent = String(count);
    });
  }
});
