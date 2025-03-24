import React from 'react';
import { Typography } from "@mui/material";
import { Crimson_Pro } from 'next/font/google';
import ShowEventDialog from './show-event-dialog';
import './event-sidebar.css';

// Initialize Crimson Pro font
const crimsonPro = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
});

function EventSidebar({ currentDay, events, accountId, updateCallback }) {
    // Get events for the current day
    const dateKey = currentDay.toDateString();
    const dayEvents = Array.isArray(events[dateKey]) ? events[dateKey] : [];
    
    // Sort events by time
    const sortedEvents = [...dayEvents].sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    // Format date for display
    const formattedDate = currentDay.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Format time to 12-hour format
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    
    return (
        <div className="event-sidebar">
            <div className="sidebar-header">
                <Typography 
                    variant="h6" 
                    className="sidebar-date"
                    sx={{ 
                        fontFamily: crimsonPro.style.fontFamily,
                        fontWeight: 600
                    }}
                >
                    {formattedDate}
                </Typography>
            </div>
            
            <div className="sidebar-content">
                {sortedEvents.length === 0 ? (
                    <Typography 
                        variant="body2"
                        className="no-events"
                        sx={{ 
                            fontFamily: crimsonPro.style.fontFamily
                        }}
                    >
                        No events scheduled for this day
                    </Typography>
                ) : (
                    sortedEvents.map((event, index) => (
                        <ShowEventDialog
                            key={index}
                            event={event}
                            accountId={accountId}
                            updateCallback={updateCallback}
                        >
                            <div 
                                className="sidebar-event-card" 
                                style={{ borderLeft: `4px solid ${event.color}` }}
                            >
                                <div className="event-time">
                                    {formatTime(event.time)}
                                </div>
                                <div className="event-title">
                                    {event.title}
                                </div>
                                {event.location && (
                                    <div className="event-location">
                                        📍 {event.location}
                                    </div>
                                )}
                                {event.description && (
                                    <div className="event-description">
                                        {event.description}
                                    </div>
                                )}
                            </div>
                        </ShowEventDialog>
                    ))
                )}
            </div>
        </div>
    );
}

export default EventSidebar;