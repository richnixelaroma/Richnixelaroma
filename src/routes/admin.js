const express = require('express');
const { config: env } = require('../config');
const { requireAdmin } = require('../middleware/auth');
const { getProducts, saveProducts, getOrders, saveOrders, getCoupons, saveCoupons, getConfig, saveConfig } = require('../data/store');

const router = express.Router();
const ORDER_STATUSES = ['Order placed - COD', 'Awaiting UPI confirmation', 'Payment received', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const text = (value, max = 120) => String(value || '').trim().slice(0, max);
const number = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};
const slugify = (value) => text(value, 120).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
router.post('/logout', requireAdmin, (req, res, next) => req.session.destroy((error) => error ? next(error) : res.redirect('/admin/login')));
router.get('/logout', (req, res) => res.redirect('/admin/login'));

router.get('/', requireAdmin, (req, res) => {
  const orders = getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.render('admin', { products: getProducts(), orders, coupons: getCoupons(), adminUser: req.session.adminUser, adminLoggedIn: true, orderStatuses: ORDER_STATUSES });
});
router.post('/site-config', requireAdmin, (req, res) => {
  const current = getConfig();
  saveConfig({ ...current,
    siteName: text(req.body.siteName, 100) || current.siteName,
    supportPhone: text(req.body.supportPhone, 30) || current.supportPhone,
    upiId: text(req.body.upiId, 100),
    tagline: text(req.body.tagline, 240) || current.tagline,
    codEnabled: req.body.codEnabled === 'on',
    gujaratOnly: req.body.gujaratOnly === 'on'
  });
  res.redirect('/admin?section=settings');
});
router.post('/products', requireAdmin, (req, res) => {
  const products = getProducts();
  const name = text(req.body.name, 120);
  const slug = slugify(req.body.slug || name);
  const price = Number(req.body.price);
  const stock = Number(req.body.stock);
  if (!name || !slug || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 || products.some((item) => item.slug === slug)) return res.redirect('/admin?section=products&error=product');
  products.push({
    id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, slug,
    category: text(req.body.category, 50) || 'Perfume', price,
    discount: number(req.body.discount, 0, 100), stock,
    image: text(req.body.image, 300) || '/images/default.jpg',
    description: text(req.body.description, 1000),
    notes: text(req.body.notes, 500).split(',').map((item) => item.trim()).filter(Boolean),
    featured: req.body.featured === 'on', rating: number(req.body.rating || 4.8, 0, 5)
  });
  saveProducts(products);
  res.redirect('/admin?section=products&saved=product');
});
router.post('/products/:id', requireAdmin, (req, res) => {
  const products = getProducts();
  const index = products.findIndex((product) => product.id === req.params.id);
  if (index < 0) return res.redirect('/admin?section=products&error=not-found');
  const current = products[index];
  const name = text(req.body.name, 120);
  const slug = slugify(req.body.slug || name);
  const price = Number(req.body.price);
  const stock = Number(req.body.stock);
  if (!name || !slug || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0 || products.some((item, i) => i !== index && item.slug === slug)) return res.redirect('/admin?section=products&error=product');
  products[index] = { ...current, name, slug, category: text(req.body.category, 50) || current.category, price,
    discount: number(req.body.discount, 0, 100), stock, image: text(req.body.image, 300) || '/images/default.jpg',
    description: text(req.body.description, 1000), notes: text(req.body.notes, 500).split(',').map((item) => item.trim()).filter(Boolean),
    featured: req.body.featured === 'on', rating: number(req.body.rating || current.rating || 4.8, 0, 5) };
  saveProducts(products);
  res.redirect('/admin?section=products&saved=product');
});
router.post('/products/:id/delete', requireAdmin, (req, res) => {
  saveProducts(getProducts().filter((product) => product.id !== req.params.id));
  res.redirect('/admin?section=products&saved=deleted');
});
router.post('/coupons', requireAdmin, (req, res) => {
  const coupons = getCoupons();
  const code = text(req.body.code, 40).toUpperCase();
  const type = String(req.body.type || 'percent');
  const value = Number(req.body.value);
  if (!/^[A-Z0-9_-]{2,40}$/.test(code) || !['percent', 'fixed'].includes(type) || !Number.isFinite(value) || value <= 0 || (type === 'percent' && value > 100) || coupons.some((coupon) => coupon.code.toUpperCase() === code)) return res.redirect('/admin?section=coupons&error=coupon');
  coupons.push({ code, type, value, active: true });
  saveCoupons(coupons);
  res.redirect('/admin?section=coupons&saved=coupon');
});
router.post('/coupons/:code/toggle', requireAdmin, (req, res) => {
  const coupons = getCoupons();
  const coupon = coupons.find((item) => item.code.toUpperCase() === req.params.code.toUpperCase());
  if (coupon) { coupon.active = !coupon.active; saveCoupons(coupons); }
  res.redirect('/admin?section=coupons');
});
router.post('/coupons/:code/delete', requireAdmin, (req, res) => {
  saveCoupons(getCoupons().filter((item) => item.code.toUpperCase() !== req.params.code.toUpperCase()));
  res.redirect('/admin?section=coupons');
});
router.post('/orders/:id/status', requireAdmin, (req, res) => {
  const orders = getOrders();
  const order = orders.find((item) => item.id === req.params.id);
  if (order && ORDER_STATUSES.includes(req.body.status)) { order.status = req.body.status; saveOrders(orders); }
  res.redirect('/admin?section=orders');
});

module.exports = router;
