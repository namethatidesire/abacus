// update-event-dialog.js
import React from "react";
import dayjs from "dayjs";
import { BaseEventDialog } from "./base-event-dialog";
import { Button } from "@mui/material";

export default function UpdateEventDialog({ event, accountId, callback }) {
    const [open, setOpen] = React.useState(false);
    const [eventData, setEventData] = React.useState({
        title: event.title,
        userId: accountId,
        color: event.color,
        startDateTime: dayjs(event.date + event.time).subtract(1, 'day'),
        endDateTime: dayjs(event.endDate),
        description: event.description,
        recurring: event.recurring,
        reminder: event.reminder || 'None',
        tags: event.tags,
        estimatedTime: event.estimatedTime !== null ? parseInt(event.estimatedTime) : null,
        difficulty: event.difficulty !== null ? event.difficulty : null,
        task: event.task,
        completed: event.completed
    });

    const updateEvent = async () => {
        const updatedEvent = {
            id: event.id,
            userId: accountId,
            title: eventData.title,
            date: eventData.startDateTime.toISOString(),
            time: eventData.startDateTime.format('HH:mm'),
            recurring: eventData.recurring,
            color: eventData.color,
            description: eventData.description,
            endDate: eventData.endDateTime.toISOString(),
            type: "EVENT",
            reminder: eventData.reminder,
            tags: eventData.tags,
            estimatedTime: eventData.estimatedTime !== null ? parseInt(eventData.estimatedTime) : null,
            difficulty: eventData.difficulty !== null ? eventData.difficulty : null,
            task: eventData.task,
            completed: eventData.completed
        };
        try {
            const response = await fetch(`api/event/${accountId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent),
            });

            if (!response.ok) {
                console.error('Failed to update event');
            }
        } catch (error) {
            console.error('Error updating event:', error);
        }
        callback();
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button variant="outlined" onClick={() => setOpen(true)}>Edit</Button>
            <BaseEventDialog
                open={open}
                onClose={() => setOpen(false)}
                title="Update Event"
                eventData={eventData}
                setEventData={setEventData}
                onSubmit={updateEvent}
                submitButtonText="Update Event"
            />
        </React.Fragment>
    );
}