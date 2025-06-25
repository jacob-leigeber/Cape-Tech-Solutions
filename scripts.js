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

const toggleButton = document.getElementById('theme-toggle');
toggleButton.onclick = function() {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  toggleButton.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  // Update particle colors on theme change
  const newParticleColors = newTheme === 'dark' ? ['#ffffff', '#00d4ff'] : ['#ff3a5a', '#000000'];
  particlesJS("particles", {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 900 } },
      color: { value: newParticleColors },
      shape: { type: "circle" },
      opacity: { value: 0.6, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 2 }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      }
    }
  });
};
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  toggleButton.textContent = 'Light Mode';
} else {
  toggleButton.textContent = 'Dark Mode';
}

// Section animations
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });
sections.forEach(section => observer.observe(section));