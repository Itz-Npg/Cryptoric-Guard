# Configuration

Every protection module in Cryptoric Guard can be toggled using the initialization config object. 

### Core Security
- **botLockdown**: Blocks headless browsers like Puppeteer and Selenium.

### Bypass Traps
- **refererTrapping**: Enforces strict origin validation to stop direct hotlinking.
- **unicodeTrap**: Detects invisible zero-width characters in the URL injected by bypass extensions.
- **userscriptDetection**: Blocks Tampermonkey/Violentmonkey script APIs from accessing the page.
- **spoofTrap**: Generates fake hidden endpoints to catch and ban auto-clicker bots.

### Aggressive Walls
- **blockVpns**: Analyzes the browser timezone offset against the locale to detect cheap VPN routing.
- **blockAdblockers**: Injects fake ad containers and throws an alert if they fail to render.
- **blockIncognito**: Blocks users from hiding their identity in private browsing sessions.
- **maxTasksDaily**: Local storage rate-limiting to prevent task farming (e.g., set to 1).