
import { useEffect, useState } from 'react';
import axios from "axios";
import Cookies from "js-cookie";
import { useDraggableCard } from './useDraggableCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faStar, faStarHalfAlt, faArrowPointer, faTrash, faPenToSquare } from '@fortawesome/free-solid-svg-icons';


export default function PlaceDetails({ camis, onClose , start, end, id, onEditClick}) {
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHours, setShowHours] = useState(false);

    // Set dynamic initial position based on screen width
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const initialPosition = isMobile ? { x: 10, y: 80 } : { x: 1000, y: 200 };
    
    const { cardPosition, handleDragStart } = useDraggableCard(initialPosition);
    
    const toggleHours = () => setShowHours(!showHours);

    const populateStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating); 
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: 'gold' }} />);
        }
    
        // For half ratings
        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key={fullStars} icon={faStarHalfAlt} style={{ color: 'gold' }} />);
        }
    
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#ccc' }} />);
        }
    
        return stars;
      };

    useEffect(() => {
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
    }, [camis]);

    useEffect(() => { // close upon 'esc' key press
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
                if(response.data.status === 'success'){
                    alert('successfully removed event from plan');
                }
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
            });
    };

    const handleRemovePlanClick = (id) => {
        if (!id) {
            alert('No ID for plan selected to remove');
        } else {
            deleteFromPlan(id);
        }
    };

    if (loading) return <div>Loading place details...</div>;
    if (error) return <div>{error}</div>;

    const formattedStart = start
        ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
    const formattedEnd = end
        ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div
            className="place-details"
            style={{ top: `${cardPosition.y}px`, left: `${cardPosition.x}px`, position: 'absolute' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <button className="close-button" onClick={onClose}>X</button>
            <div className="icon-name-container">
                <FontAwesomeIcon
                    icon={faTrash}
                    className='remove-from-plan-icon'
                    style={{ cursor: 'pointer', color: '#db0909', height:'30px' }} 
                    onClick={() => handleRemovePlanClick(id)}
                />
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    className='remove-from-plan-icon'
                    style={{ cursor: 'pointer', color: 'var(--accent-color)', height:'30px' }} 
                    onClick={onEditClick}
                />
                <h2>{placeDetails.name}</h2>
            </div>
            {formattedStart!='' && formattedEnd!='' && <h2>{formattedStart} - {formattedEnd}</h2>}  {/* render the time interval if given */}
            <p>
                <FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--accent-color' }}/>
                    <span style={{ marginLeft: '9px' }}>
                    {placeDetails.address}
                    </span>
            </p>
            <div className="placeImg">
                {placeDetails.photoUrl && (
                    <img src={placeDetails.photoUrl} alt={placeDetails.name} 
                         className="place-photo" />
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Display Phone Number */}
                {placeDetails.phone && (
                    <p style={{ margin: 0 }}>
                    <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--accent-color)' }} />
                    <span style={{ marginLeft: '9px' }}>
                        {placeDetails.phone}
                    </span>
                    </p>
                )}

                {/* Display Rating with Stars */}
                {placeDetails.rating && (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: '9px' }}>
                        {placeDetails.rating}&nbsp;
                    </span>
                    {populateStars(placeDetails.rating)}
                    </span>
                )}
            </div>

            {placeDetails.website && (
            <div className="website">
                <p style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', transform: 'translateX(4px)' }}>
                    <FontAwesomeIcon 
                    icon={faArrowPointer} 
                    style={{ color: 'var(--accent-color)', fontSize: '1.2em' }} 
                    />
                </span>
                <span style={{ marginLeft: '13px' }}>
                    <a 
                    href={placeDetails.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#007bff', textDecoration: 'none', transition: 'color 0.3s, text-decoration 0.3s' }} 
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#0056b3';
                        e.currentTarget.style.textDecoration = 'underline'; // Underline on hover
                    }} 
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#007bff';
                        e.currentTarget.style.textDecoration = 'none'; // Remove underline when not hovering
                    }}
                    >
                    {placeDetails.website}
                    </a>
                </span>
                </p>
            </div>
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
        </div>
    );
}

