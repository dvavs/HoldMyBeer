// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function markBreweries(map) {
    var deb = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.5407246,-77.4360481&radius=16000&keyword=brewery&key=AIzaSyBdbsiqFxjAUt8-qUuCt4dsHTdnnJSJ3iU";
    /*  $.ajax({ url: queryURL + search + apiKey, method: 'GET' })
            .done(function (giflist) {*/

    //hardcoded for testing
    var richmondBreweries =
    {
        "html_attributions": [],
        "next_page_token": "CqQCHgEAAE1YimZ9hHOjqG1oiRcQ2p9w6eInsxpBbsJNSZE4rWgGijHGICyDkb2qItwcxtdOohmbKnwLAU9E7HuksNoByPtSYUP0E083GcCPivJ0Hre5X_KcjyT6C9qgFiZCuOEvAfn5Nm1rjmd5kFuEgPjxUXm5GnIwlWo-XKWyDMh0I6xYKCDgKVb61n_uVX28H63og6jqnqLrII0QIgPxiHMPcUS2hv4_8JYeaqYHbzwzpl6vnpZHwODmHtKMaXewF3Rw0XI3ajVHPhXSUwL_IuxUryess8DFkb4EzBPi70eL98FBDeSTc3SYpwJnwshSDx6cCtotlVdeXx8w0E7eCYJMNq82Vlg6X5dc4ORLG6LkpQ-NUdmCgrJxEKkA35xPesMCZhIQkdlImGjpHCtIMATA7c2LSBoU3uCWsSCNLlTq5RWIl26v8qJnYpQ",
        "results": [
            {
                "geometry": {
                    "location": {
                        "lat": 37.5211249,
                        "lng": -77.4127001
                    },
                    "viewport": {
                        "northeast": {
                            "lat": 37.5228112,
                            "lng": -77.40971665000001
                        },
                        "southwest": {
                            "lat": 37.51960599999999,
                            "lng": -77.41692245
                        }
                    }
                },
                "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
                "id": "95c2e79d1ba1464986ba455464af10205cd621ac",
                "name": "Stone Brewing Tap Room - Richmond",
                "opening_hours": {
                    "open_now": true
                },
                "photos": [
                    {
                        "height": 4032,
                        "html_attributions": [
                            "\u003ca href=\"https://maps.google.com/maps/contrib/109206062470901955675/photos\"\u003eWilliam Wyandt\u003c/a\u003e"
                        ],
                        "photo_reference": "CmRZAAAAtvkK5Rltjwqi5lAOTwmyXC0Gfiw40zpLsdia3fKUaFV20oVIZ6eSlSdegiu8zcR6lzxBTosb_SNMiw6WpFTm0yLNUZY5UWY5BsdBUgCXLzoIDroncAt_Qb4m_H4VXOMnEhAxi8Cv_NvhJKBfJ_8ZihqNGhSgfpOC1eEdayuWMUSaCCrdSTdE3g",
                        "width": 3024
                    }
                ],
                "place_id": "ChIJwSiejvAQsYkRG3KWUQTG0sw",
                "plus_code": {
                    "compound_code": "GHCP+CW Richmond, Virginia, USA",
                    "global_code": "8794GHCP+CW"
                },
                "rating": 4.5,
                "reference": "ChIJwSiejvAQsYkRG3KWUQTG0sw",
                "scope": "GOOGLE",
                "types": ["food", "point_of_interest", "establishment"],
                "user_ratings_total": 220,
                "vicinity": "4300 Williamsburg Ave, Richmond"
            },
            {
                "geometry": {
                    "location": {
                        "lat": 37.564458,
                        "lng": -77.47213499999999
                    },
                    "viewport": {
                        "northeast": {
                            "lat": 37.56567287989272,
                            "lng": -77.47096837010729
                        },
                        "southwest": {
                            "lat": 37.56297322010727,
                            "lng": -77.47366802989272
                        }
                    }
                },
                "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png",
                "id": "52f0e490883136791c1bffa2cb006c84ddd3f0e3",
                "name": "Three Notch'd Brewing Company - RVA Collab House",
                "opening_hours": {
                    "open_now": false
                },
                "photos": [
                    {
                        "height": 2340,
                        "html_attributions": [
                            "\u003ca href=\"https://maps.google.com/maps/contrib/103443902826247253772/photos\"\u003etom fauquet\u003c/a\u003e"
                        ],
                        "photo_reference": "CmRaAAAAi_WBZ1EfSwZWe55RL0e7m2VtG-eLCtPS2TKmOhnHItlMrKu4qvZWfJKJmiEkbu5jjjiE8TAde7LKoWPqtxLkLHXZHt0ObxVjPx8Mb8AtrRC4DLvgKnwpOpeDkhd2C9CZEhCbP4Qgjk5R4ZzIBVZltrmEGhQ77tRaPILJaIbXScEt_LQPoaucXw",
                        "width": 4160
                    }
                ],
                "place_id": "ChIJhd9SQgAUsYkRj-seDhXVxPo",
                "plus_code": {
                    "compound_code": "HG7H+Q4 Richmond, Virginia, USA",
                    "global_code": "8794HG7H+Q4"
                },
                "rating": 4.6,
                "reference": "ChIJhd9SQgAUsYkRj-seDhXVxPo",
                "scope": "GOOGLE",
                "types": ["food", "point_of_interest", "establishment"],
                "user_ratings_total": 136,
                "vicinity": "2930 W Broad St, Richmond"
            }

        ]
    }
    var results = richmondBreweries.results;
    console.log("results");
    console.log(results);
    var marker = [];
    //loop through the result set and put markers on the map
    for (var i = 0; i < results.length; i++) {
        console.log("results[i].geometry.location");
        console.log(results[i].geometry.location);
        //add marker to the map
        marker[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            map: map,
            title: results[i].name,
            label: i
        });
        //add a listener for the marker
        marker[i].addListener('click', markerClicked);
    }
};


function markerClicked() {
    alert("marker clicked");
}

//callback function from the map script at the end.  Not sure how that is working
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
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
        marker.setVisible(true);

        //add a listener for the marker
        marker.addListener('click', markerClicked);
        console.log("address: " + place.address_components);
        console.log("geometry: " + place.geometry.location);    //lat and lng
        console.log("icon: " + place.icon);
        console.log("name: " + place.name);
        console.log("viewport: " + place.geometry.viewport);

        //this will display city/state for the initial pin
        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),    //city
                (place.address_components[1] && place.address_components[1].short_name || '')     //state
                // (place.address_components[2] && place.address_components[2].short_name || '')   country
            ].join(' ');
        }

        marker.setTitle(address);
        //need to call the function to get the breweries to plot

        markBreweries(map);

        //stuff below show a marker with the city/state stuff.  Don't think we need
        //  infowindowContent.children['place-icon'].src = place.icon;
        //  infowindowContent.children['place-name'].textContent = place.name;
        //  infowindowContent.children['place-address'].textContent = address;
        //  infowindow.open(map, marker);

    });

    /* Sets a listener on a given radio button. The radio buttons specify
    // the countries used to restrict the autocomplete search.
    function setupClickListener(id, countries) {
      var radioButton = document.getElementById(id);
      radioButton.addEventListener('click', function() {
        autocomplete.setComponentRestrictions({'country': countries});
      });
    }
 
    setupClickListener('changecountry-usa', 'us');
    setupClickListener(
        'changecountry-usa-and-uot', ['us', 'pr', 'vi', 'gu', 'mp']);*/
}