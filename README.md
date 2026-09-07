# NEXA Tools Pro 🚀

<div align="center">

![Version](https://img.shields.io/badge/version-9.0.0-black?style=for-the-badge)
![Manifest](https://img.shields.io/badge/manifest-v3-black?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension-black?style=for-the-badge&logo=googlechrome)
![Offline](https://img.shields.io/badge/100%25-Offline_Ready-black?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-black?style=for-the-badge)

**A high-performance all-in-one browser toolkit & social automation suite for Google Chrome.**  
Equipped with GitHub & TikTok Auto Follow/Unfollow, Full Page & Custom Area screenshots, screen video recording with audio, universal offline image format converter, webpage media & icon extractors with lightbox preview, offline QR code studio, 2000% audio boost, and developer utilities.

[Installation](#-installation-guide) • [Features](#-features-breakdown) • [Social Automation](#-social-automation-suite-github--tiktok) • [Architecture](#-project-structure)

---

</div>

## ✨ Highlights at a Glance

- 🤖 **Social Automation Suite**: Full Auto Follow & Mass Unfollow for both **GitHub** and **TikTok** with speed presets (Safe, Fast, Turbo), multi-page pagination, and infinite auto-scroll.
- 📸 **Advanced Screenshot Suite**: Full Page scrolling capture (rate-limit safe & memory protected), interactive Custom Area selection crop, and instant visible view snapshots.
- 🎥 **HD Screen Video Recording**: Record tab, window, or entire desktop screen with system audio and microphone mixing.
- 🖼️ **Media & Icon Extractor with Full Preview**: Large grid/list visual cards, transparent checkerboard background, full-screen image preview lightbox, and custom filename downloads.
- 🔄 **Universal Image Converter (Offline)**: Convert between `WEBP`, `PNG`, `JPG`, `ICO` (Windows Icon), and `SVG` formats with quality and resolution resizing presets.
- 📱 **QR Code Studio (Scanner & Generator)**: Offline QR generator plus multi-mode scanner (Active Webpage scan, Camera viewfinder, Drag & Drop file, and `Ctrl+V` clipboard paste).
- 🔊 **2000% Ultra Audio Boost**: Multi-stage Web Audio compressor and peak limiter for loud, distortion-free sound.
- 🌓 **Display & Accessibility**: Brightness controls, EyeDropper color tinting, and 1-click Smart Dark Mode.
- 🛠️ **Developer & Text Tools**: JSON formatter, Base64 encoder/decoder, URL decoder, Picture-in-Picture video, URL tracking cleaner, and page reading stats.
- 🗂️ **Side Panel & Popup Support**: Seamlessly switch between compact popup and persistent Chrome Side Panel.

---

## 🤖 Social Automation Suite (GitHub & TikTok)

### 1. 🐱 GitHub Auto Follow & Unfollow
- **Auto Follow Mode**: Automatically follows all users on any GitHub followers page (`https://github.com/<username>?tab=followers`).
- **Auto Unfollow Mode**: Mass unfollows users from your following list (`https://github.com/<username>?tab=following`).
- **Multi-Page Auto Pagination**: Seamlessly clicks the "Next" button when all accounts on the current page have been processed, continuing without interruption.
- **GitHub Turbo/SPA Support**: Keeps working continuously across single-page transitions without needing manual reloads.
- **Speed Controls**:
  - 🛡️ **Safe (2.0s)**: Best for large lists to prevent rate limits.
  - 🚀 **Fast (0.8s)**: Fast and balanced automation (Recommended).
  - ⚡ **Turbo (0.3s)**: Ultra-fast batch mode.
- **Floating On-Page Widget**: Bottom-right floating dark widget with live counters, mode switcher, and instant stop controls.

### 2. 🎵 TikTok Auto Follow & Unfollow
- **Auto Follow Mode**: Automatically follows accounts from profile followers/following popup dialogs, search lists, and comments.
- **Auto Unfollow Mode**: Unfollows accounts and automatically handles TikTok's confirmation modal dialog.
- **Infinite Auto-Scroll**: Detects when visible accounts are finished and smoothly scrolls the modal or window downward to dynamically load new accounts.
- **Custom Speeds**: 🛡️ Safe (2.0s), 🚀 Fast (0.8s), and ⚡ Turbo (0.4s) + custom delay down to 0.1s.

---

## 🔍 Other Core Features Breakdown

### 📸 Advanced Screenshot Suite
- **Full Page Scrolling Screenshot**: Automatically scrolls through the entire document height, capturing and stitching high-resolution slices with device pixel ratio scaling. Suppresses sticky headers and handles API rate limits with exponential backoff.
- **Custom Area Screenshot**: Injects an interactive selection crop overlay (`ESC` to cancel). Background service worker crops the selection and saves it directly to Downloads.
- **Visible View Screenshot**: 1-click instant viewport snapshot with copy to clipboard and download options.

### 🎥 Screen Video Recording (with Audio)
- **Multi-Source Video**: Record tab, application window, or full desktop.
- **Audio Mixing**: Record system/tab audio and optionally mix with microphone input.
- **Live Controls & Player**: Pulsing recording badge, duration timer, pause/resume, and instant in-browser WebM video playback.

### 🖼️ Web Page Media & Icon Extractor
- **Asset Extraction**: Extracts standard images, `srcset` responsive images, favicons, shortcut icons, background images, and inline SVGs.
- **Grid / List Mode & Full Preview**: Interactive lightbox modal to inspect full dimensions, copy, or send images directly to the converter.
- **Batch Download**: Custom filename prefix, download all, or download selected.

### 🔄 Universal Offline Image Converter
- **Supported Formats**: `WEBP` ↔ `PNG` ↔ `JPG` ↔ `ICO` ↔ `SVG`.
- **Windows Icon (.ICO) Builder**: Generates standard 22-byte header Windows icon files.
- **Resizing & Compression**: Preset resolutions (16x16 up to 512x512) and quality slider (10% to 100%).

### 📱 QR Code Studio (Generator & Scanner)
- **Offline QR Generator**: Creates high-resolution QR codes offline.
- **Multi-Mode Scanner**: Scans active webpage, webcam viewfinder, uploaded image files, or clipboard pasted images (`Ctrl+V`).

### 🔊 2000% Ultra Audio Boost & Display
- **2000% Audio Booster**: Multi-stage Web Audio compression pipeline with dual compressors, makeup gain, and peak limiter.
- **Display Brightness & Tinting**: 40% to 160% brightness and EyeDropper color tinting.
- **Smart Dark Mode**: Inverts page brightness while preserving images and videos.

### 🛠️ Developer & Productivity Tools
- **JSON Formatter**: Pretty-print and format JSON strings.
- **Base64 & URL Tools**: Encode/decode Base64 and URL encoding.
- **Picture-in-Picture (PiP)**: Pop out HTML5 videos into a floating window.
- **Clean URL & Duplicate Tabs**: Strip tracking parameters (`utm_*`, `gclid`, etc.) and close duplicate tabs.

---

## 📂 Project Structure

```text
nexa_tools/
├── manifest.json         # Chrome Manifest V3 configuration
├── background.js         # Service worker (Area cropping & downloads)
├── popup.html            # Main popup & side panel UI (Home, Social, Capture, Media, Display, Dev, QR)
├── popup.css             # Monochrome dark responsive design
├── popup.js              # Core UI frontend controller
├── content-github.js     # GitHub Auto Follow & Unfollow bot
├── content-tiktok.js     # TikTok Auto Follow & Unfollow bot
├── qrcode-local.js       # Offline QR generator & pure JS decoder
├── icons/                # Extension icons (16px, 32px, 48px, 128px)
└── README.md             # Complete documentation
```

---

## 📥 Installation Guide

1. Download and extract **`nexa_tools_pro.zip`**.
2. Open Google Chrome (or Edge / Brave / Opera).
3. Type `chrome://extensions/` in the URL address bar.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click the **Load unpacked** button in the top-left.
6. Select the extracted `nexa_tools` folder.
7. Click the Puzzle icon in Chrome's toolbar and pin **NEXA Tools Pro** for quick access.

---

## 🔒 Privacy & Security

- **100% Local Execution**: All tools, conversions, QR processing, and automation run entirely inside your browser.
- **No External Servers**: Zero network calls to third-party tracking servers.
- **Safe Automation**: All bots feature humanized delays to protect account integrity.
