"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import { Typography, IconButton, Tooltip } from "@mui/material";
import { Menu, Home, Person, CalendarMonth, Logout, UploadFile, Class, Chat } from "@mui/icons-material";
import './navbar.css';
import ChatBot from '../components/chatbot'; // Import your existing ChatBot component

// Add the Google Fonts import
import { Crimson_Pro } from 'next/font/google';

// Initialize the font
const crimsonPro = Crimson_Pro({
  weight: ['400', '600'],  // Add the weights you need
  subsets: ['latin'],
});

const Navbar = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatbotRef = useRef(null);

    function handleLogout() {
        useEffect(() => {
            sessionStorage.removeItem('token');
            console.log(sessionStorage);
        }, []);
    }

    // Toggle chat visibility
    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    // Click outside handler to close the chatbot
    useEffect(() => {
        function handleClickOutside(event) {
            if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
                setIsChatOpen(false);
            }
        }

        // Attach the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Clean up the event listener
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [chatbotRef]);

    return (
        <>
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

                    {/* Chat Button */}
                    <Tooltip title="Study Assistant" arrow>
                        <IconButton className="navbar-icon" onClick={toggleChat}>
                            <Chat sx={{ color: '#FBE59D' }} />
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

            {/* Chatbot Popup Container - Full height, 1/4 width on right side */}
            <div 
                ref={chatbotRef}
                className="fixed top-0 right-0 z-50 shadow-2xl transition-all duration-300 transform h-screen"
                style={{ 
                    width: '25%',
                    opacity: isChatOpen ? 1 : 0,
                    visibility: isChatOpen ? 'visible' : 'hidden',
                    transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
                    pointerEvents: isChatOpen ? 'auto' : 'none'
                }}
            >
                {/* Wrapper div to fill the container height */}
                <div className="relative h-full">
                    {/* Close button positioned inside */}
                    <button 
                        onClick={() => setIsChatOpen(false)}
                        className="absolute top-3 right-3 z-10 text-white hover:text-[#FBE59D] focus:outline-none"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    {/* ChatBot component that fills the container */}
                    <div className="h-full">
                        <ChatBot />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;