import React, { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "../globals.css";
import "../styles/Navbar.css";

function Navbar() {
  const [active, setActive] = useState("nav__menu");
  const [icon, setIcon] = useState("nav__toggler");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference to the dropdown menu
  const router = useRouter();

  const navToggle = () => {
    setActive(active === "nav__menu" ? "nav__menu nav__active" : "nav__menu");
    setIcon(icon === "nav__toggler" ? "nav__toggler toggle" : "nav__toggler");
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    // Function to close the dropdown if clicking outside of it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener on component unmount or when dropdown is closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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
          <a href="/calendar" className="nav__link">
            Calendar
          </a>
        </li>
          <li className="nav__item user-dropdown" ref={dropdownRef}>
            <span className="nav__link" onClick={toggleDropdown}>
              <FontAwesomeIcon icon={faUserCircle} size="lg" />
            </span>
            {dropdownOpen && (
              <ul className="dropdown-menu dropdown__active">
                <li className="dropdown-item">
                  <a href="/profile" className="dropdown-link">Profile</a>
                </li>
                <li className="dropdown-item">
                  <a href="/settings" className="dropdown-link">Settings</a>
                </li>
                <li className="dropdown-item">
                  <a href="/login" className="dropdown-link" onClick={handleSignOut}>
                    Logout
                  </a>
                </li>
              </ul>
            )}
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