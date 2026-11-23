# SkyCast – Live Weather Dashboard

A responsive weather dashboard built with HTML, CSS and JavaScript. It uses the free Open-Meteo Geocoding and Forecast APIs; no API key is required.

## Features
- Search for a city and fetch live weather data.
- Display current temperature and weather conditions.
- Show a five-day forecast with daily high and low temperatures.
- Handle empty input, unknown cities, API errors and network problems.
- Show a loading message and disable the search button while loading.
- Remember the last successful city using localStorage.
- Responsive layout for mobile, tablet and desktop.

## Run locally
1. Open this folder in Visual Studio Code.
2. Start `index.html` with the Live Server extension.
3. Search for a city such as Tirupati, Pune or London.

## APIs
- Geocoding: https://geocoding-api.open-meteo.com/
- Forecast: https://open-meteo.com/en/docs

## Error handling
The app trims and validates the city input, checks `response.ok` before parsing JSON, checks whether the geocoding API returned a result, and catches request errors. A status message explains loading and error states to the user.

## Publish
Upload `index.html`, `style.css`, `app.js` and `README.md` to a GitHub repository, then enable GitHub Pages from the repository's Settings > Pages.
