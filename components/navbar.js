"use client";
import React, { useState, useRef } from 'react';
import Link from "next/link";
import { IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import { Menu as MenuIcon, Home, CalendarMonth, UploadFile, Class, Timer, List, Chat, LocalLibrary, Logout } from "@mui/icons-material";
import './navbar.css';
import ChatBot from '../components/chatbot';

const Navbar = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatbotRef = useRef(null);
    const [studyToolsAnchorEl, setStudyToolsAnchorEl] = useState(null);

    // Toggle the dropdown menu on click
    const handleStudyToolsClick = (event) => {
        if (studyToolsAnchorEl) {
            setStudyToolsAnchorEl(null); // Close the menu if it's already open
        } else {
            setStudyToolsAnchorEl(event.currentTarget); // Open the menu
        }
    };

    const handleStudyToolsClose = () => {
        setStudyToolsAnchorEl(null); // Close the menu
    };

    const openPomodoroTimer = () => {
        window.open('/pomodoro_timer', 'PomodoroTimer', 'width=400,height=300,scrollbars=no,resizable=no');
    };

    const openTodoList = () => {
        window.open('/todo-list', 'TodoList', 'width=400,height=500,scrollbars=no,resizable=no');
    };

    return (
        <div className="navbar">
            <div className="navbar-content">
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

                {/* Study Tools with Click-Based Toggle */}
                <div>
                    <Tooltip title="Study Tools" arrow>
                        <IconButton
                            className="navbar-icon"
                            onClick={handleStudyToolsClick} // Toggle menu on click
                        >
                            <LocalLibrary sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={studyToolsAnchorEl}
                        open={Boolean(studyToolsAnchorEl)}
                        onClose={handleStudyToolsClose}
                    >
                        <MenuItem
                            onClick={() => {
                                openPomodoroTimer();
                                handleStudyToolsClose(); // Close the menu after clicking
                            }}
                        >
                            <Timer sx={{ marginRight: '10px' }} /> Pomodoro Timer
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                openTodoList();
                                handleStudyToolsClose(); // Close the menu after clicking
                            }}
                        >
                            <List sx={{ marginRight: '10px' }} /> Todo List
                        </MenuItem>
                    </Menu>
                </div>

                <Tooltip title="Study Assistant" arrow>
                    <IconButton className="navbar-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
                        <Chat sx={{ color: '#FBE59D' }} />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Logout" arrow>
                    <Link href="/login">
                        <IconButton className="navbar-icon">
                            <Logout sx={{ color: '#FBE59D' }} />
                        </IconButton>
                    </Link>
                </Tooltip>
            </div>

            {/* Chatbot Popup */}
            <div
                ref={chatbotRef}
                className="fixed top-0 right-0 z-50 shadow-2xl transition-all duration-300 transform h-screen"
                style={{
                    width: '25%',
                    opacity: isChatOpen ? 1 : 0,
                    visibility: isChatOpen ? 'visible' : 'hidden',
                    transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
                    pointerEvents: isChatOpen ? 'auto' : 'none',
                }}
            >
                <div className="relative h-full">
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="absolute top-3 right-3 z-10 text-white hover:text-[#FBE59D] focus:outline-none"
                        aria-label="Close chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                    <div className="h-full">
                        <ChatBot />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;