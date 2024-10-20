"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './details.module.css';



export default function RestaurantDetails({ params }) {
  const { camis } = params;
  const router = useRouter(); // Initialize useRouter

  // State to store restaurant data
  const [restaurantHours, setRestaurantHours] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [isOpenNow, setIsOpenNow] = useState(null); // Track if the restaurant is open now
  const [inspectionDetails, setInspectionDetails] = useState([]);
  const [error, setError] = useState(null); // Error state for both restaurant hours and inspection data

  useEffect(() => {
    async function fetchHours() {
      try {
        // CHANGED: Replaced hardcoded URL with environmental variable for backend URL
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurant-hours?camis=${camis}`);
        if (!res.ok) throw new Error('Failed to fetch restaurant hours');
        const data = await res.json();
        setRestaurantHours(data.hours);
        setRestaurantName(data.name);
        setIsOpenNow(data.hours.open_now); // Set the open_now status
      } catch (err) {
        console.error(err);
        setError('Failed to load restaurant hours');
      }
    }


  // Fetching the data from the API
  async function fetchInspectionDetails() {
    try {
  const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/inspections/${camis}`);
  if (!res.ok) throw new Error('Failed to fetch inspection data');

  const data = await res.json();

  // Deduplicate results by combining inspection_date and violation_code
  const uniqueInspectionDetails = [
    ...new Map(
      data.map((item) => [item.inspection_date + item.violation_code, item])
    ).values(),
  ]; 
  setInspectionDetails(uniqueInspectionDetails);
      } catch (err) {
        console.error(err);
        setError('Failed to load inspection data');
      }
    }

    fetchHours();
    fetchInspectionDetails();
  }, [camis]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{restaurantName ? `Details for: ${restaurantName}` : `Inspection Details for Restaurant ID: ${camis}`}</h1>
      {error && <p>{error}</p>}
      {isOpenNow !== null && (
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: isOpenNow ? 'green' : 'red' }}>
          {isOpenNow ? 'Currently Open' : 'Currently Closed'}
        </p>
      )}
      
      {inspectionDetails.length > 0 ? (
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
        !error && <p>Loading inspection data...</p>
      )}

    //Display Hours 
    {restaurantHours ? (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'normal' }}> {/* CHANGED: Smaller font size for "Opening Hours" */}
            Opening Hours:
          </h2>
          <ul>
            {restaurantHours.weekday_text.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      ) : (
        !error && <p>Loading restaurant hours...</p>
      )}

      // Back Button 
      <button onClick={() => router.back()} style={{ margin: '20px 0', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}>
        Go Back
      </button>
    </div>
  );
}
