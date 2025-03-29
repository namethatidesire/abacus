import React from "react";
import dayjs from "dayjs";
import { Button } from "@mui/material";
import { BaseEventDialog } from "./base-event-dialog";

// @param props: accountId, callback, open, onClose, selectedDate
// accountId: the id of the user creating the event
// callback: a function to call after creating the event (e.g. to update the calendar)
// open: boolean to control dialog visibility
// onClose: function to call when closing the dialog
// selectedDate: date object for pre-populating the event date
export default function CreateEventDialog(props) {
    const accountId = props.accountId;
    const calendarId = props.calendarId;
    const open = props.open || false;
    
    const [eventData, setEventData] = React.useState({
        title: '',
        userId: accountId,
        color: '#FF0000',
        startDateTime: props.selectedDate ? dayjs(props.selectedDate) : dayjs(),
        endDateTime: props.selectedDate ? dayjs(props.selectedDate).add(1, 'hour') : dayjs().add(1, 'hour'),
        description: '',
        recurring: 'None',
        reminder: 'None',
        type: "EVENT",
        tags: [],
        difficulty: null,
        expectedTime: null,
        completionTime: null,
        task: false,
        completed: false
    });

    const resetEventData = () => {
        setEventData({
            title: '',
            userId: accountId,
            color: '#FF0000',
            startDateTime: dayjs(),
            endDateTime: dayjs().add(1, 'hour'),
            description: '',
            recurring: 'None',
            reminder: 'None',
            type: "EVENT",
            tags: [],
            difficulty: null,
            expectedTime: null,
            completionTime: null,
            task: false,
            completed: false
        });
    }

    React.useEffect(() => {
        if (props.selectedDate) {
            setEventData(prev => ({
                ...prev,
                startDateTime: dayjs(props.selectedDate),
                endDateTime: dayjs(props.selectedDate).add(1, 'hour')
            }));
        }
    }, [props.selectedDate]);

    const handleClose = () => {
        resetEventData();
        if (props.onClose) {
            props.onClose();
        }
    };

    // Function to create an event
    const createEvent = async () => {
        const newEvent = {
            userId: accountId,
            calendarId: calendarId,
            title: eventData.title,
            date: eventData.startDateTime.toISOString(),
            time: eventData.startDateTime.format('HH:mm'),
            recurring: eventData.recurring,
            color: eventData.color,
            description: eventData.description,
            endDate: eventData.endDateTime.toISOString(),
            type: eventData.type,
            reminder: eventData.reminder,
            tags: eventData.tags,
            expectedTime: eventData.expectedTime !== null ? parseInt(eventData.expectedTime) : null,
            completionTime: eventData.completionTime !== null ? parseInt(eventData.completionTime) : null,
            difficulty: eventData.difficulty !== null ? eventData.difficulty : null,
            task: eventData.task,
            completed: eventData.completed
        };

        try {
            const response = await fetch(`api/event/${accountId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });

            if (!response.ok) {
                console.error('Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
        
        props.callback();
        handleClose();
    };

    // If the component is being used with the Button (old style)
    if (!props.open && !props.onClose) {
        return (
            <React.Fragment>
                <Button variant="outlined" onClick={() => setOpen(true)}>
                    Create New Event
                </Button>
                <BaseEventDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Create New Event"
                    eventData={eventData}
                    setEventData={setEventData}
                    onSubmit={createEvent}
                    submitButtonText="Create Event"
                />
            </React.Fragment>
        );
    }

    // If the component is being used with external open/close control (new style)
    return (
        <BaseEventDialog
            open={open}
            onClose={handleClose}
            title="Create New Event"
            eventData={eventData}
            setEventData={setEventData}
            onSubmit={createEvent}
            submitButtonText="Create Event"
            position={props.position}
        />
    );
}