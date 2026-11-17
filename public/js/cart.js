const CART_KEY = 'richnixelaroma-cart';

export function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(cart)) return [];
    return cart.filter((item) => item && typeof item.id === 'string' && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0)
      .map((item) => ({ id: item.id, name: String(item.name || 'Fragrance'), price: Number(item.price) || 0, image: String(item.image || ''), slug: String(item.slug || ''), quantity: Math.min(20, Number(item.quantity)) }));
  } catch {
    return [];
  }
}

export function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  window.dispatchEvent(new CustomEvent('rnx:cart-updated', { detail: cart }));
}

export function updateCartBadge() {
  const count = readCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((node) => { node.textContent = String(count); });
}

export function showToast(message) {
  let toast = document.querySelector('[data-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.toast = '';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function money(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function renderRows(container, cart, { editable = false } = {}) {
  container.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Your cart is empty. Choose a fragrance to begin.';
    container.append(empty);
    return;
  }
  cart.forEach((item) => {
    const row = document.createElement('article');
    row.className = 'cart-item';
    const thumb = document.createElement('div');
    thumb.className = 'cart-thumb';
    thumb.setAttribute('aria-hidden', 'true');
    const details = document.createElement('div');
    details.className = 'cart-item-details';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const price = document.createElement('span');
    price.className = 'muted';
    price.textContent = `${money(item.price)} each`;
    details.append(name, price);
    const controls = document.createElement('div');
    controls.className = 'quantity-control';
    if (editable) {
      const decrement = document.createElement('button');
      decrement.type = 'button'; decrement.textContent = '−'; decrement.setAttribute('aria-label', `Decrease ${item.name} quantity`);
      decrement.dataset.quantity = '-1'; decrement.dataset.productId = item.id;
      const quantity = document.createElement('span'); quantity.textContent = String(item.quantity); quantity.setAttribute('aria-live', 'polite');
      const increment = document.createElement('button');
      increment.type = 'button'; increment.textContent = '+'; increment.setAttribute('aria-label', `Increase ${item.name} quantity`);
      increment.dataset.quantity = '1'; increment.dataset.productId = item.id;
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'link-button'; remove.textContent = 'Remove'; remove.dataset.removeCartItem = item.id;
      controls.append(decrement, quantity, increment, remove);
    } else {
      const quantity = document.createElement('span'); quantity.textContent = `Qty ${item.quantity}`; controls.append(quantity);
    }
    const lineTotal = document.createElement('strong');
    lineTotal.textContent = money(item.price * item.quantity);
    row.append(thumb, details, controls, lineTotal);
    container.append(row);
  });
}

export function initCartPage() {
  const container = document.querySelector('[data-cart-items]');
  if (!container) return;
  const totalNode = document.querySelector('[data-cart-total]');
  const checkoutButton = document.querySelector('[data-checkout]');
  const render = () => {
    const cart = readCart();
    renderRows(container, cart, { editable: true });
    if (totalNode) totalNode.textContent = money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    if (checkoutButton) checkoutButton.disabled = !cart.length;
  };
  container.addEventListener('click', (event) => {
    const change = event.target.closest('[data-quantity]');
    const remove = event.target.closest('[data-remove-cart-item]');
    let cart = readCart();
    if (change) {
      const item = cart.find((entry) => entry.id === change.dataset.productId);
      if (item) {
        item.quantity = Math.min(20, item.quantity + Number(change.dataset.quantity));
        cart = cart.filter((entry) => entry.quantity > 0);
        writeCart(cart);
        render();
      }
    } else if (remove) {
      writeCart(cart.filter((entry) => entry.id !== remove.dataset.removeCartItem));
      render();
    }
  });
  checkoutButton?.addEventListener('click', () => { window.location.assign('/checkout'); });
  window.addEventListener('rnx:cart-updated', render);
  render();
}

export function renderCartRows(container, cart) {
  renderRows(container, cart);
}
