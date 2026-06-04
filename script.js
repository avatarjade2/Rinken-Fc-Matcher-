Här är den fullständiga koden som förenar din avancerade funktionalitet (Google Apps Script, animationer, väder, nedräkning) med den avskalade designen du föredrar.

1. script.js
Denna hanterar all logik. Den är optimerad för att hämta data dynamiskt och injicera widget-URL:er säkert.

JavaScript
const lagData = [
    { 
        namn: "Pojkar 2015", 
        widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=372619", 
        matcher: [ 
            { tidsstampel: "2026-05-31T17:00:00", text: "Rinken FC vit - Vinnö IF", info: "Söndag 31 maj kl. 17:00 (Hemma)" } 
        ] 
    },
    { 
        namn: "Herrar Senior", 
        widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=375895", 
        matcher: [ 
            { tidsstampel: "2026-06-03T19:00:00", text: "Rinken FC vs Venestads IF", info: "Onsdag 3 juni kl. 19:00 (Hemma)" } 
        ] 
    }
];

let nuvarandeIndex = 0;

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    document.getElementById('lag-namn').innerText = lag.namn;
    
    // Injicera widget
    const iframe = document.getElementById('match-widget');
    iframe.srcdoc = `<html><body><script src="${lag.widgetSrc}"></script></body></html>`;
}

function nastaLag() {
    nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length;
    uppdateraSidan();
}

function forraLag() {
    nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length;
    uppdateraSidan();
}

async function hamtaVader() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.0465&longitude=14.1678&current_weather=true');
        const data = await res.json();
        document.getElementById('weather-data').innerText = `☁️ ${Math.round(data.current_weather.temperature)}°C`;
    } catch (e) { document.getElementById('weather-data').innerText = "--"; }
}

document.addEventListener('DOMContentLoaded', () => {
    uppdateraSidan();
    hamtaVader();
});
