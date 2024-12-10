import { useEffect, useState } from 'react';
import axios from "axios";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faClock, faPhone, faStar, faStarHalfAlt, faArrowPointer, faTrash, faPenToSquare, faEdit } from '@fortawesome/free-solid-svg-icons';
import EditTimeWindow from "./EditTimeWindow";
import { toast } from "react-toastify";


export default function PlaceDetailsSidebar({ camis, onClose, start, end, id, onEditClick, eventType, onUpdateEventTime, onUpdate, onDelete, isEvent = false, eventTitle }) {
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHours, setShowHours] = useState(false);
    const [startTime, setStart] = useState(start);
    const [endTime, setEnd] = useState(end);
    const [isEditWindowVisible, setEditWindowVisible] = useState(false);
    const toggleHours = () => setShowHours(!showHours);


      // Sync state with props when start or end changes
     useEffect(() => {
        setStart(start);
        setEnd(end);
    }, [start, end]); 

    const populateStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: 'gold' }} />);
        }
        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key={fullStars} icon={faStarHalfAlt} style={{ color: 'gold' }} />);
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#ccc' }} />);
        }
        return stars;
    };

    useEffect(() => {
        if (!isEvent && camis) {
            const fetchPlaceDetails = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/place-details`, {
                            params: { camis },
                        }
                    );

                    if (response.data.status === "success") {
                        const data = response.data.data;
                        setPlaceDetails({
                            name: data.name,
                            address: data.address,
                            openingHours: data.hours,
                            photoUrl: data.photoUrl,
                            phone: data.phone,
                            website: data.website,
                            rating: data.rating
                        });
                    } else {
                        setError("Place not found");
                    }
                } catch (error) {
                    console.error("Error fetching place details:", error);
                    setError("Failed to fetch place details");
                } finally {
                    setLoading(false);
                }
            };

            fetchPlaceDetails();
        }
    }, [camis, isEvent]);

    // handle 'Esc' key press
    useEffect(() => { // Close on 'Esc' key press
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    //delete plan
    const deleteFromPlan = async (id) => {
        const token = Cookies.get("token");
        axios
            .delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/user-plans/remove/`, {
                params: { id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (response.data.status === 'success') {
                    toast.success('Successfully removed event from plan');
                     onDelete(id);
                     onClose(); 
                }
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
            });
    };

    const handleRemovePlanClick = (id) => {
        if (!id) {
            toast.warn('No ID for plan selected to remove');
        } else {
            deleteFromPlan(id);
        }
    };

    //if (loading) return <div>Loading place details...</div>;
    if (!isEvent && loading) return <div>Loading place details...</div>;
    if (error) return <div>{error}</div>;

    const handleEditClick = () => {
        setEditWindowVisible(true); // Show the EditTimeWindow
    };

    const handleCloseEditWindow = () => {
        setEditWindowVisible(false); // Hide the EditTimeWindow
    };

    const handleUpdateTime = (updatedStart, updatedEnd) => {
        setStart(updatedStart);
        setEnd(updatedEnd);
        onUpdate(id, updatedStart, updatedEnd);
    };

    //  const formattedStart = startTime
    // ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // : '';
    // const formattedEnd = endTime
    // ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    // : ''; 

    const formattedStart = startTime
    ? startTime.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })
    : '';

    const formattedEnd = endTime
    ? endTime.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })
    : '';
   
    return (
        <div className="place-details-planner">
            <button className="close-button" onClick={onClose}>X</button>
            {!isEvent ? ( 
                <>
                    <div className="icon-name-container">
                        <h2>{placeDetails.name}</h2>
                    </div>
                    <p>
                        <FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--accent-color)' }} />
                        <span style={{ marginLeft: '9px' }}>
                            {placeDetails.address}
                        </span>
                    </p>
                        {placeDetails.photoUrl && (
                            <img src={placeDetails.photoUrl} alt={placeDetails.name}
                                className="place-photo" />
                        )}
                    
                    <div className="sidebar-info">
                        {placeDetails.phone && (
                            <p>
                                <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--accent-color)' }} />
                                <span style={{ marginLeft: '9px' }}>{placeDetails.phone}</span>
                            </p>
                        )}
                        {placeDetails.rating && (
                            <p>
                                {placeDetails.rating}&nbsp;{populateStars(placeDetails.rating)}
                            </p>
                        )}
                    </div>
                    {placeDetails.website && (
                        <p>
                            <FontAwesomeIcon icon={faArrowPointer} style={{ color: 'var(--accent-color)' }} />
                            <a href={placeDetails.website} target="_blank" rel="noopener noreferrer">
                                Visit Website
                            </a>
                        </p>
                    )}

                    <h4 onClick={toggleHours} className="opening-hours-header">
                        Opening Hours {showHours ? '▼' : '►'}
                    </h4>
                    {showHours && placeDetails.openingHours ? (
                        <ul className="opening-hours-list">
                            {placeDetails.openingHours.weekday_text.map((day, index) => {
                                const [dayName, hours] = day.split(': ');
                                return (
                                    <li key={index} className="opening-hours-item">
                                        <span className="opening-hours-day">{dayName}:</span>
                                        <span className="opening-hours-time">{hours || 'Closed'}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        showHours && <p>N/A</p>
                    )}
                </>
            ) : (
                <div className="event-title-container">
                    <h2 className="event-type">NYC Events</h2>    
                    <h2>{eventTitle}</h2>
                </div>
            )}

             {/* Event Time Section */}
             {formattedStart && formattedEnd && (
             <div className="event-schedule">
                <h4 className="event-schedule-header">Schedule</h4>  
                <div className="event-actions">
                    <FontAwesomeIcon
                        icon={faClock}
                        className="time-icon"
                        style={{ color: 'var(--accent-color)', marginRight: '8px' }}
                    />
                    <span className="event-time">{formattedStart} - {formattedEnd }</span>
                    {!isEvent && (
                    <FontAwesomeIcon
                        icon={faEdit}
                        className="edit-plan-icon"
                        style={{ cursor: 'pointer', color: 'var(--accent-color)', marginLeft: '10px' }}
                        //onClick={onEditClick}
                        onClick={handleEditClick}
                        title="Edit Time"
                    />
                    )}
                    <FontAwesomeIcon
                        icon={faTrash}
                        className='remove-from-plan-icon'
                        style={{ cursor: 'pointer', color: '#db0909', marginLeft: '10px' }}
                        onClick={() => handleRemovePlanClick(id)}
                        title="Delete Event"
                    />
                    
                </div>
            </div>
            
            )}
              {/* EditTimeWindow Component */}
               {isEditWindowVisible && !isEvent && (
                <EditTimeWindow
                    id={id}
                    start={startTime}
                    end={endTime}
                    eventType={eventType}
                    onClose={handleCloseEditWindow}
                    onTimeUpdate={handleUpdateTime} // Pass function to update time
                />
            )}  
        </div>        
    
    );
}