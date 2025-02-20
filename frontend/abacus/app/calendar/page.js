import React from 'react';
import Calendar from '../components/calendar'; // Adjust the import path as needed
import Navbar from '../components/navbar'; 

const CalendarPage = () => {
  return (
    <div>
      <Navbar />
      <h1>Calendar</h1>
      <Calendar />
    </div>
  );
};

export default CalendarPage;