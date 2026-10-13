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

  // Появление блоков при скролле
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

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
