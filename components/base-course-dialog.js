import React, { useState, useEffect } from "react";
import { CirclePicker } from "react-color";
import {
    Button,
    CircularProgress,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";

export const BaseCourseDialog = ({open, onClose, title, courseData, setCourseData, onSubmit, submitButtonText}) => {
    const [tagOpen, setTagOpen] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const handleTagOpen = () => {
        setTagOpen(true);
        (async () => {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/tag', {method: 'GET'});
            const tags = await response.json();
            setLoading(false);

            setOptions(tags);
        })();
    };

    const handleTagClose = () => {
        setTagOpen(false);
        setOptions([]);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="courseTitle"
                    name="courseTitle"
                    label="Course Title"
                    type="string"
                    fullWidth
                    variant="standard"
                    value={courseData.name}
                    onChange={(e) => setCourseData(prev => ({ ...prev, name: e.target.value }))}
                />
                <div style={{ margin: "10px 0 20px 0" }}>
                    <DialogContentText>Choose a color:</DialogContentText>
                    <ColorPicker
                        color={courseData.colour}
                        onChangeComplete={(colour) => setCourseData(prev => ({ ...prev, colour }))}
                    />
                </div>
                <TextField
                    margin="dense"
                    id="courseTag"
                    name="courseTag"
                    label="Course Tag"
                    type="string"
                    fullWidth
                    variant="standard"
                    value={courseData.tag}
                    onChange={(e) => setCourseData(prev => ({ ...prev, tag: e.target.value }))}
                    helperText="e.g., CSC301"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>{submitButtonText}</Button>
            </DialogActions>
        </Dialog>
    )
}

function ColorPicker({ color, onChangeComplete }) {
    return (
        <CirclePicker color={color} onChangeComplete={(color) => onChangeComplete(color.hex)} />
    );
}