const terminal = document.getElementById('terminal');
function log(msg, isError = false) {
    const div = document.createElement('div');
    div.innerText = '> ' + msg;
    if(isError) div.style.color = '#ff5f56';
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

let pubId = localStorage.getItem('cg_pubId') || "523671";
let maxCheckpoints = parseInt(localStorage.getItem('cg_maxCheckpoints') || "3");
let currentCheckpoint = parseInt(localStorage.getItem('cg_currentCheckpoint') || "0");

const guard = window.CryptoricGuard.init({
    botLockdown: true,
    blockAdblockers: true,
    minTaskTimeSeconds: 5
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingCheckpoint = urlParams.get('checkpoint');

    document.getElementById('publisherId').value = pubId;
    document.getElementById('maxCheckpoints').value = maxCheckpoints;

    if (incomingCheckpoint) {
        log("User returned from Linkvertise to Checkpoint " + incomingCheckpoint);
        
        if (!guard.validateTime()) {
            log("🚨 BYPASS DETECTED! You returned impossibly fast (<5 seconds).", true);
            log("❌ Progress has been wiped.", true);
            alert("Bypass Detected! Your progress has been reset.");
            
            currentCheckpoint = 0;
            localStorage.setItem('cg_currentCheckpoint', "0");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            log("✅ Cryptoric Guard Time Validation Passed!");
            const targetCP = parseInt(incomingCheckpoint);
            if(targetCP === currentCheckpoint + 1) {
                currentCheckpoint = targetCP;
                localStorage.setItem('cg_currentCheckpoint', currentCheckpoint.toString());
                log("Checkpoint " + currentCheckpoint + " completed successfully!");
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
    
    if(!pubId || !maxCheckpoints) return alert("Fill out the full config!");
    
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
    document.getElementById('progressBar').style.width = percentage + "%";
    document.getElementById('progressText').innerText = "Checkpoint " + currentCheckpoint + " / " + maxCheckpoints;
    
    const btn = document.getElementById('getKeyBtn');
    
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    if (currentCheckpoint >= maxCheckpoints) {
        newBtn.style.display = 'none';
        document.getElementById('keyBox').style.display = 'block';
        
        const hwid = guard.getHWID ? guard.getHWID() : "UNKNOWN";
        document.getElementById('finalKey').innerText = "KEY-" + hwid.substring(5,13).toUpperCase() + "-SUCCESS";
        log("🎉 Final Key Generated successfully!");
    } else {
        newBtn.innerText = "Proceed to Checkpoint " + (currentCheckpoint + 1) + " 🔗";
        newBtn.addEventListener('click', () => goToLinkvertise(currentCheckpoint + 1));
    }
}

function goToLinkvertise(targetCheckpoint) {
    const currentUrl = window.location.origin + window.location.pathname;
    const returnUrl = currentUrl + "?checkpoint=" + targetCheckpoint;
    
    // EXACT SAME APPROACH AS CRYPTORIC AUTH:
    let base64Return = btoa(returnUrl);
    
    // Use the exact same formatting as Cryptoric Auth revenue_utils.php (trailing slash before query!)
    const randomSeed = Math.floor(Math.random() * 1000); // Same as mt_rand(1, 1000)
    const token = Math.random().toString(36).substr(2); // Fake token for _r parameter
    
    const linkvertiseUrl = "https://link-to.net/" + pubId + "/" + randomSeed + "/dynamic/?_r=" + token + "&r=" + base64Return;
    
    log("Starting Checkpoint " + targetCheckpoint + "...");
    log("Target URL: " + linkvertiseUrl);
    log("Redirecting user. They must spend at least 5 seconds on the target page!");
    
    sessionStorage.setItem('_cgTaskStart', Date.now().toString());
    
    setTimeout(() => {
        window.location.href = linkvertiseUrl;
    }, 1500);
}
