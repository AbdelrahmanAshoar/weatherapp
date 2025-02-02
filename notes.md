const [weather, setWeather] = useState({
    main: {
      humidity: 56,
      pressure: 1024,
      temp: 291.65,
      temp_max: 291.65,
      temp_min: 291.65,
    },
    sys: { country: "EG", sunrise: 1738385529, sunset: 1738424073 },
    weather: [
      { description: "few clouds", icon: "02d", id: 801, main: "Clouds" },
    ],
    wind: { speed: 4.48, deg: 351, gust: 4.16 },
  });