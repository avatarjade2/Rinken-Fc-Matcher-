let lagData = [];
let nuvarandeIndex = 0;

async function laddaAllt() {
    const url = "https://script.google.com/macros/s/AKfycbxS3rXlLXfCO3Co1iwQJtu6l3L_6rVWbQiImAKrkdJhJUQ2eRBoXzxNNvoy8cU7j5-c/exec?action=matcher";
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        lagData = data.lag;
        
        if (lagData.length > 0) {
            uppdateraSidan();
            visaStatus("System Online", true);
        } else {
            visaStatus("Ingen data hittad", false);
        }
    } catch (error) {
        console.error("Kunde inte hämta data:", error);
        visaStatus("Anslutningsfel", false);
    }
}

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    
    // Uppdatera lagnamn
    document.getElementById('lag-namn').innerText = lag.namn;
    
    // Uppdatera iframe med widget-URL
    const iframe = document.getElementById('match-widget');
    iframe.src = lag.widgetUrl;
}

function nastaLag() {
    if (lagData.length > 0) {
        nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length;
        uppdateraSidan();
    }
}

function forraLag() {
    if (lagData.length > 0) {
        nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length;
        uppdateraSidan();
    }
}

function visaStatus(text, isOnline) {
    const statusText = document.getElementById('status-text');
    const statusPulse = document.getElementById('status-pulse');
    const statusContainer = document.getElementById('system-status');
    
    statusText.innerText = text;
    
    if (isOnline) {
        statusPulse.className = 'pulse pulse-green';
        statusContainer.classList.add('is-live');
    } else {
        statusPulse.className = 'pulse pulse-red';
        statusContainer.classList.remove('is-live');
    }
}

// Läs in allt när DOM är klar
document.addEventListener('DOMContentLoaded', laddaAllt);
