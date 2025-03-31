import React from "react";
import { CirclePicker } from "react-color";
import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";

export const BaseCourseDialog = ({open, onClose, title, courseData, setCourseData, onSubmit, submitButtonText}) => {

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