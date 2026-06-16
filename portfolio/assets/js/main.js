// Global interface behavior for the static portfolio.
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".premium-nav");
  const parallax = document.querySelector("[data-parallax]");
  const revealItems = document.querySelectorAll(".reveal");
  const skills = document.querySelectorAll(".skill");
  const lightbox = document.getElementById("lightbox");
  const contactForm = document.getElementById("contactForm");

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle("nav-scrolled", window.scrollY > 16);
  };

  const updateParallax = () => {
    if (!parallax) return;
    parallax.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  };

  updateNav();
  updateParallax();
  window.addEventListener("scroll", () => {
    updateNav();
    updateParallax();
  }, { passive: true });

  // Intersection Observer powers fade-in, slide-up and skill progress animations.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.classList.contains("skill")) {
        entry.target.style.setProperty("--level", `${entry.target.dataset.level || 0}%`);
        entry.target.classList.add("animate");
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px" });

  revealItems.forEach((item) => observer.observe(item));
  skills.forEach((skill) => observer.observe(skill));

  // Lightbox for E-Kata screenshots.
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
        status.style.color = "#c62828";
        return;
      }

      const data = new FormData(contactForm);
      const subject = encodeURIComponent(data.get("subject"));
      const body = encodeURIComponent(`Nom: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`);
      status.textContent = "Message pret. Ouverture de votre application email...";
      status.style.color = "#0c6b3d";
      window.location.href = `mailto:razafindraibe.fihobiana877@gmail.com?subject=${subject}&body=${body}`;
      contactForm.reset();
    });
  }
});
