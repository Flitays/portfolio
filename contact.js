// Окно «Связаться»: модалка на десктопе, шторка снизу на телефоне.
// Подключается на всех страницах; открывается кнопками с data-contact (без JS они ведут в Telegram).
(() => {
  const EMAIL = 'moonmywife@gmail.com';
  const ICONS = {
    mail: '<svg viewBox="0 0 16.6667 13.3333" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 13.3333C1.83696 13.3333 1.20107 13.0699 0.732233 12.6011C0.263392 12.1323 0 11.4964 0 10.8333V2.5C0 1.83696 0.263392 1.20107 0.732233 0.732233C1.20107 0.263392 1.83696 0 2.5 0H14.1667C14.8297 0 15.4656 0.263392 15.9344 0.732233C16.4033 1.20107 16.6667 1.83696 16.6667 2.5V10.8333C16.6667 11.4964 16.4033 12.1323 15.9344 12.6011C15.4656 13.0699 14.8297 13.3333 14.1667 13.3333H2.5ZM4.6875 3.51667C4.60261 3.44418 4.50403 3.38949 4.39759 3.35584C4.29116 3.32218 4.17906 3.31026 4.06793 3.32076C3.9568 3.33127 3.84891 3.36399 3.75067 3.417C3.65243 3.47 3.56584 3.5422 3.49604 3.62931C3.42624 3.71642 3.37466 3.81666 3.34434 3.92409C3.31403 4.03152 3.30561 4.14395 3.31958 4.2547C3.33355 4.36544 3.36963 4.47226 3.42567 4.56879C3.48172 4.66533 3.55659 4.74962 3.64583 4.81667L6.77083 7.3175C7.21424 7.67251 7.76532 7.86594 8.33333 7.86594C8.90135 7.86594 9.45243 7.67251 9.89583 7.3175L13.0208 4.8175C13.1063 4.7491 13.1775 4.66454 13.2303 4.56864C13.283 4.47275 13.3164 4.36739 13.3285 4.25859C13.3406 4.14979 13.3311 4.03968 13.3006 3.93454C13.2701 3.82941 13.2192 3.7313 13.1508 3.64583C13.0824 3.56036 12.9979 3.4892 12.902 3.43642C12.8061 3.38363 12.7007 3.35024 12.5919 3.33817C12.4831 3.3261 12.373 3.33558 12.2679 3.36606C12.1627 3.39654 12.0646 3.44744 11.9792 3.51583L8.85417 6.01583C8.70636 6.13417 8.52267 6.19865 8.33333 6.19865C8.144 6.19865 7.9603 6.13417 7.8125 6.01583L4.6875 3.51667Z"/></svg>',
    tg: '<svg viewBox="0 0 17.4998 14.5834" fill="currentColor" aria-hidden="true"><path d="M16.0085 0.128757C16.0085 0.128757 17.6272 -0.502493 17.4918 1.03042C17.4472 1.66167 17.0426 3.87126 16.7276 6.26084L15.6485 13.34C15.6485 13.34 15.5585 14.3771 14.7489 14.5575C13.9397 14.7375 12.7255 13.9263 12.5005 13.7458C12.3205 13.6104 9.12804 11.5813 8.00387 10.5896C7.68887 10.3188 7.32887 9.77792 8.04887 9.14667L12.7705 4.63751C13.3101 4.09584 13.8497 2.83334 11.6014 4.36667L5.30554 8.65001C5.30554 8.65001 4.58596 9.10126 3.23721 8.69542L0.313873 7.79334C0.313873 7.79334 -0.765294 7.11709 1.07846 6.44084C5.57554 4.32167 11.1068 2.15751 16.008 0.12834"/></svg>',
    ig: '<svg viewBox="3 3 18 18" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 3h7A5.5 5.5 0 0 1 21 8.5v7a5.5 5.5 0 0 1-5.5 5.5h-7A5.5 5.5 0 0 1 3 15.5v-7A5.5 5.5 0 0 1 8.5 3ZM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10ZM12 8.8a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 1 0 0-6.4ZM17.4 5.4a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0-2.4Z"/></svg>',
    pin: '<svg viewBox="0 0 16.6667 16.6667" fill="currentColor" aria-hidden="true"><path d="M5.86667 16.2833C6.66667 16.525 7.475 16.6667 8.33333 16.6667C10.5435 16.6667 12.6631 15.7887 14.2259 14.2259C15.7887 12.6631 16.6667 10.5435 16.6667 8.33333C16.6667 7.23898 16.4511 6.15535 16.0323 5.1443C15.6135 4.13326 14.9997 3.2146 14.2259 2.44078C13.4521 1.66696 12.5334 1.05313 11.5224 0.634337C10.5113 0.215548 9.42768 0 8.33333 0C7.23898 0 6.15535 0.215548 5.1443 0.634337C4.13326 1.05313 3.2146 1.66696 2.44078 2.44078C0.877974 4.00358 0 6.1232 0 8.33333C0 11.875 2.225 14.9167 5.36667 16.1167C5.29167 15.4667 5.21667 14.3917 5.36667 13.65L6.325 9.53333C6.325 9.53333 6.08333 9.05 6.08333 8.28333C6.08333 7.13333 6.8 6.275 7.61667 6.275C8.33333 6.275 8.66667 6.8 8.66667 7.475C8.66667 8.19167 8.19167 9.21667 7.95 10.2C7.80833 11.0167 8.38333 11.7333 9.21667 11.7333C10.7 11.7333 11.85 10.15 11.85 7.91667C11.85 5.91667 10.4167 4.55 8.35833 4.55C6.00833 4.55 4.625 6.3 4.625 8.14167C4.625 8.85833 4.85833 9.58333 5.24167 10.0583C5.31667 10.1083 5.31667 10.175 5.29167 10.3L5.05 11.2083C5.05 11.35 4.95833 11.4 4.81667 11.3C3.75 10.8333 3.13333 9.31667 3.13333 8.09167C3.13333 5.45833 5 3.06667 8.6 3.06667C11.4667 3.06667 13.7 5.125 13.7 7.85833C13.7 10.725 11.925 13.025 9.38333 13.025C8.575 13.025 7.78333 12.5917 7.5 12.0833L6.94167 14.0583C6.75 14.775 6.225 15.7333 5.86667 16.3083V16.2833Z"/></svg>',
    cv: '<svg viewBox="0 0 16 18" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 0h7.4a1.5 1.5 0 0 1 1.06.44l4.6 4.6A1.5 1.5 0 0 1 16 6.1V15.5A2.5 2.5 0 0 1 13.5 18h-11A2.5 2.5 0 0 1 0 15.5v-13A2.5 2.5 0 0 1 2.5 0ZM4.5 9h7a.9.9 0 0 1 0 1.8h-7a.9.9 0 0 1 0-1.8ZM4.5 12.6h4.6a.9.9 0 0 1 0 1.8H4.5a.9.9 0 0 1 0-1.8Z"/></svg>',
    copy: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M13 7V5.5A2.5 2.5 0 0 0 10.5 3h-5A2.5 2.5 0 0 0 3 5.5v5A2.5 2.5 0 0 0 5.5 13H7"/></svg>',
    check: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>',
    out: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 3.5h5.5V9M16.5 3.5 9 11M14 11.5v3A2 2 0 0 1 12 16.5H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>',
  };
  const ITEMS = [
    { icon: 'mail', label: 'Почта', value: EMAIL, copy: true },
    { icon: 'tg', label: 'Telegram', value: '@flitay', href: 'https://t.me/flitay' },
    { icon: 'ig', label: 'Instagram', value: '@flitays', href: 'https://www.instagram.com/flitays/' },
    { icon: 'pin', label: 'Pinterest', value: 'flitays', href: 'https://ru.pinterest.com/flitays/' },
    { icon: 'cv', label: 'Резюме', value: 'Открыть CV', href: 'https://drive.google.com/file/d/1uZowFEQ-JIogMLKeHc2R57VcVjRtZW8_/view?usp=sharing' },
  ];

  const triggers = document.querySelectorAll('[data-contact]');
  if (!triggers.length) return;

  const row = (it) => {
    const inner = `<span class="contact__icon contact__icon--${it.icon}">${ICONS[it.icon]}</span>
      <span class="contact__text"><span class="contact__label">${it.label}</span><span class="contact__value">${it.value}</span></span>
      <span class="contact__action">${it.copy ? ICONS.copy : ICONS.out}</span>`;
    return it.copy
      ? `<button class="contact__row" type="button" data-copy-email>${inner}</button>`
      : `<a class="contact__row" href="${it.href}" target="_blank" rel="noopener">${inner}</a>`;
  };
  const box = document.createElement('div');
  box.className = 'contact';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = `<div class="contact__sheet" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <span class="contact__grab" aria-hidden="true"></span>
      <div class="contact__head">
        <h2 class="contact__title" id="contact-title">Связаться</h2>
        <button class="contact__close" type="button" aria-label="Закрыть">${ICONS.close}</button>
      </div>
      <div class="contact__list">${ITEMS.map(row).join('')}</div>
    </div>`;
  document.body.appendChild(box);
  const sheet = box.querySelector('.contact__sheet');
  const closeBtn = box.querySelector('.contact__close');

  // блокировка прокрутки без «скачка» (те же --sb, что у остальных модалок)
  const lock = () => {
    const h = document.documentElement;
    const sb = innerWidth - h.clientWidth;
    if (sb > 0) { h.style.setProperty('--sb', `${sb}px`); h.style.paddingRight = `${sb}px`; }
    h.style.overflow = 'hidden';
  };
  const unlock = () => {
    const h = document.documentElement;
    h.style.overflow = ''; h.style.paddingRight = ''; h.style.removeProperty('--sb');
  };

  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    box.setAttribute('aria-hidden', 'false');
    box.classList.add('is-open');
    lock();
    closeBtn.focus({ preventScroll: true });
  };
  const close = () => {
    if (!box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    sheet.style.transform = '';
    unlock();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  triggers.forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // копирование почты: иконка на секунду меняется на галочку
  const copyRow = box.querySelector('[data-copy-email]');
  copyRow.addEventListener('click', () => {
    const done = () => {
      const label = copyRow.querySelector('.contact__label');
      const action = copyRow.querySelector('.contact__action');
      label.textContent = 'Скопировано';
      action.innerHTML = ICONS.check;
      copyRow.classList.add('is-copied');
      clearTimeout(copyRow._t);
      copyRow._t = setTimeout(() => {
        label.textContent = 'Почта';
        action.innerHTML = ICONS.copy;
        copyRow.classList.remove('is-copied');
      }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done).catch(() => { location.href = `mailto:${EMAIL}`; });
    else location.href = `mailto:${EMAIL}`;
  });

  // шторка на телефоне закрывается свайпом вниз
  let startY = null, dy = 0;
  sheet.addEventListener('touchstart', (e) => {
    if (!matchMedia('(max-width: 640px)').matches) return;
    startY = e.touches[0].clientY; dy = 0;
    sheet.style.transition = 'none';
  }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (startY === null) return;
    dy = Math.max(0, e.touches[0].clientY - startY);
    sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener('touchend', () => {
    if (startY === null) return;
    startY = null;
    sheet.style.transition = '';
    if (dy > 80) close(); else sheet.style.transform = '';
  });
})();
