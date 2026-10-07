const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Safe localStorage helpers (can throw in private mode)
const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* ignore */ } },
};

// Toast notifications
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Dark / light theme toggle (remembers your choice)
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

applyTheme(currentTheme());
themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  store.set('theme', next);
});

// Mobile menu toggle
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menuToggle');

function setMenu(open) {
  menu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuToggle.textContent = open ? '✕' : '☰';
}

menuToggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Typing effect in the hero
const typed = document.getElementById('typed');
const words = JSON.parse(typed.dataset.words);

if (!reduceMotion) {
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  const tick = () => {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    typed.textContent = word.slice(0, charIndex);

    let delay = deleting ? 45 : 90;
    if (!deleting && charIndex === word.length) { deleting = true; delay = 1800; }
    else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 300;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 1800);
}

// Scroll reveal for sections and cards
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el, i) => {
    // Stagger cards in the project grid
    if (el.classList.contains('card')) el.style.transitionDelay = `${(i % 3) * 100}ms`;
    revealObserver.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Count-up animation for the stats
function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const stats = document.querySelectorAll('[data-count]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  stats.forEach((el) => statObserver.observe(el));
}

// Active nav link while scrolling
const navLinks = [...menu.querySelectorAll('a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObserver.observe(s));
}

// Scroll progress bar, nav shadow, back-to-top button
const progressBar = document.getElementById('scrollProgress');
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');

function onScroll() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
  nav.classList.toggle('scrolled', scrollTop > 10);
  toTop.classList.toggle('show', scrollTop > 600);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// Project filters
const filterButtons = document.querySelectorAll('#filters .chip');
const cards = document.querySelectorAll('#projectGrid .card');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', b === btn);
    });
    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
      card.classList.remove('fade-in');
      if (show) {
        void card.offsetWidth; // restart the animation
        card.classList.add('fade-in');
      }
    });
  });
});

// Copy email to clipboard
const copyEmail = document.getElementById('copyEmail');
const copyHint = document.getElementById('copyHint');

copyEmail.addEventListener('click', async () => {
  const email = copyEmail.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyHint.textContent = 'Copied!';
    showToast('Email copied to clipboard');
  } catch (e) {
    window.location.href = `mailto:${email}`;
  }
  setTimeout(() => { copyHint.textContent = 'Copy'; }, 2000);
});

// Contact form: validation + character counter (front-end only — no message is sent yet)
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
const message = form.querySelector('textarea');
const charCount = document.getElementById('charCount');

const updateCount = () => { charCount.textContent = `${message.value.length} / ${message.maxLength}`; };
message.addEventListener('input', updateCount);

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

  formMsg.textContent = '';
  showToast('Thanks! Your message is ready to send (demo).');
  form.reset();
  updateCount();
});

form.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('input', () => {
    field.classList.remove('invalid');
    formMsg.textContent = '';
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
