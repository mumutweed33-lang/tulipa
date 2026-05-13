/* =====================================================
   UTILITÁRIOS — TULIPA LINGERIE
   Funções auxiliares compartilhadas entre os módulos
   ===================================================== */

/**
 * Formata valor numérico em BRL
 */
function formatPrice(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formata parcelas de produto
 */
function formatParcelas(preco, parcelas) {
  const valor = (preco / parcelas).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  return `${parcelas}x de ${valor} sem juros`;
}

/**
 * Debounce: limita frequência de chamadas
 */
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle: garante no máximo 1 chamada por intervalo
 */
function throttle(fn, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Gera SVG placeholder baseado na cor do produto
 */
function gerarPlaceholderSvg(produto) {
  const cores = COR_GRADIENTES[produto.cor[0]] || ['#6B0F1A', '#E8C5C0'];
  const [c1, c2] = cores;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <text x="200" y="230" font-family="serif" font-size="64" text-anchor="middle" fill="rgba(255,255,255,0.25)">🌷</text>
    <text x="200" y="300" font-family="Georgia,serif" font-size="18" font-style="italic" text-anchor="middle" fill="rgba(255,255,255,0.5)">${produto.nome}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/**
 * Retorna classe CSS de cor para swatch
 */
function corParaHex(cor) {
  const mapa = {
    vermelho: '#C41E3A',
    branco: '#F8F4F0',
    preto: '#1A1818',
    azul: '#4A6FA5',
    lila: '#B39DDB',
    coral: '#E8856A',
    nude: '#D4A5A0',
    rosa: '#F48FB1',
    bordo: '#800020',
  };
  return mapa[cor] || '#999';
}

/**
 * Retorna label legível para cor
 */
function corLabel(cor) {
  const mapa = {
    vermelho: 'Vermelho',
    branco: 'Branco',
    preto: 'Preto',
    azul: 'Azul',
    lila: 'Lilás',
    coral: 'Coral',
    nude: 'Nude',
    rosa: 'Rosa',
    bordo: 'Bordô',
  };
  return mapa[cor] || cor;
}

/**
 * Gera HTML de swatches de cor
 */
function renderSwatches(cores, selected = null) {
  return cores.map(cor => `
    <button
      class="color-swatch ${selected === cor ? 'active' : ''}"
      style="--swatch-color: ${corParaHex(cor)}"
      data-cor="${cor}"
      aria-label="Cor ${corLabel(cor)}"
      title="${corLabel(cor)}"
    ></button>
  `).join('');
}

/**
 * Gera HTML de seletores de tamanho
 */
function renderTamanhos(tamanhos, selected = null) {
  return tamanhos.map(t => `
    <button
      class="size-btn ${selected === t ? 'active' : ''}"
      data-tamanho="${t}"
      aria-label="Tamanho ${t}"
    >${t}</button>
  `).join('');
}

/**
 * Gerencia favoritos no localStorage
 */
const Favoritos = {
  key: 'tulipa_favoritos',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch {
      return [];
    }
  },

  toggle(id) {
    const favs = this.getAll();
    const idx = favs.indexOf(id);
    if (idx === -1) {
      favs.push(id);
    } else {
      favs.splice(idx, 1);
    }
    localStorage.setItem(this.key, JSON.stringify(favs));
    return idx === -1; /* true = adicionado */
  },

  has(id) {
    return this.getAll().includes(id);
  }
};

/**
 * Exibe toast de notificação
 */
function showToast(mensagem, tipo = 'success', duracao = 3000) {
  const existing = document.querySelector('.toast-container');
  if (!existing) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.innerHTML = `
    <span class="toast__icon">${tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast__msg">${mensagem}</span>
  `;

  document.querySelector('.toast-container').appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
  });

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, duracao);
}

/**
 * Anima contador de número
 */
function animateCounter(el, from, to, duration = 1000) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/**
 * IntersectionObserver para lazy-load de seções
 */
function observeElements(selector, callback, options = {}) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, ...options });

  els.forEach(el => observer.observe(el));
}

/**
 * Confete dourado para newsletter
 */
function dispararConfete() {
  const colors = ['#C9A961', '#E8D4A8', '#6B0F1A', '#FAF7F2', '#E8C5C0'];
  const canvas = document.createElement('canvas');
  canvas.className = 'confete-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    va: (Math.random() - 0.5) * 0.2,
    opacity: 1
  }));

  let frame = 0;
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.va;
      p.opacity = Math.max(0, 1 - frame / 160);
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      ctx.restore();
    });
    if (frame < 180) requestAnimationFrame(loop);
    else canvas.remove();
  };
  requestAnimationFrame(loop);
}

/**
 * Valida e-mail simples
 */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Cria imagem com fallback de placeholder
 */
function criarImgComFallback(produto, classes = '') {
  const placeholder = gerarPlaceholderSvg(produto);
  return `<img
    src="${produto.img}"
    alt="${produto.nome}"
    class="${classes}"
    loading="lazy"
    onerror="this.onerror=null;this.src='${placeholder}'"
  >`;
}

/**
 * Scroll suave até elemento
 */
function scrollTo(seletor) {
  const el = document.querySelector(seletor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
