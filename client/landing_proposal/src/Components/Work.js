import React from "react";
import PickMeals from "../Assets/pick-meals-image.png";
import ChooseMeals from "../Assets/choose-image.png";
import DeliveryMeals from "../Assets/delivery-image.png";

const Work = () => {
  const workInfoData = [
    {
      image: PickMeals,
      title: "Pick your kind of food",
      text: "Information in the map display the type of cuisine for each location.",
    },
    {
      image: ChooseMeals,
      title: "Choose granted A places.",
      text: "All locations in the map were granted with A after NYC authority inspection.",
    },
    {
      image: DeliveryMeals,
      title: "Get a location near to you",
      text: "Locate Restaurants and bars near to your location or get directions using the embeded map.",
    },
  ];
  return (
    <div className="work-section-wrapper">
      <div className="work-section-top">
        <p className="primary-subheading">Work</p>
        <h1 className="primary-heading">How It Works</h1>
        <p className="primary-text">
          Locations of restaurants and bar granted with a certificate with grade A by the NY authority
          are displayed in the red icons. Information about its last inspection is displayed in the left window.
        </p>
      </div>
      <div>
      <p className="work-section-top">
      <iframe src="https://www.google.com/maps/d/embed?mid=1jqb3EQH5UwXbTG2F87dcf6-GUhxrtHE&ehbc=2E312F" width="640" height="480"></iframe>
      </p>
      </div>
      <div className="work-section-bottom">
        {workInfoData.map((data) => (
          <div className="work-section-info" key={data.title}>
            <div className="info-boxes-img-container">
              <img src={data.image} alt="" />
            </div>
            <h2>{data.title}</h2>
            <p>{data.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Work;
