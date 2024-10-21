"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './details.module.css';

export default function RestaurantDetails({ params }) {
  const { camis } = params;
  const router = useRouter(); 

  // State to store restaurant data
  const [restaurantHours, setRestaurantHours] = useState(null);
  const [restaurantName, setRestaurantName] = useState(null);
  const [restaurantAddress, setRestaurantAddress] = useState(null); // Store address outside the inspection details
  const [restaurantCuisine, setRestaurantCuisine] = useState(null); // Store cuisine outside the inspection details
  const [isOpenNow, setIsOpenNow] = useState(null); // Track if the restaurant is open now
  const [inspectionDetails, setInspectionDetails] = useState([]);
  const [error, setError] = useState(null); // Error state for both restaurant hours and inspection data

  useEffect(() => {
    async function fetchHours() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/restaurant-hours?camis=${camis}`);
        if (!res.ok) throw new Error('Failed to fetch restaurant hours');
        const data = await res.json();
        setRestaurantHours(data.hours);
        setRestaurantName(data.name);
        setIsOpenNow(data.hours.open_now); // Set the open_now status
      } catch (err) {
        console.error(err);
        setError('Restaurant hours not avaliable');
      }
    }

  async function fetchInspectionDetails() {
    try {
  const res = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/inspections/${camis}`);
  if (!res.ok) throw new Error('Failed to fetch inspection data');
  const data = await res.json();

  if (data.length > 0) {
    setRestaurantCuisine(data[0].Restaurant.cuisine_description);
    setRestaurantAddress(`${data[0].Restaurant.building} ${data[0].Restaurant.street}, ${data[0].Restaurant.boro}, NY ${data[0].Restaurant.zipcode}`);
  }

  const uniqueInspectionDetails = [
    ...new Map(
      data.map((item) => [item.inspection_date + item.violation_code, item])
    ).values(),
  ]; 
  setInspectionDetails(uniqueInspectionDetails);
      } catch (err) {
        console.error(err);
        setError('Restaurant not found or no inspection data available');
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
      {restaurantCuisine && (
        <p><strong>Cuisine:</strong> {restaurantCuisine}</p> 
      )}
      {restaurantAddress && (
        <p><strong>Address:</strong> {restaurantAddress}</p>
      )}
       
      <br></br>
      <h2>Inspection Detail:</h2>
      {inspectionDetails.length > 0 ? (
        inspectionDetails.map((inspection) => (
          <div key={inspection.id} className={styles['inspection-card']}>
            
            <p><strong>Grade:</strong> {inspection.grade ? inspection.grade : 'Not graded yet'}</p>
            <p><strong>Inspection Date:</strong> {new Date(inspection.inspection_date).toLocaleDateString()}</p>
            <p><strong>Violations:</strong> {inspection.violation_description ? inspection.violation_description : 'None reported'}</p>
          </div>
        ))
      ) : (
        !error && <p>Loading inspection data...</p>
      )}

    {restaurantHours ? (
        <div>
          <h2 > Opening Hours:</h2>
          <ul>
            {restaurantHours.weekday_text.map((day, index) => (
              <li key={index}>{day}</li>
            ))}
          </ul>
        </div>
      ) : (
        !error && <p>Loading restaurant hours...</p>
      )}

      <button onClick={() => router.back()} style={{ margin: '20px 0', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' }}> Go Back </button>
    </div>
  );
}
