import { useState, useEffect } from "react";
import "./style.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY;

  async function fetchWeather(cityName) {
    if (!cityName) return;

    setLoading(true);
    setError("");

    try {
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`
      );

      if (!currentRes.ok) throw new Error("City not found.");

      const currentData = await currentRes.json();
      setWeather(currentData);
      setCity(cityName);

      const { lat, lon } = currentData.coord;

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      const forecastData = await forecastRes.json();

      const daily = forecastData.list.filter((_, i) => i % 8 === 0);
      setForecast(daily.slice(0, 5));

      localStorage.setItem("lastCity", cityName);

    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  // Load last searched city
  useEffect(() => {
    const saved = localStorage.getItem("lastCity");
    if (saved) fetchWeather(saved);
  }, []);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!city) return;
    const interval = setInterval(() => fetchWeather(city), 300000);
    return () => clearInterval(interval);
  }, [city]);

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        fetchWeather(data.name);
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <>
      <header>
        <nav>
          <a href="/" className="logo">weather.</a>
          <div className="menu">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Get weather report for any city.</h1>
        </section>

        <section className="weather">
          <form
            onSubmit={e => {
              e.preventDefault();
              fetchWeather(e.target.city.value.trim());
            }}
          >
            <label htmlFor="city" className="visually-hidden">
              City name
            </label>
            <input
              type="search"
              id="city"
              name="city"
              placeholder="Enter city name..."
            />
            <button type="submit">Search</button>
          </form>

          <article
            className="weather-card"
            style={{ display: weather || error || loading ? "grid" : "none" }}
          >
            {loading && <p data-loading>Loading...</p>}
            {error && <p data-error>{error}</p>}

            {weather && (
              <div className="weather-details">
                <div className="meta-details">
                  <h2>{weather.name}, {weather.sys.country}</h2>

                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt=""
                  />

                  <p data-temperature>{weather.main.temp}°C</p>
                  <p data-description>{weather.weather[0].description}</p>

                  <button
                    className="refresh-btn"
                    onClick={() => fetchWeather(city)}
                  >
                    Refresh
                  </button>
                </div>

                <dl className="extra-details">
                  <div>
                    <dt>Humidity</dt>
                    <dd>{weather.main.humidity}%</dd>
                  </div>
                  <div>
                    <dt>Pressure</dt>
                    <dd>{weather.main.pressure} hPa</dd>
                  </div>
                  <div>
                    <dt>Wind speed</dt>
                    <dd>{(weather.wind.speed * 3.6).toFixed(1)} km/h</dd>
                  </div>
                  <div>
                    <dt>Visibility</dt>
                    <dd>{(weather.visibility / 1000).toFixed(0)} km</dd>
                  </div>
                </dl>

                <p className="calc-time">
                  Report generated at{" "}
                  {new Date(weather.dt * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </article>

          {forecast.length > 0 && (
            <section className="forecast">
              <h2>5-Day Forecast</h2>
              <div className="forecast-grid">
                {forecast.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt=""
                    />
                    <p>{day.main.temp}°C</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </>
  );
}

export default App;