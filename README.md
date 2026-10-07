# Chaitra R — Portfolio

Personal portfolio of **Chaitra R**, IB MYP/DP Design and Technology facilitator and design engineer based in Hyderabad. Content is taken from my CV (`assets/Chaitra_R_CV.pdf`).

**To do:** add a profile photo and project photos (the circle and card thumbnails are placeholders).

- **Figma wireframes:** [Chaitra Portfolio – Wireframes](https://www.figma.com/design/ogidvcCQIWqzkRgioawmCt)
- **Sections:** Hero · About · Projects · Skills · Experience · Contact

## Wireframe exports

| Desktop (1440px) | Mobile (390px) |
| --- | --- |
| ![Desktop wireframe](wireframes/desktop-home.png) | ![Mobile wireframe](wireframes/mobile-home.png) |

## Website

`index.html` is the responsive site built from the wireframe, styled with a **soft and modern** lavender theme.

**Features**
- Light and dark mode toggle (remembers your choice, follows system setting by default)
- Typing effect in the hero that cycles through roles
- Sections and cards fade in as you scroll
- Stats count up when they come into view
- Nav highlights the section you're reading, plus a scroll progress bar
- Hamburger menu on mobile (under 768px), closes with Esc
- Project filters (All / Web / UI/UX / Other) with a fade animation
- Click-to-copy email with a toast notification
- Contact form with validation and a character counter (demo only — it doesn't send messages yet)
- Back-to-top button
- Respects "reduce motion" accessibility settings

**Theme colors** live as CSS variables at the top of `css/style.css` — change `--accent` to recolor the whole site.

### Test it locally

Download or clone the repo, then open `index.html` in your browser. To test the mobile layout, open your browser's dev tools (F12) and turn on device mode.

## Structure

```
index.html        page markup
css/style.css     wireframe styles + responsive breakpoints
js/main.js        menu, filters, form validation
wireframes/       PNG exports from Figma
```
