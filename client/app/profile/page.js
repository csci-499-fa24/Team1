"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import "../styles/profile.css";
import Navbar from '../components/Navbar';
import Favorites from '../components/Favorites';
import PlaceDetails from '../components/PlaceDetails';

export default function Personal() {
    const [user, setUser] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const [isSlideOut, setIsSlideOut] = useState(false); // State for slide-out visibility
    const [isMobileDetailsVisible, setMobileDetailsVisible] = useState(false);

    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
        document.head.appendChild(link);

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
        const { dba, building, street, boro, zipcode } = place.Restaurant;
        const name = dba;
        const address = `${building} ${street}, ${boro}, NY ${zipcode}`;
        setSelectedPlace({ name, address });
        setIsSlideOut(true); // Show slide-out when a place is selected
        if (window.innerWidth <= 768) {
            setMobileDetailsVisible(true); // Show PlaceDetails in mobile view
        }
    };

    const closeDetails = () => {
        setMobileDetailsVisible(false); // Hide PlaceDetails in mobile view
    };

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
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
                    <div className="profile-avatar-welcome-section">
                       <i class="fa fa-user-circle"></i>
                        <div>
                            <h2>Welcome,</h2>
                            <h2> {user.userName}</h2>
                        </div>
                    </div>

                    <div className="favorite-section">

                        <h1 className="favorites-title"> <i className="fa fa-star"></i> Favorites</h1>
                        <div className="favorites-container">
                            <Favorites onFavoriteClick={onFavoriteClick} />
                        </div>
                    </div>
                </div>

                <div
                    className={`profile-right-section ${isSlideOut ? 'active' : ''} ${
                        isMobileDetailsVisible ? 'mobile-active' : ''
                    }`}
                >
                    <div className="infoContainer">
                        {selectedPlace && (
                            <PlaceDetails
                                name={selectedPlace.name}
                                address={selectedPlace.address}
                                onClose={closeDetails} // Close button functionality for mobile view
                            />
                        )}
                    </div>
                </div>

            </div>

        </div>

    );


}
