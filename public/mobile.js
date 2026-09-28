(() => {
  const button = document.querySelector('#phone-toggle');
  const viewport = document.querySelector('#app-viewport');
  let phone = false;
  button.addEventListener('click', () => {
    phone = !phone;
    document.body.classList.toggle('phone-mode', phone);
    button.setAttribute('aria-pressed', String(phone));
    button.setAttribute('aria-label', phone ? 'Exit phone preview' : 'Show phone preview');
    button.title = phone ? 'Exit phone preview' : 'Phone preview';
    // Same DOM, same serial session, same selection and history; only layout changes.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  });
  let lastWidth = 0;
  let lastHeight = 0;
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (Math.abs(width - lastWidth) < 1 && Math.abs(height - lastHeight) < 1) return;
    lastWidth = width;
    lastHeight = height;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }).observe(viewport);
})();
