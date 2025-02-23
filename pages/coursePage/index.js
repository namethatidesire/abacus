import React from 'react';
// import Calendar from '../../components/calendar'; // Adjust the import path as needed
import Navbar from '../../components/navbar'; 

const CoursePage = () => {
  return (
    <div>
        <Navbar />
        <h1>Courses</h1>
        <details>
            <summary>Click me!</summary>
            <p>Peekaboo! Here's some hidden content!</p>
        </details>
    </div>
  );
};

export default CoursePage;