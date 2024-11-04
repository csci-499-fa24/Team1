"use client"
import React, { useState } from "react";
import Logo from "../assets/Logo2.png";
import Imagen from 'next/image';
import {useRouter} from 'next/navigation';

const Navbar1 = () => {

  const router = useRouter();

  const handleSignUp=()=>{
    router.push('/signup');
  };

  const handleLogin=()=>{
    router.push('/login');
  };
  
  return (
    <nav>
      <div className="nav-logo-container">
        <Imagen src={Logo} alt="" />
      </div>
      <div className="navbar-links-container">
        
        <button className="primary-button" onClick={handleLogin}> Login {""} </button>
        <button className="primary-button" onClick={handleSignUp}> Sign up {""} </button>
      </div>
      
    </nav>
  );
};

export default Navbar1;