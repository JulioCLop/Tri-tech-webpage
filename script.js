const revealSections = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");

      const staggerItems = entry.target.querySelectorAll(".stagger");
      staggerItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.12}s`;
        item.classList.add("is-visible");
      });

      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

revealSections.forEach((section) => {
  revealObserver.observe(section);
});
