const resultDiv = document.getElementById("result");
const dateInput = document.getElementById("travelDate");
const loader = document.getElementById("loader");

// Set default date to today
const today = new Date().toISOString().split("T")[0];
dateInput.min = today;
dateInput.value = today;

async function fetchAndShow(url, isCompare = false) {
    try {
        resultDiv.innerHTML = "";
        loader.classList.remove("hidden");

        const res = await fetch(url);
        const data = await res.json();

        loader.classList.add("hidden");

        if (!res.ok) throw new Error(data.message || "API failed");

        // The comparison route returns { fastestTransport, comparison }
        // The single routes return the object directly
        const displayData = isCompare ? data.fastestTransport : data;
        showResult(displayData);

    } catch (err) {
        loader.classList.add("hidden");
        resultDiv.innerHTML = `<p style="color:red; background: #ffebee; padding: 10px; border-radius: 8px;">Error: ${err.message}</p>`;
    }
}

function showResult(data) {
    const icon = data.mode === "Flight" ? "✈️" : "🚆";
    
    resultDiv.innerHTML = `
        <div class="result-card">
            <div class="card-header">
                <span class="mode-badge">${data.mode}</span>
                <span>${icon}</span>
            </div>
            <div class="card-body">
                <h2>${data.name}</h2>
                <div class="info-row">
                    <span><strong>From:</strong> Pune</span>
                    <span><strong>To:</strong> Mumbai</span>
                </div>
                <div class="info-row">
                    <span><strong>Departs:</strong> ${data.departure}</span>
                    <span><strong>Arrives:</strong> ${data.arrival}</span>
                </div>
                <div class="duration-tag">
                    ⏱️ Total Duration: ${data.durationMinutes} minutes
                </div>
            </div>
        </div>
    `;
}

// Event Listeners
document.getElementById("flightBtn").addEventListener("click", () => {
    fetchAndShow(`http://localhost:5000/api/flights/fastest?date=${dateInput.value}`);
});

document.getElementById("trainBtn").addEventListener("click", () => {
    fetchAndShow(`http://localhost:5000/api/trains/fastest?date=${dateInput.value}`);
});

document.getElementById("compareBtn").addEventListener("click", () => {
    // Note: Adjusted URL to /api/compare/compare to match your previous compare.js code
    fetchAndShow(`http://localhost:5000/api/compare/compare?date=${dateInput.value}`, true);
});