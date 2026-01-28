const API_KEY = '505450b6057318d3ca506f0f03a3a96f';
const API_URL_CURRENT = 'https://api.openweathermap.org/data/2.5/weather';
const API_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';


const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const pogodaDiv = document.getElementById('aktualnaPogoda');
const prognozaDiv = document.getElementById('prognoza');
const loading = document.getElementById('loading');

searchButton.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

function getWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Prosze wpisac nazwe miasta.');
        return;
    }  

    showLoading();
    clearWeatherData();

    getCurrentWeather(city);

    getForecast(city);

}

function getCurrentWeather(city) {
    const xhr = new XMLHttpRequest();
    const url = `${API_URL_CURRENT}?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(this.responseText);

            console.log('Odpowiedz z current weather API', data);
            displayCurrentWeather(data);
        }else if(xhr.status === 404){
            alert('Miasto nie znalezione. Prosze sprawdzic nazwe miasta.');
            hideLoading();
        }else{
            alert('Wystapil blad podczas pobierania danych o pogodzie.');
            hideLoading();
        }
    };
    xhr.onerror = function() {
        alert('Wystapil blad sieciowy.');
        hideLoading();
    };

    xhr.send();
}

function getForecast(city) {
    const url = `${API_URL_FORECAST}?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Blad sieciowy');
            }
            return response.json();
        })
        .then(data => {
            console.log('Odpowiedz z Forecast API:', data);
            displayForecast(data);
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            hideLoading();
        });
}

function displayCurrentWeather(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png `;

    const html = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <div class="pogoda-main">
            <div>
                <img src="${iconUrl}" alt="${data.weather[0].description}" class="pogoda-ikonka">
            </div>
            <div>
                <div class="temperatura">${Math.round(data.main.temp)}°C></div>
                <div class="pogoda-opis">${data.weather[0].description}</div>
            </div>
        </div>
        <div class="pogoda-szczegoly">
            <div class="detail-item">
                <div class="detail-label">Odczuwalna</div>
                <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Wilgotnosc</div>
                <div class="detail-value">${data.main.humidity}%</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Wiatr</div>
                <div class="detail-value">${Math.round(data.wind.speed)} m/s</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Cisnienie</div>
                <div class="detail-value">${data.main.pressure} hPa</div>
            </div>
        </div>
    `;
    pogodaDiv.innerHTML = html;
}

function displayForecast(data) {
    const dailyForecasts = data.list.filter(item => {
        return item.dt_txt.includes('12:00:00');
    }).slice(0, 5);

    let html = '';

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

        html += `
            <div class="prognoza-card">
                <div class="prognoza-data">${dayName}</div>
                <img src="${iconUrl}" alt="${forecast.weather[0].description}" class="prognoza-icon">
                <div class="prognoza-temp">${Math.round(forecast.main.temp)}°C</div>
                <div class="prognoza-desc">${forecast.weather[0].description}</div>
            </div>
        `;
    });

    prognozaDiv.innerHTML = html;
}


function hideError(){
    errorMessage.classList.remove('show');
}

function showLoading() {
    loading.classList.add('show');
}

function hideLoading() {
    loading.classList.remove('show');
}

function clearWeatherData() {
    pogodaDiv.innerHTML = '';
    prognozaDiv.innerHTML = '';
}

            