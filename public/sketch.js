/* global p5 */
const STATES = {
  EMPTY: { headline: 'Empty state detected. Maximum volume, ready for travel.', image: 'assets/backpack-empty.svg', alt: 'Isometric backpack placeholder: empty.' },
  POCKETS: { headline: 'Dual sleeve detected, ready for daily use.', image: 'assets/backpack-pockets.svg', alt: 'Isometric backpack placeholder: dual sleeves installed.' },
  SMALL: { headline: 'Small notebook detected. Where you heading?', image: 'assets/backpack-small-notebook.svg', alt: 'Isometric backpack placeholder: small notebook inside.' },
  HEAVY: { headline: 'Multiple notebooks detected. Seems like you’re ready to go study.', image: 'assets/backpack-heavy-notebooks.svg', alt: 'Isometric backpack placeholder: multiple notebooks inside.' }
};

const REMOVALS = {
  'HEAVY->SMALL': 'Large notebook removed.',
  'SMALL->POCKETS': 'Small notebook removed.',
  'POCKETS->EMPTY': 'Pockets removed.'
};

let currentState = 'EMPTY';
let port;
let reader;
let keepReading = false;

const headline = document.querySelector('#headline');
const canvasContainer = document.querySelector('#canvas-container');
const history = document.querySelector('#history');
const connectButton = document.querySelector('#connect');
const status = document.querySelector('#connection-status');
const devTools = document.querySelector('#dev-tools');
const packImages = {};

// The p5 canvas stays intentionally spare: it renders only the current image.
new p5((p) => {
  p.preload = () => Object.entries(STATES).forEach(([name, state]) => {
    packImages[name] = p.loadImage(state.image);
  });
  p.setup = () => {
    const bounds = canvasContainer.getBoundingClientRect();
    p.createCanvas(bounds.width, bounds.height).parent(canvasContainer);
    p.noLoop();
  };
  p.draw = () => {
    p.clear();
    const pack = packImages[currentState];
    if (!pack) return;
    const scale = Math.min(p.width / pack.width, p.height / pack.height);
    const width = pack.width * scale;
    const height = pack.height * scale;
    p.image(pack, (p.width - width) / 2, (p.height - height) / 2, width, height);
  };
  window.addEventListener('resize', () => {
    const bounds = canvasContainer.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    p.resizeCanvas(bounds.width, bounds.height);
  });
  window.mementoRedraw = () => p.redraw();
});

function addHistory(message) {
  const entry = document.createElement('p');
  entry.className = 'history-entry';
  entry.textContent = message;
  history.prepend(entry);
}

function updateState(nextState) {
  if (!STATES[nextState] || nextState === currentState) return;
  const removal = REMOVALS[`${currentState}->${nextState}`];
  currentState = nextState;
  headline.textContent = removal || STATES[nextState].headline;
  canvasContainer.setAttribute('aria-label', STATES[nextState].alt);
  window.mementoRedraw?.();
  addHistory(removal || STATES[nextState].headline);
}

function setInitialState() {
  headline.textContent = STATES.EMPTY.headline;
  canvasContainer.setAttribute('aria-label', STATES.EMPTY.alt);
  addHistory(STATES.EMPTY.headline);
}

async function readSerial() {
  const decoder = new TextDecoderStream();
  const pipePromise = port.readable.pipeTo(decoder.writable);
  reader = decoder.readable.getReader();
  let buffer = '';
  try {
    while (keepReading) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop();
      lines.forEach((line) => {
        const match = line.trim().match(/^STATE:(EMPTY|POCKETS|SMALL|HEAVY)$/);
        if (match) updateState(match[1]);
      });
    }
  } catch (error) {
    status.textContent = 'disconnected';
  } finally {
    reader.releaseLock();
    await pipePromise.catch(() => {});
  }
}

async function connectSerial() {
  if (!('serial' in navigator)) { status.textContent = 'use Chrome or Edge'; return; }
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    keepReading = true;
    status.textContent = 'live';
    connectButton.hidden = true;
    readSerial();
  } catch (error) {
    status.textContent = 'not connected';
  }
}

connectButton.addEventListener('click', connectSerial);
window.addEventListener('keydown', (event) => {
  if (event.target.matches('input, select, textarea, [contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey) return;
  const rehearsalStates = { 0: 'EMPTY', 1: 'POCKETS', 2: 'SMALL', 3: 'HEAVY' };
  if (rehearsalStates[event.key]) updateState(rehearsalStates[event.key]);
  if (event.key.toLowerCase() === 'h') document.body.classList.toggle('presentation');
});

if (new URLSearchParams(window.location.search).get('present') === '1') document.body.classList.add('presentation');
setInitialState();
