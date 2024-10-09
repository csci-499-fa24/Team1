'use client';

import React from 'react';
import Link from 'next/link';
import "../styles/confirmation.css";

const Confirmation = () => {
    return (
        
        <div className = "background">
            <div className ="wrapper">
                 <div className = "confirmation">  
                    <h1>Sign-Up Successful!</h1>
                    <p>Thank you for signing up.</p>
                    <div>
                        <Link href="/personal">
                            <button>Proceed</button>
                        </Link>
                    </div>
                 </div> 
            </div>
        </div>
    );
};

export default Confirmation;