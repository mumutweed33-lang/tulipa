/* =====================================================
   PÁGINA DE PRODUTO — TULIPA LINGERIE
   Lê ?id=N da URL e renderiza o detalhe
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id || isNaN(id)) {
    window.location.href = 'index.html#catalogo';
    return;
  }

  const produto = PRODUTOS.find(p => p.id === id);
  if (!produto) {
    document.getElementById('product-wrap').innerHTML = `
      <div class="product-not-found">
        <span>🌷</span>
        <h2>Produto não encontrado</h2>
        <a href="index.html#catalogo" class="btn btn-bordeaux">Ver catálogo</a>
      </div>
    `;
    return;
  }

  renderProduto(produto);
  renderRelacionados(produto);
  injetarSchema(produto);
});

/* ── Estado de seleção ── */
const selecao = { cor: null, tamanho: null, quantidade: 1 };

function renderProduto(p) {
  /* Breadcrumb */
  const bc = document.getElementById('breadcrumb');
  if (bc) {
    bc.innerHTML = `
      <a href="index.html">Início</a>
      <span aria-hidden="true">›</span>
      <a href="index.html#catalogo">Catálogo</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">${p.nome}</span>
    `;
  }

  /* Título da página */
  document.title = `${p.nome} — Tulipa Lingerie`;

  /* Galeria */
  selecao.cor = p.cor[0];
  selecao.tamanho = p.tamanhos[0];

  const placeholder = gerarPlaceholderSvg(p);
  const imagens = p.galeria?.length ? p.galeria : [p.img];

  const gallery = document.getElementById('product-gallery');
  if (gallery) {
    gallery.innerHTML = `
      <div class="gallery__thumbs" role="listbox" aria-label="Miniaturas do produto">
        ${imagens.map((src, index) => `
          <button class="gallery__thumb" role="option" aria-selected="false"
            onclick="selectGalleryImg(this, '${src}', '${p.nome} - vista ${index + 1}')">
            <img src="${src}" alt="${p.nome} - vista ${index + 1}" loading="lazy"
              onerror="this.onerror=null;this.src='${placeholder}'">
          </button>
        `).join('')}
      </div>
      <div class="gallery__main">
        <img id="gallery-main-img" src="${imagens[0]}" alt="${p.nome} - vista 1"
          onerror="this.onerror=null;this.src='${placeholder}'"
          class="gallery__main-img">
        <div class="gallery__zoom-hint" aria-hidden="true">Passe o mouse para ampliar</div>
      </div>
    `;
    const firstThumb = gallery.querySelector('.gallery__thumb');
    if (firstThumb) {
      firstThumb.classList.add('active');
      firstThumb.setAttribute('aria-selected', 'true');
    }
    setupGalleryZoom();
  }

  /* Informações do produto */
  const info = document.getElementById('product-info');
  if (!info) return;

  const isFav = Favoritos.has(p.id);

  info.innerHTML = `
    <div class="product-info__header">
      <span class="product-cat-tag">${p.categoria}</span>
      <button class="product-fav-btn ${isFav ? 'active' : ''}" id="prod-fav-btn"
        data-id="${p.id}" aria-label="Favoritar produto" aria-pressed="${isFav}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}"
          stroke="currentColor" stroke-width="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <h1 class="product-info__title">${p.nome}</h1>

    <div class="product-info__price-block">
      <span class="product-info__price">${formatPrice(p.preco)}</span>
      <span class="product-info__parcelas">${formatParcelas(p.preco, p.parcelas)}</span>
      <span class="product-info__pix">ou ${formatPrice(p.preco * 0.95)} no Pix (5% OFF)</span>
    </div>

    <!-- Seletor de cor -->
    <div class="product-selector" id="selector-cor">
      <label class="selector-label">
        Cor: <strong id="cor-selecionada">${corLabel(p.cor[0])}</strong>
      </label>
      <div class="color-swatches-wrap">
        ${p.cor.map(cor => `
          <button
            class="color-swatch-lg ${cor === selecao.cor ? 'active' : ''}"
            data-cor="${cor}"
            style="--sc: ${corParaHex(cor)}"
            aria-label="Cor ${corLabel(cor)}"
            aria-pressed="${cor === selecao.cor}"
          >
            <span class="swatch-dot" style="background:${corParaHex(cor)}"></span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Seletor de tamanho -->
    <div class="product-selector" id="selector-tamanho">
      <label class="selector-label">
        Tamanho: <strong id="tam-selecionado">${selecao.tamanho}</strong>
      </label>
      <div class="size-btns-wrap">
        ${p.tamanhos.map(t => `
          <button
            class="size-btn-lg ${t === selecao.tamanho ? 'active' : ''}"
            data-tamanho="${t}"
            aria-label="Tamanho ${t}"
            aria-pressed="${t === selecao.tamanho}"
          >${t}</button>
        `).join('')}
      </div>
      <button class="medidas-link" id="btn-medidas" aria-haspopup="dialog">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Tabela de medidas
      </button>
    </div>

    <!-- Quantidade -->
    <div class="product-selector">
      <label class="selector-label">Quantidade</label>
      <div class="qty-selector">
        <button class="qty-btn-lg" id="qty-minus" aria-label="Diminuir">−</button>
        <span class="qty-display" id="qty-display">1</span>
        <button class="qty-btn-lg" id="qty-plus" aria-label="Aumentar">+</button>
      </div>
    </div>

    <!-- CTAs -->
    <div class="product-ctas">
      <button class="btn btn-bordeaux btn-full" id="btn-add-cart">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
        </svg>
        Adicionar à Sacola
      </button>
      <button class="btn btn-outline-bordeaux btn-full" id="btn-buy-now">
        Comprar Agora
      </button>
    </div>

    <!-- Tags de confiança -->
    <ul class="trust-tags" aria-label="Benefícios">
      <li><span>🚚</span> Frete grátis acima de R$199</li>
      <li><span>🔄</span> Troca em 7 dias</li>
      <li><span>🔒</span> Pagamento 100% seguro</li>
      <li><span>📦</span> Despacho em 24h</li>
    </ul>

    <!-- Accordion de informações -->
    <div class="accordion" id="product-accordion">
      ${renderAccordionItem('Descrição', p.descricao, true)}
      ${renderAccordionItem('Composição', p.composicao)}
      ${renderAccordionItem('Cuidados com a peça', p.cuidados)}
      ${renderAccordionItem('Entrega e devolução', `
        Despachamos em até 24h após confirmação do pagamento.
        Prazo de entrega de 3 a 8 dias úteis dependendo da região.
        Devolução gratuita em até 7 dias após o recebimento.
      `)}
    </div>

    <!-- Link Instagram -->
    <a href="${p.instagram}" target="_blank" rel="noopener noreferrer" class="instagram-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
      </svg>
      Ver no Instagram @tulipa__lingerie
    </a>
  `;

  /* Eventos dos seletores */
  setupSeletores(p);
}

function renderAccordionItem(titulo, conteudo, aberto = false) {
  return `
    <div class="accordion-item ${aberto ? 'open' : ''}">
      <button class="accordion-trigger" aria-expanded="${aberto}">
        ${titulo}
        <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="accordion-content" ${aberto ? '' : 'style="display:none"'}>
        <p>${conteudo}</p>
      </div>
    </div>
  `;
}

function setupSeletores(p) {
  /* Cores */
  document.querySelectorAll('.color-swatch-lg').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch-lg').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      selecao.cor = btn.dataset.cor;
      const label = document.getElementById('cor-selecionada');
      if (label) label.textContent = corLabel(selecao.cor);
    });
  });

  /* Tamanhos */
  document.querySelectorAll('.size-btn-lg').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn-lg').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      selecao.tamanho = btn.dataset.tamanho;
      const label = document.getElementById('tam-selecionado');
      if (label) label.textContent = selecao.tamanho;
    });
  });

  /* Quantidade */
  document.getElementById('qty-minus')?.addEventListener('click', () => {
    selecao.quantidade = Math.max(1, selecao.quantidade - 1);
    document.getElementById('qty-display').textContent = selecao.quantidade;
  });

  document.getElementById('qty-plus')?.addEventListener('click', () => {
    selecao.quantidade = Math.min(10, selecao.quantidade + 1);
    document.getElementById('qty-display').textContent = selecao.quantidade;
  });

  /* Adicionar ao carrinho */
  document.getElementById('btn-add-cart')?.addEventListener('click', () => {
    Cart.addItem(p, { cor: selecao.cor, tamanho: selecao.tamanho, quantidade: selecao.quantidade });
    const btn = document.getElementById('btn-add-cart');
    btn.innerHTML = '✓ Adicionado à Sacola!';
    btn.classList.add('added');
    setTimeout(() => {
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg> Adicionar à Sacola';
      btn.classList.remove('added');
    }, 2000);
  });

  /* Comprar agora */
  document.getElementById('btn-buy-now')?.addEventListener('click', () => {
    Cart.addItem(p, { cor: selecao.cor, tamanho: selecao.tamanho, quantidade: selecao.quantidade });
    window.location.href = 'carrinho.html';
  });

  /* Favorito */
  document.getElementById('prod-fav-btn')?.addEventListener('click', function () {
    const id = parseInt(this.dataset.id);
    const adicionado = Favoritos.toggle(id);
    this.classList.toggle('active', adicionado);
    this.setAttribute('aria-pressed', adicionado);
    const svg = this.querySelector('path');
    if (svg) svg.setAttribute('fill', adicionado ? 'currentColor' : 'none');
    showToast(adicionado ? 'Adicionado aos favoritos ❤' : 'Removido dos favoritos', 'success');
  });

  /* Accordion */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');

      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
      content.style.display = isOpen ? 'none' : 'block';
    });
  });

  /* Modal de medidas */
  document.getElementById('btn-medidas')?.addEventListener('click', () => {
    abrirModalMedidas();
  });
}

function selectGalleryImg(thumb, src, alt) {
  document.querySelectorAll('.gallery__thumb').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  thumb.classList.add('active');
  thumb.setAttribute('aria-selected', 'true');

  const main = document.getElementById('gallery-main-img');
  if (main) {
    main.style.opacity = 0;
    setTimeout(() => {
      main.src = src;
      if (alt) main.alt = alt;
      main.style.opacity = 1;
    }, 150);
  }
}

function setupGalleryZoom() {
  const mainWrap = document.querySelector('.gallery__main');
  const mainImg = document.getElementById('gallery-main-img');
  if (!mainWrap || !mainImg) return;

  mainWrap.addEventListener('mousemove', (e) => {
    const rect = mainWrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mainImg.style.transformOrigin = `${x}% ${y}%`;
  });
}

function abrirModalMedidas() {
  const existing = document.getElementById('modal-medidas');
  if (existing) { existing.classList.add('modal-open'); return; }

  const modal = document.createElement('div');
  modal.id = 'modal-medidas';
  modal.className = 'modal modal-open';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Tabela de medidas');
  modal.innerHTML = `
    <div class="modal__backdrop" onclick="fecharModalMedidas()"></div>
    <div class="modal__box">
      <button class="modal__close" onclick="fecharModalMedidas()" aria-label="Fechar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h2 class="modal__title">Tabela de Medidas</h2>
      <p class="modal__subtitle">Meça-se antes de pedir para garantir o caimento perfeito.</p>
      <div class="table-wrap">
        <table class="medidas-table">
          <thead>
            <tr><th>Tamanho</th><th>Busto (cm)</th><th>Cintura (cm)</th><th>Quadril (cm)</th></tr>
          </thead>
          <tbody>
            <tr><td>PP</td><td>78–82</td><td>60–64</td><td>84–88</td></tr>
            <tr><td>P</td><td>83–87</td><td>65–69</td><td>89–93</td></tr>
            <tr><td>M</td><td>88–92</td><td>70–74</td><td>94–98</td></tr>
            <tr><td>G</td><td>93–97</td><td>75–79</td><td>99–103</td></tr>
            <tr><td>GG</td><td>98–103</td><td>80–85</td><td>104–109</td></tr>
          </tbody>
        </table>
      </div>
      <p class="medidas-tip">💡 Em caso de dúvida entre dois tamanhos, recomendamos o maior para conforto.</p>
    </div>
  `;
  document.body.appendChild(modal);
}

function fecharModalMedidas() {
  const modal = document.getElementById('modal-medidas');
  if (modal) {
    modal.classList.remove('modal-open');
    setTimeout(() => modal.remove(), 300);
  }
}

function renderRelacionados(produto) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;

  const relacionados = PRODUTOS
    .filter(p => p.id !== produto.id && (
      p.categoria === produto.categoria ||
      p.cor.some(c => produto.cor.includes(c))
    ))
    .slice(0, 4);

  if (relacionados.length === 0) return;

  grid.innerHTML = relacionados.map(p => {
    const placeholder = gerarPlaceholderSvg(p);
    return `
      <a href="produto.html?id=${p.id}" class="related-card">
        <div class="related-card__img">
          <img src="${p.img}" alt="${p.nome}" loading="lazy"
            onerror="this.onerror=null;this.src='${placeholder}'">
        </div>
        <div class="related-card__info">
          <h4>${p.nome}</h4>
          <span>${formatPrice(p.preco)}</span>
        </div>
      </a>
    `;
  }).join('');
}

function injetarSchema(p) {
  const imagens = (p.galeria?.length ? p.galeria : [p.img])
    .map(src => `https://tulipalingerie.com.br/${src}`);

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": p.nome,
    "description": p.descricao,
    "image": imagens,
    "brand": { "@type": "Brand", "name": "Tulipa Lingerie" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": p.preco.toFixed(2),
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Tulipa Lingerie" }
    }
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
