import React, { useEffect } from "react";
import { prisma } from "@/utils/db";

export default function RenderProgressBar(accountId) {
    const eventType = "TASK";
    const [eventCounts, setEventCounts] = React.useState({completeEvents: 0, incompleteEvents: 0, completeTasks: 0, incompleteTasks: 0});

//  Get User's events with the TASK event type
//  Function to search for events
    // Replace componentDidMount with useEffect hook
    useEffect(() => {
        async function fetchEventCounts() {
            try {
                const token = sessionStorage.getItem('token');
                let userId;
                // For JWT tokens
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = payload.userId || payload.sub; // 'sub' is commonly used for user IDs in JWTs
                if (!userId) {
                  throw new Error('User ID not found in token');
                }
                const response = await fetch(`http://localhost:3000/api/type`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({"userId" : userId}),
                });
                setEventCounts(await response.json());
            }
            catch (error) {
               console.error('Error searching for event:', error);
            }
        }

        fetchEventCounts();
    }, []); // Empty dependency array means this runs once on mount
    console.log(eventCounts)

//     Compute a completion percentage based on some criteria
    let overallProgress = 0;
    let eventProgress = 0;
    let taskProgress = 0;

    let events = eventCounts.completeEvents + eventCounts.incompleteEvents;
    let tasks = eventCounts.completeTasks + eventCounts.incompleteTasks;

    if (events) {
        eventProgress = 1.0 * eventCounts.completeEvents / events;
    }
    if (tasks) {
        taskProgress = 1.0 * eventCounts.completeTasks / tasks;
    }
    if (events || tasks) {
        overallProgress = 1.0 * (eventCounts.completeEvents + eventCounts.completeTasks) / (events + tasks);
    }

    return (
    <div>
        <label htmlFor="overall">Overall Completion:</label>
        <br />
        <progress
        id="overall"
        value={overallProgress}
        />

        <br />
        <br />
        <label htmlFor="event">Event Completion:</label>
        <br />
        <progress
        id="event"
        value={eventProgress}
        />

        <br />
        <br />

        <label htmlFor="task">Task Completion:</label>
        <br />
        <progress
        id="task"
        value={taskProgress}
        />
    </div>
    );
}