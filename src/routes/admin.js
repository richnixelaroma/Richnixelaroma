const express = require('express');
const { config: env } = require('../config');
const { requireAdmin } = require('../middleware/auth');
const { getProducts, saveProducts, getOrders, saveOrders, getCoupons, saveCoupons, getConfig, saveConfig } = require('../data/store');

const router = express.Router();
router.get('/login', (req, res) => res.render('admin-login', { error: null, adminLoggedIn: false }));
router.post('/login', (req, res, next) => {
  const username = String(req.body.username || '');
  const password = String(req.body.password || '');
  if (username !== env.adminUsername || password !== env.adminPassword) return res.status(401).render('admin-login', { error: 'Invalid admin username or password.', adminLoggedIn: false });
  req.session.regenerate((error) => {
    if (error) return next(error);
    req.session.adminLoggedIn = true;
    req.session.adminUser = username;
    req.session.save((saveError) => saveError ? next(saveError) : res.redirect('/admin'));
  });
});
router.post('/logout', requireAdmin, (req, res, next) => req.session.destroy((error) => error ? next(error) : res.redirect('/admin/login'));
router.get('/logout', (req, res) => res.redirect('/admin/login'));

router.get('/', requireAdmin, (req, res) => {
  const orders = getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.render('admin', { products: getProducts(), orders, coupons: getCoupons(), adminUser: req.session.adminUser, adminLoggedIn: true });
});
router.post('/site-config', requireAdmin, (req, res) => {
  const current = getConfig();
  saveConfig({ ...current,
    siteName: String(req.body.siteName || current.siteName).trim().slice(0, 100),
    supportPhone: String(req.body.supportPhone || current.supportPhone).trim().slice(0, 30),
    upiId: String(req.body.upiId || current.upiId).trim().slice(0, 100),
    codEnabled: req.body.codEnabled === 'on',
    gujaratOnly: req.body.gujaratOnly === 'on'
  });
  res.redirect('/admin');
});
router.post('/products', requireAdmin, (req, res) => {
  const products = getProducts();
  const name = String(req.body.name || '').trim().slice(0, 120);
  const price = Number(req.body.price);
  if (!name || !Number.isFinite(price) || price <= 0) return res.redirect('/admin');
  const slug = String(req.body.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (products.some((product) => product.slug === slug)) return res.redirect('/admin');
  products.push({ id: `prod-${Date.now()}`, name, slug, category: String(req.body.category || 'Perfume').trim().slice(0, 50), price, discount: boundedNumber(req.body.discount, 0, 100), stock: boundedNumber(req.body.stock, 0, 100000), image: String(req.body.image || '/images/default.jpg').trim().slice(0, 500), description: String(req.body.description || '').trim().slice(0, 2000), notes: String(req.body.notes || '').split(',').map((note) => note.trim().slice(0, 80)).filter(Boolean).slice(0, 20), featured: req.body.featured === 'on' });
  saveProducts(products);
  res.redirect('/admin');
});
router.post('/products/:id', requireAdmin, (req, res) => {
  const products = getProducts();
  const index = products.findIndex((product) => product.id === req.params.id);
  if (index < 0) return res.redirect('/admin');
  const current = products[index];
  products[index] = { ...current, name: String(req.body.name || current.name).trim().slice(0, 120), category: String(req.body.category || current.category).trim().slice(0, 50), price: boundedNumber(req.body.price, 0.01, 10000000), discount: boundedNumber(req.body.discount, 0, 100), stock: boundedNumber(req.body.stock, 0, 100000), image: String(req.body.image || current.image).trim().slice(0, 500), description: String(req.body.description || current.description).trim().slice(0, 2000), notes: String(req.body.notes || (current.notes || []).join(', ')).split(',').map((note) => note.trim().slice(0, 80)).filter(Boolean).slice(0, 20), featured: req.body.featured === 'on' };
  saveProducts(products);
  res.redirect('/admin');
});
router.post('/coupons', requireAdmin, (req, res) => {
  const coupons = getCoupons();
  const code = String(req.body.code || '').trim().toUpperCase().slice(0, 40);
  const type = String(req.body.type || 'percent');
  const value = Number(req.body.value);
  if (!code || !['percent', 'fixed'].includes(type) || !Number.isFinite(value) || value <= 0 || coupons.some((coupon) => coupon.code === code)) return res.redirect('/admin');
  coupons.push({ code, type, value: type === 'percent' ? Math.min(value, 100) : value, active: true });
  saveCoupons(coupons);
  res.redirect('/admin');
});
router.post('/orders/:id/status', requireAdmin, (req, res) => {
  const orders = getOrders();
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) return res.redirect('/admin');
  order.status = String(req.body.status || order.status).trim().slice(0, 100);
  saveOrders(orders);
  res.redirect('/admin');
});

function boundedNumber(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
}
module.exports = router;
