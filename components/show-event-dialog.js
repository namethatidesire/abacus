import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Select,
    TextField,
    MenuItem, InputLabel, FormControl,
    Typography,
} from "@mui/material";
import dayjs from "dayjs";
import UpdateEventDialog from "@/components/update-event-dialog";

export default function ShowEventDialog({
    event, 
    accountId, 
    updateCallback, 
    children, 
    hasConflict, 
    conflictingEvents,
    onAcknowledgeConflict
}) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAcknowledgeConflict = () => {
        onAcknowledgeConflict();
        // Don't close the dialog
    };

    const deleteEvent = async () => {
        try {
            await fetch(`/api/event/${accountId}?id=${event.id}`, {method: 'DELETE'});
            updateCallback();
            handleClose();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }

    return (
        <React.Fragment>
            <div onClick={handleClickOpen}>
                {children}
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {event.title}
                    <UpdateEventDialog accountId={accountId} event={event} callback={updateCallback} />
                    <Button onClick={deleteEvent} variant="outlined">Delete</Button>
                </DialogTitle>
                <DialogContent>
                    <Typography>{dayjs(event.date + event.time).format('dddd, MMM. D, YYYY h:mm A')}</Typography>
                    {event.endDate !== null && 
                        <Typography>{"to " + dayjs(event.endDate).format('dddd, MMM. D, YYYY h:mm A')}</Typography>}
                    {event.description && <Typography>Description: {event.description}</Typography>}
                    
                    {/* Add conflict warning and acknowledgment */}
                    {hasConflict && (
                        <>
                            <DialogContentText sx={{ color: 'error.main', mt: 2 }}>
                                <Typography variant="subtitle1" color="error">
                                    ⚠️ This event conflicts with:
                                </Typography>
                                {conflictingEvents.map((conflictEvent, index) => (
                                    <Typography key={index} variant="body2" sx={{ ml: 2 }}>
                                        • {conflictEvent.title} ({conflictEvent.time})
                                    </Typography>
                                ))}
                            </DialogContentText>
                            <Button 
                                onClick={handleAcknowledgeConflict}
                                color="warning"
                                sx={{ mt: 1 }}
                            >
                                Acknowledge Conflicts
                            </Button>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}