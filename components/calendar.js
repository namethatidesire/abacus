"use client";
import React, { Component } from 'react';
import { Crimson_Pro } from 'next/font/google';
import CalendarDays from './calendar-days.js';
import WeeklyView from './weekly-view.js';
import { Typography } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import './style.css';
import CreateEventDialog from "./create-event-dialog";
import SearchFilterEventsDialog from "./searchFilterEvents";
import ManageCalendarDialog from "./calendar-manage";
import PropTypes from 'prop-types';

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

export default class Calendar extends Component {
    static propTypes = {
        default: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);

        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.state = {
            calendarId: null, // Initialize as null
            currentDay: new Date(),
            events: {},
            accountId: null,
            view: 'month', // 'month' or 'week'
            highlightedEventId: null
        }
    }

    componentDidMount = async() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            alert('Missing token. Please log in again.');
            // Redirect to login page Session expired
            window.location.href = '/login';
            return;
        }

        // Add event listeners
        document.addEventListener('highlightCalendarEvent', this.handleHighlightEvent);
        document.addEventListener('calendarRefresh', this.handleCalendarRefresh);

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
                // Set both accountId and calendarId, then fetch events
                this.setState({ 
                    accountId: userId,
                    calendarId: this.props.default // Get calendarId from props
                }, this.fetchEvents);
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

    componentDidUpdate(prevProps, prevState) {
        // If calendarId is null and we have a default prop, set it
        if (!this.state.calendarId && this.props.default) {
            this.setState({ calendarId: this.props.default }, this.fetchEvents);
        }
        // If the default prop changes, update calendarId
        else if (prevProps.default !== this.props.default) {
            this.setState({ calendarId: this.props.default }, this.fetchEvents);
        }
    }

    componentWillUnmount() {
        // Remove event listeners when component unmounts
        document.removeEventListener('highlightCalendarEvent', this.handleHighlightEvent);
        document.removeEventListener('calendarRefresh', this.handleCalendarRefresh);
    }
    handleCalendarRefresh = (event) => {
        console.log('Calendar refresh event received:', event.detail);
        // Call your fetchEvents method to reload calendar data
        this.fetchEvents();
    };

    // Handle highlight event from chat
    handleHighlightEvent = (e) => {
        const { eventId, highlight } = e.detail;
        
        // Set highlighted event ID in state
        this.setState({ 
            highlightedEventId: highlight ? eventId : null 
        });
    }

    fetchEvents = async () => {
        const { accountId } = this.state;
        const calendarId = this.state.calendarId || this.props.default;
        
        if (!accountId || !calendarId) {
            console.log('Missing required IDs:', { accountId, calendarId });
            return;
        }
    
        try {
            const getEvents = await fetch(`http://localhost:3000/api/calendar/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: accountId, calendarId })
            });
            if (getEvents.ok) {
                const data = (await getEvents.json()).events || [];
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const events = Array.isArray(data) ? data.reduce((acc, event) => {
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
                }, {}) : {};
                this.setState({ events });
            } else {
                console.error('Failed to fetch events:', getEvents.statusText);
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

    // Add this method to the Calendar class
    handleCalendarChange = (newCalendarId) => {
        this.setState({ calendarId: newCalendarId }, this.fetchEvents);
    }

    render() {
        const { view, currentDay, events } = this.state;
        
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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

                        <CreateEventDialog accountId={this.state.accountId} calendarId={this.state.calendarId} callback={this.updateEvents}/>
                        <SearchFilterEventsDialog accountId={this.state.accountId}/>
                        <ManageCalendarDialog 
                            accountId={this.state.accountId} 
                            calendarId={this.state.calendarId}
                            onCalendarChange={this.handleCalendarChange}
                        />
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
                                highlightedEventId={this.state.highlightedEventId} 
                                />
                            </>
                        ) : (
                            <WeeklyView 
                                currentDay={currentDay}
                                events={events}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}