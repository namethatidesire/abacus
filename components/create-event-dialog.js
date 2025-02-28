import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import {CirclePicker} from "react-color";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// @param props: accountId, callback
// accountId: the id of the user creating the event
// callback: a function to call after creating the event (e.g. to update the calendar)
export default function CreateEventDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [eventColor, setEventColor] = React.useState('#FF0000');
    const [eventTitle, setEventTitle] = React.useState('');
    const [eventDateTime, setEventDateTime] = React.useState(dayjs());

    const accountId = props.accountId;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Function to create an event
    const createEvent = async function() {

        console.log(eventTitle);

        // Prompt the user for the event title, color, and time
        // const eventTitle = prompt("Enter event title:");
        // const eventColor = prompt("Enter event color (e.g., #FF0000):");
        // const eventTime = prompt("Enter event time (HH:MM):");
        const newEvent = {
            userId: accountId,
            title: eventTitle,
            date: eventDateTime.toISOString(),
            time: eventDateTime.format('HH:mm'),
            recurring: false,
            color: eventColor
        };

        try {
            const response = await fetch(`api/event/${accountId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    }

    return <React.Fragment>
        <Button variant="outlined" onClick={handleClickOpen}>
            Create New Event
        </Button>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="eventTitle"
                    name="eventTitle"
                    label="Event Title"
                    type="string"
                    fullWidth
                    variant="standard"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                />
                <div style={{margin: "10px 0"}}>
                    <DialogContentText>Choose a color:</DialogContentText>
                    <ColorPicker color={eventColor} onChangeComplete={setEventColor} />
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label={"Event Date and Time:"}
                        value={eventDateTime}
                        onChange={(newValue) => setEventDateTime(newValue)}
                    />
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={createEvent}>Create Event</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
}

function ColorPicker({ color, onChangeComplete }) {
    return (
        <CirclePicker color={color} onChangeComplete={(color) => onChangeComplete(color.hex)} />
    );
}