import "./App.css";
import cloud from "./Images/cloud1.png";

import { useEffect, useState } from "react";

//ui components
import {
  Container,
  Typography,
  Button,
  Box,
  createTheme,
  ThemeProvider,
  Stack,
  Divider,
  Collapse,
} from "./Components/UIComponent";
//extra lib
import { useTranslation } from "react-i18next";
import axios from "axios";
import moment from "moment";
import "moment/min/locales";
moment.locale("ar");

const theme = createTheme({
  typography: {
    body1: {
      fontSize: "20px",
    },
  },
});

function getLocation() {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((position) => {
      if (position) {
        resolve(position);
      }
    });
  });
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [locale, setLocale] = useState(false);
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState({ lat: 30.033, lon: 31.233 });
  const [locationState, setLocationState] = useState("Cairo");
  const [weather, setWeather] = useState({
    main: {
      feels_like: null,
      humidity: 56,
      pressure: 1024,
      temp: null,
      temp_max: null,
      temp_min: null,
    },
    sys: { country: "EG", sunrise: 1738385529, sunset: 1738424073 },
    weather: [
      { description: "few clouds", icon: "02d", id: 801, main: "Clouds" },
    ],
    wind: { speed: 4.48, deg: 351, gust: 4.16 },
  });

  //collapse (see more)
  const [expanded, setExpanded] = useState(false);
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleTranstlateButton = () => {
    setLocale(!locale);
    i18n.changeLanguage(locale ? "ar" : "en");
    moment.locale(locale ? "ar" : "en");
    setDate(moment().format("Do MMM YYYY"));
  };

  useEffect(() => {
    i18n.changeLanguage("ar");
  }, [i18n]);

  useEffect(() => {
    setDate(moment().format("Do MMM YYYY"));

    const cancelTokenSource1 = axios.CancelToken.source();
    const cancelTokenSource2 = axios.CancelToken.source();

    getLocation().then((position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lon: longitude });

      // === first request for Date ====//
      axios
        .get(
          `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=679e0ff7696ee210231223ckw13a0f5`,
          { cancelToken: cancelTokenSource1.token }
        )
        .then(function (response) {
          setLocationState(response.data.address.state);
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            console.log("Error in Request 1:", error);
          }
        });

      // === second request for weather ====//
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lon=${longitude}&lat=${latitude}&appid=d3caa89a3d0f0af3864795c5ce62e867`,
          { cancelToken: cancelTokenSource2.token }
        )
        .then(function (response) {
          const { main, sys, weather, wind, name } = response.data;
          setWeather({ main, sys, weather, wind, name });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            console.log("Error in Request 2:", error);
          }
        });
    });

    // clean up useEffect
    return () => {
      cancelTokenSource1.cancel("");
      cancelTokenSource2.cancel("");
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="app" dir={i18n.dir()}>
        <Container
          sx={{
            height: "100%",
            padding: {
              xs: "0",
              sm: "auto",
            },
          }}
        >
          <div className="header">
            <h1>{t("Weather")}</h1>
            <Button
              color="secondary"
              sx={{ fontSize: "20px", alignSelf: "end" }}
              onClick={handleTranstlateButton}
            >
              {t("Arabic")}
            </Button>
          </div>

          <div className="container-card">
            <div className="card">
              <div className="card-header">
                <h2>{t(locationState)}</h2>
                <Typography sx={{ alignSelf: "end" }}>{date}</Typography>
              </div>

              <hr />

              <div className="card-body">
                <div className="content" style={{ alignSelf: "center" }}>
                  <div className="temperature" style={{ display: "flex" }}>
                    <h3>{Math.round(weather.main.temp - 273.15)}°</h3>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                      alt=""
                      style={{
                        alignSelf: "center",
                        transform:
                          i18n.dir() === "rtl"
                            ? "translateX(20px)"
                            : "translateX(-25px)",
                      }}
                    />
                  </div>
                  <Typography sx={{ my: 2 }}>
                    {t(weather.weather[0].description)}
                  </Typography>
                  <Typography>
                    <Stack
                      direction={{ xs: "row" }}
                      gap={2}
                      divider={
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ background: "black" }}
                        />
                      }
                    >
                      <Box>
                        {t("Min")} :{" "}
                        {Math.round(weather.main.temp_min - 273.15)}°
                      </Box>
                      <Box>
                        {t("Max")} :{" "}
                        {Math.round(weather.main.temp_max - 273.15)}°
                      </Box>
                    </Stack>
                  </Typography>
                </div>
                <div className="image">
                  <img src={cloud} alt="cloud-image" />
                </div>
              </div>

              <Box sx={{ mt: 3 }}>
                <Collapse in={expanded}>
                  <Typography variant="body1">
                    <Stack gap={2} direction={{ xs: "column", sm: "row" }}>
                      <Box>
                        {t("Pressure")} : {weather.main.pressure}
                      </Box>
                      <Box>
                        {t("Humidity")} : {weather.main.humidity}
                      </Box>
                    </Stack>
                    <div style={{ textDecoration: "underline", pt: 2 }}>
                      {t("Wind")}
                    </div>
                    <Stack direction={{ xs: "row" }} gap={2}>
                      <Box>
                        {t("Speed")} : {weather.wind.speed}
                      </Box>
                      <Box>
                        {t("Degree")} : {weather.wind.deg}
                      </Box>
                    </Stack>
                  </Typography>
                </Collapse>
                <Button
                  onClick={handleToggle}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {expanded ? "See Less" : "See More"}
                </Button>
              </Box>
            </div>
          </div>
        </Container>
      </div>
    </ThemeProvider>
  );
}
