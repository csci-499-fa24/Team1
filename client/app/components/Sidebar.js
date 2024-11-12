import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faUtensils, faPhone, faStar, faStarHalfAlt, faCircle } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ restaurant, onClose, reviews }) => {
  if (!restaurant) return null;

  const [showHours, setShowHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showInspection, setShowInspection] = useState(false); 
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [inspectionDetails, setInspectionDetails] = useState([]);
  const [error, setError] = useState(null);

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

      <h4 onClick={() => setShowReviews(!showReviews)} style={{ cursor: 'pointer' }}>
        Reviews {showReviews ? '▼' : '►'}
      </h4>
      {showReviews && reviews && reviews.length > 0 ? (
  reviews.slice(0, visibleReviews).map((review, index) => (
    <div key={index} className="review-card">
      <p><strong>{review.author_name || "Anonymous"}</strong> ({review.date}):</p>
      <p style={{ margin: '5px 0', color: '#555' }}>Rating: {populateStars(review.rating)}</p>
      <p style={{ marginBottom: '10px' }}>{review.text}</p>
      {index < reviews.length - 1 && <hr style={{ border: 'none', height: '1px', backgroundColor: '#ddd', margin: '10px 0' }} />}
    </div>
  ))
) : (
  showReviews && <p>No reviews available</p>
)}


      {showReviews && reviews.length > visibleReviews && (
        <button onClick={() => setVisibleReviews(visibleReviews + 3)} style={{ marginTop: '10px', backgroundColor: 'silver', color: 'black', padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Show more reviews
        </button>
      )}
    </div>
  );
};

export default Sidebar;
