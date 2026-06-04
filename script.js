let lagData = [];
let nuvarandeIndex = 0;

async function laddaAllt() {
    const url = "https://script.google.com/macros/s/AKfycby6J9yzjMNH6sC1S-C3vcOOnnHtmeIqkcAxAvo2fUOeIouJBbTPTYierdzqI7WV_tVy/exec?action=matcher";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        lagData = data.lag;
        
        if (lagData.length > 0) {
            uppdateraSidan();
        }
    } catch (error) {
        console.error("Kunde inte hämta data:", error);
    }
}

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    document.getElementById('lag-namn').innerText = lag.namn;
    
    const iframe = document.getElementById('match-widget');
    // Extrahera src-url från script-taggen
    const match = lag.scriptTag.match(/src="([^"]*)"/);
    if (match) {
        iframe.srcdoc = `<html><body style="margin:0;"><script src="${match[1]}"></script></body></html>`;
    }
}

function nastaLag() {
    nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length;
    uppdateraSidan();
}

function forraLag() {
    nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length;
    uppdateraSidan();
}

document.addEventListener('DOMContentLoaded', laddaAllt);
