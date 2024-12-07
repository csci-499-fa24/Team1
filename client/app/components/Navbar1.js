"use client";
import React, { useEffect, useState } from "react";
import Logo from "../assets/logo.png";
import Imagen from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

const Navbar1 = () => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState();

  useEffect(() => {
    checkAuthentication();

    async function checkAuthentication() {
      const token = Cookies.get("token");
      if (token) {
        const response = await fetch(
          process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    }
  }, []);

  const handleSignUp = () => {
    router.push("/signup");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
  };

  return (
    <nav>
      <div className="nav-logo-container">
        <Imagen src={Logo} alt="" />
        <h1 className="nav-title">Restaurant and Bar Tracker</h1>
      </div>
      <div className="navbar-links-container">
        {isAuthenticated !== undefined &&
          (isAuthenticated ? (
            <>
              <Link className="primary-button" href={"/profile"}>
                Profile
              </Link>
              <button className="primary-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="primary-button" onClick={handleLogin}>
                {" "}
                Login {""}{" "}
              </button>
              <button className="primary-button" onClick={handleSignUp}>
                {" "}
                Sign up {""}{" "}
              </button>
            </>
          ))}
      </div>
    </nav>
  );
};

export default Navbar1;
