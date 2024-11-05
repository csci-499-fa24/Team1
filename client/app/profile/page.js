"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import "../styles/profile.css";
import Navbar from '../components/Navbar';
import Favorites from '../components/Favorites';
import PlaceDetails from '../components/PlaceDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas   
 } from '@fortawesome/free-solid-svg-icons';
  library.add(fas)  

export default function Personal() {
    const [user, setUser] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    

    const closePlaceDetails = () => {
        setSelectedPlace(null);
    };
    

    useEffect(() => {
     
        const token = Cookies.get("token");
        if (!token) {
            console.log("Please log in.");
            router.push("/login");
            return;
        }

        axios
            .get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (response.data && response.data.userDetail) {
                    setUser(response.data.userDetail);
                } else {
                    setError("Failed to authenticate. Please log in again.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
                setLoading(false);
            });
    }, [router]);


    // Handle clicking a favorite
    const onFavoriteClick = (place) => {
        const camis = place.camis;
        setSelectedPlace({camis}); 
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Top Section */}
            <div className="profile-top-section">
                <Navbar />
            </div>
    
            {/* Main Content */}
            <div className="profile-main-content">
                <div className="profile-left-section">
                    {/* Welcome Section */}
                    <div className="profile-welcome-section">
                        <FontAwesomeIcon icon="user-circle" className="avatar-icon" />
                        <h2 className="welcome-message">Welcome, {user.userName}</h2>
                    </div>
    
                    {/* Favorites Section */}
                    <div className="favorite-section">
                        <h1 className="favorites-title"> <FontAwesomeIcon icon="star" /> Favorites</h1>
                        <div className="favorites-container">
                            <Favorites onFavoriteClick={onFavoriteClick} />
                        </div>
                    </div>
                </div> 
                <div className="profile-right-section"> </div>
            </div>
    
            {selectedPlace && (
                <PlaceDetails
                    camis={selectedPlace.camis}
                    onClose={closePlaceDetails}         
                />
            )}    
        </div>
    );


}
