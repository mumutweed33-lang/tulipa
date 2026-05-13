/* =====================================================
   CARRINHO — TULIPA LINGERIE
   Gerenciamento de sacola com localStorage
   ===================================================== */

const Cart = (() => {
  const STORAGE_KEY = 'tulipa_cart';
  const CUPONS = {
    'TULIPA10': { tipo: 'percent', valor: 10, descricao: '10% de desconto' },
    'AMOR15':   { tipo: 'percent', valor: 15, descricao: '15% de desconto' },
    'PRIMEIRACOMPRA': { tipo: 'fixed', valor: 20, descricao: 'R$20 de desconto' },
  };

  let itens = [];
  let cuponAtivo = null;
  let freteInfo = { calculado: false, valor: 0, prazo: '' };

  /* ── Persistência ── */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      itens = raw ? JSON.parse(raw) : [];
    } catch {
      itens = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    atualizarBadge();
  }

  /* ── Operações ── */
  function addItem(produto, opcoes = {}) {
    const { cor, tamanho, quantidade = 1 } = opcoes;
    const key = `${produto.id}-${cor}-${tamanho}`;
    const existente = itens.find(i => i.key === key);

    if (existente) {
      existente.quantidade += quantidade;
    } else {
      itens.push({
        key,
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        img: produto.img,
        cor: cor || produto.cor[0],
        tamanho: tamanho || produto.tamanhos[0],
        quantidade,
      });
    }

    save();
    showToast(`"${produto.nome}" adicionado à sacola 🌷`);
    return true;
  }

  function removeItem(key) {
    itens = itens.filter(i => i.key !== key);
    save();
  }

  function updateQty(key, delta) {
    const item = itens.find(i => i.key === key);
    if (!item) return;
    item.quantidade = Math.max(1, item.quantidade + delta);
    save();
  }

  function setQty(key, qty) {
    const item = itens.find(i => i.key === key);
    if (!item) return;
    const q = parseInt(qty);
    if (q < 1) { removeItem(key); return; }
    item.quantidade = q;
    save();
  }

  function clear() {
    itens = [];
    cuponAtivo = null;
    freteInfo = { calculado: false, valor: 0, prazo: '' };
    save();
  }

  /* ── Totais ── */
  function getSubtotal() {
    return itens.reduce((s, i) => s + i.preco * i.quantidade, 0);
  }

  function getDesconto() {
    if (!cuponAtivo) return 0;
    const sub = getSubtotal();
    if (cuponAtivo.tipo === 'percent') return sub * (cuponAtivo.valor / 100);
    return Math.min(cuponAtivo.valor, sub);
  }

  function getFrete() {
    if (!freteInfo.calculado) return null;
    const sub = getSubtotal() - getDesconto();
    if (sub >= 199) return 0;
    return freteInfo.valor;
  }

  function getTotal() {
    const frete = getFrete() || 0;
    return Math.max(0, getSubtotal() - getDesconto() + frete);
  }

  function getTotalItens() {
    return itens.reduce((s, i) => s + i.quantidade, 0);
  }

  /* ── Cupom ── */
  function aplicarCupom(codigo) {
    const cupon = CUPONS[codigo.toUpperCase().trim()];
    if (!cupon) return { ok: false, msg: 'Cupom inválido ou expirado.' };
    cuponAtivo = cupon;
    return { ok: true, msg: `Cupom aplicado: ${cupon.descricao}!` };
  }

  function removerCupom() {
    cuponAtivo = null;
  }

  /* ── Frete simulado ── */
  function calcularFrete(cep) {
    return new Promise((resolve) => {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        resolve({ ok: false, msg: 'CEP inválido.' });
        return;
      }

      /* Simula consulta à API (valores fixos por região) */
      setTimeout(() => {
        const prefix = parseInt(cepLimpo.substring(0, 2));
        let valor = 19.90;
        let prazo = '5 a 8 dias úteis';

        if (prefix >= 70 && prefix <= 73) {
          /* Brasília/DF */
          valor = 9.90;
          prazo = '2 a 3 dias úteis';
        } else if (prefix >= 1 && prefix <= 19) {
          /* São Paulo */
          valor = 14.90;
          prazo = '3 a 5 dias úteis';
        } else if (prefix >= 20 && prefix <= 28) {
          /* Rio de Janeiro */
          valor = 16.90;
          prazo = '4 a 6 dias úteis';
        }

        freteInfo = { calculado: true, valor, prazo };
        resolve({ ok: true, valor, prazo });
      }, 800);
    });
  }

  /* ── Badge do navbar ── */
  function atualizarBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const total = getTotalItens();
    badges.forEach(b => {
      b.textContent = total;
      b.style.display = total > 0 ? 'flex' : 'none';
    });
  }

  /* ── Getters ── */
  function getItens() { return [...itens]; }
  function getCupon() { return cuponAtivo; }
  function getFreteInfo() { return freteInfo; }

  /* Inicializa ao importar */
  load();

  return {
    addItem, removeItem, updateQty, setQty, clear,
    getItens, getTotalItens, getSubtotal, getDesconto,
    getFrete, getTotal, getCupon, getFreteInfo,
    aplicarCupom, removerCupom, calcularFrete,
    atualizarBadge, save, load
  };
})();

/* ── Renderização do carrinho ── */
function renderCartPage() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  if (!container) return;

  const itens = Cart.getItens();

  if (itens.length === 0) {
    emptyState && (emptyState.style.display = 'flex');
    cartContent && (cartContent.style.display = 'none');
    return;
  }

  emptyState && (emptyState.style.display = 'none');
  cartContent && (cartContent.style.display = 'grid');

  /* Lista de itens */
  container.innerHTML = itens.map(item => {
    const placeholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150"><rect width="120" height="150" fill="#E8C5C0"/><text x="60" y="80" text-anchor="middle" font-size="30" fill="white">🌷</text></svg>`
    )}`;
    return `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item__img">
        <img src="${item.img}" alt="${item.nome}" loading="lazy"
          onerror="this.onerror=null;this.src='${placeholder}'">
      </div>
      <div class="cart-item__info">
        <h4 class="cart-item__name">${item.nome}</h4>
        <p class="cart-item__meta">
          <span class="cart-item__color" style="--c:${corParaHex(item.cor)}"></span>
          ${corLabel(item.cor)} · Tamanho ${item.tamanho}
        </p>
        <p class="cart-item__price">${formatPrice(item.preco)}</p>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn" onclick="Cart.updateQty('${item.key}', -1); renderCartPage()" aria-label="Diminuir quantidade">−</button>
        <span class="qty-value">${item.quantidade}</span>
        <button class="qty-btn" onclick="Cart.updateQty('${item.key}', 1); renderCartPage()" aria-label="Aumentar quantidade">+</button>
      </div>
      <div class="cart-item__total">${formatPrice(item.preco * item.quantidade)}</div>
      <button class="cart-item__remove" onclick="Cart.removeItem('${item.key}'); renderCartPage()" aria-label="Remover item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `}).join('');

  atualizarResumo();
}

function atualizarResumo() {
  const subtotalEl = document.getElementById('resumo-subtotal');
  const descontoEl = document.getElementById('resumo-desconto');
  const descontoRow = document.getElementById('resumo-desconto-row');
  const freteEl = document.getElementById('resumo-frete');
  const totalEl = document.getElementById('resumo-total');

  const subtotal = Cart.getSubtotal();
  const desconto = Cart.getDesconto();
  const frete = Cart.getFrete();

  subtotalEl && (subtotalEl.textContent = formatPrice(subtotal));

  if (desconto > 0) {
    descontoEl && (descontoEl.textContent = `− ${formatPrice(desconto)}`);
    descontoRow && (descontoRow.style.display = 'flex');
  } else {
    descontoRow && (descontoRow.style.display = 'none');
  }

  if (frete === null) {
    freteEl && (freteEl.textContent = 'Calcule no campo acima');
  } else if (frete === 0) {
    freteEl && (freteEl.innerHTML = '<span class="frete-gratis">GRÁTIS 🎉</span>');
  } else {
    freteEl && (freteEl.textContent = formatPrice(frete));
  }

  totalEl && (totalEl.textContent = formatPrice(Cart.getTotal()));
}
