# 🌷 Tulipa Lingerie — E-commerce de Luxo

> *"Seja a melhor versão de si mesma."*

E-commerce completo de lingerie artesanal de luxo, desenvolvido com HTML5, CSS3 puro e JavaScript Vanilla. Sem frameworks, sem build — apenas código elegante, performático e acessível.

---

## ✨ Visão Geral

Tulipa Lingerie é uma marca real localizada em **Santa Maria-DF**, especializada em lingerie artesanal feita à mão com rendas importadas e acabamentos premium. Este site foi criado para refletir o DNA da marca: minimalismo francês, sensualidade discreta, dourado sutil e muito espaço em branco.

**Páginas:**
- `index.html` — Landing page com hero 3D + catálogo completo
- `produto.html` — Detalhe de produto dinâmico (`?id=N`)
- `carrinho.html` — Sacola de compras + checkout simulado
- `sobre.html` — História da marca e manifesto

---

## 🛠️ Stack Técnica

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica, acessibilidade ARIA |
| **CSS3 Puro** | Design system, animações, responsividade |
| **JavaScript Vanilla** | Toda a interatividade, sem frameworks |
| **Three.js (r134)** | Cena 3D de pétalas de tulipa no hero |
| **GSAP 3.12** | Animações cinemáticas, ScrollTrigger |
| **Lenis 1.0** | Smooth scroll |
| **Google Fonts** | Cormorant Garamond, Inter, Italianno |

---

## 📁 Estrutura de Arquivos

```
tulipa/
├── index.html              # Landing + catálogo
├── produto.html            # Detalhe do produto (?id=N)
├── carrinho.html           # Sacola + checkout
├── sobre.html              # História da marca
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Diretivas para crawlers
├── css/
│   ├── reset.css           # Reset moderno
│   ├── variables.css       # Design tokens (CSS custom properties)
│   ├── styles.css          # Estilos globais: navbar, hero, footer...
│   ├── components.css      # Botões, cards, modais, formulários
│   ├── animations.css      # Keyframes e classes de animação
│   └── responsive.css      # Breakpoints mobile-first
├── js/
│   ├── produtos.js         # Array com 23 produtos reais
│   ├── utils.js            # Funções auxiliares compartilhadas
│   ├── particles.js        # Cena Three.js (pétalas 3D)
│   ├── main.js             # Inicialização, preloader, navbar, scroll
│   ├── catalog.js          # Renderização do catálogo, filtros, busca
│   ├── product.js          # Página de detalhe do produto
│   └── cart.js             # Gerenciamento da sacola (localStorage)
└── assets/
    ├── img/
    │   └── produtos/       # produto-01.jpg ... produto-23.jpg
    ├── icons/              # Ícones SVG customizados
    └── fonts/              # Fontes (se self-hosted)
```

---

## 🚀 Como Rodar Localmente

### Opção 1: Live Server (recomendado)
```bash
# Instalar globalmente
npm install -g live-server

# Rodar na pasta do projeto
cd tulipa
live-server --port=8080
```
Abra: [http://localhost:8080](http://localhost:8080)

### Opção 2: Python
```bash
cd tulipa
python -m http.server 8080
```

### Opção 3: VS Code
Instale a extensão **Live Server** e clique em *"Go Live"* na barra inferior.

> ⚠️ **Não abra diretamente via `file://`** — as requisições de fontes e CDN exigem um servidor HTTP.

---

## 🎨 Design System

### Paleta de Cores
```css
--bordeaux:      #6B0F1A  /* Primária — luxo, sedução */
--bordeaux-dark: #4A0A12  /* Tom mais profundo */
--gold:          #C9A961  /* Acentos — elegância */
--gold-light:    #E8D4A8  /* Tom suave do dourado */
--nude:          #E8C5C0  /* Rosa nude — feminino */
--nude-light:    #F5E6E3  /* Fundo nude claro */
--black:         #0A0908  /* Texto e UI */
--offwhite:      #FAF7F2  /* Fundo principal */
```

### Tipografia
| Fonte | Uso |
|---|---|
| **Cormorant Garamond** | Títulos editoriais (300/400/500, itálico) |
| **Inter** | Interface e corpo de texto (300/400/500/600) |
| **Italianno** | Logo e elementos de destaque |

### Easing
```css
--ease-expo: cubic-bezier(0.65, 0, 0.35, 1)
```

---

## 🛍️ Funcionalidades

### Catálogo
- Filtros por categoria (conjuntos, calcinhas, sutiãs)
- Filtros por cor (8 cores disponíveis)
- Busca em tempo real com debounce
- Ordenação por preço e recência
- Animação de entrada com IntersectionObserver
- Toggle de favoritos (localStorage)
- Placeholders SVG para imagens ausentes

### Carrinho
- Persistência em localStorage
- Adicionar, remover e atualizar quantidade
- Cupons de desconto (`TULIPA10`, `AMOR15`, `PRIMEIRACOMPRA`)
- Cálculo de frete por CEP (simulado por região)
- Formulário de checkout completo (simulado)
- Confete dourado no sucesso do pedido

### Hero 3D
- Canvas Three.js com 80 pétalas de tulipa
- Geometria custom com curvas de Bézier
- Efeito parallax com o mouse
- Animação contínua de queda suave
- Pausa quando fora do viewport (performance)

### Animações
- Preloader com barra dourada e mask reveal
- GSAP ScrollTrigger em todas as seções
- Cursor customizado (desktop)
- Lenis smooth scroll
- Marquee infinito
- Clip-path reveal na imagem editorial

---

## 📱 Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< 540px` | Grid 1 coluna, menu fullscreen |
| `540–767px` | Grid 2 colunas, navegação mobile |
| `768–1023px` | Grid 2 colunas, tablet |
| `≥ 1024px` | Grid 3 colunas, navegação desktop |
| `≥ 1440px` | Grid 4 colunas, layout XL |

---

## ♿ Acessibilidade

- HTML semântico com roles ARIA
- `alt` descritivo em todas as imagens
- `aria-label` em todos os ícones e botões
- Contraste de cores AA/AAA
- Foco visível em todos os elementos interativos
- Skip link para conteúdo principal
- Redução de movimento respeitada (`prefers-reduced-motion`)
- Live regions para atualizações do catálogo

---

## 🔍 SEO

- Meta description única por página
- Open Graph + Twitter Cards
- JSON-LD Organization Schema
- JSON-LD Product Schema na página de produto
- `sitemap.xml` com todas as URLs
- `robots.txt` configurado
- Canonical URLs
- Fonts com `preconnect`

---

## 🌐 Deploy

### Vercel (recomendado — zero config)
```bash
npx vercel --prod
```

### Netlify
Arraste a pasta `tulipa/` para o dashboard do Netlify.

### GitHub Pages
```bash
git init
git add .
git commit -m "feat: loja Tulipa Lingerie completa"
git remote add origin https://github.com/seu-usuario/tulipa-lingerie.git
git push -u origin main
# Ative GitHub Pages nas configurações do repo (branch: main, pasta: /)
```

---

## 📷 Imagens dos Produtos

As imagens dos produtos devem ser colocadas em `assets/img/produtos/`:
- `produto-01.jpg` até `produto-23.jpg`
- Dimensões recomendadas: **800×1000px** (proporção 4:5)
- Formato: JPEG com qualidade 80-90%

As imagens são do perfil [@tulipa__lingerie](https://www.instagram.com/tulipa__lingerie/) no Instagram. Enquanto não estiverem presentes localmente, o site exibe **placeholders SVG** baseados na cor de cada produto.

---

## 📞 Contato da Loja

- **Instagram:** [@tulipa__lingerie](https://www.instagram.com/tulipa__lingerie/)
- **Localização:** Santa Maria, Brasília-DF
- **Bio:** *Seja a melhor versão de si mesma* 🌷

---

*Desenvolvido com ❤ para a Tulipa Lingerie · 2026*
