document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    siteNav.querySelectorAll("a").forEach(function (link) {
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

  /* ---------- 3. Theme toggle ---------- */
  var rootElement = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var themeToggleText = themeToggle ? themeToggle.querySelector(".theme-toggle-text") : null;
  var themeToggleIcon = themeToggle ? themeToggle.querySelector(".theme-toggle-icon") : null;

  function applyTheme(themeName) {
    var resolvedTheme = themeName === "dark" ? "dark" : "light";
    rootElement.setAttribute("data-theme", resolvedTheme);
    if (themeToggle) {
      var isDark = resolvedTheme === "dark";
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("aria-pressed", String(isDark));
      if (themeToggleIcon) {
        themeToggleIcon.textContent = isDark ? "🌙" : "☀️";
      }
      if (themeToggleText) {
        themeToggleText.textContent = isDark ? "Dark" : "Light";
      }
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("portfolio-theme", resolvedTheme);
    }
  }

  var savedTheme = null;
  if (typeof localStorage !== "undefined") {
    savedTheme = localStorage.getItem("portfolio-theme");
  }
  var prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var initialTheme = savedTheme || (prefersDarkTheme ? "dark" : "light");
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var nextTheme = rootElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  }

  /* ---------- 4. Typing role animation ---------- */
  var typingRole = document.getElementById("typing-role");
  if (typingRole) {
    var roles = ["Aspiring Web Developer", "Creative Thinker", "Tech Enthusiast"];

    if (prefersReducedMotion) {
      typingRole.textContent = roles[0];
    } else {
      var roleIndex = 0;
      var characterIndex = 0;
      var deleting = false;

      function typeRole() {
        var role = roles[roleIndex];
        typingRole.textContent = role.slice(0, characterIndex);

        if (!deleting && characterIndex < role.length) {
          characterIndex += 1;
          window.setTimeout(typeRole, 85);
        } else if (!deleting) {
          deleting = true;
          window.setTimeout(typeRole, 1500);
        } else if (characterIndex > 0) {
          characterIndex -= 1;
          window.setTimeout(typeRole, 42);
        } else {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          window.setTimeout(typeRole, 350);
        }
      }

      typeRole();
    }
  }

  /* ---------- 4. Scroll progress, header shadow, and back-to-top ---------- */
  var siteHeader = document.getElementById("site-header");
  var progressBar = document.getElementById("scroll-progress-bar");
  var backToTop = document.getElementById("back-to-top");

  function updateScrollUI() {
    var scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollableHeight > 0
      ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
      : 0;

    if (progressBar) {
      progressBar.style.width = progress + "%";
    }
    if (siteHeader) {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 420);
    }
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  window.addEventListener("resize", updateScrollUI);
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 5. Reveal content as it enters view ---------- */
  var revealTargets = document.querySelectorAll(
    ".section:not(.section-home) .section-heading, .about-text, .education-card, .skill-category, .project-card, .certificate-item, .contact-information, .contact-letter"
  );

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (element, index) {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", (index % 4) * 75 + "ms");
      revealObserver.observe(element);
    });
  }

  /* ---------- 6. Active section navigation ---------- */
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
    var sectionObserver = new IntersectionObserver(
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
      sectionObserver.observe(section);
    });

    setActiveLink("home");
  }

  /* ---------- 7. Project filters, details, and pointer tilt ---------- */
  var projectCards = Array.from(document.querySelectorAll(".project-card"));
  var projectFilters = document.querySelectorAll("[data-project-filter]");
  var projectsGrid = document.querySelector(".projects-grid");
  var projectDialog = document.getElementById("project-dialog");
  var projectDialogClose = document.getElementById("project-dialog-close");
  var projectDialogCategory = document.getElementById("project-dialog-category");
  var projectDialogTitle = document.getElementById("project-dialog-title");
  var projectDialogDescription = document.getElementById("project-dialog-description");
  var previousProjectFocus = null;
  var activeProjectFilter = "all";

  function applyProjectFilter() {
    if (projectsGrid) {
      projectsGrid.classList.toggle("is-filtered", activeProjectFilter !== "all");
    }
    projectCards.forEach(function (card) {
      card.hidden = activeProjectFilter !== "all" &&
        card.getAttribute("data-project-category") !== activeProjectFilter;
    });
  }

  projectFilters.forEach(function (button) {
    button.addEventListener("click", function () {
      activeProjectFilter = button.getAttribute("data-project-filter") || "all";
      projectFilters.forEach(function (filterButton) {
        var isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });
      applyProjectFilter();
    });
  });

  function openProjectDetails(card) {
    if (!projectDialog || !projectDialogCategory || !projectDialogTitle ||
      !projectDialogDescription || typeof projectDialog.showModal !== "function") {
      return;
    }

    previousProjectFocus = card;
    projectDialogCategory.textContent = card.querySelector(".project-category").textContent;
    projectDialogTitle.textContent = card.querySelector(".project-title").textContent;
    projectDialogDescription.textContent = card.querySelector(".project-description").textContent;
    projectDialog.showModal();
    if (projectDialogClose) projectDialogClose.focus();
  }

  projectCards.forEach(function (card) {
    card.addEventListener("click", function () {
      openProjectDetails(card);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProjectDetails(card);
      }
    });
  });

  if (projectDialog && projectDialogClose) {
    projectDialogClose.addEventListener("click", function () {
      projectDialog.close();
    });

    projectDialog.addEventListener("click", function (event) {
      if (event.target === projectDialog) {
        projectDialog.close();
      }
    });

    projectDialog.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        projectDialog.close();
        return;
      }
      if (event.key !== "Tab") return;
      var focusableElements = projectDialog.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });

    projectDialog.addEventListener("close", function () {
      if (previousProjectFocus && previousProjectFocus.isConnected) {
        previousProjectFocus.focus();
      }
    });
  }

  if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    projectCards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var bounds = card.getBoundingClientRect();
        var x = (event.clientX - bounds.left) / bounds.width;
        var y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--tilt-x", ((0.5 - y) * 7).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", ((x - 0.5) * 7).toFixed(2) + "deg");
      });

      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ---------- 8. Certificate search and year filters ---------- */
  var certificateSearch = document.getElementById("certificate-search");
  var certificateResultCount = document.getElementById("certificate-result-count");
  var certificateDetails = document.querySelector(".certificate-details");
  var certificateYearFilters = document.querySelectorAll("[data-certificate-year]");
  var certificateItems = Array.from(document.querySelectorAll(
    ".certificate-list-main .certificate-item, .certificate-list-additional .certificate-item"
  ));
  var activeCertificateYear = "all";

  function updateCertificates() {
    var query = certificateSearch ? certificateSearch.value.trim().toLocaleLowerCase() : "";
    var visibleCount = 0;

    if (query && certificateDetails) {
      certificateDetails.open = true;
    }

    certificateItems.forEach(function (item) {
      var yearElement = item.querySelector(".certificate-year");
      var itemYear = yearElement ? yearElement.textContent.trim() : "";
      var matchesYear = activeCertificateYear === "all" || itemYear === activeCertificateYear;
      var matchesQuery = item.textContent.toLocaleLowerCase().includes(query);
      var isVisible = matchesYear && matchesQuery;

      item.hidden = !isVisible;
      if (isVisible && (!item.closest(".certificate-list-additional") ||
        (certificateDetails && certificateDetails.open))) {
        visibleCount += 1;
      }
    });

    if (certificateResultCount) {
      certificateResultCount.textContent = visibleCount + (visibleCount === 1
        ? " certificate found"
        : " certificates found");
    }
  }

  if (certificateSearch) {
    certificateSearch.addEventListener("input", updateCertificates);
  }
  certificateYearFilters.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCertificateYear = button.getAttribute("data-certificate-year") || "all";
      certificateYearFilters.forEach(function (filterButton) {
        var isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });
      updateCertificates();
    });
  });
  if (certificateDetails) {
    certificateDetails.addEventListener("toggle", updateCertificates);
  }
  updateCertificates();

  /* ---------- 9. Copy email with status feedback ---------- */
  var copyEmailButton = document.getElementById("copy-email");
  var interactionToast = document.getElementById("interaction-toast");
  var toastTimeout;

  function showToast(message) {
    if (!interactionToast) return;
    interactionToast.textContent = message;
    interactionToast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(function () {
      interactionToast.classList.remove("is-visible");
    }, 2600);
  }

  function fallbackCopy(text) {
    var temporaryInput = document.createElement("textarea");
    temporaryInput.value = text;
    temporaryInput.setAttribute("readonly", "");
    temporaryInput.style.position = "fixed";
    temporaryInput.style.opacity = "0";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    var copied = document.execCommand("copy");
    temporaryInput.remove();
    return copied;
  }

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", function () {
      var email = copyEmailButton.getAttribute("data-email");
      if (!email) {
        showToast("Email address is unavailable.");
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(email).then(function () {
          showToast("Email copied to clipboard.");
        }).catch(function () {
          showToast("Couldn't copy email. Please copy it manually.");
        });
      } else {
        showToast(fallbackCopy(email)
          ? "Email copied to clipboard."
          : "Couldn't copy email. Please copy it manually.");
      }
    });
  }

  /* ---------- 10. Hero image parallax ---------- */
  var heroSection = document.getElementById("home");
  var creativeVisual = document.querySelector(".creative-visual");

  if (heroSection && creativeVisual && !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    heroSection.addEventListener("pointermove", function (event) {
      var bounds = heroSection.getBoundingClientRect();
      var x = (event.clientX - bounds.left) / bounds.width - 0.5;
      var y = (event.clientY - bounds.top) / bounds.height - 0.5;
      creativeVisual.style.setProperty("--parallax-x", (-x * 10).toFixed(2) + "px");
      creativeVisual.style.setProperty("--parallax-y", (-y * 8).toFixed(2) + "px");
    });

    heroSection.addEventListener("pointerleave", function () {
      creativeVisual.style.setProperty("--parallax-x", "0px");
      creativeVisual.style.setProperty("--parallax-y", "0px");
    });
  }
});
