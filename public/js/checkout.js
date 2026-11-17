import { readCart, renderCartRows, updateCartBadge, writeCart, showToast } from './cart.js';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function initCheckout() {
  const form = document.querySelector('#checkoutForm');
  if (!form) return;
  const summary = document.querySelector('[data-order-summary]');
  const subtotalNode = document.querySelector('[data-checkout-subtotal]');
  const discountNode = document.querySelector('[data-checkout-discount]');
  const totalNode = document.querySelector('[data-checkout-total]');
  const messageNode = document.querySelector('[data-checkout-message]');
  const couponButton = document.querySelector('[data-apply-coupon]');
  const couponInput = form.elements.coupon;
  const submitButton = form.querySelector('[type="submit"]');
  let quote = null;

  const displayMessage = (message, isError = false) => {
    if (!messageNode) return;
    messageNode.textContent = message;
    messageNode.classList.toggle('error-text', isError);
    messageNode.classList.toggle('success-text', !isError && Boolean(message));
  };
  const cart = readCart();
  if (summary) renderCartRows(summary, cart);
  if (!cart.length) {
    displayMessage('Your cart is empty. Add an item before checking out.', true);
    if (submitButton) submitButton.disabled = true;
  }

  async function validateCoupon() {
    const code = String(couponInput?.value || '').trim().toUpperCase();
    if (!code) {
      quote = null;
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (subtotalNode) subtotalNode.textContent = formatMoney(subtotal);
      if (discountNode) discountNode.textContent = formatMoney(0);
      if (totalNode) totalNode.textContent = formatMoney(subtotal);
      displayMessage('');
      return;
    }
    if (couponButton) { couponButton.disabled = true; couponButton.textContent = 'Checking…'; }
    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(({ id, quantity }) => ({ id, quantity })), coupon: code })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'This coupon could not be applied.');
      quote = result;
      if (subtotalNode) subtotalNode.textContent = formatMoney(result.subtotal);
      if (discountNode) discountNode.textContent = formatMoney(result.discount);
      if (totalNode) totalNode.textContent = formatMoney(result.total);
      displayMessage(`Coupon ${result.coupon} applied.`);
    } catch (error) {
      quote = null;
      displayMessage(error.message, true);
      if (discountNode) discountNode.textContent = formatMoney(0);
      if (totalNode && subtotalNode) totalNode.textContent = subtotalNode.textContent;
    } finally {
      if (couponButton) { couponButton.disabled = false; couponButton.textContent = 'Apply'; }
    }
  }

  couponButton?.addEventListener('click', validateCoupon);
  couponInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); validateCoupon(); } });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!cart.length) return displayMessage('Your cart is empty.', true);
    if (!form.reportValidity()) return;
    if (couponInput?.value.trim() && !quote) {
      await validateCoupon();
      if (!quote) return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.cart = cart.map(({ id, quantity }) => ({ id, quantity }));
    payload.phone = String(payload.phone || '').replace(/[\s()-]/g, '');
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Placing order…'; }
    displayMessage('Securely placing your order…');
    try {
      const response = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to place your order. Please try again.');
      writeCart([]);
      updateCartBadge();
      if (result.order.paymentMethod === 'upi' && result.order.paymentLink) {
        window.location.assign(result.order.paymentLink);
        return;
      }
      window.location.assign(`/order-success?orderId=${encodeURIComponent(result.order.id)}`);
    } catch (error) {
      displayMessage(error.message || 'A network error occurred. Your cart is still saved; please try again.', true);
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Place order'; }
    }
  });
}
