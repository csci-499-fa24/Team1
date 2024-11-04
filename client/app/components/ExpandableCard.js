import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faUtensils, faPhone, faStar, faStarHalfAlt, faArrowPointer } from '@fortawesome/free-solid-svg-icons';

import '../globals.css';

const ExpandableCard = ({ restaurant, position, onClose, handleDragStart, reviews }) => {
  const [showHours, setShowHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Toggle handlers
  const toggleHours = () => setShowHours(!showHours);
  const toggleReviews = () => setShowReviews(!showReviews);

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

  return (
    <div
      className="expandable-card"
      style={{ top: `${position.y}px`, left: `${position.x}px`, position: "absolute" }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <button className="close-button" onClick={onClose}>X</button>
      
      {/* Display Restaurant Title */}
      <h3 className="restaurant-title">{restaurant.Restaurant.dba}</h3>
      
      {/* Display Restaurant Photo if available */}
      {restaurant.placeDetails.photoUrl && (
        <img
          src={restaurant.placeDetails.photoUrl}
          /* alt={`${restaurant.Restaurant.dba} photo`} */
          className="restaurant-photo"
          style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} 
        />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '20px', fontWeight: 'bold', color: restaurant.placeDetails.isOpenNow ? 'green' : 'red' }}>
          {restaurant.placeDetails.isOpenNow ? 'Currently Open' : 'Currently Closed'}
        </p>

        {/* Display Rating with Stars */}
        {restaurant.placeDetails.rating && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginLeft: '9px' }}>
              {restaurant.placeDetails.rating}&nbsp;
            </span>
            {populateStars(restaurant.placeDetails.rating)}
          </span>
        )}
      </div>
      
      {/* Display Address and Cuisine */}
      <p>
      <FontAwesomeIcon icon={faLocationDot} style={{ color: 'var(--accent-color' }}/>
        <span style={{ marginLeft: '9px' }}>
          {`${restaurant.Restaurant.building} ${restaurant.Restaurant.street}, ${restaurant.Restaurant.boro}`}
         </span>
      </p>
      <p>
      <FontAwesomeIcon icon={faUtensils} style={{ color: 'var(--accent-color' }}/>
        <span style={{ marginLeft: '9px' }}>
          {restaurant.Restaurant.cuisine_description}
        </span>
      </p>
      
      {/* Display Phone Number if available */}
      {restaurant.Restaurant.phone && (
        <p>
        <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--accent-color' }}/>
          <span style={{ marginLeft: '9px' }}>
            {restaurant.Restaurant.phone}
          </span>
        </p>
      )}

      {/* Display Website if available */}
      {restaurant.placeDetails.website && (
        <p style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', transform: 'translateX(4px)' }}>
            <FontAwesomeIcon 
              icon={faArrowPointer} 
              style={{ color: 'var(--accent-color)', fontSize: '1.2em' }} 
            />
          </span>
          <span style={{ marginLeft: '13px' }}>
            <a 
              href={restaurant.placeDetails.website} 
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
              {restaurant.placeDetails.website}
            </a>
          </span>
        </p>
      )}


      {/* Toggle for Opening Hours */}
      <h4 onClick={toggleHours} style={{ cursor: 'pointer' }}>
          Opening Hours {showHours ? '▼' : '►'}
      </h4>
      {showHours && restaurant.placeDetails.hours ? (
          <ul className="opening-hours-list">
              {restaurant.placeDetails.hours.weekday_text.map((day, index) => {
                  const [dayName, hours] = day.split(': '); // Split day name from hours
                  return (
                      <li key={index} className="opening-hours-item">
                          <span className="opening-hours-day">{dayName}: </span>
                          <span className="opening-hours-time">{hours || 'Closed'}</span>
                      </li>
                  );
              })}
          </ul>
      ) : (
          showHours && <p>N/A</p>
      )}

      {/* Toggle for Reviews */}
      <h4 onClick={toggleReviews} style={{ cursor: 'pointer' }}>
        Reviews {showReviews ? '▼' : '►'}
      </h4>
      {showReviews && reviews && reviews.length > 0 ? (
        reviews.map((review, index) => (
          <React.Fragment key={index}>
            <div className="review-card">
              <p><strong>{review.author_name}</strong> ({review.time}):</p>
              <p>Rating: {review.rating}</p>
              <p>{review.text}</p>
            </div>
            {index < reviews.length - 1 && <hr />}
          </React.Fragment>
        ))
      ) : (
        showReviews && <p>No reviews available</p>
      )}
    </div>
  );
};

export default ExpandableCard;

