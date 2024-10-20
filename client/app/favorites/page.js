
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import "../styles/favorite.css"; // Import the CSS for the favorites page

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get("token");

        if (!token) {
            // If no token is present, redirect to login
            router.push("/login");
            return;
        }

        // Verify the token with the server
        axios
            .get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (response.data && response.data.status === 'success') {
                    setIsAuthenticated(true);
                    // Fetch favorite places if authenticated
                    fetchFavoritePlaces();
                } else {
                    // If the token is invalid, redirect to login
                    router.push("/login");
                }
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                Cookies.remove("token");
                router.push("/login");
            });
    }, [router]);

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
    const handleRemoveFavorite = async (placeId) => {
        const token = Cookies.get("token");
        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/remove/${placeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 204) {
               // alert('Favorite place removed!');
                // Re-fetch the updated favorite places
                fetchFavoritePlaces();
            }
        } catch (error) {
            console.error('Error removing favorite place:', error);
            alert('Failed to remove favorite place.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;  // Prevent rendering the page content if not authenticated
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="favorites-container">
            <button className="back-button" onClick={() => router.push('/profile')}>
                <i className="fa fa-arrow-left"></i> Back
            </button>
            
            <h1>Your Favorite Places</h1>
            {favorites.length === 0 ? (
                <p>No favorites added yet.</p>
            ) : (
                <ul className="favorites-list">
                    {favorites.map((place) => (
                        <li key={place.id} className="favorite-item">
                            <h3>{place.Restaurant.dba}</h3>
                            <p>
                                Address: {place.Restaurant.building} {place.Restaurant.street}, {place.Restaurant.boro}, NY {place.Restaurant.zipcode}
                            </p>
                            <button 
                                className="remove-favorite-btn" 
                                onClick={() => handleRemoveFavorite(place.id)}
                            >
                              Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
