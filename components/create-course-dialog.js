import React from "react";
import { Button } from "@mui/material";
import { BaseCourseDialog } from "./base-course-dialog";

export default function CreateCourseDialog(props) {
    const { userId, open, setOpen, onClose, successCallback, errorCallback } = props;
    const [alert, setAlert] = React.useState(null);

    const [courseData, setCourseData] = React.useState({
        name: '',
        colour: '#777777',
        tag: '',
    });

    const handleClose = () => {
        onClose();
    };

    const createCourse = async () => {
        if (!userId) {
            errorCallback('User ID is required');
            return;
        }

        const newCourse = {
            userId: userId,
            name: courseData.name,
            colour: courseData.colour,
            tag: typeof courseData.tag === 'string' ? courseData.tag : courseData.tag.name
        };

        try {
            const response = await fetch('/api/course_page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCourse)
            });
            if (!response.ok) {
                setAlert({severity: 'error', message: 'Error creating course: ' + await response.json().then(data => data.message)});
            } else {
                successCallback();
                handleClose();
            }
        } catch (e) {
            console.log('Error creating course', e);
            setAlert({severity: 'error', message: 'Error creating course: ' + e.message});
        }
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={() => setOpen()}>Create Course</Button>
            <BaseCourseDialog
                open={open}
                courseData={courseData}
                setCourseData={setCourseData}
                onClose={handleClose}
                onSubmit={createCourse}
                submitButtonText="Create Course"
                title="Create Course"
                alert={alert}
            />
        </React.Fragment>
    );
}