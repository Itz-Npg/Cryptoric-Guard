(() => {
  "use strict";

  const GUARD_VERSION = "3.0.0 (Ultimate)";
  const REFRESH_KEY = "_cgLastRefresh";
  const TASK_START_KEY = "_cgTaskStart";
  const TASK_COUNT_KEY = "_cgTaskCount";
  
  let hasDetectedBypass = false;
  let activeConfig = {};

  // Default configuration based on Cryptoric Auth Control Panel
  const defaultConfig = {
    // Core Security
    botLockdown: true,            // Blocks headless browsers/Puppeteer
    
    // Anti-Bypass Engine
    cryptoricGuard: true,          // Core protection
    deepEngine: true,             // Advanced traffic inspection
    invisibleValidation: true,    // Background math/timing checks
    minTaskTimeSeconds: 0,         // Prevent instant completion
    
    // Bypass Traps
    refererTrapping: true,        // Strict document.referrer checks
    unicodeTrap: true,            // Detect zero-width characters
    userscriptDetection: true,    // Tampermonkey/Greasemonkey
    spoofTrap: true,              // Fake endpoints to bait bypassers
    
    // Aggressive Walls
    blockVpns: true,              // Timezone mismatch checks
    blockAdblockers: true,        // Detect blocked ad elements
    blockIncognito: true,         // Basic private browsing check
    maxTasksDaily: 0,              // Rate limiting
    
    allowedReferrers: [],
    onDetect: null
  };

  const signatures = {
    deepEngine: [
      "iwoozie.baby", "lootlink.com", "bypass.vip", "F.E.A.R", "FastForward"
    ],
    suspiciousIds: ["cjlaly", "lkuag", "bypass-container"]
  };

  function handleDetection(reason, isTrap = false) {
    if (hasDetectedBypass) return;
    hasDetectedBypass = true;

    console.log(`[Cryptoric Guard] 🚨 ${isTrap ? 'TRAP TRIGGERED' : 'DETECTION'}:`, reason);

    if (typeof activeConfig.onDetect === "function") {
      activeConfig.onDetect(reason);
    }

    alert("❌ Unauthorized Action Detected ❌\nReason: " + reason);
    
    // Nuke the page
    document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:red;font-family:monospace;font-size:24px;text-align:center;">
        SECURITY LOCKDOWN<br>Bypass tools are strictly prohibited.<br>[ ${reason} ]
    </div>`;

    setTimeout(() => {
      window.location.href = "about:blank";
    }, 2000);
  }

  /* ==========================================
     CORE SECURITY
  ========================================== */
  function runBotLockdown() {
    if (navigator.webdriver || window.document.documentElement.getAttribute("webdriver")) {
      handleDetection("Headless Browser / Bot Detected");
    }
    // PhantomJS/Selenium checks
    if (window.callPhantom || window._phantom || window.__nightmare) {
      handleDetection("Automated Testing Framework Detected");
    }
  }

  /* ==========================================
     ANTI-BYPASS ENGINE
  ========================================== */
  function setupDeepEngine() {
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0]?.url || args[0];
      if (typeof url === "string" && signatures.deepEngine.some(p => url.toLowerCase().includes(p))) {
        handleDetection("Deep Engine: Malicious XHR intercepted");
        return Promise.reject("Blocked");
      }
      return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) {
      const url = args[1];
      if (typeof url === "string" && signatures.deepEngine.some(p => url.toLowerCase().includes(p))) {
        handleDetection("Deep Engine: Malicious XHR intercepted");
        throw new Error("Blocked");
      }
      originalOpen.apply(this, args);
    };
  }

  function checkMinTaskTime() {
    if (activeConfig.minTaskTimeSeconds > 0) {
      sessionStorage.setItem(TASK_START_KEY, Date.now().toString());
      
      // Override typical completion functions (like form submits) if requested
      window.CryptoricGuard.validateCompletionTime = function() {
        const start = parseInt(sessionStorage.getItem(TASK_START_KEY) || "0");
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed < activeConfig.minTaskTimeSeconds) {
          handleDetection(`Task completed impossibly fast (${elapsed.toFixed(1)}s < ${activeConfig.minTaskTimeSeconds}s). Automation suspected.`);
          return false;
        }
        return true;
      };
    }
  }

  /* ==========================================
     BYPASS TRAPS
  ========================================== */
  function setupRefererTrapping() {
    const ref = document.referrer;
    if (activeConfig.allowedReferrers.length > 0) {
      const isAllowed = activeConfig.allowedReferrers.some(allowed => ref.includes(allowed));
      if (!isAllowed && ref !== "") {
        handleDetection("Referer Trapping: Invalid Origin", true);
      }
    } else if (ref === "") {
        // If strict trapping is on but no allowed referrers provided, direct hits might be suspicious depending on implementation.
        // We will just log it for now to avoid false positives.
        console.warn("[Cryptoric Guard] Direct endpoint hit (No referer).");
    }
  }

  function setupUnicodeTrap() {
    // Detect invisible zero-width characters often injected by bypass extensions to tag URLs
    const url = window.location.href;
    const zeroWidthRegex = /[\u200B-\u200D\uFEFF]/g;
    if (zeroWidthRegex.test(url)) {
      handleDetection("Unicode Payload Trap: Zero-width characters found in URL", true);
    }
  }

  function blockUserscriptAPIs() {
    const apis = ["GM_xmlhttpRequest", "GM_getValue", "GM_setValue", "GM_info"];
    apis.forEach((api) => {
      Object.defineProperty(window, api, {
        get: function () {
          handleDetection("Userscript Detection: Tampermonkey/Greasemonkey API accessed");
          return function () { return null; };
        },
        configurable: false,
      });
    });
  }

  function setupSpoofTrap() {
    // Create a fake hidden form/button that bypass scripts might try to auto-click
    const trapBtn = document.createElement('button');
    trapBtn.id = "free-access-bypass-trap";
    trapBtn.className = "bypass-completion-btn";
    trapBtn.style.position = "absolute";
    trapBtn.style.top = "-9999px";
    trapBtn.style.opacity = "0";
    trapBtn.innerText = "Complete Action";
    
    trapBtn.addEventListener("click", (e) => {
        if (e.isTrusted === false) {
           handleDetection("Spoof Completion Trap: Simulated click detected on bait element", true);
        } else {
           handleDetection("Spoof Completion Trap: Bait element triggered", true);
        }
    });
    
    if (document.body) {
        document.body.appendChild(trapBtn);
    } else {
        document.addEventListener("DOMContentLoaded", () => document.body.appendChild(trapBtn));
    }
  }

  /* ==========================================
     AGGRESSIVE WALLS
  ========================================== */
  function checkAdblock() {
    const bait = document.createElement('div');
    bait.innerHTML = '&nbsp;';
    bait.className = 'adsbox ad-placement doubleclick ad-placeholder adsense';
    bait.style.position = 'absolute';
    bait.style.top = '-9999px';
    
    if(document.body) {
        document.body.appendChild(bait);
        setTimeout(() => {
          if (bait.offsetHeight === 0 || window.getComputedStyle(bait).display === 'none') {
            handleDetection("Block Adblockers: Active Adblocker preventing rendering");
          }
          bait.remove();
        }, 200);
    }
  }

  function checkVPN() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = new Date().getTimezoneOffset();
      
      // UTC timezone with a non-zero offset is a classic sign of timezone spoofing or bad VPN config
      if (tz === "Etc/UTC" && offset !== 0) {
         handleDetection("Block VPNs/Proxies: Timezone Spoofing Anomaly Detected");
      }
    } catch(e) {}
  }

  function checkIncognito() {
    // Basic heuristic: requestFileSystem is deprecated but often disabled in incognito
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (!fs) {
      // Very loose heuristic, might false positive on modern browsers without FS API
      // We will only log it to avoid breaking modern Firefox/Safari unless strictly enabled
      if(activeConfig.blockIncognito) {
          console.warn("[Cryptoric Guard] Incognito/Private mode suspected (FS API missing).");
      }
    }
  }

  function checkDailyTasks() {
    if (activeConfig.maxTasksDaily > 0) {
       const today = new Date().toDateString();
       const data = JSON.parse(localStorage.getItem(TASK_COUNT_KEY) || '{"date":"","count":0}');
       
       if (data.date !== today) {
           localStorage.setItem(TASK_COUNT_KEY, JSON.stringify({date: today, count: 1}));
       } else {
           if (data.count >= activeConfig.maxTasksDaily) {
               handleDetection(`Daily Task Limit Reached (${activeConfig.maxTasksDaily}). Try again tomorrow.`);
           } else {
               localStorage.setItem(TASK_COUNT_KEY, JSON.stringify({date: today, count: data.count + 1}));
           }
       }
    }
  }


  /* ==========================================
     INITIALIZATION & DOM OBSERVER
  ========================================== */
  function setupDOMObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "STYLE" || node.tagName === "SCRIPT") {
             const content = node.textContent || "";
             if (signatures.deepEngine.some(s => content.includes(s))) {
               handleDetection("Suspicious DOM injection detected");
             }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }


  function initialize(userConfig = {}) {
    activeConfig = { ...defaultConfig, ...userConfig };

    console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🐼 Cryptoric Guard Anti-Bypass System   ║
  ║   Version: ${GUARD_VERSION}                ║
  ║   Status: Active                          ║
  ╚═══════════════════════════════════════════╝
    `);

    // --- Core Security ---
    if (activeConfig.botLockdown) runBotLockdown();
    
    // --- Anti-Bypass Engine ---
    if (activeConfig.cryptoricGuard) {
      if (activeConfig.deepEngine) setupDeepEngine();
      checkMinTaskTime();
      setupDOMObserver();
    }

    // --- Bypass Traps ---
    if (activeConfig.userscriptDetection) blockUserscriptAPIs();
    if (activeConfig.unicodeTrap) setupUnicodeTrap();
    if (activeConfig.refererTrapping) setupRefererTrapping();
    if (activeConfig.spoofTrap) setupSpoofTrap();

    // --- Aggressive Walls (Requires DOM) ---
    const runWalls = () => {
      if (activeConfig.blockAdblockers) checkAdblock();
      if (activeConfig.blockVpns) checkVPN();
      if (activeConfig.blockIncognito) checkIncognito();
      if (activeConfig.maxTasksDaily > 0) checkDailyTasks();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runWalls);
    } else {
      runWalls();
    }
    
    // Expose utility functions safely
    return {
       validateTime: window.CryptoricGuard?.validateCompletionTime || (() => true),
       version: GUARD_VERSION
    };
  }

  window.CryptoricGuard = {
    init: initialize
  };
})();

