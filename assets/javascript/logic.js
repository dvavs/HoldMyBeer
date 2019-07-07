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

// Array to house the brewery size(s) specified by the user
let brewerySize = [];

// Map variable to hold data for the map expanse
let map;

// City/state not straightforward - need to loop through the components to find them by address type
function getCityState(place) {
    // Loop through the address components to find the city and state by type and populate globals
    for (let i = 0; i < place.address_components.length; i++) {
        let addressType = place.address_components[i].types[0];
        if (addressType === "administrative_area_level_1") {
            state = place.address_components[i].long_name;
        }
        else if (addressType === "locality") {
            city = place.address_components[i].long_name;
        }
    }
}

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

// Function to get rid of the markers currently on the map so new ones can be placed
function clearMarkers() {
    // Loop through the brewMarks array, for each...
    for (let i = 0; i < brewMarks.length; i++) {
        // Set the map display to null
        brewMarks[i].setMap(null);
    }
    // As the last step, empty the array of markers
    brewMarks = [];
}

// Function to mark the breweries on the map
function markBreweries() {
    // First, make sure the location query for the OpenBreweryDB API is set
    setLocationQuery();
    // Then set the general queryURL for the OpenBreweryDB API - limit to 20
    let queryURL = "https://api.openbrewerydb.org/breweries?per_page=20"
    // Before making the ajax call, make sure the breweries array is emptied
    breweries = [];
    // Clear any markers that have already been placed on the map
    clearMarkers();
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
                // If the brewery's size property can be found inside the array of sizes (either specified by user or auto populated if they specified none)
                if (brewerySize.indexOf(brewResp[i].brewery_type) > -1) {
                    // Create a name variable to reference the brewery name
                    let name = brewResp[i].name;
                    let queryName = name.split("&").join("").split("-").join("");
                    // Stipulate a query to the google maps API using the name, city, and state specified, as well as the specific "fields" we want data for
                    // Add /proxy/ to the beginning of the query URL so we avoid CORS errors
                    let googleQuery = `/proxy/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${queryName.split(" ").join("%20")}+${city}+${state}&inputtype=textquery&fields=photos,geometry,formatted_address,name,opening_hours,rating,place_id&key=AIzaSyBdbsiqFxjAUt8-qUuCt4dsHTdnnJSJ3iU`
                    // Make an ajax call to the google maps API using the url above
                    $.ajax({
                        url: googleQuery,
                        method: "GET"
                    })
                        // When the ajax call returns...
                        .done(function (googleRespStr) {
                            // Parse the string that returns from the AJAX call into JSON
                            let googleResp = JSON.parse(googleRespStr)
                            // First, make sure the google response was successful and has the "OK" status
                            if (googleResp.status === "OK") {
                                // Create a reference for the index of the candidates array returned by the Google call, default to 0
                                let googleIndex = 0;
                                // Create a reference for the name of the object at the googleIndex
                                let duplicateTestName = googleResp.candidates[0].name;
                                // Stipulate a boolean that says not to skip this google response
                                let skipThis = false;
                                // Check to see if the item at the googleIndex is a duplicate of something already in the breweries array
                                // Loop through items in the breweries array...
                                for (let i = 0; i < breweries.length; i++) {
                                    // If the object at index i has the googleName in its name property...
                                    if (breweries[i].name === duplicateTestName) {
                                        // Create a new index to test the next candidate
                                        let newIndex = googleIndex + 1;
                                        // Check to see whether there actually is another candidate you could choose from. If so...
                                        if (googleResp.candidates[newIndex] !== undefined) {
                                            // Change the google index
                                            googleIndex = newIndex;
                                            // This isn't the perfect solution because it assumes that the second option is not a duplicate
                                            // But it works for the edge cases we've encountered (haven't seen more than 2 entries)
                                            // Couldn't figure out how to do this in its own self-reiterating function because it got mad that the googleIndex wasn't defined at that level
                                        }
                                        // If there isn't another candidate to choose from...
                                        else {
                                            // Set the skipThis boolean to true
                                            skipThis = true;
                                        }
                                    }
                                }
                                console.log("skip this? " + skipThis);
                                // If skipThis isn't changed to be true after checking whether the current response is a duplicate...
                                if (!skipThis) {
                                    // Create a brewNum variable so the map number label for the brewery can be put inside its object
                                    let brewNum = brewIndex + 1
                                    // Create variables for elements that may not exist and default so all tags have values
                                    let openNowVar = false;
                                    let ratingVar = "N/A";
                                    // Make sure the open hours parent property exists, and the child
                                    if (googleResp.candidates[googleIndex].hasOwnProperty('opening_hours') && googleResp.candidates[googleIndex].opening_hours.hasOwnProperty('open_now')) {
                                        // If so, change the openNowVar to reflect the information
                                        openNowVar = googleResp.candidates[googleIndex].opening_hours.open_now;
                                    }
                                    // Make sure the rating property exists
                                    if (googleResp.candidates[googleIndex].hasOwnProperty('rating')) {
                                        // If so, change the ratingVar to reflect the information
                                        ratingVar = googleResp.candidates[googleIndex].rating;
                                    }
                                    // Create an object, fill it with the information from each API that we need
                                    let newBrew = {
                                        // Map number (equal to the current brew index +1)
                                        number: brewNum,
                                        // Name (from the Google name property)
                                        name: googleResp.candidates[googleIndex].name,
                                        // Type (from the OpenBreweryDB brewery_type property)
                                        type: brewResp[i].brewery_type,
                                        // Website (from the OpenBreweryDB website_url property)
                                        website: brewResp[i].website_url,
                                        // Address (from the Google formatted_address property)
                                        address: googleResp.candidates[googleIndex].formatted_address,
                                        // Rating (from the Google rating property)
                                        rating: ratingVar,
                                        // Open now boolean (from the Google open_hours open_now property)
                                        openNow: openNowVar,
                                        // Latitude (from the Google geometry location lat property)
                                        lat: googleResp.candidates[googleIndex].geometry.location.lat,
                                        // Longitude (from the Google geometry location lng property)
                                        lng: googleResp.candidates[googleIndex].geometry.location.lng,
                                        // Place id so we can get details if clicked on
                                        place_id: googleResp.candidates[googleIndex].place_id
                                    }
                                    // Push the newBrew[] object into the breweries array so we can use it later
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
                                    console.log("name:" + name + " lat: " + breweries[brewIndex].lat + " lng: " + breweries[brewIndex].lng);
                                    console.log(googleResp);
                                    console.log(breweries);
                                    // Increment the brewIndex to so the next go round will use the right index for reference
                                    brewIndex++;
                                    //console.log(breweries);
                                }
                            }
                        });
                };
            };
        });
};

function markerClicked() {
    alert("marker clicked");
}

// Function to filter by brewery sizes selected (or to allow the default if none selected)
function brewerySizeFilter() {
    // Make sure the brewerySize array is empty before checking for selections and pushingthem in
    brewerySize = [];
    // For each of the size selection checkboxes...
    $(".sizeSelect").each(function () {
        // If the box is checked...
        if ($(this).prop("checked") === true) {
            // Push the ID attribute of that checkbox into the sizes array
            brewerySize.push($(this).attr("id"));
        }
    });
    // If after filtering for the user's selections the array is empty...
    if (brewerySize.length === 0) {
        // Automatically populate the array so breweries of all sizes will return
        brewerySize = ["brewpub", "micro", "regional", "large"];
    }
    // Console log the size array to test
    console.log(brewerySize);
}

// Callback function from the map script at the end.  Not sure how that is working
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

    let card = document.getElementById('pac-card');
    let input = document.getElementById('pac-input');
    // var countries = document.getElementById('country-selector');

    //This put the card on top of the map   map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    //this setups up the autocomplete of the address input
    let autocomplete = new google.maps.places.Autocomplete(input);

    // Set initial restrict to the greater list of countries.
    autocomplete.setComponentRestrictions(
        { 'country': ['us'] });

    // Specify only the data fields that are needed.
    autocomplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);

    let infowindow = new google.maps.InfoWindow();
    let infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    //create a marker for the city
    let marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });


    //this triggers the reset of the map based on new location
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        // Set the marker to invisible so it doesn't actually appear on the map
        marker.setVisible(false);
        let place = autocomplete.getPlace();
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

        //initializze and get the city/state for the beer query
        city = "";
        state = "";
        getCityState(place);


    });

    //button to initiate the search
    $("#button").on("click", function (event) {
        //see if they've selected certain brewery types
        brewerySizeFilter();
        markBreweries();
    });

}