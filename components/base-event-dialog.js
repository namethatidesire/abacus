import React, { useState, useEffect } from "react";
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
    FormControlLabel,
    Alert
} from "@mui/material";
import { CirclePicker } from "react-color";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Tags from "./tags";

export const BaseEventDialog = ({ open, onClose, title, eventData, setEventData, onSubmit, submitButtonText }) => {
    const [showExtraFields, setShowExtraFields] = useState(eventData.task);
    const [showCompletionTimeField, setShowCompletionTimeField] = useState(eventData.completed);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            console.log(eventData);
            if (eventData.task) {
                setShowExtraFields(eventData.task);
                if (eventData.completed){
                    setShowCompletionTimeField(eventData.completed);
                }else{
                    setShowCompletionTimeField(false)
                }
            }else{
                setShowExtraFields(false);
                setShowCompletionTimeField(false);
            }
            updateEstimatedTime();
        }else{
            setEstimatedTime(null);
            setShowExtraFields(false);
            setShowCompletionTimeField(false);
        }
    }, [open]);    

    const handleTagsChange = (tags) => {
        const realTags = tags.map(tag =>
            typeof tag === "string" ? { name: tag, color: "#FF0000" } : tag
        );
        setEventData(prev => ({ ...prev, tags: realTags }));
    };

    const toggleExtraFields = () => {
        setShowExtraFields(prev => !prev);
    };

    const toggleCompletionTimeField = () => {
        setShowCompletionTimeField(prev => !prev);
    };

    const calculateEstimatedTime = async (expectedTime, difficulty, accountId) => {
        try {
            const response = await fetch(`api/taskEstimate/${accountId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                const multiplierKey = `multiplier${difficulty}`;
                const dividerKey = `divider${difficulty}`;
                const multiplier = parseFloat(data[multiplierKey]);
                const divider = parseFloat(data[dividerKey]);
                let estimate;
                if (divider === 0) {
                    estimate = parseFloat(expectedTime).toFixed(2);
                }else{
                    estimate = (parseFloat(expectedTime) * multiplier / divider).toFixed(2);
                }
                return estimate;
            }
        } catch (error) {
            console.error(error.stack);
        }
    };

    const hoursAndMinutes = (time) => {
        if (time === null || time === undefined) return "Calculating...";
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);
        return `${hours}hours ${minutes}minutes`;
    };

    const estimateColour = (expectedTime) => {
        if (estimatedTime <= expectedTime * 1.2) {
            return "green";
        } else if (estimatedTime <= expectedTime * 1.5) {
            return "orange";
        } else {
            return "red";
        }
    }

    const handleNumberInputChange = (e, field) => {
        const value = e.target.value;
        if (value > 0) {
            setEventData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleTaskCompletion = async () => {
        if (showCompletionTimeField && eventData.completionTime > 0) {
            try {
                const newRatio = (parseFloat(eventData.completionTime) / parseFloat(eventData.expectedTime)).toFixed(2);
                const response = await fetch(`/api/taskEstimate/${eventData.userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        difficulty: eventData.difficulty,
                        newRatio: newRatio
                    }),
                });

                if (!response.ok) {
                    console.error('Failed to update task completion time');
                }
            } catch (error) {
                console.error(error.stack);
            }
        }
    };

    const handleSubmit = async () => {
        if(showExtraFields && eventData.expectedTime > 0){
            eventData.task = true;
            if(showCompletionTimeField && eventData.completionTime > 0){
                eventData.completed = true;
            }else{
                eventData.completed = false;
            }
        }else{
            eventData.task = false;
            eventData.completed = false;
        }

        await handleTaskCompletion();
        onSubmit();
    };
    
    const updateEstimatedTime = async () => {
        if (eventData.expectedTime && eventData.difficulty && eventData.userId) {
            const estimatedTime = await calculateEstimatedTime(eventData.expectedTime, eventData.difficulty, eventData.userId);
            setEstimatedTime(estimatedTime);
        }
    };

    useEffect(() => {
        updateEstimatedTime();
    }, [eventData.expectedTime, eventData.difficulty]);

    useEffect(() => {
        if (eventData.task) {
            setEventData(prev => ({ ...prev, difficulty: eventData.difficulty || 3 }));
            setEventData(prev => ({ ...prev, expectedTime: eventData.expectedTime || undefined }));
        }else{
            setEventData(prev => ({ ...prev, difficulty: null }));
            setEventData(prev => ({ ...prev, expectedTime: null }));
        }
    }, [showExtraFields]);

    useEffect(() => {
        if (eventData.completed) {
            setEventData(prev => ({ ...prev, completionTime: eventData.completionTime || undefined }));
        }else{
            setEventData(prev => ({ ...prev, completionTime: null }));
        }
    }, [showCompletionTimeField]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                { error !== "" && <Alert severity="error">{error}</Alert> }
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
                    <FormControl margin="dense" sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="type-select-label">Type</InputLabel>
                        <Select
                            variant="outlined"
                            label="Type"
                            labelId="type-select-label"
                            value={eventData.type}
                            onChange={(e) => setEventData(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <MenuItem value="TASK">Task</MenuItem>
                            <MenuItem value="EVENT">Event</MenuItem>
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
                            label={"Expected Time to Complete (hours)"}
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
                                color: estimateColour(eventData.expectedTime)
                            }}
                        >
                            Estimated Time to Complete: {hoursAndMinutes(estimatedTime)}
                        </DialogContentText>
                        <FormControlLabel
                            control={<Checkbox checked={showCompletionTimeField} onChange={toggleCompletionTimeField} />}
                            label="Task Complete"
                        />
                        {showCompletionTimeField && (
                            <TextField
                                label="Completion Time (hours)"
                                margin="dense"
                                type="number"
                                fullWidth
                                value={eventData.completionTime || ''}
                                onChange={(e) => handleNumberInputChange(e, 'completionTime')}
                            />
                        )}
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={() => {
                    if (!eventData.title?.trim()) {
                        setError("Please enter a title");
                        return;
                    }
                    setError("");
                    handleSubmit();
                }}>
                    {submitButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

function ColorPicker({ color, onChangeComplete }) {
    return (
        <CirclePicker color={color} onChangeComplete={(color) => onChangeComplete(color.hex)} />
    );
}