
// Reference variable that will be turned into a div holding info on breweries that are OPEN atm (at the moment)
let openAtm = $('<div id="openAtm">');

// Reference variable that will be turned into a div holding info on breweries that are CLOSED atm (at the moment)
let closedAtm = $('<div id="closedAtm">');

// Reference for the place specified by the user
let place;

// Map variable to hold data for the map expanse
let map;

// Reference for the main marker indicating selected location
let mainMarker;

// Global ariable to hold the name of the city specified by the user
let city = "";

// Global variable to hold the name of the state specified by the user
let state = "";

// Global variable to hold the location query parameters for the OpenBreweryDB API search
let locationQuery = "";

// Array to house the brewery size(s) specified by the user
let brewerySize = [];

// Array to hold all the brewery markers for the map
let brewMarks = [];

// Array to hold all brewery objects that fit the user's parameters
let breweries = [];

// Counter variable to use for testing the possibility that we got no returns on the user's search parameters
let googleCallNum = 0;

// Index variable to count through the brewMarks and breweries variables in context where a for loop is impossible
let brewIndex = 0;

// Generic function to find an object within an array by a specific key:value pair
// Pass in the name of the array, the key you want to test, and the value you want to test for
function findObjectByKey(array, key, value) {
    // Loop through items in the array...
    for (var i = 0; i < array.length; i++) {
        // If the object at index i has the specified key:value pair...
        if (array[i][key] === value) {
            return i;
        }
    }
    // If you don't get an index from the above for loop, return null
    return null;
}

// Callback function from the map script at the end
function initMap() {
    // Initialize the map
    map = new google.maps.Map(document.getElementById("map"), {
        // Set the center on a little town in northern Kansas
        center: { lat: 39.381266, lng: -97.922211 },
        zoom: 4,
        // Disable the default UI map controls
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
        //need to clear the pins when place changed.
        if (mainMarker !== undefined) {
            mainMarker.setMap(null);   
        }
        clearMarkers();

        //clear out the list of previous breweries
        $("#infoDisplay").empty();

        // Set the place variable equal to the user's suggestion

        place = autocomplete.getPlace();
        // Clear the marker from any possible previous locations selected
        console.log("place");
        console.log(place);
        // If the place has no geometry...
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed
            $("#error-modal").addClass("is-active");
            $("#error-msg").html(`<p>No location was returned for your input: ${place.name}.</p>
            <p>Please select from one of the autocomplete suggestions.</p>`)
            return;
        }
        // Otherwise, it must have geometry, so...
        else {
            // Change the map so that it shows that place
            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            console.log("zoom: " + map.getZoom());
            // Format the main marker object to hold data relevant to the selected location
            mainMarker = new google.maps.Marker({
                map: map,
                title: place.name,
                icon: { url: "assets/images/yellow.png", scaledSize: new google.maps.Size(40, 40) },
                anchorPoint: new google.maps.Point(0, -29)
            });
            // Set the position of the marker
            mainMarker.setPosition(place.geometry.location);
            // Call the setMap method again to make the new main marker appear
            mainMarker.setMap(map);
            console.log("zoom1: " + map.getZoom())
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
    // Before making the ajax call, make sure the breweries array is emptied
    breweries = [];
    // Reset the google call number counter to zero
    googleCallNum = 0;
    // Reset the brewIndex to zero for counting through the brewMarks and breweries arrays
    brewIndex = 0;
    // Clear whatever is in the current info display
    $("#infoDisplay").empty();
    // Clear any markers that have already been placed on the map
    clearMarkers();
    // Make sure the location query for the OpenBreweryDB API is set
    setLocationQuery();
    // Then set the general queryURL for the OpenBreweryDB API - limit to 20
    let queryURL = "https://api.openbrewerydb.org/breweries?per_page=50"
    // Setup the ajax prefilter to route through our dedicated CORS server
    $.ajaxPrefilter(function (options) {
        options.url = 'https://dvavs-hmb-cors-proxy.herokuapp.com/' + queryURL + locationQuery;
    });
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
                    // Increment the google call number so we can test it later to see if we need to tell the user we got no returns
                    googleCallNum++;
                    // Create a name variable to reference the brewery name
                    let name = brewResp[i].name;
                    let queryName = name.split("&").join("").split("-").join("");
                    // Stipulate a query to the google maps API using the name, city, and state specified, as well as the specific "fields" we want data for
                    // Add /proxy/ to the beginning of the query URL so we avoid CORS errors
                    let googleQuery = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${queryName.split(" ").join("%20")}+${city}+${state}&inputtype=textquery&fields=photos,geometry,formatted_address,name,opening_hours,rating,place_id&key=AIzaSyBdbsiqFxjAUt8-qUuCt4dsHTdnnJSJ3iU`
                    // Setup the ajax prefilter to route through our dedicated CORS server
                    $.ajaxPrefilter(function (options) {
                        if (options.crossDomain && jQuery.support.cors) {
                            options.url = 'https://dvavs-hmb-cors-proxy.herokuapp.com/' + googleQuery;
                        }
                    });
                    // Make an ajax call to the google maps API
                    $.ajax({
                        url: googleQuery,
                        method: "GET"
                    })
                        // When the ajax call returns...
                        .done(function (googleResp) {
                            // Parse the string that returns from the AJAX call into JSON
                            // let googleResp = JSON.parse(googleRespStr) ---- Keep this in case we need to revert back to /proxy/ method
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
                                    // Create a marker for each brewery, does not need unique name
                                    brewMarks[brewIndex] = new google.maps.Marker({
                                        position: {
                                            lat: breweries[brewIndex].lat,
                                            lng: breweries[brewIndex].lng
                                        },
                                        map: map,
                                        title: breweries[brewIndex].name,
                                        label: brewNum.toString()
                                    });
                                    // GOOGLE INFO WINDOW DISPLAY ON CLICK
                                    // Seems like the better option to go with to me - not as stylized but better functionality
                                    // Stipulate the content for the info window
                                    let openStr = function(obj) {
                                        if (obj.open) {
                                            return "Open right now";
                                        } else {
                                            return "Closed right now";
                                        }
                                    };
                                    let infoContent = `<div id="infoWindow">
                                    <div id="infoWindowTitle">${newBrew.name}</div>
                                    <div id="infoWindowContent">
                                    <p>${openStr(newBrew)}</p>
                                    <p><a target="_blank" href="https://www.google.com/maps/dir/?api=1&destination=${newBrew.address}&dir_action=navigate">Get directions</a>
                                    </div>
                                    </div>`;
                                    let infoWindow = new google.maps.InfoWindow({
                                        content: infoContent
                                    });
                                    // Set a listener to call the modal when the marker is clicked
                                    google.maps.event.addListener(brewMarks[brewIndex], 'click', function () {
                                        // Call the info window associated with this marker
                                        infoWindow.open(map, this)


                                        // MODAL DISPLAY ON CLICK
                                        // Commented out because I couldn't figure out how to move the modal - so might not be our best option

                                        // // Set the text for the header of the modal to show the brewery name
                                        // $("#marker-title").text(newBrew.name);
                                        // // Set the css of the modal to position its bottom right corner at the place where the click occurred
                                        // $("#marker-modal").css({
                                        //     bottom: event.pageY,
                                        //     right: event.pageX
                                        // })
                                        // // Give the modal a class is-active so it displays on the screen
                                        // $("#marker-modal").addClass("is-active");
                                    });
                                    // Add the brewery to the list
                                    listBreweries(brewIndex);
                                    // Increment the brewIndex to so the next go round will use the right index for reference
                                    brewIndex++;
                                    // Console log the set of breweries that should be displayed to test
                                    console.log(breweries);
                                }
                            }
                        });
                };
            };
            // Now that the loop through the BrewResp is over
            // If the googleCallNum is still equal to zero...
            if (googleCallNum === 0) {
                // That means we got no hits on the user's search parameters
                // So show an error message to that effect
                $("#error-modal").addClass("is-active");
                $("#error-msg").html(`<p>We didn't find any breweries of the type you asked for in ${place.name}.</p>
                    <p><strong>Are you sure you really want to go there?</strong></p>`);
                // Also say something in the info display
                $("#infoDisplay").prepend("<p>Sorry about that. Try another search!</p>")
            }
            // Otherwise, there is at least one brewery on the list, so...
            else {
                // Append the openAtm div to the infoDisplay
                $("#infoDisplay").append(openAtm);
                // Count the number of divs inside the openAtm div
                let openCount = $("#openAtm .brewery").length;
                // If there are no open breweries...
                if (openCount === 0) {
                    // Display a message to that effect inside the info display
                    $("#infoDisplay").prepend($("<h1>Nobody's open at this hour!</h1>"))
                }
                // Create a button that will let users expand the information window to show closed breweries
                let displayToggle = $("<button>");
                // Apply a class and an id to the button
                displayToggle.attr("class", "button is-warning")
                displayToggle.attr("id", "displayToggle");
                // Give it a data attribute that indicates whether the closed breweries are currently shown
                displayToggle.attr("data-state", "hidden");
                // Give it some text to describe what its function is
                displayToggle.text("Show who's closed right now");
                // Append the button to the bottom of the dataOutput column so it's always at the bottom
                // whether the closed breweries are shown or not
                $("#dataOutput").append(displayToggle);
            }
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
function listBreweries(i) {
    // If the brewery at the current index has an openNow property of true...
    if (breweries[i].openNow) {
        // Create a new open brewery div
        let newDiv = $("<div>");
        // Give the new div classes relevant to its status as an open brewery
        newDiv.addClass("brewery open-brewery");
        // Give the new div an ID equal to its Google place ID
        newDiv.attr("id", breweries[i].place_id);
        // Set the html of the new div
        newDiv.html(`<h5 id="brewName">${breweries[i].name}</h5>
            <div class="columns">
            <div class="column"><p>Map number: ${breweries[i].number}</p><p class="open">Open right now!</p><p>Customer rating: ${breweries[i].rating}</p><a href="${breweries[i].website}" target="_blank">Website</a><p></div>
            <div class="column"><p>Address:</p><p>${breweries[i].address}</p></div>
            </div>`)
        // Append this newDiv to the openAtm div
        openAtm.append(newDiv);
    }
    // Otherwise, it must be closed, so...
    else {
        // Create a new closed brewery div
        let newDiv = $("<div>");
        // Give the new div classes relevant to its status as a closed brewery
        newDiv.addClass("brewery closed-brewery");
        // Give the new div an ID equal to its Google place ID
        newDiv.attr("id", breweries[i].place_id);
        // Set the html of the new div
        newDiv.html(`<h5 id="brewName">${breweries[i].name}</h5>
            <div class="columns">
            <div class="column"><p>Map number: ${breweries[i].number}</p><p class="closed">Closed right now</p><p>Customer rating: ${breweries[i].rating}</p><a href="${breweries[i].website}" target="_blank">Website</a><p></div>
            <div class="column"><p>Address:</p><p>${breweries[i].address}</p></div>
            </div>`)
        // Append this newDiv to the openAtm div
        closedAtm.append(newDiv);
    }
}

// Button click event to initiate the search
$("#btnSubmit").on("click", function () {
    // Get rid of any existing displayToggle buttons and open/closed display divs
    $("#infoDisplay").empty();
    $("#displayToggle").remove();
    //Clear open/closed divs before populating
    openAtm.empty();
    closedAtm.empty();
    // See if the user selected certain brewery types
    brewerySizeFilter();
    // Put the brewery markers on the map
    markBreweries();
    //if an address is selected, let's zoom out so we can see the breweries.
    console.log("zoom 3: " + map.getZoom())
});

// Button click event to toggle display for the list of breweries currently closed
$(document).on("click", "#displayToggle", function () {
    // If the data-state attribute says that the closed breweries are hidden...
    if ($(this).attr("data-state") === "hidden") {
        // Append the closedAtm div to the infoDisplay
        $("#infoDisplay").append(closedAtm);
        // Change the button text to indicate that it can be pressed again to hide the closed breweries
        $(this).text("Hide who's closed right now");
        // Change the data-state attribute to reflect that the closed breweries are now visible
        $(this).attr("data-state", "visible");
    }
    // Otherwise, the breweries must already be showing, so...
    else {
        // Remove the closedAtm div from the dom
        $("#closedAtm").remove();
        // Change the button text to indicate that it can be pressed again to show the closed breweries
        $(this).text("Show who's closed right now");
        // Change the data-state attribute to reflect that the closed breweries are now hidden
        $(this).attr("data-state", "hidden");
    }
})

// Button click event for close-modal buttons
$(".delete").on("click", function () {
    // Whatever modal is open, close it on click of a modal-close button
    $("#error-modal").attr("class", "modal");
    $("#marker-modal").attr("class", "modal");
});