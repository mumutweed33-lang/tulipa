/* =====================================================
   MAIN — TULIPA LINGERIE
   Inicialização, preloader, navbar, scroll, animações
   ===================================================== */

/* ── Preloader ── */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const bar = preloader.querySelector('.preloader__bar-fill');

  /* Anima a barra de 0 a 100% */
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(ocultarPreloader, 300);
    }
    if (bar) bar.style.width = progress + '%';
  }, 120);

  /* Fallback: oculta após 3s em todo caso */
  setTimeout(ocultarPreloader, 3000);
}

function ocultarPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader || preloader.dataset.saindo) return;
  preloader.dataset.saindo = '1';

  preloader.classList.add('preloader--saindo');
  document.body.classList.add('loaded');

  setTimeout(() => {
    preloader.style.display = 'none';
    iniciarAnimacoesHero();
  }, 900);
}

/* ── Cursor customizado ── */
function initCursor() {
  /* Só para desktop */
  if ('ontouchstart' in window || window.innerWidth < 1024) return;

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.transform = `translate(${tx}px, ${ty}px)`;
  });

  /* Ring segue com delay suave */
  const tick = () => {
    rx += (tx - rx) * 0.14;
    ry += (ty - ry) * 0.14;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* Efeito hover em elementos clicáveis */
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a, button, [role="button"], .product-card');
    if (link) {
      dot.classList.add('cursor-hover');
      ring.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const link = e.target.closest('a, button, [role="button"], .product-card');
    if (link) {
      dot.classList.remove('cursor-hover');
      ring.classList.remove('cursor-hover');
    }
  });

  document.addEventListener('mousedown', () => {
    dot.classList.add('cursor-click');
    ring.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('cursor-click');
    ring.classList.remove('cursor-click');
  });
}

/* ── Smooth Scroll com Lenis ── */
function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
    smoothTouch: false,
  });

  /* Conecta ao GSAP ticker para precisão */
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  window._lenis = lenis;
}

/* ── Navbar ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    /* Adiciona classe "scrolled" após 80px */
    navbar.classList.toggle('navbar--scrolled', y > 80);

    /* Oculta ao scrollar para baixo, mostra ao subir */
    if (y > lastY + 5 && y > 200) {
      navbar.classList.add('navbar--hidden');
    } else if (y < lastY - 5) {
      navbar.classList.remove('navbar--hidden');
    }

    lastY = y;
  }, { passive: true });
}

/* ── Menu mobile ── */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => toggleMenu());
  overlay?.addEventListener('click', () => fecharMenu());

  /* Fecha ao clicar em qualquer link do menu */
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', fecharMenu);
  });

  /* Fecha com ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharMenu();
  });

  function toggleMenu() {
    const isOpen = menu.classList.contains('menu-open');
    isOpen ? fecharMenu() : abrirMenu();
  }

  function abrirMenu() {
    menu.classList.add('menu-open');
    overlay?.classList.add('active');
    toggle.classList.add('menu-toggle--open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function fecharMenu() {
    menu.classList.remove('menu-open');
    overlay?.classList.remove('active');
    toggle.classList.remove('menu-toggle--open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ── Marquee infinito ── */
function initMarquee() {
  const marquees = document.querySelectorAll('.marquee-inner');
  marquees.forEach(m => {
    /* Clona o conteúdo para loop contínuo */
    const clone = m.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    m.parentElement.appendChild(clone);
  });
}

/* ── Animações do Hero com GSAP ── */
function iniciarAnimacoesHero() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ delay: 0.1 });

  /* Eyebrow */
  tl.from('.hero-eyebrow', {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out'
  });

  /* Título — split por palavras */
  const h1 = document.querySelector('.hero-title');
  if (h1) {
    const palavras = h1.innerHTML.split(' ').map(w =>
      `<span class="word-wrap" style="overflow:hidden;display:inline-block;"><span class="word-inner" style="display:inline-block">${w}</span></span>`
    );
    h1.innerHTML = palavras.join(' ');

    tl.from('.word-inner', {
      y: '110%',
      opacity: 0,
      duration: 1,
      stagger: 0.06,
      ease: 'power4.out'
    }, '-=0.4');
  }

  /* Subtítulo e CTAs */
  tl.from('.hero-subtitle', { opacity: 0, y: 25, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .from('.hero-ctas', { opacity: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .from('.scroll-indicator', { opacity: 0, duration: 0.5 }, '-=0.3');
}

/* ── ScrollTrigger para seções ── */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    /* Fallback simples via IntersectionObserver */
    observeElements('.reveal-up', el => el.classList.add('revealed'));
    observeElements('.reveal-fade', el => el.classList.add('revealed'));
    observeElements('.section-title', el => el.classList.add('revealed'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Reveal genérico */
  gsap.utils.toArray('.reveal-up').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      y: 60, opacity: 0, duration: 0.9, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.reveal-fade').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      opacity: 0, duration: 1.1, ease: 'power2.out'
    });
  });

  /* Títulos de seção */
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      y: 40, opacity: 0, duration: 1, ease: 'power3.out'
    });
  });

  /* Seção editorial — imagem com clip-path */
  const editorialImg = document.querySelector('.editorial__main-img');
  if (editorialImg) {
    gsap.from(editorialImg, {
      scrollTrigger: { trigger: editorialImg, start: 'top 80%', once: true },
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.2, ease: 'power4.out'
    });
  }
}

/* ── Scroll indicator ── */
function initScrollIndicator() {
  const indicator = document.querySelector('.scroll-indicator');
  if (!indicator) return;

  window.addEventListener('scroll', () => {
    indicator.style.opacity = window.scrollY > 150 ? '0' : '1';
  }, { passive: true });
}

/* ── Newsletter ── */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');
    const email = input?.value.trim();

    if (!email || !validarEmail(email)) {
      showToast('Por favor, insira um e-mail válido.', 'error');
      input?.focus();
      return;
    }

    /* Feedback visual */
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    setTimeout(() => {
      form.innerHTML = `
        <div class="newsletter-success">
          <span class="newsletter-success__icon">🌷</span>
          <h3>Seu cupom está a caminho!</h3>
          <p>Verifique sua caixa de entrada em <strong>${email}</strong></p>
        </div>
      `;
      dispararConfete();
    }, 1200);
  });
}

/* ── Inicializa tudo ── */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCursor();
  initLenis();
  initNavbar();
  initMobileMenu();
  initMarquee();
  initScrollAnimations();
  initScrollIndicator();
  initNewsletter();
  Cart.atualizarBadge();

  /* Inicia Three.js se o canvas existir */
  if (document.getElementById('particles-canvas') && typeof THREE !== 'undefined') {
    window._particles = new TulipParticles('particles-canvas');
  }

  /* Inicia catálogo se o grid existir */
  if (document.getElementById('product-grid')) {
    Catalog.init();
  }

  /* Inicializa ícones Lucide */
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
