'use client';

import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PomodoroTimer from '../../components/pomodoro-timer';
// import TodoList from '../../components/todo-list';
import Navbar from '../../components/navbar';

const StudyTools = () => {
    const [accountId, setAccountId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    // Fetch the account ID from session storage or other source
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Missing token. Please log in again.');
            window.location.href = '/login'; // Redirect to login page
            return;
        }

        // Fetch account ID from the server or decode from token
        const fetchAccountId = async () => {
            try {
                const response = await fetch(`/api/account/authorize`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.status === 200) {
                    const { userId } = data.decoded;
                    setAccountId(userId);
                } else {
                    alert('Invalid token. Please log in again.');
                    window.location.href = '/login'; // Redirect to login page
                }
            } catch (error) {
                alert('Error verifying token. Please log in again.');
                window.location.href = '/login'; // Redirect to login page
            }
        };

        fetchAccountId();
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Navbar />
            <div style={{ padding: '20px' }}>
                <h1 style={{ color: '#000' }}>Study Tools</h1>
                <Button variant="contained" onClick={handleClickOpen}>
                    Open Pomodoro Timer
                </Button>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Pomodoro Timer</DialogTitle>
                    <DialogContent>
                        <PomodoroTimer />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
                {/* <TodoList /> */}
            </div>
        </div>
    );
};

export default StudyTools;