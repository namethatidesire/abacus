"use client";
import React from 'react';
import ShowEventDialog from "./show-event-dialog";
import { Crimson_Pro } from 'next/font/google';
import { Typography } from "@mui/material";
import './calendar-days.css';
import CreateEventDialog from './create-event-dialog';

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

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
                            e.stopPropagation(); // Prevent event bubbling
                            props.changeCurrentDay(day);
                            props.onCreateEvent(day.date);
                        }} 
                        style={{ cursor: "pointer", textAlign: "right" }} // Make it look clickable and align to the right
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
                            
                            return (
                                <div 
                                    key={eventIndex} 
                                    className={`event${isHighlighted ? " highlighted-event" : ""}`}
                                    style={{ 
                                        backgroundColor: event.color,
                                        boxShadow: isHighlighted ? '0 0 8px 2px #FBE59D' : 'none',
                                        transform: isHighlighted ? 'scale(1.05)' : 'none',
                                        zIndex: isHighlighted ? 10 : 'auto',
                                        transition: 'none', // Remove transition
                                        color: 'white',
                                        fontWeight: 400,
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        marginBottom: '4px',
                                        textAlign: 'center',
                                        fontSize: '0.8em' // Increase font size for events
                                    }}
                                >
                                    <ShowEventDialog event={event} accountId={props.accountId} updateCallback={props.updateCallback}>
                                        {event.title}
                                    </ShowEventDialog>
                                </div>
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