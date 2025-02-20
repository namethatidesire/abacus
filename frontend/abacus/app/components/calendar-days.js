"use client";
import React from 'react';

function CalendarDays(props) {
    const firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    const weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    for (let day = 0; day < 42; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (day === 0) {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay));
        } else {
            firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }

        // Create the calendar day object
        let calendarDay = {
            currentMonth: (firstDayOfMonth.getMonth() === props.day.getMonth()),
            date: (new Date(firstDayOfMonth)),
            month: firstDayOfMonth.getMonth(),
            number: firstDayOfMonth.getDate(),
            selected: (firstDayOfMonth.toDateString() === props.day.toDateString()),
            year: firstDayOfMonth.getFullYear()
        }

        currentDays.push(calendarDay);
    }

    return (
        // The rendered calendar days
        <div className="table-content">
            {
                // Creates the calendar days and maps them to the currentDays array
                currentDays.map((day, index) => {
                    const dateKey = day.date.toDateString();
                    const dayEvents = Array.isArray(props.events[dateKey]) ? props.events[dateKey] : [];
                    return (
                        <div key={index} className={"calendar-day" + (day.currentMonth ? " current" : "") + (day.selected ? " selected" : "")}
                             onClick={() => props.createEvent(day)}>
                            <p>{day.number}</p>
                            {dayEvents.map((event, eventIndex) => (
                                <p key={eventIndex} className="event" style={{ backgroundColor: event.color }}>
                                    {event.title}
                                </p>
                            ))}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default CalendarDays;