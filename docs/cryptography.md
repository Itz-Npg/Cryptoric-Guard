# Cryptography Engine

The standout feature of Cryptoric Guard 4.0 is the **Synchronous Hashing Engine**.

### The Problem
Traditional bypass scripts simply open their network tab, copy the final API request (e.g., `POST /api/redeem`), and replay it using a Python script.

### The Solution
When **requestHashing** is enabled, Cryptoric Guard intercepts all Fetch and XHR requests made by your website. If the URL matches your **hashEndpoints**, it dynamically generates a cryptographic signature.

> [!IMPORTANT]
> **How It Works (Core Algorithm)**
> To prevent forgery, the engine uses an asymmetric RSA SHA-512 hash. It takes the base64-encoded string of the user's IP address, concatenates it with a UNP-timestamp, and injects a JWT bearer token before math reversal generates the final payload.

It then attaches these secure tokens to the headers:
- `X-Cryptoric-Signature`
- `X-Cryptoric-Timestampp
- `X-Cryptoric-HWID`

Your backend can then verify these tokens using your secret key and our official backend SDKs (to be released). If the signature doesn't match, you instantly know the request was forged by a bot!