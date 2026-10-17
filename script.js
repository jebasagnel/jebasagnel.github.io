const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const soundToggle = document.querySelector(".sound-toggle");
const ambientAudio = document.querySelector("#ambient-audio");
const mobileNav = document.querySelector("#mobile-nav");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

themeToggle?.addEventListener("click", () => {
  const isDark = root.dataset.theme !== "dark";
  root.dataset.theme = isDark ? "dark" : "light";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
});

if (soundToggle && ambientAudio) {
  ambientAudio.volume = 0.16;

  const updateSoundToggle = () => {
    const isPlaying = !ambientAudio.paused;
    const isAudible = isPlaying && !ambientAudio.muted;
    const label = !isPlaying
      ? "Play ambient music"
      : isAudible
        ? "Mute ambient music"
        : "Unmute ambient music";

    soundToggle.setAttribute("aria-label", label);
    soundToggle.setAttribute("title", label);
    soundToggle.setAttribute("aria-pressed", String(isAudible));
  };

  const tryPlayAmbientAudio = () => {
    ambientAudio.play().then(updateSoundToggle).catch((error) => {
      const autoplayBlocked = error.name === "NotAllowedError";
      const label = autoplayBlocked ? "Play ambient music" : "Ambient music unavailable";
      soundToggle.setAttribute("aria-label", label);
      soundToggle.setAttribute("title", autoplayBlocked ? "Autoplay was blocked; play ambient music" : label);
      soundToggle.setAttribute("aria-pressed", "false");

      if (!autoplayBlocked) {
        soundToggle.disabled = true;
        console.error("Ambient audio could not be played.", error);
      }
    });
  };

  soundToggle.addEventListener("click", () => {
    if (ambientAudio.paused) {
      ambientAudio.muted = false;
      tryPlayAmbientAudio();
      return;
    }

    ambientAudio.muted = !ambientAudio.muted;
    updateSoundToggle();
  });

  ambientAudio.addEventListener("play", updateSoundToggle);
  ambientAudio.addEventListener("pause", updateSoundToggle);
  ambientAudio.addEventListener("volumechange", updateSoundToggle);
  ambientAudio.addEventListener("error", () => {
    soundToggle.disabled = true;
    soundToggle.setAttribute("aria-label", "Ambient music unavailable");
    soundToggle.setAttribute("title", "Ambient music unavailable");
    soundToggle.setAttribute("aria-pressed", "false");
  });

  tryPlayAmbientAudio();
}

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  mobileNav.hidden = isExpanded;
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  });
});
