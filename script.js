// Mock Dataset for Vadodara City Bus Routes
const busDatabase = [
    {
        busNo: "11-E",
        from: "Railway Station (Station Road)",
        to: "Makarpura GIDC",
        departure: "07:30 AM",
        arrival: "08:15 AM",
        frequency: "Every 15 mins",
        type: "Electric AC",
        stops: ["Railway Station", "Sayajigunj", "Akota", "Tarsali", "Makarpura GIDC"]
    },
    {
        busNo: "24",
        from: "Vadodara Central Bus Station (Pandya Bridge)",
        to: "Gotri Hospital",
        departure: "08:00 AM",
        arrival: "08:35 AM",
        frequency: "Every 20 mins",
        type: "Standard Non-AC",
        stops: ["Pandya Bridge", "Fatehgunj", "MSU Campus", "Subhanpura", "Gotri"]
    },
    {
        busNo: "08-Express",
        from: "Fatehgunj Circle",
        to: "Waghodia Road Crossings",
        departure: "07:45 AM",
        arrival: "08:20 AM",
        frequency: "Every 10 mins",
        type: "Electric AC",
        stops: ["Fatehgunj", "Sardar Patel Statue", "Sama Cross Road", "Waghodia Road"]
    },
    {
        busNo: "15-A",
        from: "Mandvi Clock Tower",
        to: "Sama Savli Road",
        departure: "08:10 AM",
        arrival: "08:50 AM",
        frequency: "Every 25 mins",
        type: "Standard Non-AC",
        stops: ["Mandvi", "Nyaymandir", "Karelibaug", "Sama Savli Road"]
    }
];

// Swap Source and Destination Values
function swapStops() {
    const fromInput = document.getElementById('fromStop');
    const toInput = document.getElementById('toStop');
    
    const temp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = temp;
}

// Handle Bus Search Event
function handleSearch() {
    const fromVal = document.getElementById('fromStop').value.trim().toLowerCase();
    const toVal = document.getElementById('toStop').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('busCardsContainer');
    const resultsSection = document.getElementById('resultsSection');

    resultsContainer.innerHTML = "";

    // Search logic (flexible matching)
    const filteredBuses = busDatabase.filter(bus => {
        const matchesFrom = bus.from.toLowerCase().includes(fromVal) || bus.stops.some(s => s.toLowerCase().includes(fromVal));
        const matchesTo = bus.to.toLowerCase().includes(toVal) || bus.stops.some(s => s.toLowerCase().includes(toVal));
        return matchesFrom || matchesTo;
    });

    if (filteredBuses.length > 0) {
        filteredBuses.forEach(bus => {
            const cardHTML = `
                <div class="bus-card">
                    <div class="bus-info-main">
                        <div class="bus-number-badge">
                            <i class="fa-solid fa-bus"></i><br>
                            ${bus.busNo}
                        </div>
                        <div class="route-details">
                            <h4>${bus.from} ➔ ${bus.to}</h4>
                            <p><span class="tag-electric">${bus.type}</span> • Frequency: ${bus.frequency}</p>
                            <p><strong>Route Stops:</strong> ${bus.stops.join(" ➔ ")}</p>
                        </div>
                    </div>
                    <div class="timeline">
                        <div class="time-box">
                            <span>Departs</span>
                            <strong>${bus.departure}</strong>
                        </div>
                        <div class="time-box">
                            <span>Arrives</span>
                            <strong>${bus.arrival}</strong>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML += cardHTML;
        });
    } else {
        resultsContainer.innerHTML = `
            <div class="bus-card" style="border-left-color: #e63946;">
                <p><strong>No direct buses found for this exact query.</strong><br>
                Try searching common hubs like <em>"Railway Station"</em>, <em>"Fatehgunj"</em>, or <em>"Mandvi"</em>.</p>
            </div>
        `;
    }

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Quick Autofill from Featured Cards
function quickFilter(from, to) {
    document.getElementById('fromStop').value = from;
    document.getElementById('toStop').value = to;
    handleSearch();
}
