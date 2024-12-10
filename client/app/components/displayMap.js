import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  GoogleMap,
  useLoadScript,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import axios from "axios"; // To make API requests
import Cookies from "js-cookie"; // For authorization
import { useRouter } from "next/navigation";
import "../styles/displaymapfilter.css";
import "../globals.css";
import { useDraggableCard } from "./useDraggableCard";
import ExpandableCard from "./ExpandableCard";
import { fetchReviewsByPlaceId } from "./fetchReviews";
import Sidebar from "./Sidebar";
import { toast } from "react-toastify";
import Select from "react-select"; //Added for Restaurant name filter correction.

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBus, faMapMarkerAlt, //for import the TRANSIT icon (VS Code put it automatically)
  faHeart as solidHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faCircleInfo, faFilter, faLocationArrow } from "@fortawesome/free-solid-svg-icons";

//Custom markers and map style
import BarIcon from "../assets/bar_icon.png";
import RestaurantIcon from "../assets/restaurant_icon.png";
import customMapStyles from "../styles/mapStyles/customMapStyles.json";

import {
  faMagnifyingGlass,
  faLocationDot,
  faPhone,
  faSquarePlus,
  faCar,
} from "@fortawesome/free-solid-svg-icons";

const containerStyle = {
  width: "100%",
  height: "700px",
};

const customMapOptions = {
  disableDefaultUI: true, // Disables all default controls (optional)
  zoomControl: true, // Shows zoom controls
  mapTypeControl: false, // Hides the map/satellite view toggle
  fullscreenControl: false, // Hides fullscreen control
  streetViewControl: false, // Hides street view pegman
  scrollwheel: true, // Enables zooming with the scroll wheel
  draggable: true, // Allows dragging the map
  styles: customMapStyles, // Apply your custom map styles
  gestureHandling: "cooperative", // Allows zooming with ctrl/command + scroll
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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumberString) => {
  const cleaned = ("" + phoneNumberString).replace(/\D/g, ""); // Remove all non-digit characters
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
  const [filter, setFilter] = useState(""); // Filter for cuisine_description
  const [distanceFilter, setDistanceFilter] = useState(1); // Filter for distance in miles, default to 1 mile
  const [cuisineOptions, setCuisineOptions] = useState([]); // Holds unique cuisine types
  const [typeFilter, setTypeFilter] = useState(""); // Filter for Restaurant or Bar
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // For showing detailed card
  const cardRef = useRef(null); // Reference for the expandable card
  const { cardPosition, setCardPosition, handleDragStart } = useDraggableCard({
    x: window.innerWidth / 2 - 250,
    y: window.innerHeight / 2 - 300,
  });
  const [inspectionGradeFilter, setInspectionGradeFilter] = useState(""); // e.g., "", "A", "B", "C"
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // Create state directionsDestination, function setDirectionsDestination
  const [directionsDestination, setDirectionsDestination] = useState(null);

  //Added for public transportation or TRANSIT option
  const [directionsTravelMode, setDirectionsTravelMode] = useState(null);

  const [directions, setDirections] = useState(null);

  //Route directions from current location to selected marker on map
  useEffect(() => {
    if (!directionsDestination) {
      setDirections(null);
    }

    if (currentLocation && directionsDestination) {
      const locationA = {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      };
      const locationB = directionsDestination;

      const directionsService = new google.maps.DirectionsService();

      const origin = {
        lat: Number(locationA.latitude),
        lng: Number(locationA.longitude),
      };
      const destination = {
        lat: Number(locationB.latitude),
        lng: Number(locationB.longitude),
      };

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: directionsTravelMode, //Modified for travel mode
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [currentLocation, directionsDestination]);

  // Keywords to identify bars and exclude specific keywords
  const barKeywords = ["bar", "pub", "tavern", "lounge"];
  const excludedKeywords = [
    "juice",
    "coffee",
    "pizza",
    "smoothie",
    "tea",
    "bakery",
    "deli",
    "barbeque",
    "bbq",
    "BAR-B-QUE",
    "republic",
    "burrito",
    "sushi",
  ];

  const router = useRouter();

  //Agregado para filtrar por nombre
  const [filterName, setNameFilter] = useState(""); //Filter for name dba
  const [nameOptions, setNameOptions] = useState([]); //Holds name

  // Load Google Maps script only once
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
          const response = await fetch(
              process.env.NEXT_PUBLIC_SERVER_URL + "/api/locations"
          );
          const data = await response.json();
  
          // Handle cases where the data is an object, not an array
          const locationsData = Array.isArray(data) ? data : data.locations || [];
  
          console.log("Fetched Locations:", locationsData);
          console.log("Type of Fetched Locations:", typeof locationsData, Array.isArray(locationsData));
  
          setLocations(locationsData);
          setCuisineOptions([
              ...new Set(
                  locationsData
                      .map((location) => location.Restaurant.cuisine_description)
                      .filter((cuisine) => cuisine && cuisine.trim() !== "")
              ),
          ]);
  
          setNameOptions([
              ...new Set(
                  locationsData
                      .map((location) => location.Restaurant.dba)
                      .filter((name) => name && name.trim() !== "")
              ),
          ]);
      } catch (error) {
          console.error("Error fetching locations:", error.message);
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
      const token = Cookies.get("token"); // Get the token for authenticated requests
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response);
        if (response.status === 200) {
          setFavorites(response.data.data.favoritePlaces);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  //handle marker click
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const fetchInspectionGrades = async (locations) => {
    // Loop through locations and fetch inspection data
    const updatedLocations = await Promise.all(
      locations.map(async (location) => {
        try {
          const inspectionRes = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/inspections/${location.Restaurant.camis}`
          );
  
          const inspectionData = inspectionRes.data[0]; 
          return {
            ...location,
            grade: inspectionData?.grade || "Ungraded", // Add grade (default to "Ungraded")
          };
        } catch (error) {
          console.error(
            `Failed to fetch inspection data for CAMIS ${location.Restaurant.camis}`,
            error
          );
          return { ...location, grade: "Ungraded" }; // Default to "Ungraded" on error
        }
      })
    );
  
    return updatedLocations;
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
    const token = Cookies.get("token");
    const isFavorite = favorites.some(
      (favorite) => favorite.camis === location.camis
    );

    try {
      if (isFavorite) {
        // Remove favorite
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/remove/${location.camis}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 204) {
          setFavorites(
            favorites.filter((favorite) => favorite.camis !== location.camis)
          );
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

  const addToPlan = async (location, date, time) => {
    const token = Cookies.get("token");
    // Prepare the parameters to log
    const camis = location.camis;
    const longitude = location.longitude;
    const latitude = location.latitude;

    console.log("camis:", camis);
    console.log("longitude:", longitude);
    console.log("latitude:", latitude);
    console.log("date:", date);
    console.log("time:", time);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/user-plans/add",
        {
          camis: location.camis,
          longitude: location.longitude,
          latitude: location.latitude,
          date,
          time,
          eventType: "Self Event",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        //alert("Location added to your plan!");
        toast.success("Location successfully added to your plan!");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        //alert(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        //alert("Failed to add location to your plan.");
        toast.error("Failed to add location to your plan.");
      }

      console.error("Error adding location to plan:", error);
    }
  };

  const handlePlanButtonClick = (location) => {
    if (!selectedDate || !selectedTime) {
      //alert("Please select both date and time before adding to your plan.");
      toast.warn("Please select both date and time before adding to your plan.");
    } else {
      addToPlan(location, selectedDate, selectedTime);
    }
  };

  const isBar = (location) => {
    const name = location.Restaurant.dba.toLowerCase();
    const cuisine = location.Restaurant.cuisine_description
      ? location.Restaurant.cuisine_description.toLowerCase()
      : "";

    const isLikelyBar = barKeywords.some(
      (keyword) => name.includes(keyword) || cuisine.includes(keyword)
    );
    const isExcluded = excludedKeywords.some(
      (keyword) => name.includes(keyword) || cuisine.includes(keyword)
    );

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
            const isLocationBar = isBar(location); // Infer if it's a bar based on keywords
            const shouldShowBar = typeFilter === "Bar" && isLocationBar;
            const shouldShowRestaurant =
                typeFilter === "Restaurant" && !isLocationBar;
        
        return (
            // Cuisine filter
            (filter === "" || location.Restaurant.cuisine_description === filter) &&
            // Name filter
            (filterName === "" || location.Restaurant.dba === filterName) &&
            // Distance filter
            (currentLocation ? distance <= distanceFilter : true) &&
            // Type filter (e.g., Bar or Restaurant)
            (typeFilter === "" || shouldShowBar || shouldShowRestaurant) &&
            // Inspection grade filter
            (inspectionGradeFilter === "" ||
                (inspectionGradeFilter === "Ungraded" && 
                 (!location.Restaurant.Inspections[0]?.grade || 
                  location.Restaurant.Inspections[0]?.grade === "Ungraded")) ||
                location.Restaurant.Inspections[0]?.grade === inspectionGradeFilter)
        );
    });

// Debug: Log the filtered locations
console.log("Filtered Locations:", filteredLocations);

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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      input
    )}&format=json&addressdetails=1&limit=5&viewbox=-74.2591,40.9176,-73.7004,40.4774&bounded=1`;
    setIsLoading(true);
    setError("");

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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      location
    )}&format=json&limit=1`;

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
      {/* Change location and filters */}
      <div className="search-filter-container">
        <p className="page-title">Explore Restaurants and Bars</p>
        {/* Input starting location */}
        <div className="starting-location">
          {isLoading ? (
            <div className="loading">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid"
                style={{
                  shapeRendering: "auto",
                  display: "block",
                  background: "transparent",
                }}
              >
                <g>
                  {/* Loading spinner when locations are being fetched */}
                  {[...Array(12).keys()].map((i) => (
                    <g key={i} transform={`rotate(${i * 30} 50 50)`}>
                      <rect
                        fill="#494986"
                        height="12"
                        width="6"
                        ry="6"
                        rx="3"
                        y="24"
                        x="47"
                      >
                        <animate
                          repeatCount="indefinite"
                          begin={`-${(12 - i) / 12}s`} // stagger the animations
                          dur="1.0309278350515465s"
                          keyTimes="0;1"
                          values="1;0"
                          attributeName="opacity"
                        />
                      </rect>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          ) : (
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className={`search-icon ${searchInput ? "active" : ""}`}
            />
          )}
          <input
            type="text"
            placeholder="Change starting location"
            value={searchInput}
            onChange={handleSearchInputChange}
            className="search-input"
          />
      {/* Add the "Return to Current Location" button */}
      <button
        className="return-to-location-button"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
              },
              (error) => {
                console.error("Error getting user's location:", error);
                setGeolocationError(true);
              }
            );
          } else {
            console.error("Geolocation is not supported by this browser.");
          }
        }}
      >
        <FontAwesomeIcon
          icon={faLocationArrow} 
          // style={{ marginRight: "5px" }}
        />

      </button>
          {error && <div className="error">{error}</div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>{" "}
        {/*End of changing starting location search bar */}
        {/* Filter section when toggled */}
        <div className="filter-section">
          <button
            onClick={() => setFilterVisible(!filterVisible)}
            className="filter-toggle-icon"
            aria-label={filterVisible ? "Hide Filters" : "Show Filters"}
          >
            <FontAwesomeIcon
              icon={faFilter}
              className={filterVisible ? "active" : ""}
            />
          </button>

          {filterVisible && (
            <div className="filter-list">
              {/* Cuisine Filter */}
              <div className="filter-item">
                {" "}
                {/*div a */}
                <label htmlFor="filterCuisine">Cuisine: </label>
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
              </div>{" "}

<div className="filter-item">
  <label htmlFor="filterInspectionGrade">Inspection Result: </label>
  <select
    id="filterInspectionGrade"
    value={inspectionGradeFilter}
    onChange={(e) => setInspectionGradeFilter(e.target.value)}
  >
    <option value="">All</option>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="Ungraded">Ungraded</option>
  </select>
</div>

              {/*div a */}
              {/* Name Restaurant Filter */}
              <div className="filter-item">
                {" "}
                {/*div b */}
                <label htmlFor="filterRestaurantName">Name: </label>
                {/* <select
                  id="filterRestaurantName"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All </option>
                  {nameOptions.map((namerestaurant, index) => (
                    <option key={index} value={namerestaurant}>
                      {namerestaurant}
                    </option>
                  ))}
                </select> */}
                <Select
                  id="filterRestaurantName"
                  className="restaurant-name-filter"
                  options={[
                    { label: "All", value: "" },
                    ...nameOptions.map((x) => ({ value: x, label: x })),
                  ]}
                  onChange={(option) => setNameFilter(option?.value || "")} // Use setNameFilter, not setFilter
                  value={{ label: filterName || "All", value: filterName }}
                />
              </div>{" "}
              {/*div b */}
              {/* Distance Filter */}
              <div className="filter-item">
                {" "}
                {/*div a */}
                <label htmlFor="filterDistance">Distance (miles): </label>
                <select
                  id="filterDistance"
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                </select>
              </div>{" "}
              {/*div a */}
              {/* Bar or Restaurant Filter */}
              <div className="filter-item">
                {" "}
                {/*div b */}
                <label htmlFor="filterType">Type: </label>
                <select
                  id="filterType"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Bar">Bar</option>
                </select>
              </div>{" "}
              {/*div b */}
            </div>
          )}
        </div>{" "}
        {/*End of filter section */}
      </div>

      {/* Map Section */}
      <div className="google-map">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentLocation || { lat: 40.7128, lng: -74.006 }}
          zoom={currentLocation ? 15 : 12}
          options={{
            styles: customMapStyles,
            customMapOptions,
          }}
        >
          {/*Directions renderer to get driving routes  */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{ markerOptions: { visible: false } }}
            />
          )}

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
              position={{
                lat: parseFloat(location.latitude),
                lng: parseFloat(location.longitude),
              }}
              title={location.Restaurant.dba}
              icon={{
                url: (() => {
                  const isLocationBar = isBar(location);
                  const shouldShowBar =
                    typeFilter === "Bar" ||
                    (typeFilter === "" && isLocationBar);
                  return shouldShowBar ? BarIcon.src : RestaurantIcon.src;
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
              <div className="info-window-content">
                <h3>{selectedLocation.Restaurant.dba || "No Name"}</h3>
                {/* Address */}
                <p style={{ display: "flex", alignItems: "center" }}>
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    style={{ color: "var(--accent-color)", marginRight: "9px" }}
                  />
                  <span style={{ display: "flex", flexDirection: "column" }}>
                    <span>
                      {`${selectedLocation.Restaurant.building || ""} ${
                        selectedLocation.Restaurant.street || ""
                      }`.trim() || "No Address"}
                    </span>
                    <span style={{ marginLeft: "1px" }}>
                      {`${selectedLocation.Restaurant.boro || ""}, NY ${
                        selectedLocation.Restaurant.zipcode || ""
                      }`.trim()}
                    </span>
                  </span>
                </p>

                {/* Phone number */}
                <p>
                  <FontAwesomeIcon
                    icon={faPhone}
                    style={{ color: "var(--accent-color" }}
                  />
                  <span style={{ marginLeft: "9px" }}>
                    {formatPhoneNumber(selectedLocation.Restaurant.phone)}
                  </span>
                </p>
                <br />

                {/* Date and time */}
                <div className="date-time-container">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                  <FontAwesomeIcon
                    icon={faSquarePlus}
                    className="add-to-plan-icon"
                    style={{
                      cursor: "pointer",
                      marginLeft: "10px",
                      color: "#57b9ff",
                    }}
                    onClick={() => handlePlanButtonClick(selectedLocation)}
                  />
                </div>

                <br />
                {/* More info and favorite buttons */}
                <div className="info-window-icons">
                  <FontAwesomeIcon
                    className="view-more-icon"
                    icon={faCircleInfo}
                    onClick={() => handleViewMoreClick(selectedLocation)}
                  />
                  <FontAwesomeIcon
                    className="heart-icon"
                    icon={
                      favorites.some(
                        (favorite) => favorite.camis === selectedLocation.camis
                      )
                        ? solidHeart
                        : regularHeart
                    }
                    color={
                      favorites.some(
                        (favorite) => favorite.camis === selectedLocation.camis
                      )
                        ? "red"
                        : "gray"
                    }
                    onClick={() => handleAddToFavorites(selectedLocation)}
                  />
                </div>

                {/*Getting routes directions car button */}
                <button
                  onClick={() => {
                    if (selectedLocation != directionsDestination) {
                      setDirectionsDestination(selectedLocation);
                      setDirectionsTravelMode(google.maps.TravelMode.DRIVING);
                    } else {
                      setDirectionsDestination(null);
                      setDirectionsTravelMode(null);
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCar}
                    style={
                      selectedLocation?.camis == directionsDestination?.camis && //&& added
                      directionsTravelMode == google.maps.TravelMode.DRIVING
                        ? { color: "#61aaf3" }
                        : {}
                    }
                  />
                </button>
                <button //Added button of bus for TRANSIT or public transportation.
                  onClick={() => {
                    if (selectedLocation != directionsDestination) {
                      setDirectionsDestination(selectedLocation);
                      setDirectionsTravelMode(google.maps.TravelMode.TRANSIT);
                    } else {
                      setDirectionsDestination(null);
                      setDirectionsTravelMode(null);
                    }
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBus}
                    style={
                      selectedLocation?.camis == directionsDestination?.camis &&
                      directionsTravelMode == google.maps.TravelMode.TRANSIT
                        ? { color: "#61aaf3" }
                        : {}
                    }
                  />
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* sidebar */}
        {selectedRestaurant && (
          <Sidebar
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            reviews={selectedRestaurant.reviews}
          />
        )}
      </div>
    </div>
  );
};

export default GoogleMapComponent;
