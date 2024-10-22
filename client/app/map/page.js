
"use client"
import { useState, useEffect } from "react";
import GoogleMapEmbed from "../components/displayMap";
import { useRouter } from "next/navigation"; // for redirection
import axios from "axios";  // for API requests
import Cookies from "js-cookie"; // for accessing cookies
import Navbar from "../components/Navbar";

export default function mapPage() {

        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [loading, setLoading] = useState(true);  // New loading state
    
        useEffect(() => {
            const token = Cookies.get("token");
            if (token) {
                axios.get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (response.data.status === 'success') {
                            setIsAuthenticated(true);
                            setLoading(false); 
                        }
                        setLoading(false);  // Stop loading after the request finishes
                    })
                    .catch(error => {
                        Cookies.remove("token");
                        router.push('/login');
                        setLoading(false);  // Stop loading even if there is an error
                    });
            } else {
                router.push('/login');
                setLoading(false);
            }
        }, [router]);
    
    // Display loading indicator while checking authentication
        if (loading) {
        return <div>Loading...</div>;
    }  

    // If the user is not authenticated, return null (nothing)
    if (!isAuthenticated) {
        return null;  // Prevents the map from rendering if not authenticated
    }     
    return (
        <div>
            <Navbar/>
            <GoogleMapEmbed />


            <button onClick={() => router.push('/profile')}>
                back
            </button>
            
        </div>
    );
};


