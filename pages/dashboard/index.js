"use client";

import Navbar from '../../components/navbar.js'; 
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const Dashboard = () => {
  const [accountId, setAccountId] = useState(null);
  const [username, setUsername] = useState('beloved user');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Missing token. Please log in again.');
        // Redirect to login page Session expired
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/account/authorize`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.status === 200) {
          const { userId, username } = data.decoded;
          //setUsername(username); // CARL -- COMMENT OUT IF USERNAME NO WORK
          setAccountId(userId);
        } else {
          alert('Invalid token. Please log in again.');
          // Redirect to login page Session expired  
          window.location.href = '/login';
        }
      } catch (error) {
        alert('Error verifying token. Please log in again.');
        // Redirect to login page Session expired  
        window.location.href = '/login';
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if accountId is valid
        if (!accountId) {
          console.log('Account ID not available yet');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching events for account ID:', accountId);
        
        // Use token for authorization
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const eventsResponse = await fetch(`http://localhost:3000/api/event/${accountId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!eventsResponse.ok) {
          const errorText = await eventsResponse.text();
          console.error('API error response:', errorText);
          throw new Error(`HTTP error! Status: ${eventsResponse.status}`);
        }
        
        const eventData = await eventsResponse.json();
        console.log('Fetched event data:', eventData);
        
        // Check if events is in the expected format
        if (eventData && Array.isArray(eventData.events)) {
          setEvents(eventData.events);
        } else if (Array.isArray(eventData)) {
          // Handle case where API returns array directly
          setEvents(eventData);
        } else if (eventData && typeof eventData === 'object') {
          // Try to extract events from response object
          const possibleEvents = Object.values(eventData).find(val => Array.isArray(val));
          if (possibleEvents) {
            setEvents(possibleEvents);
          } else {
            console.error('Could not find events array in response:', eventData);
            setEvents([]);
          }
        } else {
          console.error('Unexpected event data format:', eventData);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message || 'Failed to fetch events');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ 
          width: '33%', 
          backgroundColor: '#d3d3d3', 
          padding: '20px', 
          minHeight: 'calc(100vh - 64px)', // Adjusting for navbar height
          color: '#333', // Dark gray color
          overflow: 'auto' // Add scrolling if content is too large
        }}>
          <Typography variant="h2" style={{ fontSize: '3em', margin: '20px 0 0 0' }}>Dashboard</Typography>
          <Typography variant="h3" style={{ fontSize: '2em' }}>Welcome, {username}.</Typography>
          <Typography variant="body1" style={{ fontSize: '1em', margin: '0 0 20px 0' }}>{today}</Typography> 
          <Paper style={{ 
            backgroundColor: '#f0f0f0', 
            borderRadius: '10px', 
            padding: '15px',
          }}>
            <Typography variant="h5">Today's Events</Typography>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress size={24} />
              </div>
            ) : error ? (
              <Alert severity="error" style={{ marginTop: '10px' }}>
                {error}
              </Alert>
            ) : events.length > 0 ? (
              <ul style={{ paddingLeft: '20px' }}>
                {events.map((event, index) => (
                  <li key={event.id || index}>
                    {event.time ? `[${event.time}]` : ''} - {event.name || event.title || event.description || 'Unnamed event'}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body1">No events planned for today.</Typography>
            )}
          </Paper>
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          {/* Main content area */}
          <Typography variant="h4">Your Content</Typography>
          <Typography variant="body1">Additional dashboard content goes here.</Typography>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;