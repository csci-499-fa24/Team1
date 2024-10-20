import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios'; // To make API requests
import Cookies from 'js-cookie'; // For authorization


const containerStyle = {
  width: '100%',
  height: '600px',
};

const RADIUS_MILES = 1; 

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

const GoogleMapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [geolocationError, setGeolocationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


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
          fetchLocations(); // Fetch all locations if geolocation fails
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setGeolocationError(true);
      fetchLocations(); // Fetch all locations if geolocation is not supported
    }


  }, []);    



  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    
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



  // Filter locations if the user allows location access
  const filteredLocations = currentLocation
    ? locations.filter((location) => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          parseFloat(location.latitude),
          parseFloat(location.longitude)
        );
        return distance <= RADIUS_MILES;
      })
    : locations; 


    // Handle load error and loading state for the map
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }
 
  return (
    //<LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation || { lat: 40.7128, lng: -74.0060 }} 
        
        zoom={currentLocation ? 15 : 12} 
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
            title={location.dba}
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
            <div style={{ color: 'black', backgroundColor: 'white', padding: '10px', borderRadius: '5px' }}>
              <h3>{selectedLocation.Restaurant.dba ? selectedLocation.Restaurant.dba : 'No Name'}</h3>
              {/* Just for testing */}
              <p>{selectedLocation.Restaurant.building + ' ' + selectedLocation.Restaurant.street ? selectedLocation.Restaurant.building + ' ' + selectedLocation.Restaurant.street: 'No Address'}</p>
              <p>{selectedLocation.Restaurant.boro + ", NY " + selectedLocation.Restaurant.zipcode}</p>
              <button onClick={() => handleAddToFavorites(selectedLocation)}>   Add to Favorites
              </button>
            </div>
          </InfoWindow>
        )}

      </GoogleMap>
    //</LoadScript>
  );
};

export default GoogleMapComponent;
