/////////////////////////////////////////////////////////////////////////////////
////////////             BEGINING OF HELPER FUNCTIONS             //////////////
///////////////////////////////////////////////////////////////////////////////

const toHours = (time) => {
    if (parseInt(time) < 0) {
        time = parseInt(time) * (-1);
    }

    time = parseInt(time);

    let hours = (time - (time % 3600)) / 3600;

    let seconds = time - (hours * 3600);

    let minutes = (seconds - (seconds % 60)) / 60;

    seconds = seconds - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return `${hours}:${minutes}:${seconds}`;
}

const toSeconds = (time) => {
    const format = /(\d{2}:\d{2}):*\d*\d*/g;

    if (!format.test(time)) {
        throw new Error("Invalid Time Format. Please use {HH:MM} or {HH:MM:SS} format.");
    }
    
    const hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(3, 5));
    let seconds = parseInt(time.slice(6, 8));
    if (isNaN(seconds)) {
        seconds = 0;
    }

    return hours * 3600 + minutes * 60 + seconds; 
}

const to12Hour = (time) => {
    const format = /([0-9]{2}:[0-9]{2})/g; // HH:MM format

    if (!format.test(time)) {
        throw new Error("Invalid Time Format. Please use {HH:MM} format.");
    }

    let hour = parseInt(time.slice(0, 2));

    if (hour > 23 || hour < 0) {
        throw new Error("Time out of range.");
    }

    if (hour > 12) {
        hour -= 12;
        if (hour < 10) {
            hour = "0" + hour;
        }
        return `${hour}${time.slice(2, 5)} PM`;
    } else if (hour === 12) {
        return `${hour}${time.slice(2, 5)} PM`;
    } else if (hour === 0) {
        hour = 12;
        return `${hour}${time.slice(2, 5)} AM`;
    } else {
        return `${time} AM`;
    }
}

const to24Hour = (time) => {
    if (parseInt(time.slice(0, 1)) < 10 && time.slice(1,2) === ":") {
        time = "0" + time;
    }

    if (time.slice(9, 11) === "AM" && time.slice(0, 2) === "12") {
      return `00${time.slice(2, 8)}`;
    } else if (time.slice(9, 11) === "AM") {
      return time.slice(0, 8);
    } else if (time.slice(9, 11) === "PM" && time.slice(0, 2) === "12") {
      return time.slice(0, 8);
    } else if (time.slice(9, 11) === "PM") {
      return `${parseInt(time.slice(0, 2)) + 12}${time.slice(2, 8)}`;
    }
}

const success = (pos) => {
    const coordinates = pos.coords;
    localStorage.setItem("Latitude", coordinates.latitude);
    localStorage.setItem("Longitude", coordinates.longitude);
}
  
const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

////////////////////////////////////////////////////////////////////////////
////////////             END OF HELPER FUNCTIONS             //////////////
//////////////////////////////////////////////////////////////////////////
const timing = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

const toggleSettings = () => {
    document.querySelector(".setting").classList.toggle("hidden");
    document.querySelector("#widget").classList.toggle("darken");
    document.querySelector("section").classList.toggle("darken-bg");
}

const getTime = async (date) => {

    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${localStorage.getItem("Latitude")}&longitude=${localStorage.getItem("Longitude")}&method=4`

    if (localStorage.getItem("Latitude") && localStorage.getItem("Longitude")) {
        try {
            const response = await fetch(url);
            const apiData = await response.json();

            
            if (response.ok) {
                const Prayer = {
                    date: `${apiData.data.date.hijri.day} ${apiData.data.date.hijri.month.en} ${apiData.data.date.hijri.year}`,
                    Fajr: apiData.data.timings.Fajr,
                    Sunrise: apiData.data.timings.Sunrise,
                    Dhuhr: apiData.data.timings.Dhuhr,
                    Asr: apiData.data.timings.Asr,
                    Maghrib: apiData.data.timings.Maghrib,
                    Isha: apiData.data.timings.Isha
                }
            
                localStorage.setItem("Prayer", JSON.stringify(Prayer));
                console.log("API Data Received!");
            }
        } catch (error) {
            console.error(error);
            console.error("Fetch error!");

            document.querySelector("#errorMessage").style.color = "var(--error-red)";
            document.querySelector("#errorMessage").innerHTML = "Could not fetch prayer times. :(";
        }
    }
}

const newDay = (date) => {
    const tomorrow = new Date();

    if (date !== tomorrow.toLocaleDateString()) {
        today = initApp();
        x = 0;
        playAudio = false;
        console.log("New Day Loaded");
    }
}

if (!localStorage.getItem("Latitude") && !localStorage.getItem("Longitude")) {
    toggleSettings();

    navigator.geolocation.getCurrentPosition(success, error); // get device location

    document.querySelector("#errorMessage").style.color = "var(--error-red)";
    document.querySelector("#errorMessage").innerHTML = "Set your location or refresh to load device location.";
}

const initApp = () => {
    const today = new Date();
    let engDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    getTime(engDate).then(() => {
        const Prayer = JSON.parse(localStorage.getItem("Prayer"));

        if (Prayer) {
            for (let i = 0; i <= 5; i++) {
                document.querySelector(`#${timing[i]}`).innerHTML = to12Hour(Prayer[timing[i]]);
            }
            document.querySelector("#hijri").innerHTML = Prayer.date;
        }  
    });

    return today;
}

let today = initApp();
let x = 0;
let playAudio = false;



setInterval(() => {
    if (localStorage.getItem("Prayer")) {
        const Prayer = JSON.parse(localStorage.getItem("Prayer"));
        const time = new Date();
        
        const nowTime = toSeconds(to24Hour(time.toLocaleTimeString()));
        const prayTime = toSeconds(Prayer[timing[x]]);
    
        const remainingSec = nowTime - prayTime;
        const remaining = toHours(remainingSec);
    
        document.querySelector("#remaining").innerHTML = timing[x];
        
        if (remainingSec === 0 && !playAudio) {
            document.querySelector("#audio-alert").play();
            playAudio = true;
        }
    
        if (remainingSec > 1800 && x !== 5) {
            x++;
    
        }
    
    
        if (remainingSec < 0) {
            document.getElementById("count").textContent = "- " +remaining;
        } else {
            document.getElementById("count").textContent = "+ " + remaining;
        }
    
        newDay(today.toLocaleDateString());
    }
}, 20);


document.querySelector("#settings-btn").addEventListener("click", () => {
    toggleSettings();

    if (localStorage.getItem("Location")) {
        document.getElementById("currentLocation").innerHTML = localStorage.getItem("Location");
    } else if (localStorage.getItem("Latitude") && localStorage.getItem("Longitude") && !localStorage.getItem("Location")) {
        const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${localStorage.getItem("Latitude")}&lon=${localStorage.getItem("Longitude")}&format=json`;

        fetch(reverseGeocodeUrl)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById("currentLocation").innerHTML = "Device Location";
                } else {
                    localStorage.setItem("Location", data.display_name);
                    document.getElementById("currentLocation").innerHTML = data.display_name;
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                document.getElementById("currentLocation").innerHTML = "Cannot detect location!";
                document.getElementById("currentLocation").style.color = "var(--error-red)";
                
            })
        
        document.getElementById("currentLocation").innerHTML = "Device Location";
    }
});


// Sets Light Mode theme - Default theme: dark mode
let lightMode;

if (!localStorage.getItem("lightMode")) {
    lightMode = false;
} else {
    lightMode = JSON.parse(localStorage.getItem("lightMode"));
}

if (lightMode) {
    document.getElementById("theme").setAttribute("href", "css/light.css");
    document.querySelector("#theme-btn img").setAttribute("src", "images/theme-icon-dark.svg");
}

document.querySelector("#theme-btn").addEventListener("click", () => {
    const theme = document.getElementById("theme");
    const themeBtn = document.querySelector("#theme-btn img");
    
    if (!lightMode) {
        theme.setAttribute("href", "css/light.css");
        themeBtn.setAttribute("src", "images/theme-icon-dark.svg");
        localStorage.setItem("lightMode", true);
        lightMode = true;
    } else {
        theme.removeAttribute("href");
        themeBtn.setAttribute("src", "images/theme-icon.svg");
        localStorage.setItem("lightMode", false);
        lightMode = false;
    }
});

const suggestionsDiv = document.getElementById('suggestions');

// Function to fetch suggestions
document.getElementById('address').addEventListener("input", function() {
  const address = this.value;

  if (address.length < 3) {
    suggestionsDiv.innerHTML = ''; // Clear suggestions if the input is too short
    return;
  }

  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5`;

  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      suggestionsDiv.innerHTML = ''; // Clear previous suggestions
      data.forEach(location => {
        const suggestion = document.createElement('div');
        suggestion.textContent = location.display_name;
        suggestion.addEventListener('click', () => {
          document.getElementById('address').value = location.display_name;
          suggestionsDiv.innerHTML = ''; // Clear suggestions once selected
        });
        suggestionsDiv.appendChild(suggestion);
      });
    })
    .catch(error => {
      console.error('Error fetching suggestions:', error);
    });
});

// Fetch coordinates for selected address
document.getElementById('geocodeForm').addEventListener("submit", function(event) {
  event.preventDefault();
  
  const address = document.getElementById('address').value;

  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const location = data[0];

        localStorage.setItem("Latitude", location.lat);
        localStorage.setItem("Longitude", location.lon);
        localStorage.setItem("Location", location.display_name);

        document.querySelector("#errorMessage").style.color = "var(--error-green)";
        document.querySelector("#errorMessage").innerHTML = "Location set successfully!";
        document.getElementById("currentLocation").innerHTML = localStorage.getItem("Location");

        today = initApp();
        x = 0;

        setTimeout(() => {
            toggleSettings();
        }, 1000);
      } else {
        document.querySelector("#errorMessage").style.color = "var(--error-red)";
        document.querySelector("#errorMessage").innerHTML = "Location not found!";
      }
    })
    .catch(error => {
        console.error('Error fetching suggestions:', error);
    });
});

const zoom = () => {
    const scale = document.querySelector("#zoom").value;
    localStorage.setItem("scale", scale);
    document.querySelector(":root").style.setProperty("--scale", scale);

    toggleSettings();
}

document.querySelector("#setZoom").onclick = (e) => {
    e.preventDefault();
    zoom();
}

if (localStorage.getItem("scale")) {
    document.querySelector(":root").style.setProperty("--scale", localStorage.getItem("scale"));
}