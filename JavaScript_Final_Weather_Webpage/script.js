const searchButton = document.querySelector(".search-btn");
const searchButton2 = document.querySelector(".search-btn-2");
const locationButton = document.querySelector(".location-btn");
const cityInput = document.querySelector(".city-input");
const cityInput2 = document.querySelector(".city-input-2");
const key = "e55eae6ed124b636e5a5f88d6f27f96e";
const temperature = document.querySelector("#temperature");
const realFeel = document.querySelector("#real-feel");
const sunrise = document.querySelector("#sunrise");
const sunset = document.querySelector("#sunset");
const weather_icon = document.querySelector("#weather-icon");
const weather_con = document.querySelector("#weather-condition");
const nearbyCitiesContainer = document.querySelector("#nearby-cities-container");
const childDivs = document.querySelectorAll('.child');
const todayButton = document.getElementById("todayButton");
const forecastButton = document.getElementById("forecastButton");
const todayContainer = document.getElementById("todayContainer");
const forecastContainer = document.getElementById("forecastContainer");

const getWeatherDetail = (name, lat, lon) => {
  const weatherAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
  fetch(weatherAPI)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      //Weather Condition
      weather_con.textContent = data.weather[0].description;

      //Weather Icon
      let icon = data.weather[0].icon;
      weather_icon.src = `http://openweathermap.org/img/wn/${icon}@4x.png`;

      //Info
      document.getElementById("city-title").innerHTML = name;
      temperature.textContent = data.main.temp + " °C";
      realFeel.textContent = "Feel Like : " + data.main.feels_like + " °C";

      //Sunrise
      let unix = data.sys.sunrise;
      let sr_time = new Date(unix * 1000);
      const timeString = sr_time.toLocaleTimeString();
      sunrise.textContent = "Sunrise : " + timeString;

      //Sunset
      let unix_2 = data.sys.sunset;
      let sr_2_time = new Date(unix_2 * 1000);
      const timeString_2 = sr_2_time.toLocaleTimeString();
      sunset.textContent = "Sunset : " + timeString_2;
    })
    .catch(() => {
      alert("Error While Fecthing Weather Data!");
    });
};

const getHourlyWeather = (lat, lon) => {
  const hourlyAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,daily,alerts&appid=${key}&units=metric`;

  fetch(hourlyAPI)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Network response was not ok. Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const hourlyForecast = data.hourly.slice(0, 6);

      const table = document.createElement("table");
      table.className = "hourly-forecast-table";

      const tableHeader = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const headers = ["Time", "Temperature (°C)", "Real Feel", "Weather Condition", "Wind Speed", "Weather Icon"];
      headers.forEach((headerText) => {
        const header = document.createElement("th");
        header.textContent = headerText;
        headerRow.appendChild(header);
      });
      tableHeader.appendChild(headerRow);
      table.appendChild(tableHeader);

      const tableBody = document.createElement("tbody");
      hourlyForecast.forEach((hourlyData) => {
        const hour = new Date(hourlyData.dt * 1000).toLocaleTimeString();
        const temperature = hourlyData.temp;
        const realFeel = hourlyData.feels_like;
        const weatherCondition = hourlyData.weather[0].description;
        const windSpeed = hourlyData.wind_speed;
        const weatherIcon = hourlyData.weather[0].icon;

        const row = document.createElement("tr");
        const timeCell = document.createElement("td");
        timeCell.textContent = hour;
        const temperatureCell = document.createElement("td");
        temperatureCell.textContent = temperature + " °C";
        const realFeelCell = document.createElement("td");
        realFeelCell.textContent = realFeel + " °C";
        const conditionCell = document.createElement("td");
        conditionCell.textContent = weatherCondition;
        const windSpeedCell = document.createElement("td");
        windSpeedCell.textContent = windSpeed + " m/s";
        const weatherIconCell = document.createElement("td");
        const iconImg = document.createElement("img");
        iconImg.src = `http://openweathermap.org/img/wn/${weatherIcon}.png`;
        weatherIconCell.appendChild(iconImg);

        row.appendChild(timeCell);
        row.appendChild(temperatureCell);
        row.appendChild(realFeelCell);
        row.appendChild(conditionCell);
        row.appendChild(windSpeedCell);
        row.appendChild(weatherIconCell);

        tableBody.appendChild(row);
      });

      table.appendChild(tableBody);

      const hourlyTable = document.querySelector("#hourly-table");
      hourlyTable.innerHTML = "";
      hourlyTable.appendChild(table);
    })
    .catch((error) => {
      console.error("Error while fetching hourly weather data:", error);
      alert("Error while fetching hourly weather data!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  const cityName2 = cityInput2.value.trim();
  if (!cityName) return;
  const geoAPI = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${key}&units=metric`;
  const geoAPI2 = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName2}&limit=1&appid=${key}&units=metric`;

  fetch(geoAPI)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No Data Found For ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetail(name, lat, lon);
      getHourlyWeather(lat, lon);
      getFiveDayForecast(lat, lon);
      getNearbyCitiesWeather(name, lat, lon);
    })
    .catch(() => {
      alert("Error While Fecthing City Name!");
    });

  fetch(geoAPI2)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No Data Found For ${cityName}`);
      const { lat, lon } = data[0];
      getFiveDayForecast(lat, lon);
    })
    .catch(() => {
      alert("Error While Fecthing City Name!");
    });
};

const createCityDiv = (cityName, temperature, iconSrc) => {
  const cityDiv = document.createElement("div");
  cityDiv.innerHTML = `
    <h5>${cityName}</h5>
    <img src="${iconSrc}" alt="${cityName} Weather Icon">
    <p>${temperature}°C</p>
  `;
  return cityDiv;
};

const getCurrentLocationWeather = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getCityNameFromCoordinates(lat, lon);
    }, () => {
      alert("Error Getting Current Location");
    });
  } else {
    alert("Geolocation is not supported by your browser");
  }
};

const getCityNameFromCoordinates = (lat, lon) => {
  const reverseGeoAPI = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}&units=metric`;

  fetch(reverseGeoAPI)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert("City Name Not Found for Current Location");
      const cityName = data[0].name;
      getWeatherDetail(cityName, lat, lon);
      getHourlyWeather(lat, lon);
      getNearbyCitiesWeather(cityName, lat, lon);
    })
    .catch(() => {
      alert("Error While Fetching City Name for Current Location");
    });
};

const getNearbyCitiesWeather = (name, lat, lon) => {
  const nearbyCitiesAPI = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=30&appid=${key}&units=metric`;

  fetch(nearbyCitiesAPI)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Network response was not ok. Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      nearbyCitiesContainer.innerHTML = "";

      const citiesWithDistances = data.list.map((cityData) => {
        console.log("here" + data);
        const distance = 30;
        return { cityData, distance };
      });

      var count = 0;

      citiesWithDistances.forEach(({ cityData }) => {
        if (cityData.name != name & count < 4) {
          console.log(`citydata = ${cityData.name} city input: ${document.getElementById("city-title").innerHTML} citiessize: ${citiesWithDistances.length}`)
          const cityName = cityData.name;
          const cityTemperature = cityData.main.temp;
          const weatherIcon = `http://openweathermap.org/img/wn/${cityData.weather[0].icon}.png`;

          const cityDiv = createCityDiv(cityName, cityTemperature, weatherIcon);
          cityDiv.className = "nearby-city";
          nearbyCitiesContainer.appendChild(cityDiv);
          count++;
        }
      });
    })
    .catch((error) => {
      console.error("Error while fetching nearby cities' weather data:", error);
    });
};

const getCityCoordinates2 = () => {
  const cityName2 = cityInput2.value.trim();
  if (!cityName2) return;
  const geoAPI2 = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName2}&limit=1&appid=${key}&units=metric`;

  fetch(geoAPI2)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No Data Found For ${cityName}`);
      const { lat, lon } = data[0];
      getFiveDayForecast(lat, lon);
    })
    .catch(() => {
      alert("Error While Fecthing City Name!");
    });
};

const getFiveDayForecast = (lat, lon) => {
  const forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

  fetch(forecastAPI)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Network response was not ok. Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const dailyForecasts = data.list.filter((item, index) => index % 8 === 0);

      dailyForecasts.forEach((forecastData, index) => {
        const button = childDivs[index];
        const date = new Date(forecastData.dt * 1000);
        const temperature = forecastData.main.temp;
        const weatherCondition = forecastData.weather[0].description;
        const weatherIcon = `http://openweathermap.org/img/wn/${forecastData.weather[0].icon}@2x.png`;
        const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
        const dayAndMonth = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(date);

        button.innerHTML = `
                <h2>${dayOfWeek}</h2>
                <h4>${dayAndMonth}</h4>
                <img id="weather-icon" src="${weatherIcon}" alt="weather-icon">
                <h3>Temp: ${temperature}°C</h3>
                <h3>${weatherCondition}</h3>
            `;
      });

      childDivs.forEach((button, index) => {
        button.addEventListener("click", () => {
          const table = document.getElementById("hourly-table-2");
          const tableBody = table.querySelector("tbody");
          tableBody.innerHTML = "";
          const forecastData = data.list.slice(index * 8, (index + 1) * 8);
          forecastData.forEach((hourlyData) => {
            const time = new Date(hourlyData.dt * 1000).toLocaleTimeString();
            const temperature = hourlyData.main.temp + " °C";
            const realFeel = hourlyData.main.feels_like + " °C";
            const weatherCondition = hourlyData.weather[0].description;
            const windSpeed = hourlyData.wind.speed + " m/s";
            const weatherIcon = `http://openweathermap.org/img/wn/${hourlyData.weather[0].icon}.png`;
            console.log("Check" + time);
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${time}</td>
        <td>${temperature}</td>
        <td>${realFeel}</td>
        <td>${weatherCondition}</td>
        <td>${windSpeed}</td>
        <td><img src="${weatherIcon}" alt="Weather Icon"></td>
      `;
            tableBody.appendChild(row);
          });
        });
      });

    })
    .catch((error) => {
      console.error("Error while fetching 5-day forecast:", error);
    });
};

searchButton.addEventListener("click", getCityCoordinates);
searchButton2.addEventListener("click", getCityCoordinates2);
locationButton.addEventListener("click", getCurrentLocationWeather);

//Div Display Control
todayButton.addEventListener("click", () => {
  todayContainer.style.display = "flex";
  forecastContainer.style.display = "none";
});

forecastButton.addEventListener("click", () => {
  todayContainer.style.display = "none";
  forecastContainer.style.display = "block";
});