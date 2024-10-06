"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Personal() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
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
    }, []);

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Welcome, {user.freshUser.userName}</h1>
            <button onClick={handleLogout}>Sign Out</button>
        </div>
    );
}