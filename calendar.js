import React, { Component } from 'react';
import CalendarDays from './calendar-days';
import './style.css'

export default class Calendar extends Component {
    constructor(props) {
        super(props);

        this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

        this.state = {
            currentDay: new Date(),
            events: {} 
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

    // Function to create an event
    createEvent = (day) => {
        const eventTitle = prompt("Enter event title:");
        if (eventTitle) {
            this.setState((prevState) => {
                const events = { ...prevState.events };
                const dateKey = day.date.toDateString();
                if (!events[dateKey]) {
                    events[dateKey] = [];
                }
                events[dateKey].push(eventTitle);
                return { events };
            });
        }
    }

    render() {
        return (
        <div className="calendar">

            {/* Calendar Header*/}
            <div className="calendar-header">

                    {/* Current Month and Year */}
                    <div className="title">
                        <h2>{this.months[this.state.currentDay.getMonth()]} {this.state.currentDay.getFullYear()}</h2>
                    </div>

                    <div className="tools">

                    {/* Back arrow icon */}
                    <button onClick={this.previousDay}>
                    <span className="material-icons">
                        arrow_back
                        </span>
                    </button>

                    {/* Current date selected */}
                    <p>{this.months[this.state.currentDay.getMonth()].substring(0, 3)} {this.state.currentDay.getDate()}</p>
                    
                    {/* Forward arrow icon */}
                    <button onClick={this.nextDay}>
                    <span className="material-icons">
                        arrow_forward
                        </span>
                    </button>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="calendar-body">
                {/* Day label */}
                <div className="table-header">
                    {
                    this.weekdays.map((weekday) => {
                        return <div className="weekday"><p>{weekday}</p></div>
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

