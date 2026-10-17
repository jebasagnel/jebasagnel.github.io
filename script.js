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
  const musicVolume = 0.18;
  let fadeFrame;

  ambientAudio.volume = 0;

  const updateSoundToggle = () => {
    const isPlaying = !ambientAudio.paused;
    const isAudible = isPlaying && !ambientAudio.muted;
    const label = !isPlaying
      ? "Play background music"
      : isAudible
        ? "Mute background music"
        : "Unmute background music";
    const title = !isPlaying && soundToggle.classList.contains("sound-toggle--blocked")
      ? "Autoplay is blocked; tap here to start the music"
      : label;

    soundToggle.setAttribute("aria-label", label);
    soundToggle.setAttribute("title", title);
    soundToggle.setAttribute("aria-pressed", String(isAudible));
  };

  const fadeMusicIn = () => {
    window.cancelAnimationFrame(fadeFrame);
    ambientAudio.volume = 0;
    let fadeStartedAt;

    const fade = (timestamp) => {
      if (fadeStartedAt === undefined) {
        fadeStartedAt = timestamp;
      }

      const progress = Math.min((timestamp - fadeStartedAt) / 1800, 1);
      ambientAudio.volume = musicVolume * progress;

      if (progress < 1) {
        fadeFrame = window.requestAnimationFrame(fade);
      } else {
        fadeFrame = undefined;
      }
    };

    fadeFrame = window.requestAnimationFrame(fade);
  };

  const tryPlayAmbientAudio = () => {
    ambientAudio.play().then(() => {
      soundToggle.classList.remove("sound-toggle--blocked");
      fadeMusicIn();
      updateSoundToggle();
    }).catch((error) => {
      const autoplayBlocked = error.name === "NotAllowedError";
      const label = autoplayBlocked ? "Play background music" : "Background music unavailable";
      soundToggle.setAttribute("aria-label", label);
      soundToggle.setAttribute("title", autoplayBlocked ? "Autoplay is blocked; click to start the music" : label);
      soundToggle.setAttribute("aria-pressed", "false");
      soundToggle.classList.toggle("sound-toggle--blocked", autoplayBlocked);

      if (!autoplayBlocked) {
        soundToggle.disabled = true;
        console.error("Background music could not be played.", error);
      }
    });
  };

  soundToggle.addEventListener("click", () => {
    if (ambientAudio.paused) {
      soundToggle.classList.remove("sound-toggle--blocked");
      ambientAudio.muted = false;
      tryPlayAmbientAudio();
      return;
    }

    ambientAudio.muted = !ambientAudio.muted;
    if (ambientAudio.muted) {
      window.cancelAnimationFrame(fadeFrame);
      fadeFrame = undefined;
    } else {
      fadeMusicIn();
    }
    updateSoundToggle();
  });

  ambientAudio.addEventListener("play", updateSoundToggle);
  ambientAudio.addEventListener("pause", updateSoundToggle);
  ambientAudio.addEventListener("ended", updateSoundToggle);
  ambientAudio.addEventListener("volumechange", updateSoundToggle);
  ambientAudio.addEventListener("error", () => {
    soundToggle.classList.remove("sound-toggle--blocked");
    soundToggle.disabled = true;
    soundToggle.setAttribute("aria-label", "Background music unavailable");
    soundToggle.setAttribute("title", "Background music unavailable");
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
  const greetedSections = new Set(activeSection ? [activeSection] : []);
  let companionDismissed = false;
  let greetingTimer;
  let hopTimer;
  let scrollFrame;
  let welcomeTimer;

  const hideGreeting = () => {
    window.clearTimeout(greetingTimer);
    buddyBubble.hidden = true;
    buddyCharacter.setAttribute("aria-expanded", "false");
  };

  const showGreeting = (message, duration = 3800, shouldHop = true) => {
    buddyCopy.textContent = message;
    buddyBubble.hidden = false;
    buddyCharacter.setAttribute("aria-expanded", "true");
    window.clearTimeout(greetingTimer);
    greetingTimer = window.setTimeout(hideGreeting, duration);

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
      window.clearTimeout(welcomeTimer);
      if (!greetedSections.has(section)) {
        greetedSections.add(section);
        if (!companionDismissed) {
          showGreeting(section.dataset.buddyMessage);
        }
      }
    }
  };

  const scheduleBuddyUpdate = () => {
    if (scrollFrame === undefined) {
      scrollFrame = window.requestAnimationFrame(updateBuddyForScroll);
    }
  };

  buddyCharacter.addEventListener("click", () => {
    window.clearTimeout(welcomeTimer);
    companionDismissed = false;
    showGreeting(activeSection?.dataset.buddyMessage || "Hi! I’m Jebas. Thanks for stopping by!", 5000);
  });

  buddyDismiss?.addEventListener("click", () => {
    companionDismissed = true;
    hideGreeting();
    buddyCharacter.focus();
  });
  window.addEventListener("scroll", scheduleBuddyUpdate, { passive: true });
  window.addEventListener("resize", scheduleBuddyUpdate);
  scheduleBuddyUpdate();
  welcomeTimer = window.setTimeout(() => {
    if (!companionDismissed) {
      showGreeting("Hi! I’m Jebas. Welcome to my little corner of the data world!", 4200, false);
    }
  }, 900);
}
