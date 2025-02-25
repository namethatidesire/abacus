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
    FormControl
} from "@mui/material";
import {CirclePicker} from "react-color";
import dayjs from "dayjs";
import prisma from '../utils/db.js'

export default function SearchFilterEventDialog(accountId) {
    const [open, setOpen] = React.useState(false);
    //const [eventTitle, setEventTitle] = React.useState('');
    //const [eventDateTime, setEventDateTime] = React.useState(dayjs());
    const [eventTags, setEventTags] = React.useState([]);
    const [eventType, setEventType] = React.useState('EVENT');
    const [filterOR, setAndOr] = React.useState(false); //Filter OR on tags. By default should be false.

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

    const handleAndOr = () => {
        setAndOr()
    };

     // Function to search for events
     const searchFilterEvent = async () => {
         try {
             if (filterOR) {
                   const events = await prisma.event.findMany({
                     where:  {
                       type: eventType,
                       tags: {
                        hasSome: eventTags,
                       },
                     },
                   });
                 }
             else { //FilterAND
                   const events = await prisma.event.findMany({
                      where:  {
                        type: eventType,
                        tags: {
                         hasEvery: eventTags,
                        },
                      },
                    });
             }
             //TODO: Display events
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
                //<TextField
                //    autoFocus
                //    required
                //    margin="dense"
                //    id="eventTitle"
                //    name="eventTitle"
                //    label="Event Title"
                //    type="string"
                //    fullWidth
                //    variant="standard"
                //    value={eventTitle}
                //    onChange={(e) => setEventTitle(e.target.value)}
                ///>

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
                    value={filterOR}
                    onChange={handleAndOr}
                  >
                    <FormControlLabel value=true control={<Radio />} label="AND" />
                    <FormControlLabel value=false control={<Radio />} label="OR" />
                  </RadioGroup>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={searchFilterEvent}>Create Event</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
}