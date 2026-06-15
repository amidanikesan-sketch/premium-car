/* ============================================================
   CRYSTAL AUTO — booking.js
   Форма записи: рендер опций, валидация, отправка.
   Frontend-ready: подключается к backend/CRM/мессенджеру через config.
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.CRYSTAL_CONFIG || {};
  var BK = CFG.booking || {};
  var C = CFG.contacts || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };

  function renderServiceChoices() {
    var wrap = $("#serviceChoices");
    if (!wrap) return;
    var names = (CFG.services || []).map(function (s) { return s.title; })
      .concat(BK.extraServices || []);
    names.forEach(function (name, i) {
      var label = document.createElement("label");
      label.className = "choice";
      label.innerHTML =
        '<input type="radio" name="service" value="' + name.replace(/"/g, "&quot;") + '"' + (i === 0 ? " checked" : "") + " />" +
        "<span>" + name + "</span>";
      wrap.appendChild(label);
    });
  }

  function renderTimeSlots() {
    var sel = $("#bk-time");
    if (!sel) return;
    (BK.timeSlots || []).forEach(function (t) {
      var o = document.createElement("option");
      o.value = t; o.textContent = t;
      sel.appendChild(o);
    });
  }

  function renderChannels() {
    var wrap = $("#bookingChannels");
    if (!wrap) return;
    var html = "";
    if (C.whatsapp) html += '<a class="btn btn--ghost" href="' + C.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>';
    if (C.telegram) html += '<a class="btn btn--ghost" href="' + C.telegram + '" target="_blank" rel="noopener">Telegram</a>';
    if (C.instagram) html += '<a class="btn btn--ghost" href="' + C.instagram + '" target="_blank" rel="noopener">Instagram</a>';
    if (C.vk) html += '<a class="btn btn--ghost" href="' + C.vk + '" target="_blank" rel="noopener">ВКонтакте</a>';
    wrap.innerHTML = html;
  }

  function setError(name, msg) {
    var field = document.querySelector('[name="' + name + '"]');
    var box = field ? field.closest(".field") : null;
    var err = document.querySelector('[data-error-for="' + name + '"]');
    if (box) box.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
  }

  function validate(data) {
    var ok = true;
    if (!data.name || data.name.trim().length < 2) { setError("name", "Укажите имя"); ok = false; }
    else setError("name", "");
    var digits = (data.phone || "").replace(/\D/g, "");
    if (digits.length < 10) { setError("phone", "Укажите корректный телефон"); ok = false; }
    else setError("phone", "");
    return ok;
  }

  function showStatus(text, success) {
    var s = $("#formStatus");
    if (!s) return;
    s.textContent = text;
    s.classList.add("is-visible");
    s.classList.toggle("is-success", !!success);
  }

  function buildMessengerLink(data) {
    var lines = [
      "Заявка на химчистку — " + ((CFG.brand && CFG.brand.name) || ""),
      "Имя: " + data.name,
      "Телефон: " + data.phone,
      "Услуга: " + (data.service || "—"),
      data.car ? "Авто: " + data.car : "",
      data.time ? "Время: " + data.time : "",
      data.comment ? "Комментарий: " + data.comment : ""
    ].filter(Boolean);
    var text = encodeURIComponent(lines.join("\n"));
    if (C.whatsapp) {
      var num = C.whatsapp.replace(/\D/g, "");
      return { url: "https://wa.me/" + num + "?text=" + text, label: "Продублировать в WhatsApp" };
    }
    if (C.telegram) return { url: C.telegram, label: "Написать в Telegram" };
    return null;
  }

  function offerMessenger(data) {
    var link = buildMessengerLink(data);
    if (!link) return;
    var s = $("#formStatus");
    if (!s) return;
    var a = document.createElement("a");
    a.href = link.url; a.target = "_blank"; a.rel = "noopener";
    a.className = "btn btn--ghost"; a.style.marginTop = "12px"; a.textContent = link.label;
    s.appendChild(document.createElement("br"));
    s.appendChild(a);
  }

  function submitForm(form, data) {
    var btn = $("#bookingSubmit");
    var original = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.innerHTML = "Отправляем…"; }

    function done(success) {
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
      if (success) {
        showStatus((BK.successTitle ? BK.successTitle + ". " : "") + (BK.successText || "Заявка отправлена."), true);
        form.reset();
        // вернуть первый радио активным
        var first = form.querySelector('input[name="service"]');
        if (first) first.checked = true;
        offerMessenger(data);
      } else {
        showStatus(BK.errorText || "Не удалось отправить. Свяжитесь с нами напрямую.", false);
        offerMessenger(data);
      }
    }

    if (BK.endpoint) {
      fetch(BK.endpoint, {
        method: BK.method || "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { done(r.ok); }).catch(function () { done(false); });
    } else {
      // Демо-режим: backend не подключён. Логируем и показываем успех.
      // eslint-disable-next-line no-console
      console.info("[CRYSTAL AUTO] Заявка (демо-режим, endpoint не задан):", data);
      setTimeout(function () { done(true); }, 500);
    }
  }

  function init() {
    var form = $("#bookingForm");
    renderServiceChoices();
    renderTimeSlots();
    renderChannels();
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = form.elements; // безопасный доступ (form.name конфликтует со свойством формы)
      var data = {
        name: el["name"].value,
        phone: el["phone"].value,
        service: (form.querySelector('input[name="service"]:checked') || {}).value || "",
        car: el["car"].value,
        time: el["time"].value,
        comment: el["comment"].value,
        page: location.href,
        ts: new Date().toISOString()
      };
      if (!validate(data)) return;
      submitForm(form, data);
    });

    // снимать ошибку при вводе
    ["name", "phone"].forEach(function (n) {
      var f = form.querySelector('[name="' + n + '"]');
      if (f) f.addEventListener("input", function () { setError(n, ""); });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
