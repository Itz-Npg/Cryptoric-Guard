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
    minTaskTimeSeconds: 0 // We handle the time validation silently in app.js now
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingCheckpoint = urlParams.get('checkpoint');

    document.getElementById('publisherId').value = pubId;
    document.getElementById('maxCheckpoints').value = maxCheckpoints;

    if (incomingCheckpoint) {
        log("User returned from Linkvertise to Checkpoint " + incomingCheckpoint);
        
        // --- SILENT TIME VALIDATION ---
        const taskStart = parseInt(sessionStorage.getItem('_cgTaskStart') || "0");
        const elapsed = (Date.now() - taskStart) / 1000;
        
        if (elapsed < 5 && taskStart !== 0) {
            // Bypass detected! They returned too fast!
            // SILENT PUNISHMENT
            log("Invalid session signature or token expired. Please try again.", true);
            
            // Punish the bypasser by silently wiping their progress
            currentCheckpoint = 0;
            localStorage.setItem('cg_currentCheckpoint', "0");
            
            // Remove the ?checkpoint from URL so they can't refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Valid completion!
            log("Cryptoric Signature Validated!");
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
        injectLinkvertiseScript();
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
    injectLinkvertiseScript();
    showProgressUI();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem('cg_configured');
    localStorage.setItem('cg_currentCheckpoint', "0");
    window.location.reload();
});

function injectLinkvertiseScript() {
    if (document.getElementById('lvScript')) return; // Already injected
    
    log("Injecting Linkvertise Full Script API into page...");
    
    const script = document.createElement('script');
    script.src = "https://publisher.linkvertise.com/cdn/linkvertise.js";
    script.id = "lvScript";
    script.onload = () => {
        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = "linkvertise(" + pubId + ", {whitelist: [], blacklist: []});";
        document.head.appendChild(inlineScript);
        log("Linkvertise API successfully loaded.");
    };
    document.head.appendChild(script);
}

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
    
    const randomSeed = Math.floor(Math.random() * 1000); 
    const token = Math.random().toString(36).substr(2); 
    
    const linkvertiseUrl = "https://link-to.net/" + pubId + "/" + randomSeed + "/dynamic/?_r=" + token + "&r=" + base64Return;
    
    log("Starting Checkpoint " + targetCheckpoint + "...");
    log("Target URL: " + linkvertiseUrl);
    
    sessionStorage.setItem('_cgTaskStart', Date.now().toString());
    
    setTimeout(() => {
        window.location.href = linkvertiseUrl;
    }, 1500);
}
