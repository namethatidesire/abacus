import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
import {CirclePicker} from "react-color";
import dayjs from "dayjs";
import { prisma } from "@/utils/db";
import Tags from "./tags"; // Import the Tags component

export default function SearchFilterEventDialog(accountId) {
    const [open, setOpen] = React.useState(false);
    const [eventTitle, setEventTitle] = React.useState('');
    //const [eventDateTime, setEventDateTime] = React.useState(dayjs());
    const [eventTags, setEventTags] = React.useState([]);
    const [eventType, setEventType] = React.useState('EVENT');
    const [filterOR, setAndOr] = React.useState(false); //Filter OR on tags. By default should be false.
    const [events, setEvents] = React.useState([]); // Add state for events
    //let accountId = props.accountId;

    // Removed hardcoded userTags array

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTagChange = (newTags) => {
        setEventTags(newTags);
    };

    const handleTypeChange = (event) => {
        setEventType(event.target.value);
    };

    const handleAndOr = (event) => {
        setAndOr(event.target.value === "true");
    };

     // Function to search for events
     const searchFilterEvent = async () => {
         try {
             const token = sessionStorage.getItem('token');
             let userId;

             // For JWT tokens
             const payload = JSON.parse(atob(token.split('.')[1]));
             userId = payload.userId || payload.sub; // 'sub' is commonly used for user IDs in JWTs

             if (!userId) {
               throw new Error('User ID not found in token');
             }

             // Extract tag names for the API request
             const tagNames = eventTags.map(tag => typeof tag === 'string' ? tag : tag.name);

             const response = await fetch(`http://localhost:3000/api/tag/search`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 "userId": userId, 
                 "eventTitle": eventTitle, 
                 "eventType": eventType,
                 "eventTags": tagNames, 
                 "filterOR": filterOR 
               }),
             });

             const foundEvents = await response.json();
             setEvents(foundEvents); // Set the events in state
             setEventTitle('');
         }
         catch (error) {
            console.error('Error searching for event:', error);
         }
     }


    return <React.Fragment>
        <Button variant="outlined" onClick={handleClickOpen}>
            Search/Filter Events
        </Button>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Search/Filter Events</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
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

                <FormControl fullWidth margin="dense">
                    <InputLabel id="eventTypeLabel">Event Type</InputLabel>
                    <Select
                        labelId="eventTypeLabel"
                        id="eventType"
                        value={eventType}
                        label="Event Type"
                        onChange={handleTypeChange}
                    >
                        <MenuItem value="EVENT">Event</MenuItem>
                        <MenuItem value="TASK">Task</MenuItem>
                    </Select>
                </FormControl>

                {/* Replace hardcoded tags with the Tags component */}
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <Tags 
                        value={eventTags} 
                        onChange={handleTagChange}
                    />
                </div>

                <FormControl>
                  <FormLabel id="filter-and-or-radio-buttons-group">Tag Filtering Behaviour</FormLabel>
                  <RadioGroup
                    aria-labelledby="filter-and-or-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={filterOR.toString()}
                    onChange={handleAndOr}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="OR" />
                    <FormControlLabel value="false" control={<Radio />} label="AND" />
                  </RadioGroup>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={searchFilterEvent}>Search</Button>
            </DialogActions>
            {events.length > 0 && (
                <div style={{ padding: '0 24px 24px 24px' }}>
                    <h4>Search Results:</h4>
                    <ul>
                        {events.map((event) => (
                            <li key={event.id}>
                                {event.title} - {new Date(event.date).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Dialog>
    </React.Fragment>
}