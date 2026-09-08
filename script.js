'use strict';
const root = document.documentElement;
const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
const mobile = matchMedia('(max-width: 1050px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
function closeMenu() { nav.dataset.collapsed = String(mobile.matches); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; }
menu.hidden = false; closeMenu(); mobile.addEventListener('change', closeMenu);
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.dataset.collapsed = String(!open); menu.textContent = open ? 'Close' : 'Menu'; });
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelector('#year').textContent = new Date().getFullYear();
const links = [...nav.querySelectorAll('a')];
const sections = links.map(link => document.querySelector(link.hash));
const progress = document.querySelector('.progress');
const header = document.querySelector('header');
let ticking = false;
function updateScroll() { const max = root.scrollHeight - innerHeight; progress.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`; header.classList.toggle('scrolled', scrollY > 24); let current = ''; for (const section of sections) { if (section.getBoundingClientRect().top <= header.offsetHeight + 100) current = '#' + section.id; } links.forEach(link => { const active = link.hash === current; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); ticking = false; }
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive:true });
addEventListener('resize', updateScroll); updateScroll();
// Each section enters once. Content remains visible without JavaScript.
const revealElements = [...document.querySelectorAll('.card,.section-head,.case-layout,.job,.stats')];
let revealObserver;
if ('IntersectionObserver' in window && !reduced.matches) {
  try {
    revealObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); } }); }, { threshold:0.06 });
    revealElements.forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });
    document.querySelectorAll('.skills-grid .card,.projects-grid .card').forEach((el,index) => el.style.setProperty('--reveal-delay', `${index % 3 * 80}ms`));
    root.classList.add('motion-ready');
  } catch { root.classList.remove('motion-ready'); }
}
reduced.addEventListener('change', () => { if (reduced.matches) { root.classList.remove('motion-ready'); revealObserver?.disconnect(); revealElements.forEach(el => el.classList.add('in')); } });
// Pause decorative animation when it cannot be seen.
const portrait = document.querySelector('.portrait-area');
let portraitVisible = true;
function pauseMotion() { portrait.classList.toggle('paused-motion', document.hidden || !portraitVisible); }
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { portraitVisible = entries[0].isIntersecting; pauseMotion(); }).observe(portrait);
document.addEventListener('visibilitychange', pauseMotion);
// Subtle pointer response only for mouse/trackpad users.
let portraitFrame = 0;
portrait.addEventListener('pointermove', event => { if (!finePointer.matches || reduced.matches) return; cancelAnimationFrame(portraitFrame); portraitFrame = requestAnimationFrame(() => { const rect = portrait.getBoundingClientRect(); portrait.style.setProperty('--portrait-y', `${(event.clientX - rect.left - rect.width/2) / rect.width * 9}deg`); portrait.style.setProperty('--portrait-x', `${-(event.clientY - rect.top - rect.height/2) / rect.height * 7}deg`); }); });
portrait.addEventListener('pointerleave', () => { cancelAnimationFrame(portraitFrame); portrait.style.setProperty('--portrait-x','0deg'); portrait.style.setProperty('--portrait-y','0deg'); });
document.querySelectorAll('.project,.skills-grid .card').forEach(card => { let frame = 0; card.addEventListener('pointermove', event => { if (!finePointer.matches || reduced.matches) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const rect = card.getBoundingClientRect(); card.style.setProperty('--pointer-x', `${event.clientX-rect.left}px`); card.style.setProperty('--pointer-y', `${event.clientY-rect.top}px`); }); }); card.addEventListener('pointerleave', () => cancelAnimationFrame(frame)); });
// Accessible counters keep their final value as the accessible name.
if ('IntersectionObserver' in window && !reduced.matches) {
  const counts = new IntersectionObserver(entries => { for (const entry of entries) { if (!entry.isIntersecting) continue; counts.unobserve(entry.target); const el = entry.target, target = Number(el.dataset.count), start = performance.now(); function tick(now) { const fraction = reduced.matches ? 1 : Math.min(1,(now-start)/1100); const value = Math.round(target*(1-Math.pow(1-fraction,3))); el.textContent = value.toLocaleString('en-US')+'+'; if (fraction<1) requestAnimationFrame(tick); } requestAnimationFrame(tick); } }, {threshold:.6});
  document.querySelectorAll('[data-count]').forEach(el => counts.observe(el));
}
const form = document.querySelector('#contact-form');
form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; const values = new FormData(form); const subject = String(values.get('subject')).trim() || 'Portfolio enquiry'; const body = `Name: ${String(values.get('name')).trim()}\nEmail: ${String(values.get('email')).trim()}\n\n${String(values.get('message')).trim()}`; location.href = `mailto:Kamran.itpro@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; document.querySelector('#form-status').textContent = 'If your email app opens, review the draft and press Send. If it does not open, email Kamran.itpro@gmail.com directly. Your message has not been sent yet.'; });
