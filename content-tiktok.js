/**
 * NEXA Tools Pro - TikTok Automation Module
 * Handles Auto Follow & Auto Unfollow with Accurate Limit Detection (No False Positives),
 * Infinite Scroll, and Speed Controls.
 */

(function () {
  let isRunning = false;
  let currentMode = "follow"; // "follow" or "unfollow"

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
    );
  }

  // Detect genuine TikTok Rate Limit / Action Block (Toast alerts)
  function checkGenuineTikTokLimit() {
    const toasts = document.querySelectorAll('div[class*="Toast"], div[role="status"], div[class*="DivToastContainer"], div[class*="Notification"]');
    for (const t of toasts) {
      if (!isElementVisible(t)) continue;
      const text = (t.innerText || t.textContent || "").toLowerCase();
      if (
        text.includes("following too fast") ||
        text.includes("reached the daily limit") ||
        text.includes("action blocked") ||
        text.includes("too many attempts") ||
        text.includes("frequency limit")
      ) {
        return text.slice(0, 70);
      }
    }
    return null;
  }

  function getScrollContainer() {
    const modalContainers = document.querySelectorAll('div[role="dialog"] div, div[class*="DivUserListContainer"], div[class*="DivModalContainer"]');
    for (const c of modalContainers) {
      const style = window.getComputedStyle(c);
      if ((style.overflowY === "auto" || style.overflowY === "scroll") && c.scrollHeight > c.clientHeight) {
        return c;
      }
    }
    const dialog = document.querySelector('div[role="dialog"]');
    if (dialog && dialog.scrollHeight > dialog.clientHeight) {
      return dialog;
    }
    return window;
  }

  function getTargetButtons(mode) {
    const list = [];
    const allButtons = document.querySelectorAll('button, div[role="button"]');

    allButtons.forEach((btn) => {
      if (!isElementVisible(btn)) return;

      const text = (btn.innerText || btn.textContent || "").trim().toLowerCase();

      if (mode === "follow") {
        const isFollow = text === "follow" || text === "follow back" || text === "+ follow";
        const notFollowing = !text.includes("following") && !text.includes("friends") && !text.includes("requested") && !text.includes("message");
        if (isFollow && notFollowing) {
          list.push(btn);
        }
      } else {
        const isFollowing = text === "following" || text === "friends";
        if (isFollowing) {
          list.push(btn);
        }
      }
    });

    return list;
  }

  async function handleUnfollowConfirmModal() {
    await new Promise((r) => setTimeout(r, 350));
    const confirmButtons = document.querySelectorAll('div[role="dialog"] button, div[class*="Modal"] button');
    for (const b of confirmButtons) {
      const txt = (b.innerText || b.textContent || "").trim().toLowerCase();
      if (txt === "unfollow" || txt === "yes" || txt === "confirm") {
        b.click();
        await new Promise((r) => setTimeout(r, 250));
        break;
      }
    }
  }

  function injectTikTokWidget() {
    if (document.getElementById("tt-sab-widget")) return;

    currentMode = sessionStorage.getItem("tt_sab_mode") || "follow";

    const widget = document.createElement("div");
    widget.id = "tt-sab-widget";
    widget.innerHTML = `
      <div id="tt-sab-card" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #121212;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 12px;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.9);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: 290px;
        padding: 14px 16px;
        font-size: 12px;
        box-sizing: border-box;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 15px;">🎵</span>
            <strong style="font-size: 13px; color: #fe2c55; letter-spacing: 0.2px;">TikTok Auto Bot Pro</strong>
          </div>
          <button id="tt-sab-min" style="background: none; border: none; color: #888888; cursor: pointer; font-size: 14px; padding: 2px;">—</button>
        </div>

        <div id="tt-sab-body">
          <!-- Follow / Unfollow Mode Switcher -->
          <div style="display: flex; gap: 5px; margin-bottom: 10px;">
            <button id="tt-sab-mode-follow" style="
              flex: 1;
              padding: 6px 4px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid ${currentMode === "follow" ? "#25f4ee" : "#2f2f2f"};
              background: ${currentMode === "follow" ? "#25f4ee" : "#1e1e1e"};
              color: ${currentMode === "follow" ? "#000000" : "#ffffff"};
            ">➕ Auto Follow</button>

            <button id="tt-sab-mode-unfollow" style="
              flex: 1;
              padding: 6px 4px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid ${currentMode === "unfollow" ? "#fe2c55" : "#2f2f2f"};
              background: ${currentMode === "unfollow" ? "#fe2c55" : "#1e1e1e"};
              color: #ffffff;
            ">➖ Auto Unfollow</button>
          </div>

          <!-- Status & Counter Card -->
          <div style="background: #181818; padding: 8px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #888888;">Status:</span>
              <span id="tt-sab-status" style="font-weight: 600; color: #25f4ee;">Ready</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #888888;">Processed:</span>
              <span id="tt-sab-count" style="font-weight: 600; color: #25f4ee;">0</span>
            </div>
          </div>

          <!-- Speed Presets -->
          <div style="margin-bottom: 10px;">
            <div style="color: #888888; margin-bottom: 4px; font-size: 11px;">Speed Presets:</div>
            <div style="display: flex; gap: 4px;">
              <button class="tt-sab-speed" data-speed="2.0" style="flex:1; padding: 4px 2px; font-size: 11px; background: #222222; border: 1px solid #333333; color: #cccccc; border-radius: 4px; cursor: pointer;">🛡️ Safe (2s)</button>
              <button class="tt-sab-speed" data-speed="0.8" style="flex:1; padding: 4px 2px; font-size: 11px; background: #fe2c55; border: 1px solid #fe2c55; color: #ffffff; border-radius: 4px; cursor: pointer;">🚀 Fast (0.8s)</button>
              <button class="tt-sab-speed" data-speed="0.4" style="flex:1; padding: 4px 2px; font-size: 11px; background: #222222; border: 1px solid #333333; color: #cccccc; border-radius: 4px; cursor: pointer;">⚡ Turbo (0.4s)</button>
            </div>
          </div>

          <!-- Custom Delay & Checkboxes -->
          <div style="margin-bottom: 8px;">
            <label style="display: flex; justify-content: space-between; align-items: center; color: #cccccc;">
              <span>Delay (Seconds):</span>
              <input type="number" id="tt-sab-delay" value="0.8" min="0.1" max="10" step="0.1" style="
                width: 65px;
                padding: 4px 6px;
                background: #000000;
                border: 1px solid #333333;
                border-radius: 4px;
                color: #ffffff;
                font-size: 12px;
                text-align: center;
              " />
            </label>
          </div>

          <div style="margin-bottom: 6px;">
            <label style="display: flex; align-items: center; gap: 6px; color: #cccccc; cursor: pointer;">
              <input type="checkbox" id="tt-sab-autoscroll" checked style="cursor: pointer; accent-color: #fe2c55;" />
              <span>Auto-scroll to load more users</span>
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; color: #cccccc; cursor: pointer;">
              <input type="checkbox" id="tt-sab-limit-guard" checked style="cursor: pointer; accent-color: #fe2c55;" />
              <span>Auto-stop on real rate limit</span>
            </label>
          </div>

          <!-- Start / Stop Controls -->
          <div style="display: flex; gap: 8px;">
            <button id="tt-sab-start" style="
              flex: 1;
              padding: 8px 12px;
              background: ${currentMode === "follow" ? "#25f4ee" : "#fe2c55"};
              color: ${currentMode === "follow" ? "#000000" : "#ffffff"};
              border: none;
              font-weight: 700;
              border-radius: 6px;
              cursor: pointer;
              transition: opacity 0.2s;
            ">${currentMode === "follow" ? "Start Follow" : "Start Unfollow"}</button>

            <button id="tt-sab-stop" disabled style="
              flex: 1;
              padding: 8px 12px;
              background: #2a2a2a;
              color: #777777;
              border: none;
              font-weight: 700;
              border-radius: 6px;
              cursor: not-allowed;
              opacity: 0.6;
              transition: opacity 0.2s;
            ">Stop</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const minBtn = document.getElementById("tt-sab-min");
    const bodyDiv = document.getElementById("tt-sab-body");
    const startBtn = document.getElementById("tt-sab-start");
    const stopBtn = document.getElementById("tt-sab-stop");
    const statusSpan = document.getElementById("tt-sab-status");
    const countSpan = document.getElementById("tt-sab-count");
    const delayInput = document.getElementById("tt-sab-delay");
    const autoScrollCheck = document.getElementById("tt-sab-autoscroll");
    const limitGuardCheck = document.getElementById("tt-sab-limit-guard");
    const modeFollowBtn = document.getElementById("tt-sab-mode-follow");
    const modeUnfollowBtn = document.getElementById("tt-sab-mode-unfollow");
    const speedButtons = document.querySelectorAll(".tt-sab-speed");

    function setMode(mode) {
      currentMode = mode;
      sessionStorage.setItem("tt_sab_mode", mode);
      if (mode === "follow") {
        modeFollowBtn.style.background = "#25f4ee";
        modeFollowBtn.style.borderColor = "#25f4ee";
        modeFollowBtn.style.color = "#000000";
        modeUnfollowBtn.style.background = "#1e1e1e";
        modeUnfollowBtn.style.borderColor = "#2f2f2f";
        modeUnfollowBtn.style.color = "#ffffff";
        startBtn.style.background = "#25f4ee";
        startBtn.style.color = "#000000";
        startBtn.textContent = "Start Follow";
      } else {
        modeUnfollowBtn.style.background = "#fe2c55";
        modeUnfollowBtn.style.borderColor = "#fe2c55";
        modeUnfollowBtn.style.color = "#ffffff";
        modeFollowBtn.style.background = "#1e1e1e";
        modeFollowBtn.style.borderColor = "#2f2f2f";
        modeFollowBtn.style.color = "#ffffff";
        startBtn.style.background = "#fe2c55";
        startBtn.style.color = "#ffffff";
        startBtn.textContent = "Start Unfollow";
      }
    }

    modeFollowBtn.onclick = () => { if (!isRunning) setMode("follow"); };
    modeUnfollowBtn.onclick = () => { if (!isRunning) setMode("unfollow"); };

    function highlightSpeed(speedVal) {
      speedButtons.forEach((btn) => {
        if (Math.abs(parseFloat(btn.dataset.speed) - parseFloat(speedVal)) < 0.05) {
          btn.style.background = "#fe2c55";
          btn.style.borderColor = "#fe2c55";
          btn.style.color = "#ffffff";
        } else {
          btn.style.background = "#222222";
          btn.style.borderColor = "#333333";
          btn.style.color = "#cccccc";
        }
      });
    }

    speedButtons.forEach((btn) => {
      btn.onclick = () => {
        delayInput.value = btn.dataset.speed;
        localStorage.setItem("tt_sab_delay", btn.dataset.speed);
        highlightSpeed(btn.dataset.speed);
      };
    });

    const savedDelay = localStorage.getItem("tt_sab_delay") || "0.8";
    delayInput.value = savedDelay;
    highlightSpeed(savedDelay);

    delayInput.onchange = () => {
      localStorage.setItem("tt_sab_delay", delayInput.value);
      highlightSpeed(delayInput.value);
    };

    let isMin = false;
    minBtn.onclick = () => {
      isMin = !isMin;
      bodyDiv.style.display = isMin ? "none" : "block";
      minBtn.textContent = isMin ? "+" : "—";
    };

    const savedCount = parseInt(sessionStorage.getItem("tt_sab_count") || "0", 10);
    countSpan.textContent = savedCount;

    startBtn.onclick = () => {
      sessionStorage.setItem("tt_sab_active", "1");
      runTikTokAutomation();
    };

    stopBtn.onclick = () => {
      haltTikTokAutomation("Stopped");
    };

    if (sessionStorage.getItem("tt_sab_active") === "1") {
      setTimeout(runTikTokAutomation, 600);
    }
  }

  function waitInterval(ms) {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const id = setInterval(() => {
        if (!isRunning || sessionStorage.getItem("tt_sab_active") !== "1") {
          clearInterval(id);
          reject(new Error("Stopped"));
          return;
        }
        if (Date.now() - t0 >= ms) {
          clearInterval(id);
          resolve();
        }
      }, 40);
    });
  }

  async function runTikTokAutomation() {
    if (isRunning) return;
    isRunning = true;

    const startBtn = document.getElementById("tt-sab-start");
    const stopBtn = document.getElementById("tt-sab-stop");
    const statusSpan = document.getElementById("tt-sab-status");
    const countSpan = document.getElementById("tt-sab-count");
    const delayInput = document.getElementById("tt-sab-delay");
    const autoScrollCheck = document.getElementById("tt-sab-autoscroll");
    const limitGuardCheck = document.getElementById("tt-sab-limit-guard");

    if (!startBtn || !stopBtn) return;

    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    startBtn.style.cursor = "not-allowed";

    stopBtn.disabled = false;
    stopBtn.style.opacity = "1";
    stopBtn.style.cursor = "pointer";
    stopBtn.style.background = "#fe2c55";
    stopBtn.style.color = "#ffffff";

    let delaySec = parseFloat(delayInput.value);
    if (isNaN(delaySec) || delaySec < 0.1) delaySec = 0.5;
    const delayMs = delaySec * 1000;

    let total = parseInt(sessionStorage.getItem("tt_sab_count") || "0", 10);
    let consecutiveEmptyCount = 0;

    while (isRunning && sessionStorage.getItem("tt_sab_active") === "1") {
      statusSpan.textContent = "Scanning TikTok…";
      statusSpan.style.color = "#25f4ee";

      // Check real limit toast only if limit guard is enabled
      if (limitGuardCheck && limitGuardCheck.checked) {
        const rateLimitMsg = checkGenuineTikTokLimit();
        if (rateLimitMsg) {
          statusSpan.textContent = "⚠️ Limit Hit! Auto-stopped for safety.";
          statusSpan.style.color = "#fe2c55";
          haltTikTokAutomation("Rate Limit Reached");
          break;
        }
      }

      const buttons = getTargetButtons(currentMode);

      if (buttons.length > 0) {
        consecutiveEmptyCount = 0;

        for (let i = 0; i < buttons.length; i++) {
          if (!isRunning || sessionStorage.getItem("tt_sab_active") !== "1") break;

          if (limitGuardCheck && limitGuardCheck.checked) {
            const limitAlert = checkGenuineTikTokLimit();
            if (limitAlert) {
              statusSpan.textContent = "⚠️ Limit Hit! Auto-stopped.";
              statusSpan.style.color = "#fe2c55";
              haltTikTokAutomation("TikTok Limit");
              return;
            }
          }

          const btn = buttons[i];
          statusSpan.textContent = `${currentMode === "follow" ? "Following" : "Unfollowing"} ${i + 1}/${buttons.length}…`;
          statusSpan.style.color = currentMode === "follow" ? "#25f4ee" : "#fe2c55";

          btn.scrollIntoView({ behavior: "auto", block: "center" });
          btn.click();

          if (currentMode === "unfollow") {
            await handleUnfollowConfirmModal();
          }

          total++;
          sessionStorage.setItem("tt_sab_count", total.toString());
          countSpan.textContent = total;

          try {
            await waitInterval(delayMs);
          } catch (_) {
            break;
          }
        }
      } else {
        consecutiveEmptyCount++;
      }

      if (isRunning && sessionStorage.getItem("tt_sab_active") === "1" && autoScrollCheck.checked) {
        if (consecutiveEmptyCount >= 4) {
          statusSpan.textContent = "All visible accounts processed! 🎉";
          statusSpan.style.color = "#25f4ee";
          haltTikTokAutomation("Completed");
          break;
        }

        statusSpan.textContent = "Scrolling for more users…";
        statusSpan.style.color = "#e3b341";

        const scroller = getScrollContainer();
        if (scroller === window) {
          window.scrollBy(0, 900);
        } else {
          scroller.scrollTop += 700;
        }

        try {
          await waitInterval(1200);
        } catch (_) {
          break;
        }
      } else {
        statusSpan.textContent = "Done! 🎉";
        statusSpan.style.color = "#25f4ee";
        haltTikTokAutomation("Completed");
        break;
      }
    }
  }

  function haltTikTokAutomation(msg = "Stopped") {
    isRunning = false;
    sessionStorage.removeItem("tt_sab_active");

    const startBtn = document.getElementById("tt-sab-start");
    const stopBtn = document.getElementById("tt-sab-stop");
    const statusSpan = document.getElementById("tt-sab-status");

    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.opacity = "1";
      startBtn.style.cursor = "pointer";
    }

    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.style.opacity = "0.6";
      stopBtn.style.cursor = "not-allowed";
      stopBtn.style.background = "#2a2a2a";
      stopBtn.style.color = "#777777";
    }

    if (statusSpan) {
      statusSpan.textContent = msg;
      statusSpan.style.color = msg === "Completed" ? "#25f4ee" : "#fe2c55";
    }
  }

  function checkAndInit() {
    injectTikTokWidget();
  }

  window.addEventListener("DOMContentLoaded", checkAndInit);
  window.addEventListener("load", checkAndInit);
  setInterval(checkAndInit, 1500);
})();
