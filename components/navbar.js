"use client";
import React from 'react';
import { Typography, IconButton } from "@mui/material";
import { Menu, Home, Person } from "@mui/icons-material";
import './navbar.css';

// Add the Google Fonts import
import { Crimson_Pro } from 'next/font/google';

// Initialize the font
const crimsonPro = Crimson_Pro({
  weight: ['400', '600'],  // Add the weights you need
  subsets: ['latin'],
});

const Navbar = ({ view }) => {
    return (
        <div className="navbar">
            <div className="navbar-content">
                <IconButton className="navbar-icon">
                    <Menu sx={{ color: '#FBE59D' }} />
                </IconButton>
                <Typography 
                    variant="h6" 
                    className={`navbar-title ${crimsonPro.className}`}
                    sx={{ fontFamily: 'inherit' }} // This ensures MUI doesn't override the font
                >
                    {view === 'month' ? 'Monthly view' : 'Weekly view'}
                </Typography>
                <IconButton className="navbar-icon">
                    <Home sx={{ color: '#FBE59D' }} />
                </IconButton>
                <IconButton className="navbar-icon">
                    <Person sx={{ color: '#FBE59D' }} />
                </IconButton>
            </div>
        </div>
    );
};

export default Navbar;