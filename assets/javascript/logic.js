// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// Array to hold all brewery objects that fit the user's parameters
let breweries = [];

// Array to hold all the brewery markers for the map
let brewMarks = [];

// Index variable to count through the brewMarks and breweries variables in context where a for loop is impossible
let brewIndex = 0;

// Global ariable to hold the name of the city specified by the user
let city = "";

// Global variable to hold the name of the state specified by the user
let state = "";

// Global variable to hold the location query parameters for the OpenBreweryDB API search
let locationQuery = "";

// Array to house the brewery size specified by the user
// Defaults to holding all of them, so that if a user doesn't choose any specific sizes it will search for all
let brewerySize = ["brewpub", "micro", "regional", "large"];

// Map variable to hold data for the map expanse
let map;

// Function to set the location query
function setLocationQuery() {
    // Temp variable to hold the city information
    let cityLoc = "";
    // If the user did in fact specify a cty...
    if (city !== "") {
        // Set cityLoc to a query string that will return breweries for that city
        cityLoc = "&by_city=" + city;
    }
    // Set the global location query with state and city information
    locationQuery = "&by_state=" + state + cityLoc;
}

// Function to mark the breweries on the map
function markBreweries(map) {
    // First, make sure the location query for the OpenBreweryDB API is set
    setLocationQuery();
    // Then set the general queryURL for the OpenBreweryDB API
    let queryURL = "https://api.openbrewerydb.org/breweries?per_page=50"
    // Before making the ajax call, make sure the breweries array is emptied
    breweries = [];
    // Also empty the array of markers for the map
    brewMarks = [];
    // Reset the brewIndex to zero for counting through the brewMarks and breweries arrays
    brewIndex = 0;
    // Ajax call for OpenBreweryDB
    $.ajax({
        url: queryURL + locationQuery,
        method: "GET"
    })
        // When the ajax call returns...
        .then(function (brewResp) {
            console.log(brewResp);
            // Loop through the breweries returned one at a time...
            for (let i = 0; i < brewResp.length; i++) {
                // If the brewery's size property can be found inside the array of sizes that the user specified...
                if (brewerySize.indexOf(brewResp[i].brewery_type) > -1) {
                    // Create a name variable to reference the brewery name
                    let name = brewResp[i].name;
                    let queryName = name.split("&").join("").split("-").join("");
                    // Stipulate a query to the google maps API using the name, city, and state specified, as well as the specific "fields" we want data for
                    // Add /proxy/ to the beginning of the query URL so we avoid CORS errors
                    let googleQuery = `/proxy/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${queryName.split(" ").join("%20")}+${city}+${state}&inputtype=textquery&fields=photos,geometry,formatted_address,name,opening_hours,rating&key=AIzaSyBdbsiqFxjAUt8-qUuCt4dsHTdnnJSJ3iU`
                    // Make an ajax call to the google maps API using the url above
                    $.ajax({
                        url: googleQuery,
                        method: "GET"
                    })
                        // When the ajax call returns...
                        .done(function (googleRespStr) {
                            let googleResp = JSON.parse(googleRespStr)
                            // Create a brewNum variable so the map number label for the brewery can be put inside its object
                            let brewNum = brewIndex + 1
                            // Create an object, fill it with the information from each API that we need
                            let newBrew = {
                                // Map number (equal to the current brew index +1)
                                number: brewNum,
                                // Name (from the name variable created earlier)
                                name: name,
                                // Type (from the OpenBreweryDB brewery_type property)
                                type: brewResp[i].brewery_type,
                                // Website (from the OpenBreweryDB website_url property)
                                website: brewResp[i].website_url,
                                // Address (from the Google formatted_address property)
                                address: googleResp.candidates[0].formatted_address,
                                // Rating (from the Google rating property)
                                rating: googleResp.candidates[0].rating,
                                // Open now boolean (from the Google open_hours open_now property)
                                openNow: googleResp.candidates[0].opening_hours.open_now,
                                // Location (from the Google geometry property)
                                location: googleResp.candidates[0].geometry.location,
                                // Latitude (from the Google geometry location lat property)
                                lat: googleResp.candidates[0].geometry.location.lat,
                                // Longitude (from the Google geometry location lng property)
                                lng: googleResp.candidates[0].geometry.location.lng,
                            }
                            // Push the newBrew object into the breweries array so we can use it later
                            breweries.push(newBrew);
                            // Create a new marker and put it on the map
                            brewMarks[brewIndex] = new google.maps.Marker({
                                position: {
                                    lat: breweries[brewIndex].lat,
                                    lng: breweries[brewIndex].lng
                                },
                                map: map,
                                title: breweries[brewIndex].name,
                                label: brewNum.toString()
                            })
                            // Increment the brewIndex to so the next go round will use the right index for reference
                            brewIndex++;
                            console.log(breweries);
                        });
                };
            };
        });
};

function markerClicked() {
    alert("marker clicked");
}

//callback function from the map script at the end.  Not sure how that is working
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        //37.5407246, lng: -77.4360481  --Richmond
        //39.381266 N,-97.922211 W  --USA
        //center: {lat: 50.064192, lng: -130.605469},
        center: { lat: 39.381266, lng: -97.922211 },
        zoom: 4,
        disableDefaultUI: true      //don't display any of the controls.  May want to change this after
        //mapTypeControl: false
    });

    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    // var countries = document.getElementById('country-selector');

    //This put the card on top of the map   map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    //this setups up the autocomplete of the address input
    var autocomplete = new google.maps.places.Autocomplete(input);

    // Set initial restrict to the greater list of countries.
    autocomplete.setComponentRestrictions(
        { 'country': ['us'] });

    // Specify only the data fields that are needed.
    autocomplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    //create a marker for the city
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });


    //this triggers the reset of the map based on new location
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        // Set the marker to invisible so it doesn't actually appear on the map
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        console.log("place");
        console.log(place);

        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(false);

        //add a listener for the marker
        marker.addListener('click', markerClicked);
        console.log("address: " + place.address_components);
        console.log("geometry: " + place.geometry.location);    //lat and lng
        console.log("icon: " + place.icon);
        console.log("name: " + place.name);
        console.log("viewport: " + place.geometry.viewport);

        //this will display city/state for the initial pin
        if (place.address_components) {
            city = (place.address_components[0] && place.address_components[0].short_name || '');
            state = (place.address_components[1] && place.address_components[1].long_name || '');
        }

        markBreweries(map);
    });
}