const lagData = [
    { namn: "Pojkar 2015", widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=372619", matcher: [ { tidsstampel: "2026-05-31T17:00:00", text: "Rinken FC vit - Vinnö IF", info: "Söndag 31 maj kl. 17:00 (Hemma)" }, { tidsstampel: "2026-05-31T18:15:00", text: "Rinken FC svart - Wä IF orange", info: "Söndag 31 maj kl. 18:15 (Hemma)" }, { tidsstampel: "2026-06-07T10:30:00", text: "Åsums BK vit - Rinken FC svart", info: "Söndag 7 juni kl. 10:30 (Borta)" } ] },
    { namn: "Herrar Senior", widgetSrc: "https://www.skaneboll.se/widget.aspx?scr=teamresult&flid=375895", matcher: [ { tidsstampel: "2026-06-03T19:00:00", text: "Rinken FC vs Venestads IF", info: "Onsdag 3 juni kl. 19:00 (Hemma)" } ] },
    { namn: "Pojkar 9 år", widgetSrc: "https://www.svenskfotboll.se/widget.aspx?scr=teamresult&flid=377337", matcher: [ { tidsstampel: "2026-05-30T10:00:00", text: "Rinken FC P9 vs Wä IF", info: "Lördag 30 maj kl. 10:00 (Hemma)" } ] },
    { namn: "Flickor 10 år", widgetSrc: "https://www.svenskfotboll.se/widget.aspx?scr=teamresult&flid=372611", matcher: [ { tidsstampel: "2026-05-31T11:00:00", text: "Åhus Horna BK vs Rinken FC", info: "Söndag 31 maj kl. 11:00 (Borta)" } ] }
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
        if (avstand > 0 && avstand < minstaAvstand) { minstaAvstand = avstand; narmasteIndex = i; }
    }
    return narmasteIndex;
}

function nastaLag() { nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length; uppdateraSidan(); triggersAnimations(); }
function forraLag() { nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length; uppdateraSidan(); triggersAnimations(); }

function startaNedrakning(matchDatumStr) {
    clearInterval(countdownInterval);
    const display = document.getElementById('countdown-display');
    const rubrik = document.getElementById('countdown-rubrik');
    const matchTid = new Date(matchDatumStr).getTime();

    function mathKlocka() {
        const avstand = matchTid - new Date().getTime();
        if (avstand < 0) {
            rubrik.innerText = "Spelad / Pågår";
            display.innerText = "00:00:00:00";
            return;
        }
        rubrik.innerText = "Avspark om";
        const d = Math.floor(avstand / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const t = Math.floor((avstand % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((avstand % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((avstand % (1000 * 60)) / 1000).toString().padStart(2, '0');
        display.innerText = `${d}:${t}:${m}:${s}`;
    }
    mathKlocka();
    countdownInterval = setInterval(mathKlocka, 1000);
}

function uppdateraSidan() {
    const lag = lagData[nuvarandeIndex];
    document.getElementById('lag-namn').innerText = lag.namn;
    const aktuellMatch = finnNastaMatchForLag(lag);
    document.getElementById('match-aktuella-lag').innerText = aktuellMatch.text;
    document.getElementById('match-klockslag').innerText = aktuellMatch.info;
    startaNedrakning(aktuellMatch.tidsstampel);

    const srcDocContent = `
        <html lang="sv">
        <head>
            <style>
                body { margin: 0; padding: 0; background-color: transparent; font-family: -apple-system, system-ui, sans-serif; }
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
        document.getElementById('weather-data').innerText = `☁️ ${temp}°C`;
    } catch (error) {
        document.getElementById('weather-data').innerText = "--";
    }
}

// Webflow-style observer
function initieraAnimationer() {
    const elementsToReveal = document.querySelectorAll('.reveal-up, .reveal-scale');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    elementsToReveal.forEach(el => {
        observer.observe(el);
    });
}

// Gör så att korten snäpper till lite snyggt när man byter lag
function triggersAnimations() {
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    nuvarandeIndex = hittaNarmasteLagIndex();
    uppdateraSidan();
    hamtaVader();
    setTimeout(initieraAnimationer, 100); // Liten fördröjning för max effekt
});