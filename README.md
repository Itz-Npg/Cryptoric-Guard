# Cryptoric Guard - The Ultimate Anti-Bypass Framework

Cryptoric Guard is a highly modular, advanced security system designed to protect endpoints, links, and content from automated bypasses, userscripts (F.E.A.R, FastForward), and tampering.

## Installation

### NPM (React, Next.js, Vite, etc.)
```bash
npm install cryptoric-guard
```

```javascript
import CryptoricGuard from "cryptoric-guard";
```

### CDN (Plain HTML/PHP)
```html
<script src="https://unpkg.com/cryptoric-guard@1.1.0/dist/cryptoric-guard.js"></script>
```

---

## Initialization & Configuration

Unlike traditional scripts, Cryptoric Guard allows you to **toggle specific modules** to match your exact security needs. 

Initialize the guard as early as possible in your application lifecycle.

```javascript
CryptoricGuard.init({
    // ===============================
    // CORE SECURITY
    // ===============================
    botLockdown: false,            // Blocks headless browsers (Puppeteer/Selenium)
    
    // ===============================
    // ANTI-BYPASS ENGINE
    // ===============================
    cryptoricGuard: true,          // Enables core DOM protection & anti-devtools
    deepEngine: false,             // Advanced traffic inspection (intercepts bypass XHRs)
    minTaskTimeSeconds: 0,         // Prevent instant task completion (e.g. set to 20)
    
    // ===============================
    // BYPASS TRAPS
    // ===============================
    refererTrapping: false,        // Strict document.referrer checks
    allowedReferrers: ["yoursite.com"], // Array of allowed referrers if refererTrapping is true
    unicodeTrap: false,            // Detect zero-width characters injected by bypass APIs
    userscriptDetection: true,     // Detect Tampermonkey/Greasemonkey APIs
    spoofTrap: false,              // Creates fake endpoints to bait auto-clickers
    
    // ===============================
    // AGGRESSIVE WALLS
    // ===============================
    blockVpns: false,              // Basic timezone mismatch heuristics
    blockAdblockers: false,        // Detect blocked ad elements (Brave Shields, uBlock)
    blockIncognito: false,         // Basic private browsing check
    maxTasksDaily: 0,              // Daily rate limiting per user (e.g. set to 1)

    // ===============================
    // CALLBACKS
    // ===============================
    onDetect: (reason) => {
        console.warn("Detection triggered:", reason);
        // You can send this to your backend analytics!
    }
});
```

## Security Notice
This repository contains the **clean, readable source code** inside the `src/` directory for developer reference. The code published to NPM inside the `dist/` folder is heavily obfuscated to prevent reverse-engineering.
