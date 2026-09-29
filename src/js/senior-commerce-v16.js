import { addCartItem, getCart, getDeliveryWindow, getProduct } from './commerce-store.js?v=atelier-v16';

function ensureStatusRegion() {
  let region = document.querySelector('[data-atelier-senior-status]');
  if (region) return region;
  region = document.createElement('div');
  region.className = 'atelier-senior-status';
  region.dataset.atelierSeniorStatus = 'true';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);
  return region;
}

function showUndo(message, onUndo) {
  const region = ensureStatusRegion();
  region.replaceChildren();
  const copy = document.createElement('span');
  copy.textContent = message;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Undo';
  button.addEventListener('click', async () => {
    button.disabled = true;
    await onUndo();
    region.remove();
  }, { once: true });
  region.append(copy, button);
  requestAnimationFrame(() => region.classList.add('is-visible'));
  clearTimeout(showUndo.timer);
  showUndo.timer = setTimeout(() => region.remove(), 6500);
}

function initCartRecovery() {
  if (!location.pathname.includes('cart.html')) return;
  const list = document.querySelector('.js-cart-items-list');
  if (!list || list.dataset.seniorRecoveryBound === 'true') return;
  list.dataset.seniorRecoveryBound = 'true';

  list.addEventListener('click', (event) => {
    const remove = event.target.closest('.btn-remove');
    const row = remove?.closest('[data-line-id]');
    if (!remove || !row) return;
    const snapshot = getCart().find((line) => line.id === row.dataset.lineId);
    if (!snapshot) return;
    queueMicrotask(() => {
      showUndo('Removed from your Bag.', async () => {
        const product = await getProduct(snapshot.productId);
        if (!product) return;
        addCartItem(product, snapshot.variantId, snapshot.quantity);
        location.reload();
      });
    });
  }, true);

  const summary = document.querySelector('.order-summary-card');
  if (summary && !summary.querySelector('.atelier-inventory-reality')) {
    const note = document.createElement('p');
    note.className = 'atelier-inventory-reality';
    note.innerHTML = '<strong>Availability reality</strong><span>Known stock is enforced. Unknown inventory stays explicitly unknown and is rechecked before a local order is recorded.</span>';
    summary.querySelector('.need-assistance')?.insertAdjacentElement('beforebegin', note);
  }
}

function initCheckoutDecisionSupport() {
  if (!location.pathname.includes('checkout.html')) return;
  const standard = document.querySelector('input[name="deliveryMethod"][value="standard"]')?.closest('label');
  const express = document.querySelector('input[name="deliveryMethod"][value="express"]')?.closest('label');
  const standardDate = getDeliveryWindow(false);
  const expressDate = getDeliveryWindow(true);

  const rewrite = (label, date, service) => {
    if (!label) return;
    const strong = label.querySelector('strong');
    const small = label.querySelector('small');
    if (strong) strong.textContent = `Arrives ${date}`;
    if (small) small.textContent = service;
  };
  rewrite(standard, standardDate, 'Standard delivery');
  rewrite(express, expressDate, 'Express delivery');

  const review = document.querySelector('.checkout-review');
  if (review && !review.querySelector('.atelier-next-steps')) {
    const next = document.createElement('section');
    next.className = 'atelier-next-steps';
    next.setAttribute('aria-label', 'What happens after this prototype order');
    next.innerHTML = `
      <p class="eyebrow">SYSTEM REALITY / AFTER RECORDING</p>
      <ol>
        <li><strong>1. Local record</strong><span>The order is stored only in this browser.</span></li>
        <li><strong>2. No payment capture</strong><span>COD or bank transfer is recorded as a choice, not processed.</span></li>
        <li><strong>3. No live fulfilment</strong><span>Delivery is not scheduled and inventory is not reserved by a server.</span></li>
      </ol>`;
    review.querySelector('.checkout-consent')?.insertAdjacentElement('beforebegin', next);
  }
}

function initPdpDecisionSupport() {
  if (!document.body.classList.contains('page-pdp')) return;
  const confidence = document.querySelector('.pdp-confidence-strip');
  if (!confidence || confidence.nextElementSibling?.classList.contains('atelier-fit-escalation')) return;
  const escalation = document.createElement('div');
  escalation.className = 'atelier-fit-escalation';
  escalation.innerHTML = '<span>Still deciding?</span><p>Use body measurements first. If you are between sizes or the silhouette is unfamiliar, open the full Size Guide before adding to Bag.</p><button type="button" class="js-senior-size-guide">Review Size Guide</button>';
  confidence.insertAdjacentElement('afterend', escalation);
  escalation.querySelector('button')?.addEventListener('click', () => document.querySelector('.js-pdp-size-guide')?.click());
}

export function initSeniorCommerceV16() {
  document.documentElement.dataset.atelierVersion = 'v16';
  document.documentElement.dataset.atelierProductLevel = 'senior-commerce';
  initCartRecovery();
  initCheckoutDecisionSupport();
  initPdpDecisionSupport();
}
