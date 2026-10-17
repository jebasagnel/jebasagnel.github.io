const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const soundToggle = document.querySelector(".sound-toggle");
const ambientAudio = document.querySelector("#ambient-audio");
const mobileNav = document.querySelector("#mobile-nav");
const buddy = document.querySelector("#portfolio-buddy");
const buddyCharacter = buddy?.querySelector(".buddy__character");
const buddyBubble = buddy?.querySelector(".buddy__bubble");
const buddyCopy = buddy?.querySelector(".buddy__copy");
const buddyDismiss = buddy?.querySelector(".buddy__dismiss");
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

if (buddy && buddyCharacter && buddyBubble && buddyCopy) {
  const sections = [...document.querySelectorAll("[data-buddy-message]")];
  let activeSection = sections[0];
  let greetingTimer;
  let hopTimer;
  let scrollFrame;

  const hideGreeting = () => {
    buddyBubble.hidden = true;
    buddyCharacter.setAttribute("aria-expanded", "false");
  };

  const showGreeting = (message, shouldHop = true) => {
    buddyCopy.textContent = message;
    buddyBubble.hidden = false;
    buddyCharacter.setAttribute("aria-expanded", "true");
    window.clearTimeout(greetingTimer);
    greetingTimer = window.setTimeout(hideGreeting, 6500);

    if (shouldHop) {
      buddy.classList.remove("buddy--hopping");
      window.clearTimeout(hopTimer);
      void buddy.offsetWidth;
      buddy.classList.add("buddy--hopping");
      hopTimer = window.setTimeout(() => buddy.classList.remove("buddy--hopping"), 900);
    }
  };

  const updateBuddyForScroll = () => {
    scrollFrame = undefined;
    const marker = window.innerHeight * 0.44;
    const section = sections.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.top <= marker && rect.bottom >= marker;
    });

    if (section && section !== activeSection) {
      activeSection = section;
      showGreeting(section.dataset.buddyMessage);
    }
  };

  const scheduleBuddyUpdate = () => {
    if (scrollFrame === undefined) {
      scrollFrame = window.requestAnimationFrame(updateBuddyForScroll);
    }
  };

  buddyCharacter.addEventListener("click", () => {
    showGreeting(activeSection?.dataset.buddyMessage || "Hi! I’m Jebas. Thanks for stopping by!");
  });

  buddyDismiss?.addEventListener("click", hideGreeting);
  window.addEventListener("scroll", scheduleBuddyUpdate, { passive: true });
  window.addEventListener("resize", scheduleBuddyUpdate);
  scheduleBuddyUpdate();
  greetingTimer = window.setTimeout(hideGreeting, 6500);
}
