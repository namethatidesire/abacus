"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './login.module.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "command": "authenticate", "username": username, "password": password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setMessage(data.message || 'Login successful!');
        localStorage.setItem('account', JSON.stringify(data.account)); // Store account information in localStorage for other pages to use
        window.location.href = '/calendar'; // Send the user to the calendar page
      } else if (response.status === 404) {
        setMessage('Username or password is invalid.');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        setMessage(errorData.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div>
          <label className={styles.label} htmlFor="username">Username:</label>
          <input
            className={styles.input}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="password">Password:</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Login</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.signupLink}>
        Don't have an account? <Link href="/signup" className={styles.signupLinkText}>Sign up here</Link>
      </p>
    </div>
  );
};

export default LoginPage;