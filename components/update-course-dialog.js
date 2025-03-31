import React from "react";
import { Button } from "@mui/material";
import { BaseCourseDialog } from "./base-course-dialog";

export default function UpdateCourseDialog(props) {
    const { course, open, setOpen, onClose, successCallback, errorCallback } = props;

    const [courseData, setCourseData] = React.useState({
        name: course.name,
        colour: course.colour,
        tag: course.tag,
    });

    const handleClose = () => {
        onClose();
    };

    const updateCourse = async () => {
        const updatedCourse = {
            id: course.id,
            name: courseData.name,
            colour: courseData.colour,
            tag: typeof courseData.tag === 'string' ? courseData.tag : courseData.tag.name
        };

        try {
            const response = await fetch('/api/course_page', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCourse)
            });
            if (!response.ok) {
                errorCallback('Error updating course: ' + await response.json().then(data => data.message));
            } else {
                successCallback();
            }
        } catch (e) {
            console.error('Error updating course', e);
            errorCallback('Error updating course: ' + e);
        }
        handleClose();
    }

    return (
        <BaseCourseDialog
            open={open}
            courseData={courseData}
            setCourseData={setCourseData}
            onClose={handleClose}
            onSubmit={updateCourse}
            submitButtonText="Update Course"
            title="Update Course"
        />
    );
}