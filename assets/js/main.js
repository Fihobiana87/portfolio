document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const nav = document.querySelector(".premium-nav");
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  const revealItems = document.querySelectorAll(".reveal");
  const skills = document.querySelectorAll(".skill");
  const counters = document.querySelectorAll("[data-count-to]");
  const lightbox = document.getElementById("lightbox");
  const contactForm = document.getElementById("contactForm");
  const langButtons = document.querySelectorAll(".lang-btn");
  const translatable = document.querySelectorAll("[data-en]");

  const splitWords = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((word, i) => `<span class="split-word" style="--i:${i}"><span class="split-word-inner">${word}</span></span>`)
      .join(" ");
  };

  const applyLanguage = (lang) => {
    document.documentElement.lang = lang;
    translatable.forEach((el) => {
      if (!el.dataset.frText) el.dataset.frText = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.frText;
      if (el.hasAttribute("data-split")) splitWords(el);
    });
    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    localStorage.setItem("site-lang", lang);
  };

  if (langButtons.length) {
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
    applyLanguage(localStorage.getItem("site-lang") || "fr");
  }

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle("nav-scrolled", window.scrollY > 16);
  };

  const updateParallax = () => {
    if (reduceMotion) return;
    parallaxItems.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.08;
      el.style.transform = `translateY(${window.scrollY * speed}px)`;
    });
  };

  updateNav();
  updateParallax();
  window.addEventListener("scroll", () => {
    updateNav();
    updateParallax();
  }, { passive: true });

  const heroName = document.querySelector(".hero-v2-name");
  if (heroName) {
    const nameSpan = heroName.querySelector("span");
    const chars = nameSpan.textContent.split("");
    nameSpan.innerHTML = chars
      .map((char, i) => `<span class="split-char" style="--i:${i}">${char}</span>`)
      .join("");
    requestAnimationFrame(() => requestAnimationFrame(() => heroName.classList.add("is-loaded")));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.classList.contains("skill")) {
        entry.target.style.setProperty("--level", `${entry.target.dataset.level || 0}%`);
        entry.target.classList.add("animate");
      }
      if (entry.target.hasAttribute("data-count-to")) {
        animateCount(entry.target);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => observer.observe(item));
  skills.forEach((skill) => observer.observe(skill));
  counters.forEach((counter) => observer.observe(counter));

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || "";
    const decimals = el.dataset.countTo.includes(".") ? 1 : 0;
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if (lightbox) {
    const lightboxImage = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector(".lightbox-close");

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => {
        lightboxImage.src = button.dataset.lightbox;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.src = "";
      document.body.style.overflow = "";
    };

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = contactForm.querySelector(".form-status");
      const fields = Array.from(contactForm.querySelectorAll(".form-control"));
      let valid = true;

      fields.forEach((field) => {
        const fieldIsValid = field.checkValidity();
        field.classList.toggle("is-invalid", !fieldIsValid);
        if (!fieldIsValid) valid = false;
      });

      const isEn = document.documentElement.lang === "en";

      if (!valid) {
        status.textContent = isEn ? "Please fill in all fields correctly." : "Merci de compléter correctement tous les champs.";
        status.style.color = "#c0483c";
        return;
      }

      const data = new FormData(contactForm);
      const subject = encodeURIComponent(data.get("subject"));
      const body = encodeURIComponent(`Nom: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
      status.textContent = isEn ? "Message ready. Opening your email application..." : "Message prêt. Ouverture de votre application email...";
      status.style.color = "#3fae74";
      window.location.href = `mailto:razafindraibe.fihobiana877@gmail.com?subject=${subject}&body=${body}`;
      contactForm.reset();
    });
  }

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      let frame;
      el.addEventListener("mousemove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          el.style.transform = `translate(${x * 0.32}px, ${y * 0.32}px)`;
        });
      });
      el.addEventListener("mouseleave", () => {
        cancelAnimationFrame(frame);
        el.style.transform = "";
      });
    });

    const cursorDot = document.createElement("div");
    cursorDot.className = "cursor-dot";
    const cursorGlow = document.createElement("div");
    cursorGlow.className = "cursor-glow";
    document.body.append(cursorDot, cursorGlow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let cursorStarted = false;

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      if (!cursorStarted) {
        cursorStarted = true;
        document.documentElement.classList.add("has-custom-cursor");
        cursorDot.style.opacity = "1";
        cursorGlow.style.opacity = "1";
      }
      const isInteractive = event.target.closest("a, button, .gallery-item, input, textarea");
      cursorDot.classList.toggle("is-active", !!isInteractive);
      cursorGlow.classList.toggle("is-active", !!isInteractive);
      if (!glowFrame) glowFrame = requestAnimationFrame(trackGlow);
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
      cursorDot.style.opacity = "0";
      cursorGlow.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      if (cursorStarted) {
        cursorDot.style.opacity = "1";
        cursorGlow.style.opacity = "1";
      }
    });

    let glowFrame = null;
    const trackGlow = () => {
      glowX += (mouseX - glowX) * 0.14;
      glowY += (mouseY - glowY) * 0.14;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      if (Math.abs(mouseX - glowX) > 0.5 || Math.abs(mouseY - glowY) > 0.5) {
        glowFrame = requestAnimationFrame(trackGlow);
      } else {
        glowFrame = null;
      }
    };

    document.querySelectorAll(".work-media, .case-figure").forEach((el) => {
      el.addEventListener("mousemove", (event) => {
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transition = "transform .1s linear";
        el.style.transform = `perspective(900px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .6s var(--ease)";
        el.style.transform = "";
      });
    });
  }
});
