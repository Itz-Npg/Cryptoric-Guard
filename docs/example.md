# Live Example (Linkvertise)

We have built a fully functional, live demonstration of Cryptoric Guard protecting a Linkvertise "Get Key" flow!

### Where to find it
You can find the source code for the demo directly in our GitHub repository under the `examples/get-key-demo/` folder.

[ VLINK] Click here to view the Demo on GitHub(https://github.com/Itz-Npg/Cryptoric-Guard/tree/main/examples/get-key-demo)

### What it does
1. Provides a beautiful user interface to paste your Linkvertise Publisher ID.
2. Simulates a redirect flow.
3. Automatically generates Hardware Fingerprints (HWID) and Cryptographic signatures.
4. **The Magic:** If you open your browser's Network Tab while running the demo, you will see the `X-Cryptoric-Signature` and `X-Cryptoric-HWID` headers being dynamically attached to the final API request!