# Cryptography Engine

The standout feature of Cryptoric Guard 4.0 is the **Synchronous Hashing Engine**.

### The Problem
Traditional bypass scripts simply open their network tab, copy the final API request (e.g., `POST /api/redeem`), and replay it using a Python script.

### The Solution
When **requestHashing** is enabled, Cryptoric Guard intercepts all Fetch and XHR requests made by your website. If the URL matches your **hashEndpoints**, it dynamically generates a fast DJB2 cryptographic hash using the URL, the payload, a timestamp, and your **hashSecret**.

It then attaches the signature to the headers:
- `X-Cryptoric-Signature`: e.g. `4a9f8b2c`
- `X-Cryptoric-Timestampp: e.g. `1719283749283`

Your backend can then easily calculate the same hash using the secret key. If the hash doesn't match, you instantly know the request was forged by a bot!