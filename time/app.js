const suggestionsDiv = document.getElementById('suggestions');
const resultDiv = document.getElementById('result');

// Function to fetch suggestions
document.getElementById('address').addEventListener('input', function() {
  const address = this.value;

  if (address.length < 3) {
    suggestionsDiv.innerHTML = ''; // Clear suggestions if the input is too short
    return;
  }

  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=3`;

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
document.getElementById('geocodeForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const address = document.getElementById('address').value;
  resultDiv.innerHTML = 'Looking up coordinates...';

  const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const location = data[0];
        resultDiv.innerHTML = `Coordinates: Latitude = ${location.lat}, Longitude = ${location.lon}`;
      } else {
        resultDiv.innerHTML = `No results found for "${address}".`;
      }
    })
    .catch(error => {
      resultDiv.innerHTML = `Error: ${error.message}`;
    });
});
