"use client";
import React from 'react';

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
                return (
                    <div 
                        key={index} 
                        className={`calendar-day${day.currentMonth ? " current" : ""}${day.selected ? " selected" : ""}${day.today ? " today" : ""}`}
                        onClick={() => props.createEvent(day)}
                    >
                        <p>{day.number}</p>
                        {dayEvents.map((event, eventIndex) => (
                            <div 
                                key={eventIndex} 
                                className="event" 
                                style={{ backgroundColor: event.color }}
                            >
                                {event.title}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

export default CalendarDays;