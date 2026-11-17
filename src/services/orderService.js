const crypto = require('crypto');

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function buildUpiLink(upiId, orderId, amount) {
  if (!upiId) return '';
  const params = new URLSearchParams({ pa: upiId, pn: 'Richnix Perfumes', am: Number(amount).toFixed(2), cu: 'INR', tn: `Order ${orderId}` });
  return `upi://pay?${params.toString()}`;
}

function placeOrder(body, { products, coupons, siteConfig }) {
  const cart = Array.isArray(body.cart) ? body.cart : [];
  if (!cart.length || cart.length > 50) throw badRequest('Your cart is empty or invalid.');
  const state = String(body.state || '').trim();
  if (siteConfig.gujaratOnly && state.toLowerCase() !== 'gujarat') throw badRequest('We accept orders only within Gujarat.');

  const productMap = new Map(products.map((product) => [String(product.id), product]));
  const items = cart.map((cartItem) => {
    const product = productMap.get(String(cartItem.id || ''));
    const quantity = Number(cartItem.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw badRequest('Your cart contains an invalid product or quantity.');
    if (Number(product.stock) < quantity) throw badRequest(`${product.name} does not have enough stock.`);
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) throw badRequest('A product has an invalid price.');
    return { id: product.id, name: String(product.name), quantity, price, image: product.image || '/images/default.jpg', slug: product.slug || '' };
  });

  const customer = {
    name: String(body.name || '').trim().slice(0, 100),
    phone: String(body.phone || '').trim(),
    email: String(body.email || '').trim().slice(0, 254),
    address: String(body.address || '').trim().slice(0, 500),
    city: String(body.city || '').trim().slice(0, 100),
    state: state.slice(0, 100),
    pincode: String(body.pincode || '').trim(),
    paymentMethod: String(body.paymentMethod || 'cod').toLowerCase()
  };
  if (!customer.name || !customer.address || !customer.city || !customer.phone || !/^\d{10}$/.test(customer.phone.replace(/\D/g, '')) || !/^\d{6}$/.test(customer.pincode)) throw badRequest('Please provide a valid name, 10-digit phone number, address, city, and 6-digit pincode.');
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw badRequest('Please provide a valid email address.');
  if (!['cod', 'upi'].includes(customer.paymentMethod)) throw badRequest('Choose a supported payment method.');
  if (customer.paymentMethod === 'cod' && !siteConfig.codEnabled) throw badRequest('Cash on delivery is currently unavailable.');
  if (customer.paymentMethod === 'upi' && !siteConfig.upiId) throw badRequest('UPI payments are not configured. Please contact support.');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const code = String(body.coupon || '').trim().toUpperCase();
  const coupon = code ? coupons.find((item) => item.code === code && item.active) : null;
  if (code && !coupon) throw badRequest('That coupon is invalid or inactive.');
  const value = coupon ? Number(coupon.value) : 0;
  if (coupon && (!Number.isFinite(value) || value <= 0 || !['percent', 'fixed'].includes(coupon.type))) throw badRequest('That coupon is not configured correctly.');
  const discount = coupon ? Math.min(subtotal, coupon.type === 'percent' ? subtotal * Math.min(value, 100) / 100 : value) : 0;
  const total = Math.max(0, subtotal - discount);
  const id = `RNX-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  return {
    id,
    customer,
    items,
    subtotal,
    discount,
    total,
    paymentMethod: customer.paymentMethod,
    status: customer.paymentMethod === 'upi' ? 'Awaiting UPI confirmation' : 'Order placed - COD',
    createdAt: new Date().toISOString(),
    paymentLink: customer.paymentMethod === 'upi' ? buildUpiLink(siteConfig.upiId, id, total) : ''
  };
}

module.exports = { placeOrder, buildUpiLink };
