/* ══════════════════════════════════════════════
   PAGE LOADER
   ══════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hide');
  }, 1400);
});


/* ══════════════════════════════════════════════
   CUSTOM CURSOR
   ══════════════════════════════════════════════ */
(function () {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  })();
})();


/* ══════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ══════════════════════════════════════════════ */
const progress = document.getElementById('progress');
const nav      = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const total = document.body.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = (window.scrollY / total * 100) + '%';
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});


/* ══════════════════════════════════════════════
   HAMBURGER / MOBILE MENU
   ══════════════════════════════════════════════ */
const ham    = document.getElementById('hamburger');
const mobNav = document.getElementById('mobile-menu');

if (ham && mobNav) {
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    mobNav.classList.toggle('open');
  });
  mobNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      mobNav.classList.remove('open');
    });
  });
}


/* ══════════════════════════════════════════════
   MARKET CANVAS — hero background
   Animated financial data streams + particle net
   ══════════════════════════════════════════════ */
(function initMarketCanvas() {
  const canvas = document.getElementById('market-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  let mouse = { x: -9999, y: -9999 };

  // --- Data particles ---
  const PARTICLES = [];
  const P_COUNT_BASE = 55;
  const MAX_LINK = 180;

  // --- Price line streams ---
  const STREAMS = [];
  const S_COUNT = 5;

  function resize() {
    const hero = document.getElementById('hero');
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    buildStreams();
  }

  class Particle {
    constructor(init) {
      this.reset(init);
    }
    reset(init) {
      this.x   = Math.random() * W;
      this.y   = init ? Math.random() * H : -10;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = (Math.random() - 0.5) * 0.35;
      this.r   = Math.random() * 1.8 + 0.8;
      this.a   = Math.random() * 0.4 + 0.15;
    }
    update() {
      const dx   = mouse.x - this.x;
      const dy   = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 200 && dist > 0) {
        const f = ((200 - dist) / 200) * 0.012;
        this.vx += (dx / dist) * f;
        this.vy += (dy / dist) * f;
      }
      this.vx += (Math.random() - 0.5) * 0.008;
      this.vy += (Math.random() - 0.5) * 0.008;
      this.vx *= 0.992;
      this.vy *= 0.992;
      const speed = Math.hypot(this.vx, this.vy);
      if (speed < 0.08) {
        this.vx += (Math.random() - 0.5) * 0.04;
        this.vy += (Math.random() - 0.5) * 0.04;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.a})`;
      ctx.fill();
    }
  }

  // A flowing price-line stream
  class PriceLine {
    constructor(idx) {
      this.idx     = idx;
      this.y       = 0;
      this.points  = [];
      this.color   = idx % 2 === 0 ? '201,168,76' : '79,122,248';
      this.alpha   = 0.07 + Math.random() * 0.06;
      this.speed   = 0.4 + Math.random() * 0.5;
      this.phase   = Math.random() * Math.PI * 2;
      this.amp     = 20 + Math.random() * 40;
      this.freq    = 0.003 + Math.random() * 0.004;
      this.generate();
    }
    generate() {
      this.points = [];
      this.y = (H / S_COUNT) * this.idx + H / (S_COUNT * 2);
      const steps = Math.ceil(W / 6) + 2;
      let lastVal = 0;
      for (let i = 0; i < steps; i++) {
        const x = i * 6;
        lastVal += (Math.random() - 0.49) * 5;
        lastVal = Math.max(-80, Math.min(80, lastVal));
        this.points.push({ x, raw: lastVal });
      }
    }
    update() {
      this.phase += this.speed * 0.012;
      // Shift left
      this.points.forEach(p => p.x -= this.speed);
      if (this.points[0].x < -20) {
        this.points.shift();
        const lastPt  = this.points[this.points.length - 1];
        const newRaw  = lastPt.raw + (Math.random() - 0.49) * 5;
        this.points.push({ x: lastPt.x + 6, raw: Math.max(-80, Math.min(80, newRaw)) });
      }
    }
    draw() {
      if (this.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.y + this.points[0].raw * 0.35);
      for (let i = 1; i < this.points.length; i++) {
        const p0 = this.points[i - 1];
        const p1 = this.points[i];
        const mx  = (p0.x + p1.x) / 2;
        const my0 = this.y + p0.raw * 0.35;
        const my1 = this.y + p1.raw * 0.35;
        ctx.quadraticCurveTo(p0.x, my0, mx, (my0 + my1) / 2);
      }
      ctx.strokeStyle = `rgba(${this.color},${this.alpha})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    }
  }

  function buildStreams() {
    STREAMS.length = 0;
    for (let i = 0; i < S_COUNT; i++) STREAMS.push(new PriceLine(i));
  }

  function buildParticles() {
    PARTICLES.length = 0;
    const count = Math.floor(P_COUNT_BASE * (W / 1440) + 25);
    for (let i = 0; i < count; i++) PARTICLES.push(new Particle(true));
  }

  function drawLinks() {
    for (let i = 0; i < PARTICLES.length; i++) {
      for (let j = i + 1; j < PARTICLES.length; j++) {
        const d = Math.hypot(PARTICLES[i].x - PARTICLES[j].x, PARTICLES[i].y - PARTICLES[j].y);
        if (d < MAX_LINK) {
          const a = (1 - d / MAX_LINK) * 0.18;
          ctx.beginPath();
          ctx.moveTo(PARTICLES[i].x, PARTICLES[i].y);
          ctx.lineTo(PARTICLES[j].x, PARTICLES[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${a})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseConnections() {
    PARTICLES.forEach(p => {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < 200) {
        const a = (1 - d / 200) * 0.55;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(201,168,76,${a})`;
        ctx.lineWidth   = 1.2;
        ctx.stroke();
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    STREAMS.forEach(s => { s.update(); s.draw(); });
    drawLinks();
    drawMouseConnections();
    PARTICLES.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  hero.addEventListener('touchmove', e => {
    const rect = canvas.getBoundingClientRect();
    const t    = e.touches[0];
    mouse.x    = t.clientX - rect.left;
    mouse.y    = t.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', () => { resize(); buildParticles(); });
  resize();
  buildParticles();
  animate();
})();


/* ══════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ══════════════════════════════════════════════
   ANIMATE SKILL BARS ON REVEAL
   ══════════════════════════════════════════════ */
const skillBarObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sk-bar div').forEach(bar => {
        bar.style.width = bar.parentElement.previousElementSibling ? '' : bar.style.width;
        // Trigger reflow & animate
        const w = bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = w; }, 50);
        });
      });
      skillBarObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

const skillsEl = document.querySelector('.skills-cols');
if (skillsEl) skillBarObs.observe(skillsEl);


/* ══════════════════════════════════════════════
   ANIMATE IMPACT PROGRESS BARS ON REVEAL
   ══════════════════════════════════════════════ */
const impactObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.ic-bar-fill');
      if (fill) {
        const target = fill.style.width;
        fill.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => { fill.style.width = target; }, 100);
        });
      }
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.impact-card').forEach(c => impactObs.observe(c));


/* ══════════════════════════════════════════════
   HERO COUNTER ANIMATION
   ══════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1600, delay = 0) {
  setTimeout(() => {
    const start = Date.now();
    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  }, delay);
}

// Run counters after loader
setTimeout(() => {
  document.querySelectorAll('.h-stat-num[data-target]').forEach((el, i) => {
    const target = parseInt(el.dataset.target, 10);
    animateCounter(el, target, 1800, 1400 + i * 200);
  });
}, 100);


/* ══════════════════════════════════════════════
   3D CARD TILT
   ══════════════════════════════════════════════ */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const x      = (e.clientX - rect.left) / rect.width  - 0.5;
    const y      = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ══════════════════════════════════════════════
   CONTACT FORM — EmailJS
   ══════════════════════════════════════════════ */
const EMAILJS_CONFIG = {
  serviceID:  'YOUR_SERVICE_ID',
  templateID: 'YOUR_TEMPLATE_ID',
  publicKey:  'YOUR_PUBLIC_KEY'
};

(function () {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
})();

function sendMsg() {
  const name    = document.getElementById('fn')?.value.trim();
  const email   = document.getElementById('fe')?.value.trim();
  const subject = document.getElementById('fs')?.value.trim();
  const msg     = document.getElementById('fm')?.value.trim();

  if (!name || !email || !msg) {
    alert('Please fill in name, email and message.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const btn = document.querySelector('.cf-send');
  const originalText = btn.innerHTML;
  btn.disabled    = true;
  btn.innerHTML   = 'Sending…';
  btn.style.opacity = '0.6';

  emailjs.send(
    EMAILJS_CONFIG.serviceID,
    EMAILJS_CONFIG.templateID,
    { from_name: name, from_email: email, subject: subject || 'Portfolio Enquiry', message: msg },
    EMAILJS_CONFIG.publicKey
  )
  .then(() => {
    const toast = document.getElementById('toast');
    if (toast) { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4000); }
    ['fn','fe','fs','fm'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    btn.disabled    = false;
    btn.innerHTML   = originalText;
    btn.style.opacity = '1';
  })
  .catch(err => {
    console.error('EmailJS error:', err);
    alert('Send failed — please email directly via LinkedIn or the address shown.');
    btn.disabled    = false;
    btn.innerHTML   = originalText;
    btn.style.opacity = '1';
  });
}
