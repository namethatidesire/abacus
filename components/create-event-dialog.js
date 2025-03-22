import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Select,
    TextField,
    MenuItem, InputLabel, FormControl
} from "@mui/material";
import {CirclePicker} from "react-color";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Description } from "@mui/icons-material";

// @param props: accountId, callback
// accountId: the id of the user creating the event
// callback: a function to call after creating the event (e.g. to update the calendar)
export default function CreateEventDialog(props) {
    const [open, setOpen] = React.useState(false);
    const [eventColor, setEventColor] = React.useState('#FF0000');
    const [eventTitle, setEventTitle] = React.useState('');
    const [eventDateTime, setEventDateTime] = React.useState(dayjs());
    const [eventEndDateTime, setEventEndDateTime] = React.useState(dayjs());
    const [eventDescription, setEventDescription] = React.useState('');
    const [eventRecurring, setEventRecurring] = React.useState('None');
    const [eventReminder, setEventReminder] = React.useState('None');

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

        const newEvent = {
            userId: accountId,
            title: eventTitle,
            date: eventDateTime.toISOString(),
            time: eventDateTime.format('HH:mm'),
            recurring: eventRecurring,
            color: eventColor, 
            description: eventDescription,
            endDate: eventEndDateTime.toISOString(),
            type: "EVENT",
            reminder: eventReminder
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
                <div style={{margin: "10px 0 20px 0"}}>
                    <DialogContentText>Choose a color:</DialogContentText>
                    <ColorPicker color={eventColor} onChangeComplete={setEventColor} />
                </div>
                <div style={{margin: "10px 0"}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label={"Event Start Time:"}
                            value={eventDateTime}
                            onChange={(newValue) => setEventDateTime(newValue)}
                        />
                        <DateTimePicker
                            label={"Event End Time:"}
                            value={eventEndDateTime}
                            onChange={(newValue) => setEventEndDateTime(newValue)}
                        />
                    </LocalizationProvider>
                </div>
                <TextField
                    label="Description (optional)"
                    margin="dense"
                    multiline
                    fullWidth
                    onChange={(e) => setEventDescription(e.target.value)}
                />
                <div>
                    {/*<FormControl margin="dense" sx={{m:1, minWidth: 120}}>
                        <InputLabel id="recurring-select-label">Recurring</InputLabel>
                        <Select
                            variant="outlined"
                            label="Recurring"
                            labelId="recurring-select-label"
                            value={eventRecurring}
                            onChange={(e) => setEventRecurring(e.target.value)}
                        >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="Daily">Daily</MenuItem>
                            <MenuItem value="Weekly">Weekly</MenuItem>
                            <MenuItem value="Monthly">Monthly</MenuItem>
                            <MenuItem value="Yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>*/}
                    <FormControl margin="dense" sx={{m:1, minWidth: 120}}>
                        <InputLabel id="reminder-select-label">Reminder</InputLabel>
                        <Select
                            variant="outlined"
                            label="Reminder"
                            labelId="reminder-select-label"
                            value={eventReminder}
                            onChange={(e) => setEventReminder(e.target.value)}
                        >
                            <MenuItem value="None">None</MenuItem>
                            <MenuItem value="5 minutes">5 minutes</MenuItem>
                            <MenuItem value="15 minutes">15 minutes</MenuItem>
                            <MenuItem value="30 minutes">30 minutes</MenuItem>
                            <MenuItem value="1 hour">1 hour</MenuItem>
                            <MenuItem value="1 day">1 day</MenuItem>
                            <MenuItem value="1 week">1 week</MenuItem>
                        </Select>
                    </FormControl>
                </div>
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