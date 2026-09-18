/* ===================================================================
   ROMANTIC BIRTHDAY SURPRISE WEBSITE - JAVASCRIPT
   Features:
   - Surprise Unlock Screen & Transition
   - Interactive Canvas Floating Heart Engine
   - Smart Image Loader (handles photo1.jpg.JPG, photo1.jpg, photo1.png, etc.)
   - Audio Controller with Synthetic Ambient Melodies Fallback
   - Photo Lightbox Modal
   - Flying Heart Kiss Explosion Effect
   - Scroll-Triggered Reveal Animations
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------------------------------------------
     1. SMART IMAGE LOADER FOR USER PHOTOS
     Fixes Windows double-extensions (.jpg.JPG) and case sensitivity
     on GitHub Pages & local browsers without replacing with placeholders.
     ----------------------------------------------------------------- */
  const galleryImages = document.querySelectorAll('.gallery-img');

  galleryImages.forEach((img, index) => {
    const photoNum = img.getAttribute('data-photo') || (index + 1);
    
    // List of possible file paths & extension variations
    const possibleSrcs = [
      `images/photo${photoNum}.jpg.JPG`,
      `images/photo${photoNum}.jpg`,
      `images/photo${photoNum}.JPG`,
      `images/photo${photoNum}.png`,
      `images/photo${photoNum}.jpeg`,
      `./images/photo${photoNum}.jpg.JPG`,
      `./images/photo${photoNum}.jpg`
    ];

    // Preload & test candidates until the exact file on disk/server is verified
    function verifyAndLoadSrc(srcIndex) {
      if (srcIndex >= possibleSrcs.length) return;

      const candidateSrc = possibleSrcs[srcIndex];
      const tester = new Image();

      tester.onload = function() {
        img.src = candidateSrc;
      };

      tester.onerror = function() {
        verifyAndLoadSrc(srcIndex + 1);
      };

      tester.src = candidateSrc;
    }

    // Start verification immediately
    verifyAndLoadSrc(0);
  });

  /* -----------------------------------------------------------------
     2. AUDIO PLAYER & SYNTHESIZER FALLBACK
     ----------------------------------------------------------------- */
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicIcon = document.getElementById('musicIcon');
  const musicText = document.getElementById('musicText');
  const soundWave = document.getElementById('soundWave');

  let isPlaying = false;
  let synthInterval = null;
  let audioCtx = null;

  // Web Audio API Synthesizer (plays romantic chord arpeggios if music.mp3 fails)
  function startSyntheticMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G7
    ];

    let chordIndex = 0;
    let noteIndex = 0;

    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      
      const currentChord = chords[chordIndex];
      const freq = currentChord[noteIndex % currentChord.length];
      noteIndex++;

      if (noteIndex % 8 === 0) {
        chordIndex = (chordIndex + 1) % chords.length;
      }

      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.9);
      } catch (e) {
        console.log("Audio synth error:", e);
      }
    }, 450);
  }

  function stopSyntheticMusic() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function toggleMusic() {
    if (isPlaying) {
      // Pause
      bgAudio.pause();
      stopSyntheticMusic();
      isPlaying = false;
      musicIcon.textContent = '🎵';
      musicText.textContent = 'Play Music';
      soundWave.classList.remove('active');
    } else {
      // Play
      isPlaying = true;
      musicIcon.textContent = '⏸️';
      musicText.textContent = 'Playing';
      soundWave.classList.add('active');

      // Attempt to play actual MP3 audio file
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("MP3 file not playing or missing, starting romantic synth music fallback!");
          startSyntheticMusic();
        });
      }
    }
  }

  musicToggleBtn.addEventListener('click', toggleMusic);

  /* -----------------------------------------------------------------
     3. SURPRISE UNLOCK TRANSITION
     ----------------------------------------------------------------- */
  const unlockScreen = document.getElementById('unlockScreen');
  const unlockBtn = document.getElementById('unlockBtn');
  const mainContent = document.getElementById('mainContent');

  unlockBtn.addEventListener('click', () => {
    // Explosive Heart Particles on unlock
    createHeartExplosion(window.innerWidth / 2, window.innerHeight / 2, 40);

    // Unlock Screen Fade Out
    unlockScreen.classList.add('unlocked');
    mainContent.classList.add('visible');

    // Auto-start music on unlock click
    setTimeout(() => {
      if (!isPlaying) {
        toggleMusic();
      }
    }, 500);
  });

  /* -----------------------------------------------------------------
     4. FLOATING HEART CANVAS ENGINE
     ----------------------------------------------------------------- */
  function setupHeartCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const hearts = [];
    const heartCount = 30;

    class Heart {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.size = Math.random() * 14 + 10;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.5;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.color = `hsl(${Math.random() * 30 + 330}, 100%, ${Math.random() * 30 + 60}%)`;
      }

      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.6 + this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y < -50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        // Draw Heart Path
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
        ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 2, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
        ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    for (let i = 0; i < heartCount; i++) {
      const h = new Heart();
      h.y = Math.random() * height;
      hearts.push(h);
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      hearts.forEach(heart => {
        heart.update();
        heart.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  // Initialize Canvas Particles
  setupHeartCanvas('introHeartCanvas');
  setupHeartCanvas('mainHeartCanvas');

  /* -----------------------------------------------------------------
     5. HEART EXPLOSION / KISS SPRAY EFFECT
     ----------------------------------------------------------------- */
  function createHeartExplosion(originX, originY, count = 30) {
    const explosionContainer = document.createElement('div');
    explosionContainer.style.position = 'fixed';
    explosionContainer.style.top = '0';
    explosionContainer.style.left = '0';
    explosionContainer.style.width = '100vw';
    explosionContainer.style.height = '100vh';
    explosionContainer.style.pointerEvents = 'none';
    explosionContainer.style.zIndex = '99999';
    document.body.appendChild(explosionContainer);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const emojis = ['❤️', '💖', '💕', '💋', '✨', '🌸'];
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.position = 'absolute';
      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;
      el.style.fontSize = `${Math.random() * 20 + 20}px`;
      el.style.userSelect = 'none';
      el.style.transition = 'transform 1.8s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.8s linear';

      explosionContainer.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 300 + 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 100;
      const rot = (Math.random() - 0.5) * 720;

      requestAnimationFrame(() => {
        el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(1.4)`;
        el.style.opacity = '0';
      });
    }

    setTimeout(() => {
      explosionContainer.remove();
    }, 2000);
  }

  // Kiss Button Click Event
  const kissBtn = document.getElementById('kissBtn');
  if (kissBtn) {
    kissBtn.addEventListener('click', (e) => {
      const rect = kissBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createHeartExplosion(x, y, 35);
    });
  }

  /* -----------------------------------------------------------------
     6. PHOTO LIGHTBOX MODAL
     ----------------------------------------------------------------- */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  const cards = document.querySelectorAll('.gallery-card');

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.gallery-img');

      if (img && lightboxModal) {
        lightboxImg.src = img.src;
        if (lightboxCaption) {
          lightboxCaption.textContent = `Memory #${index + 1}`;
        }
        lightboxModal.classList.add('active');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      lightboxModal.classList.remove('active');
    }
  });

  /* -----------------------------------------------------------------
     7. SCROLL REVEAL ANIMATIONS
     ----------------------------------------------------------------- */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
  elementsToReveal.forEach(el => revealObserver.observe(el));

});
