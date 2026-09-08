# NEXA Tools Pro 🚀

<div align="center">
  
![Version](https://img.shields.io/badge/version-9.5.0-black?style=for-the-badge)
![Manifest](https://img.shields.io/badge/manifest-v3-black?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-black?style=for-the-badge&logo=googlechrome)
![Offline](https://img.shields.io/badge/100%25-Offline_Ready-black?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-black?style=for-the-badge)

**The ultimate high-performance browser toolkit, extreme audio booster, and social automation suite for Google Chrome.**  
Equipped with GitHub & TikTok Auto Follow/Unfollow with **Instant Rate-Limit Auto-Stop Shield**, **600% Extreme Wall-Shaking Audio Boost**, Element Zapper (Anti-Paywall & Overlay Remover), Auto-Refresh Tab Reloader, Link Extractor, Full Page & Area Screenshots, Screen Recording, Universal Image Converter, Media Downloader, and Offline QR Studio.

[Installation](#-installation-guide) • [Features](#-features-breakdown) • [Social Automation](#-social-automation-with-auto-limit-stop) • [Extreme Audio Boost](#-600-extreme-audio-boost) • [Architecture](#-project-structure)


---

</div>

## ✨ Highlights at a Glance

- 🛡️ **Social Automation with Auto-Limit Stop**:
  - **GitHub Auto Follow & Unfollow**: Follows followers or mass-unfollows with multi-page pagination. Automatically halts execution the second GitHub hits a rate limit or restrictions banner!
  - **TikTok Auto Follow & Unfollow**: Follows/unfollows with auto infinite scroll and auto-confirms modals. Instantly halts if TikTok displays "following too fast" or frequency limits!
- 🔊 **600% Extreme Audio Boost (Wall-Shaking Loudness)**:
  - Advanced Web Audio DSP mastering chain: sub-bass low-shelf punch, vocal presence clarity EQ, dual dynamic compression stages, hyperbolic tangent (`tanh`) soft-saturation waveshaping, and brickwall peak limiting.
  - Pushes speakers and headphones to maximum acoustic volume without digital silence clipping!
- 🧼 **Element Zapper & Paywall Remover**:
  - Click-to-delete inspection tool to eliminate annoying subscription gates, paywall backdrops, blur filters, and sticky ad banners. Automatically restores page scrolling!
- 🔄 **Auto-Refresh Tab Reloader**:
  - Set custom intervals (5s, 15s, 30s, 60s) with live countdown timer. Ideal for monitoring live sales, auctions, and ticket queues.
- 🔇 **1-Click Tab Mute**:
  - Instant audio toggle in the header to silence or restore any noisy tab.
- 🔗 **Extract All Page Links**:
  - 1-click scans, deduplicates, and copies or downloads all URLs on any webpage.
- 🔐 **Strong Password Generator**:
  - Cryptographically secure 16-character passwords with 1-click clipboard copying.
- 📸 **Advanced Screenshot Suite**:
  - Full Page scrolling stitched screenshot (rate-limit safe & canvas overflow protected), interactive Custom Area crop, and instant visible snapshots.
- 🎥 **HD Screen Video Recording**:
  - Record active tab, application window, or full desktop with system audio and microphone mixing.
- 🖼️ **Media & Icon Extractor with Full Lightbox**:
  - Large grid/list visual cards, transparent checkerboard background, full-screen image preview lightbox, and custom filename downloads.
- 🔄 **Universal Image Converter (Offline)**:
  - Convert between `WEBP`, `PNG`, `JPG`, `ICO` (Windows Icon), and `SVG` formats with quality and resolution resizing presets.
- 📱 **QR Code Studio (Scanner & Generator)**:
  - Offline QR generator plus multi-mode scanner (Active Webpage scan, Camera viewfinder, Drag & Drop file, and `Ctrl+V` clipboard paste).

---

## 🛡️ Social Automation with Auto-Limit Stop

### 1. 🐱 GitHub Auto Follow & Unfollow
- **Auto Follow Mode**: Automatically follows all users on any GitHub followers page (`https://github.com/<username>?tab=followers`).
- **Auto Unfollow Mode**: Mass unfollows users from your following list (`https://github.com/<username>?tab=following`).
- **Auto Rate-Limit Detection & Halting**:
  - Continuously monitors GitHub flash alerts, error banners (`.flash-error`, `.js-flash-alert`, `[role="alert"]`), and button failure states.
  - If GitHub rate limits, abuse restrictions, or action blocks are detected, the bot **immediately halts automatically**, protects the user account, and alerts the user!
- **Multi-Page Auto Pagination**: Automatically clicks the "Next" button when current page accounts are finished.
- **GitHub Turbo/SPA Support**: Keeps working continuously across single-page transitions.
- **Speed Controls**: 🛡️ Safe (2.0s), 🚀 Fast (0.8s), and ⚡ Turbo (0.3s) + custom delay down to 0.1s.

### 2. 🎵 TikTok Auto Follow & Unfollow
- **Auto Follow Mode**: Follows accounts from profile followers/following popups, search queries, and comments.
- **Auto Unfollow Mode**: Unfollows accounts and auto-confirms TikTok's unfollow confirmation dialogs.
- **Auto "Following Too Fast" Limit Detection**:
  - Continuously scans for TikTok toast notices (`div[class*="Toast"]`, `[role="status"]`) and button reversion states.
  - If a frequency limit or "following too fast" warning appears, the bot **immediately auto-stops** to prevent account shadow-bans!
- **Infinite Auto-Scroll**: Detects when visible accounts are finished and smoothly scrolls the modal or window downward to dynamically load new accounts.
- **Custom Speeds**: 🛡️ Safe (2.0s), 🚀 Fast (0.8s), and ⚡ Turbo (0.4s) + custom delay down to 0.1s.

---

## 🔊 600% Extreme Audio Boost

Engineered to deliver maximum acoustic loudness across YouTube, Spotify Web, Netflix, and any HTML5 video or audio element:

1. **Sub-Bass Punch Filter**: Low-shelf filter at 130 Hz (+7dB) for heavy, physical low-end response.
2. **Vocal Presence Filter**: Peaking EQ at 2800 Hz (+5dB) for crystal clear speech projection through walls and background noise.
3. **Pre-Amp Gain Stage**: Clean multi-stage gain boosting up to 18x.
4. **Dual Dynamic Compressors**: High-ratio compression to bring quiet whispers and background details up to maximum loudness.
5. **Hyperbolic Tangent (`tanh`) Waveshaper**: Soft-saturates peaks so high volumes stay smooth without digital wrap-around distortion or audio cutouts.
6. **Brickwall Peak Limiter**: Prevents hardware distortion while keeping perceived volume at maximum level.

---

## 📂 Project Structure

```text
nexa_tools/
├── manifest.json         # Chrome Manifest V3 configuration
├── background.js         # Service worker (Area cropping & downloads)
├── popup.html            # Main popup & side panel UI (Home, Social, Capture, Media, Display, Dev, QR)
├── popup.css             # Monochrome dark responsive design
├── popup.js              # Complete frontend logic controller
├── content-github.js     # GitHub Auto Follow & Unfollow with Rate Limit Auto-Stop
├── content-tiktok.js     # TikTok Auto Follow & Unfollow with Limit Auto-Stop & Infinite Scroll
├── qrcode-local.js       # Standalone offline QR generator & pure JS decoder fallback
├── icons/                # Extension icons (16px, 32px, 48px, 128px)
└── README.md             # Complete markdown documentation
```

---

## 📥 Installation Guide

1. Download and extract **`nexa_tools_ultimate.zip`**.
2. Open Google Chrome (or Edge / Brave / Opera).
3. Type `chrome://extensions/` in the address bar.
4. Enable **Developer mode** toggle in the top-right corner.
5. Click the **Load unpacked** button in the top-left corner.
6. Select the extracted `nexa_tools` folder.
7. Pin **NEXA Tools Pro** in your Chrome toolbar for instant access!

---

## 🔒 Privacy & Security

- **100% Local Execution**: All processing, image conversions, QR decoding, and bots run entirely locally in your browser.
- **Zero Third-Party Servers**: No telemetry, tracking, or remote server requests.
- **Account Protection**: Built-in rate-limit detection guards your GitHub and TikTok accounts against spam bans.
