import React, { useState } from "react";
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
    FormControl,
    Slider,
    Checkbox,
    FormControlLabel
} from "@mui/material";
import { CirclePicker } from "react-color";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Tags from "./tags";

export const BaseEventDialog = ({ open, onClose, title, eventData, setEventData, onSubmit, submitButtonText }) => {
    const [showExtraFields, setShowExtraFields] = useState(false);
    const [showActualTimeField, setShowActualTimeField] = useState(false);

    const handleTagsChange = (tags) => {
        const realTags = tags.map(tag =>
            typeof tag === "string" ? { name: tag, color: "#FF0000" } : tag
        );
        setEventData(prev => ({ ...prev, tags: realTags }));
    };

    const toggleExtraFields = () => {
        setShowExtraFields(prev => !prev);
    };

    const toggleActualTimeField = () => {
        setShowActualTimeField(prev => !prev);
    };

    const calculateEstimatedTime = (expectedTime, difficulty) => {
        return expectedTime * 1.1;
    };

    const estimateColour = (expectedTime) => {
        if (expectedTime < 1.2) {
            return "green";
        } else if (expectedTime < 1.5) {
            return "orange";
        } else {
            return "red";
        }
    }

    const handleNumberInputChange = (e, field) => {
        const value = e.target.value;
        if (value >= 0) {
            setEventData(prev => ({ ...prev, [field]: value }));
        }
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
                <div style={{ margin: "10px 0 20px 0" }}>
                    <DialogContentText>Choose a color:</DialogContentText>
                    <ColorPicker
                        color={eventData.color}
                        onChangeComplete={(color) => setEventData(prev => ({ ...prev, color }))}
                    />
                </div>
                <div style={{ margin: "10px 0" }}>
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
                    <FormControl margin="dense" sx={{ m: 1, minWidth: 120 }}>
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
                <Button onClick={toggleExtraFields}>
                    {showExtraFields ? "Hide Extra Fields" : "Estimate Task Completion"}
                </Button>
                {showExtraFields && (
                    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
                        <div style={{ margin: "10px 0", padding: "10px" }}>
                            <DialogContentText>Difficulty:</DialogContentText>
                            <Slider
                                value={eventData.difficulty || 3}
                                min={1}
                                max={5}
                                step={1}
                                marks={[
                                    { value: 1, label: 'Easy' },
                                    { value: 3, label: 'Medium' },
                                    { value: 5, label: 'Hard' }
                                ]}
                                onChange={(e, newValue) => setEventData(prev => ({ ...prev, difficulty: newValue }))}
                            />
                        </div>
                        <TextField
                            label="Expected Time to Complete (hours)"
                            margin="dense"
                            type="number"
                            fullWidth
                            value={eventData.expectedTime || ''}
                            onChange={(e) => handleNumberInputChange(e, 'expectedTime')}
                        />
                        <DialogContentText
                            style={{
                                fontSize: "1.2em",
                                fontWeight: "bold",
                                color: calculateEstimatedTime(eventData.expectedTime || 0, eventData.difficulty || 3) < (eventData.expectedTime || 0) * 1.2 ? estimateColour(eventData.expectedTime) : "black"
                            }}
                        >
                            Estimated Time to Complete: {calculateEstimatedTime(eventData.expectedTime || 0, eventData.difficulty || 3)} hours
                        </DialogContentText>
                        <FormControlLabel
                            control={<Checkbox checked={showActualTimeField} onChange={toggleActualTimeField} />}
                            label="Task Complete"
                        />
                        {showActualTimeField && (
                            <TextField
                                label="Completion Time (hours)"
                                margin="dense"
                                type="number"
                                fullWidth
                                value={eventData.actualTime || ''}
                                onChange={(e) => handleNumberInputChange(e, 'actualTime')}
                            />
                        )}
                    </div>
                )}
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