/* =====================================================
   CATÁLOGO — TULIPA LINGERIE
   Renderização, filtros, busca e ordenação
   ===================================================== */

const Catalog = (() => {
  let filtroAtual = 'todos';
  let busca = '';
  let ordenacao = 'recentes';
  let filtroCorAtual = '';
  let produtosFiltrados = [];
  let gridEl = null;

  /* Mapa de categorias para labels */
  const catLabels = {
    todos: 'Todos',
    conjunto: 'Conjuntos',
    calcinha: 'Calcinhas',
    sutia: 'Sutiãs',
    renda: 'Lingerie de Renda',
  };

  /* ── Inicializar catálogo ── */
  function init() {
    gridEl = document.getElementById('product-grid');
    if (!gridEl) return;

    setupFiltros();
    setupBusca();
    setupOrdenacao();
    renderizar();
  }

  /* ── Setup dos filtros de categoria ── */
  function setupFiltros() {
    const chips = document.querySelectorAll('.filter-chip[data-categoria]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filtroAtual = chip.dataset.categoria;
        renderizar();
      });
    });

    /* Filtros de cor */
    const corChips = document.querySelectorAll('.filter-chip[data-cor]');
    corChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const isActive = chip.classList.contains('active');
        corChips.forEach(c => c.classList.remove('active'));
        if (!isActive) {
          chip.classList.add('active');
          filtroCorAtual = chip.dataset.cor;
        } else {
          filtroCorAtual = '';
        }
        renderizar();
      });
    });
  }

  /* ── Setup da busca com debounce ── */
  function setupBusca() {
    const input = document.getElementById('busca-produto');
    if (!input) return;

    const handleBusca = debounce((val) => {
      busca = val.toLowerCase().trim();
      renderizar();
    }, 280);

    input.addEventListener('input', (e) => handleBusca(e.target.value));

    /* Limpa busca */
    const clearBtn = document.getElementById('busca-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        busca = '';
        renderizar();
        clearBtn.style.display = 'none';
      });
      input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'flex' : 'none';
      });
    }
  }

  /* ── Setup da ordenação ── */
  function setupOrdenacao() {
    const select = document.getElementById('ordenacao');
    if (!select) return;
    select.addEventListener('change', (e) => {
      ordenacao = e.target.value;
      renderizar();
    });
  }

  /* ── Filtrar produtos ── */
  function filtrar(produtos) {
    return produtos.filter(p => {
      const matchCat = filtroAtual === 'todos' || p.categoria === filtroAtual;
      const matchCor = !filtroCorAtual || p.cor.includes(filtroCorAtual);
      const matchBusca = !busca || p.nome.toLowerCase().includes(busca) ||
        p.descricao.toLowerCase().includes(busca);
      return matchCat && matchCor && matchBusca;
    });
  }

  /* ── Ordenar produtos ── */
  function ordenar(produtos) {
    const copia = [...produtos];
    switch (ordenacao) {
      case 'menor-preco': return copia.sort((a, b) => a.preco - b.preco);
      case 'maior-preco': return copia.sort((a, b) => b.preco - a.preco);
      case 'recentes': default: return copia;
    }
  }

  /* ── Renderizar grid ── */
  function renderizar() {
    if (!gridEl) return;

    produtosFiltrados = ordenar(filtrar(PRODUTOS));

    /* Atualiza contador */
    const counter = document.getElementById('produtos-count');
    if (counter) counter.textContent = `${produtosFiltrados.length} peças encontradas`;

    if (produtosFiltrados.length === 0) {
      gridEl.innerHTML = `
        <div class="catalog-empty">
          <span class="catalog-empty__icon">🌷</span>
          <h3>Nenhuma peça encontrada</h3>
          <p>Tente outro filtro ou busca</p>
          <button class="btn btn-bordeaux" onclick="Catalog.resetFiltros()">Limpar filtros</button>
        </div>
      `;
      return;
    }

    /* Renderiza cards com delay stagger */
    gridEl.innerHTML = produtosFiltrados.map((p, i) => renderCard(p, i)).join('');

    /* Configura interações depois de injetar o HTML */
    gridEl.querySelectorAll('.product-card').forEach((card) => {
      setupCardInteractions(card);
    });

    /* Animação de entrada com IntersectionObserver */
    const cards = gridEl.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const idx = parseInt(card.dataset.index || 0);
          setTimeout(() => {
            card.classList.add('card-visible');
          }, (idx % 6) * 80);
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.08 });

    cards.forEach(c => observer.observe(c));
  }

  /* ── HTML de um card de produto ── */
  function renderCard(produto, index) {
    const isFav = Favoritos.has(produto.id);
    const swatches = produto.cor.map(cor => `
      <span class="swatch" style="background:${corParaHex(cor)}" title="${corLabel(cor)}"></span>
    `).join('');

    const badge = produto.novo
      ? '<span class="card-badge card-badge--novo">Novo</span>'
      : produto.destaque
        ? '<span class="card-badge card-badge--destaque">Destaque</span>'
        : '';

    const placeholder = gerarPlaceholderSvg(produto);

    return `
    <article class="product-card" data-id="${produto.id}" data-index="${index}" aria-label="${produto.nome}">
      <div class="product-card__img-wrap">
        ${badge}
        <button
          class="card-fav ${isFav ? 'card-fav--active' : ''}"
          data-id="${produto.id}"
          aria-label="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
          aria-pressed="${isFav}"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <span class="card-cat-tag">${catLabels[produto.categoria] || produto.categoria}</span>
        <img
          class="product-card__img"
          src="${produto.img}"
          alt="${produto.nome}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${placeholder}'"
        >
        <div class="product-card__overlay"></div>
        <button class="product-card__add-btn" data-id="${produto.id}" aria-label="Adicionar ${produto.nome} à sacola">
          Adicionar à Sacola
        </button>
      </div>
      <div class="product-card__info">
        <h3 class="product-card__name">
          <a href="produto.html?id=${produto.id}">${produto.nome}</a>
        </h3>
        <div class="product-card__swatches">${swatches}</div>
        <div class="product-card__price-wrap">
          <span class="product-card__price">${formatPrice(produto.preco)}</span>
          <span class="product-card__parcelas">${produto.parcelas}x de ${formatPrice(produto.preco / produto.parcelas)}</span>
        </div>
      </div>
    </article>
  `;
  }

  /* ── Interações do card ── */
  function setupCardInteractions(card) {
    /* Botão de favorito */
    const favBtn = card.querySelector('.card-fav');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(favBtn.dataset.id);
        const adicionado = Favoritos.toggle(id);
        favBtn.classList.toggle('card-fav--active', adicionado);
        favBtn.setAttribute('aria-pressed', adicionado);
        const svg = favBtn.querySelector('path');
        if (svg) svg.setAttribute('fill', adicionado ? 'currentColor' : 'none');
        showToast(adicionado ? 'Adicionado aos favoritos ❤' : 'Removido dos favoritos', adicionado ? 'success' : 'info');
      });
    }

    /* Botão de adicionar ao carrinho */
    const addBtn = card.querySelector('.product-card__add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(addBtn.dataset.id);
        const produto = PRODUTOS.find(p => p.id === id);
        if (!produto) return;
        Cart.addItem(produto, {
          cor: produto.cor[0],
          tamanho: produto.tamanhos[0]
        });
        /* Animação de pulse no botão */
        addBtn.textContent = '✓ Adicionado!';
        addBtn.classList.add('added');
        setTimeout(() => {
          addBtn.textContent = 'Adicionar à Sacola';
          addBtn.classList.remove('added');
        }, 1800);
      });
    }

    /* Link do card inteiro vai para produto */
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav') || e.target.closest('.product-card__add-btn')) return;
      const id = card.dataset.id;
      window.location.href = `produto.html?id=${id}`;
    });
    card.style.cursor = 'pointer';
  }

  /* ── Reset de filtros ── */
  function resetFiltros() {
    filtroAtual = 'todos';
    busca = '';
    filtroCorAtual = '';
    ordenacao = 'recentes';

    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const todosChip = document.querySelector('.filter-chip[data-categoria="todos"]');
    todosChip && todosChip.classList.add('active');

    const input = document.getElementById('busca-produto');
    if (input) input.value = '';

    const select = document.getElementById('ordenacao');
    if (select) select.value = 'recentes';

    renderizar();
  }

  return { init, renderizar, resetFiltros };
})();
