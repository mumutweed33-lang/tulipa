/* =====================================================
   PARTÍCULAS 3D — TULIPA LINGERIE
   Cena Three.js com pétalas de tulipa flutuantes
   ===================================================== */

class TulipParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.time = 0;
    this.petals = [];
    this.isActive = true;
    this.raf = null;

    this._init();
    this._criarPetalas();
    this._bindEvents();
    this._animar();
  }

  _init() {
    /* Cena */
    this.scene = new THREE.Scene();

    /* Câmera perspectiva */
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 8);

    /* Renderer com fundo transparente */
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  _criarFormaPetala() {
    /* Curva de Bézier que define o contorno de uma pétala */
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.4, 0.1, 0.45, 0.8, 0, 1.4);
    shape.bezierCurveTo(-0.45, 0.8, -0.4, 0.1, 0, 0);
    return shape;
  }

  _criarPetalas() {
    const shape = this._criarFormaPetala();
    const geo = new THREE.ShapeGeometry(shape, 24);

    const coresPetala = [
      new THREE.Color(0x6B0F1A), /* bordeaux */
      new THREE.Color(0x8B1A28), /* bordeaux médio */
      new THREE.Color(0xC9A961), /* gold */
      new THREE.Color(0xE8D4A8), /* gold light */
      new THREE.Color(0xE8C5C0), /* nude */
      new THREE.Color(0x4A0A12), /* bordeaux dark */
    ];

    const total = window.innerWidth < 768 ? 40 : 80;

    for (let i = 0; i < total; i++) {
      const cor = coresPetala[Math.floor(Math.random() * coresPetala.length)];
      const mat = new THREE.MeshBasicMaterial({
        color: cor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: Math.random() * 0.22 + 0.05,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geo, mat);

      /* Posição inicial espalhada */
      mesh.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 8
      );

      /* Rotação inicial aleatória */
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      /* Escala variada — pétalas grandes e pequenas */
      const s = Math.random() * 0.35 + 0.08;
      mesh.scale.set(s, s, s);

      /* Dados de animação por pétala */
      mesh.userData = {
        velY: -(Math.random() * 0.006 + 0.003),     /* queda */
        velX: (Math.random() - 0.5) * 0.004,         /* deriva horizontal */
        rx: (Math.random() - 0.5) * 0.012,           /* rotação X */
        rz: (Math.random() - 0.5) * 0.008,           /* rotação Z */
        floatAmp: Math.random() * 0.003 + 0.001,     /* oscilação suave */
        floatOff: Math.random() * Math.PI * 2,       /* offset de fase */
        resetY: 10 + Math.random() * 5,              /* altura de reset */
        baseOpacity: mat.opacity,
      };

      this.scene.add(mesh);
      this.petals.push(mesh);
    }
  }

  _bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 1.5;
      this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 1.0;
    });

    /* Touch para mobile */
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      this.mouse.targetX = (t.clientX / window.innerWidth - 0.5) * 0.8;
      this.mouse.targetY = -(t.clientY / window.innerHeight - 0.5) * 0.5;
    }, { passive: true });

    window.addEventListener('resize', () => this._onResize());

    /* Pausa quando fora do viewport */
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const observer = new IntersectionObserver(([entry]) => {
        this.isActive = entry.isIntersecting;
      }, { threshold: 0 });
      observer.observe(heroSection);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  _animar() {
    this.raf = requestAnimationFrame(() => this._animar());

    if (!this.isActive) return;

    this.time += 0.01;

    /* Parallax de câmera suave com o mouse */
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;
    this.camera.position.x += (this.mouse.x * 0.6 - this.camera.position.x) * 0.06;
    this.camera.position.y += (this.mouse.y * 0.4 - this.camera.position.y) * 0.06;
    this.camera.lookAt(0, 0, 0);

    /* Atualiza cada pétala */
    this.petals.forEach(p => {
      const d = p.userData;

      /* Queda + oscilação suave */
      p.position.y += d.velY + Math.sin(this.time * 0.8 + d.floatOff) * d.floatAmp;
      p.position.x += d.velX + Math.cos(this.time * 0.5 + d.floatOff) * 0.001;

      /* Rotação contínua */
      p.rotation.x += d.rx;
      p.rotation.z += d.rz;

      /* Reposiciona no topo quando sair pela base */
      if (p.position.y < -10) {
        p.position.y = d.resetY;
        p.position.x = (Math.random() - 0.5) * 22;
        p.position.z = (Math.random() - 0.5) * 8;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
    this.petals.forEach(p => {
      p.geometry.dispose();
      p.material.dispose();
    });
  }
}
