import React, { useState, useEffect } from 'react';

const PomodoroTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [minutes, setMinutes] = useState(25);
    const [isActive, setIsActive] = useState(false);
    const [isWorkMode, setIsWorkMode] = useState(true); // State to track work/break mode

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        if (isWorkMode) {
                            // Switch to break mode
                            setMinutes(5);
                            setSeconds(0);
                            setIsWorkMode(false);
                        } else {
                            // Switch to work mode
                            setMinutes(25);
                            setSeconds(0);
                            setIsWorkMode(true);
                        }
                        clearInterval(interval);
                        setIsActive(false);
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, isWorkMode]);

    const toggle = () => {
        setIsActive(!isActive);
    };

    const reset = () => {
        setMinutes(25);
        setSeconds(0);
        setIsActive(false);
        setIsWorkMode(true); // Reset to work mode
    };

    const skip = () => {
        if (isWorkMode) {
            // Switch to break mode
            setMinutes(5);
            setSeconds(0);
            setIsWorkMode(false);
        } else {
            // Switch to work mode
            setMinutes(25);
            setSeconds(0);
            setIsWorkMode(true);
        }
        setIsActive(false); // Stop the timer
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2em', margin: '20px 0' }}>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </div>
            <div style={{ marginTop: '20px', fontSize: '1.2em', marginBottom: '10px' }}>   
                {isWorkMode ? 'Work Time' : 'Break Time'}
            </div>
            <button
                onClick={toggle}
                style={{
                    padding: '10px 20px',
                    margin: '10px',
                    fontSize: '1em',
                    backgroundColor: isActive ? '#f44336' : '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                {isActive ? 'Pause' : 'Start'}
            </button>
            <button
                onClick={reset}
                style={{
                    padding: '10px 20px',
                    margin: '10px',
                    fontSize: '1em',
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Reset
            </button>
            <button
                onClick={skip}
                style={{
                    padding: '10px 20px',
                    margin: '10px',
                    fontSize: '1em',
                    backgroundColor: '#ff9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Skip
            </button>
            
        </div>
    );
};

export default PomodoroTimer;