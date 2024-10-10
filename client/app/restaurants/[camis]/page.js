// client/app/restaurants/[camis]/page.js
import React from 'react';
import styles from './details.module.css';

// Fetching data directly in the component using async/await
export async function generateMetadata({ params }) {
  return {
    title: `Restaurant Details - ${params.camis}`,
  };
}

export default async function RestaurantDetails({ params }) {
  const { camis } = params;

  // Fetching the data from the API
  const res = await fetch(`https://team1-server.onrender.com/api/inspections/${camis}`);
  if (!res.ok) {
    return <div>Failed to load restaurant data</div>;
  }

  const inspectionDetails = await res.json();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Inspection Details for Restaurant ID: {camis}</h1>
      {inspectionDetails.length ? (
        inspectionDetails.map((inspection) => (
          <div key={inspection.id} className={styles['inspection-card']}>
            <h2>{inspection.Restaurant.dba}</h2>
            <p><strong>Cuisine:</strong> {inspection.Restaurant.cuisine_description}</p>
            <p><strong>Address:</strong> {`${inspection.Restaurant.building} ${inspection.Restaurant.street}, ${inspection.Restaurant.boro}, NY ${inspection.Restaurant.zipcode}`}</p>
            <p><strong>Grade:</strong> {inspection.grade ? inspection.grade : 'Not graded yet'}</p>
            <p><strong>Inspection Date:</strong> {new Date(inspection.inspection_date).toLocaleDateString()}</p>
            <p><strong>Violations:</strong> {inspection.violation_description ? inspection.violation_description : 'None reported'}</p>
          </div>
        ))
      ) : (
        <p>No inspection data available for this restaurant.</p>
      )}
    </div>
  );
}
