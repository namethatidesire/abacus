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
    Chip,
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

export default function SearchFilterEventDialog(accountId) {
    const [open, setOpen] = React.useState(false);
    const [eventTitle, setEventTitle] = React.useState('');
    //const [eventDateTime, setEventDateTime] = React.useState(dayjs());
    const [eventTags, setEventTags] = React.useState([]);
    const [eventType, setEventType] = React.useState('EVENT');
    const [filterOR, setAndOr] = React.useState(false); //Filter OR on tags. By default should be false.
    const [events, setEvents] = React.useState([]); // Add state for events
    //let accountId = props.accountId;

    // Replace below line of code to fetch all of the logged in user's tags
    const userTags = ['CSC301', 'Personal', 'Work'];

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTagChange = (event) => {
        setEventTags(event.target.value);
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
             let foundEvents;
             if (filterOR) {
                   foundEvents = await prisma.event.findMany({
                     where:  {
                       userId: accountId,
                       title: {
                         contains: eventTitle
                       },
                       type: eventType,
                       tags: {
                        hasSome: eventTags,
                       },
                     },
                   });
                 }
             else { //FilterAND
                   foundEvents = await prisma.event.findMany({
                      where:  {
                         userId: accountId,
                         title: {
                           contains: eventTitle
                         },
                        type: eventType,
                        tags: {
                         hasEvery: eventTags,
                        },
                      },
                    });
             }
             setEvents(foundEvents); // Set the events in state
         } catch (error) {
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

                <FormControl fullWidth margin="dense">
                    <InputLabel id="eventTagsLabel">Tags</InputLabel>
                    <Select
                        labelId="eventTagsLabel"
                        id="eventTags"
                        multiple
                        value={eventTags}
                        onChange={handleTagChange}
                        renderValue={(selected) => (
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} style={{ margin: 2 }} />
                                ))}
                            </div>
                        )}
                    >
                        {userTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                                {tag}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

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