import dynamic from 'next/dynamic';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { toast } from "react-toastify";

// Dynamically import React Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/events.css';
import { faMap, faMapMarker, faMapMarkerAlt, faMarker } from '@fortawesome/free-solid-svg-icons';

// Fix for missing default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);

  const [borough, setBorough] = useState('');
  const [eventType, setEventType] = useState('');
  const [specificHour, setSpecificHour] = useState('');
  const [specificAmPm, setSpecificAmPm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Map and location state
  const [userLocation, setUserLocation] = useState(null);
  const [selectedEventLocation, setSelectedEventLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLoc = [position.coords.latitude, position.coords.longitude];
          console.log("User location obtained:", userLoc);
          setUserLocation(userLoc);
          setMapCenter(userLoc); // Center map on user location
          if (mapRef.current) {
            mapRef.current.setView(userLoc, 13);
          }
        },
        error => console.error('Error fetching user location:', error)
      );
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `https://data.cityofnewyork.us/resource/tvpp-9vvx.json?$query=SELECT%20event_id%2C%20event_name%2C%20start_date_time%2C%20end_date_time%2C%20event_agency%2C%20event_type%2C%20event_borough%2C%20event_location%2C%20event_street_side%2C%20street_closure_type%2C%20community_board%2C%20police_precinct%20WHERE%20%60event_type%60%20IN%20('Farmers%20Market')`
        );
  
        const now = new Date(); // Current date and time
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight today
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(startOfToday.getDate() + 1); // Midnight tomorrow
  
        // Filter events starting today or in the future
        const validEvents = response.data.filter(event => {
          const eventStartDate = new Date(event.start_date_time);
          return eventStartDate >= startOfToday; // Include events from midnight today onwards
        });
  
        // Sort events with today's events first, then future events in order
        const sortedEvents = validEvents.sort((a, b) => {
          const startA = new Date(a.start_date_time);
          const startB = new Date(b.start_date_time);
  
          return startA - startB; // Ascending order by start date
        });
  
        setEvents(sortedEvents);
        setFilteredEvents(sortedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Error fetching events. Please try again later.');
      }
    };
  
    fetchEvents();
  }, []);


  const parseStreetIntersection = (description) => {
    // Example format: "CORTLEYOU ROAD between RUGBY ROAD and ARGYLE ROAD"
    const pattern = /(.+) between (.+) and (.+)/;
    const match = description.match(pattern);
    if (match) {
        return { mainStreet: match[1].trim(), street1: match[2].trim(), street2: match[3].trim() };
    }
    return null;
  };

  const fetchLocationCoordinates = async (location, borough) => {
    try {
        const streets = parseStreetIntersection(location);
        let url;

        if (streets) {
            // Its an intersection
            const intersectionQuery = `${streets.mainStreet} & ${streets.street1}, ${borough}, New York, NY`;
            const query = encodeURIComponent(intersectionQuery);
            url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
        } else {
            // Its a regular location
            const detailedLocation = `${location}, ${borough}, New York, NY`;
            const query = encodeURIComponent(detailedLocation);
            url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
        }

        const response = await axios.get(url);
        if (response.data.results && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            setSelectedEventLocation([lat, lng]);
            setMapCenter([lat, lng]); // Update map center to the new location

            if (mapRef.current) {
              mapRef.current.flyTo([lat, lng], 16, {
                animate: true,
                duration: 0.5 // Adjust animation duration to your liking
              });
            }
        } else {
            toast.error('No results found for the location. Please check the details and try again.');
        }
    } catch (error) {
        console.error('Failed to fetch coordinates:', error);
        toast.error('Failed to fetch location coordinates. Please try again later.');
    }
  };

  useEffect(() => {
    console.log("mapRef current:", mapRef.current);
    if (mapRef.current) {
      mapRef.current.flyTo(mapCenter, 16, {
        animate: true,
        duration: 0.5 // Adjust animation duration to your liking
      });
    }
}, [mapCenter]); // Ensure this useEffect is triggered when mapCenter changes

  
  

  const convertTo24Hour = (hour, amPm) => {
    if (amPm === 'AM' && hour === 12) return 0;
    if (amPm === 'PM' && hour !== 12) return hour + 12;
    return hour;
  };

  useEffect(() => {
    const handleFilterEvents = () => {
      let filtered = events.filter(event => {
        const eventBoroughUpper = event.event_borough?.toUpperCase() || '';
        const selectedBoroughUpper = borough?.toUpperCase() || '';
        const matchesBorough = !borough || eventBoroughUpper === selectedBoroughUpper;
        const matchesEventType = !eventType || event.event_type === eventType;

        let matchesSpecificTime = true;
        if (specificHour && specificAmPm) {
          const selectedHour = parseInt(specificHour);
          const selected24Hour = convertTo24Hour(selectedHour, specificAmPm);

          const eventStartTime = new Date(event.start_date_time);
          const eventEndTime = new Date(event.end_date_time);
          const eventStartHour = eventStartTime.getHours();
          const eventEndHour = eventEndTime.getHours();

          matchesSpecificTime = selected24Hour >= eventStartHour && selected24Hour <= eventEndHour;
        }

        const startDateTime = new Date(event.start_date_time);
        const endDateTime = new Date(event.end_date_time);
        const isSameDay = startDateTime.toDateString() === endDateTime.toDateString();

        return matchesBorough && matchesEventType && matchesSpecificTime && isSameDay;
      });

      if (startDate) {
        const startFilterDate = new Date(startDate);
        filtered = filtered
          .sort((a, b) => new Date(a.start_date_time) - new Date(b.start_date_time))
          .filter(event => new Date(event.start_date_time) >= startFilterDate);
      }

      setFilteredEvents(filtered);
      setCurrentPage(1);
    };

    handleFilterEvents();
  }, [borough, eventType, specificHour, specificAmPm, startDate, endDate, events]);

  const addToPlan = async (name, start, end) => {
    const token = Cookies.get('token');
    const startDate = new Date(start);
    const endDate = new Date(end);
    const start_date = startDate.toISOString().split('T')[0];
    const start_time = startDate.toTimeString().split(' ')[0].slice(0, 5);
    const end_date = endDate.toISOString().split('T')[0];
    const end_time = endDate.toTimeString().split(' ')[0].slice(0, 5);

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_URL + '/api/v1/user-plans/add',
        {
          date: start_date,
          time: start_time,
          endDate: end_date,
          endTime: end_time,
          eventName: name,
          eventType: 'NYC Event',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'success') {
        toast.success('Successfully added event to your plan');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to add location to your plan.');
      }
      console.error('Error adding location to plan:', error);
    }
  };

  const handlePlanButtonClick = (event) => {
    if (!event.start_date_time || !event.end_date_time || !event.event_name) {
      toast.warn('Event is missing start time, end time, or name');
    } else {
      addToPlan(event.event_name, event.start_date_time, event.end_date_time);
    }
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    const maxLeftRight = 1;

    if (totalPages <= 1) return null;

    const start = Math.max(2, currentPage - maxLeftRight);
    const end = Math.min(totalPages - 1, currentPage + maxLeftRight);

    pageNumbers.push(1);

    if (start > 2) {
      pageNumbers.push('...');
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    pageNumbers.push(totalPages);

    return pageNumbers.map((number, index) =>
      number === '...' ? (
        <span key={index} className="dots">
          ...
        </span>
      ) : (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={currentPage === number ? 'active' : ''}
        >
          {number}
        </button>
      )
    );
  };

  return (
    <div className="events-container">
      {/* Map Section */}
        <MapContainer
          className="zoom"
          key={mapCenter.join(',')}
          center={mapCenter}
          zoom={selectedEventLocation ? 16 : 13}
          style={{ height: '400px', width: '100%' }}
          whenCreated={(mapInstance) => {
            console.log("Map created:", mapInstance);
            mapRef.current = mapInstance;
          }}
        >

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />

          {/* Display user location */}
          {userLocation && !selectedEventLocation && (
            <Marker position={userLocation}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Display only the selected event marker */}
          {selectedEventLocation && (
            <Marker position={selectedEventLocation}>
              <Popup>Selected Event Location</Popup>
            </Marker>
          )}
        </MapContainer>

      <div className="filter-form">
        <div>
          <label>Borough: </label>
          <select value={borough} onChange={e => setBorough(e.target.value)}>
            <option value="">All</option>
            <option value="MANHATTAN">Manhattan</option>
            <option value="BROOKLYN">Brooklyn</option>
            <option value="QUEENS">Queens</option>
            <option value="BRONX">Bronx</option>
            <option value="STATEN ISLAND">Staten Island</option>
          </select>
        </div>


        <div>
          <label>Specific Hour: </label>
          <select value={specificHour} onChange={e => setSpecificHour(e.target.value)}>
            <option value="">Select Hour</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>AM/PM: </label>
          <select value={specificAmPm} onChange={e => setSpecificAmPm(e.target.value)}>
            <option value="">Select AM/PM</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <div>
          <label>Start Date: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
      </div>

      <ul className="events-list">
        {currentEvents.length > 0 ? (
          currentEvents.map(event => (
            <li key={`${event.event_id}-${event.start_date_time}`} className="event-card">
              <div className='align-name-plus'>
                <h2>{event.event_name}</h2>
                          

              </div>
              <p>{`Location: ${event.event_location}`}</p>
              <p>{`Start: ${new Date(event.start_date_time).toLocaleString()}`}</p>
              <p>{`End: ${new Date(event.end_date_time).toLocaleString()}`}</p>
              <p>{`Borough: ${event.event_borough}`}</p>
              <div button-container>
                <FontAwesomeIcon 
                  icon={faMapMarkerAlt}
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', marginLeft: '10px',color: '#57b9ff', height: '20px'}} 
                    onClick={() => {
                      if (event.event_location && event.event_borough) {
                        fetchLocationCoordinates(event.event_location, event.event_borough);
                      } else {
                        toast.error('Event location is not available.');
                      }
                    }}
                />
                <FontAwesomeIcon
                  icon={faSquarePlus}
                  className='add-to-plan-icon'
                  style={{ cursor: 'pointer', marginLeft: '30px', color: '#57b9ff', height: '20px'}} 
                  onClick={() => handlePlanButtonClick(event)}
                />
              </div>
            </li>
            
          ))
        ) : (
          <p className="no-events-message">No events found.</p>
        )}
      </ul>

      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          &laquo; Previous
        </button>
        {renderPageNumbers()}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default Events;
