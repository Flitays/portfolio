(() => {
  // Ссылка на резюме — вставь сюда URL (PDF, hh.ru, Google Drive и т.п.)
  const RESUME_URL = 'https://drive.google.com/file/d/1uZowFEQ-JIogMLKeHc2R57VcVjRtZW8_/view?usp=sharing';

  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  // Резюме
  document.querySelectorAll('[data-resume]').forEach((link) => {
    if (RESUME_URL) {
      link.href = RESUME_URL;
      link.target = '_blank';
      link.rel = 'noopener';
    } else {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Резюме скоро появится — пока напиши мне в Telegram');
      });
    }
  });

  // Аккордеоны опыта работы
  document.querySelectorAll('.accordion__top[aria-controls]').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
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

  // Почта: только копируем адрес в буфер обмена, почтовый клиент не открываем
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // запасной способ для браузеров без Clipboard API (например, без HTTPS)
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  };
  document.querySelectorAll('[data-copy]').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const ok = await copyText(link.dataset.copy);
      showToast(ok ? 'Почта скопирована' : link.dataset.copy);
    });
  });


  // Подложка активного раздела в шапке: «перескакивает» между пунктами
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  const pill = document.querySelector('.header__pill');
  let currentIndex = -1;
  const movePill = (i) => {
    if (i === currentIndex) return;
    const wasHidden = currentIndex === -1;
    currentIndex = i;
    navLinks.forEach((a, k) => a.classList.toggle('is-active', k === i));
    if (i === -1) { pill.classList.remove('is-visible'); return; }
    const a = navLinks[i];
    const place = () => {
      pill.style.setProperty('--pill-x', `${a.offsetLeft}px`);
      pill.style.setProperty('--pill-w', `${a.offsetWidth}px`);
      pill.style.top = `${a.offsetTop}px`;
      pill.style.height = `${a.offsetHeight}px`;
    };
    if (wasHidden) {
      // Была скрыта — ставим на место без анимации, затем проявляем из блюра
      pill.style.transition = 'none';
      place();
      pill.getBoundingClientRect();
      pill.style.transition = '';
    } else {
      place();
    }
    pill.classList.add('is-visible');
  };
  const setActive = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    // Раздел активен от своего начала до начала следующего (презентации входят в «Проекты»),
    // последний — до своего конца; выше первого раздела подложка скрыта
    let current = -1;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) current = i; });
    const last = sections[sections.length - 1];
    if (current === sections.length - 1 && y > last.offsetTop + last.offsetHeight) current = -1;
    // Дошли до контактов — подложка уходит
    const contacts = document.getElementById('contacts');
    if (contacts && contacts.getBoundingClientRect().top < window.innerHeight * 0.8) current = -1;
    movePill(current);
  };
  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', () => { const i = currentIndex; currentIndex = -2; movePill(i); });
  setActive();

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

  // Якоря на странице (навигация в шапке) — плавно, но только по клику.
  // Глобальный scroll-behavior: smooth не используем: из-за него браузер «докручивал»
  // страницу при возврате с кейса.
  const reduceMotionMain = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]:not([data-to-top])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotionMain ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
  });

  // Запоминаем, где был посетитель, чтобы кнопка «Вернуться» на кейсах вернула ровно сюда
  const SCROLL_KEY = 'main-scroll';
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); } catch {}
  });
  try {
    if (sessionStorage.getItem('restore-main') === '1') {
      sessionStorage.removeItem('restore-main');
      const y = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, y);
    }
  } catch {}

  // Плавный возврат наверх
  document.querySelectorAll('[data-to-top]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname + location.search);
    });
  });

  // Фото «Немного обо мне» — модалка
  const lightbox = document.querySelector('.lightbox');
  const photos = [...document.querySelectorAll('.photo[data-large]')];
  if (lightbox && photos.length) {
    const lbImg = lightbox.querySelector('.lightbox__img');
    let index = 0;
    let lastFocus = null;
    const show = (i) => {
      index = (i + photos.length) % photos.length;
      const btn = photos[index];
      lbImg.src = btn.dataset.large;
      lbImg.alt = btn.querySelector('img').alt;
    };
    const open = (i) => {
      lastFocus = document.activeElement;
      show(i);
      lightbox.setAttribute('aria-hidden', 'false');
      lightbox.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox__btn--close').focus({ preventScroll: true });
    };
    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    // Смена фото: уходит в блюр и проявляется следующее
    const swap = (dir) => {
      lbImg.style.transition = 'opacity .15s, filter .15s';
      lbImg.style.opacity = '0';
      lbImg.style.filter = 'blur(8px)';
      setTimeout(() => {
        show(index + dir);
        const done = () => {
          lbImg.style.opacity = '';
          lbImg.style.filter = '';
          setTimeout(() => { lbImg.style.transition = ''; }, 200);
        };
        if (lbImg.complete) done(); else lbImg.onload = done;
      }, 150);
    };
    photos.forEach((btn, i) => btn.addEventListener('click', () => open(i)));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    lightbox.querySelector('.lightbox__btn--close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__btn--prev').addEventListener('click', () => swap(-1));
    lightbox.querySelector('.lightbox__btn--next').addEventListener('click', () => swap(1));
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') swap(-1);
      if (e.key === 'ArrowRight') swap(1);
    });
    // Подгружаем крупные версии заранее, когда блок близко
    const pre = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        photos.forEach((b) => { const im = new Image(); im.src = b.dataset.large; });
        pre.disconnect();
      }
    }, { rootMargin: '400px' });
    pre.observe(document.querySelector('.photos'));
  }

  // Toolkit: увеличение иконок рядом с курсором, как в Dock macOS
  const dock = document.querySelector('.dock');
  const dockMq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
  if (dock) {
    const items = [...dock.querySelectorAll('.dock__item')];
    const BASE = 48, MAX = 56, RANGE = 90;
    let centers = [];
    let raf = 0;
    const reset = () => {
      dock.classList.remove('is-active');
      items.forEach((it) => it.style.removeProperty('--size'));
    };
    dock.addEventListener('mouseenter', () => {
      if (!dockMq.matches) return;
      // центры иконок в базовом размере — от них считаем расстояние до курсора
      centers = items.map((it) => { const r = it.getBoundingClientRect(); return r.left + r.width / 2; });
      dock.classList.add('is-active');
    });
    dock.addEventListener('mousemove', (e) => {
      if (!dockMq.matches || !centers.length) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        items.forEach((it, i) => {
          const d = Math.abs(e.clientX - centers[i]);
          const k = Math.exp(-((d / RANGE) ** 2));
          it.style.setProperty('--size', `${(BASE + (MAX - BASE) * k).toFixed(1)}px`);
        });
      });
    });
    dock.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); centers = []; reset(); });
    dockMq.addEventListener('change', reset);
  }

  // Мокапы Education: шаг на одну позицию «червяком».
  // Передний телефон трогается первым, остальные — с задержкой; все приходят одновременно.
  const strip = document.querySelector('[data-mockups]');
  if (strip && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'animate' in Element.prototype) {
    const srcs = strip.dataset.mockups.split('|');
    const items = [...strip.querySelectorAll('.mockups__item')];
    const BASE = 43.01, SLOT = 121.51;          // в % от ширины телефона
    const DUR = 900, STAGGER = 70, HOLD = 1200;  // мс; шаг ≈ 2.1 с, как на референсе
    const EASE = 'cubic-bezier(.65, 0, .35, 1)';
    const LAST = items.length - 2;               // самый правый слот (за краем)
    let next = 1;                                // какой мокап встанет в конец ленты следующим
    const pos = (s) => `translateX(${BASE + s * SLOT}%)`;
    const slotOf = (el) => Number(el.style.getPropertyValue('--slot'));

    const step = () => {
      const ordered = [...items].sort((a, b) => slotOf(a) - slotOf(b));
      const anims = ordered.map((el, k) => {
        const s = slotOf(el);
        const delay = k * STAGGER;
        return el.animate([{ transform: pos(s) }, { transform: pos(s - 1) }],
          { duration: DUR - delay, delay, easing: EASE, fill: 'forwards' });
      });
      return Promise.all(anims.map((a) => a.finished)).then(() => {
        ordered.forEach((el, k) => {
          let s = slotOf(el) - 1;
          if (s < -1) { // ушёл за левый край — переносим в конец с новым мокапом
            s = LAST;
            el.src = srcs[next];
            next = (next + 1) % srcs.length;
          }
          el.style.setProperty('--slot', s);
          anims[k].cancel();
        });
      });
    };

    let running = false, looping = false;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const loop = async () => {
      if (looping) return;
      looping = true;
      while (running) {
        await step();
        if (!running) break;
        await wait(HOLD);
      }
      looping = false;
    };
    const start = () => { running = true; loop(); };
    const stop = () => { running = false; };

    const touchMq = window.matchMedia('(hover: none), (max-width: 767px)');
    const card = strip.closest('.project') || strip;
    card.addEventListener('mouseenter', () => { if (!touchMq.matches) start(); });
    card.addEventListener('mouseleave', () => { if (!touchMq.matches) stop(); });
    card.addEventListener('focus', () => { if (!touchMq.matches) start(); });
    card.addEventListener('blur', () => { if (!touchMq.matches) stop(); });
    // На телефоне — постоянно, но только пока карточка на экране
    let inView = false;
    const setView = (v) => {
      inView = v;
      if (touchMq.matches) (inView ? start : stop)();
    };
    const checkView = () => {
      const r = strip.getBoundingClientRect();
      const v = r.bottom > window.innerHeight * 0.1 && r.top < window.innerHeight * 0.9;
      if (v !== inView) setView(v);
    };
    new IntersectionObserver(([e]) => setView(e.isIntersecting), { threshold: 0.2 }).observe(strip);
    window.addEventListener('scroll', checkView, { passive: true });
    checkView();
    touchMq.addEventListener('change', () => { if (touchMq.matches && inView) start(); else stop(); });
  }

  // Презентации: модалка со слайдами и полосой миниатюр
  const deck = document.querySelector('.deck');
  const deckCards = [...document.querySelectorAll('.pres--deck[data-deck]')];
  if (deck && deckCards.length) {
    const slideEl = deck.querySelector('.deck__slide');
    const strip = deck.querySelector('.deck__strip');
    const thumbsBox = deck.querySelector('.deck__thumbs');
    const counter = deck.querySelector('.deck__counter');
    const titleEl = deck.querySelector('.deck__title');
    const prevBtn = deck.querySelector('.deck__nav--prev');
    const nextBtn = deck.querySelector('.deck__nav--next');
    const closeBtn = deck.querySelector('.deck__close');
    let slides = [], index = 0, lastFocus = null, swapTimer = 0;

    const pad = (n) => String(n).padStart(2, '0');
    const thumbMetrics = () => {
      const cs = getComputedStyle(thumbsBox);
      return { tw: parseFloat(cs.getPropertyValue('--tw')), tg: parseFloat(cs.getPropertyValue('--tg')) };
    };
    // сколько миниатюр видно: до 7 на десктопе, на телефоне — сколько влезает
    const visibleCount = () => {
      const { tw, tg } = thumbMetrics();
      const fit = Math.floor((deck.clientWidth - 32 + tg) / (tw + tg));
      return Math.max(1, Math.min(slides.length, 7, fit));
    };
    const layoutThumbs = () => {
      const { tw, tg } = thumbMetrics();
      const v = visibleCount();
      thumbsBox.style.width = `${v * tw + (v - 1) * tg + 8}px`;
      // активная — по центру окна, у краёв окно упирается в начало/конец списка
      const start = Math.min(Math.max(index - Math.floor(v / 2), 0), slides.length - v);
      strip.style.transform = `translateX(${-start * (tw + tg)}px)`;
      [...strip.children].forEach((t, i) => {
        t.classList.toggle('is-active', i === index);
        t.setAttribute('aria-selected', String(i === index));
        t.tabIndex = i >= start && i < start + v ? 0 : -1;
      });
    };
    const show = (i, animate = true) => {
      index = Math.min(Math.max(i, 0), slides.length - 1);
      counter.textContent = `${index + 1} / ${slides.length}`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === slides.length - 1;
      layoutThumbs();
      const src = slides[index];
      clearTimeout(swapTimer);
      if (!animate) { slideEl.src = src; return; }
      slideEl.classList.add('is-swapping');
      swapTimer = setTimeout(() => {
        slideEl.src = src;
        const done = () => slideEl.classList.remove('is-swapping');
        if (slideEl.complete) done(); else slideEl.onload = done;
      }, 150);
      // подгружаем соседний слайд заранее
      if (slides[index + 1]) { const im = new Image(); im.src = slides[index + 1]; }
    };
    const open = (card) => {
      const slug = card.dataset.deck;
      const count = Number(card.dataset.count);
      slides = Array.from({ length: count }, (_, k) => `assets/slides/${slug}/${pad(k + 1)}.jpg`);
      titleEl.textContent = card.dataset.title;
      slideEl.alt = `Слайд презентации «${card.dataset.title}»`;
      strip.innerHTML = '';
      slides.forEach((src, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'deck__thumb';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Слайд ${k + 1}`);
        b.innerHTML = `<img src="${src.replace('.jpg', '-t.jpg')}" alt="" loading="lazy">`;
        b.addEventListener('click', () => show(k));
        strip.appendChild(b);
      });
      lastFocus = document.activeElement;
      strip.style.transition = 'none';
      show(0, false);
      requestAnimationFrame(() => { strip.style.transition = ''; });
      deck.setAttribute('aria-hidden', 'false');
      deck.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    };
    const close = () => {
      deck.classList.remove('is-open');
      deck.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    deckCards.forEach((card) => card.addEventListener('click', () => open(card)));
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));
    closeBtn.addEventListener('click', close);
    // клик по пустому месту вокруг слайда — закрыть
    deck.querySelector('.deck__stage').addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });
    document.addEventListener('keydown', (e) => {
      if (!deck.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    // Телефон: тап по левой/правой половине слайда и свайп
    const stage = deck.querySelector('.deck__stage');
    let tx = null, swiped = false;
    stage.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; swiped = false; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) { swiped = true; show(index + (dx < 0 ? 1 : -1)); }
      tx = null;
    });
    deck.querySelector('.deck__zone--prev').addEventListener('click', () => { if (!swiped) show(index - 1); swiped = false; });
    deck.querySelector('.deck__zone--next').addEventListener('click', () => { if (!swiped) show(index + 1); swiped = false; });
    window.addEventListener('resize', () => { if (deck.classList.contains('is-open')) layoutThumbs(); });
  }

  // Презентация-прототип из Figma (Smart Animate): iframe грузится только по клику
  const proto = document.querySelector('.proto');
  if (proto) {
    const frame = proto.querySelector('.proto__frame');
    const closeP = proto.querySelector('.proto__close');
    let lastFocusP = null;
    const openP = (card) => {
      lastFocusP = document.activeElement;
      proto.querySelector('.proto__title, .deck__title').textContent = card.dataset.title;
      const iframe = document.createElement('iframe');
      iframe.src = card.dataset.figma;
      iframe.title = `Презентация «${card.dataset.title}» в Figma`;
      iframe.allowFullscreen = true;
      iframe.addEventListener('load', () => frame.querySelector('.proto__loader')?.remove());
      frame.appendChild(iframe);
      proto.setAttribute('aria-hidden', 'false');
      proto.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      closeP.focus({ preventScroll: true });
    };
    const closeProto = () => {
      proto.classList.remove('is-open');
      proto.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      // убираем iframe после анимации закрытия, чтобы не грузил процессор
      setTimeout(() => {
        frame.querySelector('iframe')?.remove();
        if (!frame.querySelector('.proto__loader')) frame.insertAdjacentHTML('afterbegin', '<span class="proto__loader" aria-hidden="true"></span>');
      }, 300);
      if (lastFocusP) lastFocusP.focus({ preventScroll: true });
    };
    document.querySelectorAll('.pres--deck[data-figma]').forEach((card) => card.addEventListener('click', () => openP(card)));
    closeP.addEventListener('click', closeProto);
    proto.querySelector('.proto__stage').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeProto(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && proto.classList.contains('is-open')) closeProto(); });
  }

  // Год в футере
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Видео-аватар: пауза, если вкладка не видна (экономим батарею)
  const video = document.querySelector('.avatar__video');
  if (video) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause(); else video.play().catch(() => {});
    });
  }
})();
