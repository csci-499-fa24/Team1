'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import styles from '../styles/login.module.css';
import '../globals.css'; 


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();


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
                        router.push('/profile');
                    }
                })
                .catch(error => {
                    Cookies.remove("token");
                });
        }
    }, [router]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/login", { email, password });
            Cookies.set('token', response.data.token);
            router.push('/profile');
        } catch (err) {
            setError('Invalid login credentials.');
        }
    };

    return (
        <div className={styles.background}>
            <div className={styles.wrapper}>
            <h1 className={styles.loginText}>Login</h1>
            {error && <p id={styles.errorMessage}>{error}</p>}
            <form className={styles.formContainer} onSubmit={handleSubmit}>
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
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 -960 960 960"
                    width="24"
                    >
                    <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z" />
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
                <button type="submit">Login</button>
            </form>
            <p className={styles.loginText}>
                New here? <a href="/signup">Create an Account</a>
            </p>
            </div>
        </div> 
       
    );
}