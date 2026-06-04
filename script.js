// Konfiguration för Google Apps Script - Byt ut denna länk mot din riktiga
const API_URL = "DIN_URL_HÄR"; 

let lagData = [];
let nuvarandeIndex = 0;
let countdownInterval;

// Hämta data från Google
async function laddaData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        lagData = data.lag;
        nuvarandeIndex = hittaNarmasteLagIndex();
        uppdateraSidan();
        initieraAnimationer();
    } catch (err) {
        console.error("Kunde inte hämta data:", err);
    }
}

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    document.getElementById('lag-namn').innerText = lag.namn;
    
    // Uppdatera widget via srcdoc (säkert sätt)
    const iframe = document.getElementById('match-widget');
    iframe.srcdoc = `<html><body><script src="${lag.widgetSrc}"></script></body></html>`;

    // Uppdatera match-detaljer och nedräkning
    const aktuellMatch = finnNastaMatchForLag(lag);
    document.getElementById('match-aktuella-lag').innerText = aktuellMatch.text;
    document.getElementById('match-klockslag').innerText = aktuellMatch.info;
    startaNedrakning(aktuellMatch.tidsstampel);
}

function finnNastaMatchForLag(lag) {
    const nu = new Date().getTime();
    let framtidaMatcher = lag.matcher.filter(m => new Date(m.tidsstampel).getTime() > nu);
    framtidaMatcher.sort((a, b) => new Date(a.tidsstampel).getTime() - new Date(b.tidsstampel).getTime());
    return framtidaMatcher.length > 0 ? framtidaMatcher[0] : lag.matcher[lag.matcher.length - 1];
}

function startaNedrakning(matchDatumStr) {
    clearInterval(countdownInterval);
    const display = document.getElementById('countdown-display');
    const rubrik = document.getElementById('countdown-rubrik');
    const matchTid = new Date(matchDatumStr).getTime();

    function updateTimer() {
        const avstand = matchTid - new Date().getTime();
        if (avstand < 0) {
            rubrik.innerText = "Status";
            display.innerText = "Match spelad";
            return;
        }
        const d = Math.floor(avstand / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const t = Math.floor((avstand % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((avstand % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((avstand % (1000 * 60)) / 1000).toString().padStart(2, '0');
        display.innerText = `${d}:${t}:${m}:${s}`;
    }
    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
}

// Navigering
function nastaLag() { nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length; uppdateraSidan(); }
function forraLag() { nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length; uppdateraSidan(); }

// Animationer & Väder
async function hamtaVader() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.0465&longitude=14.1678&current_weather=true');
        const data = await res.json();
        document.getElementById('weather-data').innerText = `${Math.round(data.current_weather.temperature)}°C`;
    } catch (e) { document.getElementById('weather-data').innerText = "--°C"; }
}

function initieraAnimationer() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-revealed'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    laddaData();
    hamtaVader();
});
