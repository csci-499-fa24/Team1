
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import "../styles/confirmation.css";

const Confirmation = () => {
    const router = useRouter();

    useEffect(() => {
        // Check for the token
        const token = Cookies.get("token");

        if (!token){
            // If no token, redirect to login page
            console.log("Please log in.");
            router.push("/login");
            return;
        }

        
        // Automatically redirect to the personal page after 5 seconds
        const timer = setTimeout(() => {
            router.push("/profile");
        }, 3000);

        // Clean up the timer if the component unmounts
        return () => clearTimeout(timer);


    }, [router]);

    return (
        <div className="background">
            <div className="wrapper">
                <div className="confirmation">
                    <h1>Sign-Up Successful!</h1>
                    <p>Thank you for signing up.</p>
                    <div>                        
                        <p>Redirecting to your personal page in 3 seconds...</p>
                          
                    </div>                  
                </div>
            </div>
        </div>
    );
};

export default Confirmation;