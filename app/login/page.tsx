'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/material';
import styles from './login.module.css';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState<{ message: string, severity: 'error' | 'warning' | 'info' | 'success' }>({ message: '', severity: 'error' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 201) {
        const data = await response.json();
        setAlert({ message: data.message, severity: 'success' });
        sessionStorage.setItem('token', data.token);
        router.push('/calendar'); // Use router.push instead of window.location
      } else if (response.status === 401 || response.status === 403) {
        const data = await response.json();
        setAlert({ message: data.message, severity: 'error' });
      } else {
        const errorData = await response.json();
        setAlert({ message: errorData.message || 'An error occurred.', severity: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ message: 'An error occurred. Please try again.', severity: 'error' });
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
          {alert.message && (
            <div className={styles.alertContainer}>
              <Alert 
                sx={{
                  '& .MuiAlert-message': {
                    color: '#000000'  // Changed to black text
                  },
                  backgroundColor: (theme) => 
                    alert.severity === 'error' ? '#ffebee' : 
                    alert.severity === 'success' ? '#e8f5e9' : 
                    alert.severity === 'warning' ? '#fff3e0' : 
                    '#e3f2fd',
                  marginTop: '1rem'
                }} 
                severity={alert.severity}
              >
                {alert.message}
              </Alert>
            </div>
          )}
        </form>
        <p className={styles.signupLink}>
          Don't have an account? <Link href="/signup" className={styles.signupLinkText}>Sign up here</Link>
        </p>
      </div>
  );
};

export default LoginPage;