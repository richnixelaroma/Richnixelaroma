const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PROD_PATH = path.join(DATA_DIR, 'products.json');
const COUPON_PATH = path.join(DATA_DIR, 'coupons.json');
const ORDER_PATH = path.join(DATA_DIR, 'orders.json');
const CONFIG_PATH = path.join(DATA_DIR, 'site-config.json');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(PROD_PATH)) {
    fs.writeFileSync(PROD_PATH, JSON.stringify([
      {
        id: 'prod-1',
        name: 'Velvet Oud Elixir',
        slug: 'velvet-oud-elixir',
        category: 'Perfume',
        price: 2199,
        discount: 18,
        stock: 24,
        rating: 4.9,
        image: '/images/perfume-1.jpg',
        featured: true,
        description: 'A warm, luxurious blend of oud, saffron, and smooth amber wood.',
        notes: ['Saffron', 'Oud', 'Amber', 'Vanilla']
      },
      {
        id: 'prod-2',
        name: 'Royal Rose Attar',
        slug: 'royal-rose-attar',
        category: 'Attar',
        price: 1599,
        discount: 12,
        stock: 32,
        rating: 4.8,
        image: '/images/attar-1.jpg',
        featured: true,
        description: 'A soft floral attar with rose petals, musk, and a lingering rich finish.',
        notes: ['Rose', 'Musk', 'Pear', 'White Woods']
      },
      {
        id: 'prod-3',
        name: 'Saffron Noir Pour',
        slug: 'saffron-noir-pour',
        category: 'Perfume',
        price: 2899,
        discount: 20,
        stock: 18,
        rating: 5.0,
        image: '/images/perfume-2.jpg',
        featured: true,
        description: 'An opulent fragrance designed for evening elegance and signature presence.',
        notes: ['Saffron', 'Leather', 'Patchouli', 'Black Pepper']
      },
      {
        id: 'prod-4',
        name: 'Musk Charisma',
        slug: 'musk-charisma',
        category: 'Perfume',
        price: 1899,
        discount: 15,
        stock: 41,
        rating: 4.7,
        image: '/images/perfume-3.jpg',
        featured: false,
        description: 'Clean musk with creamy sandalwood and fresh citruses for everyday luxury.',
        notes: ['Musk', 'Sandalwood', 'Bergamot', 'Tea']
      },
      {
        id: 'prod-5',
        name: 'Faham Gold Attar',
        slug: 'faham-gold-attar',
        category: 'Attar',
        price: 1699,
        discount: 10,
        stock: 26,
        rating: 4.8,
        image: '/images/attar-2.jpg',
        featured: false,
        description: 'Intense, earthy notes with earthy woods and a refined soft spice trail.',
        notes: ['Faham', 'Cedar', 'Cardamom', 'Civet']
      },
      {
        id: 'prod-6',
        name: 'Cedar Bloom',
        slug: 'cedar-bloom',
        category: 'Perfume',
        price: 2499,
        discount: 17,
        stock: 14,
        rating: 4.9,
        image: '/images/perfume-4.jpg',
        featured: true,
        description: 'Fresh cedarwood and blooming florals wrapped in polished amber warmth.',
        notes: ['Cedarwood', 'Peony', 'Amber', 'Jasmine']
      }
    ], null, 2));
  }

  if (!fs.existsSync(COUPON_PATH)) {
    fs.writeFileSync(COUPON_PATH, JSON.stringify([
      { code: 'RICH10', type: 'percent', value: 10, active: true },
      { code: 'ATTAR20', type: 'percent', value: 20, active: true },
      { code: 'WELCOME15', type: 'percent', value: 15, active: true }
    ], null, 2));
  }

  if (!fs.existsSync(ORDER_PATH)) {
    fs.writeFileSync(ORDER_PATH, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({
      siteName: 'Richnixelaroma',
      supportPhone: '+91 9099401987',
      upiId: process.env.UPI_ID || 'Creationlofi777@oksbi',
      codEnabled: true,
      gujaratOnly: true,
      tagline: 'Premium perfumes and attars curated with luxury, heritage, and elegance.'
    }, null, 2));
  }
}

function readJson(filePath, fallback) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getProducts() {
  return readJson(PROD_PATH, []);
}

function getCoupons() {
  return readJson(COUPON_PATH, []);
}

function getOrders() {
  return readJson(ORDER_PATH, []);
}

function getConfig() {
  let config = readJson(CONFIG_PATH, {});
  config = Object.assign({
    siteName: 'Richnixelaroma',
    supportPhone: '+91 9099401987',
    upiId: process.env.UPI_ID || 'Creationlofi777@oksbi',
    codEnabled: true,
    gujaratOnly: true,
    tagline: 'Premium perfumes and attars curated with luxury, heritage, and elegance.'
  }, config);
  return config;
}

function getCartCount(req) {
  const cart = req.session.cart || [];
  return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function formatInr(value) {
  return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function buildUpiLink(orderId, amount) {
  const upi = encodeURIComponent(process.env.UPI_ID || 'Creationlofi777@oksbi');
  const note = encodeURIComponent(`Order ${orderId}`);
  const amountFixed = Number(amount || 0).toFixed(2);
  return `upi://pay?pa=${upi}&pn=${encodeURIComponent('Richnix Perfumes')}&am=${amountFixed}&cu=INR&tn=${note}`;
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.adminLoggedIn) return next();
  res.redirect('/admin/login');
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'richnixelaroma-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  res.locals.cartCount = getCartCount(req);
  res.locals.config = getConfig();
  next();
});

app.get('/', (req, res) => {
  const products = getProducts().filter((p) => p.featured);
  res.render('index', { products, adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/products', (req, res) => {
  const products = getProducts();
  res.render('products', { products, adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/products/:slug', (req, res) => {
  const product = getProducts().find((p) => p.slug === req.params.slug);
  if (!product) return res.status(404).render('404', { adminLoggedIn: !!(req.session.adminLoggedIn) });
  res.render('product', { product, adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/cart', (req, res) => {
  res.render('cart', { adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/checkout', (req, res) => {
  res.render('checkout', { adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/support', (req, res) => {
  res.render('support', { adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.get('/order-success', (req, res) => {
  const order = getOrders().find((o) => o.id === req.query.orderId) || null;
  res.render('order-success', { order, adminLoggedIn: !!(req.session.adminLoggedIn) });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const cart = req.session.cart || [];
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.quantity += Number(quantity || 1);
  else cart.push({ id: product.id, name: product.name, price: product.price, quantity: Number(quantity || 1), image: product.image, slug: product.slug });

  req.session.cart = cart;
  res.json({ success: true, cartCount: getCartCount(req) });
});

app.post('/api/order', (req, res) => {
  const body = req.body || {};
  let cart = Array.isArray(body.cart) ? body.cart : [];

  if (!cart.length) {
    return res.status(400).json({ success: false, message: 'Your cart is empty.' });
  }

  if ((body.state || '').trim().toLowerCase() !== 'gujarat') {
    return res.status(400).json({ success: false, message: 'We accept orders only within Gujarat.' });
  }

  const productMap = new Map(getProducts().map((p) => [p.id, p]));
  const items = cart.map((item) => {
    const product = productMap.get(item.id) || null;
    const qty = Number(item.quantity || 1);
    const basePrice = Number(product ? product.price : item.price || 0);
    return {
      id: product ? product.id : item.id,
      name: product ? product.name : item.name,
      quantity: qty,
      price: basePrice,
      image: product ? product.image : item.image || '/images/default.jpg',
      slug: product ? product.slug : item.slug || ''
    };
  }).filter((item) => item.name && item.price > 0);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const couponCode = String(body.coupon || '').trim().toUpperCase();
  const coupons = getCoupons();
  const coupon = coupons.find((c) => c.code === couponCode && c.active);
  const discount = coupon ? (coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value) : 0;
  const total = Math.max(0, subtotal - discount);

  const order = {
    id: `RNX-${Date.now().toString().slice(-8)}`,
    customer: {
      name: String(body.name || '').trim(),
      phone: String(body.phone || '').trim(),
      email: String(body.email || '').trim(),
      address: String(body.address || '').trim(),
      city: String(body.city || '').trim(),
      state: String(body.state || '').trim(),
      pincode: String(body.pincode || '').trim(),
      paymentMethod: String(body.paymentMethod || 'cod').toLowerCase()
    },
    items,
    subtotal,
    discount,
    total,
    paymentMethod: String(body.paymentMethod || 'cod').toLowerCase(),
    status: String(body.paymentMethod || 'cod').toLowerCase() === 'upi' ? 'Awaiting UPI confirmation' : 'Order placed - COD',
    createdAt: new Date().toISOString(),
    paymentLink: String(body.paymentMethod || 'cod').toLowerCase() === 'upi' ? buildUpiLink(`RNX-${Date.now().toString().slice(-8)}`, total) : ''
  };

  if (!order.customer.name || !order.customer.phone || !order.customer.address || !order.customer.city || !order.customer.pincode) {
    return res.status(400).json({ success: false, message: 'Please fill all delivery details.' });
  }

  const orders = getOrders();
  orders.unshift(order);
  writeJson(ORDER_PATH, orders);
  req.session.cart = [];

  res.json({ success: true, order, message: 'Order placed successfully.' });
});

app.get('/admin/login', (req, res) => {
  res.render('admin-login', { error: null, adminLoggedIn: false });
});

app.post('/admin/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '').trim();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.adminLoggedIn = true;
    req.session.adminUser = username;
    return res.redirect('/admin');
  }

  return res.render('admin-login', { error: 'Invalid admin username or password.', adminLoggedIn: false });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

app.get('/admin', requireAdmin, (req, res) => {
  const products = getProducts();
  const orders = getOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const coupons = getCoupons();
  res.render('admin', { products, orders, coupons, adminUser: req.session.adminUser, adminLoggedIn: true });
});

app.post('/admin/site-config', requireAdmin, (req, res) => {
  const config = getConfig();
  const newConfig = {
    ...config,
    siteName: String(req.body.siteName || config.siteName).trim() || config.siteName,
    supportPhone: String(req.body.supportPhone || config.supportPhone).trim() || config.supportPhone,
    upiId: String(req.body.upiId || config.upiId).trim() || config.upiId,
    codEnabled: Boolean(req.body.codEnabled === 'on'),
    gujaratOnly: Boolean(req.body.gujaratOnly === 'on')
  };
  writeJson(CONFIG_PATH, newConfig);
  res.redirect('/admin');
});

app.post('/admin/products', requireAdmin, (req, res) => {
  const products = getProducts();
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: String(req.body.name || '').trim(),
    slug: String(req.body.slug || req.body.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    category: String(req.body.category || 'Perfume').trim(),
    price: Number(req.body.price || 0),
    discount: Number(req.body.discount || 0),
    stock: Number(req.body.stock || 0),
    image: String(req.body.image || '/images/default.jpg').trim(),
    description: String(req.body.description || '').trim(),
    notes: String(req.body.notes || '').split(',').map((n) => n.trim()).filter(Boolean),
    featured: req.body.featured === 'on'
  };

  if (!newProduct.name || !newProduct.price) return res.redirect('/admin');
  products.push(newProduct);
  writeJson(PROD_PATH, products);
  res.redirect('/admin');
});

app.post('/admin/products/:id', requireAdmin, (req, res) => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.redirect('/admin');

  products[index] = {
    ...products[index],
    name: String(req.body.name || products[index].name).trim(),
    category: String(req.body.category || products[index].category).trim(),
    price: Number(req.body.price || products[index].price),
    discount: Number(req.body.discount || products[index].discount),
    stock: Number(req.body.stock || products[index].stock),
    image: String(req.body.image || products[index].image).trim(),
    description: String(req.body.description || products[index].description).trim(),
    notes: String(req.body.notes || products[index].notes.join(', ')).split(',').map((n) => n.trim()).filter(Boolean),
    featured: req.body.featured === 'on'
  };

  writeJson(PROD_PATH, products);
  res.redirect('/admin');
});

app.post('/admin/coupons', requireAdmin, (req, res) => {
  const coupons = getCoupons();
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.redirect('/admin');

  coupons.push({
    code,
    type: req.body.type || 'percent',
    value: Number(req.body.value || 0),
    active: true
  });

  writeJson(COUPON_PATH, coupons);
  res.redirect('/admin');
});

app.post('/admin/orders/:id/status', requireAdmin, (req, res) => {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) return res.redirect('/admin');
  orders[index].status = String(req.body.status || orders[index].status).trim();
  writeJson(ORDER_PATH, orders);
  res.redirect('/admin');
});

app.use((req, res) => {
  res.status(404).render('404', { adminLoggedIn: !!(req.session.adminLoggedIn) });
});

ensureDataFiles();
app.listen(PORT, () => {
  console.log(`Richnixelaroma server started on http://localhost:${PORT}`);
});
