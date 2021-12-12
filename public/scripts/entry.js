const locationElement = document.getElementById('location')
const weatherElement = document.getElementById('weather')
const createBtn = document.getElementById('createBtn')

var weatherRequest = new XMLHttpRequest();

createBtn.classList.add('bg-gray-400')

weatherRequest.onload = () => {
    if (weatherRequest.status != 200){
        weatherElement.value = null
    }else {
        jsonParsed = JSON.parse(weatherRequest.response)
        weatherElement.value = jsonParsed.weather[0].description
    }
    createBtn.disabled = false
    createBtn.classList.remove('bg-gray-400')
    createBtn.classList.add('bg-yellow-300')
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            locationElement.value= `${position.coords.latitude}:${position.coords.longitude}`
            weatherRequest.open('GET', `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&exclude=daily,hourly,minutely,alerts&appid=ddf41b6a9c50f295b6389305e6ddd2a5`)
            weatherRequest.send()
    });
}

// ddf41b6a9c50f295b6389305e6ddd2a5 - ev token
// 4420ec564fcac577e45ffba20f58e6d7 - my token
