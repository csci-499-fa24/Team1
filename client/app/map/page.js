
"use client"
import { useState, useEffect } from "react";
import GoogleMapEmbed from "../components/displayMap";
import { useRouter } from "next/navigation"; // for redirection
import LoadingScreen from "../components/Loading";
import axios from "axios";  // for API requests
import Cookies from "js-cookie"; // for accessing cookies
import Navbar from "../components/Navbar";
import "../styles/displaymapfilter.css"
import {ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function mapPage() {

    const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [loading, setLoading] = useState(true); // New loading state
        const [errorMessage, setErrorMessage] = useState(""); // State to store error message
    
        useEffect(() => {
            const token = Cookies.get("token");
            if (token) {
                axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/authentication`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (response.data.status === "success") {
                            setIsAuthenticated(true);
                        }
                        setLoading(false); // Stop loading after the request finishes
                    })
                    .catch(error => {
                        // Remove token from cookies
                        Cookies.remove("token");
    
                        // Extract error message from the backend
                        const backendMessage = error.response?.data?.message || "An unexpected error occurred.";
    
                        // Set the error message for displaying
                        setErrorMessage(backendMessage);
    
                        // Redirect to the login page after showing the error
                        setTimeout(() => {
                            router.push("/login");
                        }, 3000); // Redirect after 3 seconds
    
                        setLoading(false); // Stop loading even if there is an error
                    });
            } else {
                router.push("/login");
                setLoading(false);
            }
        }, [router]);
    
    // Display loading indicator while checking authentication
    if (loading) {
      return <LoadingScreen/>
    }  

     // If the user is not authenticated, display the error message
     if (!isAuthenticated) {
        return (
            <div className="auth-error-container">
                {errorMessage && <p className="error">{errorMessage}</p>}
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div>
            <Navbar/>
            <GoogleMapEmbed />
            <ToastContainer 
             position="top-right"
             autoClose={3000}
             hideProgressBar={false}
             closeOnClick
             pauseOnHover
             draggable
             theme="light"
             />
        </div>
    );
};


