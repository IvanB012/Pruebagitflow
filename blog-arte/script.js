/**
 * NÉON — Blog de Arte & Diseño
 * Script principal de interactividad
 * 
 * Módulos:
 *  1. Navbar scroll behavior
 *  2. Búsqueda overlay
 *  3. Categorías + filtro de artículos
 *  4. Botón guardar artículo
 *  5. Animaciones de entrada (IntersectionObserver)
 *  6. Newsletter form
 *  7. Botón volver arriba
 *  8. Animación de números (contadores)
 */

'use strict';

/* ================================================================
   1. NAVBAR — oscurecer al hacer scroll
   ================================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    // Agregar clase 'scrolled' para oscurecer el fondo
    if (current > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = current;
  }, { passive: true });
})();


/* ================================================================
   2. BÚSQUEDA — toggle del overlay
   ================================================================ */
(function initSearch() {
  const btnSearch   = document.getElementById('btn-search');
  const btnClose    = document.getElementById('search-close');
  const overlay     = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  if (!btnSearch || !overlay || !searchInput) return;

  /**
   * Abre el panel de búsqueda y enfoca el input
   */
  function openSearch() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    // Pequeño delay para que la animación ocurra antes del focus
    setTimeout(() => searchInput.focus(), 150);
  }

  /**
   * Cierra el panel de búsqueda
   */
  function closeSearch() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    searchInput.value = '';
  }

  btnSearch.addEventListener('click', openSearch);
  if (btnClose) btnClose.addEventListener('click', closeSearch);

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeSearch();
    }
  });
})();


/* ================================================================
   3. MENÚ MÓVIL — hamburguesa (placeholder básico)
   ================================================================ */
(function initMobileMenu() {
  const btnMenu = document.getElementById('btn-menu');
  if (!btnMenu) return;

  let menuOpen = false;

  btnMenu.addEventListener('click', () => {
    menuOpen = !menuOpen;
    btnMenu.setAttribute('aria-expanded', String(menuOpen));

    // Animación de las líneas del botón hamburguesa
    const spans = btnMenu.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
})();


/* ================================================================
   4. CATEGORÍAS — filtrado de artículos por categoría
   ================================================================ */
(function initCategories() {
  const categoryButtons = document.querySelectorAll('.categoria-card');
  const articleCards    = document.querySelectorAll('.article-card');

  if (!categoryButtons.length || !articleCards.length) return;

  /**
   * Filtra los artículos según la categoría seleccionada.
   * Usa animación CSS (opacity + scale) para la transición.
   * @param {string} filter - Valor de data-filter del botón
   */
  function filterArticles(filter) {
    articleCards.forEach((card) => {
      const category = card.dataset.category || '';
      const show = filter === 'all' || category === filter;

      if (show) {
        card.style.opacity  = '0';
        card.style.transform = 'scale(0.95)';
        // Pequeño delay para crear efecto cascada
        requestAnimationFrame(() => {
          card.style.display = '';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity    = '';
            card.style.transform  = '';
          });
        });
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { card.style.display = 'none'; }, 300);
      }
    });
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Actualizar estado activo
      categoryButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Filtrar
      filterArticles(btn.dataset.filter || 'all');
    });
  });
})();


/* ================================================================
   5. BOTÓN GUARDAR — toggle de favoritos (bookmark)
   ================================================================ */
(function initSaveButtons() {
  const saveButtons = document.querySelectorAll('.btn-save');
  if (!saveButtons.length) return;

  /**
   * Persiste los favoritos en localStorage para mantener
   * el estado incluso al recargar la página.
   */
  const STORAGE_KEY = 'neon_saved_articles';
  let savedArticles = new Set(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  );

  // Restaurar estado guardado al cargar la página
  saveButtons.forEach((btn) => {
    if (savedArticles.has(btn.id)) {
      btn.classList.add('saved');
      const icon = btn.querySelector('i');
      if (icon) icon.classList.replace('far', 'fas');
    }
  });

  saveButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isSaved = btn.classList.toggle('saved');
      const icon    = btn.querySelector('i');

      if (isSaved) {
        savedArticles.add(btn.id);
        if (icon) icon.classList.replace('far', 'fas');
        btn.setAttribute('aria-label', 'Artículo guardado');
      } else {
        savedArticles.delete(btn.id);
        if (icon) icon.classList.replace('fas', 'far');
        btn.setAttribute('aria-label', 'Guardar artículo');
      }

      // Persistir cambio
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...savedArticles]));

      // Micro-animación de "resorte"
      btn.style.transform = 'scale(1.25)';
      setTimeout(() => { btn.style.transform = ''; }, 200);
    });
  });
})();


/* ================================================================
   6. ANIMACIONES DE ENTRADA (Intersection Observer)
   Añade la clase 'reveal' a los elementos y los anima al entrar
   en el viewport.
   ================================================================ */
(function initReveal() {
  // Seleccionamos los elementos que queremos animar al hacer scroll
  const targets = document.querySelectorAll(
    '.categoria-card, .article-card, .destacado-item, .section-header'
  );

  if (!targets.length) return;

  // Agregamos la clase reveal a todos los elementos
  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Pequeño delay escalonado según la posición en el DOM
        const index = [...targets].indexOf(entry.target);
        const delay = (index % 6) * 80; // máximo 400ms de retraso

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        // Dejamos de observar el elemento una vez que ya se mostró
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,        // Se activa cuando el 12% del elemento es visible
    rootMargin: '0px 0px -40px 0px'  // Margen inferior para activar un poco antes
  });

  targets.forEach((el) => observer.observe(el));
})();


/* ================================================================
   7. NEWSLETTER — validación y envío del formulario
   ================================================================ */
(function initNewsletter() {
  const form    = document.getElementById('newsletter-form');
  const input   = document.getElementById('nl-email');
  const success = document.getElementById('nl-success');
  const btn     = document.getElementById('nl-submit');

  if (!form || !input) return;

  /**
   * Validación simple de formato de email usando regex estándar
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value;

    if (!isValidEmail(email)) {
      // Marcar el input como inválido con shake animation
      input.style.borderColor = '#ef4444';
      input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
      input.addEventListener('input', () => {
        input.style.borderColor = '';
        input.style.boxShadow   = '';
      }, { once: true });
      input.focus();
      return;
    }

    // Simular llamada a API (en producción, reemplazar con fetch real)
    btn.disabled    = true;
    btn.textContent = 'Enviando...';

    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mostrar mensaje de éxito
    form.querySelector('.nl-input-group').style.display = 'none';
    form.querySelector('.nl-hint').style.display        = 'none';
    if (success) {
      success.hidden = false;
      // Animación de entrada del éxito
      success.style.animation = 'fadeInUp 0.5s ease forwards';
    }
  });
})();


/* ================================================================
   8. BOTÓN VOLVER ARRIBA
   ================================================================ */
(function initScrollTop() {
  const btn = document.getElementById('btn-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.hidden = false;
    } else {
      btn.hidden = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ================================================================
   9. ANIMACIÓN DE NÚMEROS — efecto contador al entrar en el viewport
   ================================================================ */
(function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  /**
   * Anima un número desde 0 hasta el valor final en un tiempo dado.
   * Soporta valores con sufijos como "K" o "+".
   * @param {HTMLElement} el - Elemento del DOM
   * @param {string} finalText - Texto final incluyendo sufijo
   * @param {number} duration - Duración en ms
   */
  function animateCounter(el, finalText, duration = 1800) {
    // Extraer número y sufijo del texto (ej: "12K" → 12, "K")
    const match  = finalText.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;

    const finalVal = parseFloat(match[1]);
    const suffix   = match[2] || '';
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out quart para efecto más natural
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = Math.round(finalVal * eased * 10) / 10;

      // Mostrar decimal solo si el valor final lo tiene
      el.textContent = Number.isInteger(finalVal)
        ? Math.round(current) + suffix
        : current.toFixed(1) + suffix;

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Observar cuando la sección de stats entra en el viewport
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      statNumbers.forEach((el) => {
        animateCounter(el, el.textContent.trim());
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(heroStats);
})();


/* ================================================================
   10. BOTÓN "VER MÁS ARTÍCULOS" — simula carga de más contenido
   ================================================================ */
(function initLoadMore() {
  const btn = document.getElementById('btn-load-more');
  if (!btn) return;

  let loaded = false;

  btn.addEventListener('click', () => {
    if (loaded) return;
    loaded = true;

    // Simulamos estado de carga
    btn.textContent = 'Cargando...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = 'No hay más artículos por ahora <i class="fas fa-check"></i>';
      btn.style.color = 'var(--neon-green)';
      btn.style.borderColor = 'rgba(34,197,94,0.3)';
    }, 1000);
  });
})();


/* ================================================================
   11. EFECTO PARALLAX SUAVE en los blobs del hero
   ================================================================ */
(function initParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 a 1
    const dy = (e.clientY - cy) / cy;

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 12; // Factor de movimiento distinto por blob
      blob.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();
