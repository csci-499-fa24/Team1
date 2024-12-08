
'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import "../globals.css"; 
import styles from '../styles/confirm.module.css';

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
        }, 2000);

        // Clean up the timer if the component unmounts
        return () => clearTimeout(timer);


    }, [router]);

    return (
        <div className={styles.background}>
            <div className={styles.wrapper}>
            <div className={styles.confirmation}>
                <h1 className={styles.heading}>Sign-Up Successful!</h1>
                <p>Thank you for signing up.</p>
                <div>
                <p>Redirecting to your personal page in 2 seconds...</p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Confirmation;