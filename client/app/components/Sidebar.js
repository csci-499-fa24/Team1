import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faUtensils, faPhone, faStar, faStarHalfAlt, faCircle, faEdit, faTrash, faSave, faPlus  } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const Sidebar = ({ restaurant, onClose, reviews }) => {
  if (!restaurant) return null;

  const [showHours, setShowHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showInspection, setShowInspection] = useState(false); 
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [inspectionDetails, setInspectionDetails] = useState([]);
  const [error, setError] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [userReviews, setUserReviews] = useState([]); // All user reviews
const [editingIndex, setEditingIndex] = useState(null); // Track which review is being edited
const [editText, setEditText] = useState(""); // Text for editing review
const [menuIndex, setMenuIndex] = useState(null); // Track which review's menu is open
const [userName, setUserName] = useState("You"); 

  const token = Cookies.get("token"); // Get token from cookies
  const headers = { Authorization: `Bearer ${token}` }; // Set token in headers
  useEffect(() => {
    // Reset states only if the restaurant changes
    if (!userReviews.length || userReviews[0]?.camis !== restaurant.Restaurant.camis) {
        setUserReviews([]);
        setNewReviewText("");
        setNewRating(0);
        setEditingIndex(null);
        setMenuIndex(null);
    }
}, [restaurant]);
  
  useEffect(() => {
    const fetchUserName = async () => {
      const token = Cookies.get("token");
      if (!token) return;
  
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(response.data.name || "You"); 
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };
  
    fetchUserName();
  }, []);
  
  const reviewCache = useRef({});

useEffect(() => {
    const fetchUserReviews = async () => {
        const token = Cookies.get("token");
        if (!token) return;

        try {
            // Use cached reviews if available
            if (reviewCache.current[restaurant.Restaurant.camis]) {
                setUserReviews(reviewCache.current[restaurant.Restaurant.camis]);
                return;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/${restaurant.Restaurant.camis}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sortedReviews = response.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setUserReviews(sortedReviews);

            // Cache the reviews for this restaurant
            reviewCache.current[restaurant.Restaurant.camis] = sortedReviews;
        } catch (error) {
            console.error("Error fetching user reviews:", error);
        }
    };

    fetchUserReviews();
}, [restaurant.Restaurant.camis]);

  // Add new review
  const handleAddReview = async () => {
    const token = Cookies.get("token");
    if (!token) return;

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews`,
            {
                camis: restaurant.Restaurant.camis,
                comment: newReviewText,
                rating: newRating,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Re-fetch and sort reviews by newest first
        const updatedReviews = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/${restaurant.Restaurant.camis}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserReviews(
            updatedReviews.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );

        setNewReviewText("");
        setNewRating(0);
    } catch (error) {
        console.error("Error adding review:", error);
    }
};
  
  // Save edits to the specific review
  const handleSaveEdit = async (index) => {
    const token = Cookies.get("token");
    if (!token) return;

    const reviewToEdit = userReviews[index];

    try {
        await axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/${reviewToEdit.id}`,
            {
                comment: editText,
                rating: newRating || reviewToEdit.rating,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Re-fetch and sort reviews by newest first
        const updatedReviews = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/${restaurant.Restaurant.camis}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserReviews(
            updatedReviews.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
        setEditingIndex(null);
    } catch (error) {
        console.error("Error editing review:", error);
    }
};

// Delete a specific review
  const handleDeleteReview = async (index) => {
    const token = Cookies.get("token");
    if (!token) return;
  
    const reviewToDelete = userReviews[index];
  
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reviews/${reviewToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setUserReviews((prevReviews) =>
        prevReviews
          .filter((_, i) => i !== index)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };
  
// Handle editing a specific review
const handleEdit = (index) => {
  setEditingIndex(index); // Set the index of the review being edited
  setEditText(userReviews[index].comment); // Set the text of the review for editing
  setNewRating(userReviews[index].rating); // Optionally preload the rating being edited
};

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: 'gold' }} />);
    }
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key={fullStars} icon={faStarHalfAlt} style={{ color: 'gold' }} />);
    }
    return stars;
  };

  const toggleMenu = (index) => {
    setMenuIndex(menuIndex === index ? null : index); // Toggle the menu for the clicked review
  };
  
  // Fetch inspection details when the restaurant changes
  useEffect(() => {
    if (restaurant.Restaurant.camis) {
      fetchInspectionDetails(restaurant.Restaurant.camis);
    }
  }, [restaurant.Restaurant.camis]);

  const fetchInspectionDetails = async (camis) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/inspections/${camis}`);
      if (!response.ok) throw new Error('Failed to fetch inspection data');
      const data = await response.json();

      // Deduplicate inspection records based on date and violation code
      const uniqueInspections = [
        ...new Map(data.map(item => [item.inspection_date + item.violation_code, item])).values(),
      ];
      setInspectionDetails(uniqueInspections);
    } catch (error) {
      console.error(error);
      setError('No inspection data available');
    }
  };

  const formatPhoneNumber = (phoneNumberString) => {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumberString;
  };

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
    return stars;
  };

  return (
    <div className="sidebar">
      <button className="close-button" onClick={onClose}>X</button>
      <h3>{restaurant.Restaurant.dba}</h3>
      
      {restaurant.placeDetails.photoUrl && (
        <img src={restaurant.placeDetails.photoUrl} alt="Restaurant" className="sidebar-photo" />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '20px', fontWeight: 'bold', color: restaurant.placeDetails.isOpenNow ? 'green' : 'red' }}>
          <FontAwesomeIcon icon={faCircle} style={{ marginRight: '5px' }} />
          {restaurant.placeDetails.isOpenNow ? 'Currently Open' : 'Currently Closed'}
        </p>
        {restaurant.placeDetails.rating && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginLeft: '9px' }}>
              {restaurant.placeDetails.rating}&nbsp;
            </span>
            {populateStars(restaurant.placeDetails.rating)}
          </span>
        )}
      </div>

      <p>
        <FontAwesomeIcon icon={faLocationDot} /> {restaurant.Restaurant.building} {restaurant.Restaurant.street}, {restaurant.Restaurant.boro}
      </p>
      <p><FontAwesomeIcon icon={faUtensils} /> {restaurant.Restaurant.cuisine_description}</p>

      {restaurant.Restaurant.phone && (
        <p><FontAwesomeIcon icon={faPhone} /> {formatPhoneNumber(restaurant.Restaurant.phone)}</p>
      )}
       {/* Display Website Link */}
       {restaurant.placeDetails.website && (
        <p><a href={restaurant.placeDetails.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>
      )}


      <h4 onClick={() => setShowHours(!showHours)} style={{ cursor: 'pointer' }}>
        Opening Hours {showHours ? '▼' : '►'}
      </h4>
      {showHours && restaurant.placeDetails.hours && (
        <ul className="opening-hours-list">
          {restaurant.placeDetails.hours.weekday_text.map((day, index) => (
            <li key={index}>
              <span>{day}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Collapsible Inspection Details Section */}
      <h4 onClick={() => setShowInspection(!showInspection)} style={{ cursor: 'pointer' }}>
        Inspection Details {showInspection ? '▼' : '►'}
      </h4>
      {showInspection && (
        error ? (
          <p>{error}</p>
        ) : (
          inspectionDetails.length > 0 ? (
            inspectionDetails.map((inspection, index) => (
              <div key={index} className="inspection-card">
                <p><strong>Grade:</strong> {inspection.grade || 'Not graded yet'}</p>
                <p><strong>Inspection Date:</strong> {new Date(inspection.inspection_date).toLocaleDateString()}</p>
                <p><strong>Violations:</strong> {inspection.violation_description || 'None reported'}</p>
              </div>
            ))
          ) : (
            <p>Loading inspection data...</p>
          )
        )
      )}

      {/* User Review Section */}
<div className="reviews-section">
  <h4
    onClick={() => setShowReviews(!showReviews)}
    style={{ cursor: "pointer" }}
  >
    Reviews {showReviews ? "▼" : "►"}
  </h4>

  {showReviews && (
    <div>
      {/* Star Rating System */}
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setNewRating(star)}
            className={star <= newRating ? "star filled" : "star"}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comment Input */}
      <textarea
        value={newReviewText}
        onChange={(e) => setNewReviewText(e.target.value)}
        placeholder="Write your review..."
        className="review-input"
      />

      {/* Add Review Button */}
      <button onClick={handleAddReview} className="unique-button submit-button">
        Submit Review
      </button>

      {/* User Reviews */}
      <div>
        {userReviews.map((review, index) => (
          <div key={review.id} className="review-card">
            {editingIndex === index ? (
              <div>
                {/* Edit Mode */}
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="review-input"
                />
                <div className="button-group">
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="unique-button save"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="unique-button save"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Display Mode */}
                <p>
                <strong>{review.user?.userName || "Anonymous"}</strong>
                  <span className="review-date">
                  ({new Date(review.createdAt || review.updatedAt || Date.now()).toLocaleDateString()})
                  </span>
                </p>
                <p>Rating: {renderStars(review.rating)}</p>
                <p>{review.comment}</p>

                {/* Three-Dot Menu */}
                <div className="menu">
                  <button
                    onClick={() => toggleMenu(index)}
                    className="menu-button"
                  >
                    &#x22EE; {/* Three vertical dots */}
                  </button>
                  {menuIndex === index && (
                    <div className="menu-dropdown">
                      <button
                        onClick={() => {
                          toggleMenu(null);
                          handleEdit(index);
                        }}
                        className="menu-item"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          toggleMenu(null);
                          handleDeleteReview(index);
                        }}
                        className="menu-item delete"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Google Reviews */}
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div
            key={index}
            className="review-card"
            style={{
              marginTop: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p>
              <strong>{review.author_name || "Anonymous"}</strong>{" "}
              <span style={{ color: "#555", fontSize: "12px" }}>
                ({new Date(review.date).toLocaleDateString()})
              </span>
            </p>
            <p>Rating: {renderStars(review.rating)}</p>
            <p>{review.text}</p>
          </div>
        ))
      ) : (
        <p>No reviews available.</p>
      )}
    </div>
  )}
</div>

      {showReviews && reviews.length > visibleReviews && (
        <button onClick={() => setVisibleReviews(visibleReviews + 3)} style={{ marginTop: '10px', backgroundColor: 'silver', color: 'black', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Show more reviews
        </button>
      )}
    </div>
  );
};

export default Sidebar;
