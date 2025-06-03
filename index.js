// index.js

document.addEventListener('DOMContentLoaded', () => {
  // Newsletter form submission handler
  const newsletterForm = document.querySelector('form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks for signing up!');
      newsletterForm.reset();
    });
  }

  // Future custom JS can go here
});
