# Live Example (Linkvertise)

We have built a fully functional, live demonstration of Cryptoric Guard protecting a Linkvertise "Get Key" flow!

### Try It Live!
The demo is hosted directly on this site. Click the button below to open the live demo in a new tab!

<a href="demo/index.html" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #58a6ff; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">Open Live Demo メ</a>

### What it does
1. Provides a beautiful user interface to paste your Linkvertise Publisher ID.
2. Simulates a redirect flow.
3. Automatically generates Hardware Fingerprints (HWID) and Cryptographic signatures.
4. **The Magic:** If you open your browser's Network Tab while running the demo, you will see the `X-Cryptoric-Signature` and `X-Cryptoric-HWIDl headers being dynamically attached to the final API request!