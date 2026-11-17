import { updateCartBadge, initCartPage } from './cart.js';
import { initStorefront } from './storefront.js';
import { initCheckout } from './checkout.js';
import { initAdmin } from './admin.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initStorefront();
  initCartPage();
  initCheckout();
  initAdmin();
});
