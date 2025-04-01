'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/material';
import styles from './signup.module.css';

const SignupPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(userTimezone);
      const response = await fetch(`http://localhost:3000/api/account/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, timezone }),
      });

      if (response.status === 201) {
        router.push('/login'); // Use router.push instead of window.location
      } else {
        const errorData = await response.json();
        setMessage(errorData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Signup</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Username Field */}
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
        {/* Password Field */}
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
        {/* Email Field */}
        <div>
          <label className={styles.label} htmlFor="email">Email:</label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Sign Up</button>
        <p className={styles.link}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </form>
      {message && <Alert severity="error">{message}</Alert>}
    </div>
  );
};

export default SignupPage;