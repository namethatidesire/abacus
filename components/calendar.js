"use client";
import React, { Component } from 'react';
import { Crimson_Pro } from 'next/font/google';
import CalendarDays from './calendar-days.js';
import WeeklyView from './weekly-view.js';
import Navbar from './navbar.js';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Slider, Checkbox } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import './style.css';
import CreateEventDialog from "./create-event-dialog";
import SearchFilterEventsDialog from "./searchFilterEvents";

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

export default class Calendar extends Component {
    constructor(props) {
        super(props);

        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.state = {
            currentDay: new Date(),
            events: {},
            accountId: null,
            view: 'month', // 'month' or 'week'
            selectedEvent: null, // Add state for selected event
            dialogOpen: false, // Add state for dialog visibility
            isSliderEnabled: false, // Add state for slider enabled/disabled
            isEstimatedTimeEnabled: false // Add state for estimated time enabled/disabled
        }
    }

    componentDidMount = async() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Missing token. Please log in again.');
            // Redirect to login page Session expired
            window.location.href = '/login';
        }

        try {
            const response = await fetch(`api/account/authorize`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.status === 200) {
                const { userId } = data.decoded;
                this.setState({ accountId: userId }, this.fetchEvents);
            } else {
                alert('Invalid token. Please log in again.');
                // Redirect to login page Session expired  
                window.location.href = '/login';
            }
        } catch (error) {
            alert('Error verifying token. Please log in again.');
            // Redirect to login page Session expired  
            window.location.href = '/login';
        }
    }

    fetchEvents = async () => {
        const { accountId } = this.state;
        if (!accountId) return;

        try {
            const response = await fetch(`api/event/${accountId}`, {
                method: 'GET'
            });
            if (response.ok) {
                const data = await response.json();
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const events = data.reduce((acc, event) => {
                    const eventDate = new Date(event.date);
                    const localDate = new Date(eventDate.toLocaleString('en-US', { timeZone: userTimezone }));
                    const dateKey = localDate.toDateString();
                    if (!acc[dateKey]) {
                        acc[dateKey] = [];
                    }
                    acc[dateKey].push({
                        ...event,
                        date: localDate.toISOString().split('T')[0],
                        time: localDate.toTimeString().split(' ')[0].substring(0, 5)
                    });
                    return acc;
                }, {});
                this.setState({ events });
            } else {
                console.error('Failed to fetch events:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }
    
    // Callback function to update events after creating a new event
    updateEvents = () => {
        this.fetchEvents();
    }

    // Function to change the current day
    changeCurrentDay = (day) => {
        this.setState({ currentDay: new Date(day.year, day.month, day.number) });
    }

    // Function to toggle between month and week view
    toggleView = () => {
        this.setState(prevState => ({
            view: prevState.view === 'month' ? 'week' : 'month'
        }));
    }

    // Function to format the current date for display
    formatCurrentDate = () => {
        const { currentDay } = this.state;
        const weekday = currentDay.toLocaleDateString('en-US', { weekday: 'long' });
        const day = currentDay.getDate();
        return `${weekday} ${day}`;
    }

    // Function to advance to the next month
    nextMonth = () => {
        const curMonth = this.state.currentDay.getMonth();
        const curYear = this.state.currentDay.getFullYear();
        const nextMonth = curMonth === 11 ? 0 : curMonth + 1;
        const chgYear = nextMonth === 0 ? curYear + 1 : curYear;

        // Handle day overflow (e.g., January 31st -> February 28th/29th)
        const newDate = new Date(chgYear, nextMonth, 1);
        const maxDay = new Date(chgYear, nextMonth + 1, 0).getDate();
        const currentDay = Math.min(this.state.currentDay.getDate(), maxDay);
        this.setState({ currentDay: new Date(chgYear, nextMonth, currentDay) });
    }

    // Function to go to the previous month
    previousMonth = () => {
        const curMonth = this.state.currentDay.getMonth();
        const curYear = this.state.currentDay.getFullYear();
        const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
        const chgYear = prevMonth === 11 ? curYear - 1 : curYear;

        // Handle day overflow (e.g., March 31st -> February 28th/29th)
        const newDate = new Date(chgYear, prevMonth, 1);
        const maxDay = new Date(chgYear, prevMonth + 1, 0).getDate();
        const currentDay = Math.min(this.state.currentDay.getDate(), maxDay);
        this.setState({ currentDay: new Date(chgYear, prevMonth, currentDay) });
    }
    
    // Function to handle event click
    handleEventClick = (event) => {
        this.setState({ selectedEvent: event, dialogOpen: true });
    }

    // Function to close the dialog
    handleCloseDialog = () => {
        this.setState({ dialogOpen: false, selectedEvent: null});
    }

    // Function to handle input changes
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            selectedEvent: {
                ...prevState.selectedEvent,
                [name]: name === 'estimatedTime' ? Math.max(0, value) : value // Ensure estimatedTime is 0 or greater
            }
        }));
    }

    // Function to handle slider change
    handleSliderChange = (e, newValue) => {
        this.setState(prevState => ({
            selectedEvent: {
                ...prevState.selectedEvent,
                difficulty: newValue
            }
        }));
    }

    // Function to enable the slider and estimated time input
    toggleSliderAndEstimatedTime = () => {
        this.setState(prevState => ({
            isSliderEnabled: !prevState.isSliderEnabled,
            isEstimatedTimeEnabled: !prevState.isEstimatedTimeEnabled
        }));
    }

    // Function to save the updated event
    handleSaveEvent = async () => {
        const { selectedEvent, accountId } = this.state;
        
        // Ensure the date is correctly formatted as a DateTime object
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const newDate = new Date(selectedEvent.date);
        selectedEvent.date = new Date(newDate.toLocaleDateString('en-US', { timeZone: userTimezone })).toISOString();
        selectedEvent.estimatedTime = parseInt(selectedEvent.estimatedTime);

        try {
            const response = await fetch(`/api/event/${accountId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedEvent),
            });

            if (response.ok) {
                this.fetchEvents();
                this.handleCloseDialog();
            } else {
                console.error('Failed to update event:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
    }

    render() {
        const { view, currentDay, events, selectedEvent, dialogOpen, isSliderEnabled, isEstimatedTimeEnabled } = this.state;
        
        return (
            <div>
            <Navbar />

            <div className="calendar">
            {/* Calendar Header */}
            <div className="calendar-header">
            <button className="nav-button" onClick={this.previousMonth}>
                <ArrowBackIos sx={{ fontSize: 40, color: '#000' }} />
            </button>

            <div className="title-container">
                <Typography 
                variant="h4" 
                className="title"
                sx={{ 
                fontFamily: crimsonPro.style.fontFamily,
                fontWeight: 600
                }}
                >
                {this.months[currentDay.getMonth()]} {currentDay.getFullYear()}
                </Typography>
                <Typography 
                variant="subtitle1" 
                className="current-date"
                onClick={this.toggleView}
                sx={{ 
                fontFamily: crimsonPro.style.fontFamily,
                fontWeight: 500,
                cursor: 'pointer'
                }}
                >
                {this.formatCurrentDate()}
                </Typography>
            </div>

            <button className="nav-button" onClick={this.nextMonth}>
                <ArrowForwardIos sx={{ fontSize: 40, color: '#000' }} />
            </button>

            <CreateEventDialog accountId={this.state.accountId} callback={this.updateEvents}/>
            <SearchFilterEventsDialog accountId={this.state.accountId}/>
            </div>

            {/* Calendar Body */}
            <div className="calendar-body">
            {view === 'month' ? (
                <>
                <div className="table-header">
                {this.weekdays.map((weekday, index) => (
                <div key={index} className="weekday">
                    <Typography 
                    variant="subtitle1"
                    sx={{ 
                    fontFamily: crimsonPro.style.fontFamily,
                    fontWeight: 400
                    }}
                    >
                    {weekday}
                    </Typography>
                </div>
                ))}
                </div>
                <CalendarDays 
                day={currentDay} 
                changeCurrentDay={this.changeCurrentDay} 
                createEvent={this.createEvent} 
                events={events} 
                onEventClick={this.handleEventClick} // Pass the event click handler
                />
                </>
            ) : (
                <WeeklyView 
                currentDay={currentDay}
                events={events}
                onEventClick={this.handleEventClick} // Pass the event click handler
                />
            )}
            </div>
            </div>
            {/* Event Details Dialog */}
            <Dialog open={dialogOpen} onClose={this.handleCloseDialog}>
            <DialogTitle>
            Event Details
            {selectedEvent && (
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Typography variant="body2" component="label">
                Mark as Complete
                <Checkbox
                checked={selectedEvent.completed}
                onChange={() => this.setState(prevState => ({
                    selectedEvent: {
                    ...prevState.selectedEvent,
                    completed: !prevState.selectedEvent.completed
                    }
                }))}
                />
                </Typography>
                </div>
            )}
            </DialogTitle>
            <DialogContent>
            {selectedEvent && (
                <>
                <TextField
                margin="dense"
                id="title"
                name="title"
                label="Title"
                type="text"
                fullWidth
                variant="standard"
                value={selectedEvent.title}
                onChange={this.handleInputChange}
                />
                <TextField
                margin="dense"
                id="date"
                name="date"
                label="Date"
                type="date"
                fullWidth
                variant="standard"
                value={selectedEvent.date}
                onChange={this.handleInputChange}
                />
                <TextField
                margin="dense"
                id="time"
                name="time"
                label="Time"
                type="time"
                fullWidth
                variant="standard"
                value={selectedEvent.time}
                onChange={this.handleInputChange}
                />
                <TextField
                margin="dense"
                id="color"
                name="color"
                label="Color"
                type="text"
                fullWidth
                variant="standard"
                value={selectedEvent.color}
                onChange={this.handleInputChange}
                />
                <Button onClick={this.toggleSliderAndEstimatedTime}>
                {isSliderEnabled && isEstimatedTimeEnabled ? 'Disable' : 'Enable'} Slider and Estimated Time
                </Button>
                
                {isSliderEnabled && (
                <>
                <Typography gutterBottom>
                    Difficulty
                </Typography>
                <Slider
                    value={selectedEvent.difficulty}
                    onChange={this.handleSliderChange}
                    aria-labelledby="difficulty-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks={[
                    { value: 1, label: 'Easy' },
                    { value: 3, label: 'Medium' },
                    { value: 5, label: 'Hard' }
                    ]}
                    min={1}
                    max={5}
                />
                </>
                )}
                {isEstimatedTimeEnabled && (
                <>
                <TextField
                    margin="dense"
                    id="estimatedTime"
                    name="estimatedTime"
                    label="Estimated Time (hours)"
                    type="number"
                    fullWidth
                    variant="standard"
                    value={selectedEvent.estimatedTime}
                    onChange={this.handleInputChange}
                    inputProps={{ min: 0 }} // Ensure estimatedTime is 0 or greater
                />
                <Typography gutterBottom>
                    Estimated Completion Time: {selectedEvent.estimatedTime * selectedEvent.difficulty} hours
                </Typography>
                </>
                )}
                {isSliderEnabled && selectedEvent.completed && (
                <Button onClick={() => this.setState(prevState => ({
                isCompletionTimeEnabled: !prevState.isCompletionTimeEnabled
                }))}>
                {this.state.isCompletionTimeEnabled ? 'Disable' : 'Enable'} Completion Time
                </Button>
                )}
                {this.state.isCompletionTimeEnabled && selectedEvent.completed && (
                <TextField
                margin="dense"
                id="completionTime"
                name="completionTime"
                label="Completion Time (hours)"
                type="number"
                fullWidth
                variant="standard"
                value={selectedEvent.completionTime || ''}
                onChange={this.handleInputChange}
                inputProps={{ min: 0 }} // Ensure completionTime is 0 or greater
                />
                )}
                </>
            )}
            </DialogContent>
            <DialogActions>
            <Button onClick={this.handleCloseDialog}>Cancel</Button>
            <Button onClick={this.handleSaveEvent}>Save</Button>
            </DialogActions>
            </Dialog>
            </div>
        );
    }
}