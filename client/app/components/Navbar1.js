"use client";
import React, { useEffect, useState } from "react";
import Logo from "../assets/logonew.png";
import Imagen from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

const Navbar1 = () => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <div className="nav-logo-containerlanding">
        <Imagen src={Logo} alt="" />
        <h1 className="nav-titlelanding">Restaurant and Bar Tracker</h1>
      </div>
      <div className="navbar-links-containerlanding">
        {isAuthenticated !== undefined &&
          (isAuthenticated ? (
            <>
              <Link className="primary-buttonlanding" href={"/profile"}>
                Profile
              </Link>
              <button className="primary-buttonlanding" onClick={handleLogout}>

                Logout
              </button>
            </>
          ) : (
            <>
              <button className="primary-buttonlanding" onClick={handleLogin}>
                {" "}
                Login {""}{" "}
              </button>
              <button className="primary-buttonlanding" onClick={handleSignUp}>

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
