# Hold my Beer

**Hold My Beer (HMB)** was developed as the first group project assignment for the University of Richmond Web Development Bootcamp (May - October 2019 cohort).


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

#### API Integration

**HMB** integrates two APIs to perform its work: the OpenBreweryDB API and the Google Places API.

[OpenBreweryDB](https://www.openbrewerydb.org/) is an open-source service that hosts information about breweries across the United States in JSON format. For this project, we utilized it primarily for brewery information including phone numbers and size classifications.

The [Google Places API](https://developers.google.com/places/web-service/search) allowed us to retrieve even more detailed information about the breweries identified by the OpenBreweryDB, including website URLs, and allowed us to retrieve real-time data about whether breweries are open at the time of search. Additionally, this API afforded us numerous functions such as mapping brewery locations and producing popups upon clicking said mapped locations.

###### Cascading AJAX Calls to API

The logic of this app relies on a primary query to the OpenBreweryDB. Based upon the response of that query, the app may display a message to users relating the fact that no breweries (at all or of their specified size) have been found in the area of choice, 

#### Autocompleted Location Search Query

**HMB** utlizes the Google autocomplete address web service to predict users' location searches and provide them with standardized address formats. This feature limits the geographic range of a user's search to the United States because that is the extent to which our integration of the Open


#### User Query Validation




#### Brewery Size Filter




#### Open vs. Closed Brewery Filter




#### Google Maps Display




#### Map Marking Functionality




#### Brewery Listings




#### Dedicated CORS Proxy Server




#### Alternative Style, Look, & Feel

**HMB** utilizes the [Bulma](https://bulma.io/documentation/overview/start/) CSS framework to switch things up from what has so far been the dominant status of BootStrap in our bootcamp. We wanted to try something new and were thoroughly pleased with the design options it gave us.