const apiKey = 'f6481c257e7948debad30446243108';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherInfo = document.getElementById('weather-info');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const additionalInfo = document.getElementById('additional-info');
const forecast = document.getElementById('forecast');
const weatherAlerts = document.getElementById('weather-alerts');
const themeToggle = document.getElementById('theme-toggle');

let map;

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

themeToggle.addEventListener('click', toggleTheme);

async function getWeather() {
    const city = cityInput.value;
    if (!city) return;

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=yes&alerts=yes`);
        const data = await response.json();

        if (data.error) {
            showPopup(data.error.message);
            return;
        }

        displayWeather(data);
        initMap(data.location.lat, data.location.lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showPopup('An error occurred. Please try again later.');
    }
}

function displayWeather(data) {
    const current = data.current;
    const location = data.location;
    const forecastDays = data.forecast.forecastday;

    cityName.textContent = `${location.name}, ${location.country}`;
    temperature.textContent = `${Math.round(current.temp_c)}°C`;
    weatherDescription.textContent = current.condition.text;
    weatherIcon.innerHTML = `<img src="${current.condition.icon}" alt="Weather icon" class="img-fluid">`;

    additionalInfo.innerHTML = `
        <div class="row">
            <div class="col-sm-6">
                <div class="additional-info-item">
                    <i class="fas fa-thermometer-half"></i>
                    <span>Feels like: ${Math.round(current.feelslike_c)}°C</span>
                </div>
                <div class="additional-info-item">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${current.humidity}%</span>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="additional-info-item">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${current.wind_kph} km/h ${current.wind_dir}</span>
                </div>
                <div class="additional-info-item">
                    <i class="fas fa-sun"></i>
                    <span>UV Index: ${current.uv}</span>
                </div>
            </div>
        </div>
        <div class="additional-info-item">
            <i class="fas fa-lungs"></i>
            <span>Air Quality (US EPA Index): ${current.air_quality['us-epa-index']}</span>
        </div>
    `;

    forecast.innerHTML = `
        <h4 class="mb-3">3-Day Forecast</h4>
        <div class="row">
            ${forecastDays.map(day => `
                <div class="col-sm-4 mb-3">
                    <div class="forecast-day">
                        <p class="mb-2">${new Date(day.date).toLocaleDateString('en-US', {weekday: 'short'})}</p>
                        <img src="${day.day.condition.icon}" alt="Weather icon" class="img-fluid mb-2">
                        <p class="mb-0">${Math.round(day.day.avgtemp_c)}°C</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (data.alerts && data.alerts.alert.length > 0) {
        weatherAlerts.innerHTML = `
            <h4 class="mb-3">Weather Alerts</h4>
            ${data.alerts.alert.map(alert => `
                <div class="alert alert-warning" role="alert">
                    <h5 class="alert-heading">${alert.event}</h5>
                    <p class="mb-0">${alert.desc}</p>
                </div>
            `).join('')}
        `;
    } else {
        weatherAlerts.innerHTML = '';
    }

    weatherInfo.classList.remove('d-none');
    // Force a reflow to ensure the transition works
    void weatherInfo.offsetWidth;
    weatherInfo.classList.add('show');
}

function initMap(lat, lon) {
    if (map) {
        map.remove();
    }

    map = L.map('map').setView([lat, lon], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lon]).addTo(map)
        .bindPopup('Weather location')
        .openPopup();
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
}
