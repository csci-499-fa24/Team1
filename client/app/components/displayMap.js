import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios'; // To make API requests
import Cookies from 'js-cookie'; // For authorization
import { useRouter } from 'next/navigation';
import "../styles/displaymapfilter.css";

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

  const router = useRouter();

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



  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    
  };

  const handleViewMore = () => {
    router.push(`/restaurants/${selectedLocation.Restaurant.camis}`)
  };

  // Handle adding to favorites
  const handleAddToFavorites = async (location) => {
    const token = Cookies.get('token'); // Get the token for authenticated requests
    try {
     
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_URL + '/api/v1/favorites/add',
        {
          
           camis: location.camis,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     // const data = await response.json();
     
      if (response.status === 201) {
        alert('Location added to favorites!');
      }
    

    } catch (error) {
      console.error('Error adding location to favorites:', error);
      alert('Failed to add favorite location.');
      
    }
  };


  const isBar = (location) => {
    const name = location.Restaurant.dba.toLowerCase();
    const cuisine = location.Restaurant.cuisine_description
      ? location.Restaurant.cuisine_description.toLowerCase()
      : ""; 
  
    // Keywords to identify bars and exclude specific keywords
    const barKeywords = ["bar", "pub", "tavern", "lounge"];
    const excludedKeywords = ["juice", "coffee", "pizza", "smoothie", "tea", "bakery", "deli", "barbeque", "bbq"]; 
  
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
      (filter === '' || location.Restaurant.cuisine_description === filter) && // cuisine_description filter
      (currentLocation ? distance <= distanceFilter : true) && // distance filter
      (typeFilter === '' ||
        (typeFilter === 'Bar' && isBar(location)) || 
        (typeFilter === 'Restaurant' && !isBar(location))) 
    );
  });


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
              <br/>
              <button 
                onClick={() => handleAddToFavorites(selectedLocation)}
                className='favorite-button'
              >   
                Add to Favorites 
              </button>

              <button 
                onClick={() => handleViewMore()}
                className='view-button'
              >   
                View More 
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
  {/* //</LoadScript> */}

    </div>
  );
};

export default GoogleMapComponent;
