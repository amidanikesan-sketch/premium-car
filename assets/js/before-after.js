/* ============================================================
   CRYSTAL AUTO — before-after.js
   Интерактивный слайдер «До / После» с табами.
   Поддержка: мышь, тач, клавиатура. Fallback при отсутствии фото.
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.CRYSTAL_CONFIG || {};
  var pairs = CFG.beforeAfter || [];

  function buildImg(src, alt, cls) {
    return (
      '<img class="ba__img ' + cls + '" src="' + src + '" alt="' + alt + '" loading="lazy" ' +
      'onerror="this.style.display=\'none\'; this.insertAdjacentHTML(\'afterend\', \'<div class=&quot;ba__fallback&quot;>Фото скоро появится<br>(' + alt + ')</div>\');" />'
    );
  }

  function renderSlider(slider, pair) {
    slider.style.setProperty("--pos", "50%");
    slider.innerHTML =
      buildImg(pair.after, "После", "ba__after") +
      '<div class="ba__before">' + buildImg(pair.before, "До", "") + "</div>" +
      '<span class="ba__label ba__label--before">До</span>' +
      '<span class="ba__label ba__label--after">После</span>' +
      '<div class="ba__handle" id="baHandle"><span class="ba__grip" aria-hidden="true">' +
        (window.CRYSTAL_ICONS ? window.CRYSTAL_ICONS.expand : "") + "</span></div>" +
      '<input class="ba__range" type="range" min="0" max="100" value="50" step="0.1" ' +
        'aria-label="Сравнение до и после: ' + pair.label + '" />';

    var range = slider.querySelector(".ba__range");
    var setPos = function (v) {
      v = Math.max(0, Math.min(100, v));
      slider.style.setProperty("--pos", v + "%");
    };

    range.addEventListener("input", function () { setPos(parseFloat(range.value)); });
    // drag via pointer on whole slider
    var dragging = false;
    function posFromEvent(clientX) {
      var r = slider.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      setPos(pct);
      range.value = String(Math.max(0, Math.min(100, pct)));
    }
    slider.addEventListener("pointerdown", function (e) {
      dragging = true; slider.classList.add("is-dragging");
      slider.setPointerCapture && slider.setPointerCapture(e.pointerId);
      posFromEvent(e.clientX);
    });
    slider.addEventListener("pointermove", function (e) { if (dragging) posFromEvent(e.clientX); });
    slider.addEventListener("pointerup", function () { dragging = false; slider.classList.remove("is-dragging"); });
    slider.addEventListener("pointercancel", function () { dragging = false; slider.classList.remove("is-dragging"); });
  }

  function init() {
    var slider = document.getElementById("baSlider");
    var tabsWrap = document.getElementById("baTabs");
    var caption = document.getElementById("baCaption");
    if (!slider || !pairs.length) {
      if (slider) slider.innerHTML = '<div class="ba__fallback">Добавьте работы в config.js → beforeAfter</div>';
      return;
    }

    pairs.forEach(function (p, i) {
      var b = document.createElement("button");
      b.className = "ba-tab" + (i === 0 ? " is-active" : "");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.textContent = p.label;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(tabsWrap.children, function (c) {
          c.classList.remove("is-active"); c.setAttribute("aria-selected", "false");
        });
        b.classList.add("is-active"); b.setAttribute("aria-selected", "true");
        renderSlider(slider, p);
        if (caption) caption.textContent = p.caption || "";
      });
      tabsWrap.appendChild(b);
    });

    renderSlider(slider, pairs[0]);
    if (caption) caption.textContent = pairs[0].caption || "";
  }

  document.addEventListener("DOMContentLoaded", init);
})();
