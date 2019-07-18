# Hold my Beer

**Hold My Beer (HMB)** was developed as the first group project assignment for the University of Richmond Web Development Bootcamp (May - October 2019 cohort).

https://dvavs.github.io/Firefoxes_Bootcamp_Proj1/


## The Who

### Team Firefoxes

Team Firefoxes is composed of:

**Deb**
*JavaScript Ninja and Master of Google Maps API*

**Dylan**
*JavaScript Maverick and Vanquisher of CORS Errors*

**Tori**
*UI/UX Smith, HTML/CSS Guru, and Aesthetic Genius*


## The What

**HMB** is an app that allows users to search a state or city/state for breweries fitting their choice of size. User can choose between:

Brewpubs- *Breweries that sell beer brewed on the premises, typically without distribution outside of the premises.*

Microbreweries - *Breweries that produce limited quantities, often of specialized types of beer. Often only distribute within a small, local geographic area.*

Regional Breweries - *Breweries that produce between 15,000 to 6,000,000 barrels per year. A huge range, we know. The point is, they distribute across a wider geographic area - usually several states at least.*

Domestic (or "Large") Breweries - *Breweries that produce over 6 million barrels per year. These are your very widely-known producers, for instance Anheuser-Busch.*


**HMB** allows users to display all breweries in an area, or to selectively filter out any breweries that may not be currently open (in case they are in need of a beer *stat*).


**HMB** will show users information about each brewery within their search parameters, including such details as:
* Whether it is open *right now*.
* Its website URL.
* Its phone number.
* Its address.

It also provides a link to Google Maps to help users find their way to the brewery!


## The Why

**HMB** was developed with the traveling beer enthusiast in mind. We wanted to make an app that would help a person who was planning a trip to a new city - or who may find themselves in a new city with time to spare - the opportunity to fully explore and experience that area's alcotourism. That being said, it is equally suited to helping users find interesting breweries in their own local areas that they may not have known about before, or that they did not realize were open this late on a Tuesday.


## The How

### Major Features and Functionality

#### Alternative Style, Look, & Feel

**HMB** utilizes the [Bulma](https://bulma.io/documentation/overview/start/) CSS framework to switch things up from what has so far been the dominant status of BootStrap in our bootcamp. We wanted to try something new and were thoroughly pleased with the design options it gave us.

#### API Integration

**HMB** primarily relies upon two APIs to perform its work: the OpenBreweryDB API and the Google Places API.

[OpenBreweryDB](https://www.openbrewerydb.org/) is an open-source service that hosts information about breweries across the United States in JSON format. For this project, we utilized it primarily for brewery information including phone numbers and size classifications.

The [Google Places API](https://developers.google.com/places/web-service/search) allowed us to retrieve even more detailed information about the breweries identified by the OpenBreweryDB, including website URLs, and allowed us to retrieve real-time data about whether breweries are open at the time of search. Additionally, this API afforded us numerous functions such as mapping brewery locations and producing popups upon clicking said mapped locations.

***Cascading AJAX Calls to API***

The logic of this app relies on a primary query to the OpenBreweryDB. Based upon the response of that query, the app may display a message to users relating the fact that no breweries (at all or of their specified size) have been found in the area of choice, utilizing Bulma's modal element styles. If breweries are found from the query to OpenBreweryDB, those breweries are then passed one by one into a series of subsequent AJAX calls to the Google Places API. Each of these calls returns even more information on the brewery, including latitude/longitude and whether the brewery is open at the time of the AJAX call. Data from both API calls are then used to create JavaScript objects which can later be called for the sake of displaying data to the user.

#### Autocompleted Location Search Query

**HMB** utlizes the Google autocomplete address web service to predict users' location searches and provide them with standardized address formats. This feature limits the geographic range of a user's search to the United States because that is the extent to which our integration of the OpenBreweryDB API provides data.

#### User Query Validation

As mentioned above, **HMB**'s location search field - created using the [Google Autocomplete API](https://developers.google.com/places/web-service/autocomplete) - limits user addres/city/state input to the geographic range of the United States. In addition, it validates user input, requiring that at least a state be included in the search terms.

#### Brewery Size Filter

**HMB** allows users to specify the size of brewery they are interested in seeing from among four different types by checking boxes. The JavaScript function that retrieves user specifications from these checkboxes is set to include all of them by default if a user fails to check any. In this way, the app protects users from their own potential inattentiveness and ensures that breweries with types such as "planning", "contract", "proprietor", or "bar" (brewery types that we, the developers, decided were not something we wished to include in our user experience) do not ever return from the call to the OpenBreweryDB. 

#### Open vs. Closed Brewery Filter

Additionally, **HMB** allows users to specify that they would only like to be shown breweries that are open at the time of their search. This feature is especially useful to those who may be attempting to use the app in real time to decide where they would like to go right now.

#### Google Maps Display

Upon page load, **HMB**'s HTML makes a call to the Google Maps API to display a map of the United States. When a user specifies a location, using the autocomplete functionality outlined above, the map dynamically zooms into the location of their choosing. Upon subsequent searches, the map continues to move to the location specified. After searching, the interactive map allows users to move in any direction as well as zoom in and out, and gives users the option to view the map full-screen. Map movement and display are enabled such that users can interact with the map even without searching for breweries.

#### Map Marking Functionality

When a user selects their brewery search parameters and presses the submit button, a pin is added to the map for ever brewery fitting those parameters (up to a total possible maximum of 50 - the maximum possible return from the OpenBreweryDB). These pins are placed at the exact longitude and latitude of the breweries, and are configured by JavaScript to show popups when clicked. Pin popups display information about the brewery including phone number, address, open status, and provide a link to the brewery's website as well as a link to Google Maps that incorporates the user's location and the brewery address to provide directions to it.

Prior to brewery specification - when a user simply defines an area of interest in the Google Autocomplete search bar - the map creates a marker (formatted to distinguish it from the brewery pins) at that location. In this way, users are provided with a visual cue about the distance between any breweries returned and their specific search location. This feature is particularly useful to people who may enter a specific address - for example, the address of the hotel at which they are staying.

#### Brewery Listings

**HMB** also provides users with a scrolling list of the breweries meeting their criteria, which appears below the map. This list provides similar data to that found in the map marker popups, and is configured so that breweries that are open at the time of the search appear at the top.

#### Dedicated CORS Proxy Server

In order to serve users effectively, **HMB** makes numerous AJAX requests to APIs. Because it is run from the client's browser directly, rather than routing through a server, this results in frequent denial of API requests due to CORS issues. A proxy server is needed to format the API requests in such a manner that they will return the desired data. However, publicly available options such as [CORS Anywhere](https://cors-anywhere.herokuapp.com/) limit the rate at which they will accept requests from outside domains. During testing we found that we needed to make more requests to the APIs than the rate limit of CORS Anywhere would allow - and this would also likely be an issue in the event of heavy app use after deployment. As a result, we forked the [CORS Anywhere GitHub repository](https://github.com/Rob--W/cors-anywhere) to build and host our own [**HMB**-dedicated CORS proxy server](https://dvavs-hmb-cors-proxy.herokuapp.com/). Our app's deployed URL was given unlimited access to the server, and we were able to set our own rate limit to suit our testing needs (and reduce it after deployment to prevent abuse of the proxy).
