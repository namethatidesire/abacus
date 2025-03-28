'use client';

import React, { useEffect, useState } from 'react';
import Calendar from '../../components/calendar'; // Adjust the import path as needed
import Navbar from '../../components/navbar';

import Typography from '@mui/material/Typography';

const CalendarPage = () => {
  const [userId, setUserId] = useState(null);
  const [calendarId, setCalendarId] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

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
        const getDefaultCalendar = await fetch(`http://localhost:3000/api/calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: userId, query: "default" })
        });
        const defaultCalendar = await getDefaultCalendar.json();
        if (defaultCalendar) {
          // redirect to the default calendar page
          setCalendarId(defaultCalendar.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        window.location.href = '/login'; // Redirect to login page
      }
    };

    if (userId) {
      fetchData();

    }
    setLoading(false); // Set loading
  }, [userId]);

if (loading) {
  return (
    <div>
      <Typography variant="h6" gutterBottom>Loading...</Typography>
    </div>
  );
} else {
  return (
    <div>
      <Navbar />
      <Calendar default={calendarId}/>
    </div>
  );
}
// } else if (!calendarId && l) {
//   alert('No default calendar found. Please create a calendar.');
//   window.location.href = '/calendar/new'; // Redirect to new calendar page
//   return (
//     <div>
//       <Typography variant="h6" gutterBottom>Loading...</Typography>
//     </div>
//   );
};

export default CalendarPage;