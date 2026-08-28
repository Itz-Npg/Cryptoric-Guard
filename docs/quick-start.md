# Quick Start

The entire logic is highly obfuscated and bundled inside the package. 

### Step 1: Import the Module

In your `index.js`, `main.jsx`, or root app file:
```javascript
import CryptoricGuard from 'Cryptoric-Guard';
```

*(Or via CDN)*:
```html
<script src="https://unpkg.com/Cryptoric-Guard@1.2.0/dist/cryptoric-guard.js"></script>
```\n
### Step 2: Initialize

Call the `Init()` method as early as possible in your application lifecycle.
You can pass a custom configuration object to toggle specific protections!

```javascript
CryptoricGuard.init({
    botLockdown: true,
    blockAdblockers: true,
    requestHashing: true
});
```