const lagData = [
    { 
        namn: "Pojkar 2015", 
        widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=372619", 
        matcher: [ 
            { tidsstampel: "2026-05-31T17:00:00", text: "Rinken FC vit - Vinnö IF", info: "Säsongens första match" },
            { tidsstampel: "2026-06-07T17:00:00", text: "Rinken FC vit - Örby IF", info: "Hemmaplan" },
            { tidsstampel: "2026-06-14T19:00:00", text: "Veberöd IF - Rinken FC vit", info: "Borta" }
        ]
    },
    { 
        namn: "Herrar Senior", 
        widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=375895", 
        matcher: [ 
            { tidsstampel: "2026-06-03T19:00:00", text: "Rinken FC vs Venestads IF", info: "Serie-A match" },
            { tidsstampel: "2026-06-10T19:00:00", text: "Malmö FF U23 - Rinken FC", info: "Borta" },
            { tidsstampel: "2026-06-17T19:00:00", text: "Rinken FC vs Lund BK", info: "Hemmaplan" }
        ]
    },
    { 
        namn: "Pojkar 9 år", 
        widgetSrc: "https://www.svenskfotboll.se/widget.aspx?scr=teamresult&flid=377337", 
        matcher: [ 
            { tidsstampel: "2026-05-30T10:00:00", text: "Rinken FC P9 vs Wä IF", info: "Tränings- och cupmatcher" },
            { tidsstampel: "2026-06-06T10:00:00", text: "Åhus Horna BK vs Rinken FC P9", info: "Borta" },
            { tidsstampel: "2026-06-13T10:00:00", text: "Rinken FC P9 vs Bräkne-Hoby IF", info: "Hemmaplan" }
        ]
    },
    { 
        namn: "Flickor 10 år", 
        widgetSrc: "https://www.svenskfotboll.se/widget.aspx?scr=teamresult&flid=372611", 
        matcher: [ 
            { tidsstampel: "2026-05-31T11:00:00", text: "Åhus Horna BK vs Rinken FC", info: "Cupmatch" },
            { tidsstampel: "2026-06-07T11:00:00", text: "Rinken FC vs Wä IF", info: "Hemmaplan" },
            { tidsstampel: "2026-06-14T11:00:00", text: "Rinken FC vs Lund BK", info: "Hemmaplan" }
        ]
    }
];

let nuvarandeIndex = 0;
let countdownInterval;

function finnNastaMatchForLag(lag) {
    const nu = new Date().getTime();
    let framtidaMatcher = lag.matcher.filter(m => new Date(m.tidsstampel).getTime() > nu);
    framtidaMatcher.sort((a, b) => new Date(a.tidsstampel).getTime() - new Date(b.tidsstampel).getTime());
    return framtidaMatcher.length > 0 ? framtidaMatcher[0] : lag.matcher[lag.matcher.length - 1];
}

function hittaNarmasteLagIndex() {
    const nu = new Date().getTime();
    let narmasteIndex = 0;
    let minstaAvstand = Infinity;
    for (let i = 0; i < lagData.length; i++) {
        const nastaMatch = finnNastaMatchForLag(lagData[i]);
        const avstand = new Date(nastaMatch.tidsstampel).getTime() - nu;
        if (avstand > 0 && avstand < minstaAvstand) { 
            minstaAvstand = avstand; 
            narmasteIndex = i; 
        }
    }
    return narmasteIndex;
}

function nastaLag() { 
    nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length; 
    uppdateraSidan(); 
}

function forraLag() { 
    nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length; 
    uppdateraSidan(); 
}

function startaNedrakning(matchDatumStr) {
    clearInterval(countdownInterval);
    const display = document.getElementById('countdown-display-hero');
    const rubrik = document.getElementById('countdown-rubrik-hero');
    const matchTid = new Date(matchDatumStr).getTime();

    function mathKlocka() {
        const avstand = matchTid - new Date().getTime();
        if (avstand < 0) {
            rubrik.innerText = "Match pågår / Spelad";
            display.innerText = "00d 00t 00m 00s";
            return;
        }
        rubrik.innerText = "Avspark om";
        const d = Math.floor(avstand / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const t = Math.floor((avstand % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((avstand % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((avstand % (1000 * 60)) / 1000).toString().padStart(2, '0');
        display.innerText = `${d}d ${t}t ${m}m ${s}s`;
    }
    mathKlocka();
    countdownInterval = setInterval(mathKlocka, 1000);
}

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    
    // Update hero team name
    document.getElementById('lag-namn-hero').innerText = lag.namn;
    
    const aktuellMatch = finnNastaMatchForLag(lag);
    
    // Update hero match info
    document.getElementById('match-aktuella-lag-hero').innerText = aktuellMatch.text;
    document.getElementById('match-klockslag-hero').innerText = aktuellMatch.info;
    
    // Start countdown
    startaNedrakning(aktuellMatch.tidsstampel);

    // Update stats
    const totalMatches = lagData[nuvarandeIndex].matcher.length;
    document.getElementById('stat-matches').innerText = totalMatches;

    // Update widget with iframe content
    const srcDocContent = `
        <html lang="sv">
        <head>
            <style>
                body { margin: 0; padding: 5px; background-color: #ffffff; color: #1e293b; font-family: sans-serif; }
                table, td, th, tr { background-color: #ffffff !important; color: #1e293b !important; border-color: #e2e8f0 !important; }
                a { color: #e11d48 !important; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body><script type="text/javascript" src="${lag.widgetSrc}"><\/script></body>
        </html>
    `;
    document.getElementById('match-widget').srcdoc = srcDocContent;
}

async function hamtaVader() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=56.0465&longitude=14.1678&current_weather=true');
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        const vind = Math.round(data.current_weather.windspeed);
        document.getElementById('weather-data').innerText = `${temp}°C | Vind ${vind} m/s`;
    } catch (error) {
        document.getElementById('weather-data').innerText = "Kunde inte hämta väder";
    }
}

// Intersection Observer for scroll animations
function initieraAnimationer() {
    const reveals = document.querySelectorAll('.reveal-left, .reveal-right, .fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Element is in viewport, it already has animation via CSS
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    nuvarandeIndex = hittaNarmasteLagIndex();
    uppdateraSidan();
    hamtaVader();
    initieraAnimationer();
    
    // Refresh weather every 10 minutes
    setInterval(hamtaVader, 600000);
});
