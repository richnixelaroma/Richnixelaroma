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

function priceCart(cartInput, products) {
  const cart = Array.isArray(cartInput) ? cartInput : [];
  if (!cart.length || cart.length > 50) throw badRequest('Your cart is empty or invalid.');
  const productMap = new Map(products.map((product) => [String(product.id), product]));
  const quantities = new Map();
  for (const entry of cart) {
    const id = String(entry && entry.id || '');
    const quantity = Number(entry && entry.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw badRequest('Your cart contains an invalid product or quantity.');
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
    if (quantities.get(id) > 20) throw badRequest('A product quantity cannot exceed 20.');
  }

  const items = [...quantities].map(([id, quantity]) => {
    const product = productMap.get(id);
    if (!product) throw badRequest('Your cart contains an unavailable product. Please review your cart.');
    if (!Number.isInteger(Number(product.stock)) || Number(product.stock) < quantity) {
      throw badRequest(`${product.name} does not have enough stock.`);
    }
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) throw badRequest('A product has an invalid price.');
    return { id: product.id, name: String(product.name), quantity, price, image: product.image || '/images/default.jpg', slug: product.slug || '' };
  });
  return { items, subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0) };
}

function couponDiscount(codeInput, subtotal, coupons) {
  const code = String(codeInput || '').trim().toUpperCase();
  if (!code) return { code: '', discount: 0 };
  const coupon = coupons.find((item) => String(item.code).toUpperCase() === code && item.active);
  if (!coupon) throw badRequest('That coupon is invalid or inactive.');
  const value = Number(coupon.value);
  if (!Number.isFinite(value) || value <= 0 || !['percent', 'fixed'].includes(coupon.type) || (coupon.type === 'percent' && value > 100)) {
    throw badRequest('That coupon is not configured correctly.');
  }
  return { code, discount: Math.min(subtotal, coupon.type === 'percent' ? subtotal * value / 100 : value) };
}

function quoteOrder(body, { products, coupons }) {
  const { items, subtotal } = priceCart(body.cart, products);
  const { code, discount } = couponDiscount(body.coupon, subtotal, coupons);
  return { items, subtotal, coupon: code, discount, total: Math.max(0, subtotal - discount) };
}

function placeOrder(body, { products, coupons, siteConfig }) {
  const state = String(body.state || '').trim();
  if (siteConfig.gujaratOnly && state.toLowerCase() !== 'gujarat') throw badRequest('We accept orders only within Gujarat.');
  const priced = quoteOrder(body, { products, coupons });
  const customer = {
    name: String(body.name || '').trim().slice(0, 100),
    phone: String(body.phone || '').trim().replace(/[\s()-]/g, ''),
    email: String(body.email || '').trim().slice(0, 254),
    address: String(body.address || '').trim().slice(0, 500),
    city: String(body.city || '').trim().slice(0, 100),
    state: state.slice(0, 100),
    pincode: String(body.pincode || '').trim(),
    paymentMethod: String(body.paymentMethod || '').trim().toLowerCase()
  };
  if (customer.name.length < 2 || !/^[\p{L}\p{M} .'-]+$/u.test(customer.name)) throw badRequest('Enter a valid full name.');
  if (!customer.address || customer.address.length < 5 || !customer.city || !/^[\p{L}\p{M} .'-]+$/u.test(customer.city)) throw badRequest('Enter a valid delivery address and city.');
  if (!/^\+?\d{10,13}$/.test(customer.phone)) throw badRequest('Enter a valid phone number.');
  if (!/^\d{6}$/.test(customer.pincode)) throw badRequest('Enter a valid 6-digit PIN code.');
  if (customer.email && (customer.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))) throw badRequest('Please provide a valid email address.');
  if (!['cod', 'upi'].includes(customer.paymentMethod)) throw badRequest('Choose a supported payment method.');
  if (customer.paymentMethod === 'cod' && !siteConfig.codEnabled) throw badRequest('Cash on delivery is currently unavailable. Choose UPI or contact support.');
  if (customer.paymentMethod === 'upi' && !siteConfig.upiId) throw badRequest('UPI payments are not configured. Please contact support.');

  const id = `RNX-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
  return {
    id,
    customer,
    items: priced.items,
    subtotal: Number(priced.subtotal.toFixed(2)),
    discount: Number(priced.discount.toFixed(2)),
    total: Number(priced.total.toFixed(2)),
    paymentMethod: customer.paymentMethod,
    status: customer.paymentMethod === 'upi' ? 'Awaiting UPI confirmation' : 'Order placed - COD',
    createdAt: new Date().toISOString(),
    paymentLink: customer.paymentMethod === 'upi' ? buildUpiLink(siteConfig.upiId, id, priced.total) : ''
  };
}

module.exports = { placeOrder, buildUpiLink, quoteOrder, priceCart, couponDiscount };
