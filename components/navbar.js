"use client";
import React from 'react';
import { useEffect } from 'react';
import Link from "next/link";
import { Typography, IconButton, Tooltip } from "@mui/material";
import { Menu, Home, Person, CalendarMonth, Logout, UploadFile, Class } from "@mui/icons-material";
import './navbar.css';

// Add the Google Fonts import
import { Crimson_Pro } from 'next/font/google';

// Initialize the font
const crimsonPro = Crimson_Pro({
  weight: ['400', '600'],  // Add the weights you need
  subsets: ['latin'],
});

const Navbar = () => {

    function handleLogout() {
        useEffect(() => {
            sessionStorage.removeItem('token');
            console.log(sessionStorage);
          }, []);
    }

    return (
        <div className="navbar">
            <div className="navbar-content">
                <IconButton className="navbar-icon">
                    <Menu sx={{ color: '#FBE59D' }} />
                </IconButton>

                <Tooltip title="Dashboard" arrow>
                    <Link href="/dashboard">
                        <IconButton className="navbar-icon">
                            <Home sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>
                
                <Tooltip title="Calendar" arrow>
                    <Link href="/calendar">
                        <IconButton className="navbar-icon">
                            <CalendarMonth sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>

                <Tooltip title="Syllabus Upload" arrow>
                    <Link href="/syllabus_scanner">
                        <IconButton className="navbar-icon">
                            <UploadFile sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>

                <Tooltip title="Courses" arrow>
                    <Link href="/coursePage">
                        <IconButton className="navbar-icon">
                            <Class sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>
                
                <Tooltip title="Account Information" arrow>  
                    <IconButton className="navbar-icon">
                        <Person sx={{ color: '#FBE59D' }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Logout" arrow>
                    <Link href="/login">
                        <IconButton className="navbar-icon" >
                            <Logout sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>
            </div>
        </div>
    );
};

export default Navbar;