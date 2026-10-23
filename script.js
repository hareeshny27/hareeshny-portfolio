document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1. Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");

  function setMenuState(isOpen) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    siteNav.classList.toggle("is-open", isOpen);
    navToggle.classList.toggle("is-active", isOpen);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setMenuState(navToggle.getAttribute("aria-expanded") !== "true");
    });
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenuState(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuState(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- 2. Automatic copyright year ---------- */
  var yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  /* ---------- 3. Reveal content as it enters view ---------- */
  var revealTargets = document.querySelectorAll(
    ".section:not(.section-home) .section-heading, .about-text, .education-card, .skill-category, .project-card, .certificate-item, .contact-information, .contact-letter"
  );

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (element, index) {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", (index % 4) * 75 + "ms");
      revealObserver.observe(element);
    });
  }

  /* ---------- 4. Active section navigation ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var mainNavLinks = document.querySelectorAll("#site-nav .nav-link");

  function setActiveLink(sectionId) {
    mainNavLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + sectionId) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length > 0 && mainNavLinks.length > 0) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { root: null, rootMargin: "-40% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (section) { navObserver.observe(section); });
    setActiveLink("home");
  }

  /* ---------- 5. Toast helper ---------- */
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  /* ---------- 6. Typing role animation ---------- */
  var headline = document.querySelector(".hero-headline");
  if (headline && !prefersReducedMotion) {
    var roles = ["Aspiring Web Developer", "Creative Thinker", "Tech Enthusiast"];
    headline.setAttribute("aria-label", roles.join(". "));
    headline.textContent = "";
    var typed = document.createElement("span");
    typed.setAttribute("aria-hidden", "true");
    var cursor = document.createElement("span");
    cursor.className = "typing-cursor";
    cursor.setAttribute("aria-hidden", "true");
    headline.appendChild(typed);
    headline.appendChild(cursor);

    var roleIndex = 0, charIndex = 0, deleting = false;
    (function tick() {
      var word = roles[roleIndex];
      typed.textContent = word.slice(0, charIndex);
      var delay = deleting ? 40 : 85;
      if (!deleting && charIndex === word.length) {
        deleting = true; delay = 1600;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      } else {
        charIndex += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 7. Scroll progress bar, header shadow, back-to-top ---------- */
  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  var backToTop = document.createElement("button");
  backToTop.type = "button";
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = "&uarr;";
  document.body.appendChild(backToTop);
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  var header = document.getElementById("site-header");
  var ticking = false;

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? scrollTop / max : 0) + ")";
    if (header) header.classList.toggle("is-scrolled", scrollTop > 10);
    backToTop.classList.toggle("is-visible", scrollTop > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 8. Project filter buttons ---------- */
  var projectsGrid = document.querySelector(".projects-grid");
  var projectCards = projectsGrid ? Array.prototype.slice.call(projectsGrid.querySelectorAll(".project-card")) : [];

  if (projectsGrid && projectCards.length) {
    var categories = ["All"];
    projectCards.forEach(function (card) {
      var cat = card.querySelector(".project-category");
      if (cat && categories.indexOf(cat.textContent.trim()) === -1) categories.push(cat.textContent.trim());
    });

    var filterBar = document.createElement("div");
    filterBar.className = "filter-bar";
    filterBar.setAttribute("role", "group");
    filterBar.setAttribute("aria-label", "Filter projects by type");

    categories.forEach(function (name, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip" + (i === 0 ? " is-active" : "");
      btn.textContent = name;
      btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        filterBar.querySelectorAll(".filter-chip").forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        projectsGrid.classList.toggle("is-filtered", name !== "All");
        projectCards.forEach(function (card) {
          var cat = card.querySelector(".project-category").textContent.trim();
          card.classList.toggle("is-hidden", name !== "All" && cat !== name);
        });
      });
      filterBar.appendChild(btn);
    });
    projectsGrid.parentNode.insertBefore(filterBar, projectsGrid);
  }

  /* ---------- 9. Project detail modal ---------- */
  var overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
    '<button type="button" class="modal-close" aria-label="Close project details">&times;</button>' +
    '<div class="modal-icon" id="modal-icon"></div>' +
    '<span class="modal-category" id="modal-category"></span>' +
    '<h3 id="modal-title"></h3>' +
    '<p id="modal-description"></p>' +
    '</div>';
  document.body.appendChild(overlay);

  var modal = overlay.querySelector(".modal");
  var modalClose = overlay.querySelector(".modal-close");
  var lastFocused = null;

  function openModal(card) {
    lastFocused = document.activeElement;
    overlay.querySelector("#modal-title").textContent = card.querySelector(".project-title").textContent;
    overlay.querySelector("#modal-category").textContent = card.querySelector(".project-category").textContent;
    overlay.querySelector("#modal-description").textContent = card.querySelector(".project-description").textContent;
    var icon = card.querySelector(".project-illustration");
    overlay.querySelector("#modal-icon").innerHTML = icon ? icon.innerHTML : "";
    overlay.classList.add("is-open");
    document.body.classList.add("modal-open");
    modalClose.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
  modalClose.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      e.preventDefault(); // only one focusable element: keep focus on close button
      modalClose.focus();
    }
  });

  projectCards.forEach(function (card) {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.addEventListener("click", function () { openModal(card); });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(card); }
    });
  });

  /* ---------- 10. 3D tilt on project cards ---------- */
  if (finePointer && !prefersReducedMotion) {
    projectCards.forEach(function (card) {
      card.addEventListener("pointerenter", function () {
        card.style.transition = "transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease";
      });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 8).toFixed(2) + "deg) translateY(-5px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
        card.style.transition = "";
      });
    });
  }

  /* ---------- 11. Hero parallax ---------- */
  var heroRight = document.querySelector(".hero-right");
  var studioPhoto = document.querySelector(".creative-visual");
  if (heroRight && studioPhoto && finePointer && !prefersReducedMotion) {
    studioPhoto.style.transition = "transform 0.2s ease-out";
    heroRight.addEventListener("pointermove", function (e) {
      var r = heroRight.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      studioPhoto.style.transform = "scale(1.05) translate(" + (x * -14).toFixed(1) + "px," + (y * -14).toFixed(1) + "px)";
    });
    heroRight.addEventListener("pointerleave", function () {
      studioPhoto.style.transform = "";
    });
  }

  /* ---------- 12. Certificate search and year filter ---------- */
  var mainCertList = document.querySelector(".certificate-list-main");
  var certDetails = document.querySelector(".certificate-details");

  if (mainCertList) {
    var allCerts = Array.prototype.slice.call(document.querySelectorAll(".certificate-item"));
    var mainCerts = Array.prototype.slice.call(mainCertList.querySelectorAll(".certificate-item"));
    var years = [];
    mainCerts.forEach(function (li) {
      var y = li.querySelector(".certificate-year");
      if (y && years.indexOf(y.textContent.trim()) === -1) years.push(y.textContent.trim());
    });
    years.sort().reverse();

    var tools = document.createElement("div");
    tools.className = "cert-tools";
    tools.innerHTML =
      '<label class="cert-search"><span class="visually-hidden">Search certificates</span>' +
      '<input type="search" id="cert-search" placeholder="Search certificates..." autocomplete="off"></label>' +
      '<div class="cert-years" role="group" aria-label="Filter certificates by year"></div>' +
      '<p class="cert-count" id="cert-count" aria-live="polite"></p>';
    mainCertList.parentNode.insertBefore(tools, mainCertList);

    var searchInput = tools.querySelector("#cert-search");
    var yearWrap = tools.querySelector(".cert-years");
    var countEl = tools.querySelector("#cert-count");
    var activeYear = "All";

    ["All"].concat(years).forEach(function (y, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip" + (i === 0 ? " is-active" : "");
      b.textContent = y;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        activeYear = y;
        yearWrap.querySelectorAll(".filter-chip").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        b.classList.add("is-active");
        b.setAttribute("aria-pressed", "true");
        applyCertFilter();
      });
      yearWrap.appendChild(b);
    });

    function applyCertFilter() {
      var q = searchInput.value.trim().toLowerCase();
      var shown = 0;
      allCerts.forEach(function (li) {
        var isMain = mainCertList.contains(li);
        var yEl = li.querySelector(".certificate-year");
        var matchYear = activeYear === "All" || (isMain && yEl && yEl.textContent.trim() === activeYear);
        var matchText = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
        var visible = matchYear && matchText;
        li.classList.toggle("is-hidden", !visible);
        if (visible) shown++;
      });
      if (certDetails && q) certDetails.open = true;
      countEl.textContent = (q || activeYear !== "All")
        ? (shown ? shown + " certificate" + (shown === 1 ? "" : "s") + " found" : "No certificates match your search.")
        : "";
    }
    searchInput.addEventListener("input", applyCertFilter);
  }

  /* ---------- 13. Copy email button ---------- */
  var emailLink = document.querySelector(".contact-link[href^='mailto:']");
  if (emailLink) {
    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.setAttribute("aria-label", "Copy email address");
    emailLink.parentNode.appendChild(copyBtn);

    copyBtn.addEventListener("click", function () {
      var address = emailLink.getAttribute("href").replace("mailto:", "");
      function done() {
        copyBtn.textContent = "Copied!";
        showToast("Email address copied to clipboard");
        setTimeout(function () { copyBtn.textContent = "Copy"; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(done, function () { showToast("Couldn't copy. Please copy it manually."); });
      } else {
        showToast("Couldn't copy. Please copy it manually.");
      }
    });
  }
});

/* ===== Light / dark theme toggle ===== */
/* Light / dark theme toggle. Load in <head> (no defer) so the theme applies before first paint. */
(function () {
  "use strict";

  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var stored = null;

  try { stored = localStorage.getItem("theme"); } catch (e) { /* storage unavailable */ }

  var current = stored === "dark" || stored === "light" ? stored : (media.matches ? "dark" : "light");
  root.setAttribute("data-theme", current);

  var button = null;

  function render() {
    if (!button) return;
    var isDark = current === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    button.innerHTML = isDark ? "&#9728;" : "&#9790;"; // sun / moon
  }

  function apply(theme, save) {
    current = theme;
    root.setAttribute("data-theme", theme);
    if (save) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* ignore */ }
    }
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.getElementById("site-nav");
    if (!nav) return;

    button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    nav.appendChild(button);
    render();

    button.addEventListener("click", function () {
      apply(current === "dark" ? "light" : "dark", true);
    });
  });

  // Follow the system setting until the visitor picks a theme manually.
  var onSystemChange = function (e) {
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
    if (!saved) apply(e.matches ? "dark" : "light", false);
  };
  if (media.addEventListener) media.addEventListener("change", onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange);
})();
