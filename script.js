const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');
const year = document.querySelector('[data-year]');

const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 12);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

year.textContent = new Date().getFullYear();

navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const readout = document.querySelector('.lever-readout');
document.querySelectorAll('[data-levers] .lever').forEach((lever) => {
  lever.addEventListener('click', () => {
    document.querySelectorAll('[data-levers] .lever').forEach((item) => item.classList.remove('active'));
    lever.classList.add('active');
    readout.querySelector('h3').textContent = lever.textContent.trim();
    readout.querySelector('p').textContent = lever.dataset.copy;
  });
});

const testimonials = [
  ['RINL Steel is well-known in our region. The quality is reliable and customers keep coming back because they trust the brand.', '[Partner Name]', '[Company Name] | [City]'],
  ['The onboarding support helped our team understand products, customer conversations, and operating expectations quickly.', '[Partner Name]', '[Company Name] | [City]'],
  ['Marketing collateral and brand visibility gave our showroom stronger local credibility from day one.', '[Partner Name]', '[Company Name] | [City]'],
];

const testimonial = document.querySelector('[data-testimonial]');
testimonial?.querySelectorAll('.quote-dots button').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    const [quote, name, meta] = testimonials[index];
    testimonial.querySelector('.quote-text').textContent = quote;
    testimonial.querySelector('strong').textContent = name;
    testimonial.querySelector('small').textContent = meta;
    testimonial.querySelectorAll('.quote-dots button').forEach((button) => button.classList.remove('active'));
    dot.classList.add('active');
  });
});
