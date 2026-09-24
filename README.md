# Apple Messages (iMessage) Web Experience

A 1:1 pixel-perfect recreation of the Apple Messages (iMessage) user interface and user experience for macOS Sequoia and iOS 18.

## 📱 Features

- **Dual Device Viewports:**
  - **macOS Sequoia Window View:** Translucent glass navigation bar, traffic lights (close, minimize, zoom), 3-pane layout, and collapsible conversations drawer.
  - **iPhone 16 Pro View:** Titanium bezel frame, functioning **Dynamic Island** with live status indicator, native iOS 18 status bar, and home indicator.
- **1:1 Bubble Geometry & Tails:**
  - Authentic iMessage Blue (`#0A84FF` to `#007AFF`) and SMS Green gradients.
  - Pixel-perfect curved tails on the terminal bubble in consecutive message clusters.
  - Delivery status and hover-to-slide timestamps.
- **Tapback Reactions System:**
  - Double-click or hover-trigger on message bubbles: ❤️ Love, 👍 Like, 👎 Dislike, HAHA, !!, ?.
  - Corner-anchored reaction badge with spring physics and sound effect.
- **Full-Screen Canvas & Bubble Effects Engine:**
  - Screen effects: 60fps particle physics simulation for **Confetti**, **Balloons**, **Lasers**, **Fireworks**, and **Love**.
  - Bubble effects: **Slam**, **Loud**, **Gentle**, and **Invisible Ink** (scratch/hover to reveal secret text).
- **iOS 17/18 Floating App Drawer (`+` Button):**
  - **Photos & Camera:** QuickLook tap-to-zoom photo preview.
  - **Apple Cash (Pay Cash):** Send and request money card modal with custom amount chips.
  - **Audio Voice Memos:** Waveform visualization, play/pause controls, countdown timer, and speed selector.
  - **Stickers & Memojis:** Peel and affix stickers directly to messages.
  - **Location:** Apple Park Cupertino location card.
- **Audio Synthesis Engine (Web Audio API):**
  - Pristine synthesized Apple iMessage **Swoosh** sent sound, **Note** chime received sound, and tapback pop. Zero external asset dependencies.
- **Live AI / Simulated Contacts:**
  - Pre-loaded interactive contacts (Sarah Jenkins, Tim Cook, Alex Chen, Dev Team, Luigi's Pizza).
  - 3-dot bouncing typing indicator and automated contextual replies.

## 🚀 Quick Start

Open `index.html` directly in any modern browser:
```bash
# Double click index.html or open via terminal:
start index.html
```
