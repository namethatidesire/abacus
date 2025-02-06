"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar'; 
import eventServiceConfig from '../../../configs/eventservice.json';

const Dashboard = () => {
  const [username, setUsername] = useState('beloved user');
  const [events, setEvents] = useState([]);
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await fetch(`http://${eventServiceConfig.ip}:${eventServiceConfig.port}/api/dashboard-data`);
        const eventData = await eventsResponse.json();
        setUsername(eventData.username);
        setEvents(eventData.events);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
                  [{event.time}] - {event.name}
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