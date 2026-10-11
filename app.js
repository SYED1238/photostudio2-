/**
 * LUMINA STUDIO — Interactive Experience & Animations
 * Golden Stardust Canvas, Scrapbook Modals, Polaroid Lightbox, Audio Synthesizer
 */

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. Web Audio API Acoustic Sound Effects (Camera Shutter & Golden Chime)
     ========================================================================== */
  let audioCtx = null;
  let isSoundEnabled = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Camera Shutter Click Sound (Synthesized with filtered noise + click)
  function playShutterSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      // 1. Initial mechanical click
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);
      oscGain.gain.setValueAtTime(0.2, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.04);

      // 2. White noise shutter curtain flutter
      const bufferSize = audioCtx.sampleRate * 0.06;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, t);
      filter.Q.setValueAtTime(1.8, t);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t + 0.01);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  // Golden Bell / Harp Chime Sound (Synthesized warm pentatonic harmonic)
  function playGoldenChime(freq = 587.33) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.8);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {
      console.warn("Chime error", e);
    }
  }

  // Sound Toggle Button
  const btnSoundToggle = document.getElementById("btnSoundToggle");
  const soundIcon = document.getElementById("soundIcon");
  const soundLabel = document.getElementById("soundLabel");

  if (btnSoundToggle) {
    btnSoundToggle.addEventListener("click", () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      if (isSoundEnabled) {
        soundIcon.textContent = "🔔";
        soundLabel.textContent = "Atmosphere: Active";
        btnSoundToggle.style.borderColor = "var(--color-gold)";
        playGoldenChime(659.25); // E5 chime
      } else {
        soundIcon.textContent = "🔕";
        soundLabel.textContent = "Atmosphere: Muted";
        btnSoundToggle.style.borderColor = "rgba(180, 150, 120, 0.3)";
      }
    });
  }

  /* ==========================================================================
     2. Golden Stardust & Particle Canvas (Low-RAM & Mobile Optimized)
     ========================================================================== */
  const canvas = document.getElementById("stardustCanvas");
  let ctx = canvas ? canvas.getContext("2d") : null;
  let width = (canvas ? (canvas.width = window.innerWidth) : 0);
  let height = (canvas ? (canvas.height = window.innerHeight) : 0);

  const isLowMemoryMobile =
    window.innerWidth <= 768 ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.addEventListener("resize", () => {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Floating ambient golden dust motes
  const ambientMotes = [];
  const MOTE_COUNT = prefersReducedMotion ? 0 : (isLowMemoryMobile ? 10 : 32);
  for (let i = 0; i < MOTE_COUNT; i++) {
    ambientMotes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (isLowMemoryMobile ? 1.6 : 2.2) + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.35 - 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  // Interactive cursor trail sparks (desktop only)
  const cursorSparks = [];
  let mouse = { x: width * 0.65, y: height * 0.72, active: false };

  if (!isLowMemoryMobile && !prefersReducedMotion) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      if (Math.random() < 0.55 && cursorSparks.length < 24) {
        cursorSparks.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.3,
          size: Math.random() * 2.4 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          color: Math.random() > 0.4 ? "#f5dfba" : "#cfa365",
        });
      }
    });
  }

  // Static Golden Ribbon connecting cards
  let ribbonPhase = 0;

  function drawGoldenRibbon() {
    if (!ctx) return;
    ribbonPhase += 0.018;

    const startX = width * 0.48;
    const startY = height * 0.72;
    const endX = width * 0.76;
    const endY = height * 0.82;
    const cp1X = width * 0.58;
    const cp1Y = height * 0.79 + Math.sin(ribbonPhase) * 12;
    const cp2X = width * 0.68;
    const cp2Y = height * 0.86 + Math.cos(ribbonPhase) * 10;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);

    ctx.strokeStyle = "rgba(235, 198, 142, 0.45)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 248, 230, 0.75)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  let canvasAnimationId = null;
  let isCanvasRendering = true;

  function animateCanvas() {
    if (!ctx || !isCanvasRendering || prefersReducedMotion) return;
    ctx.clearRect(0, 0, width, height);

    if (width > 860) {
      drawGoldenRibbon();
    }

    // Ambient drifting dust motes
    for (let i = 0; i < ambientMotes.length; i++) {
      const m = ambientMotes[i];
      m.x += m.speedX;
      m.y += m.speedY;
      m.pulse += 0.03;

      if (m.y < -10) m.y = height + 10;
      if (m.x < -10) m.x = width + 10;
      if (m.x > width + 10) m.x = -10;

      const currentAlpha = m.opacity * (0.6 + Math.sin(m.pulse) * 0.4);

      ctx.save();
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 190, 135, ${currentAlpha})`;
      if (!isLowMemoryMobile) {
        ctx.shadowColor = "rgba(240, 210, 160, 0.6)";
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.restore();
    }

    // Cursor sparkles (desktop only)
    for (let i = cursorSparks.length - 1; i >= 0; i--) {
      const s = cursorSparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        cursorSparks.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.alpha, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      if (!isLowMemoryMobile) {
        ctx.shadowColor = "#f5dfba";
        ctx.shadowBlur = 8;
      }
      ctx.fill();
      ctx.restore();
    }

    canvasAnimationId = requestAnimationFrame(animateCanvas);
  }

  function startCanvas() {
    if (!isCanvasRendering) {
      isCanvasRendering = true;
      animateCanvas();
    }
  }

  function pauseCanvas() {
    isCanvasRendering = false;
    if (canvasAnimationId) {
      cancelAnimationFrame(canvasAnimationId);
      canvasAnimationId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseCanvas();
    else startCanvas();
  });

  if (ctx && !prefersReducedMotion) {
    animateCanvas();
  }

  /* ==========================================================================
     3. Modals Management (Open / Close with Esc Key & Body Scroll Lock)
     ========================================================================== */
  function openModal(modalId) {
    initAudio();
    playGoldenChime(523.25);
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Open triggers
  const btnViewGallery = document.getElementById("btnViewGallery");
  if (btnViewGallery) {
    btnViewGallery.addEventListener("click", () => {
      initAudio();
      playGoldenChime(587.33);
      window.location.href = "gallery.html";
    });
  }

  const btnReadMore = document.getElementById("btnReadMore");
  const triggerJournal = document.getElementById("triggerJournal");
  if (btnReadMore) btnReadMore.addEventListener("click", () => openModal("storyModal"));
  if (triggerJournal) triggerJournal.addEventListener("click", () => openModal("storyModal"));

  const btnBookNow = document.getElementById("btnBookNow");
  const mobileBtnBook = document.getElementById("mobileBtnBook");
  if (btnBookNow) btnBookNow.addEventListener("click", () => openModal("bookingModal"));
  if (mobileBtnBook) mobileBtnBook.addEventListener("click", () => {
    closeMobileDrawer();
    openModal("bookingModal");
  });

  // Generic data-open and data-close triggers
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetModal = btn.getAttribute("data-open");
      // Close parent modal if already open
      const parentModal = btn.closest(".lumina-modal-overlay");
      if (parentModal) {
        closeModal(parentModal.id);
      }
      openModal(targetModal);
    });
  });

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetModal = btn.getAttribute("data-close");
      closeModal(targetModal);
    });
  });

  // Close when clicking modal backdrop
  document.querySelectorAll(".lumina-modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // Escape key closes modals
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".lumina-modal-overlay.open").forEach((m) => {
        closeModal(m.id);
      });
      closeLightbox();
      closeMobileDrawer();
    }
  });

  /* ==========================================================================
     4. Mobile Navigation Drawer
     ========================================================================== */
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");

  function closeMobileDrawer() {
    if (!mobileNavDrawer || !mobileMenuBtn) return;
    mobileNavDrawer.classList.remove("open");
    mobileMenuBtn.classList.remove("open");
    mobileNavDrawer.setAttribute("aria-hidden", "true");
  }

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mobileNavDrawer.classList.toggle("open");
      mobileMenuBtn.classList.toggle("open", isOpen);
      mobileNavDrawer.setAttribute("aria-hidden", String(!isOpen));
      initAudio();
      playGoldenChime(587.33);
    });
  }

  document.querySelectorAll(".mobile-link-script").forEach((link) => {
    link.addEventListener("click", (e) => {
      const action = link.getAttribute("data-action");
      const href = link.getAttribute("href");
      closeMobileDrawer();

      if (action) {
        e.preventDefault();
        if (action === "gallery") openModal("galleryModal");
        else if (action === "about") openModal("aboutModal");
        else if (action === "story") openModal("storyModal");
        else if (action === "contact") openModal("contactModal");
      } else if (href && href.startsWith("#")) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }
      // If href is "gallery.html", normal navigation proceeds!
    });
  });

  // Tap outside to close mobile drawer
  document.addEventListener("click", (e) => {
    if (
      mobileNavDrawer &&
      mobileNavDrawer.classList.contains("open") &&
      !mobileNavDrawer.contains(e.target) &&
      !mobileMenuBtn.contains(e.target)
    ) {
      closeMobileDrawer();
    }
  });

  /* ==========================================================================
     5. Lightbox for Photo Previews & Shutter Sound
     ========================================================================== */
  const lightboxOverlay = document.getElementById("lightboxOverlay");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");

  function openLightbox(src, captionText) {
    initAudio();
    playShutterSound();
    if (!lightboxOverlay || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxCaption.textContent = captionText || "";
    lightboxOverlay.classList.add("open");
    lightboxOverlay.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove("open");
    lightboxOverlay.setAttribute("aria-hidden", "true");
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener("click", (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });
  }

  // Wire photo cards on the main stage to lightbox
  // Wire photo cards on the main stage to lightbox (ignoring clicks on buttons, inputs, links)
  document.querySelectorAll(".card-interactive").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest("textarea") || e.target.closest("a")) {
        return;
      }
      const img = card.querySelector("img");
      const caption = card.getAttribute("data-caption") || (img ? img.alt : "");
      if (img) openLightbox(img.src, caption);
    });
  });

  // Wire polaroid cards in gallery to lightbox
  document.querySelectorAll(".polaroid-card").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector(".polaroid-img");
      const caption = card.querySelector(".polaroid-caption");
      if (img) openLightbox(img.src, caption ? caption.textContent : "");
    });
  });

  /* ==========================================================================
     6. Wax Seal Stamp Interactive Hotspot
     ========================================================================== */
  const btnWaxSeal = document.getElementById("btnWaxSeal");
  if (btnWaxSeal) {
    btnWaxSeal.addEventListener("click", (e) => {
      e.stopPropagation();
      initAudio();
      playGoldenChime(698.46);
      openModal("aboutModal");
    });
  }

  /* ==========================================================================
     7. Polaroid Gallery Filter Tabs
     ========================================================================== */
  const filterPills = document.querySelectorAll(".filter-pill");
  const polaroids = document.querySelectorAll(".polaroid-card");

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      initAudio();
      playGoldenChime(493.88);
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      const filter = pill.getAttribute("data-filter");
      polaroids.forEach((card) => {
        const cat = card.getAttribute("data-category");
        if (filter === "all" || cat === filter) {
          card.style.display = "block";
          card.style.animation = "fadeIn 0.4s ease forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* ==========================================================================
     8. Modal Booking Form Submission & Wax Seal Confirmation
     ========================================================================== */
  const bookingForm = document.getElementById("bookingForm");
  const bookingConfirmation = document.getElementById("bookingConfirmation");

  if (bookingForm && bookingConfirmation) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      initAudio();
      playGoldenChime(587.33);

      const name = document.getElementById("clientName").value.trim();
      const email = document.getElementById("clientEmail").value.trim();

      if (!name || !email) {
        alert("Please provide your name and email address so we can reach you.");
        return;
      }

      // Hide form and show sealed confirmation
      bookingForm.style.display = "none";
      bookingConfirmation.style.display = "block";

      setTimeout(() => {
        playShutterSound();
      }, 500);
    });
  }

  // Pre-fill today + 14 days in booking date picker
  const sessionDateInput = document.getElementById("sessionDate");
  if (sessionDateInput) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
    const dd = String(futureDate.getDate()).padStart(2, "0");
    sessionDateInput.min = `${yyyy}-${mm}-${dd}`;
    sessionDateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  /* ==========================================================================
     9. Section 3: Open Scrapbook Journal Interactive Tab Switcher
     ========================================================================== */
  const journalEntries = [
    {
      coords: "Andalusia Atelier \u2022 36.7213\u00B0 N, 4.4214\u00B0 W",
      plate: "Plate No. 42 \u2022 Andalusia Summer Edition",
      title: "Whispers in the Amber Grass",
      lead: '"The late afternoon sun had melted into liquid amber over the southern foothills. We walked with Clara and Julian through waist-high wheat, waiting not for posed smiles, but for the breath between words."',
      quote: "\u201CThe most honest photographs are never taken; they are surrendered to the light.\u201D",
      body: "In this session, we chose medium format 120mm color negative film. The grain holds the warmth of that specific soil, the wind that rustled the dry thistle, and the genuine laughter of two people who forgot a camera was present.",
      stamp: "October 14 \u2022 Hasselblad 500C/M \u2022 Kodak Portra 400 \u2022 Natural Light Only",
      mainImg: "assets/couple_intimate.png",
      mainCaption: "Intimate Couple in Wheat Meadow",
      subImg: "assets/detail_daisy.png",
      subCaption: "Caustics at 18:40",
      scribble: "Notice how the lens flare paints across the linen dress naturally"
    },
    {
      coords: "Zurich Hills \u2022 47.3769\u00B0 N, 8.5417\u00B0 E",
      plate: "Plate No. 51 \u2022 Alpine Orchard Edition",
      title: "First Light in the Orchard",
      lead: '"Mist was still lifting from the apple blossom groves when the family arrived wrapped in wool blankets. In the quiet morning dampness, we found tenderness in its most unguarded state."',
      quote: "\u201CGenerations do not need to be arranged; they need only to be held.\u201D",
      body: "We captured this legacy session using vintage German glass with soft corner falloff. The light warmed from cool lavender to radiant gold within twenty-five minutes, bathing their embrace in pure honey.",
      stamp: "June 03 \u2022 Leica M6 \u2022 Kodak Tri-X & Gold 200 \u2022 First Daylight",
      mainImg: "assets/family_field.png",
      mainCaption: "Family Embracing in Golden Meadow",
      subImg: "assets/family_intimate.png",
      subCaption: "Gentle embrace at dawn",
      scribble: "The tender glance between mother and child caught in unposed sunlight"
    },
    {
      coords: "Provence Atelier \u2022 43.5297\u00B0 N, 5.4474\u00B0 E",
      plate: "Plate No. 63 \u2022 Botanical Solitude Edition",
      title: "Wildflower Caustics & Mist",
      lead: '"A solitary study on the edge of olive hills. Wild daisies stretching toward the amber backlight, petals translucent like fine handmade paper."',
      quote: "\u201CTo look deeply at a single flower is to comprehend all of summer.\u201D",
      body: "A monograph focused entirely on silence, organic textures, and the caustics of late August sun filtering through dry stems. Developed with intentional grain to preserve tactile softness.",
      stamp: "August 28 \u2022 Hasselblad 500C/M \u2022 Ilford HP5 & Portra 160",
      mainImg: "assets/portrait_flare.png",
      mainCaption: "Botanical Flare & Daisy Glow",
      subImg: "assets/hand_flower.png",
      subCaption: "Wild meadow bloom",
      scribble: "Backlit halo and prism caustics creating a dreamlike corona"
    }
  ];

  const journalTabPills = document.querySelectorAll(".journal-tab-pill");
  const elJournalCoords = document.getElementById("journalCoordinates");
  const elJournalTitle = document.getElementById("journalTitle");
  const elJournalLead = document.getElementById("journalLead");
  const elJournalQuote = document.getElementById("journalQuote");
  const elJournalBody = document.getElementById("journalBody");
  const elJournalStamp = document.getElementById("journalStamp");
  const elJournalPlate = document.getElementById("journalPlateNum");
  const elJournalMainImg = document.getElementById("journalMainImg");
  const elJournalSubImg = document.getElementById("journalSubImg");
  const elJournalSubCaption = document.getElementById("journalSubCaption");
  const elJournalScribble = document.getElementById("journalScribbleText");
  const elJournalMainFrame = document.getElementById("journalMainPhotoFrame");
  const elJournalSubFrame = document.getElementById("journalPolaroidTucked");

  journalTabPills.forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const tabIndex = parseInt(tabBtn.getAttribute("data-tab") || "0", 10);
      const data = journalEntries[tabIndex];
      if (!data) return;

      initAudio();
      playGoldenChime(554.37);

      journalTabPills.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabBtn.classList.add("active");
      tabBtn.setAttribute("aria-selected", "true");

      if (elJournalCoords) elJournalCoords.textContent = data.coords;
      if (elJournalPlate) elJournalPlate.textContent = data.plate;
      if (elJournalTitle) elJournalTitle.textContent = data.title;
      if (elJournalLead) elJournalLead.textContent = data.lead;
      if (elJournalQuote) elJournalQuote.innerHTML = `&ldquo;${data.quote.replace(/“|”|"/g, "")}&rdquo;`;
      if (elJournalBody) elJournalBody.textContent = data.body;
      if (elJournalStamp) elJournalStamp.textContent = data.stamp;
      if (elJournalScribble) elJournalScribble.textContent = data.scribble;

      if (elJournalMainImg) {
        elJournalMainImg.style.opacity = "0.3";
        elJournalMainImg.src = data.mainImg;
        elJournalMainImg.alt = data.mainCaption;
        setTimeout(() => { elJournalMainImg.style.opacity = "1"; }, 150);
      }
      if (elJournalMainFrame) {
        elJournalMainFrame.setAttribute("data-caption", data.mainCaption);
      }

      if (elJournalSubImg) {
        elJournalSubImg.style.opacity = "0.3";
        elJournalSubImg.src = data.subImg;
        setTimeout(() => { elJournalSubImg.style.opacity = "1"; }, 150);
      }
      if (elJournalSubCaption) elJournalSubCaption.textContent = data.subCaption;
      if (elJournalSubFrame) {
        elJournalSubFrame.setAttribute("data-caption", data.subCaption);
      }
    });
  });

  // Journal Atmosphere Chime Button
  const btnJournalChime = document.getElementById("btnJournalChime");
  if (btnJournalChime) {
    btnJournalChime.addEventListener("click", () => {
      initAudio();
      playGoldenChime(659.25);
      setTimeout(() => playGoldenChime(783.99), 160);
      setTimeout(() => playGoldenChime(987.77), 320);
    });
  }

  /* ==========================================================================
     10. Section 2: Explore Discipline Buttons (open filtered gallery)
     ========================================================================== */
  document.querySelectorAll("[data-filter-gallery]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const filterCat = btn.getAttribute("data-filter-gallery");
      openModal("galleryModal");
      if (filterCat) {
        const matchingPill = document.querySelector(`.filter-pill[data-filter="${filterCat}"]`);
        if (matchingPill) matchingPill.click();
      }
    });
  });

  /* ==========================================================================
     11. Section 4: Package Select Buttons (Pre-populate and scroll to booking)
     ========================================================================== */
  document.querySelectorAll(".btn-select-package").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      initAudio();
      playGoldenChime(587.33);
      const pkg = btn.getAttribute("data-package") || "";

      // Set select dropdown value
      const deskSelect = document.getElementById("deskSessionType");
      const modalSelect = document.getElementById("sessionType");
      if (deskSelect && pkg) deskSelect.value = pkg;
      if (modalSelect && pkg) modalSelect.value = pkg;

      // Scroll smoothly to the in-page reservation desk
      const reservationSection = document.getElementById("reservation");
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: "smooth" });
        const desk = document.querySelector(".inpage-reservation-desk");
        if (desk) {
          desk.style.outline = "2px solid var(--color-gold)";
          setTimeout(() => { desk.style.outline = ""; }, 1800);
        }
      }
    });
  });

  /* ==========================================================================
     12. Section 5: In-Page Booking Form
     ========================================================================== */
  const inpageForm = document.getElementById("inpageBookingForm");
  const inpageConfirm = document.getElementById("deskBookingConfirmation");
  const btnResetDesk = document.getElementById("btnResetDeskBooking");

  if (inpageForm && inpageConfirm) {
    inpageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      initAudio();
      playGoldenChime(659.25);

      const name = document.getElementById("deskName").value.trim();
      const email = document.getElementById("deskEmail").value.trim();

      if (!name || !email) {
        alert("Please provide your name and email address so we can reach you.");
        return;
      }

      inpageForm.style.display = "none";
      inpageConfirm.style.display = "block";

      setTimeout(() => {
        playShutterSound();
      }, 500);
    });

    if (btnResetDesk) {
      btnResetDesk.addEventListener("click", () => {
        inpageConfirm.style.display = "none";
        inpageForm.style.display = "block";
        inpageForm.reset();
      });
    }

    // Default min date for desk
    const deskDateInput = document.getElementById("deskDate");
    if (deskDateInput) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const yyyy = futureDate.getFullYear();
      const mm = String(futureDate.getMonth() + 1).padStart(2, "0");
      const dd = String(futureDate.getDate()).padStart(2, "0");
      deskDateInput.min = `${yyyy}-${mm}-${dd}`;
      deskDateInput.value = `${yyyy}-${mm}-${dd}`;
    }
  }

  /* ==========================================================================
     13. Back to Top Button & Smooth Nav Scroll
     ========================================================================== */
  const btnBackToTop = document.getElementById("btnBackToTop");
  if (btnBackToTop) {
    btnBackToTop.addEventListener("click", () => {
      initAudio();
      playGoldenChime(783.99);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Smooth scroll links & mobile close
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeMobileDrawer();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
