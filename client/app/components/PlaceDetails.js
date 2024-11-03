
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDraggableCard } from './useDraggableCard';

export default function PlaceDetails({ camis, onClose }) {
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHours, setShowHours] = useState(false);

    // Set dynamic initial position based on screen width
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const initialPosition = isMobile ? { x: 10, y: 80 } : { x: 1000, y: 200 };
    
    const { cardPosition, handleDragStart } = useDraggableCard(initialPosition);
    
    const toggleHours = () => setShowHours(!showHours);

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/place-details`,
                    { params: { camis } }
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

    if (loading) return <div>Loading place details...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div
            className="place-details"
            style={{ top: `${cardPosition.y}px`, left: `${cardPosition.x}px`, position: 'absolute' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <button className="close-button" onClick={onClose}>X</button>
            <h2>{placeDetails.name}</h2>
            <p>{placeDetails.address}</p>
            <div className="placeImg">
                {placeDetails.photoUrl && (
                    <img src={placeDetails.photoUrl} alt={placeDetails.name} 
                         className="place-photo" />
                )}
            </div>
            <h4 onClick={toggleHours} style={{ cursor: 'pointer' }}>
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
            {placeDetails.phone && <p>Phone: {placeDetails.phone}</p>}
            {placeDetails.website && (
                <div className="website">
                    <p>Website: <a href={placeDetails.website} target="_blank" rel="noopener noreferrer">{placeDetails.website}</a></p>
                </div>
            )}
            {placeDetails.rating && <p>Rating: {placeDetails.rating}</p>}

        </div>
    );
}

