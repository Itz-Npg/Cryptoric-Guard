(() => {
  "use strict";

  const GUARD_VERSION = "4.0.0 (Crypto & HWID Edition)";
  const REFRESH_KEY = "_cgLastRefresh";
  const TASK_START_KEY = "_cgTaskStart";
  const TASK_COUNT_KEY = "_cgTaskCount";
  
  let hasDetectedBypass = false;
  let activeConfig = {};
  let cachedHWID = null;

  const defaultConfig = {
    botLockdown: true,
    cryptoricGuard: true,
    deepEngine: true,
    minTaskTimeSeconds: 0,
    
    // Cryptography & API Security
    requestHashing: true,          
    hashSecret: "cg_default_secret", 
    hashEndpoints: ["/api/", "submit", "redeem"], 
    
    // Hardware ID Fingerprinting
    useHWID: true, // Attach HWID to requests
    
    // Bypass Traps
    refererTrapping: true,
    unicodeTrap: true,
    userscriptDetection: true,
    spoofTrap: true,
    
    blockVpns: true,
    blockAdblockers: true,
    blockIncognito: true,
    maxTasksDaily: 0,
    
    allowedReferrers: [],
    onDetect: null
  };

  const signatures = {
    deepEngine: ["iwoozie.baby", "lootlink.com", "bypass.vip", "F.E.A.R", "FastForward"],
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
    
    document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:red;font-family:monospace;font-size:24px;text-align:center;">
        SECURITY LOCKDOWN<br>Bypass tools are strictly prohibited.<br>[ ${reason} ]
    </div>`;

    setTimeout(() => {
      window.location.href = "about:blank";
    }, 2000);
  }

  /* ==========================================
     HWID FINGERPRINTING
  ========================================== */
  function generateHWID() {
      if (cachedHWID) return cachedHWID;
      
      const nav = window.navigator;
      const screen = window.screen;
      let fingerprint = "";
      
      fingerprint += nav.userAgent || "";
      fingerprint += nav.language || "";
      fingerprint += nav.hardwareConcurrency || "";
      fingerprint += nav.deviceMemory || "";
      fingerprint += screen.colorDepth || "";
      fingerprint += screen.width + "x" + screen.height;
      fingerprint += new Date().getTimezoneOffset();
      
      // Canvas Fingerprint
      try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          ctx.textBaseline = "top";
          ctx.font = "14px 'Arial'";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = "#f60";
          ctx.fillRect(125,1,62,20);
          ctx.fillStyle = "#069";
          ctx.fillText("CryptoricGuard HWID", 2, 15);
          ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
          ctx.fillText("CryptoricGuard HWID", 4, 17);
          fingerprint += canvas.toDataURL();
      } catch(e) {}

      // Fast Hash of the fingerprint string
      let hash = 5381;
      for (let i = 0; i < fingerprint.length; i++) {
          hash = ((hash << 5) + hash) + fingerprint.charCodeAt(i);
      }
      cachedHWID = "HWID-" + (hash >>> 0).toString(16);
      return cachedHWID;
  }

  /* ==========================================
     CRYPTOGRAPHY ENGINE (Fast Sync Hash)
  ========================================== */
  function generateSignature(url, payload) {
    const timestamp = Date.now();
    let rawData = url + activeConfig.hashSecret + timestamp + (payload || "");
    
    if (activeConfig.useHWID) {
        rawData += generateHWID();
    }
    
    // Fast synchronous bitwise hash (DJB2 variant)
    let hash = 5381;
    for (let i = 0; i < rawData.length; i++) {
        hash = ((hash << 5) + hash) + rawData.charCodeAt(i);
    }
    const signature = (hash >>> 0).toString(16);
    
    return {
        signature: signature,
        timestamp: timestamp.toString(),
        hwid: activeConfig.useHWID ? generateHWID() : null
    };
  }

  function shouldHash(url) {
    if (!activeConfig.requestHashing) return false;
    return activeConfig.hashEndpoints.some(ep => url.includes(ep));
  }

  /* ==========================================
     ANTI-BYPASS ENGINE & NETWORK INTERCEPTION
  ========================================== */
  function setupDeepEngineAndCrypto() {
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = args[0]?.url || args[0];
      let options = args[1] || {};

      if (typeof url === "string") {
        if (activeConfig.deepEngine && signatures.deepEngine.some(p => url.toLowerCase().includes(p))) {
          handleDetection("Deep Engine: Malicious fetch intercepted");
          return Promise.reject("Blocked");
        }

        if (shouldHash(url)) {
            const bodyStr = typeof options.body === 'string' ? options.body : "";
            const cryptoData = generateSignature(url, bodyStr);
            
            options.headers = options.headers || {};
            options.headers['X-Cryptoric-Signature'] = cryptoData.signature;
            options.headers['X-Cryptoric-Timestamp'] = cryptoData.timestamp;
            if (cryptoData.hwid) {
                options.headers['X-Cryptoric-HWID'] = cryptoData.hwid;
            }
            args[1] = options;
        }
      }
      return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function (...args) {
      this._cgUrl = args[1];
      if (typeof this._cgUrl === "string" && activeConfig.deepEngine && signatures.deepEngine.some(p => this._cgUrl.toLowerCase().includes(p))) {
        handleDetection("Deep Engine: Malicious XHR intercepted");
        throw new Error("Blocked");
      }
      originalOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function (body) {
       if (this._cgUrl && shouldHash(this._cgUrl)) {
           const bodyStr = typeof body === 'string' ? body : "";
           const cryptoData = generateSignature(this._cgUrl, bodyStr);
           this.setRequestHeader('X-Cryptoric-Signature', cryptoData.signature);
           this.setRequestHeader('X-Cryptoric-Timestamp', cryptoData.timestamp);
           if (cryptoData.hwid) {
               this.setRequestHeader('X-Cryptoric-HWID', cryptoData.hwid);
           }
       }
       originalSend.call(this, body);
    };
  }


  /* ==========================================
     CORE SECURITY
  ========================================== */
  function runBotLockdown() {
    if (navigator.webdriver || window.document.documentElement.getAttribute("webdriver")) {
      handleDetection("Headless Browser / Bot Detected");
    }
    if (window.callPhantom || window._phantom || window.__nightmare) {
      handleDetection("Automated Testing Framework Detected");
    }
  }

  function checkMinTaskTime() {
    if (activeConfig.minTaskTimeSeconds > 0) {
      sessionStorage.setItem(TASK_START_KEY, Date.now().toString());
      window.CryptoricGuard.validateCompletionTime = function() {
        const start = parseInt(sessionStorage.getItem(TASK_START_KEY) || "0");
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed < activeConfig.minTaskTimeSeconds) {
          handleDetection(`Task completed impossibly fast (${elapsed.toFixed(1)}s < ${activeConfig.minTaskTimeSeconds}s).`);
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
    }
  }

  function setupUnicodeTrap() {
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
          handleDetection("Userscript Detection: Tampermonkey API accessed");
          return function () { return null; };
        },
        configurable: false,
      });
    });
  }

  function setupSpoofTrap() {
    const trapBtn = document.createElement('button');
    trapBtn.id = "free-access-bypass-trap";
    trapBtn.className = "bypass-completion-btn";
    trapBtn.style.position = "absolute";
    trapBtn.style.top = "-9999px";
    trapBtn.style.opacity = "0";
    trapBtn.innerText = "Complete Action";
    
    trapBtn.addEventListener("click", (e) => {
        if (e.isTrusted === false) handleDetection("Spoof Completion Trap: Simulated click", true);
        else handleDetection("Spoof Completion Trap: Bait element triggered", true);
    });
    
    if (document.body) document.body.appendChild(trapBtn);
    else document.addEventListener("DOMContentLoaded", () => document.body.appendChild(trapBtn));
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
      if (tz === "Etc/UTC" && offset !== 0) {
         handleDetection("Block VPNs/Proxies: Timezone Spoofing Anomaly Detected");
      }
    } catch(e) {}
  }

  function checkIncognito() {
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (!fs && activeConfig.blockIncognito) {
       console.warn("[Cryptoric Guard] Incognito/Private mode suspected.");
    }
  }

  function checkDailyTasks() {
    if (activeConfig.maxTasksDaily > 0) {
       const today = new Date().toDateString();
       const data = JSON.parse(localStorage.getItem(TASK_COUNT_KEY) || '{"date":"","count":0}');
       if (data.date !== today) {
           localStorage.setItem(TASK_COUNT_KEY, JSON.stringify({date: today, count: 1}));
       } else {
           if (data.count >= activeConfig.maxTasksDaily) handleDetection(`Daily Task Limit Reached (${activeConfig.maxTasksDaily}).`);
           else localStorage.setItem(TASK_COUNT_KEY, JSON.stringify({date: today, count: data.count + 1}));
       }
    }
  }

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
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
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

    if (activeConfig.botLockdown) runBotLockdown();
    if (activeConfig.cryptoricGuard) {
      setupDeepEngineAndCrypto();
      checkMinTaskTime();
      setupDOMObserver();
    }
    if (activeConfig.userscriptDetection) blockUserscriptAPIs();
    if (activeConfig.unicodeTrap) setupUnicodeTrap();
    if (activeConfig.refererTrapping) setupRefererTrapping();
    if (activeConfig.spoofTrap) setupSpoofTrap();

    const runWalls = () => {
      if (activeConfig.blockAdblockers) checkAdblock();
      if (activeConfig.blockVpns) checkVPN();
      if (activeConfig.blockIncognito) checkIncognito();
      if (activeConfig.maxTasksDaily > 0) checkDailyTasks();
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", runWalls);
    else runWalls();
    
    return {
       validateTime: window.CryptoricGuard?.validateCompletionTime || (() => true),
       getHWID: generateHWID,
       version: GUARD_VERSION
    };
  }

  window.CryptoricGuard = { init: initialize };
})();
