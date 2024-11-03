import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useLoadScript, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios'; // To make API requests
import Cookies from 'js-cookie'; // For authorization
import { useRouter } from 'next/navigation';
import "../styles/displaymapfilter.css";
import { useDraggableCard } from './useDraggableCard';
import ExpandableCard from './ExpandableCard';
import { fetchReviewsByPlaceId } from './fetchReviews';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'; 
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';


const containerStyle = {
  width: '100%',
  height: '700px',
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumberString) => {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, ''); // Remove all non-digit characters
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumberString; // Return the original string if it can't be formatted
};

const GoogleMapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geolocationError, setGeolocationError] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filter, setFilter] = useState(''); // Filter for cuisine_description
  const [distanceFilter, setDistanceFilter] = useState(1); // Filter for distance in miles, default to 1 mile
  const [cuisineOptions, setCuisineOptions] = useState([]); // Holds unique cuisine types
  const [typeFilter, setTypeFilter] = useState(''); // Filter for Restaurant or Bar
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // For showing detailed card
  const cardRef = useRef(null); // Reference for the expandable card
  const { cardPosition, setCardPosition, handleDragStart } = useDraggableCard({
    x: window.innerWidth / 2 - 250,
    y: window.innerHeight / 2 - 300,
  });

  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  // Keywords to identify bars and exclude specific keywords
  const barKeywords = ["bar", "pub", "tavern", "lounge"];
  const excludedKeywords = ["juice", "coffee", "pizza", "smoothie", "tea", "bakery", "deli", "barbeque", "bbq", "BAR-B-QUE", "republic", "burrito", "sushi"];

  const router = useRouter();


  //Agregado para filtrar por nombre
  const [filterName, setNameFilter] = useState(''); //Filter for name dba
  const [nameOptions, setNameOptions] = useState([]); //Holds name


  // Load Google Maps script only once
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
  });

  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/locations');
        const data = await response.json();

        setLocations(data);

        // Extract unique cuisine descriptions
        const uniqueCuisines = [...new Set(
          data
            .map((location) => location.Restaurant.cuisine_description)
            .filter(cuisine => cuisine && cuisine.trim() !== '')
        )];
        setCuisineOptions(uniqueCuisines);


        //Extract unique Names descriptions

        const uniqueNames = [...new Set(
          data
            .map((location) => location.Restaurant.dba)
            .filter(namerestaurant => namerestaurant && namerestaurant.trim() !== '')
        )];
        setNameOptions(uniqueNames);

      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          fetchLocations(); // Fetch locations after getting the current position
        },
        (error) => {
          console.error("Error getting user's location:", error);
          setGeolocationError(true); // Set error state if geolocation fails
          //fetchLocations(); // Fetch all locations if geolocation fails
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setGeolocationError(true);
      //fetchLocations(); // Fetch all locations if geolocation is not supported
    }
  }, []);   


    //fetch favorites
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
      
      const fetchFavorites = async () => {
            const token = Cookies.get('token');  // Get the token for authenticated requests
          try {
              const response = await axios.get(
                  `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites`,
                  { headers: { Authorization: `Bearer ${token}` } }
              );
            
              if (response.status === 200) {
                  setFavorites(response.data.data.favoritePlaces);
                
              }
          } catch (error) {
              console.error('Error fetching favorites:', error);
             
          }
      };
    
      fetchFavorites();
  }, []);

 
  //handle marker click
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };


  //handle view more
  const handleViewMoreClick = async (location) => {
    try {
      const inspectionRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/inspections/${location.Restaurant.camis}`
      );
  
     /*   const hoursRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurant-hours?camis=${location.Restaurant.camis}`
      );  */
  

      // Call the new backend route for reviews
      const reviewsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/restaurant-reviews?camis=${location.Restaurant.camis}`
      );
      
       // Fetch additional place details
       const placeDetailsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/place-details`,
        { params: { camis: location.Restaurant.camis } }
       );


      setSelectedRestaurant({
        ...location,
        inspectionDetails: inspectionRes.data,
        //  restaurantHours: hoursRes.data.hours, 
        //  isOpenNow: hoursRes.data.hours.open_now, 
        reviews: reviewsRes.data, 
        placeDetails: {     
          photoUrl: placeDetailsRes.data.data.photoUrl,
          website: placeDetailsRes.data.data.website,
          rating: placeDetailsRes.data.data.rating,
          hours: placeDetailsRes.data.data.hours,  
          isOpenNow: placeDetailsRes.data.data.hours.open_now,  
      },

      });
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  }; 
  


// handle add to favorites
  const handleAddToFavorites = async (location) => {
    const token = Cookies.get('token');
    const isFavorite = favorites.some(favorite => favorite.camis === location.camis);
    try {
      if (isFavorite) {
        // Remove favorite
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/remove/${location.camis}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.status === 204) {
         
          setFavorites(favorites.filter(favorite => favorite.camis !== location.camis));
          console.log(favorites)

        }
      } else {
        // Add favorite
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/add`,
          { camis: location.camis },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.status === 201) {
         setFavorites([...favorites, { camis: location.camis }]);
        }
      }
    } catch (error) {
      // Handle error
      console.error("Error adding/removing favorite:", error);
    }
  };


  
const isBar = (location) => {
  const name = location.Restaurant.dba.toLowerCase();
  const cuisine = location.Restaurant.cuisine_description
    ? location.Restaurant.cuisine_description.toLowerCase()
    : "";

  const isLikelyBar = barKeywords.some(keyword => name.includes(keyword) || cuisine.includes(keyword));
  const isExcluded = excludedKeywords.some(keyword => name.includes(keyword) || cuisine.includes(keyword));

  return isLikelyBar && !isExcluded;
};

  // // Filter locations if the user allows location access
  // const filteredLocations = currentLocation
  //   ? locations.filter((location) => {
  //       const distance = calculateDistance(
  // Filter locations based on both cuisine_description and distance from the current location
  const filteredLocations = locations.filter((location) => {
    const distance = currentLocation
      ? calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          parseFloat(location.latitude),
          parseFloat(location.longitude)
        )
      : 0;

    return (
      (filter === '' || location.Restaurant.cuisine_description === filter) || // cuisine_description filter
      (filter === ''|| location.Restaurant.dba === filter)) &&
      (currentLocation ? distance <= distanceFilter : true) && // distance filter
      (typeFilter === '' ||
        (typeFilter === 'Bar' && isBar(location)) ||
        (typeFilter === 'Restaurant' && !isBar(location))
    );
  });

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchInput(value);


    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }


    setDebounceTimeout(
      setTimeout(() => {
        if (value) {
          fetchSuggestions(value);
        } else {
          setSuggestions([]);
        }
      }, 1000)
    );
  };


  const fetchSuggestions = async (input) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5&viewbox=-74.2591,40.9176,-73.7004,40.4774&bounded=1`;
    setIsLoading(true);
    setError('');


    try {
      const response = await axios.get(url);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Failed to fetch suggestions.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSuggestionClick = (place) => {
    setSearchInput(place.display_name);
    setSuggestions([]);
    fetchCoordinates(place.display_name);
  };


  const fetchCoordinates = async (location) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;


    try {
      const response = await axios.get(url);
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoordinates({ latitude: lat, longitude: lon });
        setCurrentLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        console.log("Fetched Coordinates:", { latitude: lat, longitude: lon });
      } else {
        console.error("No coordinates found for the location.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      setError("Failed to fetch coordinates.");
    }
  };


  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);


    // Handle load error and loading state for the map
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }


  return (
    <div className="map-container">
      <div className="filter-section">
        <button onClick={() => setFilterVisible(!filterVisible)} className="filter-toggle-button">
          {filterVisible ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filter Section - Hidden until toggled */}
        {filterVisible && (
          <div className="filter-dropdown">
            {/* Cuisine Filter */}
             <div className="filter-item"> {/*div a */}
              <label htmlFor="filterCuisine">Filter by Cuisine: </label>
              <select
                id="filterCuisine"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All</option>
                {cuisineOptions.map((cuisine, index) => (
                  <option key={index} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div> {/*div a */}



            {/* Name Restaurant Filter */}
            <div className="filter-item"> {/*div a */}
              <label htmlFor="filterRestaurantName">Filter by Name: </label>
              <select
                id="filterRestaurantName"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All - Hold Shift key while searching</option>
                {nameOptions.map((namerestaurant, index) => (
                  <option key={index} value={namerestaurant}>
                    {namerestaurant}
                  </option>
                ))}
              </select>
            </div> {/*div a */}



            {/* Distance Filter */}
            <div className="filter-item"> {/*div b */}
              <label htmlFor="filterDistance">Filter by Distance (miles): </label>
              <select
                id="filterDistance"
                value={distanceFilter}
                onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
              >
                <option value={1}>1 mile</option>
                <option value={2}>2 miles</option>
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
              </select>
            </div> {/*div b */}

            {/* Bar or Restaurant Filter */}
            <div className="filter-item">
              <label htmlFor="filterType">Filter by Restaurant or Bar: </label>
              <select id="filterType" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Bar">Bar</option>
              </select>
            </div>
          </div>
        )}

        {/* Enter starting Location */}
       <div className="starting-location">
         <input
           type="text"
           placeholder="Input starting Location"
           value={searchInput}
           onChange={handleSearchInputChange}
           className="search-input"
         />
         {isLoading && <div>Loading...</div>}
         {error && <div>{error}</div>}
         {suggestions.length > 0 && (
           <ul className="suggestions-list">
             {suggestions.map((suggestion) => (
               <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion)}>
                 {suggestion.display_name}
               </li>
             ))}
           </ul>
         )}
       </div>

      </div>
    {/* //<LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}> */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || { lat: 40.7128, lng: -74.0060 }}
        zoom={currentLocation ? 15 : 12}
        options={{
          styles: "f9f8fc87a66fc282",
        }}
      >
        {currentLocation && (
          <Marker
            position={currentLocation}
            title="You are here"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {filteredLocations.map((location, index) => (
            <Marker
              key={index}
              position={{ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }}
              title={location.Restaurant.dba}
              icon={{
                url: (() => {
                  const isLocationBar = isBar(location);
                  const shouldShowBar = typeFilter === 'Bar' || (typeFilter === '' && isLocationBar);

                  return shouldShowBar
                    ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
                })(),
                scaledSize: new window.google.maps.Size(30, 30),
                anchor: new window.google.maps.Point(15, 30),
              }}
              onClick={() => handleMarkerClick(location)}
            />
          ))}

        {selectedLocation && (
          
          <InfoWindow
            position={{
              lat: parseFloat(selectedLocation.latitude),
              lng: parseFloat(selectedLocation.longitude),
            }}
            onCloseClick={() => setSelectedLocation(null)}
          >
                   
            <div style={{ color: 'black', backgroundColor: 'white', padding: '15px', borderRadius: '1px', width: '215px' }}>

              <h3>{selectedLocation.Restaurant.dba ? selectedLocation.Restaurant.dba : 'No Name'}</h3>
              {/* Just for testing */}
              <p>{selectedLocation.Restaurant.building + ' ' + selectedLocation.Restaurant.street ? selectedLocation.Restaurant.building + ' ' + selectedLocation.Restaurant.street : 'No Address'}</p>
              <p>{selectedLocation.Restaurant.boro + ", NY " + selectedLocation.Restaurant.zipcode}</p>

              <br />
              <p>
                <strong>Phone: </strong>
                {formatPhoneNumber(selectedLocation.Restaurant.phone)}
              </p>
             
             <div>
                <FontAwesomeIcon className='view-more-icon'
                    icon={faInfoCircle} 
                    onClick={() => handleViewMoreClick(selectedLocation)} 
                    style={{ cursor: 'pointer', fontSize: '1.5em', color: '#007bff' }}
                />

                <FontAwesomeIcon className='heart-icon'
                  onClick={() => handleAddToFavorites(selectedLocation)}
                  icon={favorites.some(favorite => favorite.camis === selectedLocation.camis) ? solidHeart : regularHeart}
                  color={favorites.some(favorite => favorite.camis === selectedLocation.camis) ? 'red' : 'gray'}
                />
              </div>
            </div>
          </InfoWindow>
          
        )}
      </GoogleMap>
  {/* Expandable Card */}
  {selectedRestaurant && ( 
  <ExpandableCard
    restaurant={selectedRestaurant}
    position={cardPosition}
    onClose={() => setSelectedRestaurant(null)}
    handleDragStart={handleDragStart}
    reviews={selectedRestaurant.reviews} 
    

  />
  
)}
    </div>
  );
};

export default GoogleMapComponent;
