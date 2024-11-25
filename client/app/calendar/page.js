'use client';
import Navbar from '../components/Navbar.js';
import MyCalendar from '../components/MyCalendar.js';
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const MyCalendarPage = () => {

    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [errorMessage, setErrorMessage] = useState(""); 

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
      return <div>Loading...</div>;
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
            <Navbar />
            <MyCalendar />
            <ToastContainer 
             position="top-right"
             autoClose={3000}
             hideProgressBar={false}
             closeOnClick
             pauseOnHover
             draggable
             theme="light" //"light" or "dark"
             />
        </div>
    );
};

export default MyCalendarPage;