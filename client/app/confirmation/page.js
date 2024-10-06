'use client';

import React from 'react';
import Link from 'next/link';

const Confirmation = () => {
    return (
        
        <div className = "background">
            <div className ="confirm-wrap">
                <div className = "confirmation"> 
                    <h1>Sign-Up Successful!</h1>
                    <p>Thank you for signing up.</p>
                    <Link href="/personal">
                        <button>Proceed</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;