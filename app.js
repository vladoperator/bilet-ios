/**
 * Apple Messages (iMessage) 1:1 Pixel-Perfect Experience
 * Comprehensive Application Logic, Sound Synthesis, Canvas Effects,
 * Tapback System, Live Typing Simulation, and iOS/macOS Switching.
 */

// ============================================================================
// 1. WEB AUDIO API SYNTHESIZER (100% Authentic Apple Sound FX, No External Deps)
// ============================================================================
class AppleAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // The iconic Apple iMessage "Swoosh" Sent Sound
  playSendSwoosh() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.32);
    filter.Q.setValueAtTime(3.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    // Subtle upward pop tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.14);

    oscGain.gain.setValueAtTime(0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.35);
    osc.stop(now + 0.18);
  }

  // The famous Apple iMessage "Note" / Ding Received Sound
  playReceivedChime() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const notes = [
      { freq: 1046.5, time: 0, dur: 0.4 },     // C6
      { freq: 1318.5, time: 0.08, dur: 0.5 },  // E6
      { freq: 1567.98, time: 0.16, dur: 0.65 } // G6
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.22, now + note.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }

  // Tapback Rubber Pop Sound
  playTapbackPop() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Voice Note Synthesizer for Audio Memo Playback
  playVoiceMemoBeep(pitch, duration) {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }
}

const soundEngine = new AppleAudioEngine();

// ============================================================================
// 2. FULL-SCREEN SPECIAL EFFECTS ENGINE (Confetti, Balloons, Lasers, Fireworks)
// ============================================================================
class AppleEffectsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.activeEffect = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.activeEffect = null;
  }

  trigger(effectType) {
    this.stop();
    this.resize();
    this.activeEffect = effectType;

    if (effectType === 'confetti') {
      this.initConfetti();
    } else if (effectType === 'balloons') {
      this.initBalloons();
    } else if (effectType === 'lasers') {
      this.initLasers();
    } else if (effectType === 'fireworks') {
      this.initFireworks();
    } else if (effectType === 'love') {
      this.initLove();
    }

    this.loop();
    setTimeout(() => this.stop(), 6500);
  }

  initConfetti() {
    const colors = ['#007AFF', '#34C759', '#FF2D55', '#FF9500', '#FFCC00', '#AF52DE', '#5856D6'];
    for (let i = 0; i < 180; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height * 0.5,
        w: Math.random() * 9 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 5 + 3,
        rot: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5
      });
    }
  }

  initBalloons() {
    const colors = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE', '#FFCC00'];
    for (let i = 0; i < 28; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas.width - 100) + 50,
        y: this.canvas.height + Math.random() * 300,
        radius: Math.random() * 18 + 26,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(Math.random() * 2.5 + 2),
        swaySpeed: Math.random() * 0.04 + 0.02,
        swayAmp: Math.random() * 30 + 15,
        seed: Math.random() * 100
      });
    }
  }

  initLasers() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.04 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        color: ['#00FFFF', '#FF007F', '#39FF14', '#9400D3'][i % 4],
        width: Math.random() * 4 + 2
      });
    }
  }

  initFireworks() {
    this.particles = [];
    this.spawnFirework();
    this.fireworkTimer = setInterval(() => {
      if (this.activeEffect === 'fireworks') this.spawnFirework();
    }, 700);
  }

  spawnFirework() {
    const x = Math.random() * (this.canvas.width * 0.7) + this.canvas.width * 0.15;
    const y = Math.random() * (this.canvas.height * 0.45) + 80;
    const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 / 80) * i;
      const speed = Math.random() * 6 + 1.5;
      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: chosenColor,
        decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  initLove() {
    this.particles.push({
      type: 'bigHeart',
      scale: 0.1,
      targetScale: 1.4,
      alpha: 1
    });
  }

  loop() {
    if (!this.activeEffect) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.activeEffect === 'confetti') {
      this.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rot * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      });
    } else if (this.activeEffect === 'balloons') {
      this.particles.forEach(b => {
        b.y += b.vy;
        const currentX = b.x + Math.sin(b.seed) * b.swayAmp;
        b.seed += b.swaySpeed;

        this.ctx.save();
        // Balloon Body
        this.ctx.fillStyle = b.color;
        this.ctx.beginPath();
        this.ctx.ellipse(currentX, b.y, b.radius * 0.85, b.radius, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Balloon Highlight Shine
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(currentX - b.radius * 0.3, b.y - b.radius * 0.35, b.radius * 0.2, b.radius * 0.3, -Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // String
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, b.y + b.radius);
        this.ctx.quadraticCurveTo(currentX + 10, b.y + b.radius + 35, currentX, b.y + b.radius + 70);
        this.ctx.stroke();
        this.ctx.restore();
      });
    } else if (this.activeEffect === 'lasers') {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach(l => {
        l.angle += l.speed;
        const endX = cx + Math.cos(l.angle) * this.canvas.width;
        const endY = cy + Math.sin(l.angle) * this.canvas.height;

        this.ctx.save();
        this.ctx.strokeStyle = l.color;
        this.ctx.lineWidth = l.width;
        this.ctx.shadowColor = l.color;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.restore();
      });
    } else if (this.activeEffect === 'fireworks') {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        } else {
          this.ctx.save();
          this.ctx.globalAlpha = p.alpha;
          this.ctx.fillStyle = p.color;
          this.ctx.shadowColor = p.color;
          this.ctx.shadowBlur = 8;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    } else if (this.activeEffect === 'love') {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      const heart = this.particles[0];
      if (heart) {
        if (heart.scale < heart.targetScale) {
          heart.scale += 0.025;
        }

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(heart.scale, heart.scale);
        this.ctx.fillStyle = '#FF2D55';
        this.ctx.shadowColor = '#FF2D55';
        this.ctx.shadowBlur = 35;

        this.ctx.beginPath();
        const topCurveHeight = 60;
        this.ctx.moveTo(0, topCurveHeight);
        this.ctx.bezierCurveTo(0, 0, -100, 0, -100, topCurveHeight);
        this.ctx.bezierCurveTo(-100, 120, 0, 170, 0, 220);
        this.ctx.bezierCurveTo(0, 170, 100, 120, 100, topCurveHeight);
        this.ctx.bezierCurveTo(100, 0, 0, 0, 0, topCurveHeight);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

// ============================================================================
// 3. SEED CONVERSATION DATA & CONTACTS
// ============================================================================
const CONVERSATIONS_DATA = [
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    phone: '+1 (408) 555-0199',
    avatar: './assets/sarah.jpg',
    isPinned: true,
    pinnedPreview: 'See you at 7! ☕',
    unreadCount: 1,
    isOnline: true,
    lastTime: '9:41 AM',
    messages: [
      {
        id: 's1',
        sender: 'sarah',
        type: 'text',
        text: 'Morning! Are we still on for the Yosemite road trip this weekend?',
        time: '9:24 AM',
        reactions: { love: 1 }
      },
      {
        id: 's2',
        sender: 'me',
        type: 'text',
        text: 'Yes absolutely! Packed my hiking boots and camera gear already 🎒',
        time: '9:28 AM',
        status: 'Delivered'
      },
      {
        id: 's3',
        sender: 'sarah',
        type: 'image',
        mediaUrl: './assets/yosemite.jpg',
        time: '9:30 AM',
        reactions: { like: 1 }
      },
      {
        id: 's4',
        sender: 'sarah',
        type: 'text',
        text: 'Look at the alpine lake we are hiking to on Saturday! Crystal clear water 😍',
        time: '9:31 AM'
      },
      {
        id: 's5',
        sender: 'sarah',
        type: 'audio',
        duration: 14,
        time: '9:35 AM'
      },
      {
        id: 's6',
        sender: 'me',
        type: 'cash',
        amount: 25,
        memo: 'Coffee & Snacks split',
        time: '9:38 AM',
        status: 'Completed'
      },
      {
        id: 's7',
        sender: 'sarah',
        type: 'text',
        text: 'Got it, thank you! See you at 7! ☕',
        time: '9:41 AM'
      }
    ]
  },
  {
    id: 'tim',
    name: 'Tim Cook',
    phone: '+1 (408) 996-1010',
    avatar: './assets/tim.jpg',
    isPinned: true,
    pinnedPreview: 'Looking forward to WWDC 🚀',
    unreadCount: 0,
    isOnline: true,
    lastTime: 'Yesterday',
    messages: [
      {
        id: 't1',
        sender: 'tim',
        type: 'text',
        text: 'Good morning! The new Apple Intelligence features are getting remarkable feedback.',
        time: 'Yesterday 10:15 AM',
        reactions: { exclamation: 1 }
      },
      {
        id: 't2',
        sender: 'me',
        type: 'text',
        text: 'The on-device models and contextual awareness feel like magic Tim!',
        time: 'Yesterday 10:18 AM',
        status: 'Read Yesterday'
      },
      {
        id: 't3',
        sender: 'tim',
        type: 'text',
        text: 'We think you are going to love what the team has prepared next. Looking forward to WWDC 🚀',
        time: 'Yesterday 10:20 AM',
        reactions: { love: 1 }
      }
    ]
  },
  {
    id: 'alex',
    name: 'Alex Chen',
    phone: '+1 (650) 555-0142',
    avatar: './assets/alex.jpg',
    isPinned: true,
    pinnedPreview: 'Check this cafe! 🥐',
    unreadCount: 0,
    isOnline: false,
    lastTime: 'Sunday',
    messages: [
      {
        id: 'a1',
        sender: 'alex',
        type: 'text',
        text: 'Hey! Found this brand new bakery in Hayes Valley.',
        time: 'Sunday 11:02 AM'
      },
      {
        id: 'a2',
        sender: 'alex',
        type: 'image',
        mediaUrl: './assets/coffee.jpg',
        time: 'Sunday 11:03 AM',
        reactions: { haha: 1 },
        sticker: '🔥'
      },
      {
        id: 'a3',
        sender: 'me',
        type: 'text',
        text: 'That almond croissant looks unreal! Let us go tomorrow.',
        time: 'Sunday 11:05 AM',
        status: 'Read Sunday'
      }
    ]
  },
  {
    id: 'dev_team',
    name: 'SwiftUI & Core Architecture',
    phone: 'Group (4 people)',
    avatar: './assets/tim.jpg',
    isGroup: true,
    groupAvatars: ['./assets/alex.jpg', './assets/sarah.jpg'],
    isPinned: false,
    unreadCount: 2,
    isOnline: true,
    lastTime: '9:12 AM',
    messages: [
      {
        id: 'd1',
        sender: 'Liam',
        isReceived: true,
        type: 'text',
        text: 'Merged the metal shader pipeline for fluid glass reflections.',
        time: '8:45 AM'
      },
      {
        id: 'd2',
        sender: 'me',
        type: 'text',
        text: 'Tested at 120Hz ProMotion on iPad and iPhone 16 Pro, silky smooth!',
        time: '9:00 AM',
        status: 'Delivered'
      },
      {
        id: 'd3',
        sender: 'Chloe',
        isReceived: true,
        type: 'text',
        text: 'PR #4082 is ready for review. Take a look when you have a moment.',
        time: '9:12 AM'
      }
    ]
  },
  {
    id: 'pizza',
    name: "Luigi's Artisan Pizza",
    phone: 'SMS: 284-99',
    avatar: './assets/coffee.jpg',
    isSMS: true,
    isPinned: false,
    unreadCount: 0,
    isOnline: false,
    lastTime: 'Tuesday',
    messages: [
      {
        id: 'p1',
        sender: 'luigi',
        isReceived: true,
        type: 'text',
        text: 'Your Margherita & Truffle Pizza order #884 is fresh out of the oven! 🍕',
        time: 'Tuesday 7:15 PM'
      },
      {
        id: 'p2',
        sender: 'me',
        isSMS: true,
        type: 'text',
        text: 'Thanks! Buzz unit 4B when arriving.',
        time: 'Tuesday 7:16 PM'
      },
      {
        id: 'p3',
        sender: 'luigi',
        isReceived: true,
        type: 'text',
        text: 'Driver is on the way. Estimated arrival 7:28 PM. Buon appetito!',
        time: 'Tuesday 7:18 PM'
      }
    ]
  }
];

// ============================================================================
// 4. MAIN CONTROLLER & APPLICATION STATE
// ============================================================================
class AppleMessagesApp {
  constructor() {
    this.conversations = CONVERSATIONS_DATA;
    this.activeConvoId = 'sarah';
    this.currentMessageType = 'imessage'; // 'imessage' or 'sms'
    this.activeTapbackTarget = null;
    this.selectedEffect = null;
    this.audioPlayingId = null;

    // DOM Elements
    this.elements = {
      body: document.body,
      pinnedSection: document.getElementById('pinnedSection'),
      conversationsList: document.getElementById('conversationsList'),
      messageStream: document.getElementById('messageStream'),
      messageStreamContainer: document.getElementById('messageStreamContainer'),
      messageInput: document.getElementById('messageInput'),
      btnSendMessage: document.getElementById('btnSendMessage'),
      btnMicAction: document.getElementById('btnMicAction'),
      btnToggleApps: document.getElementById('btnToggleApps'),
      appsDrawer: document.getElementById('appsDrawer'),
      activeContactAvatar: document.getElementById('activeContactAvatar'),
      activeContactName: document.getElementById('activeContactName'),
      activeContactSubtitle: document.getElementById('activeContactSubtitle'),
      activePresenceDot: document.getElementById('activePresenceDot'),
      tapbackPopup: document.getElementById('tapbackPopup'),
      effectPickerModal: document.getElementById('effectPickerModal'),
      appleCashModal: document.getElementById('appleCashModal'),
      quickLookModal: document.getElementById('quickLookModal'),
      quickLookImg: document.getElementById('quickLookImg'),
      stickersDrawer: document.getElementById('stickersDrawer'),
      detailsPanel: document.getElementById('detailsPanel'),
      btnToggleDetails: document.getElementById('btnToggleDetails'),
      btnDetailsDone: document.getElementById('btnDetailsDone'),
      detailsAvatar: document.getElementById('detailsAvatar'),
      detailsName: document.getElementById('detailsName'),
      detailsPhone: document.getElementById('detailsPhone'),
      btnMacView: document.getElementById('btnMacView'),
      btnIphoneView: document.getElementById('btnIphoneView'),
      btnToggleMsgType: document.getElementById('btnToggleMsgType'),
      msgTypeLabel: document.getElementById('msgTypeLabel'),
      btnSoundToggle: document.getElementById('btnSoundToggle'),
      soundIconOn: document.getElementById('soundIconOn'),
      soundIconOff: document.getElementById('soundIconOff'),
      btnThemeToggle: document.getElementById('btnThemeToggle'),
      themeIconDark: document.getElementById('themeIconDark'),
      themeIconLight: document.getElementById('themeIconLight'),
      systemClock: document.getElementById('systemClock'),
      iosTime: document.getElementById('iosTime'),
      dynamicIsland: document.getElementById('dynamicIsland'),
      mobileBackBtn: document.getElementById('mobileBackBtn'),
      messagesBody: document.querySelector('.messages-body'),
      conversationsSidebar: document.getElementById('conversationsSidebar'),
      searchInput: document.getElementById('searchInput'),
      searchClearBtn: document.getElementById('searchClearBtn')
    };

    // Canvas Special Effects
    this.effectsEngine = new AppleEffectsEngine(document.getElementById('effectsCanvas'));

    this.init();
  }

  init() {
    this.bindEvents();
    this.startClock();
    this.renderSidebar();
    this.renderActiveConversation();
  }

  // --------------------------------------------------------------------------
  // EVENT BINDINGS
  // --------------------------------------------------------------------------
  bindEvents() {
    // Input typing & Enter key to send
    this.elements.messageInput.addEventListener('input', () => this.handleInputChange());
    this.elements.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Send button click
    this.elements.btnSendMessage.addEventListener('click', () => this.sendMessage());

    // Long press or context menu on Send button opens "Send with effect"
    let sendHoldTimer = null;
    this.elements.btnSendMessage.addEventListener('mousedown', () => {
      sendHoldTimer = setTimeout(() => this.openEffectPicker(), 500);
    });
    this.elements.btnSendMessage.addEventListener('mouseup', () => clearTimeout(sendHoldTimer));
    this.elements.btnSendMessage.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.openEffectPicker();
    });

    // Mic action triggers sample voice memo
    this.elements.btnMicAction.addEventListener('click', () => this.recordVoiceMemoDemo());

    // Plus (+) button opens/closes Apple Apps Drawer
    this.elements.btnToggleApps.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAppsDrawer();
    });

    // Apps drawer items
    document.querySelectorAll('.app-drawer-item').forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        this.handleAppDrawerAction(action);
      });
    });

    // Close drawers on outside click
    document.addEventListener('click', (e) => {
      if (!this.elements.appsDrawer.contains(e.target) && !this.elements.btnToggleApps.contains(e.target)) {
        this.closeAppsDrawer();
      }
      if (!this.elements.tapbackPopup.contains(e.target)) {
        this.closeTapback();
      }
      if (!this.elements.stickersDrawer.contains(e.target)) {
        this.elements.stickersDrawer.style.display = 'none';
      }
    });

    // Tapback selection buttons
    document.querySelectorAll('.tapback-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const reaction = btn.getAttribute('data-reaction');
        this.applyReaction(reaction);
      });
    });

    // Send with Effect Sheet tabs and choices
    document.querySelectorAll('.effect-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.effect-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.effect-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const tabTarget = tab.getAttribute('data-tab');
        if (tabTarget === 'bubble') {
          document.getElementById('tabBubbleEffects').classList.add('active');
        } else {
          document.getElementById('tabScreenEffects').classList.add('active');
        }
      });
    });

    document.querySelectorAll('.effect-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.effect-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedEffect = btn.getAttribute('data-effect');
        // Preview on screen immediately if screen effect
        if (['confetti', 'balloons', 'lasers', 'fireworks', 'love'].includes(this.selectedEffect)) {
          this.effectsEngine.trigger(this.selectedEffect);
        }
      });
    });

    document.getElementById('btnConfirmSendEffect').addEventListener('click', () => {
      this.closeEffectPicker();
      this.sendMessage(this.selectedEffect);
    });

    document.getElementById('btnCancelEffect').addEventListener('click', () => this.closeEffectPicker());

    // Apple Cash Transfer Modal
    document.getElementById('btnCloseCashModal').addEventListener('click', () => {
      this.elements.appleCashModal.style.display = 'none';
    });

    document.querySelectorAll('.cash-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.cash-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const amt = chip.getAttribute('data-amt');
        document.getElementById('cashAmountInput').value = amt;
        document.getElementById('btnSendCash').textContent = `Send $${amt}.00`;
      });
    });

    document.getElementById('cashAmountInput').addEventListener('input', (e) => {
      const amt = e.target.value || 0;
      document.getElementById('btnSendCash').textContent = `Send $${amt}.00`;
    });

    document.getElementById('btnSendCash').addEventListener('click', () => {
      const amt = parseFloat(document.getElementById('cashAmountInput').value) || 25;
      const memo = document.getElementById('cashMemoInput').value || 'Apple Cash payment';
      this.elements.appleCashModal.style.display = 'none';
      this.sendCashMessage(amt, memo);
    });

    document.getElementById('btnRequestCash').addEventListener('click', () => {
      const amt = parseFloat(document.getElementById('cashAmountInput').value) || 25;
      this.elements.appleCashModal.style.display = 'none';
      this.sendTextMessage(`Requested $${amt}.00 via Apple Cash`);
    });

    // Details sidebar toggle
    this.elements.btnToggleDetails.addEventListener('click', () => this.toggleDetailsPanel());
    this.elements.btnDetailsDone.addEventListener('click', () => this.toggleDetailsPanel(false));

    // Device View Mode Switcher: macOS vs iPhone 16 Pro
    this.elements.btnMacView.addEventListener('click', () => this.setDeviceMode('macos'));
    this.elements.btnIphoneView.addEventListener('click', () => this.setDeviceMode('iphone'));

    // iMessage Blue / SMS Green toggle
    this.elements.btnToggleMsgType.addEventListener('click', () => this.toggleMessageType());

    // Sound FX toggle
    this.elements.btnSoundToggle.addEventListener('click', () => this.toggleSound());

    // Theme (Dark / Light) toggle
    this.elements.btnThemeToggle.addEventListener('click', () => this.toggleTheme());

    // Dynamic Island interactive click
    this.elements.dynamicIsland.addEventListener('click', () => {
      this.elements.dynamicIsland.classList.toggle('expanded');
    });

    // QuickLook Photo Lightbox close
    this.elements.quickLookModal.addEventListener('click', () => {
      this.elements.quickLookModal.style.display = 'none';
    });
    document.getElementById('btnCloseQuickLook').addEventListener('click', () => {
      this.elements.quickLookModal.style.display = 'none';
    });

    // Mobile Back to Conversations List
    this.elements.mobileBackBtn.addEventListener('click', () => {
      this.elements.messagesBody.classList.remove('showing-chat');
    });

    // Search bar filtering
    this.elements.searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      this.elements.searchClearBtn.style.display = q ? 'block' : 'none';
      this.filterConversations(q);
    });
    this.elements.searchClearBtn.addEventListener('click', () => {
      this.elements.searchInput.value = '';
      this.elements.searchClearBtn.style.display = 'none';
      this.filterConversations('');
    });

    // Stickers Drawer
    document.getElementById('btnCloseStickers').addEventListener('click', () => {
      this.elements.stickersDrawer.style.display = 'none';
    });

    document.querySelectorAll('.sticker-item').forEach(st => {
      st.addEventListener('click', () => {
        const emoji = st.getAttribute('data-emoji');
        this.affixStickerToLastBubble(emoji);
        this.elements.stickersDrawer.style.display = 'none';
      });
    });

    // Sidebar toggle in macOS mode
    const sidebarToggle = document.getElementById('btnToggleSidebar');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const sidebar = this.elements.conversationsSidebar;
        if (sidebar.style.display === 'none') {
          sidebar.style.display = 'flex';
        } else {
          sidebar.style.display = 'none';
        }
      });
    }

    // New Message button
    const handleNewMessage = () => {
      soundEngine.playTapbackPop();
      const contactNames = this.conversations.map(c => c.name).join(', ');
      const newContact = prompt(`New Conversation - Choose contact:\n(${contactNames})`, 'Sarah Jenkins');
      if (newContact) {
        const matched = this.conversations.find(c => c.name.toLowerCase().includes(newContact.toLowerCase()));
        if (matched) {
          this.switchConversation(matched.id);
        }
      }
    };
    const btnNew = document.getElementById('btnNewMessage');
    if (btnNew) btnNew.addEventListener('click', handleNewMessage);
    const btnNewMob = document.getElementById('btnNewMessageMobile');
    if (btnNewMob) btnNewMob.addEventListener('click', handleNewMessage);

    // Audio click initialization for browser autoplay policy
    document.addEventListener('pointerdown', () => soundEngine.init(), { once: true });
  }

  // --------------------------------------------------------------------------
  // CLOCK
  // --------------------------------------------------------------------------
  startClock() {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let mins = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      const timeStr = `${hours}:${formattedMins} ${ampm}`;
      const timeStrShort = `${hours}:${formattedMins}`;

      if (this.elements.systemClock) this.elements.systemClock.textContent = timeStr;
      if (this.elements.iosTime) this.elements.iosTime.textContent = timeStrShort;
    };
    updateTime();
    setInterval(updateTime, 30000);
  }

  // --------------------------------------------------------------------------
  // DEVICE & THEME CONTROLS
  // --------------------------------------------------------------------------
  setDeviceMode(mode) {
    if (mode === 'macos') {
      this.elements.body.classList.remove('iphone-mode');
      this.elements.body.classList.add('macos-mode');
      this.elements.btnMacView.classList.add('active');
      this.elements.btnIphoneView.classList.remove('active');
      this.elements.messagesBody.classList.remove('showing-chat');
    } else {
      this.elements.body.classList.remove('macos-mode');
      this.elements.body.classList.add('iphone-mode');
      this.elements.btnIphoneView.classList.add('active');
      this.elements.btnMacView.classList.remove('active');
      this.elements.messagesBody.classList.add('showing-chat');
    }
  }

  toggleMessageType() {
    if (this.currentMessageType === 'imessage') {
      this.currentMessageType = 'sms';
      this.elements.msgTypeLabel.textContent = 'Text Message (SMS)';
      const dot = this.elements.btnToggleMsgType.querySelector('.type-indicator-dot');
      dot.className = 'type-indicator-dot sms';
      this.elements.messageInput.placeholder = 'Text Message';
      this.elements.btnSendMessage.classList.add('sms');
    } else {
      this.currentMessageType = 'imessage';
      this.elements.msgTypeLabel.textContent = 'iMessage';
      const dot = this.elements.btnToggleMsgType.querySelector('.type-indicator-dot');
      dot.className = 'type-indicator-dot imessage';
      this.elements.messageInput.placeholder = 'iMessage';
      this.elements.btnSendMessage.classList.remove('sms');
    }
  }

  toggleSound() {
    soundEngine.enabled = !soundEngine.enabled;
    if (soundEngine.enabled) {
      this.elements.btnSoundToggle.classList.add('active');
      this.elements.soundIconOn.style.display = 'block';
      this.elements.soundIconOff.style.display = 'none';
      soundEngine.playTapbackPop();
    } else {
      this.elements.btnSoundToggle.classList.remove('active');
      this.elements.soundIconOn.style.display = 'none';
      this.elements.soundIconOff.style.display = 'block';
    }
  }

  toggleTheme() {
    if (this.elements.body.classList.contains('dark-mode')) {
      this.elements.body.classList.remove('dark-mode');
      this.elements.body.classList.add('light-mode');
      this.elements.themeIconDark.style.display = 'none';
      this.elements.themeIconLight.style.display = 'block';
    } else {
      this.elements.body.classList.remove('light-mode');
      this.elements.body.classList.add('dark-mode');
      this.elements.themeIconDark.style.display = 'block';
      this.elements.themeIconLight.style.display = 'none';
    }
  }

  toggleDetailsPanel(forceState) {
    const isShowing = this.elements.detailsPanel.style.display !== 'none';
    const newState = forceState !== undefined ? forceState : !isShowing;
    this.elements.detailsPanel.style.display = newState ? 'flex' : 'none';
  }

  // --------------------------------------------------------------------------
  // SIDEBAR RENDERING
  // --------------------------------------------------------------------------
  renderSidebar() {
    this.renderPinnedSection();
    this.renderConversationsList();
  }

  renderPinnedSection() {
    const pinned = this.conversations.filter(c => c.isPinned);
    this.elements.pinnedSection.innerHTML = '';

    pinned.forEach(convo => {
      const item = document.createElement('div');
      item.className = `pinned-item ${convo.id === this.activeConvoId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="pinned-avatar-wrap">
          ${convo.unreadCount > 0 ? '<div class="pinned-unread-dot"></div>' : ''}
          ${convo.pinnedPreview ? `<div class="pinned-bubble-preview">${convo.pinnedPreview}</div>` : ''}
          <img src="${convo.avatar}" alt="${convo.name}" class="pinned-avatar">
        </div>
        <span class="pinned-name">${convo.name.split(' ')[0]}</span>
      `;
      item.addEventListener('click', () => this.switchConversation(convo.id));
      this.elements.pinnedSection.appendChild(item);
    });
  }

  renderConversationsList(filterQuery = '') {
    this.elements.conversationsList.innerHTML = '';

    const list = this.conversations.filter(c => {
      if (!filterQuery) return true;
      const matchName = c.name.toLowerCase().includes(filterQuery);
      const matchMsg = c.messages.some(m => m.text && m.text.toLowerCase().includes(filterQuery));
      return matchName || matchMsg;
    });

    list.forEach(convo => {
      const lastMsg = convo.messages[convo.messages.length - 1];
      let snippet = 'No messages yet';
      if (lastMsg) {
        if (lastMsg.type === 'text') snippet = lastMsg.text;
        else if (lastMsg.type === 'image') snippet = '📷 Photo';
        else if (lastMsg.type === 'audio') snippet = '🎙️ Voice Memo (0:14)';
        else if (lastMsg.type === 'cash') snippet = `Cash: $${lastMsg.amount}.00`;
      }

      const item = document.createElement('div');
      item.className = `convo-item ${convo.id === this.activeConvoId ? 'active' : ''} ${convo.unreadCount > 0 ? 'unread' : ''}`;
      item.setAttribute('data-id', convo.id);

      let avatarHtml = `<img src="${convo.avatar}" alt="${convo.name}" class="convo-avatar">`;
      if (convo.isGroup && convo.groupAvatars) {
        avatarHtml = `
          <div class="group-avatar-double">
            <img src="${convo.groupAvatars[0]}" alt="member">
            <img src="${convo.groupAvatars[1]}" alt="member">
          </div>
        `;
      }

      item.innerHTML = `
        <div class="convo-unread-indicator"></div>
        <div class="convo-avatar-wrap">
          ${avatarHtml}
        </div>
        <div class="convo-details">
          <div class="convo-top-line">
            <span class="convo-name">${convo.name}</span>
            <span class="convo-time">${convo.lastTime}</span>
          </div>
          <div class="convo-bottom-line">
            <span class="convo-snippet">${snippet}</span>
          </div>
        </div>
      `;

      item.addEventListener('click', () => this.switchConversation(convo.id));
      this.elements.conversationsList.appendChild(item);
    });
  }

  filterConversations(query) {
    this.renderConversationsList(query);
  }

  switchConversation(convoId) {
    this.activeConvoId = convoId;
    const convo = this.conversations.find(c => c.id === convoId);
    if (!convo) return;

    convo.unreadCount = 0;
    this.renderSidebar();
    this.renderActiveConversation();

    // In mobile mode, slide to chat
    this.elements.messagesBody.classList.add('showing-chat');
  }

  // --------------------------------------------------------------------------
  // ACTIVE CHAT RENDERING
  // --------------------------------------------------------------------------
  renderActiveConversation() {
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    // Header info
    this.elements.activeContactAvatar.src = convo.avatar;
    this.elements.activeContactName.textContent = convo.name;
    this.elements.activeContactSubtitle.textContent = convo.isSMS ? 'SMS • Text Message' : 'iMessage';
    this.elements.activePresenceDot.style.display = convo.isOnline ? 'block' : 'none';

    // Details panel info
    this.elements.detailsAvatar.src = convo.avatar;
    this.elements.detailsName.textContent = convo.name;
    this.elements.detailsPhone.textContent = convo.phone;

    // Dynamic Island expanded avatar & name
    const islandAvatar = document.querySelector('.island-avatar');
    if (islandAvatar) islandAvatar.src = convo.avatar;
    const islandName = document.querySelector('.island-name');
    if (islandName) islandName.textContent = convo.name;

    // Render messages
    this.elements.messageStream.innerHTML = '';

    // Date separator pill
    const dateDiv = document.createElement('div');
    dateDiv.className = 'date-separator';
    dateDiv.textContent = `Today ${convo.lastTime || '9:41 AM'}`;
    this.elements.messageStream.appendChild(dateDiv);

    convo.messages.forEach((msg, index) => {
      const isNextSameSender = index < convo.messages.length - 1 && convo.messages[index + 1].sender === msg.sender;
      const isLastInGroup = !isNextSameSender;
      const msgNode = this.createMessageNode(msg, isLastInGroup, convo);
      this.elements.messageStream.appendChild(msgNode);
    });

    this.scrollToBottom();
  }

  createMessageNode(msg, isLastInGroup, convo) {
    const isSent = msg.sender === 'me';
    const row = document.createElement('div');
    row.className = `message-row ${isSent ? 'sent' : 'received'} ${isLastInGroup ? 'last-in-group' : ''}`;
    row.setAttribute('data-msg-id', msg.id);

    // Group sender name if group chat and received
    if (convo.isGroup && !isSent && msg.sender !== 'me') {
      const senderLabel = document.createElement('div');
      senderLabel.className = 'sender-name-label';
      senderLabel.textContent = msg.sender;
      row.appendChild(senderLabel);
    }

    const rowInner = document.createElement('div');
    rowInner.className = 'message-row-inner';

    // Bubble construction
    const bubble = document.createElement('div');
    const bubbleType = isSent ? (msg.isSMS || this.currentMessageType === 'sms' ? 'sms' : 'imessage') : '';
    bubble.className = `bubble ${bubbleType}`;

    // Apply special bubble effects if present
    if (msg.effect === 'slam') bubble.classList.add('effect-slam');
    if (msg.effect === 'loud') bubble.classList.add('effect-loud');
    if (msg.effect === 'gentle') bubble.classList.add('effect-gentle');

    // Rich Content rendering
    if (msg.type === 'text') {
      if (msg.effect === 'invisible_ink') {
        bubble.innerHTML = `
          <div class="invisible-ink-wrap">
            <span class="invisible-text">${msg.text}</span>
            <canvas class="invisible-ink-canvas"></canvas>
          </div>
        `;
        setTimeout(() => this.initInvisibleInkCanvas(bubble.querySelector('.invisible-ink-canvas')), 50);
      } else {
        bubble.textContent = msg.text;
      }
    } else if (msg.type === 'image') {
      bubble.classList.add('media-photo');
      bubble.innerHTML = `<img src="${msg.mediaUrl}" alt="Photo" class="chat-image">`;
      bubble.querySelector('img').addEventListener('click', () => {
        this.elements.quickLookImg.src = msg.mediaUrl;
        this.elements.quickLookModal.style.display = 'flex';
      });
    } else if (msg.type === 'audio') {
      bubble.innerHTML = this.renderAudioMemoCard(msg.id, msg.duration);
      setTimeout(() => this.bindAudioMemo(bubble, msg.id, msg.duration), 20);
    } else if (msg.type === 'cash') {
      bubble.classList.add('media-cash');
      bubble.innerHTML = `
        <div class="apple-cash-card-chat">
          <div class="cash-top-row">
            <span class="cash-card-logo">Pay Cash</span>
            <span class="cash-status-tag">✓ Completed</span>
          </div>
          <div class="cash-amount-big">$${msg.amount}.00</div>
          <div class="cash-note-text">${msg.memo || 'Apple Cash'}</div>
          <button class="cash-card-action-btn">Request / Send Again</button>
        </div>
      `;
    }

    // Affixed sticker if exists
    if (msg.sticker) {
      const stickerSpan = document.createElement('span');
      stickerSpan.className = 'sticker-affixed';
      stickerSpan.textContent = msg.sticker;
      bubble.appendChild(stickerSpan);
    }

    // Tapback badge group if reactions exist
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      const badgeGroup = document.createElement('div');
      badgeGroup.className = 'tapback-badge-group';
      for (const [reaction, count] of Object.entries(msg.reactions)) {
        const badge = document.createElement('div');
        badge.className = 'tapback-badge';
        const emojiMap = { love: '❤️', like: '👍', dislike: '👎', haha: '😂', exclamation: '‼️', question: '❓' };
        badge.innerHTML = `${emojiMap[reaction]} ${count > 1 ? count : ''}`;
        badgeGroup.appendChild(badge);
      }
      rowInner.appendChild(badgeGroup);
    }

    // Tapback listener (double click or long hover)
    bubble.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.openTapback(bubble, msg.id);
    });

    rowInner.appendChild(bubble);

    // Slide-out timestamp on hover
    const timeSlide = document.createElement('span');
    timeSlide.className = 'message-timestamp-slide';
    timeSlide.textContent = msg.time;
    rowInner.appendChild(timeSlide);

    row.appendChild(rowInner);

    // Delivered / Read status beneath last sent message
    if (isSent && isLastInGroup && msg.status) {
      const statusDiv = document.createElement('div');
      statusDiv.className = 'message-status';
      statusDiv.textContent = msg.status;
      row.appendChild(statusDiv);
    }

    return row;
  }

  // --------------------------------------------------------------------------
  // AUDIO MEMO WAVEFORM CARD
  // --------------------------------------------------------------------------
  renderAudioMemoCard(id, duration) {
    const waveHeights = [8, 14, 22, 10, 18, 24, 16, 20, 12, 18, 26, 14, 8, 18, 22, 10, 16, 20, 12];
    const barsHtml = waveHeights.map(h => `<div class="wave-bar" style="height:${h}px"></div>`).join('');

    return `
      <div class="audio-memo-card" id="audioMemo_${id}">
        <button class="audio-play-btn" id="playBtn_${id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <div class="audio-wave-container">
          ${barsHtml}
        </div>
        <div class="audio-meta">
          <span class="audio-duration" id="dur_${id}">0:${duration < 10 ? '0' + duration : duration}</span>
          <button class="audio-speed-btn">1x</button>
        </div>
      </div>
    `;
  }

  bindAudioMemo(container, id, totalDuration) {
    const playBtn = container.querySelector(`#playBtn_${id}`);
    const durLabel = container.querySelector(`#dur_${id}`);
    const bars = container.querySelectorAll('.wave-bar');
    let isPlaying = false;
    let timer = null;
    let currentSec = 0;

    if (!playBtn) return;

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPlaying = !isPlaying;

      if (isPlaying) {
        soundEngine.init();
        playBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        `;

        timer = setInterval(() => {
          currentSec++;
          const remaining = Math.max(0, totalDuration - currentSec);
          durLabel.textContent = `0:${remaining < 10 ? '0' + remaining : remaining}`;

          // Animate played wave bars
          const progressIndex = Math.floor((currentSec / totalDuration) * bars.length);
          bars.forEach((bar, idx) => {
            if (idx <= progressIndex) bar.classList.add('played');
          });

          // Synthesize audio tone
          soundEngine.playVoiceMemoBeep(220 + (currentSec % 5) * 40, 0.15);

          if (currentSec >= totalDuration) {
            clearInterval(timer);
            isPlaying = false;
            currentSec = 0;
            durLabel.textContent = `0:${totalDuration < 10 ? '0' + totalDuration : totalDuration}`;
            bars.forEach(b => b.classList.remove('played'));
            playBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            `;
          }
        }, 1000);
      } else {
        clearInterval(timer);
        playBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        `;
      }
    });
  }

  // --------------------------------------------------------------------------
  // INVISIBLE INK EFFECT CANVAS
  // --------------------------------------------------------------------------
  initInvisibleInkCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Draw shimmering particles
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#007AFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawParticles();

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    canvas.addEventListener('mouseleave', () => {
      setTimeout(() => drawParticles(), 1800);
    });
  }

  // --------------------------------------------------------------------------
  // INPUT & MESSAGING FLOW
  // --------------------------------------------------------------------------
  handleInputChange() {
    const val = this.elements.messageInput.value.trim();
    // Auto resize
    this.elements.messageInput.style.height = 'auto';
    this.elements.messageInput.style.height = `${this.elements.messageInput.scrollHeight}px`;

    if (val.length > 0) {
      this.elements.btnMicAction.style.display = 'none';
      this.elements.btnSendMessage.style.display = 'flex';
    } else {
      this.elements.btnMicAction.style.display = 'flex';
      this.elements.btnSendMessage.style.display = 'none';
    }
  }

  sendMessage(effect = null) {
    const text = this.elements.messageInput.value.trim();
    if (!text) return;

    this.sendTextMessage(text, effect);
    this.elements.messageInput.value = '';
    this.elements.messageInput.style.height = 'auto';
    this.handleInputChange();
  }

  sendTextMessage(text, effect = null) {
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: 'text',
      text: text,
      time: 'Just now',
      status: 'Delivered',
      effect: effect,
      isSMS: this.currentMessageType === 'sms'
    };

    convo.messages.push(newMsg);
    convo.lastTime = 'Just now';

    // Play iconic Apple Swoosh sound
    soundEngine.playSendSwoosh();

    // Trigger full screen effect if selected
    if (effect && ['confetti', 'balloons', 'lasers', 'fireworks', 'love'].includes(effect)) {
      this.effectsEngine.trigger(effect);
    }

    this.renderActiveConversation();
    this.renderSidebar();

    // Simulate contact typing & response
    this.simulateIncomingResponse(convo, text);
  }

  sendCashMessage(amount, memo) {
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: 'cash',
      amount: amount,
      memo: memo,
      time: 'Just now',
      status: 'Completed'
    };

    convo.messages.push(newMsg);
    convo.lastTime = 'Just now';
    soundEngine.playSendSwoosh();
    this.renderActiveConversation();
    this.renderSidebar();

    this.simulateIncomingResponse(convo, `Sent $${amount}.00 via Apple Cash`);
  }

  recordVoiceMemoDemo() {
    soundEngine.init();
    soundEngine.playVoiceMemoBeep(440, 0.2);

    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: 'audio',
      duration: 8,
      time: 'Just now',
      status: 'Delivered'
    };

    convo.messages.push(newMsg);
    convo.lastTime = 'Just now';
    soundEngine.playSendSwoosh();
    this.renderActiveConversation();
    this.renderSidebar();

    this.simulateIncomingResponse(convo, 'Voice Memo');
  }

  // --------------------------------------------------------------------------
  // SIMULATED TYPING & RECIPIENT REPLIES
  // --------------------------------------------------------------------------
  simulateIncomingResponse(convo, userText) {
    // 1. Update status to "Read" after 1.2s
    setTimeout(() => {
      const lastMsg = convo.messages[convo.messages.length - 1];
      if (lastMsg && lastMsg.sender === 'me') {
        lastMsg.status = 'Read Just now';
        this.renderActiveConversation();
      }
    }, 1200);

    // 2. Show 3-dot typing indicator bubble after 1.8s
    setTimeout(() => {
      this.showTypingIndicator();
      if (this.elements.dynamicIsland) {
        this.elements.dynamicIsland.classList.add('expanded');
      }
    }, 1800);

    // 3. Receive message reply after 3.8s
    setTimeout(() => {
      this.hideTypingIndicator();
      if (this.elements.dynamicIsland) {
        this.elements.dynamicIsland.classList.remove('expanded');
      }

      let replyText = "Sounds good! Can't wait 🙌";
      if (convo.id === 'tim') {
        replyText = "We are deeply committed to making the best products for our users. Have a great day!";
      } else if (convo.id === 'alex') {
        replyText = "I'll grab us a table outside! Bring your camera 📸";
      } else if (convo.id === 'sarah') {
        if (userText.toLowerCase().includes('coffee') || userText.toLowerCase().includes('cash')) {
          replyText = "Thanks for sending that over! I'll order our drinks ahead on the app ☕";
        } else {
          replyText = "Awesome! Let's hit the trail early before it gets too sunny ☀️🌲";
        }
      }

      const incomingMsg = {
        id: 'm_' + Date.now(),
        sender: convo.id,
        type: 'text',
        text: replyText,
        time: 'Just now'
      };

      convo.messages.push(incomingMsg);
      convo.lastTime = 'Just now';

      // Play authentic Apple Note/Ding sound
      soundEngine.playReceivedChime();

      this.renderActiveConversation();
      this.renderSidebar();
    }, 3800);
  }

  showTypingIndicator() {
    this.hideTypingIndicator();
    const typingBubble = document.createElement('div');
    typingBubble.className = 'typing-bubble';
    typingBubble.id = 'activeTypingIndicator';
    typingBubble.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    this.elements.messageStream.appendChild(typingBubble);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const el = document.getElementById('activeTypingIndicator');
    if (el) el.remove();
  }

  scrollToBottom() {
    this.elements.messageStreamContainer.scrollTop = this.elements.messageStreamContainer.scrollHeight;
  }

  // --------------------------------------------------------------------------
  // TAPBACK REACTION POPUP
  // --------------------------------------------------------------------------
  openTapback(bubbleEl, msgId) {
    this.activeTapbackTarget = msgId;
    const rect = bubbleEl.getBoundingClientRect();
    const popup = this.elements.tapbackPopup;

    popup.style.display = 'block';
    popup.style.top = `${rect.top}px`;
    popup.style.left = `${rect.left + rect.width / 2}px`;

    soundEngine.playTapbackPop();
  }

  closeTapback() {
    this.elements.tapbackPopup.style.display = 'none';
    this.activeTapbackTarget = null;
  }

  applyReaction(reactionType) {
    if (!this.activeTapbackTarget) return;
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    const msg = convo.messages.find(m => m.id === this.activeTapbackTarget);
    if (msg) {
      if (!msg.reactions) msg.reactions = {};
      msg.reactions[reactionType] = (msg.reactions[reactionType] || 0) + 1;
      soundEngine.playTapbackPop();
      this.renderActiveConversation();
    }

    this.closeTapback();
  }

  // --------------------------------------------------------------------------
  // APPS DRAWER & SPECIAL ACTIONS
  // --------------------------------------------------------------------------
  toggleAppsDrawer() {
    const isShowing = this.elements.appsDrawer.style.display !== 'none';
    if (isShowing) {
      this.closeAppsDrawer();
    } else {
      this.elements.appsDrawer.style.display = 'block';
      this.elements.btnToggleApps.classList.add('open');
    }
  }

  closeAppsDrawer() {
    this.elements.appsDrawer.style.display = 'none';
    this.elements.btnToggleApps.classList.remove('open');
  }

  handleAppDrawerAction(action) {
    this.closeAppsDrawer();

    if (action === 'camera' || action === 'photos') {
      const convo = this.conversations.find(c => c.id === this.activeConvoId);
      if (!convo) return;
      const photoMsg = {
        id: 'm_' + Date.now(),
        sender: 'me',
        type: 'image',
        mediaUrl: './assets/coffee.jpg',
        time: 'Just now',
        status: 'Delivered'
      };
      convo.messages.push(photoMsg);
      soundEngine.playSendSwoosh();
      this.renderActiveConversation();
      this.simulateIncomingResponse(convo, 'Photo');
    } else if (action === 'cash') {
      this.elements.appleCashModal.style.display = 'flex';
    } else if (action === 'audio') {
      this.recordVoiceMemoDemo();
    } else if (action === 'stickers') {
      this.elements.stickersDrawer.style.display = 'block';
    } else if (action === 'effects') {
      this.openEffectPicker();
    } else if (action === 'location') {
      this.sendLocationCard();
    }
  }

  sendLocationCard() {
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo) return;

    const locMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      type: 'text',
      text: '📍 Apple Park • 1 Apple Park Way, Cupertino, CA',
      time: 'Just now',
      status: 'Delivered'
    };
    convo.messages.push(locMsg);
    soundEngine.playSendSwoosh();
    this.renderActiveConversation();
    this.simulateIncomingResponse(convo, 'Location');
  }

  affixStickerToLastBubble(emoji) {
    const convo = this.conversations.find(c => c.id === this.activeConvoId);
    if (!convo || convo.messages.length === 0) return;

    const lastMsg = convo.messages[convo.messages.length - 1];
    lastMsg.sticker = emoji;
    soundEngine.playTapbackPop();
    this.renderActiveConversation();
  }

  openEffectPicker() {
    this.elements.effectPickerModal.style.display = 'flex';
  }

  closeEffectPicker() {
    this.elements.effectPickerModal.style.display = 'none';
  }

  simulateFaceTime(type) {
    soundEngine.playTapbackPop();
    const name = this.elements.activeContactName.textContent;
    alert(`Connecting FaceTime ${type === 'video' ? 'Video' : 'Audio'} with ${name}...`);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.appleMessagesApp = new AppleMessagesApp();
});
