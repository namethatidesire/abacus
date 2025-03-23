"use client";
import React from 'react';
import { Typography } from "@mui/material";
import ShowEventDialog from "./show-event-dialog";
import './weekly-view.css';

function WeeklyView({ currentDay, events, accountId, updateCallback }) {
    // Generate time slots for 24 hours
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    // Get the start of the week (Sunday)
    const getWeekStart = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        return start;
    };

    // Get array of days for the week
    const getWeekDays = (start) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    // Calculate event position and dimensions
    const getEventStyle = (event) => {
        const [hours, minutes] = event.time.split(':').map(Number);
        const topPosition = (hours + minutes / 60) * 60; // 60px per hour
        
        // Calculate duration
        let duration = 60; // Default 1 hour = 60px
        if (event.endDate) {
            const start = new Date(`${event.date}T${event.time}`);
            const end = new Date(event.endDate);
            duration = (end - start) / (1000 * 60 * 60) * 60; // Convert hours to pixels
        }

        return {
            top: `${topPosition}px`,
            height: `${duration}px`,
            backgroundColor: event.color,
            width: 'calc(100% - 8px)',
            left: '4px',
        };
    };

    const weekStart = getWeekStart(currentDay);
    const weekDays = getWeekDays(weekStart);

    return (
        <div className="weekly-container">
            {/* Header row with day names */}
            <div className="weekly-header">
                <div className="time-header"></div>
                {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                        <div key={index} className={`day-header${isToday ? " today" : ""}`}>
                            <Typography variant="subtitle2">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </Typography>
                            <Typography variant="h6">
                                {day.getDate()}
                            </Typography>
                        </div>
                    );
                })}
            </div>

            {/* Scrollable content area */}
            <div className="weekly-content">
                {/* Time slots */}
                <div className="time-column">
                    {timeSlots.map((time) => (
                        <div key={time} className="time-slot">
                            <Typography variant="caption">{time}</Typography>
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="days-grid">
                    {weekDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="day-column">
                            {/* Time grid lines */}
                            {timeSlots.map((time, timeIndex) => (
                                <div key={timeIndex} className="time-grid-line" />
                            ))}

                            {/* Events */}
                            {Array.isArray(events[day.toDateString()]) && 
                                events[day.toDateString()].map((event, eventIndex) => (
                                    <ShowEventDialog
                                        key={eventIndex}
                                        event={event}
                                        accountId={accountId}
                                        updateCallback={updateCallback}
                                    >
                                        <div
                                            className="week-event"
                                            style={getEventStyle(event)}
                                        >
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-time">{event.time}</div>
                                        </div>
                                    </ShowEventDialog>
                                ))
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeeklyView;