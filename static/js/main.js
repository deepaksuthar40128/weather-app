let days = [];
let temperatures = [];
let userCity = "";

function displayResults(weather) {
  let city = document.querySelector('.location .city');
  city.innerHTML = `<img onClick='makeHomeCity()' src="img/icons/home.png" alt="search"> ${weather.city.name}, ${weather.city.country} <img id="popbtn" onClick='showPopup()' src="img/icons/search.png" alt="search">`;

  let now = new Date();
  let date = document.querySelector('.location .date');
  date.innerText = dateBuilder(now);

  let temp = document.querySelector('.current .temp');
  temp.innerHTML = `${Math.round(weather.list[0].main.temp)}<span>°c</span>`;

  let weather_el = document.querySelector('.current .weather');
  weather_el.innerText = weather.list[0].weather[0].description;

  let hilow = document.querySelector('.hi-low');
  hilow.innerText = `${Math.round(weather.list[0].main.temp_min)}°c / ${Math.round(weather.list[0].main.temp_max)}°c`;
  console.log(weather);
  let icon = document.querySelector('.icon img');
  icon.setAttribute("src", `img/icons/${weatherType[weather.list[0].weather[0].main]}`);

  temperatures = [];
  days = [];
  let totalTemp = 0.0, totalmin = 0.0, totalmax = 0.0;
  weather.list.forEach((wea, i) => {
    temperatures.push(wea.main.temp);
    totalTemp += wea.main.temp;
    totalmax += wea.main.temp_max;
    totalmin += wea.main.temp_min;
    days.push(wea.dt_txt.split(' ')[1].split(':').reverse().slice(1).reverse().join(':'));
  })
  document.querySelector(".average .temp").innerHTML = `${Math.round(totalTemp / weather.list.length)}°C`;
  document.querySelector(".average .lowHigh").innerHTML = `${Math.round(totalmin / weather.list.length)}°c / ${Math.round(totalmax / weather.list.length)}°c`;


  createGraph();
}

const createGraph = () => {
  const ctx = document.getElementById("temperatureChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: days,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "#ffffff42",
          },
          ticks: {
            color: "white",
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#ffffff42",
          },
          ticks: {
            color: "white",
          },
        },
      },
    },
  });
}


const weatherType = {
  'Clear': "sun.png",
  'few clouds': "clear-sky.png",
  'Clouds': "cloud.png",
  'broken clouds': "cloud2.png",
  'shower rain': "rain.png",
  'Rain': "rain.png",
  'thunderstorm': "thunderstorm.png",
  'snow': "snow.png",
  'mist': "mist.png",
}

function dateBuilder(d) {
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();
  return `${day} ${date} ${month} ${year}`;
}


const sendRequest = (lat, lon) => {
  return new Promise(async (Resolve, Reject) => {
    try {
      var request = {
        "url": `/user_weather?lat=${lat}&lon=${lon}`,
        "method": "GET"
      }
      $.ajax(request).done(function (response) {
        Resolve(response);
      })
    } catch (err) {
      Reject(err);
    }
  })
}



const getuserData = () => {
  return new Promise((resolve, reject) => {
    try {
      var request = {
        "url": `/userStatus`,
        "method": "GET"
      }
      $.ajax(request).done(function (response) {
        resolve(response);
      })
    } catch (err) {
      reject(err);
    }
  })
}

const getData = (city) => {
  return new Promise((resolve, reject) => {
    try {
      var request = {
        "url": `/weather?city=${city}`,
        "method": "GET"
      }
      $.ajax(request).done(function (response) {
        resolve(response);
      })
    } catch (err) {
      reject(err);
    }
  })
}

const feedUser = (user) => {
  userCity = user.city;
  document.getElementById("homeBtn").style.display = 'initial';
  document.getElementById("nav2").style.display = 'flex';
  document.getElementById("logoutBtn").style.display = 'initial';
  document.getElementById("homeBtn2").style.display = 'block';
  document.getElementById("logout2").style.display = 'block'; 
  let ele = document.getElementById("profile");
  let ele2 = document.getElementById("profile2");
  ele.children[0].setAttribute('src', user.profile);
  ele.children[1].innerHTML = user.username;
  ele2.children[0].setAttribute('src', user.profile);
  ele2.children[1].innerHTML = user.username;
  ele.style.display = 'flex';
  ele2.style.display = 'flex';
}


const start = async () => {
  let data = sessionStorage.getItem('data');
  if (data) {
    let user = sessionStorage.getItem('user');
    if (user) {
      user = JSON.parse(user);
      feedUser(user);
    }
    else {
      let data = await getuserData();
      if (data.success) {
        if (data.isAuthenticated) {
          sessionStorage.setItem('user', JSON.stringify({
            username: data.username,
            profile: data.profile,
            city: data.city
          }))
          let data2 = JSON.parse(sessionStorage.getItem('data'));
          sessionStorage.removeItem('data');
          sessionStorage.setItem("data", JSON.stringify({
            ...data2,
            homeCity: data.city,
          }))
          feedUser(data);
        }
        else {
          document.getElementById("login_btn").style.display = 'initial';
          document.getElementById("loginBtn2").style.display = 'block';
        }
      }
      else {
        location.reload();
      }
    }
    data = JSON.parse(data);
    data = await getData(data.city);
    displayResults(data);
  }
  else {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        let data = await sendRequest(latitude, longitude);
        let city = data.city.name;
        sessionStorage.setItem("data", JSON.stringify({
          'currentCity': city,
          city,
          'homeCity': city
        }))
        location.reload();
      });
    } else {
      console.log("Geolocation is not available in this browser.");
    }
  }
}
window.onload = start();




const closePopupBtn = document.getElementById("closePopupBtn");
const popup = document.getElementById("popup");
const popc = document.getElementById("popc");

const showPopup = () => {
  popup.style.display = "block";
};

closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});

popup.addEventListener("click", (event) => {
  let flag = true;
  if (event.target === popc) flag = false;
  Array.from(popc.children).forEach(ele => {
    if (ele === event.target) { flag = false }
    if (ele.children.length) {
      Array.from(ele.children).forEach(
        ele2 => {
          if (ele2 === event.target) flag = false;
        }
      )
    }
  })
  if (flag) {
    popup.style.display = "none";
  }
});



const myform = document.getElementById("myform");
myform.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (myform.city.value.length) {
    let city = myform.city.value;
    popup.style.display = "none";
    let data2 = JSON.parse(sessionStorage.getItem('data'));
    sessionStorage.removeItem('data');
    sessionStorage.setItem("data", JSON.stringify({
      ...data2,
      city,
    }))
    location.reload();
  }
})

const loadHomeCity = async () => {
  city = JSON.parse(sessionStorage.getItem('data')).homeCity;
  let data2 = JSON.parse(sessionStorage.getItem('data'));
  sessionStorage.removeItem('data');
  sessionStorage.setItem("data", JSON.stringify({
    ...data2,
    city,
  }))
  location.reload();
}
const loadCurrentCity = async () => {
  city = JSON.parse(sessionStorage.getItem('data')).currentCity;
  let data2 = JSON.parse(sessionStorage.getItem('data'));
  sessionStorage.removeItem('data');
  sessionStorage.setItem("data", JSON.stringify({
    ...data2,
    city,
  }))
  location.reload();
}
const updateCity = async (city) => {
  return new Promise((resolve, reject) => {
    try {
      var request = {
        "url": `/update?city=${city}`,
        "method": "GET"
      }
      $.ajax(request).done(function (response) {
        resolve(response);
      })
    } catch (err) {
      reject(err);
    }
  })
}
const makeHomeCity = async () => {
  let city = JSON.parse(sessionStorage.getItem('data')).city;
  userCity = city;
  let data = await updateCity(city);
  if (data.success) { 
    if (data.isAuthenticated) {
      sessionStorage.removeItem('user');
      alert(`${city} add as you Home City.` )
      location.reload();
    }
    else {
      location.replace('/google');
    }
  }
}
const logout = () => {
  sessionStorage.removeItem('user');
  location.replace('/logout');
}

const lineContainer = document.querySelector(".line-container");
const menu = document.querySelector(".menu");

lineContainer.addEventListener("click", () => {
  lineContainer.classList.toggle("active");
  menu.classList.toggle("active");
});