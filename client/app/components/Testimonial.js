import React from "react";
import Imagen from 'next/image';
import ProfilePic from "../assets/NY2_home.jpg";

const Testimonial = () => {
  return (
    <div className="work-section-wrapper">
      <div className="work-section-top">
        <p className="primary-subheading">Testimonial</p>
        <h1 className="primary-heading">What they are saying</h1>
        <p className="primary-text">
          Sign up and let us know your experience about the restaurant or bar you visited.
        </p>
      </div>
      <div className="testimonial-section-bottom">
        <Imagen src={ProfilePic} alt="" />
        <p>
          The restaurant is located at the top of the building with a wonderful sight of the city, this Argentinian barbecue is the best.
        </p>
        
        <h2>By the Restaurant and Bar tracking team!</h2>
      </div>
    </div>
  );
};

export default Testimonial;
