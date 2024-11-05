
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../styles/favorite.css"; // Import the CSS for the favorites component
import '../globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas   
 } from '@fortawesome/free-solid-svg-icons';
  library.add(fas)  

export default function Favorites({ onFavoriteClick }) { // Accept onFavoriteClick prop
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavoritePlaces();
    }, []);

    // Handle fetching favorite places
    const fetchFavoritePlaces = () => {
        const token = Cookies.get("token");
        axios.get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/favorites", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            setFavorites(response.data.data.favoritePlaces);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching favorite places:", err);
            setError("Failed to load favorites.");
            setLoading(false);
        });
    };

    // Handle removing a favorite place
    const handleRemoveFavorite = async (camis) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/remove/${camis}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 204) {
                fetchFavoritePlaces();
            }
        } catch (error) {
            console.error("Error removing favorite place:", error);
            alert("Failed to remove favorite place.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="favorites-container">
            <ul className="favorites-list">
                {favorites.length === 0 ? (
                    <p>No favorites added yet.</p>
                ) : (
                    favorites.map((place) => (
                        <li 
                            key={place.id} 
                            className="favorite-item" 
                            onClick={() => onFavoriteClick(place)} // Call onFavoriteClick on click
                        >
                            <div className="favorite-details">
                                <h3>{place.Restaurant.dba}</h3>
                                <p>
                                    {place.Restaurant.building} {place.Restaurant.street}, {place.Restaurant.boro}, NY {place.Restaurant.zipcode}
                                </p>
                            </div>
                           
                            <button 
                                className="remove-favorite-btn" 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering the click on the item
                                    handleRemoveFavorite(place.camis);
                                }}                         
                            >
                                <FontAwesomeIcon icon="trash" />
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}


