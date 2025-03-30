'use client';

import React from 'react';
import PomodoroTimer from '../../components/pomodoro-timer';
import Navbar from '../../components/navbar';

const PomodoroTimerPage = () => {
    return (
        <div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', color: '#000' }}>Pomodoro Timer</h1>
                <PomodoroTimer />
            </div>
        </div>
    );
};

export default PomodoroTimerPage;