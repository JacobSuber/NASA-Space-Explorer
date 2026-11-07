// NASA Space Explorer | Project 7
// All interactive features and API work live in this file.
// NASA moved APOD to this WordPress API in September 2026.
const APOD_API = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic/';

const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const dateForm = document.getElementById('dateForm');
const gallery = document.getElementById('gallery');
const status = document.getElementById('status');
const countLabel = document.getElementById('resultsCount');
const submitButton = document.getElementById('getImagesButton');
const modal = document.getElementById('imageModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalSource = document.getElementById('modalSource');
const modalCloseButton = document.getElementById('closeModal');
let previousFocus = null;
let activeRequest = null;

setupDateInputs(startInput, endInput);

// Extra credit: a new random space fact every time the app loads.
const spaceFacts = [
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  'A day on Venus lasts longer than one trip around the Sun.',
  'Saturn is less dense than water, even though it is a giant planet.',
  'The International Space Station travels around Earth about every 90 minutes.',
  'The Moon is slowly moving away from Earth by around 3.8 centimeters each year.',
  'Neptune was the first planet discovered using mathematical predictions.',
  'One teaspoon of neutron-star matter would weigh billions of tons on Earth.',
  'The Great Red Spot is a giant storm in Jupiter’s atmosphere.',
  'Our Milky Way galaxy contains hundreds of billions of stars.',
  'Mars has the tallest known volcano in the solar system: Olympus Mons.'
];
let previousFactIndex = -1;
function showRandomFact() {
  let index = Math.floor(Math.random() * spaceFacts.length);
  if (spaceFacts.length > 1 && index === previousFactIndex) index = (index + 1) % spaceFacts.length;
  previousFactIndex = index;
  document.getElementById('spaceFact').textContent = spaceFacts[index];
}
document.getElementById('newFactButton').addEventListener('click', showRandomFact);
showRandomFact();

function formatDate(dateText) {
  const day = new Date(`${dateText}T12:00:00Z`);
  return Number.isNaN(day.getTime()) ? dateText : day.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', timeZone:'UTC' });
}
function textOnly(value) {
  // APOD's latest API can include HTML in explanations and credits.
  const tmp = document.createElement('div');
  tmp.innerHTML = typeof value === 'string' ? value : '';
  return tmp.textContent.trim();
}
function mediaUrl(entry) {
  // New APOD API's `url` is often an article link, not an image.
  // `hdurl` is the actual picture URL when one exists.
  if (entry.hdurl) return entry.hdurl;
  if (entry.thumbnail_url) return entry.thumbnail_url;
  if (entry.url && /\.(?:jpg|jpeg|png|gif|webp)(?:[?#]|$)/i.test(entry.url)) return entry.url;
  return null;
}
function sourceUrl(entry) {
  const candidate = entry.permalink || entry.url;
  return /^https:\/\//i.test(candidate || '') ? candidate : 'https://science.nasa.gov/apod/';
}
function isImage(entry) {
  return entry.media_type === 'image' && Boolean(mediaUrl(entry));
}
function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`.trim();
}
function makeElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}
function createCard(entry) {
  const imageEntry = isImage(entry);
  const card = makeElement('button', 'gallery-item');
  card.type = 'button';
  card.setAttribute('aria-label', `Open details for ${entry.title || 'NASA APOD'}, ${formatDate(entry.date)}`);
  const photoArea = makeElement('div', 'card-picture');
  if (imageEntry) {
    const img = document.createElement('img');
    img.src = mediaUrl(entry);
    img.alt = textOnly(entry.alt) || entry.title || 'NASA astronomy photograph';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => {
      img.remove();
      photoArea.classList.add('fallback-picture');
      photoArea.append(makeElement('div', 'fallback-icon', '✧'));
    }, { once: true });
    photoArea.append(img);
  } else {
    photoArea.classList.add('video-picture');
    photoArea.append(makeElement('div', 'video-icon', '▶'));
    photoArea.append(makeElement('div', 'video-caption', entry.media_type === 'video' || entry.media_type === 'iframe' ? 'SPACE VIDEO' : 'NASA FEATURE'));
  }
  if (imageEntry) photoArea.append(makeElement('span', 'image-zoom-icon', '↗'));
  const info = makeElement('div', 'card-info');
  info.append(makeElement('p', 'card-date', formatDate(entry.date)));
  info.append(makeElement('h3', 'card-title', entry.title || 'Untitled space discovery'));
  info.append(makeElement('span', 'card-link', imageEntry ? 'View photo & story  ↗' : 'Watch / view story  ↗'));
  card.append(photoArea, info);
  card.addEventListener('click', () => openModal(entry));
  return card;
}
function renderGallery(entries) {
  gallery.replaceChildren();
  const data = [...entries].sort((a,b) => a.date.localeCompare(b.date));
  if (!data.length) {
    const empty = makeElement('div','placeholder');
    empty.append(makeElement('div', 'placeholder-icon', '☆'));
    empty.append(makeElement('h3', '', 'No discoveries found'));
    empty.append(makeElement('p', '', 'Try picking another date range.'));
    gallery.append(empty);
    countLabel.textContent = '0 results';
    return;
  }
  const fragment = document.createDocumentFragment();
  data.forEach(entry => fragment.append(createCard(entry)));
  gallery.append(fragment);
  countLabel.textContent = `${data.length} ${data.length === 1 ? 'discovery' : 'discoveries'}`;
}
function showLoading() {
  const loading = makeElement('div','loading-message');
  const spinner = makeElement('span','spinner');
  spinner.setAttribute('aria-hidden','true');
  loading.append(spinner,makeElement('p','', 'Loading space photos…'));
  gallery.replaceChildren(loading);
  countLabel.textContent = 'Searching NASA…';
  setStatus('');
}
function showError(message) {
  gallery.replaceChildren();
  const panel = makeElement('div','placeholder error-state');
  panel.append(makeElement('div','placeholder-icon','✧'));
  panel.append(makeElement('h3','','We lost the signal'));
  panel.append(makeElement('p','',message));
  const retry = makeElement('button','retry-button','Try again');
  retry.type = 'button';
  retry.addEventListener('click', () => dateForm.requestSubmit());
  panel.append(retry);
  gallery.append(panel);
  countLabel.textContent = 'Could not load';
  setStatus(message,'error');
}

async function loadSpaceImages(event) {
  if (event) event.preventDefault();
  const startDate = startInput.value;
  const endDate = endInput.value;
  if (!startDate || !endDate || startDate < earliestDate || endDate > today || startDate > endDate) {
    setStatus('Please choose valid dates between June 16, 1995 and today, with the start date before the end date.','error');
    return;
  }
  if (activeRequest) activeRequest.abort();
  activeRequest = new AbortController();
  const thisRequest = activeRequest;
  const params = new URLSearchParams({start_date:startDate, end_date:endDate});
  const url = `${APOD_API}?${params}`;
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy','true');
  showLoading();
  try {
    const response = await fetch(url, { signal:thisRequest.signal, headers:{ Accept:'application/json' } });
    if (!response.ok) throw new Error(`NASA returned HTTP ${response.status}`);
    const json = await response.json();
    if (json && json.error) throw new Error(textOnly(json.error.message || json.error) || 'NASA returned an API error.');
    const entries = Array.isArray(json) ? json : (json && typeof json === 'object' && json.date ? [json] : null);
    if (!entries) throw new Error('Unexpected format returned by NASA.');
    renderGallery(entries);
    setStatus(`Showing NASA Astronomy Picture of the Day entries from ${formatDate(startDate)} to ${formatDate(endDate)}.`,'success');
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('NASA APOD request failed:',error);
    showError('NASA is not responding right now, or this browser could not reach the NASA API. Check your internet connection and try again.');
  } finally {
    if (activeRequest === thisRequest) {
      activeRequest = null;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  }
}
dateForm.addEventListener('submit', loadSpaceImages);

function openModal(entry) {
  previousFocus = document.activeElement;
  modalTitle.textContent = entry.title || 'NASA Space Discovery';
  modalDate.textContent = formatDate(entry.date);
  modalExplanation.textContent = textOnly(entry.explanation) || 'Visit the original NASA page for more about this discovery.';
  modalSource.href = sourceUrl(entry);
  modalMedia.replaceChildren();
  if (isImage(entry)) {
    const img = document.createElement('img');
    img.src = mediaUrl(entry);
    img.alt = textOnly(entry.alt) || entry.title || 'Astronomy picture';
    img.addEventListener('error', () => { modalMedia.replaceChildren(makeElement('p','modal-video-note','This image could not be loaded. Use the NASA link below to see the original.')); }, { once:true });
    modalMedia.append(img);
  } else {
    const videoBox = makeElement('div','modal-video-placeholder');
    videoBox.append(makeElement('div','modal-video-icon','▶'));
    videoBox.append(makeElement('p','','This Astronomy Picture of the Day is a video or another media feature.'));
    const link = makeElement('a','watch-button','Watch on NASA ↗');
    link.href = sourceUrl(entry);
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    videoBox.append(link);
    modalMedia.append(videoBox);
  }
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modalCloseButton.focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  modalMedia.replaceChildren();
  if (previousFocus && previousFocus.isConnected) previousFocus.focus();
}
modalCloseButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target.dataset.closeModal === 'true') closeModal();
});
document.addEventListener('keydown', (event) => {
  if (modal.hidden) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    const focusables = [...modal.querySelectorAll('button:not([disabled]), a[href]')];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  }
});
