import React from "react";
import Imagen from 'next/image';
import AboutBackground from "../assets/about-background.png";
import AboutBackgroundImage from "../assets/NY3_home.jpg";

import {useRouter} from 'next/navigation';

const About = () => {

  const router = useRouter();

  const handleRecommendation=()=>{
    router.push('https://www.therumhousenyc.com');
  };

  return (
    <div className="about-section-container">
      <div className="about-background-image-container">
        <Imagen src={AboutBackground} alt="" />
      </div>
      <div className="about-section-image-container">
        <Imagen src={AboutBackgroundImage} alt="" />
      </div>
      <div className="about-section-text-container">
        <p className="primary-subheading">About</p>
        <h1 className="primary-heading">
          Food Is An Important Part Of A Balanced Diet
        </h1>
        <p className="primary-text">
          As a tourist or new visitor of NYC we want you have the best experience visiting places graded with A certificate.
        </p>
        <p className="primary-text">
          Sign up si you can have a personalized map with displayed only your selected locations.        
        </p>
        <div className="about-buttons-container">
          <button className="secondary-button" onClick={handleRecommendation}>Place of the week</button>          
         
        </div>
      </div>
    </div>
  );
};

export default About;
