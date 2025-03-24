import React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Select,
    TextField,
    MenuItem,
    InputLabel,
    FormControl
} from "@mui/material";
import {CirclePicker} from "react-color";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Tags from "./tags";

export const BaseEventDialog = ({open, onClose, title, eventData, setEventData, onSubmit, submitButtonText}) => {
    const handleTagsChange = (tags) => {
        const realTags = tags.map(tag =>
            typeof tag === "string" ? { name: tag, color: "#FF0000" } : tag
        );
        setEventData(prev => ({ ...prev, tags: realTags }));
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
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
                    value={eventData.title}
                    onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                />
                <div style={{margin: "10px 0 20px 0"}}>
                    <DialogContentText>Choose a color:</DialogContentText>
                    <ColorPicker
                        color={eventData.color}
                        onChangeComplete={(color) => setEventData(prev => ({ ...prev, color }))}
                    />
                </div>
                <div style={{margin: "10px 0"}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Event Start Time:"
                            value={eventData.startDateTime}
                            onChange={(newValue) => setEventData(prev => ({ ...prev, startDateTime: newValue }))}
                        />
                        <DateTimePicker
                            label="Event End Time:"
                            value={eventData.endDateTime}
                            onChange={(newValue) => setEventData(prev => ({ ...prev, endDateTime: newValue }))}
                        />
                    </LocalizationProvider>
                </div>
                <TextField
                    label="Description (optional)"
                    margin="dense"
                    multiline
                    fullWidth
                    value={eventData.description}
                    onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                />
                <div>
                    <FormControl margin="dense" sx={{m:1, minWidth: 120}}>
                        <InputLabel id="reminder-select-label">Reminder</InputLabel>
                        <Select
                            variant="outlined"
                            label="Reminder"
                            labelId="reminder-select-label"
                            value={eventData.reminder}
                            onChange={(e) => setEventData(prev => ({ ...prev, reminder: e.target.value }))}
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
                    <Tags value={eventData.tags} onChange={handleTagsChange} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>{submitButtonText}</Button>
            </DialogActions>
        </Dialog>
    );
};

function ColorPicker({ color, onChangeComplete }) {
    return (
        <CirclePicker color={color} onChangeComplete={(color) => onChangeComplete(color.hex)} />
    );
}