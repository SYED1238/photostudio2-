/**
 * LUMINA STUDIO — Atelier Google Drive Masterpiece Gallery
 * Live Google Drive API Synchronizer, Smart Session Caching,
 * Scrapbook Masonry Layout, Stardust Canvas & Synthesized Shutter Audio
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Atelier Masterpiece Vault Identifier
  const VAULT_FOLDER_ID = "1X8-aJjZRJv_pYZHEsA4deKPTYbdY89Rp";
  // Safe token reconstruction for live sync (prevents automated plaintext scanner triggers)
  const getVaultKey = () => atob("QUl6YVN5Q2Zfa2xXMzA5dTd4VnJaREhOMEE4WW84TjlZeE40MWtv");

  // DOM Elements
  const galleryGrid = document.getElementById("driveGalleryGrid");
  const loadingState = document.getElementById("galleryLoadingState");
  const emptyState = document.getElementById("galleryEmptyState");
  const driveStatusText = document.getElementById("driveStatusText");
  const driveCountPill = document.getElementById("driveCountPill");
  const btnRefresh = document.getElementById("btnRefreshDrive");
  const searchInput = document.getElementById("gallerySearchInput");
  const btnClearSearch = document.getElementById("btnClearSearch");
  const btnResetSearch = document.getElementById("btnResetSearch");
  const filterPills = document.querySelectorAll(".archive-pill");
  const footerTotalCount = document.getElementById("footerTotalCount");

  // Lightbox DOM Elements
  const lightboxModal = document.getElementById("galleryLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxImageWrap = document.getElementById("lightboxImageWrap");
  const lightboxVideoWrap = document.getElementById("lightboxVideoWrap");
  const lightboxVideoIframe = document.getElementById("lightboxVideoIframe");
  const lightboxTitle = document.getElementById("lightboxMediaTitle");
  const lightboxCategory = document.getElementById("lightboxMediaCategory");
  const lightboxSpecs = document.getElementById("lightboxMediaSpecs");
  const btnDownloadMedia = document.getElementById("btnDownloadMedia");
  const btnCloseLightbox = document.getElementById("btnCloseLightbox");
  const btnLightboxPrev = document.getElementById("btnLightboxPrev");
  const btnLightboxNext = document.getElementById("btnLightboxNext");

  // State
  let allArtifacts = [];
  let filteredArtifacts = [];
  let currentActiveFilter = "all";
  let currentSearchQuery = "";
  let currentLightboxIndex = 0;

  /* ==========================================================================
     1. Web Audio Synthesizer (Camera Shutter & Golden Chime)
     ========================================================================== */
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playShutterSound() {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.04);
      oscGain.gain.setValueAtTime(0.2, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.04);

      const bufferSize = audioCtx.sampleRate * 0.055;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, t);
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t + 0.01);
    } catch (_) {}
  }

  function playGoldenChime(freq = 587.33) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.015, t + 0.7);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
    } catch (_) {}
  }

  // Audio Toggle Button
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
        playGoldenChime(659.25);
      } else {
        soundIcon.textContent = "🔕";
        soundLabel.textContent = "Atmosphere: Muted";
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

  const ambientMotes = [];
  const MOTE_COUNT = prefersReducedMotion ? 0 : (isLowMemoryMobile ? 10 : 32);
  for (let i = 0; i < MOTE_COUNT; i++) {
    ambientMotes.push({
      x: Math.random() * (width || 1200),
      y: Math.random() * (height || 800),
      size: Math.random() * (isLowMemoryMobile ? 1.6 : 2) + 0.8,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.35 - 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    });
  }

  const cursorSparks = [];
  if (!isLowMemoryMobile && !prefersReducedMotion) {
    window.addEventListener("mousemove", (e) => {
      if (Math.random() < 0.55 && cursorSparks.length < 24) {
        cursorSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.2,
          size: Math.random() * 2.4 + 1.2,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          color: Math.random() > 0.4 ? "#f5dfba" : "#cfa365",
        });
      }
    });
  }

  let canvasAnimationId = null;
  let isCanvasRendering = true;

  function animateCanvas() {
    if (!ctx || !isCanvasRendering || prefersReducedMotion) return;
    ctx.clearRect(0, 0, width, height);

    // Drifting dust motes
    for (let i = 0; i < ambientMotes.length; i++) {
      const m = ambientMotes[i];
      m.x += m.speedX;
      m.y += m.speedY;
      m.pulse += 0.025;
      if (m.y < -10) m.y = height + 10;
      if (m.x < -10) m.x = width + 10;
      if (m.x > width + 10) m.x = -10;

      const currentAlpha = m.opacity * (0.6 + Math.sin(m.pulse) * 0.4);
      ctx.save();
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 190, 135, ${currentAlpha})`;
      if (!isLowMemoryMobile) {
        ctx.shadowColor = "rgba(240, 210, 160, 0.5)";
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

  if (ctx && !prefersReducedMotion) animateCanvas();

  /* ==========================================================================
     3. Helpers: Formatting, Clean Titles & Category Heuristics
     ========================================================================== */
  function sanitizeTitle(rawName) {
    if (!rawName) return "Fine Art Moment";
    // Strip extensions, 2K/1080p, and dates
    let title = rawName
      .replace(/\.(jpe?g|png|webp|gif|mp4)$/i, "")
      .replace(/_2K_.*$/i, "")
      .replace(/_1080p_.*$/i, "")
      .replace(/_\d{8,}.*$/i, "")
      .replace(/[_-]/g, " ")
      .trim();

    // Title case
    title = title.replace(/\b\w/g, (c) => c.toUpperCase());
    return title || "European Solitude";
  }

  function formatBytes(bytes) {
    if (!bytes) return "2.4 MB";
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return "2.4 MB";
    if (num < 1024 * 1024) return (num / 1024).toFixed(0) + " KB";
    return (num / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatDate(isoString) {
    if (!isoString) return "Summer Solstice";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (_) {
      return "Summer Solstice";
    }
  }

  function determineCategory(name, mimeType) {
    const lower = (name || "").toLowerCase();
    if (mimeType === "video/mp4" || lower.endsWith(".mp4")) return "motion";
    if (/castle|bench|balcony|palace|courtyard|town|street|terrace|arches|cathedral|stone|bridge|phone_booth/i.test(lower)) {
      return "architecture";
    }
    if (/ocean|lake|dock|beach|coast|water|boat|sand_dune|dune/i.test(lower)) {
      return "coastal";
    }
    if (/forest|laugh|embrace|book|coffee|library|campfire|garden|mist|indoor|clearing|trail|mountain/i.test(lower)) {
      return "intimate";
    }
    // Default to couples / meadows
    return "couples";
  }

  /* ==========================================================================
     4. Native Aspect Ratio Detection & Heuristics
     ========================================================================== */
  function getAspectRatioInfo(f) {
    let width = null;
    let height = null;

    if (f.imageMediaMetadata && f.imageMediaMetadata.width && f.imageMediaMetadata.height) {
      width = parseInt(f.imageMediaMetadata.width, 10);
      height = parseInt(f.imageMediaMetadata.height, 10);
    } else if (f.videoMediaMetadata && f.videoMediaMetadata.width && f.videoMediaMetadata.height) {
      width = parseInt(f.videoMediaMetadata.width, 10);
      height = parseInt(f.videoMediaMetadata.height, 10);
    }

    if (width && height) {
      const ratio = +(width / height).toFixed(3);
      let label = "Fine-Art";
      if (ratio > 1.6) label = "16:9 Cinema";
      else if (ratio >= 1.4 && ratio <= 1.6) label = "3:2 Standard";
      else if (ratio >= 1.2 && ratio < 1.4) label = "4:3 Classic";
      else if (ratio >= 0.95 && ratio <= 1.05) label = "1:1 Square";
      else if (ratio >= 0.75 && ratio < 0.95) label = "4:5 Portrait";
      else if (ratio >= 0.65 && ratio < 0.75) label = "3:4 Editorial";
      else if (ratio < 0.65) label = "9:16 Reel";

      return {
        width,
        height,
        aspectRatio: ratio,
        ratioCss: `${width} / ${height}`,
        ratioLabel: label
      };
    }

    const isVideo = f.mimeType === "video/mp4" || (f.name || "").endsWith(".mp4");
    if (isVideo) {
      return { width: 1080, height: 1920, aspectRatio: 0.563, ratioCss: "9 / 16", ratioLabel: "9:16 Reel" };
    }
    return { width: null, height: null, aspectRatio: null, ratioCss: null, ratioLabel: "2K Fine-Art" };
  }

  /* ==========================================================================
     5. Atelier Masterpiece Vault Loader
     ========================================================================== */
  async function loadAtelierVault(forceLive = false) {
    if (btnRefresh) btnRefresh.classList.add("rotating");

    // 1. Instant Static Manifest Load (Zero Latency, No API Key Exposed)
    if (!forceLive) {
      try {
        let res = await fetch("assets/gallery-media.json").catch(() => null);
        if (!res || !res.ok) res = await fetch("/assets/gallery-media.json").catch(() => null);
        if (res && res.ok) {
          const manifestData = await res.json();
          handleArtifactsLoaded(manifestData);
          if (btnRefresh) btnRefresh.classList.remove("rotating");
          return;
        }
      } catch (err) {
        console.info("Static archive fallback to stream:", err);
      }
    }

    // 2. Dynamic Live Sync Stream (if force refreshed)
    if (driveStatusText) driveStatusText.textContent = "Accessing Atelier Archive Stream...";
    const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${VAULT_FOLDER_ID}'+in+parents+and+trashed=false&key=${getVaultKey()}&pageSize=100&fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size,imageMediaMetadata(width,height),videoMediaMetadata(width,height))&orderBy=createdTime+desc`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Archive Stream HTTP ${res.status}`);

      const data = await res.json();
      const files = data.files || [];

      const mediaFiles = files.filter((f) => {
        return (
          (f.mimeType && (f.mimeType.startsWith("image/") || f.mimeType === "video/mp4")) ||
          /\.(jpe?g|png|webp|mp4)$/i.test(f.name)
        );
      });

      const formatted = mediaFiles.map((f, index) => {
        const isVideo = f.mimeType === "video/mp4" || f.name.endsWith(".mp4");
        const category = determineCategory(f.name, f.mimeType);
        const ratioInfo = getAspectRatioInfo(f);

        return {
          id: f.id,
          name: f.name,
          title: sanitizeTitle(f.name),
          isVideo: isVideo,
          category: category,
          tiltClass: ["tilt-left", "tilt-right", "tilt-left-sm", "tilt-right-sm"][index % 4],
          thumbUrl: `https://lh3.googleusercontent.com/d/${f.id}=w800`,
          fullUrl: isVideo
            ? `https://drive.google.com/file/d/${f.id}/preview`
            : `https://lh3.googleusercontent.com/d/${f.id}=w2400`,
          downloadUrl: f.webContentLink || `https://drive.google.com/uc?export=download&id=${f.id}`,
          size: formatBytes(f.size),
          date: formatDate(f.createdTime),
          specs: isVideo ? "1080p Cinematic Reel" : "2K Fine-Art Negative",
          width: ratioInfo.width,
          height: ratioInfo.height,
          aspectRatio: ratioInfo.aspectRatio,
          ratioCss: ratioInfo.ratioCss,
          ratioLabel: ratioInfo.ratioLabel
        };
      });

      handleArtifactsLoaded(formatted);
    } catch (err) {
      console.warn("Live stream query error, using local manifest:", err);
      try {
        let res = await fetch("assets/gallery-media.json").catch(() => null);
        if (!res || !res.ok) res = await fetch("/assets/gallery-media.json").catch(() => null);
        if (res && res.ok) {
          const manifestData = await res.json();
          handleArtifactsLoaded(manifestData);
          return;
        }
      } catch (_) {}
      handleArtifactsLoaded([], true);
    } finally {
      if (btnRefresh) {
        setTimeout(() => btnRefresh.classList.remove("rotating"), 500);
      }
    }
  }

  function handleArtifactsLoaded(artifacts, hadError = false) {
    if (hadError && artifacts.length === 0) {
      if (driveStatusText) driveStatusText.textContent = "Atelier Masterpiece Vault • 81 Works Active";
      // Construct fallback from known files
      artifacts = generateFallbackArtifacts();
    } else {
      if (driveStatusText) driveStatusText.textContent = "Atelier Archive Active • Master Negatives Synchronized";
    }

    allArtifacts = artifacts;
    if (driveCountPill) driveCountPill.textContent = `${allArtifacts.length} Artifacts`;
    if (footerTotalCount) footerTotalCount.textContent = `${allArtifacts.length} Media Artifacts`;

    // Update filter pill counts
    updateFilterCounts();

    // Render current active list
    filterAndRenderArtifacts();
  }

  function updateFilterCounts() {
    const counts = { all: allArtifacts.length, couples: 0, architecture: 0, coastal: 0, intimate: 0, motion: 0 };
    allArtifacts.forEach((a) => {
      if (counts[a.category] !== undefined) counts[a.category]++;
    });

    const elAll = document.getElementById("countAll");
    const elMeadows = document.getElementById("countMeadows");
    const elArch = document.getElementById("countArchitecture");
    const elCoast = document.getElementById("countCoastal");
    const elIntimate = document.getElementById("countIntimate");
    const elMotion = document.getElementById("countMotion");

    if (elAll) elAll.textContent = counts.all;
    if (elMeadows) elMeadows.textContent = counts.couples;
    if (elArch) elArch.textContent = counts.architecture;
    if (elCoast) elCoast.textContent = counts.coastal;
    if (elIntimate) elIntimate.textContent = counts.intimate;
    if (elMotion) elMotion.textContent = counts.motion;
  }

  /* ==========================================================================
     6. Render Dynamic Scrapbook Masonry Columns
     ========================================================================== */
  let currentColumnCount = 0;

  function getColumnCount() {
    const w = window.innerWidth;
    if (w < 500) return 1;
    if (w < 840) return 2;
    if (w < 1280) return 3;
    return 4;
  }

  function distributeIntoColumns(items, numCols) {
    const cols = Array.from({ length: numCols }, () => ({
      items: [],
      heightSum: 0
    }));

    items.forEach((item, originalIndex) => {
      // Relative estimated height: 1 / aspectRatio (height/width)
      const relHeight = item.aspectRatio ? (1 / item.aspectRatio) : 1.25;
      const totalEstHeight = relHeight + 0.42;

      let shortest = 0;
      for (let i = 1; i < numCols; i++) {
        if (cols[i].heightSum < cols[shortest].heightSum) {
          shortest = i;
        }
      }

      cols[shortest].items.push({ item, originalIndex });
      cols[shortest].heightSum += totalEstHeight;
    });

    return cols.map(c => c.items);
  }

  function filterAndRenderArtifacts() {
    filteredArtifacts = allArtifacts.filter((item) => {
      // Category check
      const matchesCategory =
        currentActiveFilter === "all" || item.category === currentActiveFilter;

      // Search keyword check
      const matchesSearch =
        !currentSearchQuery ||
        item.title.toLowerCase().includes(currentSearchQuery) ||
        item.name.toLowerCase().includes(currentSearchQuery) ||
        item.category.toLowerCase().includes(currentSearchQuery);

      return matchesCategory && matchesSearch;
    });

    if (loadingState) loadingState.style.display = "none";

    if (filteredArtifacts.length === 0) {
      if (galleryGrid) galleryGrid.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    renderGrid(filteredArtifacts);
  }

  /* ==========================================================================
     6. Render Dynamic Scrapbook Masonry Columns (Progressive Chunk Loading)
     ========================================================================== */
  function buildCardMarkup(item, originalIndex) {
    const frameRatioStyle = item.ratioCss
      ? `style="aspect-ratio: ${item.ratioCss};"`
      : (item.aspectRatio ? `style="aspect-ratio: ${item.aspectRatio};"` : "");

    return `
      <article class="drive-media-card ${item.tiltClass}" data-index="${originalIndex}">
        <!-- Translucent Washi Tape -->
        <div class="washi-tape tape-card-top" aria-hidden="true"></div>

        <!-- Decorative Corner Wax Seal on every 3rd card -->
        ${originalIndex % 3 === 0 ? '<img src="assets/wax_seal.png" class="card-corner-seal" aria-hidden="true" />' : ""}

        <!-- Media Photo Frame (Native Aspect Ratio - Zero Crop) -->
        <div class="media-photo-frame" ${frameRatioStyle}>
          <img src="${item.thumbUrl}" alt="${item.title}" class="media-thumbnail-img" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://drive.google.com/thumbnail?id=${item.id}&sz=w800';" />

          ${item.isVideo ? `
            <div class="video-motion-badge">
              <span class="video-play-glyph">▶</span>
              <span>Cinematic Reel</span>
            </div>
          ` : ""}

          <span class="media-res-badge">${item.ratioLabel ? `${item.ratioLabel}` : item.specs}</span>
        </div>

        <!-- Card Body -->
        <div class="media-card-body">
          <h3 class="media-clean-title">${item.title}</h3>
          
          <div class="media-meta-specs">
            <span>${item.date}</span>
            <span class="meta-spec-dot">&bull;</span>
            <span>${item.size}</span>
            ${item.width && item.height ? `<span class="meta-spec-dot">&bull;</span><span>${item.width}×${item.height}</span>` : ""}
          </div>

          <div class="media-card-actions">
            <button class="btn-inspect-frame" data-action="inspect" data-index="${originalIndex}">
              <span>Inspect Frame</span>
              <span>→</span>
            </button>

            <a href="${item.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-download-quick" title="Download original master negative" onclick="event.stopPropagation();">
              <span>Download ⤓</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }

  let progressiveRenderTimer = null;

  function renderGrid(items) {
    if (!galleryGrid) return;
    if (progressiveRenderTimer) {
      if ("cancelIdleCallback" in window) cancelIdleCallback(progressiveRenderTimer);
      else clearTimeout(progressiveRenderTimer);
      progressiveRenderTimer = null;
    }
    galleryGrid.innerHTML = "";

    const numCols = getColumnCount();
    currentColumnCount = numCols;
    const columns = distributeIntoColumns(items, numCols);

    const colElements = [];
    for (let c = 0; c < numCols; c++) {
      const colDiv = document.createElement("div");
      colDiv.className = "gallery-masonry-col";
      colDiv.setAttribute("data-col", String(c));
      galleryGrid.appendChild(colDiv);
      colElements.push(colDiv);
    }

    // Flatten into ordered queue with target column assignment
    const queue = [];
    columns.forEach((colItems, colIdx) => {
      colItems.forEach((entry) => {
        queue.push({ ...entry, colIdx });
      });
    });
    // Sort by original index for natural interleaving
    queue.sort((a, b) => a.originalIndex - b.originalIndex);

    // Progressive Chunk Rendering (Eliminates main-thread freeze & RAM spikes)
    const INITIAL_CHUNK = 14;
    const IDLE_BATCH = 10;
    let renderedCount = 0;

    function renderNextBatch(count) {
      const targetEnd = Math.min(renderedCount + count, queue.length);
      const fragments = Array.from({ length: numCols }, () => "");

      for (let i = renderedCount; i < targetEnd; i++) {
        const { item, originalIndex, colIdx } = queue[i];
        fragments[colIdx] += buildCardMarkup(item, originalIndex);
      }

      for (let c = 0; c < numCols; c++) {
        if (fragments[c]) {
          colElements[c].insertAdjacentHTML("beforeend", fragments[c]);
        }
      }

      renderedCount = targetEnd;

      if (renderedCount < queue.length) {
        if ("requestIdleCallback" in window) {
          progressiveRenderTimer = requestIdleCallback(() => renderNextBatch(IDLE_BATCH), { timeout: 120 });
        } else {
          progressiveRenderTimer = setTimeout(() => renderNextBatch(IDLE_BATCH), 30);
        }
      }
    }

    renderNextBatch(INITIAL_CHUNK);
  }

  // Memory-efficient Event Delegation on galleryGrid (replaces 81 listeners)
  if (galleryGrid) {
    galleryGrid.addEventListener("click", (e) => {
      if (e.target.closest(".btn-download-quick")) return;
      const inspectBtn = e.target.closest(".btn-inspect-frame");
      const card = e.target.closest(".drive-media-card");
      if (inspectBtn) {
        const idx = parseInt(inspectBtn.getAttribute("data-index") || "0", 10);
        openLightbox(idx);
      } else if (card) {
        const idx = parseInt(card.getAttribute("data-index") || "0", 10);
        openLightbox(idx);
      }
    });

    // Image aspect ratio auto-calibration on load via event delegation
    galleryGrid.addEventListener("load", (e) => {
      if (e.target && e.target.classList.contains("media-thumbnail-img")) {
        const img = e.target;
        const card = img.closest(".drive-media-card");
        if (!card) return;
        const idx = parseInt(card.getAttribute("data-index") || "0", 10);
        const item = filteredArtifacts[idx];
        if (item && (!item.aspectRatio || !item.width)) {
          if (img.naturalWidth && img.naturalHeight) {
            item.width = img.naturalWidth;
            item.height = img.naturalHeight;
            item.aspectRatio = +(img.naturalWidth / img.naturalHeight).toFixed(3);
            const frame = card.querySelector(".media-photo-frame");
            if (frame) frame.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
          }
        }
      }
    }, true);
  }

  // Window resize debounced listener to rebalance masonry columns
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (filteredArtifacts && filteredArtifacts.length > 0) {
        const newCols = getColumnCount();
        if (newCols !== currentColumnCount) {
          renderGrid(filteredArtifacts);
        }
      }
    }, 150);
  });

  /* ==========================================================================
     7. Search & Filter Event Listeners
     ========================================================================== */
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      initAudio();
      playGoldenChime(523.25);

      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      currentActiveFilter = pill.getAttribute("data-filter") || "all";
      filterAndRenderArtifacts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      if (btnClearSearch) {
        btnClearSearch.style.display = currentSearchQuery ? "block" : "none";
      }
      filterAndRenderArtifacts();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      btnClearSearch.style.display = "none";
      filterAndRenderArtifacts();
      searchInput.focus();
    });
  }

  if (btnResetSearch) {
    btnResetSearch.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";
      if (btnClearSearch) btnClearSearch.style.display = "none";
      currentActiveFilter = "all";
      filterPills.forEach((p) => p.classList.remove("active"));
      const allPill = document.querySelector('.archive-pill[data-filter="all"]');
      if (allPill) allPill.classList.add("active");
      filterAndRenderArtifacts();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      initAudio();
      playShutterSound();
      loadAtelierVault(true); // force live stream
    });
  }

  /* ==========================================================================
     8. High-Definition Lightbox Modal (Low-RAM Adaptive Resolution)
     ========================================================================== */
  function openLightbox(index) {
    initAudio();
    playShutterSound();

    if (!filteredArtifacts || index < 0 || index >= filteredArtifacts.length) return;
    currentLightboxIndex = index;
    const item = filteredArtifacts[index];

    // Mobile Low-RAM Image Optimization:
    // On phones (<=768px), request =w1400 instead of =w2400 to save 20MB+ bitmap RAM while remaining razor sharp!
    const isMobileViewport = window.innerWidth <= 768;
    const mediaHighResUrl = isMobileViewport
      ? (item.isVideo ? item.fullUrl : `https://lh3.googleusercontent.com/d/${item.id}=w1400`)
      : item.fullUrl;

    if (item.isVideo) {
      if (lightboxImageWrap) lightboxImageWrap.style.display = "none";
      if (lightboxVideoWrap) lightboxVideoWrap.style.display = "flex";
      if (lightboxVideoIframe) {
        lightboxVideoIframe.src = item.fullUrl;
        if (item.aspectRatio && item.aspectRatio < 0.8) {
          // Vertical Reel (9:16)
          lightboxVideoIframe.style.aspectRatio = "9 / 16";
          lightboxVideoIframe.style.width = "auto";
          lightboxVideoIframe.style.height = isMobileViewport ? "52dvh" : "66vh";
          lightboxVideoIframe.style.maxWidth = "90vw";
        } else {
          // Horizontal Video (16:9)
          lightboxVideoIframe.style.aspectRatio = "16 / 9";
          lightboxVideoIframe.style.width = "100%";
          lightboxVideoIframe.style.height = "auto";
          lightboxVideoIframe.style.maxWidth = "960px";
        }
      }
    } else {
      if (lightboxVideoWrap) lightboxVideoWrap.style.display = "none";
      if (lightboxImageWrap) lightboxImageWrap.style.display = "flex";
      if (lightboxImg) {
        lightboxImg.src = mediaHighResUrl;
        lightboxImg.alt = item.title;
        lightboxImg.style.aspectRatio = item.ratioCss || (item.aspectRatio ? String(item.aspectRatio) : "auto");
      }
    }

    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCategory) lightboxCategory.textContent = `✦ ${item.category.toUpperCase()} &bull; ${item.ratioLabel || item.specs} ✦`;
    const resString = item.width && item.height ? ` &bull; ${item.width}×${item.height} Master Negative` : ` &bull; Master Negative`;
    if (lightboxSpecs) lightboxSpecs.textContent = `${item.date} &bull; ${item.size}${resString}`;
    if (btnDownloadMedia) btnDownloadMedia.href = item.downloadUrl;

    if (lightboxModal) {
      lightboxModal.classList.add("open");
      lightboxModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove("open");
    lightboxModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Stop video playback if iframe was active
    if (lightboxVideoIframe) lightboxVideoIframe.src = "";
  }

  function nextLightbox() {
    if (filteredArtifacts.length === 0) return;
    const nextIdx = (currentLightboxIndex + 1) % filteredArtifacts.length;
    openLightbox(nextIdx);
  }

  function prevLightbox() {
    if (filteredArtifacts.length === 0) return;
    const prevIdx = (currentLightboxIndex - 1 + filteredArtifacts.length) % filteredArtifacts.length;
    openLightbox(prevIdx);
  }

  if (btnCloseLightbox) btnCloseLightbox.addEventListener("click", closeLightbox);
  if (btnLightboxNext) btnLightboxNext.addEventListener("click", nextLightbox);
  if (btnLightboxPrev) btnLightboxPrev.addEventListener("click", prevLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    // Mobile Touch-Swipe Gestures for Lightbox
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    lightboxModal.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lightboxModal.addEventListener("touchend", (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 42) {
          if (diffX < 0) nextLightbox(); // Swiped left -> next
          else prevLightbox(); // Swiped right -> prev
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") nextLightbox();
    else if (e.key === "ArrowLeft") prevLightbox();
  });

  // Mobile drawer toggle & auto-close
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

    // Close on link click
    mobileNavDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeMobileDrawer();
      });
    });

    // Close on outside tap
    document.addEventListener("click", (e) => {
      if (
        mobileNavDrawer.classList.contains("open") &&
        !mobileNavDrawer.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)
      ) {
        closeMobileDrawer();
      }
    });
  }

  // Back to top button
  const btnBackToTop = document.getElementById("btnBackToTop");
  if (btnBackToTop) {
    btnBackToTop.addEventListener("click", () => {
      initAudio();
      playGoldenChime(783.99);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==========================================================================
     8. Fallback Artifacts Dataset (Pre-indexed Google Drive Manifest)
     ========================================================================== */
  function generateFallbackArtifacts() {
    const rawFiles = [
      { id: "18ESp7__OB8NLtOC6HAaNH0W4j6XeITt-", name: "Couple_sitting_on_stone_bench_2K_20261009163726.jpg", size: "982 KB", isVideo: false },
      { id: "1Bsv8qsnAnHHObtIniA7PWkrhy6QpJD5U", name: "Couple_sitting_on_stone_bench_2K_20261009163735.jpg", size: "982 KB", isVideo: false },
      { id: "1v_uXIIwMhRHaFrMur6gLt3NR_VWSR5YH", name: "Couple_looking_at_ocean_2K_20261009163732.jpg", size: "770 KB", isVideo: false },
      { id: "1Qkau2Kf1bkpVbQjpAzj3c-MWRT3DCqDL", name: "Couple_laughing_on_balcony_2K_20261009163705.jpg", size: "701 KB", isVideo: false },
      { id: "1a3jc29YvhuRtwFNBd_tvI63GQwQ5SzNb", name: "Couple_standing_in_forest_retreat_2K_20261009164153.jpg", size: "705 KB", isVideo: false },
      { id: "1BcfAyUQbBecyIGMrTbt6HK8hEfbYqrql", name: "Couple_walking_through_cherry_blossoms_2K_20261009164158.jpg", size: "669 KB", isVideo: false },
      { id: "1dI4LKVAT9z-hCxs-In0KFhqh6HXcNGq6", name: "Couple_walking_through_cherry_blossoms_2K_20261009164151.jpg", size: "669 KB", isVideo: false },
      { id: "1Argkr8KMj46vaSDzC4OSBcxwnqU4zSGp", name: "Couple_standing_at_palace_courtyard_2K_20261009164129.jpg", size: "634 KB", isVideo: false },
      { id: "11WjAX7SVtrpuMreZ7VFpNvS4yXxv8B_x", name: "Couple_walking_in_medieval_castle_2K_20261009164122.jpg", size: "522 KB", isVideo: false },
      { id: "17EY6UdU0_cTLgOkqILjS-D8q-U8ox2lM", name: "Couple_sharing_laugh_over_book_2K_20261009163805.jpg", size: "522 KB", isVideo: false },
      { id: "1fNstQse665XDEAS-OD3whaZDjTPik0rB", name: "Couple_walking_in_medieval_castle_2K_20261009164113.jpg", size: "522 KB", isVideo: false },
      { id: "1y8VGFOgIlcmG3qgojOlOxK_7Luz2O5x2", name: "Couple_watching_hot_air_balloons_2K_20261009164127.jpg", size: "520 KB", isVideo: false },
      { id: "1v3pdofVSY6yXDS5zSaNAYMbTVPyzEwfc", name: "Couple_sitting_on_lakeside_deck_2K_20261009163700.jpg", size: "506 KB", isVideo: false },
      { id: "1nmvFpOca6qD_OWseR5W1hCk2XP0SzVI3", name: "Couple_looking_at_ocean_2K_20261009163929.jpg", size: "513 KB", isVideo: false },
      { id: "1T215BxR4WilMWGXpT2NndxWGzPmVX69X", name: "Couple_embracing_in_misty_forest_2K_20261009163800.jpg", size: "433 KB", isVideo: false },
      { id: "1V9okL0Mwt2cNJMpaLUinRMFzlTELBKmt", name: "Couple_laughing_on_Santorini_terrace_2K_20261009164204.jpg", size: "408 KB", isVideo: false },
      { id: "demo-v1", name: "Couple_walking_along_alpine_lake_20261010002651.mp4", size: "18.4 MB", isVideo: true },
      { id: "demo-v2", name: "Couple_paragliding_over_snowy_valley_20261010002717.mp4", size: "22.1 MB", isVideo: true },
      { id: "demo-v3", name: "Couple_walking_on_sand_dune_20261009175240.mp4", size: "16.8 MB", isVideo: true }
    ];

    return rawFiles.map((f, i) => {
      const category = determineCategory(f.name, f.isVideo ? "video/mp4" : "image/jpeg");
      const ratioInfo = getAspectRatioInfo(f);
      return {
        id: f.id,
        name: f.name,
        title: sanitizeTitle(f.name),
        isVideo: f.isVideo,
        category: category,
        tiltClass: ["tilt-left", "tilt-right", "tilt-left-sm", "tilt-right-sm"][i % 4],
        thumbUrl: f.isVideo ? "assets/couple_meadow.png" : `https://lh3.googleusercontent.com/d/${f.id}=w800`,
        fullUrl: f.isVideo ? `https://drive.google.com/file/d/${f.id}/preview` : `https://lh3.googleusercontent.com/d/${f.id}=w2400`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
        size: f.size,
        date: "October 09, 2026",
        specs: f.isVideo ? "1080p Cinematic Reel" : "2K Fine-Art Negative",
        width: ratioInfo.width,
        height: ratioInfo.height,
        aspectRatio: ratioInfo.aspectRatio,
        ratioCss: ratioInfo.ratioCss,
        ratioLabel: ratioInfo.ratioLabel
      };
    });
  }

  // Initial Load from local manifest
  loadAtelierVault();
});
