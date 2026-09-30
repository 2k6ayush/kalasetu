/**
 * Service to fetch factual environment data (Weather & Elevation)
 * Uses free Open-Meteo APIs (no API key required).
 */

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

exports.fetchEnvironmentData = async (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates');
  }

  const elevationUrl = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;

  console.log(`[Weather] request URL: ${weatherUrl} | Elevation URL: ${elevationUrl}`);

  // Use Promise.allSettled so if one fails, we still try to return the other
  const [elevationRes, weatherRes] = await Promise.allSettled([
    fetch(elevationUrl),
    fetch(weatherUrl)
  ]);

  let result = {
    elevation: null,
    weather: null,
    errors: {}
  };

  // Parse Elevation
  if (elevationRes.status === 'fulfilled' && elevationRes.value.ok) {
    try {
      const elData = await elevationRes.value.json();
      if (elData && elData.elevation && elData.elevation.length > 0) {
        result.elevation = elData.elevation[0]; // in meters
      }
    } catch (e) {
      result.errors.elevation = 'Failed to parse elevation data';
    }
  } else {
    result.errors.elevation = 'Elevation API unavailable';
  }

  // Parse Weather
  if (weatherRes.status === 'fulfilled') {
    if (weatherRes.value.ok) {
      try {
        const wData = await weatherRes.value.json();
        if (wData && wData.current) {
          const c = wData.current;
          result.weather = {
            temperature: c.temperature_2m,
            feelsLike: c.apparent_temperature,
            humidity: c.relative_humidity_2m,
            windSpeed: c.wind_speed_10m,
            weatherCode: c.weather_code,
            description: WEATHER_CODE_MAP[c.weather_code] || 'Unknown'
          };
        }
      } catch (e) {
        result.errors.weather = 'Failed to parse weather data';
        console.error(`[Weather] ${weatherUrl} / ${weatherRes.value.status} / JSON parse error`);
      }
    } else {
      const errText = await weatherRes.value.text();
      result.errors.weather = 'Weather API unavailable';
      console.error(`[Weather] ${weatherUrl} / ${weatherRes.value.status} / ${errText}`);
    }
  } else {
    result.errors.weather = 'Weather API fetch failed';
    console.error(`[Weather] ${weatherUrl} / 500 / ${weatherRes.reason}`);
  }

  return result;
};
