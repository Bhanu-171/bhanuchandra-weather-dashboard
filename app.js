const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const statusMessage = document.getElementById('status');
const weatherContent = document.getElementById('weather-content');
const forecastGrid = document.getElementById('forecast-grid');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const weatherTypes = {
  0: { label: 'Clear sky', symbol: '☀' },
  1: { label: 'Mainly clear', symbol: '🌤' },
  2: { label: 'Partly cloudy', symbol: '⛅' },
  3: { label: 'Overcast', symbol: '☁' },
  45: { label: 'Fog', symbol: '≋' },
  48: { label: 'Rime fog', symbol: '≋' },
  51: { label: 'Light drizzle', symbol: '☂' },
  53: { label: 'Drizzle', symbol: '☂' },
  55: { label: 'Dense drizzle', symbol: '☂' },
  61: { label: 'Light rain', symbol: '☂' },
  63: { label: 'Rain', symbol: '☂' },
  65: { label: 'Heavy rain', symbol: '☂' },
  71: { label: 'Light snow', symbol: '❄' },
  73: { label: 'Snow', symbol: '❄' },
  75: { label: 'Heavy snow', symbol: '❄' },
  80: { label: 'Rain showers', symbol: '☂' },
  81: { label: 'Rain showers', symbol: '☂' },
  82: { label: 'Heavy showers', symbol: '☂' },
  95: { label: 'Thunderstorm', symbol: 'ϟ' },
  96: { label: 'Thunderstorm with hail', symbol: 'ϟ' },
  99: { label: 'Thunderstorm with hail', symbol: 'ϟ' }
};

function getWeatherType(code) {
  return weatherTypes[code] || { label: 'Unknown conditions', symbol: '○' };
}

async function findCity(name) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('The city search service is not responding. Please try again.');
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('City not found. Check the spelling and try another city.');
  }
  const city = data.results[0];
  return {
    name: city.name,
    country: city.country || '',
    latitude: city.latitude,
    longitude: city.longitude
  };
}

async function getWeather(latitude, longitude) {
  const url = `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load the weather forecast. Please try again.');
  return response.json();
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

function renderCurrentWeather(city, weather) {
  const type = getWeatherType(weather.current.weather_code);
  document.getElementById('city-name').textContent = `${city.name}${city.country ? ', ' + city.country : ''}`;
  document.getElementById('current-date').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('current-symbol').textContent = type.symbol;
  document.getElementById('temperature').textContent = `${Math.round(weather.current.temperature_2m)}°C`;
  document.getElementById('condition').textContent = type.label;
  document.getElementById('timezone').textContent = weather.timezone || 'Local time';
}

function renderForecast(weather) {
  forecastGrid.replaceChildren();
  weather.daily.time.forEach((date, index) => {
    const type = getWeatherType(weather.daily.weather_code[index]);
    const card = document.createElement('article');
    card.className = 'forecast-card';

    const day = document.createElement('p');
    day.className = 'forecast-day';
    day.textContent = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });

    const symbol = document.createElement('div');
    symbol.className = 'forecast-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = type.symbol;

    const condition = document.createElement('p');
    condition.className = 'forecast-condition';
    condition.textContent = type.label;

    const temps = document.createElement('div');
    temps.className = 'forecast-temps';
    const high = document.createElement('span');
    high.textContent = `${Math.round(weather.daily.temperature_2m_max[index])}°`;
    const low = document.createElement('span');
    low.textContent = `${Math.round(weather.daily.temperature_2m_min[index])}°`;
    temps.append(high, low);
    card.append(day, symbol, condition, temps);
    forecastGrid.append(card);
  });
}

async function searchWeather(cityName) {
  const trimmedName = cityName.trim();
  if (!trimmedName) {
    weatherContent.hidden = true;
    showStatus('Please enter a city name before searching.', true);
    cityInput.focus();
    return;
  }

  searchButton.disabled = true;
  showStatus('Loading weather data...');
  weatherContent.hidden = true;

  try {
    const city = await findCity(trimmedName);
    const weather = await getWeather(city.latitude, city.longitude);
    renderCurrentWeather(city, weather);
    renderForecast(weather);
    weatherContent.hidden = false;
    showStatus(`Weather updated for ${city.name}.`);
    localStorage.setItem('skycast-last-city', city.name);
  } catch (error) {
    showStatus(error.message || 'Network problem. Check your connection and try again.', true);
  } finally {
    searchButton.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

const savedCity = localStorage.getItem('skycast-last-city');
if (savedCity) {
  cityInput.value = savedCity;
  searchWeather(savedCity);
}
