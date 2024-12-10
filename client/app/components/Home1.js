import React from "react";
import Imagen from "next/image";
import Navbar1 from "./Navbar1";

import { useRouter } from "next/navigation";
import BannerBackground from "../assets/home-banner-background.png";
import BannerImage from "../assets/food_home.jpg";

const Home = () => {
  const router = useRouter();

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="home-container">
      <Navbar1 />
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          {/*<Imagen src={BannerBackground} alt="" /> //Elimina background blue*/}
        </div>
        <div className="home-text-section">
          <h1 className="primary-heading">
            Your favourite locations in New York City at your hand.
          </h1>
          <p className="primary-text">
            All restaurant and bar granted with grade A after inspection by the
            NYC authority.
          </p>
        </div>
        <div className="home-image-section">
          <Imagen src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
