import React from 'react';
import Calendar from '../../components/calendar'; // Adjust the import path as needed
import Navbar from '../../components/navbar';

import Typography from '@mui/material/Typography';

const CalendarPage = () => {
  return (
    <div>
      <Navbar />
      <Typography variant="h2" className={"title"}>Calendar</Typography>
      <Calendar />
    </div>
  );
};

export default CalendarPage;