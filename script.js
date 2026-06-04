let lagData = [];
let nuvarandeIndex = 0;
let instaLink = "";

async function laddaAllt() {
    const url = "https://script.google.com/macros/s/AKfycbxS3rXlLXfCO3Co1iwQJtu6l3L_6rVWbQiImAKrkdJhJUQ2eRBoXzxNNvoy8cU7j5-c/exec?action=matcher";
    
    try {
        console.log("Hämtar data från Google Apps Script...");
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Data mottagen:", data);
        
        // Hämta Instagram-länken (från insta-fältet)
        instaLink = data.insta || "";
        console.log("Instagram-länk:", instaLink);
        
        lagData = data.lag || [];
        
        if (lagData.length > 0) {
            console.log(`${lagData.length} lag hittade!`);
            uppdateraSidan();
            visaStatus("System Online", true);
            setupAnimations();
        } else {
            console.warn("Ingen lag-data hittad");
            visaStatus("Ingen data hittad", false);
        }
    } catch (error) {
        console.error("Kunde inte hämta data:", error);
        visaStatus("Anslutningsfel", false);
    }
}

function uppdateraSidan() {
    if (lagData.length === 0) {
        console.warn("Ingen data att uppdatera");
        return;
    }
    
    const lag = lagData[nuvarandeIndex];
    console.log("Uppdaterar sida för lag:", lag);
    
    // Uppdatera lagnamn
    const lagNamnEl = document.getElementById('lag-namn');
    if (lagNamnEl) {
        lagNamnEl.innerText = lag.namn || "Okänt lag";
    }
    
    // Uppdatera widget-iframe
    uppdateraWidget(lag.widgetUrl);
    
    // Uppdatera Instagram-embed
    uppdateraInstagram();
}

function uppdateraWidget(widgetUrl) {
    const iframe = document.getElementById('match-widget');
    
    if (!iframe || !widgetUrl) {
        console.error("Kunde inte uppdatera iframe - widgetUrl saknas eller iframe finns inte");
        return;
    }
    
    console.log("Uppdaterar widget med URL:", widgetUrl);
    
    // Injicera widget via srcdoc med HTML-wrapper
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            iframe { width: 100%; height: 100vh; border: none; display: block; }
        </style>
    </head>
    <body>
        <iframe src="${widgetUrl}" style="width: 100%; height: 100%; border: none;"></iframe>
    </body>
    </html>
    `;
    
    iframe.srcdoc = htmlContent;
    iframe.src = ""; // Rensa src för att använda srcdoc
}

function uppdateraInstagram() {
    const container = document.getElementById('instagram-container');
    
    if (!instaLink) {
        console.warn("Ingen Instagram-länk tillgänglig");
        container.innerHTML = '<p style="text-align: center; color: #64748b;">Ingen Instagram-länk konfigurerad</p>';
        return;
    }
    
    console.log("Uppdaterar Instagram med:", instaLink);
    
    // Rensa och lägg till Instagram-embed
    container.innerHTML = '';
    
    // Skapa blockquote för Instagram embed
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'instagram-media';
    blockquote.setAttribute('data-instgrm-permalink', instaLink);
    blockquote.setAttribute('data-instgrm-version', '14');
    
    container.appendChild(blockquote);
    
    // Kör Instagram embed-scriptet på nytt för att ladda embeds
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    }
}

function nastaLag() {
    if (lagData.length > 0) {
        nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length;
        console.log("Nästa lag, index:", nuvarandeIndex);
        uppdateraSidan();
    }
}

function forraLag() {
    if (lagData.length > 0) {
        nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length;
        console.log("Föregående lag, index:", nuvarandeIndex);
        uppdateraSidan();
    }
}

function visaStatus(text, isOnline) {
    const statusText = document.getElementById('status-text');
    const statusPulse = document.getElementById('status-pulse');
    const statusContainer = document.getElementById('system-status');
    
    if (statusText) statusText.innerText = text;
    
    if (statusPulse) {
        if (isOnline) {
            statusPulse.className = 'pulse pulse-green';
        } else {
            statusPulse.className = 'pulse pulse-red';
        }
    }
    
    if (statusContainer) {
        if (isOnline) {
            statusContainer.classList.add('is-live');
        } else {
            statusContainer.classList.remove('is-live');
        }
    }
    
    console.log(`Status: ${text} (${isOnline ? 'Online' : 'Offline'})`);
}

function setupAnimations() {
    try {
        // Intersection Observer för scroll-animationer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        const elementsToAnimate = document.querySelectorAll('.reveal-up, .reveal-scale');
        console.log(`Sätter upp animationer för ${elementsToAnimate.length} element`);
        
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    } catch (animError) {
        console.error("Fel vid setup av animationer:", animError);
    }
}

// Läs in allt när DOM är klar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM innehål laddat!");
        laddaAllt();
    });
} else {
    console.log("DOM redan laddat, startar laddning...");
    laddaAllt();
}
