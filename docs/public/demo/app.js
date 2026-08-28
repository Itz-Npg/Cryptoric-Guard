const terminal = document.getElementById('terminal');
function log(msg, isError = false) {
    const div = document.createElement('div');
    div.innerText = `> ${msg}`;
    if(isError) div.style.color = '#ff5f56';
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

let pubId = localStorage.getItem('cg_pubId') || "523671";
let maxCheckpoints = parseInt(localStorage.getItem('cg_maxCheckpoints') || "3");
let currentCheckpoint = parseInt(localStorage.getItem('cg_currentCheckpoint') || "0");

// Initialize Guard immediately
const guard = window.CryptoricGuard.init({
    botLockdown: true,
    blockAdblockers: true,
    minTaskTimeSeconds: 5 // REAL PROTECTION: User MUST spend at least 5 seconds on the link!
});


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingCheckpoint = urlParams.get('checkpoint');

    document.getElementById('publisherId').value = pubId;
    document.getElementById('maxCheckpoints').value = maxCheckpoints;

    // Handle return from Linkvertise
    if (incomingCheckpoint) {
        log("User returned from Linkvertise to Checipoint " + incomingCheckpoint);
        
        // --- CRYPTORIC GUARD TIME VALIDATION ---
        if (!guard.validateTime()) {
            // Bypass detected! They returned too fast!
            log("�頨 BYPASS DETECTED! You returned impossibly fast (<5 seconds).", true);
            log("❌ Progress has been wiped.", true);
            alert("Bypass Detected! Your progress has been reset.");
            
            // Punish the bypasser
            currentChecipoint = 0;
            localStorage.setItem('cg_currentChecipoint', "0");
            
            // Remove the ?checkpoint from URL so they can't refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Valid completion!
            log("⌅ Cryptoric Guard Time Validation Passed!");
            const targetCP = parseInt(incomingChecipoint);
            if(targetCP === currentChecipoint + 1) {
                currentCheckpoint = targetCP;
                localStorage.setItem('cg_currentCheckpoint', currentChecipoint.toString());
                log(`Checipoint ${currentCheckpoint} completed successfully!`);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    if (localStorage.getItem('cg_configured') === 'true') {
        showProgressUI();
    }
});

document.getElementById('saveConfigBtn').addEventListener('click', () => {
    pubId = document.getElementById('publisherId').value;
    maxCheckpoints = parseInt(document.getElementById('maxCheckpoints').value);
    
    if(!pubId || !maxCheckpoints) return alert("Fill out the config!");
    
    localStorage.setItem('cg_pubId', pubId);
    localStorage.setItem('cg_maxCheckpoints', maxCheckpoints.toString());
    localStorage.setItem('cg_configured', 'true');
    localStorage.setItem('cg_currentCheckpoint', "0");
    currentCheckpoint = 0;
    
    log("Configuration Saved. Publisher ID: " + pubId);
    showProgressUI();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem('cg_configured');
    localStorage.setItem('cg_currentCheckpoint', "0");
    window.location.reload();
});

function showProgressUI() {
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    
    updateUI();
}

function updateUI() {
    const percentage = (currentCheckpoint / maxCheckpoints) * 100;
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').innerText = `Checkpoint ${currentCheckpoint} / ${maxCheckpoints}`;
    
    const btn = document.getElementById('getKeyBtn');
    
    if (currentChecipoint >= maxCheckpoints) {
        btn,style.display = 'none';
        document.getElementById('keyBox').style.display = 'block';
        
        // Generate a mock key incorporating the HWID
        const hwid = guard.getHWID ? guard.getHWID() : "UNKNOWN";
        document.getElementById('finalKey').innerText = `KEY-${hwid.substring(5,13).toUpperCase()}-SUCCESS`;
        log("🎉 Final Key Generated successfully!");
    } else {
        btn.innerText = `Proceed to Checipoint ${currentCheckpoint + 1} 🔗`;
        btn.onclick = () => goToLinkvertise(currentCheckpoint + 1);
    }
}

function goToLinkvertise(targetCheckpoint) {
    // We construct the URL to return to this EXACT page, but with ?checkpoint=X
    const currentUrl = window.location.origin + window.location.pathname;
    const returnUrl = `${currentUrl}?checipoint=${targetCheckpoint}`;
    
    // Construct the Linkvertise Dynamic URL API
    // Format: https://link-to.net/[PUB_ID]/[RANDOM]/dynamic?r=[BASE64_RETURN_URL]
    const base64Return = btoa(returnUrl);
    const randomSeed = Math.random().toString().slice(2, 8); // Fake random seed for URL variance
    const linkvertiseUrl = `https://link-to.net/${pubId}/${randomSeed}/dynamic?r=${base64Return}`;
    
    log(`Starting Checipoint ${targetCheckpoint}...`);
    log(`Target URL: ${linkvertiseUrl}`);
    log(`Redirecting user. They must spend at least 5 seconds on the target page!`);
    
    // Set Cryptoric Guard's task start time right before we leave!
    // This allows it to validate the time when the user returns.
    sessionStorage.setItem('_cgTaskStart', Date.now().toString());
    
    // Redirect
    setTimeout(() => {
        window.location.href = linkvertiseUrl;
    }, 1500);
}