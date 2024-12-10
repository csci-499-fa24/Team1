'use client'

import React, {useEffect, useState} from 'react'


import "./App.css";
import Home1 from "./components/Home1";
import About from "./components/About";
import Work from "./components/Work";
import Testimonial from "./components/Testimonial";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {

  useEffect(() => {
    // Add the class to body on mount
    document.body.classList.add('body-landing-background');

    // Clean up: Remove the class from body on unmount
    return () => {
      document.body.classList.remove('body-landing-background');
    };
  }, []);

  return (
    <div className="App">
      <Home1 />
      <About />
      <Work />
      <Testimonial />
      <Contact />
      <Footer />
    </div>
    

    
  );
}