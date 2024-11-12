import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from "js-cookie";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import '../styles/events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(5);

  const [borough, setBorough] = useState('');
  const [eventType, setEventType] = useState('');
  const [specificHour, setSpecificHour] = useState('');
  const [specificAmPm, setSpecificAmPm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `https://data.cityofnewyork.us/resource/tvpp-9vvx.json?$query=SELECT%20event_id%2C%20event_name%2C%20start_date_time%2C%20end_date_time%2C%20event_agency%2C%20event_type%2C%20event_borough%2C%20event_location%2C%20event_street_side%2C%20street_closure_type%2C%20community_board%2C%20police_precinct%20WHERE%20%60event_type%60%20IN%20('Farmers%20Market'%2C%20'Street%20Festival')`
        );
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('Error fetching events. Please try again later.');
      }
    };
    fetchEvents();
  }, []);

  const convertTo24Hour = (hour, amPm) => {
    if (amPm === 'AM' && hour === 12) return 0;
    if (amPm === 'PM' && hour !== 12) return hour + 12;
    return hour;
  };

  useEffect(() => {
    const handleFilterEvents = () => {
      const filtered = events.filter(event => {
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

        let matchesDateRange = true;
        if (startDate || endDate) {
          const eventStartTime = new Date(event.start_date_time);
          const startFilterDate = startDate ? new Date(startDate) : null;
          const endFilterDate = endDate ? new Date(endDate) : null;

          matchesDateRange =
            (!startFilterDate || eventStartTime >= startFilterDate) &&
            (!endFilterDate || eventStartTime <= endFilterDate);
        }

        return matchesBorough && matchesEventType && matchesSpecificTime && matchesDateRange;
      });

      setFilteredEvents(filtered);
      setCurrentPage(1);
    };

    handleFilterEvents();
  }, [borough, eventType, specificHour, specificAmPm, startDate, endDate, events]);

  const addToPlan = async(name, start, end) => {
    const token = Cookies.get('token');
    console.log(name, start, end);
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
      
      if(response.data.status === 'success'){
        alert('sucessfully added event to your plan');
      }

    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
        } else {
            alert('Failed to add location to your plan.');
        }
        console.error('Error adding location to plan:', error);
    }
  };

  const handlePlanButtonClick = (event) => {
    if (!event.start_date_time || !event.end_date_time || !event.event_name) {
      alert('event is missing start time, end time, or name');
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

    pageNumbers.push(1); // Always show the first page

    if (start > 2) {
      pageNumbers.push('...'); // Left dots
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    // if (end < totalPages - 1) {
    //   pageNumbers.push('...'); // Right dots
    // }

    pageNumbers.push(totalPages); // Always show the last page

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
          <label>Event Type: </label>
          <select value={eventType} onChange={e => setEventType(e.target.value)}>
            <option value="">All</option>
            <option value="Farmers Market">Farmers Market</option>
            <option value="Street Festival">Street Festival</option>
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

        <div>
          <label>End Date: </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <ul className="events-list">
        {currentEvents.length > 0 ? (
          currentEvents.map(event => (
            <li key={`${event.event_id}-${event.start_date_time}`} className="event-card">
              <div className='align-name-plus'>
                <h2>{event.event_name}</h2>
                <FontAwesomeIcon
                  icon={faSquarePlus}
                  className='add-to-plan-icon'
                  style={{ cursor: 'pointer', marginLeft: '10px', color: 'var(--accent-color)', height: '20px'}} 
                  onClick={() => handlePlanButtonClick(event)}
                />
              </div>
              <p>{`Location: ${event.event_location}`}</p>
              <p>{`Start: ${new Date(event.start_date_time).toLocaleString()}`}</p>
              <p>{`End: ${new Date(event.end_date_time).toLocaleString()}`}</p>
              <p>{`Borough: ${event.event_borough}`}</p>
              <p>{`Event Type: ${event.event_type}`}</p>
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


















