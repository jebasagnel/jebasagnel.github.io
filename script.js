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
const creativeEntry = document.querySelector("#creative-entry");
const portfolioShell = document.querySelector("#portfolio-shell");
const creativeEntryFrame = creativeEntry?.querySelector("iframe");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "night") {
  root.dataset.theme = "dark";
}

window.addEventListener("storage", (event) => {
  if (event.key !== "portfolio-theme") {
    return;
  }

  const isDark = event.newValue === "night";
  root.dataset.theme = isDark ? "dark" : "light";
  themeToggle?.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
});

const dismissCreativeEntry = () => {
  if (!creativeEntry || creativeEntry.classList.contains("creative-entry--leaving")) {
    return;
  }

  document.body.classList.remove("entry-active");
  portfolioShell?.removeAttribute("inert");
  creativeEntry.classList.add("creative-entry--leaving");
  window.setTimeout(() => creativeEntry.remove(), 700);
};

if (window.location.hash) {
  dismissCreativeEntry();
}

window.addEventListener("hashchange", dismissCreativeEntry);

if (year) {
  year.textContent = new Date().getFullYear();
}

themeToggle?.addEventListener("click", () => {
  const isDark = root.dataset.theme !== "dark";
  root.dataset.theme = isDark ? "dark" : "light";
  localStorage.setItem("portfolio-theme", isDark ? "night" : "day");
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
});

if (soundToggle && ambientAudio) {
  const musicVolume = 0.18;
  const musicStartVolume = 0.12;
  let fadeFrame;

  ambientAudio.volume = musicStartVolume;

  const postAudioState = () => {
    if (!creativeEntryFrame?.contentWindow) {
      return;
    }

    const origin = window.location.origin;
    creativeEntryFrame.contentWindow.postMessage({
      type: "portfolio-audio-state",
      playing: !ambientAudio.paused,
      muted: ambientAudio.muted,
      blocked: soundToggle.classList.contains("sound-toggle--blocked"),
    }, origin === "null" ? "*" : origin);
  };

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
    postAudioState();
  };

  const fadeMusicIn = () => {
    window.cancelAnimationFrame(fadeFrame);
    const startingVolume = Math.min(ambientAudio.volume, musicVolume);
    let fadeStartedAt;

    const fade = (timestamp) => {
      if (fadeStartedAt === undefined) {
        fadeStartedAt = timestamp;
      }

      const progress = Math.min((timestamp - fadeStartedAt) / 1800, 1);
      ambientAudio.volume = startingVolume + (musicVolume - startingVolume) * progress;

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
      postAudioState();
    });
  };

  const toggleAmbientAudio = () => {
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
  };

  soundToggle.addEventListener("click", toggleAmbientAudio);

  window.addEventListener("message", (event) => {
    if (
      event.source !== creativeEntryFrame?.contentWindow ||
      event.origin !== window.location.origin
    ) {
      return;
    }

    if (event.data?.type === "portfolio-audio-toggle") {
      toggleAmbientAudio();
    } else if (event.data?.type === "portfolio-audio-state-request") {
      postAudioState();
    }
  });

  creativeEntryFrame?.addEventListener("load", postAudioState);

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
  const actionClasses = ["buddy--action-wave", "buddy--action-think", "buddy--action-point", "buddy--action-present", "buddy--action-walk"];
  let activeSection;
  let companionDismissed = false;
  let greetingTimer;
  let actionTimer;
  let scrollFrame;

  const hideGreeting = () => {
    window.clearTimeout(greetingTimer);
    buddyBubble.hidden = true;
    buddy.classList.remove("buddy--speaking");
    buddyCharacter.setAttribute("aria-expanded", "false");
  };

  const showGreeting = (message, section = activeSection, duration = 4800) => {
    buddyCopy.textContent = message;
    buddyBubble.hidden = false;
    buddy.classList.add("buddy--speaking");
    buddyCharacter.setAttribute("aria-expanded", "true");
    window.clearTimeout(greetingTimer);
    greetingTimer = window.setTimeout(hideGreeting, duration);

    if (section) {
      const actionClass = `buddy--action-${section.dataset.buddyAction || "wave"}`;
      buddy.classList.remove(...actionClasses);
      window.clearTimeout(actionTimer);
      void buddy.offsetWidth;
      buddy.classList.add(actionClass);
      actionTimer = window.setTimeout(() => buddy.classList.remove(actionClass), 1700);
    }
  };

  const updateBuddyForScroll = () => {
    scrollFrame = undefined;
    const marker = window.innerHeight * 0.44;
    const sectionAtMarker = sections.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.top <= marker && rect.bottom >= marker;
    });
    const section = sectionAtMarker || sections.reduce((nearest, candidate) => {
      const rect = candidate.getBoundingClientRect();
      const distance = marker < rect.top ? rect.top - marker : marker - rect.bottom;
      const nearestRect = nearest.getBoundingClientRect();
      const nearestDistance = marker < nearestRect.top ? nearestRect.top - marker : marker - nearestRect.bottom;
      return distance < nearestDistance ? candidate : nearest;
    }, sections[0]);

    if (section && section !== activeSection) {
      activeSection = section;
      if (!companionDismissed) {
        showGreeting(section.dataset.buddyMessage, section);
      }
    }
  };

  const scheduleBuddyUpdate = () => {
    if (scrollFrame === undefined) {
      scrollFrame = window.requestAnimationFrame(updateBuddyForScroll);
    }
  };

  buddyCharacter.addEventListener("click", () => {
    companionDismissed = false;
    showGreeting(activeSection?.dataset.buddyMessage || "Hi! I’m Jebas. Thanks for stopping by!", activeSection, 5000);
  });

  buddyDismiss?.addEventListener("click", () => {
    companionDismissed = true;
    hideGreeting();
    buddyCharacter.focus();
  });
  window.addEventListener("scroll", scheduleBuddyUpdate, { passive: true });
  window.addEventListener("resize", scheduleBuddyUpdate);
  scheduleBuddyUpdate();
}
