import React, { useState } from 'react';
import styled from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Button, TextField, MenuItem, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
  },
});

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #00b4db, #0083b0);
  padding: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [wardrobeSuggestion, setWardrobeSuggestion] = useState('');

  const OPENWEATHER_API_KEY = '51e352e94b91d79f1e53f562e54a1a26';

  const getWeatherAndWardrobe = async () => {
    setLoading(true);
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},US&units=imperial&appid=${OPENWEATHER_API_KEY}`
      );

      setWeatherData(weatherResponse.data);
      const suggestion = getWardrobeSuggestion(
        weatherResponse.data.main.temp,
        weatherResponse.data.weather[0].description,
        weatherResponse.data.main.humidity
      );

      setWardrobeSuggestion(suggestion);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching weather data. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city && state) {
      getWeatherAndWardrobe();
    }
  };

  const handleBack = () => {
    setShowResults(false);
    setWeatherData(null);
    setWardrobeSuggestion('');
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Container maxWidth="md">
          {!showResults ? (
            <Card>
              <Typography variant="h3" component="h1" align="center" gutterBottom>
                Weather App
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
                    {states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    fullWidth
                  >
                    Get Weather
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
              ) : (
                <>
                  <Typography variant="h4" component="h2" gutterBottom>
                    {city}, {state}
                  </Typography>
                  <WeatherDisplay>
                    <Typography variant="h2">
                      {Math.round(weatherData?.main.temp)}°F
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      {weatherData?.weather[0].description}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Humidity: {weatherData?.main.humidity}%
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Feels like: {Math.round(weatherData?.main.feels_like)}°F
                    </Typography>
                    <Typography
                      variant="h6"
                      style={{ marginTop: '20px', marginBottom: '20px' }}
                    >
                      Wardrobe Suggestion:
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {wardrobeSuggestion}
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleBack}
                      style={{ marginTop: '20px' }}
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
    </ThemeProvider>
  );
}

export default App;
