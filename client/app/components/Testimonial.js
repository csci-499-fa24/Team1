import React from "react";

import Imagen from 'next/image';

import ProfilePic from "../assets/NY2_home.jpg";
//import { AiFillStar } from "react-icons/ai";

const Testimonial = () => {
  return (
    <div className="work-section-wrapper">
      <div className="work-section-top">
        <p className="primary-subheading">Testimonial</p>
        <h1 className="primary-heading">What They Are Saying</h1>
        <p className="primary-text">
          Sign up and let us know your experience about the restaurant or bar visied.
        </p>
      </div>
      <div className="testimonial-section-bottom">
        <Imagen src={ProfilePic} alt="" />
        <p>
          The restaureant is located at the top of the building with a wonderful sight of the city, the Argentinian barbecue is the best.
        </p>
        
        <h2>The Team with no name</h2>
      </div>
    </div>
  );
};

export default Testimonial;
