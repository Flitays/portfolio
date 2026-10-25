(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // «Коротко о кейсе»: раскрытие с анимацией
  document.querySelectorAll('.summary__top').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (btn.getAttribute('aria-expanded') === 'true') panel.classList.add('is-open');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.add('is-open'));
      } else {
        panel.classList.remove('is-open');
        panel.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName !== 'grid-template-rows') return;
          panel.removeEventListener('transitionend', onEnd);
          if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true;
        });
      }
    });
  });

  // Боковое оглавление: собираем из заголовков с data-toc="1|2"
  const headings = [...document.querySelectorAll('[data-toc]')];
  const toc = document.querySelector('.toc');
  if (toc && headings.length) {
    const list = toc.querySelector('.toc__list');
    headings.forEach((h, i) => {
      if (!h.id) h.id = `section-${i + 1}`;
      const li = document.createElement('li');
      li.className = 'toc__item' + (h.dataset.toc === '2' ? ' toc__item--sub' : '');
      const a = document.createElement('a');
      a.className = 'toc__link';
      a.href = `#${h.id}`;
      const label = (h.dataset.tocLabel || h.textContent).trim();
      a.setAttribute('aria-label', label);
      a.innerHTML = '<span class="toc__label"></span><span class="toc__dash" aria-hidden="true"></span>';
      a.querySelector('.toc__label').textContent = label;
      a.title = label;
      li.appendChild(a);
      list.appendChild(li);
    });
    const items = [...list.children];
    let current = -1;
    const update = () => {
      const line = window.innerHeight * 0.3;
      let idx = 0;
      headings.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) idx = i; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = headings.length - 1;
      if (idx === current) return;
      current = idx;
      items.forEach((li, i) => li.classList.toggle('is-active', i === idx));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Тултипы по центру элемента; у края экрана слегка сдвигаем, чтобы не обрезались
  const nudgeTip = (el) => {
    el.style.removeProperty('--tip-dx');
    const w = parseFloat(getComputedStyle(el, '::after').width) || 0;
    const r = el.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const pad = 8;
    let dx = 0;
    if (center + w / 2 > window.innerWidth - pad) dx = window.innerWidth - pad - (center + w / 2);
    if (center - w / 2 < pad) dx = pad - (center - w / 2);
    if (dx) el.style.setProperty('--tip-dx', `${Math.round(dx)}px`);
  };
  document.querySelectorAll('[data-tip]').forEach((el) => {
    el.addEventListener('mouseenter', () => nudgeTip(el));
    el.addEventListener('focus', () => nudgeTip(el));
  });

  // «← Вернуться»: если пришли с главной — шаг назад по истории, браузер сам вернёт
  // ровно на то место, где была страница, без анимации. Иначе — переход на главную,
  // а главная восстановит сохранённую позицию.
  document.querySelectorAll('[data-back]').forEach((link) => {
    link.addEventListener('click', (e) => {
      // назад по истории — только если предыдущая страница и есть та, куда ведёт кнопка
      let fromTarget = false;
      try {
        const ref = new URL(document.referrer);
        const target = new URL(link.href);
        const norm = (p) => p.replace(/index\.html$/, '');
        fromTarget = ref.origin === location.origin && norm(ref.pathname) === norm(target.pathname);
      } catch {}
      e.preventDefault();
      if (fromTarget && history.length > 1) {
        history.back();
      } else {
        try { sessionStorage.setItem('restore-main', '1'); } catch {}
        location.href = link.href;
      }
    });
  });

  // Карточка-превью у ссылок на кейсы: выбираем сторону, где хватает места
  document.querySelectorAll('.link-preview').forEach((link) => {
    const card = link.querySelector('.link-preview__card');
    const place = () => {
      const header = document.querySelector('.case-header');
      const top = header ? header.getBoundingClientRect().bottom : 0;
      const need = (card.offsetHeight || 220) + 16;
      link.classList.toggle('is-below', link.getBoundingClientRect().top - top < need);
      // по горизонтали — не даём карточке вылезти за край экрана
      const r = link.getBoundingClientRect();
      const w = card.offsetWidth || 248;
      const center = r.left + r.width / 2;
      const pad = 12;
      let dx = 0;
      if (center - w / 2 < pad) dx = pad - (center - w / 2);
      if (center + w / 2 > window.innerWidth - pad) dx = window.innerWidth - pad - (center + w / 2);
      card.style.setProperty('--lp-dx', `${Math.round(dx)}px`);
    };
    link.addEventListener('mouseenter', place);
    link.addEventListener('focus', place);
  });

  // Картинки кейса открываются в модалке (кроме обложки, иконок, аватаров и превью ссылок)
  const zoomImgs = [...document.querySelectorAll('.case .picture img, .case .solution__img img, .case .inset > img')]
    .filter((img) => !img.closest('.case-top'));
  if (zoomImgs.length) {
    const svg = (d) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    const lb = document.createElement('div');
    lb.className = 'case-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Просмотр изображения');
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML = `<img class="case-lightbox__img" alt="">
      <span class="case-lightbox__counter"></span>
      <button class="case-lightbox__btn case-lightbox__btn--close" type="button" aria-label="Закрыть">${svg('M5 5l10 10M15 5L5 15')}</button>`;
    document.body.appendChild(lb);
    const big = lb.querySelector('.case-lightbox__img');
    const counter = lb.querySelector('.case-lightbox__counter');
    const closeBtn = lb.querySelector('.case-lightbox__btn--close');
    let index = 0, lastFocus = null;
    const set = (i) => {
      index = Math.min(Math.max(i, 0), zoomImgs.length - 1);
      const src = zoomImgs[index];
      big.src = src.currentSrc || src.src;
      big.alt = src.alt;
      counter.textContent = zoomImgs.length > 1 ? `${index + 1} / ${zoomImgs.length}` : '';
    };
    const go = (i) => {
      if (i < 0 || i >= zoomImgs.length || i === index || busy) return;
      big.classList.add('is-swapping');
      setTimeout(() => {
        zoomImgs[index].style.visibility = '';
        set(i);
        if (lb.classList.contains('is-flip')) zoomImgs[index].style.visibility = 'hidden';
        const done = () => big.classList.remove('is-swapping');
        if (big.complete) done(); else big.onload = done;
      }, 150);
    };

    // «Бесшовное» открытие (FLIP): большая картинка стартует ровно с места и размера фото на странице
    // и вырастает до полного; при закрытии садится обратно. Фон затемняется отдельно от картинки.
    const FLIP_MS = 480;
    const FLIP_EASE = 'cubic-bezier(.2, .8, .2, 1)';
    let busy = false;
    const radiusOf = (img) => parseFloat(getComputedStyle(img.closest('.picture, .solution__img') || img).borderTopLeftRadius) || 0;
    // ставит картинку в модалке поверх фото на странице (без анимации)
    const placeOver = (thumb) => {
      big.style.transition = 'none';
      big.style.transform = '';
      big.style.borderRadius = '';
      const b = big.getBoundingClientRect();
      const t = thumb.getBoundingClientRect();
      if (!b.width || !t.width) return false;
      const sx = t.width / b.width, sy = t.height / b.height;
      const r = radiusOf(thumb);
      big.style.transformOrigin = '0 0';
      big.style.transform = `translate(${t.left - b.left}px, ${t.top - b.top}px) scale(${sx}, ${sy})`;
      big.style.borderRadius = `${r / sx}px / ${r / sy}px`;
      return true;
    };
    const animateTo = (transform, radius, onEnd) => {
      big.getBoundingClientRect(); // применить стартовое положение
      big.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}, border-radius ${FLIP_MS}ms ${FLIP_EASE}`;
      big.style.transform = transform;
      big.style.borderRadius = radius;
      setTimeout(onEnd, FLIP_MS + 30);
    };
    const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; };
    // блокируем прокрутку страницы, не давая ей сдвинуться на ширину полосы прокрутки
    const lockScroll = () => {
      const sb = innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      if (sb > 0) document.documentElement.style.paddingRight = `${sb}px`;
    };
    const unlockScroll = () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    };

    const open = (i) => {
      if (busy) return;
      lastFocus = document.activeElement;
      set(i);
      const thumb = zoomImgs[index];
      lb.setAttribute('aria-hidden', 'false');
      lockScroll();
      const canFlip = !reduceMotion && big.complete && big.naturalWidth > 0;
      if (canFlip) {
        lb.classList.add('is-flip');
        if (placeOver(thumb)) {
          busy = true;
          thumb.style.visibility = 'hidden';
          lb.getBoundingClientRect();
          lb.classList.add('is-open');
          animateTo('', '', () => { big.style.transition = ''; busy = false; });
        } else {
          lb.classList.remove('is-flip');
          lb.classList.add('is-open');
        }
      } else {
        lb.classList.add('is-open');
      }
      closeBtn.focus({ preventScroll: true });
    };
    const finishClose = () => {
      // без переходов: иначе модалка на миг возвращается к обычному тёмному фону и гаснет («моргает»)
      lb.style.transition = 'none';
      lb.classList.remove('is-open', 'is-closing', 'is-flip');
      big.style.transition = 'none';
      big.style.transform = '';
      big.style.borderRadius = '';
      big.style.transformOrigin = '';
      zoomImgs.forEach((im) => { im.style.visibility = ''; });
      lb.getBoundingClientRect();
      lb.style.transition = '';
      big.style.transition = '';
      busy = false;
    };
    const close = () => {
      if (busy || !lb.classList.contains('is-open')) return;
      lb.setAttribute('aria-hidden', 'true');
      const thumb = zoomImgs[index];
      if (lb.classList.contains('is-flip') && inView(thumb)) {
        busy = true;
        // конечное положение — место фото на странице
        const b = big.getBoundingClientRect();
        const t = thumb.getBoundingClientRect();
        const sx = t.width / b.width, sy = t.height / b.height;
        const r = radiusOf(thumb);
        big.style.transformOrigin = '0 0';
        lb.classList.add('is-closing');
        animateTo(`translate(${t.left - b.left}px, ${t.top - b.top}px) scale(${sx}, ${sy})`, `${r / sx}px / ${r / sy}px`, () => {
          unlockScroll();
          finishClose();
        });
      } else {
        lb.classList.remove('is-flip');
        lb.classList.remove('is-open');
        zoomImgs.forEach((im) => { im.style.visibility = ''; });
        unlockScroll();
      }
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    zoomImgs.forEach((img, i) => {
      img.classList.add('zoomable');
      img.addEventListener('click', () => open(i));
    });
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });
    // свайп на телефоне
    let tx = null;
    lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }

  // Миниатюры и ссылки по странице — плавный скролл
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
  });


  // Появление блоков при скролле — только при первом заходе на страницу в этой сессии
  const reveals = document.querySelectorAll('.reveal');
  if (document.documentElement.classList.contains('seen') || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  // Видео: пока грузится — серая подложка с переливом, затем плавно проявляется,
  // когда реально пошло воспроизведение (без скачка «обложка → первый кадр»)
  const autoVideos = [...document.querySelectorAll('video[data-autoplay]')];
  autoVideos.forEach((v) => {
    if (reduceMotion) { v.classList.add('is-ready'); return; }
    v.addEventListener('playing', () => v.classList.add('is-ready'), { once: true });
  });
  // Начинаем грузить заранее, на подлёте к экрану
  if ('IntersectionObserver' in window) {
    const pre = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.preload = 'auto';
        pre.unobserve(entry.target);
      });
    }, { rootMargin: '600px 0px' });
    autoVideos.forEach((v) => pre.observe(v));
  }

  // Видео играют только когда видны на экране
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting && !reduceMotion) v.play().catch(() => {}); else v.pause();
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('video[data-autoplay]').forEach((v) => vio.observe(v));
  }

  // Слайдер «до / после»: мышью шторка идёт за курсором и возвращается при уходе,
  // на тач-экране тянется пальцем, с клавиатуры — стрелками
  document.querySelectorAll('.compare').forEach((box) => {
    let pos = 50;
    let dragging = false;
    const set = (v, anim) => {
      pos = Math.max(0, Math.min(100, v));
      box.classList.toggle('is-anim', !!anim);
      box.style.setProperty('--pos', `${pos}%`);
      box.classList.toggle('is-past', pos < 88);
      box.classList.toggle('is-end', pos < 12);
      box.setAttribute('aria-valuenow', String(Math.round(pos)));
    };
    const fromEvent = (e) => {
      const r = box.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    };
    set(pos, false);
    box.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(fromEvent(e), true); });
    box.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' || dragging) set(fromEvent(e), false);
    });
    box.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') set(50, true); });
    box.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      dragging = true;
      box.classList.add('is-drag');
      box.setPointerCapture(e.pointerId);
      set(fromEvent(e), true);
    });
    const stop = () => { dragging = false; box.classList.remove('is-drag'); };
    box.addEventListener('pointerup', stop);
    box.addEventListener('pointercancel', stop);
    box.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 10, ArrowUp: 10, ArrowLeft: -10, ArrowDown: -10 }[e.key];
      if (e.key === 'Home') set(0, true);
      else if (e.key === 'End') set(100, true);
      else if (step) set(pos + step, true);
      else return;
      e.preventDefault();
    });
  });
})();
