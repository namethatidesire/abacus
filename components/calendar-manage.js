import React, { use, useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
    Box
} from "@mui/material";
import {CirclePicker} from "react-color";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Description } from "@mui/icons-material";

export default function ManageCalendarDialog(props) {
    const [open, setOpen] = useState(false);
    const [calendars, setCalendars] = useState([]);
    const [newCalendarName, setNewCalendarName] = useState('');
    const [newCalendarColor, setNewCalendarColor] = useState('#2196f3');
    const [editMode, setEditMode] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState(null);

    const accountId = props.accountId;
    const currentCalendarId = props.calendarId;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

	const allCalendars = async() => {
        try {
            const getAllCalendars = await fetch(`http://localhost:3000/api/calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: accountId, query: "all" })
            });
            const data = await getAllCalendars.json();
            return data.calendars || [];
        } catch (error) {
            console.error('Error fetching calendars:', error);
            return [];
        }
    };

	useEffect(() => {
        const fetchCalendars = async () => {
            const fetchedCalendars = await allCalendars();
            setCalendars(fetchedCalendars || []);
        };
        
        fetchCalendars();
    }, [accountId]); // Add accountId as dependency since it's used in allCalendars

    const handleAddCalendar = async () => {
        const response = await fetch('http://localhost:3000/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: accountId,
                query: "create",
                name: newCalendarName,
                color: newCalendarColor
            })
        });
        const result = await response.json();
        if (result.success) {
            setCalendars(await allCalendars());
            setNewCalendarName('');
        }
    };

    const handleDeleteCalendar = async (calendarId) => {
        // Find the calendar to check if it's a main calendar
        const calendarToDelete = calendars.find(cal => cal.id === calendarId);
        if (calendarToDelete?.main === true) {
            console.error('Cannot delete main calendar');
            return;
        }

        const response = await fetch('http://localhost:3000/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: accountId,
                query: "delete",
                calendarId: calendarId
            })
        });
        const result = await response.json();
        if (result.success) {
            setCalendars(await allCalendars());
        }
    };

    const handleUpdateCalendar = async (calendarId) => {
        const response = await fetch('http://localhost:3000/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: accountId,
                query: "update",
                calendarId: calendarId,
                name: selectedCalendar.name,
                color: selectedCalendar.color
            })
        });
        const result = await response.json();
        if (result.success) {
            setCalendars(await allCalendars());
            setEditMode(false);
            setSelectedCalendar(null);
        }
    };

    const handleShareCalendar = async (calendarId, shareEmail) => {
        const response = await fetch('http://localhost:3000/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: accountId,
                query: "share",
                calendarId: calendarId,
                shareWith: shareEmail
            })
        });
        return await response.json();
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                Manage Calendars
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Manage Calendars</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select a calendar to view and manage events.
                    </DialogContentText>
                    
                    {/* List existing calendars */}
                    {Array.isArray(calendars) && calendars.map((calendar) => (
                        <div key={calendar.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                            <div style={{ 
                                width: '20px', 
                                height: '20px', 
                                backgroundColor: calendar.color, 
                                marginRight: '10px' 
                            }}></div>
                            <Typography style={{ flexGrow: 1 }}>{calendar.name}</Typography>
                            <Button 
                                variant="outlined" 
                                onClick={() => props.onCalendarChange(calendar.id)}
                                disabled={calendar.id === currentCalendarId}
                            >
                                Select
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => {
                                    setSelectedCalendar(calendar);
                                    setEditMode(true);
                                }}
                            >
                                Edit
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="error"
                                onClick={() => handleDeleteCalendar(calendar.id)}
                                disabled={calendar.main === true}
                                title={calendar.main ? "Main calendar cannot be deleted" : "Delete calendar"}
                            >
                                Delete
                            </Button>
                        </div>
                    ))}

                    {/* Add new calendar section */}
                    <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                        <Typography variant="h6">Add New Calendar</Typography>
                        <TextField
                            fullWidth
                            label="Calendar Name"
                            value={newCalendarName}
                            onChange={(e) => setNewCalendarName(e.target.value)}
                            margin="normal"
                        />
                        <CirclePicker
                            color={newCalendarColor}
                            onChangeComplete={(color) => setNewCalendarColor(color.hex)}
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleAddCalendar}
                            disabled={!newCalendarName}
                            sx={{ mt: 2 }}
                        >
                            Add Calendar
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Calendar Dialog */}
            <Dialog open={editMode} onClose={() => setEditMode(false)}>
                <DialogTitle>Edit Calendar</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Calendar Name"
                        value={selectedCalendar?.name || ''}
                        onChange={(e) => setSelectedCalendar({...selectedCalendar, name: e.target.value})}
                        margin="normal"
                    />
                    <CirclePicker
                        color={selectedCalendar?.color}
                        onChangeComplete={(color) => setSelectedCalendar({...selectedCalendar, color: color.hex})}
                    />
                    <TextField
                        fullWidth
                        label="Share with (email)"
                        margin="normal"
                        onChange={(e) => handleShareCalendar(selectedCalendar.id, e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditMode(false)}>Cancel</Button>
                    <Button onClick={() => handleUpdateCalendar(selectedCalendar.id)} color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
