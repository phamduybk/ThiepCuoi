(() => {
  'use strict';

  const cfg = window.WEDDING_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => { const el = $(id); if (el && value !== undefined && value !== null) el.textContent = String(value); };

  const bride = String(cfg.brideName || 'CÔ DÂU');
  const groom = String(cfg.groomName || 'CHÚ RỂ');
  text('brideName', bride);
  text('groomName', groom);
  text('footerNames', `${bride} & ${groom}`);
  text('invitationLine', cfg.invitationLine || 'Trân trọng kính mời bạn đến chung vui.');
  text('dateText', cfg.dateText || 'NGÀY CƯỚI');
  text('timeText', cfg.timeText || '');
  text('venueName', cfg.venueName || 'ĐỊA ĐIỂM TỔ CHỨC');
  text('venueAddress', cfg.venueAddress || '');
  document.title = `${bride} & ${groom} · Thiệp cưới`;

  // Cá nhân hóa hoàn toàn cục bộ: ?guest=Nguyen%20Van%20A
  const params = new URLSearchParams(window.location.search);
  const guest = (params.get('guest') || '').trim().slice(0, 120);
  if (guest) {
    const line = $('guestLine');
    line.textContent = `Kính mời ${guest}`;
    line.hidden = false;
  }

  // Không nhúng bản đồ/iframe. Chỉ điều hướng khi khách chủ động bấm.
  const map = $('mapButton');
  if (map && typeof cfg.mapUrl === 'string' && /^https:\/\//i.test(cfg.mapUrl)) {
    map.href = cfg.mapUrl;
    map.target = '_blank';
    map.hidden = false;
  }

  const phone = $('phoneButton');
  const phoneValue = String(cfg.rsvpPhone || '').replace(/[^+\d]/g, '');
  if (phone && phoneValue) {
    phone.href = `tel:${phoneValue}`;
    phone.hidden = false;
  }

  const email = $('emailButton');
  const emailValue = String(cfg.rsvpEmail || '').trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    const subject = encodeURIComponent(`Xác nhận tham dự đám cưới ${bride} & ${groom}`);
    email.href = `mailto:${emailValue}?subject=${subject}`;
    email.hidden = false;
  }

  // Ảnh chỉ được tải từ đường dẫn tương đối trong repo.
  const gallery = Array.isArray(cfg.gallery) ? cfg.gallery : [];
  ['photo1', 'photo2', 'photo3'].forEach((id, i) => {
    const src = String(gallery[i] || '');
    const el = $(id);
    if (el && /^(?![a-z]+:|\/\/)[\w./-]+$/i.test(src)) el.src = src;
  });

  // Đếm ngược cục bộ.
  const target = cfg.eventDate ? new Date(cfg.eventDate) : null;
  const countdown = $('countdown');
  let timer = null;
  const renderCountdown = () => {
    if (!target || Number.isNaN(target.getTime()) || !countdown) return;
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      text('days', 0); text('hours', 0); text('minutes', 0); text('seconds', 0);
      if (timer) window.clearInterval(timer);
      return;
    }
    const total = Math.floor(diff / 1000);
    text('days', Math.floor(total / 86400));
    text('hours', Math.floor((total % 86400) / 3600));
    text('minutes', Math.floor((total % 3600) / 60));
    text('seconds', total % 60);
  };
  if (target && !Number.isNaN(target.getTime()) && countdown) {
    countdown.hidden = false;
    renderCountdown();
    timer = window.setInterval(renderCountdown, 1000);
  }

  // Tạo .ics hoàn toàn trong trình duyệt; không gọi dịch vụ lịch bên ngoài.
  const calendar = $('calendarButton');
  if (calendar) {
    if (!target || Number.isNaN(target.getTime())) {
      calendar.hidden = true;
    } else {
      calendar.addEventListener('click', (event) => {
        event.preventDefault();
        const pad = (n) => String(n).padStart(2, '0');
        const utcStamp = (date) => `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
        const start = utcStamp(target);
        const end = utcStamp(new Date(target.getTime() + 3 * 60 * 60 * 1000));
        const safe = (v) => String(v || '').replace(/[\\;,\n]/g, ' ');
        const ics = [
          'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Personal Wedding Invitation//VI','BEGIN:VEVENT',
          `DTSTART:${start}`, `DTEND:${end}`, `SUMMARY:${safe(`${bride} & ${groom}`)}`,
          `LOCATION:${safe(cfg.venueAddress)}`, 'END:VEVENT','END:VCALENDAR'
        ].join('\r\n');
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dam-cuoi.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }
  }
})();
