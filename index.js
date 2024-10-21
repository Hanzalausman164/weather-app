const apiKey = "db518f5e25ee704245029dfc87b86168";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const FiveDaysUrl = "https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=";

function getNextFiveDays() {
  const dates = [];
  const today = new Date();

  for (let i = 1; i <= 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    const options = { weekday: "short", day: "numeric", month: "short" };
    const formattedDate = nextDate.toLocaleDateString("en-GB", options);
    dates.push(formattedDate);
  }
  return dates;
}

const nextFiveDays = getNextFiveDays();

const ctx = document.getElementById("bar");
const ctx1 = document.getElementById("doughnut");
const ctx2 = document.getElementById("line");

const searchBox = document.querySelector(".search");
const weatherIcon = document.querySelector(".weather-icon");
const forecast = document.querySelector(".forecast");
const dateElement = document.getElementById("date");

let temperatureChart, humidityChart, conditionsChart; // Hold chart instances

function getCurrentDate() {
  const date = new Date();
  const optionsDay = { weekday: "long" };
  const optionsDate = { day: "numeric", month: "short" };

  const day = date.toLocaleDateString("en-GB", optionsDay);
  const dateElem = date.toLocaleDateString("en-GB", optionsDate);
  return `${day}, ${dateElem}`; 
}

async function fetchWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  const data = await response.json();
  const FiveDays = await fetch(FiveDaysUrl + city + `&appid=${apiKey}`);
  const data2 = await FiveDays.json();

  forecast.innerHTML = data.weather[0].main;

  const today = new Date().getDate();
  let uniqueForecastDays = [];
  const fiveDaysForecast = data2.list.filter((forecast) => {
    const forecastDate = new Date(forecast.dt_txt).getDate();
    if (forecastDate !== today && !uniqueForecastDays.includes(forecastDate)) {
      return uniqueForecastDays.push(forecastDate);
    }
  });

  const temperatures = fiveDaysForecast.map((forecast) =>
    Math.round(forecast.main.temp)
  );
  const humidity = fiveDaysForecast.map((forecast) => forecast.main.humidity);
  const conditionsCount = {
    Clouds: 0,
    Clear: 0,
    Rain: 0,
    Snow: 0,
    Thunderstorm: 0,
  };
  const weatherConditions = fiveDaysForecast.map(
    (forecast) => forecast.weather[0].main
  );
  weatherConditions.forEach((condition) => {
    if (conditionsCount[condition] !== undefined) {
      conditionsCount[condition]++;
    }
  });

  // Prepare Doughnut chart data
  const conditionsData = Object.values(conditionsCount).filter(
    (count) => count > 0
  );
  const conditionsLabels = Object.keys(conditionsCount).filter(
    (condition) => conditionsCount[condition] > 0
  );
  
  // Destroy existing charts if they exist
  if (temperatureChart) {
    temperatureChart.destroy();
  }
  if (humidityChart) {
    humidityChart.destroy();
  }
  if (conditionsChart) {
    conditionsChart.destroy();
  }

  // Update the Line Chart for Temperature (°C)
  temperatureChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: nextFiveDays,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          borderWidth: 1,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });

  // Update the Doughnut Chart for Conditions
  conditionsChart = new Chart(ctx1, {
    type: "doughnut",
    data: {
      labels: conditionsLabels, 
      datasets: [
        {
          label: "Conditions",
          data: conditionsData, 
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Update the Bar Chart for Humidity (%)
  humidityChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: nextFiveDays,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temperatures,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

  let weatherContainer= document.getElementsByClassName("weatherContainer")[0];
  if (data.weather[0].main === "Clear") {
    weatherIcon.src = "Images/sun.png";
    weatherContainer.style.backgroundImage = "url('Images/clearSky.gif')";
    weatherContainer.style.backgroundSize = "cover";       // Ensure the background covers the whole container
    weatherContainer.style.backgroundRepeat = "no-repeat"; // Prevent the image from repeating
    weatherContainer.style.backgroundPosition = "center";
  } else if (data.weather[0].main === "Clouds") {
    weatherIcon.src = "Images/cloudy(2).png";
    weatherContainer.style.backgroundImage = "url('Images/clouds.gif')";

  } else if (data.weather[0].main === "Rain") {
    weatherIcon.src = "Images/rainy-day.png";
  } else if (data.weather[0].main === "Thunderstorm") {
    weatherIcon.src = "Images/storm.png";
  }

  dateElement.innerHTML = getCurrentDate();
}

window.onload = () => {
  fetchWeather("Islamabad");
};

searchBox.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchWeather(searchBox.value);
  }
});
