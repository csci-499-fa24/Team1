import { useEffect, useState } from "react";
import axios from "axios";

export default function PlaceDetails({ name, address, onClose }) {
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHours, setShowHours] = useState(false);

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/place-details`,
                    {
                        params: { name, address },
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
    }, [name, address]);

    if (loading) return <div>Loading place details...</div>;
    if (error) return <div>{error}</div>;

    const toggleHours = () => {
        setShowHours(!showHours);
    };

    return (
        <div className="place-details">
            
            <h2>{placeDetails.name}</h2>
            <p>{placeDetails.address}</p>
            <div className="placeImg">
                {placeDetails.photoUrl && (
                    <img src={placeDetails.photoUrl} alt={placeDetails.name} />
                )}
            </div>
            <div onClick={toggleHours} style={{ cursor: "pointer", color: "#007bff" }}>
                {showHours ? "Hide hours" : "Show hours"}
            </div>
            {showHours && placeDetails.openingHours && (
                <div className="opening-hours">
                    {placeDetails.openingHours.weekday_text.map((day, index) => (
                        <p key={index}>{day}</p>
                    ))}
                </div>
            )}
            {placeDetails.phone && <p>Phone: {placeDetails.phone}</p>}
            {placeDetails.website && (
                <div className="website">
                    <p>Website: <a href={placeDetails.website}>{placeDetails.website}</a></p>
                </div>
            )}
            {placeDetails.rating && <p>Rating: {placeDetails.rating}</p>}

             {/* Back button for mobile */}
             {typeof window !== 'undefined' && window.innerWidth <= 768 && (
                <button onClick={onClose} className="back-button">
                    Back to Favorites
                </button>
            )}
        </div>
       
    );
}

