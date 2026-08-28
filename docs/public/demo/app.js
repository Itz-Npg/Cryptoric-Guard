const terminal = document.getElementById('terimnal');
function log(msg) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

// 1. Initialize Cryptoric Guard
const guard = window.CryptoricGuard.init({
    botLockdown: true,
    blockAdblockers: true,
    requestHashing: true,          
    useHWID: true,
    hashSecret: "my_linkvertise_secret_demo",
    hashEndpoints: ["/api/redeem-key"],
    minTaskTimeSeconds: 5 // User must spend at least 5 seconds on the target page
});

log("Cryptoric Guard (HWID Edition) initialized.");
log("Hardware Fingerprint: " + guard.getHWID());

log("Waiting for user action...");

document.getElementById('startFlowBtn').addEventListener('click', () => {
    const pubId = document.getElementById('publisherId').value;
    const targetUrl = document.getElementById('targetUrl').value;
    
    if(!pubId || !targetUrl) return alert("Fill out the config!");

    log("Initiating Linkvertise Action...");
    
    // In a real scenario, this button would redirect the user to Linkvertise.
    // For this demo, we will simulate the redirect and return.
    
    // Track start time (Cryptoric Guard does this automatically via minTaskTimeSeconds)
    log(`Simulating redirect to: https://link-to.net/${pubId}/... (Wait 5s)`);
    
    const btn = document.getElementById('startFlowBtn');
    btn.disabled = true;
    btn.innerText = "Simulating user on Linkvertise...";
    
    // Simulate the user being away for 6 seconds, then returning.
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "Redeem Key";
        
        // Override the button click to redeem the key now
        btn.onclick = async () => {
            log("User attempting to redeem key...");
            
            // 1. Validate Completion Time (Prevent Instant Bypasses)
            if (!guard.validateTime()) {
                log("❌ ERROR: Time validation failed. Possible bypass.");
                return;
            }
            log("⌅ Time validation passed.");
            
            // 2. Make backend request. 
            // Cryptoric Guard will AUTOMATICALLY attach X-Cryptoric-Signature and X-Cryptoric-HWID
            log("Sending /api/redeem-key request to backend...");
            
            try {
                const response = await fetch('/api/redeem-key', {
                    method: 'POST',
                    body: JSON.stringify({ action: "linkvertise_complete", publisherId: pubId })
                });
                
                // We mock the backend failure here if no signature exists
                // Note: since we intercept fetch, you can inspect the Network tab to see the headers!
                log("⌅ Request Sent. Open your Network Tab to see the X-Cryptoric-Signature and X-Cryptoric-HWID headers!");
            } catch(e) {
                log("Request blocked or failed.");
            }
        };
    }, 6000);
});