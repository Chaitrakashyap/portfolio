// Mobile menu toggle
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.textContent = open ? '✕' : '☰';
});

menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  });
});

// Project filters
const filterButtons = document.querySelectorAll('#filters .chip');
const cards = document.querySelectorAll('#projectGrid .card');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

// Contact form validation (front-end only — no message is sent yet)
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let firstInvalid = null;

  form.querySelectorAll('input, textarea').forEach((field) => {
    const valid = field.checkValidity() && field.value.trim() !== '';
    field.classList.toggle('invalid', !valid);
    if (!valid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    formMsg.textContent = 'Fill in all fields with a valid email.';
    formMsg.className = 'form-msg error';
    firstInvalid.focus();
    return;
  }

  formMsg.textContent = 'Thanks! (Wireframe demo — the message was not actually sent.)';
  formMsg.className = 'form-msg ok';
  form.reset();
});

form.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('input', () => {
    field.classList.remove('invalid');
    formMsg.textContent = '';
  });
});
