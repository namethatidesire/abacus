"use client";
import React from 'react';
import { Crimson_Pro } from 'next/font/google';
import { Typography } from "@mui/material";
import './calendar-days.css';
import CreateEventDialog from './create-event-dialog';
import ShowEventDialog from './show-event-dialog';

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

// Add this function before the CalendarDays component
const checkEventOverlap = (event1, event2) => {
    const start1 = new Date(`${event1.date}T${event1.time}`);
    const end1 = event1.endDate ? new Date(event1.endDate) : new Date(start1.getTime() + 60 * 60 * 1000); // Default 1 hour duration
    
    const start2 = new Date(`${event2.date}T${event2.time}`);
    const end2 = event2.endDate ? new Date(event2.endDate) : new Date(start2.getTime() + 60 * 60 * 1000);

    return start1 < end2 && end1 > start2;
};

function CalendarDays(props) {
    const firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    const weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    // Get last month's days that should show
    const lastMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 0);
    const lastMonthDays = lastMonth.getDate();
    const daysFromLastMonth = weekdayOfFirstDay;
    
    // Add last month's days
    for (let i = daysFromLastMonth - 1; i >= 0; i--) {
        currentDays.push({
            currentMonth: false,
            date: new Date(props.day.getFullYear(), props.day.getMonth() - 1, lastMonthDays - i),
            month: props.day.getMonth() - 1,
            number: lastMonthDays - i,
            selected: false,
            year: props.day.getFullYear()
        });
    }

    // Current month's days
    const thisMonth = new Date(props.day.getFullYear(), props.day.getMonth() + 1, 0);
    const daysInMonth = thisMonth.getDate();
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(props.day.getFullYear(), props.day.getMonth(), day);
        currentDays.push({
            currentMonth: true,
            date: date,
            month: props.day.getMonth(),
            number: day,
            selected: date.toDateString() === props.day.toDateString(),
            today: date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear(),
            year: props.day.getFullYear()
        });
    }

    // Next month's days
    const remainingDays = 42 - currentDays.length;
    for (let day = 1; day <= remainingDays; day++) {
        currentDays.push({
            currentMonth: false,
            date: new Date(props.day.getFullYear(), props.day.getMonth() + 1, day),
            month: props.day.getMonth() + 1,
            number: day,
            selected: false,
            year: props.day.getFullYear()
        });
    }

    return (
        <div className="table-content">
            {currentDays.map((day, index) => {
                const dateKey = day.date.toDateString();
                const dayEvents = Array.isArray(props.events[dateKey]) ? props.events[dateKey] : [];
                const visibleEvents = dayEvents.slice(0, 2); // Limit to 2 events per day
                
                return (
                    <div 
                        key={index} 
                        className={`calendar-day${day.currentMonth ? " current" : ""}${day.selected ? " selected" : ""}${day.today ? " today" : ""}`}
                        onClick={(e) => {
                            // Only handle empty space clicks
                            if (e.target.classList.contains('calendar-day') || e.target.classList.contains('MuiTypography-root')) {
                                e.stopPropagation();
                                props.changeCurrentDay(day);
                                props.onCreateEvent(day.date);
                            }
                        }} 
                        style={{ cursor: "pointer", textAlign: "right" }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontFamily: crimsonPro.style.fontFamily,
                                color: day.currentMonth ? '#333' : '#999', // Darker color for current month, lighter for others
                                marginLeft: "auto", // Align to the right
                                fontSize: '1.em', // Increase font size for calendar dates
                                fontWeight: 'bold', // Bold the date text
                                ...(day.today && {
                                    backgroundColor: '#8CA7D6',
                                    borderRadius: '50%',
                                    width: '1.5em',
                                    height: '1.5em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginBottom: '4px' // Add space below the circle
                                })
                            }}
                        >
                            {day.number}
                        </Typography>
                        
                        {/* Render up to 2 events */}
                        {visibleEvents.map((event, eventIndex) => {
                            const isHighlighted = props.highlightedEventId === event.id;
                            
                            // Find all conflicting events
                            const conflictingEvents = dayEvents.filter((otherEvent) => {
                                if (otherEvent.id === event.id) return false;
                                return checkEventOverlap(event, otherEvent);
                            });
                            
                            const hasConflict = conflictingEvents.length > 0;
                            
                            // Create tooltip content for conflicts
                            const conflictTooltip = hasConflict 
                                ? `Conflicts with:\n${conflictingEvents.map(e => 
                                    `${e.title} (${e.time})`).join('\n')}`
                                : '';
                            
                            return (
                                <ShowEventDialog
                                    key={eventIndex}
                                    event={event}
                                    accountId={props.accountId}
                                    updateCallback={props.updateCallback}
                                >
                                    <div 
                                        className={`event${isHighlighted ? " highlighted-event" : ""}${hasConflict ? " conflict-event" : ""}`}
                                        style={{ 
                                            backgroundColor: event.color,
                                            boxShadow: isHighlighted ? '0 0 8px 2px #FBE59D' : 
                                                      hasConflict ? '0 0 4px 2px #ff000066' : 'none',
                                            transform: isHighlighted ? 'scale(1.05)' : 'none',
                                            zIndex: isHighlighted ? 10 : 'auto',
                                            transition: 'none',
                                            color: 'white',
                                            fontWeight: hasConflict ? 600 : 400,
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            marginBottom: '4px',
                                            textAlign: 'center',
                                            fontSize: '0.8em',
                                            cursor: 'pointer',
                                            border: hasConflict ? '2px solid #ff0000' : 'none',
                                            position: 'relative' // Add this for tooltip positioning
                                        }}
                                        onMouseMove={(e) => {
                                            const tooltip = e.currentTarget.querySelector('.conflict-tooltip');
                                            if (tooltip) {
                                                const padding = 10;
                                                tooltip.style.left = `${e.clientX + padding}px`;
                                                tooltip.style.top = `${e.clientY - tooltip.offsetHeight - padding}px`;
                                            }
                                        }}
                                        title={conflictTooltip} // Native HTML tooltip
                                    >
                                        {event.title}
                                        {hasConflict && <span style={{ marginLeft: '4px' }}>⚠️</span>}
                                        
                                        {/* Custom tooltip */}
                                        {hasConflict && (
                                            <div className="conflict-tooltip">
                                                <strong>Conflicts with:</strong>
                                                {conflictingEvents.map((e, i) => (
                                                    <div key={i}>
                                                        • {e.title} ({e.time})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ShowEventDialog>
                            );
                        })}

                        {/* Display "+X more" if there are hidden events */}
                        {dayEvents.length > 2 && (
                            <Typography variant="caption" className="more-events">
                                +{dayEvents.length - 2} more
                            </Typography>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default CalendarDays;
