import React from 'react';
import SyllabusScanner from '../../components/syllabus-scanner'; // Adjust the import path as needed
import Navbar from '../../components/navbar.js'; 

const SyllabusScannerPage = () => {
  return (
    <div>
      <Navbar />
      <SyllabusScanner />
    </div>
  );
};

export default SyllabusScannerPage;