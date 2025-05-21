import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Button, TextField, MenuItem, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import '@fontsource/poppins';

//colors of the home page:
const neutralColors = [
  '#F5F5F5',  // Light Gray
  '#E0E0E0',  // Soft Gray
  '#BDBDBD',  // Muted Gray
  '#90A4AE',  // Dusty Blue
  '#A5D6A7',  // Soft Green
  '#000000',  // Black
];

//colors based off of weather change:
const weatherColors = {
  //Sunny conditions
  'sunny': ['#FFA500', '#FFD700'], // Orange to Gold

  // Cloudy conditions
  'clouds': ['#B0C4DE', '#D3D3D3'], // Light Steel Blue to Light Gray
  'overcast': ['#708090', '#A9A9A9'], // Slate Gray to Dark Gray

  // Rain conditions
  'rain': ['#4682B4', '#87CEEB'], // Steel Blue to Sky Blue
  'drizzle': ['#4682B4', '#87CEEB'],

  // Snow conditions
  'snow': ['#E6E6FA', '#F0F8FF'], // Lavender to Alice Blue

  // Thunderstorm conditions
  'thunderstorm': ['#483D8B', '#6A5ACD'], // Dark Slate Blue to Slate Blue

  // Default/neutral colors
  'default': ['#F5F5F5', '#E0E0E0'] // Light Gray to Soft Gray
};

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 180px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 80px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  margin-top: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
`;

const WeatherDisplay = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const getWardrobeSuggestion = (temp, weatherDesc, humidity) => {
  let suggestion = '';
  weatherDesc = weatherDesc.toLowerCase();

  // Temperature-based suggestions
  if (temp < 32) {
    suggestion = "It's freezing! Wear a heavy winter coat, scarf, gloves, and warm boots. Layer up with thermal underwear and a sweater.";
  } else if (temp < 50) {
    suggestion = "It's quite cold. Wear a warm coat, long sleeves, and pants. Don't forget a hat!";
  } else if (temp < 65) {
    suggestion = "It's a bit chilly. A light jacket or sweater with pants would be perfect.";
  } else if (temp < 75) {
    suggestion = "The temperature is mild. A light long-sleeve shirt or t-shirt with pants would work well.";
  } else if (temp < 85) {
    suggestion = "It's warm! Shorts or light pants with a t-shirt would be comfortable.";
  } else {
    suggestion = "It's hot! Wear light, breathable clothing like shorts and a t-shirt.";
  }

  // Weather condition modifiers
  if (weatherDesc.includes('rain') || weatherDesc.includes('drizzle')) {
    suggestion += " Don't forget to bring an umbrella and wear water-resistant shoes!";
  } else if (weatherDesc.includes('snow')) {
    suggestion += " Make sure to wear waterproof boots and warm socks!";
  } else if (weatherDesc.includes('wind')) {
    suggestion += " It's windy, so a windbreaker might be helpful!";
  }

  // Humidity modifiers
  if (humidity > 80 && temp > 70) {
    suggestion += " High humidity - wear light, breathable fabrics!";
  }

  return suggestion;
};

function App() {
  const [currentColor, setCurrentColor] = useState(neutralColors[0]);
  const [colorList, setColorList] = useState(neutralColors);
  const [colorIndex, setColorIndex] = useState(0);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [wardrobeSuggestion, setWardrobeSuggestion] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Color transition effect
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colorList.length);
      setCurrentColor(colorList[colorIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [colorList, colorIndex]);

  // Update color list when weather data changes
  useEffect(() => {
    if (weatherData) {
      const desc = weatherData.weather[0].description.toLowerCase();
      const weatherBasedColors = getWeatherColors(desc);
      setColorList(weatherBasedColors);
      setColorIndex(0);
      setCurrentColor(weatherBasedColors[0]);
    } else {
      setColorList(neutralColors);
      setColorIndex(0);
      setCurrentColor(neutralColors[0]);
    }
  }, [weatherData]);

  const getWeatherColors = (weatherDesc) => {
    const desc = weatherDesc.toLowerCase();

    if (desc.includes('sunny')) {
      return weatherColors.clear;
    } else if (desc.includes('cloud') || desc.includes('overcast')) {
      return weatherColors.clouds;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return weatherColors.rain;
    } else if (desc.includes('snow')) {
      return weatherColors.snow;
    } else if (desc.includes('thunder') || desc.includes('storm')) {
      return weatherColors.thunderstorm;
    } else {
      return weatherColors.default;
    }
  };

  const OPENWEATHER_API_KEY = '51e352e94b91d79f1e53f562e54a1a26';

  const getWeatherAndWardrobe = async () => {
    setLoading(true);
    setError(false);
    console.log("Starting weather fetch for:", city, state);

    try {
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      console.log("Geocoding response:", geoResponse.data);

      if (!geoResponse.data || geoResponse.data.length === 0) {
        throw new Error('Invalid city or state. Please check your input and try again.');
      }

      const { lat, lon, state: foundState, name: foundCity } = geoResponse.data[0];
      console.log("Found coordinates:", { lat, lon, foundState, foundCity });

      const stateAbbreviations = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
        'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
        'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
        'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
        'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
        'Wisconsin': 'WI', 'Wyoming': 'WY'
      };

      const foundStateAbbr = stateAbbreviations[foundState];
      if (!foundStateAbbr || foundStateAbbr !== state) {
        console.log("State mismatch:", foundState, "vs", state);
        throw new Error(`"${city}" is not in ${state}. Please check your input.`);
      }

      if (foundCity.toLowerCase() !== city.toLowerCase()) {
        throw new Error(`"${city}" was not found. Did you mean "${foundCity}"?`);
      }

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${OPENWEATHER_API_KEY}`
      );
      console.log("Weather response:", weatherResponse.data);

      if (!weatherResponse.data || weatherResponse.data.cod !== 200) {
        throw new Error('Failed to fetch weather data. Please try again.');
      }

      setWeatherData(weatherResponse.data);

      const suggestion = getWardrobeSuggestion(
        weatherResponse.data.main.temp,
        weatherResponse.data.weather[0].description,
        weatherResponse.data.main.humidity
      );

      setWardrobeSuggestion(suggestion);
      setShowResults(true);
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      setError(true);
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        'Error fetching weather data. Please try again.'
      );
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit button clicked with city:", city, "state:", state);

    if (!city.trim() || !state) {
      setError(true);
      setErrorMessage('Please enter both city and state.');
      setShowResults(true);
      return;
    }

    if (!/^[a-zA-Z\s-]+$/.test(city.trim())) {
      setError(true);
      setErrorMessage('City name can only contain letters, spaces, and hyphens.');
      setShowResults(true);
      return;
    }

    getWeatherAndWardrobe();
  };

  const handleBack = () => {
    setShowResults(false);
    setWeatherData(null);
    setWardrobeSuggestion('');
    setError(false);
    setErrorMessage('');
    setColorList(neutralColors); //resets the color list after weather based color change
    setColorIndex(0);
    setCurrentColor(neutralColors[0]);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: currentColor,
      },
      secondary: {
        main: currentColor,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          transition: 'background-color 0.5s ease-in-out',
          backgroundColor: currentColor,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <AppContainer>
          <Container maxWidth="md">
            {!showResults ? (
              <Card>
                <Typography
                  variant="h3"
                  component="h1"
                  align="center"
                  gutterBottom
                  style={{ fontFamily: 'Roboto' }}
                >
                  CLIMATIK
                </Typography>
                <form onSubmit={handleSubmit}>
                  <InputContainer>
                    <TextField
                      label="Enter City"
                      variant="outlined"
                      fullWidth
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                    <TextField
                      select
                      label="Select State"
                      variant="outlined"
                      fullWidth
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    >
                      {states.map((stateAbbreviation) => (
                        <MenuItem key={stateAbbreviation} value={stateAbbreviation}>
                          {stateAbbreviation}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      type="submit"
                      style={{ fontFamily: 'Roboto' }}
                      fullWidth
                      disabled={loading}
                    >
                      Unlock the Weather
                    </Button>
                  </InputContainer>
                </form>
              </Card>
            ) : (
              <Card>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '50px' }}>
                    <CircularProgress />
                  </div>
                ) : error ? (
                  <WeatherDisplay>
                    <Typography
                      variant="h2"
                      style={{ fontFamily: 'Roboto', color: 'red' }}
                    >
                      Oops! Something went wrong
                    </Typography>
                    <Typography variant="h6" style={{ fontFamily: 'Roboto' }}>
                      {errorMessage}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleBack}
                      style={{ marginTop: '20px', fontFamily: 'Roboto' }}
                    >
                      Try Again
                    </Button>
                  </WeatherDisplay>
                ) : (
                  <>
                    <Typography
                      variant="h4"
                      component="h2"
                      gutterBottom
                      style={{ fontFamily: 'Roboto' }}
                    >
                      {city.toUpperCase()}, {state}
                    </Typography>
                    <WeatherDisplay>
                      <Typography variant="h2" style={{ fontFamily: 'Roboto' }}>
                        {Math.round(weatherData?.main.temp)}°F
                      </Typography>
                      <Typography
                        variant="h5"
                        gutterBottom
                        style={{ fontFamily: 'Roboto' }}
                      >
                        {weatherData?.weather[0].description.charAt(0).toUpperCase() +
                          weatherData?.weather[0].description.slice(1)}
                      </Typography>
                      <Typography variant="body1" gutterBottom style={{ fontFamily: 'Roboto' }}>
                        Humidity: {weatherData?.main.humidity}%
                      </Typography>
                      <Typography variant="body1" paragraph style={{ fontFamily: 'Roboto' }}>
                        Feels like: {Math.round(weatherData?.main.feels_like)}°F
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{
                          marginTop: '20px',
                          marginBottom: '20px',
                          fontFamily: 'Roboto',
                        }}
                      >
                        Wardrobe Suggestion:
                      </Typography>
                      <Typography variant="body1" paragraph style={{ fontFamily: 'Roboto' }}>
                        {wardrobeSuggestion}
                      </Typography>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleBack}
                        style={{ marginTop: '20px', fontFamily: 'Roboto' }}
                      >
                        Check Another Location
                      </Button>
                    </WeatherDisplay>
                  </>
                )}
              </Card>
            )}
          </Container>
        </AppContainer>
      </div>
    </ThemeProvider>
  );
}

export default App;
