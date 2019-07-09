// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

// Array to hold all brewery objects that fit the user's parameters
let breweries = [];

// Reference variable that will be turned into a div holding info on breweries that are OPEN atm (at the moment)
let openAtm = $('<div id="openAtm">');

// Reference variable that will be turned into a div holding info on breweries that are CLOSED atm (at the moment)
let closedAtm = $('<div id="closedAtm">');

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

// Variable to hold the number of AJAX calls sent to the Google API on a search
let ajaxCallNum = 0;

// Variable to hold the number of AJAX responses from the Google API
let ajaxRespNum = 0;

// Map variable to hold data for the map expanse
let map;


// Callback function from the map script at the end
function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        // Set the center on a little town in northern Kansas
        center: { lat: 39.381266, lng: -97.922211 },
        zoom: 4,
        // Disable the default UI map controls
        //don't need all controls
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    });
    let input = document.getElementById('pac-input');
    // Set up the autocomplete functionality for the address input
    let autocomplete = new google.maps.places.Autocomplete(input);
    // Set initial restrict to the greater list of countries.
    autocomplete.setComponentRestrictions(
        { 'country': ['us'] });
    // Specify only the data fields that are needed.
    autocomplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);
    // Autocomplete listener to trigger map movement based on new location
    autocomplete.addListener("place_changed", function () {
        let place = autocomplete.getPlace();
        console.log("place");
        console.log(place);
        // If the place has no geometry...
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }
        // Otherwise, it must have geometry, so...
        else {
            // Change the map so that it shows that place
            map.fitBounds(place.geometry.viewport);
        }
        // Then pull the relevant city/state data from the user query
        getCityState(place);
    });
}

// Function to pull city/state data based on address type data from the Google autocomplete data
function getCityState(place) {
    // Make sure the city and state fields are cleared
    city = "";
    state = "";
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

// Function to filter by brewery sizes selected (or to allow the default if none selected)
function brewerySizeFilter() {
    // Make sure the brewerySize array is empty before checking for selections and pushing them in
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
        // Automatically populate the array so breweries of all the sizes we care about will return
        // This hardcode prevents inclusion of breweries with types we don't want (i.e., planning, bar, proprietor, contract)
        brewerySize = ["brewpub", "micro", "regional", "large"];
    }
    // Console log the size array to test
    console.log(brewerySize);
}

// Function to retrieve the breweries from our APIs and mark them on the map
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
    // Reset the AJAX call/response number variables so you can track when all responses have come in
    ajaxCallNum = 0;
    ajaxRespNum = 0;
    // Ajax call for OpenBreweryDB
    $.ajax({
        url: queryURL + locationQuery,
        method: "GET"
    })
        // When the ajax call returns...
        .done(function (brewResp) {
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
                    // Right before you make the AJAX call, increment the callnumber variable
                    ajaxCallNum++;
                    // THE FOLLOWING IS CODE TO RUN AJAX CALLS THROUGH CORS ANYWHERE
                    // It's commented out to preserve the logic in case we're able to stand up our own CORS proxy
                    // But for now we're sticking with the proxy server Greg provided because we keep running into
                    // Rate limit and other strange errors
                    // Set the googleQuery up to route through CORS Anywhere to avoid CORS errors
                    // $.ajaxPrefilter(function (options) {
                    //     if (options.crossDomain && jQuery.support.cors) {
                    //         options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
                    //     }
                    // });
                    // Make an ajax call to the google maps API
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
                                    // this will allow for different attributes or icons to be added to the marker.  Need to discuss with team.
                                    /*
                                        brewMarks[brewIndex] = new google.maps.Marker({
                                            position: {
                                                lat: breweries[brewIndex].lat,
                                                lng: breweries[brewIndex].lng
                                            },
                                            map: map,
                                            icon: { url: "assets/images/green.png", scaledSize: new google.maps.Size(40, 40) },
                                            title: breweries[brewIndex].name,
                                            label: { text: brewNum.toString(), color: "#ffffff", fontSize: "20px", border:"0" }
                                        });
                                    */

                                    brewMarks[brewIndex] = new google.maps.Marker({
                                        position: {
                                            lat: breweries[brewIndex].lat,
                                            lng: breweries[brewIndex].lng
                                        },
                                        map: map,
                                        title: breweries[brewIndex].name,
                                        label: brewNum.toString()
                                    });

                                    //  console.log("name:" + name + " lat: " + breweries[brewIndex].lat + " lng: " + breweries[brewIndex].lng);
                                    //  console.log(googleResp);
                                    //  console.log(breweries);
                                    //add the brewerie to the list
                                    listBreweries(brewIndex);
                                    // Increment the brewIndex to so the next go round will use the right index for reference
                                    brewIndex++;
                                }
                            }
                            // As a last step before finishing with the AJAX response, increment the ajax response number
                            ajaxRespNum++;
                        });
                };
            };
            //daw need to display the show closed button
            // Append the openAtm div to the infoDisplay
            $("#infoDisplay").append(openAtm);
            // Create a button that will let users expand the information window to show closed breweries
            let displayToggle = $("<button>");
            // Apply an id to the button
            displayToggle.attr("id", "displayToggle");
            // Give it a data attribute that indicates whether the closed breweries are currently shown
            displayToggle.attr("data-state", "hidden");
            // Give it some text to describe what its function is
            displayToggle.text("Show closed breweries");
            // Append the button to the bottom of the dataOutput column so it's always at the bottom
            // whether the closed breweries are shown or not
            $("#dataOutput").append(displayToggle);
        });
};

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

// Function to populate the list of breweries
//daw change function to be called once passing in the index.
function listBreweries(i) {
    // If the brewery at the current index has an openNow property of true...
    if (breweries[i].openNow) {
        // Create a new div
        let newDiv = $("<div>");
        // Give the new div classes relevant to its status as an open brewery
        newDiv.addClass("brewery open-brewery");
        // Give the new div an ID equal to its Google place ID
        newDiv.attr("id", breweries[i].place_id);
        // Set the html of the new div
        newDiv.html(`<h5 id="brewName">${breweries[i].name}</h5>
            <div class="columns">
            <div class="column"><p>Map number: ${breweries[i].number}</p><p><strong>Open right now!</strong></p><p>Customer rating: ${breweries[i].rating}</p><a href="${breweries[i].website}" target="_blank">Website</a><p></div>
            <div class="column"><p>Address:</p><p>${breweries[i].address}</p></div>
            </div>`)
        // Append this newDiv to the openAtm div
        openAtm.append(newDiv);
    }
    // Otherwise, it must be closed, so...
    else {
        // Create a new div
        let newDiv = $("<div>");
        // Give the new div classes relevant to its status as a closed brewery
        newDiv.addClass("brewery closed-brewery");
        // Give the new div an ID equal to its Google place ID
        newDiv.attr("id", breweries[i].place_id);
        // Set the html of the new div
        newDiv.html(`<h5 id="brewName">${breweries[i].name}</h5>
            <div class="columns">
            <div class="column"><p>Map number: ${breweries[i].number}</p><p>Closed right now</p><p>Customer rating: ${breweries[i].rating}</p><a href="${breweries[i].website}" target="_blank">Website</a><p></div>
            <div class="column"><p>Address:</p><p>${breweries[i].address}</p></div>
            </div>`)
        // Append this newDiv to the openAtm div
        closedAtm.append(newDiv);
    }

}

// Function to display something when a marker on the map is clicked
function markerClicked() {
    alert("marker clicked");
}

// Button click event to initiate the search
$("#btnSubmit").on("click", function () {
    // Get rid of any existing displayToggle buttons and open/closed display divs
    $("#infoDisplay").empty();
    $("#displayToggle").remove();
    //daw clear open/closed before populating
    openAtm.empty();
    closedAtm.empty();
    // See if the user selected certain brewery types
    brewerySizeFilter();
    // Put the brewery markers on the map
    markBreweries();
});


// Button click event to toggle display for the list of breweries currently closed
$(document).on("click", "#displayToggle", function () {
    // If the data-state attribute says that the closed breweries are hidden...
    if ($(this).attr("data-state") === "hidden") {
        // Append the closedAtm div to the infoDisplay
        $("#infoDisplay").append(closedAtm);
        // Change the button text to indicate that it can be pressed again to hide the closed breweries
        $(this).text("Hide closed breweries");
        // Change the data-state attribute to reflect that the closed breweries are now visible
        $(this).attr("data-state", "visible");
    }
    // Otherwise, the breweries must already be showing, so...
    else {
        // Remove the closedAtm div from the dom
        $("#closedAtm").remove();
        // Change the button text to indicate that it can be pressed again to show the closed breweries
        $(this).text("Show closed breweries");
        // Change the data-state attribute to reflect that the closed breweries are now hidden
        $(this).attr("data-state", "hidden");
    }
})

