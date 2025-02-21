"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar'; 
import eventServiceConfig from '../../../configs/eventservice.json';

const Dashboard = () => {
  const [username, setUsername] = useState('beloved user');
  const [events, setEvents] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const today = new Date().toLocaleDateString();

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get('accountId');
  if (accountId) {
    setAccountId(parseInt(accountId, 10));
  }
}, []);

useEffect(() => {
  if (accountId) {
    fetchEvents();
  }
}, [accountId]);

const fetchEvents = async () => {
  if (!accountId) return;

  try {
    const response = await fetch(`http://localhost:8081/account/${accountId}`);
    if (response.ok) {
      const data = await response.json();
      const today = new Date().toDateString();
      const events = data.events.reduce((acc, event) => {
        const [day, month, year] = event.date.split('-').map(Number);
        const eventDate = new Date(Date.UTC(year, month - 1, day + 1)).toDateString();
        if (eventDate === today) {
          if (!acc[eventDate]) {
            acc[eventDate] = [];
          }
          acc[eventDate].push(event);
        }
        return acc;
      }, {});
      setEvents(events);
    } else {
      console.error('Failed to fetch events:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
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
                  [{event.time}] - {event.title}
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