'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar.js'; 
// import eventServiceConfig from '../../configs/eventservice.json';

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('beloved user');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchUserId = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Missing token. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
        return;
      }

      try {
        const response = await fetch(`api/account/authorize`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log(data);
        if (data.status === 200) {
          const { userId } = data.decoded;
          setUserId(userId); // Set the user ID in state
        } else {
          alert('Invalid token. Please log in again.');
          window.location.href = '/login'; // Redirect to login page
        }
      } catch (error) {
        alert('Error verifying token. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getCurrentUser = await fetch(`http://localhost:3000/api/account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: userId }) // Correct parameter name
        });
        const currentUserData = await getCurrentUser.json();
        const eventsResponse = await fetch(`http://localhost:3000/api/event/${userId}`);
        const eventData = await eventsResponse.json();
        console.log(eventData);
        setUsername(currentUserData.account.username);
        if (eventData) {
          setEvents(eventData);
        }
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>; // Render loading state
  }

  return (
    <div>
      <div>
        <Navbar />
        {/* Other content can go here */}
      </div>
      <div style={{ 
        width: '33%', 
        backgroundColor: '#d3d3d3', 
        padding: '20px', 
        height: '100vh',
        color: '#333' // Dark gray color
      }}>
        <p style={{ fontSize: '3em', margin: '20px 0 0 0' }}>Dashboard</p>
        <p style={{ fontSize: '2em'}}>Welcome, {username}.</p>
        <p style={{ fontSize: '1em', margin: '0 0 20px 0' }}>{today}</p> 
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          borderRadius: '10px', 
          padding: '10px',
        }}>
          <h2>Today's Events</h2>
          {events.length > 0 ? (
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  [{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] - {event.title}
                </li>
              ))}
            </ul>
          ) : (
            <p>No events planned for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;