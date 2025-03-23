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

export default function ShowEventDialog({event, accountId, updateCallback, children}) {
    const [open, setOpen] = React.useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return <React.Fragment>
        <div onClick={handleClickOpen}>
            {children}
        </div>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                {event.title}
                <UpdateEventDialog accountId={accountId} event={event} callback={updateCallback} />
            </DialogTitle>
            <DialogContent>
                <Typography>{dayjs(event.date + event.time).format('dddd, MMM. D, YYYY h:mm A')}</Typography>
                {event.endDate !== null ? <Typography>{"to " + dayjs(event.endDate).format('dddd, MMM. D, YYYY h:mm A') }</Typography> : ""}
                {/*event.recurring !== "None" ? <Typography>Repeats {event.recurring.toLowerCase()}</Typography> : ""*/}
                {event.reminder !== "None" ? <Typography>Reminder {event.reminder} before</Typography> : ""}
                {event.description ? <Typography>Description: {event.description}</Typography> : ""}
            </DialogContent>
        </Dialog>
    </React.Fragment>
}