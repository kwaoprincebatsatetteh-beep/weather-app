import { useState, useEffect } from "react";
import searchIcon from "./assets/searchiconbg.png";

function App() {
  const [cityInput, setCityInput] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.log("Location weather error:", error);
    }
  });
}, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const city = cityInput.trim();
    if (!city) {
      setError("Please enter a city");
      return;
    }

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not fetch weather data");
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header>
        <nav>
          <a href="/" className="logo">Champion's WeatherApp</a>
          <div className="menu">
            <a
              href="https://github.com/kwaoprincebatsatetteh-beep/weather-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://x.com/ChampionPincode"
              target="_blank"
              rel="noopener noreferrer"
            >
              X(Twitter)
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Get weather report for any city.</h1>
        </section>

        <section className="weather">
          <form onSubmit={handleSubmit} aria-label="Search weather by city">
            <label htmlFor="city" className="visually-hidden">
              City name
            </label>

            <input
              type="search"
              id="city"
              placeholder="Enter city name..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />

           <button type="submit" className="button">
  <span className="visually-hidden">Search</span>
  <img src={searchIcon} alt="Search" className="search-icon" />
</button>
          </form>

          <article
            className="weather-card"
            style={{ display: weatherData || error || loading ? "grid" : "none" }}
            aria-live="polite"
          >
            {loading && <p data-loading>Loading...</p>}

            {error && <p data-error>{error}</p>}

            {weatherData && (
              <div className="weather-details">
                <div className="meta-details">
                  <h2>
                    <span data-city>{weatherData.name}</span>,{" "}
                    <span data-country>{weatherData.sys.country}</span>
                  </h2>

                  <p data-temperature>
                    {weatherData.main.temp}°
                  </p>

                  <p data-description>
                    {weatherData.weather[0].description.charAt(0).toUpperCase() +
                      weatherData.weather[0].description.slice(1)}
                  </p>
                </div>

                <dl className="extra-details">
                  <div>
                    <dt>Humidity</dt>
                    <dd data-humidity>
                      {weatherData.main.humidity}%
                    </dd>
                  </div>

                  <div>
                    <dt>Pressure</dt>
                    <dd data-pressure>
                      {weatherData.main.pressure} hPa
                    </dd>
                  </div>

                  <div>
                    <dt>Wind speed</dt>
                    <dd data-wind>
                      {weatherData.wind.speed} m/s
                    </dd>
                  </div>

                  <div>
                    <dt>Visibility</dt>
                    <dd data-visibility>
                      {(weatherData.visibility / 1000).toFixed(0)} km
                    </dd>
                  </div>
                </dl>

                <p className="calc-time">
                  Report generated at:{" "}
                  <time data-time>
                    {new Date(weatherData.dt * 1000).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </p>
              </div>
            )}
          </article>
        </section>
      </main>
      
 
    </>
  );
}


export default App;