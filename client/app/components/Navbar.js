import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";  // Make sure this is inside the component's body
import '../globals.css';
import "../styles/Navbar.css";

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [icon, setIcon] = useState("nav__toggler");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    // Check if the user is logged in by checking for the token
    const token = Cookies.get("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const navToggle = () => {
    if (active === "nav__menu") {
      setActive("nav__menu nav__active");
    } else setActive("nav__menu");

    // Icon Toggler
    if (icon === "nav__toggler") {
      setIcon("nav__toggler toggle");
    } else setIcon("nav__toggler");
  };

  //handle sign out
  const handleSignOut = (e) => {
    e.preventDefault();  // Prevent default link behavior
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <nav className="nav container">
      <a href="/" className="nav__brand">
        Restaurant & Bar Tracker
      </a>
      <ul className={active}>
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
          <a href="/profile" className="nav__link">
            User
          </a>
        </li>
        {isAuthenticated ? (
          <li className="nav__item">
            <a href="/login" className="nav__link" onClick={handleSignOut}>
              Logout
            </a>
          </li>
        ) : (
          <li className="nav__item">
            <a href="/login" className="nav__link">
              Login
            </a>
          </li>
        )}
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


