/**
 * NEXA Tools Pro - GitHub Automation Module
 * Handles Auto Follow & Auto Unfollow with Rate Limit Auto-Stop, Turbo/SPA, Pagination, and Speed Presets.
 */

(function () {
  let isRunning = false;
  let currentMode = "follow"; // "follow" or "unfollow"
  let consecutiveFailures = 0;

  function isGitHubUserListPage() {
    const s = window.location.search.toLowerCase();
    const p = window.location.pathname.toLowerCase();
    return s.includes("tab=followers") || s.includes("tab=following") || p.endsWith("/followers") || p.endsWith("/following");
  }

  function getAutoDetectedMode() {
    const s = window.location.search.toLowerCase();
    const p = window.location.pathname.toLowerCase();
    if (s.includes("tab=following") || p.endsWith("/following")) return "unfollow";
    return "follow";
  }

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
    );
  }

  // GitHub Follow Limit / Rate Limit Detection
  function checkGitHubRateLimit() {
    // 1. Check flash error banners
    const flashMessages = document.querySelectorAll(
      '.flash-error, .flash-warn, .js-flash-alert, div[class*="flash"][class*="error"], div[role="alert"]'
    );
    for (const el of flashMessages) {
      if (!isElementVisible(el)) continue;
      const text = (el.innerText || el.textContent || "").toLowerCase();
      if (
        text.includes("rate limit") ||
        text.includes("too fast") ||
        text.includes("cannot follow") ||
        text.includes("abuse") ||
        text.includes("limit reached") ||
        text.includes("try again later") ||
        text.includes("blocked")
      ) {
        return "GitHub Limit Detected: " + text.slice(0, 70);
      }
    }

    // 2. Check for disabled action buttons with error hints
    const disabledButtons = document.querySelectorAll('button[disabled], input[type="submit"][disabled]');
    for (const btn of disabledButtons) {
      const tip = (btn.getAttribute("aria-label") || btn.getAttribute("title") || "").toLowerCase();
      if (tip.includes("limit") || tip.includes("blocked") || tip.includes("unable to follow")) {
        return "Action Restricted by GitHub";
      }
    }

    return null;
  }

  function getTargetButtons(mode) {
    const list = [];
    const visitedForms = new Set();

    if (mode === "follow") {
      const forms = document.querySelectorAll('form[action*="/users/follow"]');
      forms.forEach((form) => {
        if (form.action.includes("/users/unfollow")) return;
        const btn = form.querySelector('input[type="submit"], button[type="submit"], button');
        if (btn && !visitedForms.has(form)) {
          const text = (btn.value || btn.textContent || "").trim().toLowerCase();
          if (text.includes("follow") && !text.includes("unfollow") && isElementVisible(btn)) {
            list.push(btn);
            visitedForms.add(form);
          }
        }
      });

      if (list.length === 0) {
        document.querySelectorAll('input[type="submit"], button').forEach((btn) => {
          const text = (btn.value || btn.textContent || "").trim().toLowerCase();
          if (text === "follow") {
            const form = btn.closest("form");
            if (form && form.action.includes("/users/unfollow")) return;
            if (form && visitedForms.has(form)) return;
            if (isElementVisible(btn)) {
              list.push(btn);
              if (form) visitedForms.add(form);
            }
          }
        });
      }
    } else {
      // Unfollow Mode
      const forms = document.querySelectorAll('form[action*="/users/unfollow"]');
      forms.forEach((form) => {
        const btn = form.querySelector('input[type="submit"], button[type="submit"], button');
        if (btn && !visitedForms.has(form)) {
          const text = (btn.value || btn.textContent || "").trim().toLowerCase();
          if (text.includes("unfollow") && isElementVisible(btn)) {
            list.push(btn);
            visitedForms.add(form);
          }
        }
      });

      if (list.length === 0) {
        document.querySelectorAll('input[type="submit"], button').forEach((btn) => {
          const text = (btn.value || btn.textContent || "").trim().toLowerCase();
          if (text === "unfollow") {
            const form = btn.closest("form");
            if (form && visitedForms.has(form)) return;
            if (isElementVisible(btn)) {
              list.push(btn);
              if (form) visitedForms.add(form);
            }
          }
        });
      }
    }

    return list;
  }

  function getNextPageButton() {
    const selectors = [
      '.paginate-container a.next_page',
      '.pagination a.next_page',
      '.paginate-container a[rel="nofollow"]:last-child',
      'div[class*="pagination"] a:last-child'
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = el.textContent.trim().toLowerCase();
        const isDisabled = el.classList.contains("disabled") || el.getAttribute("aria-disabled") === "true";
        if (text.includes("next") && !isDisabled && el.href) {
          return el;
        }
      }
    }
    return null;
  }

  function injectWidget() {
    if (document.getElementById("gh-sab-widget")) return;
    if (!isGitHubUserListPage()) return;

    currentMode = sessionStorage.getItem("gh_sab_mode") || getAutoDetectedMode();

    const widget = document.createElement("div");
    widget.id = "gh-sab-widget";
    widget.innerHTML = `
      <div id="gh-sab-card" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #161b22;
        color: #e6edf3;
        border: 1px solid #30363d;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(1,4,9,0.85);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        width: 290px;
        padding: 14px 16px;
        font-size: 12px;
        box-sizing: border-box;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #21262d; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px;">🤖</span>
            <strong style="font-size: 13px; color: #f0f6fc;">GitHub Auto Bot Pro</strong>
          </div>
          <button id="gh-sab-min" style="background: none; border: none; color: #8b949e; cursor: pointer; font-size: 14px; padding: 2px;">—</button>
        </div>

        <div id="gh-sab-body">
          <!-- Mode Selector (Follow vs Unfollow) -->
          <div style="display: flex; gap: 5px; margin-bottom: 10px;">
            <button id="gh-sab-mode-follow" style="
              flex: 1;
              padding: 6px 4px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid ${currentMode === "follow" ? "#238636" : "#30363d"};
              background: ${currentMode === "follow" ? "#238636" : "#21262d"};
              color: #ffffff;
            ">➕ Auto Follow</button>

            <button id="gh-sab-mode-unfollow" style="
              flex: 1;
              padding: 6px 4px;
              font-size: 11px;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              border: 1px solid ${currentMode === "unfollow" ? "#da3633" : "#30363d"};
              background: ${currentMode === "unfollow" ? "#da3633" : "#21262d"};
              color: #ffffff;
            ">➖ Auto Unfollow</button>
          </div>

          <!-- Status & Counter -->
          <div style="background: #0d1117; padding: 8px 10px; border-radius: 6px; border: 1px solid #21262d; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #8b949e;">Status:</span>
              <span id="gh-sab-status" style="font-weight: 600; color: #58a6ff;">Ready</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #8b949e;">Processed:</span>
              <span id="gh-sab-count" style="font-weight: 600; color: #3fb950;">0</span>
            </div>
          </div>

          <!-- Speed Presets -->
          <div style="margin-bottom: 10px;">
            <div style="color: #8b949e; margin-bottom: 4px; font-size: 11px;">Speed Presets:</div>
            <div style="display: flex; gap: 4px;">
              <button class="gh-sab-speed" data-speed="2.0" style="flex:1; padding: 4px 2px; font-size: 11px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; cursor: pointer;">🛡️ Safe (2s)</button>
              <button class="gh-sab-speed" data-speed="0.8" style="flex:1; padding: 4px 2px; font-size: 11px; background: #1f6feb; border: 1px solid #388bfd; color: #ffffff; border-radius: 4px; cursor: pointer;">🚀 Fast (0.8s)</button>
              <button class="gh-sab-speed" data-speed="0.3" style="flex:1; padding: 4px 2px; font-size: 11px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; cursor: pointer;">⚡ Turbo (0.3s)</button>
            </div>
          </div>

          <!-- Custom Delay & Pagination -->
          <div style="margin-bottom: 8px;">
            <label style="display: flex; justify-content: space-between; align-items: center; color: #c9d1d9;">
              <span>Delay (Seconds):</span>
              <input type="number" id="gh-sab-delay" value="0.8" min="0.1" max="10" step="0.1" style="
                width: 65px;
                padding: 4px 6px;
                background: #0d1117;
                border: 1px solid #30363d;
                border-radius: 4px;
                color: #f0f6fc;
                font-size: 12px;
                text-align: center;
              " />
            </label>
          </div>

          <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; gap: 6px; color: #c9d1d9; cursor: pointer;">
              <input type="checkbox" id="gh-sab-autopage" checked style="cursor: pointer;" />
              <span>Next page auto-navigate</span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 8px;">
            <button id="gh-sab-start" style="
              flex: 1;
              padding: 8px 12px;
              background: ${currentMode === "follow" ? "#238636" : "#da3633"};
              border: 1px solid rgba(240,246,252,0.1);
              color: #ffffff;
              font-weight: 600;
              border-radius: 6px;
              cursor: pointer;
              transition: background 0.2s;
            ">${currentMode === "follow" ? "Start Follow" : "Start Unfollow"}</button>

            <button id="gh-sab-stop" disabled style="
              flex: 1;
              padding: 8px 12px;
              background: #30363d;
              border: 1px solid rgba(240,246,252,0.1);
              color: #8b949e;
              font-weight: 600;
              border-radius: 6px;
              cursor: not-allowed;
              opacity: 0.5;
              transition: background 0.2s;
            ">Stop</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Setup Event Listeners
    const minBtn = document.getElementById("gh-sab-min");
    const bodyDiv = document.getElementById("gh-sab-body");
    const startBtn = document.getElementById("gh-sab-start");
    const stopBtn = document.getElementById("gh-sab-stop");
    const statusSpan = document.getElementById("gh-sab-status");
    const countSpan = document.getElementById("gh-sab-count");
    const delayInput = document.getElementById("gh-sab-delay");
    const autoPageCheck = document.getElementById("gh-sab-autopage");
    const modeFollowBtn = document.getElementById("gh-sab-mode-follow");
    const modeUnfollowBtn = document.getElementById("gh-sab-mode-unfollow");
    const speedButtons = document.querySelectorAll(".gh-sab-speed");

    function setMode(mode) {
      currentMode = mode;
      sessionStorage.setItem("gh_sab_mode", mode);
      if (mode === "follow") {
        modeFollowBtn.style.background = "#238636";
        modeFollowBtn.style.borderColor = "#238636";
        modeUnfollowBtn.style.background = "#21262d";
        modeUnfollowBtn.style.borderColor = "#30363d";
        startBtn.style.background = "#238636";
        startBtn.textContent = "Start Follow";
      } else {
        modeUnfollowBtn.style.background = "#da3633";
        modeUnfollowBtn.style.borderColor = "#da3633";
        modeFollowBtn.style.background = "#21262d";
        modeFollowBtn.style.borderColor = "#30363d";
        startBtn.style.background = "#da3633";
        startBtn.textContent = "Start Unfollow";
      }
    }

    modeFollowBtn.onclick = () => { if (!isRunning) setMode("follow"); };
    modeUnfollowBtn.onclick = () => { if (!isRunning) setMode("unfollow"); };

    function highlightSpeed(speedVal) {
      speedButtons.forEach((btn) => {
        if (Math.abs(parseFloat(btn.dataset.speed) - parseFloat(speedVal)) < 0.05) {
          btn.style.background = "#1f6feb";
          btn.style.borderColor = "#388bfd";
          btn.style.color = "#ffffff";
        } else {
          btn.style.background = "#21262d";
          btn.style.borderColor = "#30363d";
          btn.style.color = "#c9d1d9";
        }
      });
    }

    speedButtons.forEach((btn) => {
      btn.onclick = () => {
        delayInput.value = btn.dataset.speed;
        localStorage.setItem("gh_sab_delay", btn.dataset.speed);
        highlightSpeed(btn.dataset.speed);
      };
    });

    const savedDelay = localStorage.getItem("gh_sab_delay") || "0.8";
    delayInput.value = savedDelay;
    highlightSpeed(savedDelay);

    delayInput.onchange = () => {
      localStorage.setItem("gh_sab_delay", delayInput.value);
      highlightSpeed(delayInput.value);
    };

    let isMin = false;
    minBtn.onclick = () => {
      isMin = !isMin;
      bodyDiv.style.display = isMin ? "none" : "block";
      minBtn.textContent = isMin ? "+" : "—";
    };

    const savedCount = parseInt(sessionStorage.getItem("gh_sab_count") || "0", 10);
    countSpan.textContent = savedCount;

    startBtn.onclick = () => {
      sessionStorage.setItem("gh_sab_active", "1");
      consecutiveFailures = 0;
      runAutomation();
    };

    stopBtn.onclick = () => {
      haltAutomation("Stopped");
    };

    if (sessionStorage.getItem("gh_sab_active") === "1") {
      setTimeout(runAutomation, 600);
    }
  }

  function waitInterval(ms) {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const id = setInterval(() => {
        if (!isRunning || sessionStorage.getItem("gh_sab_active") !== "1") {
          clearInterval(id);
          reject(new Error("Stopped"));
          return;
        }
        if (Date.now() - t0 >= ms) {
          clearInterval(id);
          resolve();
        }
      }, 50);
    });
  }

  async function runAutomation() {
    if (isRunning) return;
    isRunning = true;

    const startBtn = document.getElementById("gh-sab-start");
    const stopBtn = document.getElementById("gh-sab-stop");
    const statusSpan = document.getElementById("gh-sab-status");
    const countSpan = document.getElementById("gh-sab-count");
    const delayInput = document.getElementById("gh-sab-delay");
    const autoPageCheck = document.getElementById("gh-sab-autopage");

    if (!startBtn || !stopBtn) return;

    startBtn.disabled = true;
    startBtn.style.opacity = "0.5";
    startBtn.style.cursor = "not-allowed";

    stopBtn.disabled = false;
    stopBtn.style.opacity = "1";
    stopBtn.style.cursor = "pointer";
    stopBtn.style.background = "#da3633";
    stopBtn.style.color = "#ffffff";

    statusSpan.textContent = "Scanning…";
    statusSpan.style.color = "#58a6ff";

    let delaySec = parseFloat(delayInput.value);
    if (isNaN(delaySec) || delaySec < 0.1) delaySec = 0.5;
    const delayMs = delaySec * 1000;

    // Check rate limit before starting
    const initialLimitReason = checkGitHubRateLimit();
    if (initialLimitReason) {
      statusSpan.textContent = "⚠️ Limit detected! Auto-stopped.";
      statusSpan.style.color = "#f85149";
      haltAutomation("Rate Limit Reached");
      return;
    }

    const buttons = getTargetButtons(currentMode);
    let total = parseInt(sessionStorage.getItem("gh_sab_count") || "0", 10);

    if (buttons.length === 0) {
      statusSpan.textContent = `No ${currentMode} buttons found`;
      statusSpan.style.color = "#8b949e";
    } else {
      for (let i = 0; i < buttons.length; i++) {
        if (!isRunning || sessionStorage.getItem("gh_sab_active") !== "1") break;

        // Check rate limit continuously
        const limitAlert = checkGitHubRateLimit();
        if (limitAlert) {
          statusSpan.textContent = "⚠️ Limit Hit! Auto-stopped for safety.";
          statusSpan.style.color = "#f85149";
          haltAutomation("Rate Limit Hit");
          return;
        }

        const btn = buttons[i];
        statusSpan.textContent = `${currentMode === "follow" ? "Following" : "Unfollowing"} ${i + 1}/${buttons.length}…`;
        statusSpan.style.color = currentMode === "follow" ? "#3fb950" : "#f85149";

        btn.scrollIntoView({ behavior: "auto", block: "nearest" });
        btn.click();

        total++;
        sessionStorage.setItem("gh_sab_count", total.toString());
        countSpan.textContent = total;

        try {
          await waitInterval(delayMs);
        } catch (_) {
          break;
        }

        // Verify button state changed (if it still has same state after delay, increment failure)
        const updatedText = (btn.value || btn.textContent || "").trim().toLowerCase();
        if (currentMode === "follow" && updatedText.includes("follow") && !updatedText.includes("unfollow")) {
          consecutiveFailures++;
          if (consecutiveFailures >= 3) {
            statusSpan.textContent = "⚠️ Follow Limit Hit! Auto-stopped.";
            statusSpan.style.color = "#f85149";
            haltAutomation("Limit Reached");
            return;
          }
        } else {
          consecutiveFailures = 0;
        }
      }
    }

    if (isRunning && sessionStorage.getItem("gh_sab_active") === "1") {
      if (autoPageCheck.checked) {
        const nextBtn = getNextPageButton();
        if (nextBtn) {
          statusSpan.textContent = "Next Page in 1s…";
          statusSpan.style.color = "#e3b341";
          await new Promise((r) => setTimeout(r, 1000));
          nextBtn.click();
          return;
        }
      }

      statusSpan.textContent = "All Done! 🎉";
      statusSpan.style.color = "#3fb950";
      haltAutomation("Completed");
    }
  }

  function haltAutomation(msg = "Stopped") {
    isRunning = false;
    sessionStorage.removeItem("gh_sab_active");

    const startBtn = document.getElementById("gh-sab-start");
    const stopBtn = document.getElementById("gh-sab-stop");
    const statusSpan = document.getElementById("gh-sab-status");

    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.opacity = "1";
      startBtn.style.cursor = "pointer";
    }

    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.style.opacity = "0.5";
      stopBtn.style.cursor = "not-allowed";
      stopBtn.style.background = "#30363d";
      stopBtn.style.color = "#8b949e";
    }

    if (statusSpan) {
      statusSpan.textContent = msg;
      statusSpan.style.color = msg === "Completed" ? "#3fb950" : (msg.includes("Limit") ? "#f85149" : "#f85149");
    }
  }

  function checkAndInit() {
    if (isGitHubUserListPage()) {
      injectWidget();
    } else {
      const w = document.getElementById("gh-sab-widget");
      if (w) w.remove();
    }
  }

  window.addEventListener("DOMContentLoaded", checkAndInit);
  window.addEventListener("load", checkAndInit);
  window.addEventListener("turbo:load", checkAndInit);
  window.addEventListener("turbo:render", checkAndInit);
  window.addEventListener("popstate", checkAndInit);
  setInterval(checkAndInit, 1200);
})();
