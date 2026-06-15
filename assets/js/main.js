/* ============================================================
   CRYSTAL AUTO — main.js
   Биндинг данных, рендер секций, навигация, анимации, карта.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.CRYSTAL_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Иконки (line, 24x24, currentColor) ---------- */
  var ICONS = {
    seat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 4h7a2 2 0 0 1 2 2v7H9a2 2 0 0 1-2-2V4z"/><path d="M7 13v3a3 3 0 0 0 3 3h7"/><path d="M16 19v1"/></svg>',
    leather: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 9l5 5M9 4l11 11M14 4l6 6M4 14l6 6"/></svg>',
    fabric: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7c2-2 4-2 6 0s4 2 6 0 2-2 4-2"/><path d="M4 12c2-2 4-2 6 0s4 2 6 0 2-2 4-2"/><path d="M4 17c2-2 4-2 6 0s4 2 6 0 2-2 4-2"/></svg>',
    floor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 20l4-14h10l4 14"/><path d="M6 13h12M8 9h8M5 17h14"/></svg>',
    ceiling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 4h18"/><path d="M5 4l3 6M19 4l-3 6M12 4v6"/><rect x="6" y="10" width="12" height="10" rx="2"/></svg>',
    ozone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.8l1.2-6.6L2.5 9l6.6-.9L12 2z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13"/><path d="M12 8S10.5 3.5 8 4.5 9.5 8 12 8zM12 8s1.5-4.5 4-3.5S14.5 8 12 8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12.5l4.5 4.5L19 7"/></svg>'
  };
  window.CRYSTAL_ICONS = ICONS;

  /* ---------- Биндинг простых значений ---------- */
  function bindData() {
    var c = CFG.contacts || {};
    var map = {
      brandName: (CFG.brand && CFG.brand.name) || "CRYSTAL AUTO",
      brandTagline: (CFG.brand && CFG.brand.tagline) || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      addressNote: c.addressNote || "",
      hours: c.hours || "",
      social: c.social || "",
      year: (CFG.legal && CFG.legal.year) || new Date().getFullYear()
    };
    $$("[data-bind]").forEach(function (el) {
      var key = el.getAttribute("data-bind");
      if (key === "privacy") { el.setAttribute("href", (CFG.legal && CFG.legal.privacyUrl) || "#"); return; }
      if (map[key] != null && map[key] !== "") el.textContent = map[key];
    });
    // href bindings
    $$("[data-href]").forEach(function (el) {
      var key = el.getAttribute("data-href");
      if (key === "phone") el.setAttribute("href", "tel:" + (c.phoneHref || "").replace(/\s/g, ""));
      else if (key === "email") el.setAttribute("href", "mailto:" + (c.email || ""));
      else if (c[key]) el.setAttribute("href", c[key]); // instagram / vk / telegram / whatsapp
    });
  }

  /* ---------- Навигация ---------- */
  function renderNav() {
    var links = CFG.nav || [];
    var ul = $("#navLinks"), mob = $("#mobileLinks");
    links.forEach(function (item) {
      if (ul) {
        var li = document.createElement("li");
        li.innerHTML = '<a class="nav__link" href="' + item.href + '" data-scroll>' + item.label + "</a>";
        ul.appendChild(li);
      }
      if (mob) {
        var mli = document.createElement("li");
        mli.innerHTML = '<a class="mobile-menu__link" href="' + item.href + '" data-scroll>' + item.label + "</a>";
        mob.appendChild(mli);
      }
    });
  }

  /* ---------- Hero meta + marquee + stats ---------- */
  function renderStats() {
    var stats = CFG.stats || [];
    var hero = $("#heroMeta");
    if (hero) {
      stats.slice(0, 3).forEach(function (s) {
        var d = document.createElement("div");
        d.className = "hero__meta-item";
        d.innerHTML = "<b>" + s.value + "</b><span>" + s.label + "</span>";
        hero.appendChild(d);
      });
    }
    var row = $("#statsRow");
    if (row) {
      stats.forEach(function (s, i) {
        var d = document.createElement("div");
        d.setAttribute("data-reveal", "");
        d.setAttribute("data-reveal-delay", String((i % 4) + 1));
        d.innerHTML = '<div class="stat__value">' + s.value + '</div><div class="stat__label">' + s.label + "</div>";
        row.appendChild(d);
      });
    }
    var mq = $("#marquee");
    if (mq) {
      var words = ["Кожа", "Алькантара", "Текстиль", "Потолок", "Озонирование", "Защита", "Контроль влаги", "Без разводов"];
      var html = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
      mq.innerHTML = html + html; // дублируем для бесшовной прокрутки
    }
  }

  /* ---------- Услуги ---------- */
  function renderServices() {
    var grid = $("#servicesGrid");
    if (!grid) return;
    (CFG.services || []).forEach(function (s, i) {
      var num = ("0" + (i + 1)).slice(-2);
      var icon = ICONS[s.icon] || ICONS.shield;
      var card = document.createElement("article");
      card.className = "service-card";
      card.setAttribute("data-reveal", "");
      card.setAttribute("data-reveal-delay", String((i % 3) + 1));
      card.innerHTML =
        '<div class="service-card__top">' +
          '<span class="service-card__icon">' + icon + "</span>" +
          '<span class="service-card__num">' + num + "</span>" +
        "</div>" +
        '<div class="service-card__body">' +
          '<h3 class="service-card__title">' + s.title + "</h3>" +
          '<p class="service-card__desc">' + s.desc + "</p>" +
          '<div class="service-card__meta">' +
            '<span class="service-card__price">Стоимость: <b>' + (s.price || "по запросу") + "</b></span>" +
            '<a href="#booking" class="service-card__arrow" data-scroll aria-label="Записаться на услугу: ' + s.title + '">' + ICONS.arrow + "</a>" +
          "</div>" +
        "</div>";
      grid.appendChild(card);
    });
  }

  /* ---------- Прейскурант ---------- */
  function renderPricing() {
    var p = CFG.pricing;
    if (!p) return;

    var main = $("#pricingMain");
    if (main) {
      var cols = p.complexColumns || [];
      var thead = "<thead><tr>" + cols.map(function (c, i) {
        return "<th" + (i === 0 ? "" : ' class="num-h"') + ">" + c + "</th>";
      }).join("") + "</tr></thead>";
      var rows = (p.complexRows || []).map(function (r) {
        return "<tr><td class=\"cls\">" + r.cls + "<small>" + r.note + "</small></td>" +
          '<td class="num std">' + r.standard + "</td>" +
          '<td class="num prem">' + r.premium + "</td></tr>";
      }).join("");
      var legend = (p.packages || []).map(function (pk) {
        return "<p><b>" + pk.name + "</b> — " + pk.desc + "</p>";
      }).join("");
      main.innerHTML =
        '<h3 class="price-card__title">' + p.complexTitle + "</h3>" +
        '<div class="price-table-wrap"><table class="price-table">' + thead + "<tbody>" + rows + "</tbody></table></div>" +
        (legend ? '<div class="price-legend">' + legend + "</div>" : "");
    }

    var ex = $("#pricingExtras");
    if (ex) {
      var items = (p.extras || []).map(function (e) {
        return '<div class="extra-row"><span class="extra-row__name">' + e.name +
          '</span><span class="extra-row__dots" aria-hidden="true"></span><span class="extra-row__price">' + e.price + "</span></div>";
      }).join("");
      var notes = (p.notes || []).map(function (n) {
        return '<li class="price-note"><span class="price-note__i">' + ICONS.check + "</span><span>" + n + "</span></li>";
      }).join("");
      ex.innerHTML =
        '<h3 class="price-card__title">' + (p.extrasTitle || "Дополнительные услуги") + "</h3>" +
        '<div class="extras-list">' + items + "</div>" +
        (notes ? '<h4 class="price-subtitle">' + (p.notesTitle || "Важно знать") + '</h4><ul class="price-notes">' + notes + "</ul>" : "");
    }

    var promos = $("#pricingPromos");
    if (promos) {
      promos.innerHTML = (p.promos || []).map(function (pr) {
        var icon = ICONS[pr.icon] || ICONS.shield;
        return '<div class="promo-card"><span class="promo-card__icon">' + icon + "</span>" +
          '<div><h4 class="promo-card__title">' + pr.title + '</h4><p class="promo-card__text">' + pr.text + "</p></div></div>";
      }).join("");
    }
  }

  /* ---------- Процесс ---------- */
  function renderProcess() {
    var wrap = $("#processSteps");
    if (!wrap) return;
    (CFG.process || []).forEach(function (st, i) {
      var num = ("0" + (i + 1)).slice(-2);
      var el = document.createElement("div");
      el.className = "step";
      el.innerHTML =
        '<div class="step__num">' + num + "</div>" +
        "<div><h3 class=\"step__title\">" + st.title + '</h3><p class="step__desc">' + st.desc + "</p></div>";
      wrap.appendChild(el);
    });
  }

  /* ---------- Почему мы ---------- */
  function renderFeatures() {
    var grid = $("#featuresGrid");
    if (!grid) return;
    (CFG.features || []).forEach(function (f, i) {
      var icon = ICONS[f.icon] || ICONS.shield;
      var el = document.createElement("div");
      el.className = "feature";
      el.setAttribute("data-reveal", "");
      el.setAttribute("data-reveal-delay", String((i % 3) + 1));
      el.innerHTML =
        '<div class="feature__icon">' + icon + "</div>" +
        '<h3 class="feature__title">' + f.title + "</h3>" +
        '<p class="feature__desc">' + f.desc + "</p>";
      grid.appendChild(el);
    });
  }

  /* ---------- Отзывы ---------- */
  function renderReviews() {
    var grid = $("#reviewsGrid");
    if (!grid) return;
    (CFG.testimonials || []).forEach(function (t, i) {
      var stars = "";
      for (var k = 0; k < (t.rating || 5); k++) stars += ICONS.star;
      var initial = (t.name || "•").replace(/\[.*?\]\s*/, "").trim().charAt(0) || "★";
      var el = document.createElement("figure");
      el.className = "testimonial";
      el.setAttribute("data-reveal", "");
      el.setAttribute("data-reveal-delay", String((i % 3) + 1));
      el.innerHTML =
        '<div class="testimonial__stars" aria-label="Оценка ' + (t.rating || 5) + ' из 5">' + stars + "</div>" +
        '<blockquote class="testimonial__quote">«' + t.text + '»</blockquote>' +
        '<figcaption class="testimonial__author">' +
          '<span class="testimonial__avatar">' + initial + "</span>" +
          "<span><span class=\"testimonial__name\">" + t.name + '</span><br><span class="testimonial__role">' + (t.role || "") + "</span></span>" +
        "</figcaption>";
      grid.appendChild(el);
    });
  }

  /* ---------- Inverted callout ---------- */
  function renderCallout() {
    var el = $("#callout");
    if (!el || !CFG.callout) return;
    var c = CFG.callout;
    el.innerHTML =
      "<div>" +
        '<p class="eyebrow" style="margin-bottom:24px;">' + (c.eyebrow || "") + "</p>" +
        '<p class="quote">' + (c.quote || "") + "</p>" +
      "</div>" +
      '<div><p class="body">' + (c.text || "") + "</p></div>";
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    var cols = $("#footerCols");
    if (!cols) return;
    var c = CFG.contacts || {};
    var navCol = (CFG.nav || []).map(function (n) {
      return '<a href="' + n.href + '" data-scroll>' + n.label + "</a>";
    }).join("");

    var channels = "";
    if (c.whatsapp) channels += '<a href="' + c.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>';
    if (c.telegram) channels += '<a href="' + c.telegram + '" target="_blank" rel="noopener">Telegram</a>';
    if (c.instagram) channels += '<a href="' + c.instagram + '" target="_blank" rel="noopener">Instagram' + (c.social ? " · " + c.social : "") + "</a>";
    if (c.vk) channels += '<a href="' + c.vk + '" target="_blank" rel="noopener">ВКонтакте</a>';
    if (!channels) channels = '<p class="muted">Соцсети — добавьте в config.js</p>';

    var emailLine = c.email ? '<a href="mailto:' + c.email + '">' + c.email + "</a>" : "";

    cols.innerHTML =
      '<div class="footer__col"><h4>Навигация</h4>' + navCol + "</div>" +
      '<div class="footer__col"><h4>Контакты</h4>' +
        '<a href="tel:' + (c.phoneHref || "") + '">' + (c.phone || "") + "</a>" +
        emailLine +
        "<p>" + (c.address || "") + "</p>" +
        "<p>" + (c.hours || "") + "</p>" +
      "</div>" +
      '<div class="footer__col"><h4>Студия</h4>' +
        '<a href="#booking" data-scroll>Записаться</a>' +
        '<a href="#pricing" data-scroll>Цены</a>' +
        '<a href="#works" data-scroll>Работы</a>' +
      "</div>" +
      '<div class="footer__col"><h4>Мы на связи</h4>' + channels + "</div>";
  }

  /* ---------- Карта (Яндекс) ---------- */
  function initMap() {
    var box = $("#map");
    var ph = $("#mapPlaceholder");
    var txt = $("#mapText");
    var m = CFG.map || {};
    if (txt) txt.textContent = m.placeholderText || "Карта проезда добавляется в config.js.";

    // Вариант 1: готовый iframe из Конструктора Яндекс.Карт
    if (m.embedUrl) {
      var ifr = document.createElement("iframe");
      ifr.src = m.embedUrl;
      ifr.title = "Карта проезда — CRYSTAL AUTO";
      ifr.loading = "lazy";
      ifr.setAttribute("allowfullscreen", "");
      box.insertBefore(ifr, ph);
      if (ph) ph.style.display = "none";
      return;
    }

    // Вариант 2: JS API (если задан ключ) — подгружаем по требованию
    if (m.apiKey) {
      var s = document.createElement("script");
      s.src = "https://api-maps.yandex.ru/2.1/?apikey=" + encodeURIComponent(m.apiKey) + "&lang=ru_RU";
      s.onload = function () {
        if (!window.ymaps) return;
        window.ymaps.ready(function () {
          var holder = document.createElement("div");
          holder.id = "ya-map";
          box.insertBefore(holder, ph);
          if (ph) ph.style.display = "none";
          var map = new window.ymaps.Map("ya-map", { center: m.coords, zoom: m.zoom || 16, controls: ["zoomControl"] });
          map.behaviors.disable("scrollZoom");
          var pm = new window.ymaps.Placemark(m.coords, { balloonContent: (CFG.brand && CFG.brand.name) || "CRYSTAL AUTO" });
          map.geoObjects.add(pm);
        });
      };
      document.head.appendChild(s);
      return;
    }
    // Иначе — остаётся аккуратная заглушка
  }

  /* ---------- Шапка: скролл-поведение ---------- */
  function initHeader() {
    var header = $("#header");
    var last = 0;
    function onScroll() {
      var y = window.pageYOffset;
      if (y > 24) header.classList.add("is-scrolled"); else header.classList.remove("is-scrolled");
      if (y > 600 && y > last + 4) header.classList.add("is-hidden");
      else if (y < last - 4 || y < 600) header.classList.remove("is-hidden");
      last = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Мобильное меню ---------- */
  function initMobileMenu() {
    var burger = $("#burger"), menu = $("#mobileMenu");
    if (!burger || !menu) return;
    function close() {
      burger.classList.remove("is-open");
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
    }
    function toggle() {
      var open = menu.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("is-locked", open);
    }
    burger.addEventListener("click", toggle);
    menu.addEventListener("click", function (e) {
      if (e.target.closest("[data-scroll]")) close();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.__closeMobileMenu = close;
  }

  /* ---------- Плавный скролл ---------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[data-scroll], a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href === "#" || href.charAt(0) !== "#") return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      if (window.__closeMobileMenu) window.__closeMobileMenu();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 64;
      window.scrollTo({ top: top, behavior: prefersReduced ? "auto" : "smooth" });
      history.replaceState(null, "", href);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function setupReveals() {
    var els = $$("[data-reveal]");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scrollspy: активная ссылка ---------- */
  function setupScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    var ids = (CFG.nav || []).map(function (n) { return n.href.slice(1); });
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        $$(".nav__link").forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Ленивое воспроизведение видео ---------- */
  function setupLazyVideos() {
    var vids = $$("video[data-lazy-video]");
    if (!("IntersectionObserver" in window)) { vids.forEach(function (v) { v.play().catch(function(){}); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { v.play().catch(function(){}); }
        else { v.pause(); }
      });
    }, { threshold: 0.2 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    bindData();
    renderNav();
    renderStats();
    renderServices();
    renderPricing();
    renderProcess();
    renderFeatures();
    renderReviews();
    renderCallout();
    renderFooter();
    initMap();
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    setupScrollSpy();
    setupLazyVideos();
    // reveal — после того, как все модули (before-after, accordion, booking) отрисовали DOM
    if (window.requestAnimationFrame) requestAnimationFrame(setupReveals);
    else setupReveals();
  });
})();
