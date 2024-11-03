
import React, { useState } from 'react';

const ExpandableCard = ({ restaurant, position, onClose, handleDragStart, reviews }) => {
  const [showHours, setShowHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  // Toggle handlers
  const toggleHours = () => setShowHours(!showHours);
  const toggleReviews = () => setShowReviews(!showReviews);

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
      
      {/* Display Open Status */}
      <p style={{ fontSize: '20px', fontWeight: 'bold', color: restaurant.placeDetails.isOpenNow ? 'green' : 'red' }}>
        {restaurant.placeDetails.isOpenNow ? 'Currently Open' : 'Currently Closed'}
      </p>
      
      {/* Display Address and Cuisine */}
      <p><strong>Address:</strong> {restaurant.Restaurant.building} {restaurant.Restaurant.street}, {restaurant.Restaurant.boro}</p>
      <p><strong>Cuisine:</strong> {restaurant.Restaurant.cuisine_description}</p>
      
      {/* Display Phone Number if available */}
      {restaurant.Restaurant.phone && (
        <p><strong>Phone:</strong> {restaurant.Restaurant.phone}</p>
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
                          <span className="opening-hours-day">{dayName}:</span>
                          <span className="opening-hours-time">{hours || 'Closed'}</span>
                      </li>
                  );
              })}
          </ul>
      ) : (
          showHours && <p>N/A</p>
      )}


      {/* Display Rating if available */}
      {restaurant.placeDetails.rating && (
        <p><strong>Rating:</strong> {restaurant.placeDetails.rating} / 5</p>
      )}

      {/* Display Website if available */}
      {restaurant.placeDetails.website && (
        <p><strong>Website:</strong> <a href={restaurant.placeDetails.website} target="_blank" rel="noopener noreferrer">{restaurant.placeDetails.website}</a></p>
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

