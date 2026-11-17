const express = require('express');
const path = require('path');
const session = require('express-session');
const { config } = require('./config');
const { getConfig } = require('./data/store');
const { createRateLimiter, securityHeaders, sameOrigin } = require('./middleware/security');
const storefrontRoutes = require('./routes/storefront');
const adminRoutes = require('./routes/admin');

function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('trust proxy', config.trustProxy);

  app.use(securityHeaders);
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use(express.json({ limit: '20kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public'), { dotfiles: 'deny', maxAge: config.isProduction ? '1d' : 0 }));
  app.use(session({
    name: 'rnx.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    }
  }));

  app.use((req, res, next) => {
    if (!Array.isArray(req.session.cart)) req.session.cart = [];
    res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    res.locals.config = getConfig();
    next();
  });

  app.use('/', storefrontRoutes);
  app.use('/admin', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, key: (req) => `${req.ip}:admin` }), sameOrigin, adminRoutes);
  app.use((req, res) => res.status(404).render('404', { adminLoggedIn: !!req.session.adminLoggedIn }));
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    const status = error.status || 500;
    if (req.path.startsWith('/api/')) return res.status(status).json({ success: false, message: status === 500 ? 'An unexpected error occurred.' : error.message });
    res.status(status).send(status === 500 ? 'An unexpected error occurred.' : error.message);
  });
  return app;
}

module.exports = { createApp };
