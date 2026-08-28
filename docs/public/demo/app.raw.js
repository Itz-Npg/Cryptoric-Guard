const terminal = document.getElementById('terminal');
function log(msg, isError = false) {
    const div = document.createElement('div');
    div.innerText = '> ' + msg;
    if(isError) div.style.color = '#ff5f56';
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

let pubId = localStorage.getItem('__xPub') || "523671";
let maxCheckpoints = parseInt(localStorage.getItem('__xMax') || "3");
let currentCheckpoint = parseInt(localStorage.getItem('__xCur') || "0");

const guard = window.CryptoricGuard.init({
    botLockdown: true,
    blockAdblockers: true,
    minTaskTimeSeconds: 0
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const incomingCheckpoint = urlParams.get('checkpoint');

    document.getElementById('publisherId').value = pubId;
    document.getElementById('maxCheckpoints').value = maxCheckpoints;

    if (incomingCheckpoint) {
        log("User returned from Linkvertise to Checkpoint " + incomingCheckpoint);
        
        const taskStart = parseInt(sessionStorage.getItem('__xStart') || "0");
        const elapsed = (Date.now() - taskStart) / 1000;
        
        // Advanced Anti-Bypass Referer Trapping (Defeats F.E.A.R & LootLabs bypassers)
        const ref = document.referrer.toLowerCase();
        
        // 1. If they come from linkvertise, it MUST contain our publisher ID.
        // F.E.A.R redirects from linkvertise.com/cdn-cgi/trace (missing pubId) -> BLOCKED
        const isFromLinkvertise = ref.includes("linkvertise.com") || ref.includes("link-to.net");
        const hasPubId = ref.includes(pubId.toLowerCase());
        
        let isValidRef = true;
        if (isFromLinkvertise && !hasPubId) {
            isValidRef = false; // Block F.E.A.R spoofed referers
        }
        
        // 2. Block known bypasser domains explicitly
        if (ref.includes("trw.lat") || ref.includes("rip.linkvertise.lol") || ref.includes("bypass")) {
            isValidRef = false;
        }

        if (taskStart === 0 || elapsed < 5 || !isValidRef) {
            log("Invalid session signature or token expired. Please try again.", true);
            currentCheckpoint = 0;
            localStorage.setItem('__xCur', "0");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            log("Cryptoric Signature Validated!");
            const targetCP = parseInt(incomingCheckpoint);
            if(targetCP === currentCheckpoint + 1) {
                currentCheckpoint = targetCP;
                localStorage.setItem('__xCur', currentCheckpoint.toString());
                log("Checkpoint " + currentCheckpoint + " completed successfully!");
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    if (localStorage.getItem('__xConf') === 'true') {
        injectLinkvertiseScript();
        showProgressUI();
    }
});

document.getElementById('saveConfigBtn').addEventListener('click', () => {
    pubId = document.getElementById('publisherId').value;
    maxCheckpoints = parseInt(document.getElementById('maxCheckpoints').value);
    
    if(!pubId || !maxCheckpoints) return alert("Fill out the full config!");
    
    localStorage.setItem('__xPub', pubId);
    localStorage.setItem('__xMax', maxCheckpoints.toString());
    localStorage.setItem('__xConf', 'true');
    localStorage.setItem('__xCur', "0");
    currentCheckpoint = 0;
    
    log("Configuration Saved. Publisher ID: " + pubId);
    injectLinkvertiseScript();
    showProgressUI();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    localStorage.removeItem('__xConf');
    localStorage.setItem('__xCur', "0");
    window.location.reload();
});

function injectLinkvertiseScript() {
    if (document.getElementById('lvScript')) return;
    
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
    
    let base64Return = btoa(returnUrl);
    
    const randomSeed = Math.floor(Math.random() * 1000); 
    const token = Math.random().toString(36).substr(2); 
    
    const linkvertiseUrl = "https://link-to.net/" + pubId + "/" + randomSeed + "/dynamic/?_r=" + token + "&r=" + base64Return;
    
    log("Starting Checkpoint " + targetCheckpoint + "...");
    log("Target URL: " + linkvertiseUrl);
    
    sessionStorage.setItem('__xStart', Date.now().toString());
    
    setTimeout(() => {
        window.location.href = linkvertiseUrl;
    }, 1500);
}
