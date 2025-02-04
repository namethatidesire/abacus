import React, { Component } from 'react';
// import CalendarDays from './calendar-days';
import './style.css'

export default class Dashboard extends Component {
    constructor() {
        super();

        this.state = {
            currentDay: new Date(),
            events: {} 
        }
    }

    render() {
        return (
        <h1>Dashboard Testing</h1>
        )
    }
}

