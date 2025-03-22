"use client";
import React from 'react';
import { Typography } from "@mui/material";
import ShowEventDialog from "./show-event-dialog";

function WeeklyView({ currentDay, events }) {
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

    const weekStart = getWeekStart(currentDay);
    const weekDays = getWeekDays(weekStart);

    return (
        <div className="weekly-view">
            <div className="weekly-grid">
                {weekDays.map((day, index) => {
                    const dateKey = day.toDateString();
                    const dayEvents = Array.isArray(events[dateKey]) ? events[dateKey] : [];
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div key={index} className="weekly-day">
                            <div className={`day-header${isToday ? " today" : ""}`}>
                                <Typography variant="subtitle2">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </Typography>
                                <Typography variant="h6">
                                    {day.getDate()}
                                </Typography>
                            </div>
                            <div className="day-events">
                                {dayEvents.map((event, eventIndex) => (
                                    <ShowEventDialog event={event}>
                                        <div
                                            key={eventIndex}
                                            className="week-event"
                                            style={{ backgroundColor: event.color }}
                                        >
                                            <span className="event-time">{event.time}</span>
                                            <span className="event-title">{event.title}</span>
                                        </div>
                                    </ShowEventDialog>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default WeeklyView;