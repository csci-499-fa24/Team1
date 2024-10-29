import React from 'react';

const ExpandableCard = ({ restaurant, position, onClose, handleDragStart, reviews }) => (
  <div
    className="expandable-card"
    style={{ top: `${position.y}px`, left: `${position.x}px`, position: "absolute" }}
    onMouseDown={handleDragStart}
    onTouchStart={handleDragStart}
  >
    <button className="close-button" onClick={onClose}>X</button>
    <h3 className="restaurant-title">{restaurant.Restaurant.dba}</h3>
    <p style={{ fontSize: '20px', fontWeight: 'bold', color: restaurant.isOpenNow ? 'green' : 'red' }}>
      {restaurant.isOpenNow ? 'Currently Open' : 'Currently Closed'}
    </p>
    <p><strong>Address:</strong> {restaurant.Restaurant.building} {restaurant.Restaurant.street}, {restaurant.Restaurant.boro}</p>
    <p><strong>Cuisine:</strong> {restaurant.Restaurant.cuisine_description}</p>
    {restaurant.Restaurant.phone && (  // Conditionally render phone if it exists
      <p><strong>Phone:</strong> {restaurant.Restaurant.phone}</p>
    )}

    {restaurant.restaurantHours ? (
      <div>
        <h4>Opening Hours:</h4>
        <ul>
          {restaurant.restaurantHours.weekday_text.map((day, index) => (
            <li key={index}>{day}</li>
          ))}
        </ul>
      </div>
    ) : (
      <p>Loading restaurant hours...</p>
    )}
    <br></br>
    <h4>Inspection Details:</h4>
    {restaurant.inspectionDetails && restaurant.inspectionDetails.length > 0 ? (
      restaurant.inspectionDetails.map((inspection, i) => (
        <div key={i} className="inspection-card">
          <p><strong>Grade:</strong> {inspection.grade || 'Not graded yet'}</p>
          <p><strong>Date:</strong> {new Date(inspection.inspection_date).toLocaleDateString()}</p>
          <p><strong>Violations:</strong> {inspection.violation_description || 'None'}</p>
        </div>
      ))
    ) : (
      <p>No inspection data available</p>
    )}
    {/* Display Reviews */}
    <h4>Reviews:</h4>
{reviews && reviews.length > 0 ? (
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
  <p>No reviews available</p>
)}
  </div>
);

export default ExpandableCard;
