/* ============================================================
   CRYSTAL AUTO — accordion.js  (FAQ)
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.CRYSTAL_CONFIG || {};

  function init() {
    var list = document.getElementById("faqList");
    if (!list) return;
    var items = CFG.faq || [];

    items.forEach(function (item, i) {
      var id = "faq-a-" + i;
      var wrap = document.createElement("div");
      wrap.className = "faq-item";
      wrap.innerHTML =
        '<button class="faq-q" type="button" aria-expanded="false" aria-controls="' + id + '">' +
          "<span>" + item.q + "</span>" +
          '<span class="faq-icon" aria-hidden="true"></span>' +
        "</button>" +
        '<div class="faq-a" id="' + id + '" role="region"><div class="faq-a__inner">' + item.a + "</div></div>";
      list.appendChild(wrap);
    });

    list.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq-q");
      if (!btn) return;
      var item = btn.closest(".faq-item");
      var panel = item.querySelector(".faq-a");
      var open = item.classList.contains("is-open");

      // закрыть остальные (аккордеон)
      Array.prototype.forEach.call(list.querySelectorAll(".faq-item.is-open"), function (other) {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });

      if (open) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });

    // пересчёт высоты при ресайзе
    window.addEventListener("resize", function () {
      var openItem = list.querySelector(".faq-item.is-open .faq-a");
      if (openItem) openItem.style.maxHeight = openItem.scrollHeight + "px";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
