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
    Box,
    CircularProgress
} from "@mui/material";


export default function ManageCalendarDialog(props) {
    const [open, setOpen] = useState(false);
    const [calendars, setCalendars] = useState([]);
    const [newCalendarName, setNewCalendarName] = useState('');
	const [newCalendarDesc, setNewCalendarDesc] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [selectedCalendar, setSelectedCalendar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [shareUsername, setShareUsername] = useState('');

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
                body: JSON.stringify({ accountId, query: "all" })
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
            setIsLoading(true);
            try {
                const fetchedCalendars = await allCalendars();
                setCalendars(fetchedCalendars || []);
            } catch (error) {
                console.error('Error fetching calendars:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCalendars();
    }, [accountId]); // Add accountId as dependency since it's used in allCalendars

    const handleAddCalendar = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: accountId,
                    query: "create",
                    name: newCalendarName,
                    description: newCalendarDesc
                })
            });
            const result = await response.json();
			const updatedCalendars = await allCalendars();
			setCalendars(updatedCalendars);
			setNewCalendarName('');
			setNewCalendarDesc('');
        } catch (error) {
            console.error('Error adding calendar:', error);
        }
    };

    const handleDeleteCalendar = async (calendarId) => {
        try {
            const calendarToDelete = calendars.find(cal => cal.id === calendarId);
            if (calendarToDelete?.main === true) {
                console.error('Cannot delete main calendar');
                return;
            }

            const response = await fetch('http://localhost:3000/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: accountId,
                    query: "delete",
                    calendarId: calendarId
                })
            });
            const result = await response.json();
            
            // If deleting current calendar, switch to main calendar
            if (calendarId === currentCalendarId) {
                const mainCalendar = calendars.find(cal => cal.main === true);
                if (mainCalendar) {
                    props.onCalendarChange(mainCalendar.id);
                }
            }

            const updatedCalendars = await allCalendars();
            setCalendars(updatedCalendars);
        } catch (error) {
            console.error('Error deleting calendar:', error);
        }
    };

    const handleUpdateCalendar = async (calendarId) => {
        try {
            // Update calendar details
            const response = await fetch('http://localhost:3000/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId,
                    query: "update",
                    calendarId: calendarId,
                    name: selectedCalendar.name,
                    description: selectedCalendar.description
                })
            });
            const result = await response.json();

            // If there's a share email, handle sharing
            if (shareUsername) {
                await handleShareCalendar(calendarId, shareUsername);
                setShareUsername('');
            }

            setEditMode(false);
            const updatedCalendars = await allCalendars();
            setCalendars(updatedCalendars);
            setSelectedCalendar(null);
        } catch (error) {
            console.error('Error updating calendar:', error);
        }
    };

    const handleShareCalendar = async (calendarId, shareUsername) => {
        const response = await fetch('http://localhost:3000/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accountId: accountId,
                query: "share",
                calendarId: calendarId,
                username: shareUsername
            })
        });
        return await response.json();
    };

    // Add this new handler function
    const handleRemoveShare = async (calendarId, username) => {
        try {
            const response = await fetch('http://localhost:3000/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: accountId,
                    query: "unshare",
                    calendarId: calendarId,
                    username: username
                })
            });
            const result = await response.json();
			const updatedCalendars = await allCalendars();
			setCalendars(updatedCalendars);
			// Update the selected calendar with new user list
			const updatedCalendar = updatedCalendars.find(cal => cal.id === selectedCalendar.id);
			setSelectedCalendar(updatedCalendar);
        } catch (error) {
            console.error('Error removing share:', error);
        }
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
                    
                    {/* Loading indicator */}
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        // List existing calendars, with main calendar first
                        Array.isArray(calendars) && 
                        [...calendars]
                            .sort((a, b) => {
                                if (a.main === b.main) return 0;
                                return a.main ? -1 : 1;
                            })
                            .map((calendar) => (
                                <div key={calendar.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                                    <div style={{ 
                                        width: '20px', 
                                        height: '20px', 
                                        marginRight: '10px' 
                                    }}></div>
                                    <Typography style={{ flexGrow: 1 }}>
                                        {calendar.name} {calendar.main && "(Default)"} {calendar.ownerId !== accountId && "(Shared)"}
                                    </Typography>
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
                                        disabled={calendar.ownerId !== accountId}
                                        title={calendar.ownerId !== accountId ? "You cannot edit shared calendars" : "Edit calendar"}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error"
                                        onClick={() => handleDeleteCalendar(calendar.id)}
                                        disabled={calendar.main === true || calendar.ownerId !== accountId}
                                        title={
                                            calendar.main ? "Main calendar cannot be deleted" : 
                                            calendar.ownerId !== accountId ? "You cannot delete shared calendars" : 
                                            "Delete calendar"
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))
                    )}

                    {/* Add new calendar section */}
                    <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                        <Typography variant="h6">Add New Calendar</Typography>
                        <TextField
                            fullWidth
                            label="Name"
                            value={newCalendarName}
                            onChange={(e) => setNewCalendarName(e.target.value)}
                            margin="normal"
                        />
						<TextField
                            fullWidth
                            label="Description"
                            value={newCalendarDesc}
                            onChange={(e) => setNewCalendarDesc(e.target.value)}
                            margin="normal"
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
                        label="Name"
                        value={selectedCalendar?.name || ''}
                        onChange={(e) => setSelectedCalendar({...selectedCalendar, name: e.target.value})}
                        margin="normal"
                    />
					<TextField
                        fullWidth
                        label="Description"
                        value={selectedCalendar?.description || ''}
                        onChange={(e) => setSelectedCalendar({...selectedCalendar, description: e.target.value})}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Share with (username)"
                        value={shareUsername}
                        onChange={(e) => setShareUsername(e.target.value)}
                        margin="normal"
                    />
                    
                    {/* Shared Users List */}
                    {selectedCalendar?.users && selectedCalendar.users.length > 1 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Shared with:
                            </Typography>
                            {selectedCalendar.users
                                .filter(user => user.id !== accountId)
                                .map(user => (
                                    <Box 
                                        key={user.id} 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            mb: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: 'background.paper',
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {user.username}
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveShare(selectedCalendar.id, user.username)}
                                            sx={{ minWidth: 'auto', p: 0.5 }}
                                        >
                                            ×
                                        </Button>
                                    </Box>
                                ))}
                        </Box>
                    )}
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
