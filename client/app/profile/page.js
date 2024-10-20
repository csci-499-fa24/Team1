
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import "../styles/profile.css";

export default function Personal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        
      // Add Font Awesome library dynamically
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
      document.head.appendChild(link);

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
                if (response.data && response.data.userDetail) {
                    setUser(response.data.userDetail);
                } else {
                    setError("Failed to authenticate. Please log in again.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
                setLoading(false);
            });
    }, [router]);

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
 
        
        
        
        <div className="profile-page">
        <div className="profile-left">
            <div className="profile-avatar"></div>
            <div className="profile-info">
                <h1>Welcome, {user.userName}</h1>
            </div>
            <div className="profile-buttons">
                <Link href="/favorites">
                    <button className="icon-button">
                        <i className="fa fa-heart"></i> Favorites
                    </button>
                </Link>
                <Link href="/map">
                    <button className="icon-button">
                        <i className="fa fa-map-marker"></i> Map
                    </button>
                </Link>
            </div>
            <div className="profile-gap"></div> {/* Adjusted gap for sign-out */}
            <button className="logout-button" onClick={handleLogout}>Sign Out</button>
        </div>
    </div>
);
    
    

}


/*
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from 'next/link';  // Import Link for navigation
import "../styles/profile.css";  // Import the separated CSS file

export default function Personal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

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
                if (response.data && response.data.userDetail) {
                    setUser(response.data.userDetail);
                } else {
                    setError("Failed to authenticate. Please log in again.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
                setLoading(false);
            });
    }, [router]);

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-left">
                <div className="profile-avatar">
                </div>
                <div className="profile-info">
                    <h2>Welcome, {user.userName}</h2>
                </div>
                <div className="profile-buttons">
                    <Link href="/favorites">
                        <button className="icon-button"> favorite
                           
                        </button>
                    </Link>
                    <Link href="/map">
                        <button className="icon-button"> map
    
                        </button>
                    </Link>
                </div>
                <button className="logout-button" onClick={handleLogout}>Sign Out</button>
            </div>
        </div>
    );
}


*/

/*
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from 'next/link'; // Import Link for navigation

import "../styles/profile.css";  // Import the separated CSS file

export default function Personal() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

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
                if (response.data && response.data.userDetail) {
                    setUser(response.data.userDetail);
                } else {
                    setError("Failed to authenticate. Please log in again.");
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error during authentication", err);
                setError("Failed to authenticate. Please log in again.");
                setLoading(false);
            });
    }, [router]);

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => router.push("/login")}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h1>Welcome, {user.userName}</h1>
            <button className="logout-button" onClick={handleLogout}>Sign Out</button>
            <Link href="/favorites">
                <button className="favorites-button">View Favorites</button>
            </Link>
        </div>
    );
}


*/


/*
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
                // Handle the data properly by accessing response.data.freshUser
                
                if (response.data && response.data.userDetail) {
                    setUser(response.data.userDetail);  // Updated to match backend response structure
                } else {
                    setError("Failed to authenticate. Please log in again.");
                }
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
    if (loading) {
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
            <h1>Welcome, {user.userName}</h1> 
            <button onClick={handleLogout}>Sign Out</button>
        </div>
    );
}

*/