'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar.js'; 
// import eventServiceConfig from '../../configs/eventservice.json';
import RenderProgressBar from '../../components/progressbar.js';


const Dashboard = () => {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('beloved user');
    interface Event {
        id: string;
        date: string;
        title: string;
        color?: string;
    }

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [today] = useState(format(new Date(), 'EEEE, MMMM d, yyyy'));

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

    const fetchData = async () => {
        try {
            const getCurrentUser = await fetch(`http://localhost:3000/api/account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: userId })
            });
            const currentUserData = await getCurrentUser.json();
            const eventsResponse = await fetch(`http://localhost:3000/api/event/${userId}`);
            const eventData = (await eventsResponse.json()).events;
            setUsername(currentUserData.account.username);
            if (eventData) {
                const startOfToday = startOfDay(new Date()).getTime();
                const todayEvents = eventData.filter((event: Event) => {
                    const eventDate = startOfDay(new Date(event.date)).getTime();
                    return eventDate === startOfToday;
                });
                setEvents(todayEvents);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
                <Box sx={{ mb: 6 }}>
                    <Typography 
                        variant="h2" 
                        component="h1" 
                        sx={{ 
                            fontFamily: crimsonPro.style.fontFamily,
                            color: '#333',
                            fontWeight: 600,
                            fontSize: '48px',
                            mb: 2
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontFamily: crimsonPro.style.fontFamily,
                            color: '#333',
                            fontWeight: 500,
                            mb: 1
                        }}
                    >
                        Welcome, {username}
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontFamily: crimsonPro.style.fontFamily,
                            color: '#666',
                            mb: 4
                        }}
                    >
                        {today}
                    </Typography>
                </Box>

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
          <div>
            <RenderProgressBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;