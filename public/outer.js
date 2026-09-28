/* global TRAVEL_LOCATIONS */
(() => {
  const ns = 'http://www.w3.org/2000/svg';
  const switchButtons = [...document.querySelectorAll('[data-view]')];
  const filters = document.querySelector('#travel-filters');
  const countries = document.querySelector('#country-filter');
  const locations = document.querySelector('#location-filter');
  const marks = document.querySelector('#travel-marks');
  const tooltip = document.querySelector('#mark-tooltip');
  let selectedCity = 'all';
  let activeMark = null;

  function hideTooltip() {
    tooltip.hidden = true;
    activeMark?.removeAttribute('data-active');
    activeMark = null;
  }

  function showTooltip(mark, location, memory, event) {
    hideTooltip();
    activeMark = mark;
    mark.dataset.active = 'true';
    document.querySelector('#tooltip-place').textContent = `${location.city}, ${location.country}`;
    document.querySelector('#tooltip-story').textContent = memory.story;
    tooltip.hidden = false;
    const screen = document.querySelector('#app-viewport').getBoundingClientRect();
    const left = Math.max(0, screen.left), top = Math.max(0, screen.top);
    const right = Math.min(innerWidth, screen.right), bottom = Math.min(innerHeight, screen.bottom);
    tooltip.style.maxWidth = `${Math.max(120, Math.min(265, right - left - 24))}px`;
    const bounds = mark.getBoundingClientRect();
    const x = event?.clientX ?? bounds.right;
    const y = event?.clientY ?? bounds.top;
    tooltip.style.left = `${Math.max(left + 12, Math.min(x + 18, right - tooltip.offsetWidth - 12))}px`;
    tooltip.style.top = `${Math.max(top + 12, Math.min(y + 16, bottom - tooltip.offsetHeight - 12))}px`;
  }

  // Each memory is one curved brush gesture with a pressure-shaped silhouette.
  // The stable seed varies its bend; filtering never changes its shape or position.
  function geometry(memory, seed) {
    const { type, length, width } = memory;
    if (memory.shape === 'corner') {
      // One tapered ribbon follows the bottom seam and turns up the right edge.
      const outline = 'M96 349 C144 350 202 360 234 346 C251 339 253 329 253 308 C253 280 259 243 263 217 C264 251 267 291 267 314 C268 338 256 357 235 361 C197 367 135 361 96 349Z';
      const gradient = `corner-${seed}`;
      const opacity = .37 * (memory.strength ?? 1);
      return `<path class="mark-hit" d="${outline}" fill="transparent" stroke="transparent" stroke-width="7"/>
        <g class="wear-texture"><defs><linearGradient id="${gradient}" x1="0" y1="1" x2="1" y2="0">
          <stop stop-color="currentColor" stop-opacity=".035"/>
          <stop offset=".35" stop-color="currentColor" stop-opacity="${opacity}"/>
          <stop offset=".7" stop-color="currentColor" stop-opacity="${opacity * .8}"/>
          <stop offset="1" stop-color="currentColor" stop-opacity=".025"/>
        </linearGradient></defs><path d="${outline}" fill="url(#${gradient})"/></g>`;
    }
    const n = (v) => v.toFixed(2);
    const span = length * 1.12;
    const breadth = width * (type === 'dent' ? 1.15 : type === 'scratch' ? 1.5 : 1.4);
    const bend = memory.bend ?? ((seed % 11) - 5) * 1.6;
    const sway = memory.sway ?? ((seed % 7) - 3) * 1.1;
    const entry = .08 + (seed % 5) * .035;
    const taper = .62 + (seed % 9) * .085;
    const upper = [], lower = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = (t - .5) * span;
      const y = Math.sin(Math.PI * t) * bend + Math.sin(Math.PI * 2 * t) * sway;
      // Brush presses down early, sweeps, then lifts to a long tapered tip.
      const pressure = Math.pow(Math.max(0, Math.sin(Math.PI * (entry + (1 - entry) * t))), taper) * (1.12 - .6 * t);
      upper.push([x, y - breadth * pressure * .52]);
      lower.push([x, y + breadth * pressure * .48]);
    }
    const outline = [...upper, ...lower.reverse()].map(([x,y],i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(' ')
      + `Q${n(-span / 2 - breadth * .16)} 0 ${n(upper[0][0])} ${n(upper[0][1])}Z`;
    const pigment = (type === 'dent' ? .15 : type === 'stain' ? .24 : .37) * (memory.strength ?? 1);
    const gradient = `brush-${seed}`;
    const paint = `<defs><linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="${-span / 2}" y1="0" x2="${span / 2}" y2="0">
      <stop stop-color="currentColor" stop-opacity="${pigment * .22}"/>
      <stop offset=".22" stop-color="currentColor" stop-opacity="${pigment}"/>
      <stop offset=".58" stop-color="currentColor" stop-opacity="${pigment * .8}"/>
      <stop offset="1" stop-color="currentColor" stop-opacity="${pigment * .05}"/>
    </linearGradient></defs><path d="${outline}" fill="url(#${gradient})"/>`;
    return `<path class="mark-hit" d="${outline}" fill="transparent" stroke="transparent" stroke-width="7"/><g class="wear-texture">${paint}</g>`;
  }

  TRAVEL_LOCATIONS.forEach((location, locationIndex) => {
    location.marks.forEach((memory, index) => {
      const mark = document.createElementNS(ns, 'g');
      mark.classList.add('travel-mark');
      mark.dataset.city = location.id;
      mark.dataset.country = location.country;
      mark.style.color = location.color;
      mark.setAttribute('transform', `translate(${memory.x} ${memory.y}) rotate(${memory.angle})`);
      mark.setAttribute('tabindex', '0');
      mark.setAttribute('role', 'button');
      mark.setAttribute('aria-label', `${location.city}, ${location.country}: ${memory.story}`);
      mark.setAttribute('aria-describedby', 'mark-tooltip');
      mark.id = `mark-${location.id}-${index}`;
      mark.innerHTML = geometry(memory, 127 + locationIndex * 971 + index * 43);
      mark.addEventListener('pointerenter', (e) => showTooltip(mark, location, memory, e));
      mark.addEventListener('pointermove', (e) => showTooltip(mark, location, memory, e));
      mark.addEventListener('pointerleave', hideTooltip);
      mark.addEventListener('focus', () => showTooltip(mark, location, memory));
      mark.addEventListener('blur', hideTooltip);
      mark.addEventListener('click', (e) => showTooltip(mark, location, memory, e.detail ? e : undefined));
      mark.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTooltip(mark, location, memory); }
      });
      marks.append(mark);
    });
  });

  [...new Set(TRAVEL_LOCATIONS.map((location) => location.country))].forEach((country) => {
    countries.add(new Option(country, country));
  });

  function applyFilter() {
    hideTooltip();
    marks.querySelectorAll('.travel-mark').forEach((mark) => {
      const visible = (countries.value === 'all' || mark.dataset.country === countries.value)
        && (selectedCity === 'all' || mark.dataset.city === selectedCity);
      mark.style.display = visible ? '' : 'none';
      mark.setAttribute('tabindex', visible ? '0' : '-1');
    });
    locations.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.city === selectedCity)));
  }

  function renderLocations() {
    locations.replaceChildren();
    const eligible = TRAVEL_LOCATIONS.filter((location) => countries.value === 'all' || location.country === countries.value);
    [{ id: 'all', city: 'All places' }, ...eligible].forEach((location) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.city = location.id;
      if (location.color) {
        const dot = document.createElement('span');
        dot.className = 'location-dot';
        dot.style.backgroundColor = location.color;
        dot.setAttribute('aria-hidden', 'true');
        button.append(dot);
      }
      button.append(document.createTextNode(location.country ? `${location.city}, ${location.country}` : location.city));
      button.addEventListener('click', () => { selectedCity = location.id; applyFilter(); });
      locations.append(button);
    });
    applyFilter();
  }

  countries.addEventListener('change', () => { selectedCity = 'all'; renderLocations(); });
  switchButtons.forEach((button) => button.addEventListener('click', () => {
    const outer = button.dataset.view === 'outer';
    document.body.dataset.view = button.dataset.view;
    switchButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#outer-container').hidden = !outer;
    document.querySelector('#canvas-container').hidden = outer;
    document.querySelector('#headline').hidden = outer;
    document.querySelector('#history').hidden = outer;
    filters.hidden = !outer;
    hideTooltip();
    if (outer) { countries.value = 'all'; selectedCity = 'all'; renderLocations(); }
    else { window.dispatchEvent(new Event('resize')); window.mementoRedraw?.(); }
  }));
  window.addEventListener('resize', hideTooltip);
  window.addEventListener('scroll', hideTooltip, true);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });
  renderLocations();
})();
