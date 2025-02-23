"use client";
import React, { Component } from 'react';
import CalendarDays from './calendar-days.js';
import './style.css';

export default class Calendar extends Component {
    constructor(props) {
        super(props);

        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

        this.state = {
            currentDay: new Date(),
            events: {},
            accountId: null
        }
    }

    componentDidMount() {
        const urlParams = new URLSearchParams(window.location.search);
        const accountId = urlParams.get('accountId');
        if (accountId) {
            this.setState({ accountId: parseInt(accountId, 10) }, this.fetchEvents);
        }
    }

    fetchEvents = async () => {
        const { accountId } = this.state;
        if (!accountId) return;

        try {
            const response = await fetch(`http://localhost:3000/event/${accountId}/retrieve`);
            if (response.ok) {
                const data = await response.json();
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const events = data.events.reduce((acc, event) => {
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

    // Function to change the current day
    changeCurrentDay = (day) => {
        this.setState({ currentDay: new Date(day.year, day.month, day.number) });
    }

    // Function to change the current day
    nextDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() + 1)) });
    }

    // Function to change the current day
    previousDay = () => {
        this.setState({ currentDay: new Date(this.state.currentDay.setDate(this.state.currentDay.getDate() - 1)) });
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


    // Function to create an event
    createEvent = async (day) => {
        const { accountId } = this.state;

        // Prompt the user for the event title, color, and time
        const eventTitle = prompt("Enter event title:");
        const eventColor = prompt("Enter event color (e.g., #FF0000):");
        const eventTime = prompt("Enter event time (HH:MM):");
        if (eventTitle && eventColor && eventTime) {
            const localDate = new Date(day.date);
            const utcDate = new Date(localDate.toISOString().split('T')[0] + 'T' + eventTime + ':00Z');
            const newEvent = {
                accountId,
                title: eventTitle,
                date: utcDate.toISOString(),
                time: eventTime,
                recurring: 'false',
                color: eventColor
            };

            try {
                const response = await fetch(`http://localhost:3000/event/${accountId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ newEvent }),
                });

                if (response.ok) {
                    this.setState((prevState) => {
                        const events = { ...prevState.events };
                        const dateKey = new Date(day.date).toDateString();
                        if (!events[dateKey]) {
                            events[dateKey] = [];
                        }
                        events[dateKey].push(newEvent);
                        return { events };
                    });
                } else {
                    console.error('Failed to create event');
                }
            } catch (error) {
                console.error('Error creating event:', error);
            }
        }
    }

    render() {
        return (
            <div className="calendar">
                {/* Calendar Header */}
                <div className="calendar-header">
                    {/* left arrow icon */}
                    <button className ="left-arrow" onClick={this.previousMonth}>
                            <span className="material-icons">arrow_back</span>
                        </button>
                    
                    {/* Current Month and Year */}
                    <div className="title">
                        <h2>{this.months[this.state.currentDay.getMonth()]} {this.state.currentDay.getFullYear()}</h2>
                    </div>
                    
                    {/* right arrow icon */}
                    <button className='right-arrow' onClick={this.nextMonth}>
                        <span className="material-icons">arrow_forward</span>
                    </button>
                </div>

                {/* Calendar Body */}
                <div className="calendar-body">
                    {/* Day label */}
                    <div className="table-header">
                        {
                        this.weekdays.map((weekday, index) => {
                            return <div key={index} className="weekday"><p>{weekday}</p></div>
                        })
                        }
                    </div>

                    {/* Render each day */}
                    {/* Day is passed on as the current day, change current day is the changing current day function */}
                    <CalendarDays day={this.state.currentDay} changeCurrentDay={this.changeCurrentDay} createEvent={this.createEvent} events={this.state.events} />
                </div>
            </div>
        )
    }
}