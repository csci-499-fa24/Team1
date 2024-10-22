import React, { useState } from "react";
import "../styles/Navbar.css";

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [icon, setIcon] = useState("nav__toggler");
  const navToggle = () => {
    if (active === "nav__menu") {
      setActive("nav__menu nav__active");
    } else setActive("nav__menu");

    // Icon Toggler
    if (icon === "nav__toggler") {
      setIcon("nav__toggler toggle");
    } else setIcon("nav__toggler");
  };
  return (
    <nav className="nav container">
      <a href="#" className="nav__brand">
        Restaurant & Bar Tracker
      </a>
      <ul className={active}>
        <li className="nav__item">
          <a href="/" className="nav__link">
            Home
          </a>
        </li>
        <li className="nav__item">
          <a href="/map" className="nav__link">
            Map
          </a>
        </li>
        <li className="nav__item">
          <a href="/events" className="nav__link">
            NYC Events
          </a>
        </li>
        <li className="nav__item">
          <a href="#" className="nav__link">
            Login
          </a>
        </li>
        <li className="nav__item">
          <a href="#" className="nav__link">
            
          </a>
        </li>
      </ul>
      <div onClick={navToggle} className={icon}>
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>
    </nav>
  );
}

export default Navbar;