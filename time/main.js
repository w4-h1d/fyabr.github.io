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

////////////////////////////////////////////////////////////////////////////
////////////             END OF HELPER FUNCTIONS             //////////////
//////////////////////////////////////////////////////////////////////////
const timing = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

async function getTime (date) {

    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${localStorage.getItem("Latitude")}&longitude=${localStorage.getItem("Longitude")}?method=4`

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
        console.error("Cannot Connect to Interent!");

        document.querySelector("#errorMessage").style.color = "red";
        document.querySelector("#errorMessage").innerHTML = "Cannot Connect to Interent!";
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
    document.querySelector(".setting").classList.toggle("hidden");
    document.querySelector("#widget").classList.toggle("darken");
    document.querySelector("section").classList.toggle("darken-bg");
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

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();

    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        localStorage.setItem("Latitude", latitude);
        localStorage.setItem("Longitude", longitude);
        document.querySelector("#errorMessage").style.color = "green";
        document.querySelector("#errorMessage").innerHTML = "Coordinates Set Successfully!";

        today = initApp();
        x = 0;

        document.querySelector(".setting").classList.toggle("hidden");
        document.querySelector("#widget").classList.toggle("darken");
        document.querySelector("section").classList.toggle("darken-bg");
    } else {
        document.querySelector("#errorMessage").style.color = "red";
        document.querySelector("#errorMessage").innerHTML = "Invalid Coordinates!";
    }
});

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
    document.querySelector(".setting").classList.toggle("hidden");
    document.querySelector("#widget").classList.toggle("darken");
    document.querySelector("section").classList.toggle("darken-bg");
});






