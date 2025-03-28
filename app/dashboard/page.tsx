'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/navbar.js';
import { Typography, Container, Box, Paper, CircularProgress } from '@mui/material';
import { Crimson_Pro } from 'next/font/google';
import ShowEventDialog from '@/components/show-event-dialog';
import { startOfDay, format } from 'date-fns';

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

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

                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 4,
                        borderRadius: 2,
                        border: '1px solid #E5E5E5',
                        backgroundColor: 'white'
                    }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontFamily: crimsonPro.style.fontFamily,
                            fontWeight: 500,
                            mb: 3
                        }}
                    >
                        Today's Events
                    </Typography>
                    
                    {events.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {events.map(event => (
                                <ShowEventDialog 
                                    key={event.id}
                                    event={event}
                                    accountId={userId}
                                    updateCallback={() => fetchData()}
                                >
                                    <Box 
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            backgroundColor: event.color || '#8CA7D6',
                                            color: 'white',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.9,
                                                transform: 'scale(1.01)',
                                                transition: 'all 0.2s ease-in-out'
                                            }
                                        }}
                                    >
                                        <Typography 
                                            sx={{ 
                                                fontFamily: crimsonPro.style.fontFamily,
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {new Date(event.date).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </Typography>
                                        <Typography 
                                            sx={{ 
                                                fontFamily: crimsonPro.style.fontFamily,
                                                fontWeight: 500
                                            }}
                                        >
                                            {event.title}
                                        </Typography>
                                    </Box>
                                </ShowEventDialog>
                            ))}
                        </Box>
                    ) : (
                        <Typography 
                            sx={{ 
                                fontFamily: crimsonPro.style.fontFamily,
                                color: '#666',
                                fontStyle: 'italic'
                            }}
                        >
                            No events planned for today.
                        </Typography>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default Dashboard;