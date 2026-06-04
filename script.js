let lagData = [];
let nuvarandeIndex = 0;
let instaLink = "";

async function laddaAllt() {
    const url = "https://script.google.com/macros/s/AKfycbxS3rXlLXfCO3Co1iwQJtu6l3L_6rVWbQiImAKrkdJhJUQ2eRBoXzxNNvoy8cU7j5-c/exec?action=matcher";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        instaLink = data.insta || "";
        lagData = data.lag || [];
        
        if (lagData.length > 0) {
            uppdateraSidan();
            visaStatus("System Online", true);
            setupAnimations();
        } else {
            visaStatus("Ingen data hittad", false);
        }
    } catch (error) {
        console.error("Kunde inte hämta data:", error);
        visaStatus("Anslutningsfel", false);
    }
}

function uppdateraSidan() {
    if (lagData.length === 0) return;
    const lag = lagData[nuvarandeIndex];
    
    // Uppdatera namn
    const lagNamnEl = document.getElementById('lag-namn');
    if (lagNamnEl) lagNamnEl.innerText = lag.namn || "Okänt lag";
    
    // Uppdatera widget via srcdoc för att undvika konflikter
    const widgetContainer = document.getElementById('widget-container');
    if (widgetContainer) {
        widgetContainer.innerHTML = `<iframe id="match-widget" srcdoc="<html><body style='margin:0;'><script src='${lag.widgetUrl}'></script></body></html>" style="width:100%; height:600px; border:none;"></iframe>`;
    }
    
    uppdateraInstagram();
}

function uppdateraInstagram() {
    const container = document.getElementById('instagram-container');
    if (!container) return;
    
    if (!instaLink) {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">Ingen Instagram-länk konfigurerad</p>';
        return;
    }
    
    container.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${instaLink}" data-instgrm-version="14" style="width:100%; border:0; margin:0;"></blockquote>`;
    
    // Ladda om Instagram-scriptet
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    }
}

// Navigering
function nastaLag() {
    nuvarandeIndex = (nuvarandeIndex + 1) % lagData.length;
    uppdateraSidan();
}

function forraLag() {
    nuvarandeIndex = (nuvarandeIndex - 1 + lagData.length) % lagData.length;
    uppdateraSidan();
}

// Status & Animationer
function visaStatus(text, isOnline) {
    const statusText = document.getElementById('status-text');
    const statusContainer = document.getElementById('system-status');
    if (statusText) statusText.innerText = text;
    if (statusContainer) {
        statusContainer.classList.toggle('is-live', isOnline);
    }
}

function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', laddaAllt);
