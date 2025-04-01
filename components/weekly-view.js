"use client";
import React, { useState } from 'react';
import { Typography } from "@mui/material";
import ShowEventDialog from "./show-event-dialog";
import CreateEventDialog from "./create-event-dialog";
import './weekly-view.css';

function WeeklyView({ currentDay, events, accountId, calendarId, updateCallback }) {
    // Add state for acknowledged conflicts
    const [acknowledgedConflicts, setAcknowledgedConflicts] = useState(new Set());
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState(null);

    // Add conflict acknowledgment handler
    const handleConflictAcknowledge = (eventId, overlappingEvents) => {
        const updatedAcknowledged = new Set(acknowledgedConflicts);
        overlappingEvents.forEach(otherId => {
            updatedAcknowledged.add(`${eventId}-${otherId}`);
            updatedAcknowledged.add(`${otherId}-${eventId}`);
        });
        setAcknowledgedConflicts(updatedAcknowledged);
    };

    // Add this function to handle time slot clicks
    const handleTimeSlotClick = (day, hour) => {
        const dateTime = new Date(day);
        dateTime.setHours(hour);
        dateTime.setMinutes(0);
        setSelectedDateTime(dateTime);
        setShowCreateDialog(true);
    };

    // Replace the timeSlots array definition
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        const period = i < 12 ? 'AM' : 'PM';
        return `${hour}:00 ${period}`;
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

    // Update the getOverlappingEvents function
    const getOverlappingEvents = (events) => {
        const sortedEvents = [...events].sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });

        const overlaps = new Map();
        
        sortedEvents.forEach((event, index) => {
            if (!overlaps.has(event.id)) {
                overlaps.set(event.id, { 
                    count: 1, 
                    position: 0, 
                    overlappingWith: [],
                    stackIndex: 0 // Add stackIndex for vertical positioning
                });
            }

            // Check overlap with previous events to determine stack position
            for (let i = 0; i < index; i++) {
                const other = sortedEvents[i];
                if (checkEventOverlap(event, other)) {
                    const eventOverlap = overlaps.get(event.id);
                    const otherOverlap = overlaps.get(other.id);
                    
                    // Stack the current event below the overlapping event
                    eventOverlap.stackIndex = otherOverlap.stackIndex + 1;
                    eventOverlap.overlappingWith.push(other.id);
                    otherOverlap.overlappingWith.push(event.id);
                }
            }
        });

        return overlaps;
    };

    // Add event overlap check
    const checkEventOverlap = (event1, event2) => {
        const start1 = new Date(`${event1.date}T${event1.time}`);
        const end1 = event1.endDate ? new Date(event1.endDate) : new Date(start1.getTime() + 60 * 60 * 1000);
        
        const start2 = new Date(`${event2.date}T${event2.time}`);
        const end2 = event2.endDate ? new Date(event2.endDate) : new Date(start2.getTime() + 60 * 60 * 1000);

        return start1 < end2 && end1 > start2;
    };

    // Modify getEventStyle to consider acknowledged conflicts
    const getEventStyle = (event, overlaps) => {
        const [hours, minutes] = event.time.split(':').map(Number);
        const topPosition = (hours + minutes / 60) * 60;
        
        let duration = 60;
        if (event.endDate) {
            const start = new Date(`${event.date}T${event.time}`);
            const end = new Date(event.endDate);
            duration = (end - start) / (1000 * 60 * 60) * 60;
        }

        const overlap = overlaps.get(event.id);
        const stackOffset = overlap?.stackIndex || 0;
        const offsetPerStack = 28; // Pixels to offset each stacked event

        const hasUnacknowledgedConflict = overlap?.overlappingWith.some(otherId => 
            !acknowledgedConflicts.has(`${event.id}-${otherId}`)
        );

        return {
            position: 'absolute',
            top: `${topPosition + (stackOffset * offsetPerStack)}px`,
            height: `${duration}px`,
            backgroundColor: event.color,
            width: '95%',
            left: '2.5%',
            zIndex: overlap?.stackIndex + 1,
            opacity: 0.9, // Add slight transparency
            border: hasUnacknowledgedConflict ? '2px solid #ff0000' : 
                   overlap?.overlappingWith.length > 0 ? '2px solid #FFA500' : 'none',
            boxShadow: hasUnacknowledgedConflict ? '0 0 4px rgba(255, 0, 0, 0.4)' : 
                      overlap?.overlappingWith.length > 0 ? '0 0 4px rgba(255, 165, 0, 0.4)' : 
                      '0 2px 4px rgba(0,0,0,0.1)'
        };
    };

    // Convert time to 12-hour format
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = Array.isArray(events[day.toDateString()]) ? 
                            events[day.toDateString()] : [];
                        const overlaps = getOverlappingEvents(dayEvents);

                        return (
                            <div key={dayIndex} className="day-column">
                                {/* Time grid lines */}
                                {timeSlots.map((time, timeIndex) => (
                                    <div 
                                        key={timeIndex} 
                                        className="time-grid-line"
                                        onClick={() => handleTimeSlotClick(day, timeIndex)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}

                                {/* Events */}
                                {dayEvents.map((event, eventIndex) => {
                                    const overlap = overlaps.get(event.id);
                                    const hasUnacknowledgedConflict = overlap?.overlappingWith.some(otherId => 
                                        !acknowledgedConflicts.has(`${event.id}-${otherId}`)
                                    );
                                    const conflictingEvents = overlap?.overlappingWith.map(id => 
                                        dayEvents.find(e => e.id === id)
                                    ).filter(Boolean) || [];

                                    return (
                                        <ShowEventDialog
                                            key={eventIndex}
                                            event={event}
                                            accountId={accountId}
                                            updateCallback={updateCallback}
                                            hasConflict={hasUnacknowledgedConflict}
                                            conflictingEvents={conflictingEvents}
                                            onAcknowledgeConflict={() => handleConflictAcknowledge(event.id, overlap?.overlappingWith || [])}
                                        >
                                            <div
                                                className="week-event"
                                                style={getEventStyle(event, overlaps)}
                                            >
                                                <div className="event-title">{event.title}</div>
                                                <div className="event-time">{formatTime(event.time)}</div>
                                                {hasUnacknowledgedConflict && (
                                                    <span className="conflict-indicator">⚠️</span>
                                                )}
                                            </div>
                                        </ShowEventDialog>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add CreateEventDialog */}
            <CreateEventDialog
                accountId={accountId}
                calendarId={calendarId}
                callback={updateCallback}
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                selectedDate={selectedDateTime}
            />
        </div>
    );
}

export default WeeklyView;
