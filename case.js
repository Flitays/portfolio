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
})();
