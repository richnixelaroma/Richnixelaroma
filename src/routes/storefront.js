const express = require('express');
const { getProducts, getOrders, getCoupons, getConfig } = require('../data/store');
const { placeOrder } = require('../services/orderService');
const { createRateLimiter } = require('../middleware/security');

const router = express.Router();
const orderLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, key: (req) => `${req.ip}:order` });

router.get('/', (req, res) => res.render('index', { products: getProducts().filter((product) => product.featured), adminLoggedIn: !!req.session.adminLoggedIn }));
router.get('/products', (req, res) => res.render('products', { products: getProducts(), adminLoggedIn: !!req.session.adminLoggedIn }));
router.get('/products/:slug', (req, res) => {
  const product = getProducts().find((item) => item.slug === req.params.slug);
  if (!product) return res.status(404).render('404', { adminLoggedIn: !!req.session.adminLoggedIn });
  res.render('product', { product, adminLoggedIn: !!req.session.adminLoggedIn });
});
router.get('/cart', (req, res) => res.render('cart', { adminLoggedIn: !!req.session.adminLoggedIn }));
router.get('/checkout', (req, res) => res.render('checkout', { adminLoggedIn: !!req.session.adminLoggedIn }));
router.get('/support', (req, res) => res.render('support', { adminLoggedIn: !!req.session.adminLoggedIn }));
router.get('/order-success', (req, res) => {
  const order = getOrders().find((item) => item.id === req.query.orderId) || null;
  res.render('order-success', { order, adminLoggedIn: !!req.session.adminLoggedIn });
});

router.post('/api/cart/add', (req, res) => {
  const { productId } = req.body || {};
  const product = getProducts().find((item) => item.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  const cart = req.session.cart;
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity = Math.min(20, existing.quantity + 1);
  else cart.push({ id: product.id, quantity: 1 });
  res.json({ success: true, cartCount: cart.reduce((sum, item) => sum + item.quantity, 0) });
});

router.post('/api/order', orderLimiter, async (req, res, next) => {
  try {
    const order = placeOrder(req.body || {}, { products: getProducts(), coupons: getCoupons(), siteConfig: getConfig() });
    const orders = getOrders();
    orders.unshift(order);
    const { saveOrders } = require('../data/store');
    saveOrders(orders);
    req.session.cart = [];
    res.json({ success: true, order, message: 'Order placed successfully.' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    next(error);
  }
});

module.exports = router;
