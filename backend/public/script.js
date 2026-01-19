document.getElementById('searchBtn').addEventListener('click', async () => {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;

    if (!from || !to || !date) {
        alert("Please fill in all search fields");
        return;
    }

    // Show loader
    document.getElementById('loader').classList.remove('hidden');
    
    // Fetch both simultaneously
    Promise.all([
        fetchData(`/api/flights?origin=${from}&dest=${to}&date=${date}`, 'flightResults', 'flight'),
        fetchData(`/api/trains?origin=${from}&dest=${to}&date=${date}`, 'trainResults', 'train')
    ]).then(() => {
        document.getElementById('loader').classList.add('hidden');
    });
});

async function fetchData(url, elementId, type) {
    const container = document.getElementById(elementId);
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<p>No ${type}s found for this date.</p>`;
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="card ${type === 'train' ? 'train-card' : ''}">
                <div style="display:flex; justify-content:space-between;">
                    <strong>${item.company || item.airline || 'Carrier'}</strong>
                    <span class="price">${item.price}</span>
                </div>
                <p>🕒 Departure: ${item.departureTime || item.departure}</p>
                <p>📍 Route: ${item.origin} → ${item.destination}</p>
                ${item.class ? `<small>Class: ${item.class}</small>` : ''}
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = `<p style="color:red">Error loading ${type} data.</p>`;
        console.error(error);
    }
}