// Globala variabler
let lagData = []; 
let nuvarandeIndex = 0;
let countdownInterval;

// 1. HÄMTA DATA FRÅN GOOGLE SHEETS
async function laddaAllt() {
    const url = "https://script.google.com/macros/s/AKfycby6J9yzjMNH6sC1S-C3vcOOnnHtmeIqkcAxAvo2fUOeIouJBbTPTYierdzqI7WV_tVy/exec?action=matcher";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Här mappar vi om datan från Google till ditt format
        // Vi lägger till en tom "matcher"-array för att din logik ska fungera
        lagData = data.lag.map(lag => ({
            namn: lag.namn,
            widgetSrc: lag.scriptTag.match(/src="([^"]*)"/)[1], // Extraherar URL från <script src="...">
            matcher: [] // OBS: Om du vill ha automatiska matcher senare lägger vi till logik här
        }));

        if (lagData.length > 0) {
            nuvarandeIndex = hittaNarmasteLagIndex();
            uppdateraSidan();
            setTimeout(initieraAnimationer, 100);
        }
    } catch (error) {
        console.error("Kunde inte hämta data:", error);
    }
}

// ... Behåll dina funktioner: finnNastaMatchForLag, hittaNarmasteLagIndex, nastaLag, forraLag ...
// ... Behåll uppdateraLiveStatus, startaNedrakning, hamtaVader, initieraAnimationer ...

// 2. DIN UPPDATERADE uppdateraSidan()
function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    document.getElementById('lag-namn').innerText = lag.namn;
    
    // Om du har match-logik (nedräkning) krävs match-data i objektet.
    // Här använder vi din befintliga iframe-logik:
    const srcDocContent = `
        <html lang="sv">
        <head><style>body { margin: 0; padding: 0; background-color: transparent; }</style></head>
        <body><script src="${lag.widgetSrc}"></script></body>
        </html>
    `;
    document.getElementById('match-widget').srcdoc = srcDocContent;

    // Om match-logik saknas för de nya lagen, dölj nedräkning eller sätt standard
    // (Behåll din kod här för att uppdatera badge/färg)
    triggersAnimations();
}

// Starta allt
document.addEventListener('DOMContentLoaded', () => {
    laddaAllt();
    hamtaVader();
});
