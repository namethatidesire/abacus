"use client";
import React, { Component } from 'react';
import { Crimson_Pro } from 'next/font/google';
import CalendarDays from './calendar-days.js';
import WeeklyView from './weekly-view.js';
import Navbar from './navbar.js';
import { Typography } from "@mui/material";
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
            view: 'month' // 'month' or 'week'
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

    render() {
        const { view, currentDay, events } = this.state;
        
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