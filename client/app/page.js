'use client';

import React from 'react';
import Link from 'next/link'; 
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Logo" /> 
        </div>
        <div className={styles.navButtons}>
          <Link href="/login">
            <button className={styles.loginButton}>Log In / Sign Up</button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          
          <h1>Restaurant and Bar Tracker</h1>
          <p>Your guide to the best restaurants and bars in NYC.</p>
          
          <input type="text" placeholder="Search for restaurants..." className={styles.searchInput} />
  <button type="submit" className={styles.searchButton}>Search</button>
        </div>
      </section>

      {/* Other sections like features */}
      <section className={styles.main}>
        <h2>Our Features</h2>
        <ul>
          <li><strong>Discover Restaurants:</strong> Use our app to find top-rated restaurants.</li>
          <li><strong>Health Inspections:</strong> Stay informed with the latest inspection results.</li>
          <li><strong>Bookmark Favorites:</strong> Save your favorite spots for future visits.</li>
        </ul>
      </section>
    </div>
  );
}
