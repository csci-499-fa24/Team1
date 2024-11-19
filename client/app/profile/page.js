"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import "../styles/profile.css";
import Navbar from "../components/Navbar";
import Favorites from "../components/Favorites";
import Sidebar from "../components/Sidebar"; // Import Sidebar component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

export default function Personal() {
  const [user, setUser] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null); // Used for the selected restaurant
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const closeSidebar = () => {
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
  const onFavoriteClick = async (place) => {
    const token = Cookies.get("token");

    try {

      // Fetch inspection details
      const inspectionRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/inspections/${place.camis}`
      );

      // Fetch reviews
      const reviewsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/restaurant-reviews`,
        { params: { camis: place.camis } }
      );

      // Fetch additional place details
      const placeDetailsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/favorites/place-details`,
        { params: { camis: place.camis } }
      );

      setSelectedPlace({
        
        Restaurant: placeDetailsRes.data.data.restaurant,
       
        inspectionDetails: inspectionRes.data,
        reviews: reviewsRes.data,
          placeDetails:   {
          photoUrl: placeDetailsRes.data.data.photoUrl,
          website: placeDetailsRes.data.data.website,
          rating: placeDetailsRes.data.data.rating,
          hours: placeDetailsRes.data.data.hours,
          isOpenNow: placeDetailsRes.data.data.hours.open_now,
        },
       
      });
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  };
  console.log(selectedPlace)
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
      <Navbar />
      {/* Main Content */}
      <div className="profile-main-content">
        <div className="profile-inner-section">
          {/* Welcome Section */}
          <div className="profile-welcome-section">
            <FontAwesomeIcon icon="user-circle" className="avatar-icon" />
            <h2 className="welcome-message">Welcome, {user.userName}</h2>
          </div>

          {/* Favorites Section */}
          <div className="favorite-section">
            <h1 className="favorites-title">
              <FontAwesomeIcon icon="star" /> Favorites
            </h1>
            <div className="favorites-container">
              <Favorites onFavoriteClick={onFavoriteClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for Selected Place */}
      {selectedPlace && (
        <Sidebar
          restaurant={selectedPlace} // Pass selected place details
          reviews={selectedPlace.reviews} // Pass reviews
          onClose={closeSidebar} // Handle close functionality
        />
      )}
    </div>
  );
}