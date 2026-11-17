import { readCart, writeCart, updateCartBadge, showToast } from './cart.js';

export function initStorefront() {
  document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.productId;
      if (!id) return;
      const cart = readCart();
      const item = cart.find((entry) => entry.id === id);
      if (item && item.quantity >= 20) {
        showToast('Maximum quantity per item is 20.');
        return;
      }
      if (item) item.quantity += 1;
      else cart.push({ id, name: button.dataset.productName || 'Fragrance', price: Number(button.dataset.productPrice) || 0, image: button.dataset.productImage || '', slug: button.dataset.productSlug || '', quantity: 1 });
      writeCart(cart);
      showToast(`${button.dataset.productName || 'Fragrance'} added to cart.`);
      const original = button.textContent;
      button.textContent = 'Added';
      button.disabled = true;
      setTimeout(() => { button.textContent = original; button.disabled = false; }, 800);
    });
  });
  updateCartBadge();
}
