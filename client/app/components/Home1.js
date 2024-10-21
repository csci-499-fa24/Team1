import React from "react";

import Imagen from 'next/image';

import BannerBackground from '../assets/home-banner-background.png';
import BannerImage from '../assets/food_home.jpg';


const Home = () => {
  return (
    <div className="home-container">
      
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <Imagen src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          <h1 className="primary-heading">
            Your Favourite locations in Manhattan at your hand.
          </h1>
          <p className="primary-text">
            All restaurant and bar granted with grade A after inspection by the NYC authority.
          </p>
          <button className="secondary-button">
            Sign up {" "}
          </button>
        </div>
        <div className="home-image-section">
          <Imagen src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;