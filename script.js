document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /* ---------- 1. Mobile navigation ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");

  function setMenuState(isOpen) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
    siteNav.classList.toggle("is-open", isOpen);
    navToggle.classList.toggle("is-active", isOpen);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    var navLinks = siteNav.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuState(false);
      });
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
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* ---------- 3. Active section navigation ---------- */
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
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    setActiveLink("home");
  }
});