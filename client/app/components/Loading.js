import React from "react";
import "../styles/loading.css"; // Add styles for the loading screen
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils } from "@fortawesome/free-solid-svg-icons";

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
        <div className="icon-container">
          <FontAwesomeIcon icon={faUtensils} className="fork-knife-icon" />
        </div>
        <p className="loading-text">Loading...</p>
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
      </div>
    );
};

export default LoadingScreen;

