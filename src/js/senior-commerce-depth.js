import { loadProducts } from './commerce-store.js?v=atelier-v15';

function ensureStyles() {
  if (document.querySelector('link[data-atelier-senior-commerce]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './atelier-senior-commerce.css?v=20260929-1';
  link.dataset.atelierSeniorCommerce = 'true';
  document.head.appendChild(link);
}

function availableSizeButtons() {
  return [...document.querySelectorAll('.js-size-options button[data-size]')]
    .filter((button) => !button.disabled && button.dataset.stockState !== 'sold-out');
}

async function initPdpSizeConfidence() {
  const sizeOptions = document.querySelector('.js-size-options');
  if (!document.body.classList.contains('page-pdp') || !sizeOptions || document.querySelector('.pdp-size-confidence')) return;
  const products = await loadProducts();
  const requestedId = new URLSearchParams(location.search).get('id');
  const product = products.find((item) => item.id === requestedId) || products[0];
  if (!product) return;

  const section = document.createElement('section');
  section.className = 'pdp-size-confidence';
  section.setAttribute('aria-labelledby', 'size-confidence-title');
  section.innerHTML = `
    <div class="pdp-size-confidence__head">
      <div><span>FIT DECISION / GUIDANCE</span><h3 id="size-confidence-title">Choose with more confidence.</h3></div>
      <strong class="js-size-confidence-state" aria-live="polite">Not assessed</strong>
    </div>
    <p>Use your usual labelled size and preferred feel as a lightweight guide. This prototype does not infer body measurements or guarantee fit.</p>
    <div class="pdp-size-confidence__controls">
      <label>Usual size<select class="js-usual-size"></select></label>
      <label>Preferred feel<select class="js-fit-preference"><option value="true">True to the intended fit</option><option value="closer">A closer fit</option><option value="easier">A little more ease</option></select></label>
    </div>
    <div class="pdp-size-confidence__recommendation js-size-recommendation"></div>`;
  sizeOptions.closest('.size-selection')?.insertAdjacentElement('afterend', section);

  const usual = section.querySelector('.js-usual-size');
  const preference = section.querySelector('.js-fit-preference');
  const recommendation = section.querySelector('.js-size-recommendation');
  const state = section.querySelector('.js-size-confidence-state');

  const populate = () => {
    const buttons = availableSizeButtons();
    const previous = usual.value;
    usual.innerHTML = '<option value="">Select size</option>' + buttons.map((button) => `<option value="${button.dataset.size}">${button.dataset.size}</option>`).join('');
    if (buttons.some((button) => button.dataset.size === previous)) usual.value = previous;
  };

  const suggest = () => {
    populate();
    const buttons = availableSizeButtons();
    if (!usual.value || !buttons.length) {
      state.textContent = buttons.length ? 'Add your usual size' : 'No available sizes';
      recommendation.innerHTML = buttons.length ? '<span>Guidance appears after two explicit choices.</span>' : '<span>No available size can be suggested for this colour.</span>';
      return;
    }
    const sizes = buttons.map((button) => button.dataset.size);
    const currentIndex = Math.max(0, sizes.indexOf(usual.value));
    let targetIndex = currentIndex;
    if (preference.value === 'closer') targetIndex = Math.max(0, currentIndex - 1);
    if (preference.value === 'easier') targetIndex = Math.min(sizes.length - 1, currentIndex + 1);
    const target = sizes[targetIndex] || sizes[0];
    const changed = target !== usual.value;
    state.textContent = `Guidance: ${target}`;
    recommendation.innerHTML = `<div><strong>Consider size ${target}</strong><span>${changed ? `Your preference shifts the starting point from ${usual.value} to the nearest available ${target}.` : `Your usual ${usual.value} is the clearest starting point for the intended silhouette.`}</span><small>Compare the product fit note and size guide before deciding.</small></div><button type="button" class="js-apply-size">Choose ${target}</button>`;
    recommendation.querySelector('.js-apply-size')?.addEventListener('click', () => {
      const button = buttons.find((item) => item.dataset.size === target);
      button?.click();
      button?.focus();
    });
  };

  usual.addEventListener('change', suggest);
  preference.addEventListener('change', suggest);
  new MutationObserver(() => suggest()).observe(sizeOptions, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled', 'data-stock-state'] });
  suggest();
}

function initCartDecisionContinuity() {
  const list = document.querySelector('.js-cart-items-list');
  if (!list || document.querySelector('.senior-cart-continuity')) return;
  const checkout = document.querySelector('.btn-checkout');
  if (!checkout) return;

  const panel = document.createElement('section');
  panel.className = 'senior-cart-continuity';
  panel.setAttribute('aria-label', 'Bag decision continuity');
  checkout.insertAdjacentElement('beforebegin', panel);

  const render = () => {
    const lines = [...list.querySelectorAll('.js-cart-item')];
    if (!lines.length) {
      panel.innerHTML = '<span>DECISION CONTINUITY</span><strong>Your Bag is empty.</strong><p>Variant and delivery checks will appear here before checkout.</p>';
      return;
    }
    const unavailable = lines.filter((line) => line.querySelector('option:checked:disabled')).length;
    const openEditors = lines.filter((line) => line.querySelector('.js-variant-editor:not([hidden])')).length;
    panel.innerHTML = `<div><span>DECISION CONTINUITY</span><strong>${unavailable ? 'Resolve availability before checkout' : `${lines.length} ${lines.length === 1 ? 'piece' : 'pieces'} ready for checkout review`}</strong></div><ul><li><b>Variants</b><span>Colour and size remain editable in Bag.</span></li><li><b>Inventory</b><span>${unavailable ? `${unavailable} selected variant needs attention.` : 'Stock is revalidated again before the local order is recorded.'}</span></li><li><b>Edits</b><span>${openEditors ? `${openEditors} variant editor open — finish the change before continuing.` : 'No unfinished Bag edits.'}</span></li></ul>`;
  };
  render();
  new MutationObserver(render).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'disabled', 'selected'] });
}

function initCheckoutReadiness() {
  const form = document.querySelector('.js-checkout-form');
  if (!form || document.querySelector('.senior-checkout-readiness')) return;
  const header = document.querySelector('.checkout-header');
  const strip = document.createElement('section');
  strip.className = 'senior-checkout-readiness';
  strip.setAttribute('aria-label', 'Checkout readiness and recovery');
  strip.innerHTML = `
    <div><span>ORDER READINESS</span><strong class="js-senior-checkout-state">Review required details</strong></div>
    <ol><li data-stage="contact">Contact <b>Open</b></li><li data-stage="address">Address <b>Open</b></li><li data-stage="method">Delivery + payment <b>Ready</b></li><li data-stage="consent">Final consent <b>Open</b></li></ol>
    <p>Draft details stay in this browser. Bag and inventory are checked again immediately before the local order is recorded.</p>`;
  header?.insertAdjacentElement('afterend', strip);

  const originalError = form.querySelector('.js-checkout-error');
  const sync = () => {
    const checks = {
      contact: ['email','phone'].every((name) => form.elements.namedItem(name)?.checkValidity()),
      address: ['country','fullName','address','district','province'].every((name) => form.elements.namedItem(name)?.checkValidity()),
      method: Boolean(form.querySelector('[name="deliveryMethod"]:checked') && form.querySelector('[name="paymentMethod"]:checked')),
      consent: Boolean(form.elements.namedItem('terms')?.checked),
    };
    Object.entries(checks).forEach(([stage, done]) => {
      const row = strip.querySelector(`[data-stage="${stage}"]`);
      row?.classList.toggle('is-complete', done);
      const label = row?.querySelector('b');
      if (label) label.textContent = done ? 'Ready' : 'Open';
    });
    const count = Object.values(checks).filter(Boolean).length;
    strip.querySelector('.js-senior-checkout-state').textContent = count === 4 ? 'Ready to record the order' : `${count}/4 checkpoints ready`;
  };
  form.addEventListener('input', sync);
  form.addEventListener('change', sync);
  form.addEventListener('submit', () => {
    requestAnimationFrame(() => {
      if (!originalError?.textContent.trim()) return;
      const firstInvalid = form.querySelector(':invalid');
      originalError.insertAdjacentHTML('beforeend', firstInvalid ? ' <button type="button" class="js-focus-first-error">Review first missing detail</button>' : '');
      originalError.querySelector('.js-focus-first-error')?.addEventListener('click', () => firstInvalid?.focus(), { once: true });
    });
  }, true);
  sync();
}

export function initSeniorCommerceDepth() {
  ensureStyles();
  initPdpSizeConfidence().catch((error) => console.error('ATELIER size confidence failed', error));
  initCartDecisionContinuity();
  initCheckoutReadiness();
}
