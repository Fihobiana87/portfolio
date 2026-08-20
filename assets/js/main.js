// Interface behavior for the static portfolio.
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

  // Sticky nav shadow on scroll.
  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle("nav-scrolled", window.scrollY > 16);
  };

  // Subtle parallax on the hero grid and giant type layer.
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

  // Intersection Observer powers fade-in, slide-up, skill bars and count-up figures.
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

  // Lightbox for project screenshots.
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

  // Contact validation stays client-side and then opens the user's email client.
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

      if (!valid) {
        status.textContent = "Merci de completer correctement tous les champs.";
        status.style.color = "#c0483c";
        return;
      }

      const data = new FormData(contactForm);
      const subject = encodeURIComponent(data.get("subject"));
      const body = encodeURIComponent(`Nom: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
      status.textContent = "Message pret. Ouverture de votre application email...";
      status.style.color = "#3fae74";
      window.location.href = `mailto:razafindraibe.fihobiana877@gmail.com?subject=${subject}&body=${body}`;
      contactForm.reset();
    });
  }

  // Magnetic buttons — nudge toward the cursor within a small radius, ease back on leave.
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
  }
});
