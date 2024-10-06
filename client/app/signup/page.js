'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function SignUp() {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');  // State for error message
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');  // Reset error message before new submission

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/signup", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName, email, password, confirmPassword }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                Cookies.set('token', data.data.token);
                router.push('/confirmation');
            } else {
                // If the server returns an error, set it in the error message state
                setErrorMessage(data.message);
            }
        } catch (error) {
            // Handle unexpected errors
            setErrorMessage('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="background">
            <div className="wrapper">
                <h1>Signup</h1>
                
                <form id="form" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="firstname-input">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                            </svg>
                        </label>
                        <input 
                            type="text" 
                            name="firstname" 
                            id="firstname-input" 
                            placeholder="Name" 
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="email-input">
                            <span>@</span>
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email-input" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="password-input">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/>
                            </svg>
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            id="password-input" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="repeat-password-input">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                                <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/>
                            </svg>
                        </label>
                        <input 
                            type="password" 
                            name="repeat-password" 
                            id="repeat-password-input" 
                            placeholder="Confirm Password"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit">Signup</button>
                </form>

                {/* Display error message */}
                {errorMessage && <p className="error">{errorMessage}</p>}
                
                <p>Already have an Account? <a href="/login">login</a> </p>
            </div>
        </div>
    );
}


