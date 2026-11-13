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
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Dark / light theme toggle (remembers your choice)
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

if (themeToggle) {
  applyTheme(currentTheme());
  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
  });
}

// Mobile menu
const menu = document.getElementById('menu');
const menuToggle = document.getElementById('menuToggle');

function setMenu(open) {
  menu.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menuToggle.textContent = open ? '✕' : '☰';
}

if (menu && menuToggle) {
  menuToggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
}

// Header border once the page scrolls
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

// Count-up for stats
function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / 1200, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix;
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

// Typing effect: cycles through the roles in data-words
const typed = document.getElementById('typed');
if (typed && typed.dataset.words) {
  const words = JSON.parse(typed.dataset.words);
  typed.parentElement.setAttribute('aria-label', `I'm an ${words.join(', ')}`);
  typed.setAttribute('aria-hidden', 'true');
  const article = typed.previousSibling;
  const setArticle = (word) => {
    if (article && article.nodeType === Node.TEXT_NODE) article.textContent = /^[AEIOU]/i.test(word) ? "I'm an " : "I'm a ";
  };
  if (!reduceMotion) {
    let wordIndex = 0;
    let charIndex = words[0].length;
    let deleting = true;
    const tick = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      typed.textContent = word.slice(0, charIndex);
      let delay = deleting ? 35 : 75;
      if (!deleting && charIndex === word.length) { deleting = true; delay = 1900; }
      else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setArticle(words[wordIndex]);
        delay = 300;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }
}

// Word-by-word reveal for statements marked .animate-words
document.querySelectorAll('.animate-words').forEach((el, blockIndex) => {
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrap(child);
      }
    });
  };
  wrap(el);
  const offset = blockIndex * 0.25;
  el.querySelectorAll('.w').forEach((w, i) => { w.style.transitionDelay = `${offset + i * 0.06}s`; });
  if (reduceMotion || !('IntersectionObserver' in window)) { el.classList.add('in'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    });
  }, { threshold: 0.4 });
  io.observe(el);
});

// Long galleries show a preview and a See more button
document.querySelectorAll('.gallery[data-preview]').forEach((gallery) => {
  const limit = Number(gallery.dataset.preview);
  const items = [...gallery.querySelectorAll(':scope > figure')];
  if (items.length <= limit) return;
  const extra = items.slice(limit);
  extra.forEach((f) => f.classList.add('is-hidden'));
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'see-more';
  const label = (open) => (open ? 'Show less' : `See ${extra.length} more`);
  btn.textContent = label(false);
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    extra.forEach((f) => f.classList.toggle('is-hidden', !open));
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = label(open);
    if (!open) (gallery.closest('.gallery-group, .init-card') || gallery).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  gallery.after(btn);
});

// Copy email to clipboard
const copyEmail = document.getElementById('copyEmail');
const copyHint = document.getElementById('copyHint');

if (copyEmail) {
  copyEmail.addEventListener('click', async () => {
    const email = copyEmail.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyHint.textContent = 'Copied';
      showToast('Email copied to clipboard');
    } catch (e) {
      window.location.href = `mailto:${email}`;
    }
    setTimeout(() => { copyHint.textContent = 'Copy'; }, 2000);
  });
}

// Image lightbox: browses the images within the gallery you opened
const lightbox = document.getElementById('lightbox');

if (lightbox) {
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  let set = [];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + set.length) % set.length;
    const img = set[index].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    const caption = set[index].closest('figure').querySelector('figcaption');
    lbCaption.textContent = `${caption ? caption.textContent : ''}  (${index + 1} / ${set.length})`;
  };

  const open = (shot) => {
    set = [...shot.closest('.gallery').querySelectorAll('.shot')];
    opener = shot;
    show(set.indexOf(shot));
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    lbClose.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.classList.remove('lb-open');
    lbImg.removeAttribute('src');
    if (opener) opener.focus();
  };

  document.querySelectorAll('.gallery .shot').forEach((shot) => shot.addEventListener('click', () => open(shot)));
  lbClose.addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(index - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      // Keep focus inside the lightbox
      const focusable = [...lightbox.querySelectorAll('button')];
      const i = focusable.indexOf(document.activeElement);
      e.preventDefault();
      focusable[(i + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu && menu.classList.contains('open')) setMenu(false);
});

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
