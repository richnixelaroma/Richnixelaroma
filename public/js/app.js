document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'richnixelaroma-cart';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch (error) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function updateBadge() {
    const badge = document.querySelector('[data-cart-count]');
    if (badge) {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      badge.textContent = count;
    }
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    saveCart(cart);
    updateBadge();

    const btn = document.querySelector(`[data-product-id="${product.id}"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Added';
      setTimeout(() => { btn.textContent = original; }, 900);
    }
  }

  function bindAddButtons() {
    document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
      button.addEventListener('click', () => {
        addToCart({
          id: button.dataset.productId,
          name: button.dataset.productName,
          price: Number(button.dataset.productPrice || 0),
          image: button.dataset.productImage || '/images/default.jpg',
          slug: button.dataset.productSlug || ''
        });
      });
    });
  }

  function renderCartPage() {
    const holder = document.querySelector('[data-cart-items]');
    if (!holder) return;
    const cart = getCart();

    if (!cart.length) {
      holder.innerHTML = '<p>Your cart is empty.</p>';
      const total = document.querySelector('[data-cart-total]');
      if (total) total.textContent = '₹0';
      return;
    }

    let subtotal = 0;
    holder.innerHTML = cart.map((item) => {
      const totalItem = Number(item.price || 0) * Number(item.quantity || 1);
      subtotal += totalItem;
      return `
        <div class="cart-item">
          <div class="cart-thumb"></div>
          <div style="flex: 1; min-width: 0;">
            <strong>${item.name}</strong>
            <div style="color: var(--muted); font-size: 0.8rem;">Qty: ${item.quantity}</div>
          </div>
          <div><strong>₹${totalItem.toLocaleString('en-IN')}</strong></div>
        </div>
      `;
    }).join('');

    const totalNode = document.querySelector('[data-cart-total]');
    if (totalNode) totalNode.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  }

  function renderCheckoutPage() {
    const holder = document.querySelector('[data-order-summary]');
    const totalText = document.querySelector('[data-checkout-total]');
    const subtotalText = document.querySelector('#checkoutSubtotal');
    const discountText = document.querySelector('#checkoutDiscount');
    const couponInput = document.querySelector('#couponCode');
    const checkoutTotal = document.querySelector('#checkoutTotal');
    const couponHidden = document.querySelector('#couponHidden');
    const discountHidden = document.querySelector('#discountValue');

    if (!holder) return;
    const cart = getCart();

    if (!cart.length) {
      holder.innerHTML = '<p>Your cart is empty.</p>';
      if (totalText) totalText.textContent = '₹0';
      if (subtotalText) subtotalText.textContent = '₹0';
      if (discountText) discountText.textContent = '₹0';
      return;
    }

    let subtotal = 0;
    holder.innerHTML = cart.map((item) => {
      const totalItem = Number(item.price || 0) * Number(item.quantity || 1);
      subtotal += totalItem;
      return `
        <div class="cart-item">
          <div class="cart-thumb"></div>
          <div style="flex: 1; min-width: 0;">
            <strong>${item.name}</strong>
            <div style="color: var(--muted); font-size: 0.8rem;">Qty: ${item.quantity}</div>
          </div>
          <div><strong>₹${totalItem.toLocaleString('en-IN')}</strong></div>
        </div>
      `;
    }).join('');

    const calculate = () => {
      const code = (couponInput ? couponInput.value : '').trim().toUpperCase();
      let discount = 0;
      if (code === 'RICH10') discount = subtotal * 0.1;
      if (code === 'ATTAR20') discount = subtotal * 0.2;
      if (code === 'WELCOME15') discount = subtotal * 0.15;
      const total = Math.max(0, subtotal - discount);
      if (subtotalText) subtotalText.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      if (discountText) discountText.textContent = `₹${discount.toLocaleString('en-IN')}`;
      if (totalText) totalText.textContent = `₹${total.toLocaleString('en-IN')}`;
      if (checkoutTotal) checkoutTotal.value = String(total.toFixed(2));
      if (couponHidden) couponHidden.value = code;
      if (discountHidden) discountHidden.value = String(discount.toFixed(2));
    };

    if (couponInput) couponInput.addEventListener('input', calculate);
    calculate();
  }

  function bindCheckoutForm() {
    const form = document.querySelector('#checkoutForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const cart = getCart();
      if (!cart.length) {
        alert('Your cart is empty.');
        return;
      }

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        paymentMethod: formData.get('paymentMethod'),
        coupon: formData.get('coupon') || '',
        cart
      };

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!result.success) {
        alert(result.message || 'Order failed.');
        return;
      }

      localStorage.removeItem(CART_KEY);
      updateBadge();

      if (payload.paymentMethod === 'upi') {
        const link = result.order.paymentLink || 'upi://pay?pa=Creationlofi777@oksbi&pn=Richnix%20Perfumes&am=0&cu=INR';
        window.location.href = link;
        return;
      }

      window.location.href = `/order-success?orderId=${result.order.id}`;
    });
  }

  bindAddButtons();
  updateBadge();
  renderCartPage();
  renderCheckoutPage();
  bindCheckoutForm();
});
