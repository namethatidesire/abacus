import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Chip,
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
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    {event.title}
                    <span style={{marginLeft: 10}}>
                        <UpdateEventDialog accountId={accountId} event={event} callback={updateCallback} />
                        <Button style={{marginLeft: 10}} onClick={deleteEvent} variant="outlined">Delete</Button>
                    </span>
                </DialogTitle>
                <DialogContent>
                    <Typography>{dayjs(event.date + event.time).format('dddd, MMM. D, YYYY h:mm A')}</Typography>
                    {event.endDate !== null && 
                        <Typography>{"to " + dayjs(event.endDate).format('dddd, MMM. D, YYYY h:mm A')}</Typography>}
                    {event.reminder !== "None" && <Typography>Reminder {event.reminder} before</Typography>}
                    {event.description && <Typography>Description: {event.description}</Typography>}

                    <div style={{ marginTop: 10 }}>
                        {event.tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag.name}
                                style={{ marginRight: 5}}
                            />
                        ))}
                    </div>
                    
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