"use client";
import dynamic from 'next/dynamic';

const Events = dynamic(() => import('../components/Events'), { ssr: false });
import React from 'react';
import Navbar from '../components/Navbar';
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";


const NYCEvents = () => {

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
        return null;  
    }    


  return (
    <div>
      <Navbar/>
      <Events />
    </div>
  );
};

export default NYCEvents;
