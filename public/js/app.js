:root {
  --bg-dark: #120d0b;
  --bg-deep: #1d1512;
  --panel: rgba(31, 24, 21, 0.9);
  --panel-soft: rgba(255,255,255,0.03);
  --gold: #d8b17a;
  --gold-deep: #b78753;
  --gold-soft: rgba(216,177,122,0.15);
  --line: rgba(216,177,122,0.18);
  --text: #f8f3ed;
  --muted: #ddc7ad;
  --shadow: rgba(0,0,0,0.24);
  --error: #f4c3c3;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top, rgba(184,135,83,0.12), transparent 25%),
    linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-deep) 100%);
  line-height: 1.6;
}

a { color: inherit; text-decoration: none; }
img { max-width: 100%; display: block; }
button, input, select, textarea { font: inherit; }

.container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(12, 9, 8, 0.75);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--line);
}

.navbar {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--gold), var(--gold-deep));
  color: #1e120d;
  box-shadow: 0 12px 22px rgba(183,135,83,0.2);
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  color: var(--muted);
}

.nav-links a { transition: color 0.2s ease; }
.nav-links a:hover { color: var(--text); }

.action-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 24px rgba(0,0,0,0.18);
}

.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-deep));
  border-color: transparent;
  color: #1c130e;
  font-weight: 700;
}

.btn-secondary {
  background: rgba(255,255,255,0.02);
}

.btn-ghost {
  background: rgba(255,255,255,0.01);
  color: var(--muted);
}

.hero {
  padding: 5rem 0 3.5rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  align-items: center;
}

.kicker {
  display: inline-block;
  padding: 0.48rem 0.8rem;
  border-radius: 999px;
  background: var(--gold-soft);
  color: var(--gold);
  border: 1px solid var(--line);
  letter-spacing: 0.13rem;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.hero h1 {
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.94;
  letter-spacing: -0.07em;
  margin: 1rem 0;
}

.hero p {
  color: var(--muted);
  font-size: 1.06rem;
  max-width: 620px;
}

.hero-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.trust-row {
  margin-top: 1.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12rem;
  font-size: 0.72rem;
}

.hero-visual {
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottle-card {
  position: relative;
  width: min(360px, 78%);
  aspect-ratio: 0.75;
  border-radius: 32px 32px 42px 42px;
  background: linear-gradient(145deg, rgba(216,177,122,0.14), rgba(39,28,23,0.95));
  border: 1px solid var(--line);
  box-shadow: 0 30px 60px rgba(0,0,0,0.26);
}

.bottle-card::before {
  content: '';
  position: absolute;
  inset: 18% 20% 12% 20%;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(38,28,23,0.12));
  border: 1px solid rgba(216,177,122,0.24);
}

.bottle-card::after {
  content: '';
  position: absolute;
  left: 26%;
  top: 8%;
  width: 48%;
  height: 20%;
  border-radius: 20px 20px 10px 10px;
  background: linear-gradient(180deg, #f3dfb0, #d3a364);
  box-shadow: 0 16px 26px rgba(216,177,122,0.25);
}

.pill {
  position: absolute;
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(18,13,11,0.8);
  color: var(--gold);
  font-size: 0.7rem;
  letter-spacing: 0.12rem;
  text-transform: uppercase;
}

.pill-top { top: 15%; right: 6%; }
.pill-bottom { bottom: 15%; left: 6%; }

.section { padding: 3rem 0; }

.section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-head h2 {
  margin: 0.8rem 0 0;
  font-size: clamp(2rem, 3vw, 3.1rem);
  letter-spacing: -0.05em;
}

.section-head p {
  margin: 0;
  color: var(--muted);
  max-width: 560px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
}

.product-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 36px rgba(0,0,0,0.12);
}

.product-image {
  position: relative;
  height: 220px;
  background: linear-gradient(135deg, rgba(216,177,122,0.12), rgba(115,87,62,0.4));
}

.product-image::before {
  content: '';
  position: absolute;
  inset: 20% 24% 18% 24%;
  border-radius: 18px;
  border: 1px solid rgba(216,177,122,0.18);
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(25,18,17,0.1));
}

.product-body {
  padding: 1.2rem 1.2rem 1.35rem;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
}

.product-body h3 {
  margin: 0.8rem 0 0.6rem;
  font-size: 1.4rem;
}

.product-body p {
  margin: 0;
  color: var(--muted);
  min-height: 54px;
}

.product-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price {
  font-size: 1.3rem;
  font-weight: 700;
}

.old-price {
  color: rgba(255,255,255,0.5);
  text-decoration: line-through;
  font-size: 0.8rem;
}

.add-btn {
  border: 0;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: linear-gradient(135deg, var(--gold), var(--gold-deep));
  color: #1d120d;
  font-weight: 700;
  cursor: pointer;
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.story-box,
.info-box,
.mini-card,
.summary-box,
.form-area,
.admin-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 18px 40px rgba(0,0,0,0.1);
}

.story-box h3,
.info-box h3,
.mini-card h3,
.summary-box h3,
.form-area h3,
.admin-panel h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  display: grid;
  gap: 0.7rem;
  color: var(--muted);
}

.feature-band {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.feature-pill {
  padding: 1rem;
  border-radius: 18px;
  background: var(--panel-soft);
  border: 1px solid var(--line);
}

.feature-pill strong {
  display: block;
  color: var(--gold);
  font-size: 1.3rem;
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.quote {
  padding: 1.3rem;
  border-radius: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
}

.quote p { margin-top: 0; color: var(--muted); }
.quote strong { margin-top: 0.8rem; display: block; }

.newsletter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--line);
  background: linear-gradient(135deg, rgba(216,177,122,0.08), rgba(27,20,18,0.92));
}

.newsletter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.input,
.select,
.textarea {
  width: 100%;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--line);
  color: var(--text);
  border-radius: 12px;
  padding: 0.82rem 1rem;
}

.inline-input { min-width: 220px; }

.page-hero {
  padding: 3.5rem 0 1.5rem;
}

.page-hero h1 {
  margin: 0.8rem 0 0;
  font-size: clamp(2.4rem, 4vw, 4rem);
  letter-spacing: -0.05em;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-grid label, .admin-panel label {
  display: block;
}

.form-grid label span {
  display: inline-block;
  margin-bottom: 0.45rem;
  color: var(--muted);
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.2rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--line);
}

.cart-thumb {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(216,177,122,0.18), rgba(77,58,48,0.7));
}

.cart-totals {
  margin-top: 1rem;
  display: grid;
  gap: 0.7rem;
}

.total-line {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.admin-shell { padding: 2rem 0 4rem; }

.admin-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.order-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
}

.order-list li {
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--line);
}

.order-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.3rem;
}

.site-footer {
  border-top: 1px solid var(--line);
  padding: 1.8rem 0 2.5rem;
  color: var(--muted);
}

.footer-grid {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  background: rgba(18,13,11,0.96);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 999;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(-6px);
}

@media (max-width: 920px) {
  .hero-grid,
  .story-grid,
  .products-grid,
  .testimonials,
  .checkout-layout,
  .support-grid,
  .admin-grid,
  .feature-band {
    grid-template-columns: 1fr;
  }

  .section-head {
    display: grid;
    align-items: flex-start;
  }

  .navbar {
    flex-wrap: wrap;
    padding: 0.8rem 0;
  }

  .nav-links {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-top: 4rem;
  }

  .hero-actions,
  .newsletter {
    display: grid;
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
