import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const Scheduler = () => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Get user ID from token
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const id = payload.userId || payload.sub;
            
            if (!id) {
                throw new Error('User ID not found in token');
            }
            
            setUserId(id);
        } catch (tokenError) {
            console.error('Error parsing token:', tokenError);
            setError('Invalid authentication token. Please log in again.');
        }
    }, []); // This effect runs only once on mount

    useEffect(() => {
        // Only fetch courses when we have a userId
        if (userId) {
            fetchUserCourses();
        }
    }, [userId]); // This effect runs when userId changes

    const fetchUserCourses = async () => {
        try {
            setLoading(true);
            // Using the userId to fetch courses specific to this user
            const response = await fetch(`/api/course_page?userId=${userId || 'default-user'}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            
            const data = await response.json();
            setAvailableCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    const handleCreateStudyPlan = () => {
        if (!selectedCourse) {
            alert('Please select a course first');
            return;
        }
        // Here you would typically call an API to create the study plan
        // based on the selected course
        alert(`Study plan created for course: ${selectedCourse}`);
    };

    return (
        <Box sx={{ m: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px' }}>
            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <FormControl fullWidth>
                    <InputLabel id="course-select-label">Select Course</InputLabel>
                    <Select
                        labelId="course-select-label"
                        id="course-select"
                        value={selectedCourse}
                        label="Select Course"
                        onChange={handleCourseChange}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select a course
                        </MenuItem>
                        {availableCourses.length > 0 ? (
                            availableCourses.map((course) => (
                                <MenuItem 
                                    key={course.id} 
                                    value={course.id}
                                    sx={{ 
                                        borderLeft: `4px solid ${course.colour}`,
                                        paddingLeft: 2
                                    }}
                                >
                                    {course.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                No courses found
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
            )}
            
            <Button 
                onClick={handleCreateStudyPlan} 
                color="primary" 
                variant="contained"
                disabled={!selectedCourse}
                sx={{ mt: 2 }}
            >
                Create Study Plan
            </Button>
        </Box>
    );
};

export default Scheduler;