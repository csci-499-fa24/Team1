"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Personal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);  // Loading state
    const [error, setError] = useState(null);  // Error state
    const router = useRouter();

 /*    useEffect(() => {
        const token = Cookies.get("token");

        if (!token) {
            console.log("please login");
            router.push("/login");
            return;
        }

        axios.get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication", {
            headers: {
                Authorization: `Bearer ${token}`,
           },
        })
        .then(response => setUser(response.data))
        
        .catch(() => router.push("/login"));
    }, []); */

    useEffect(() => {
        const token = Cookies.get("token");

        if (!token) {
            console.log("Please log in.");
            router.push("/login");
            return;
        }

        axios
            .get(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/authentication", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setUser(response.data);
                setLoading(false);  // Stop loading when data is received
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
                setLoading(false);  // Stop loading when error occurs
            });
    }, [router]);


    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

     // Show loading indicator while fetching data
    if (!user) {
        return <div>Loading...</div>;
    }

    // Display error message if authentication fails
    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Welcome, {user.freshUser.userName}</h1>
            <button onClick={handleLogout}>Sign Out</button>
        </div>
    );
}