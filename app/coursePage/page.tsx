'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import {Button, Card, CardActions, CardContent, Chip, Container, Divider, Typography} from '@mui/material';
import CreateCourseDialog from "@/components/create-course-dialog";
import {Crimson_Pro} from "next/font/google";
import UpdateCourseDialog from "@/components/update-course-dialog";
import dayjs from 'dayjs';
import {Grid} from "@mui/material";

interface Course {
  id: string;
  name: string;
  tag: string;
  colour: string;
  events: Array<{ id: string; title: string; date: string }>;
}

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

const CoursePage = () => {
  const [message, setMessage] = useState('');
  const [openCreateCourseDialog, setOpenCreateCourseDialog] = useState(false);
  const [openUpdateCourseDialog, setOpenUpdateCourseDialog] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // State to store the user ID

  // Fetch user ID and verify token
  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('Missing token. Please log in again.');
      window.location.href = '/login'; // Redirect to login page
      return;
    }

    try {
      const response = await fetch(`api/account/authorize`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log(data);
      if (data.status === 200) {
        const { userId } = data.decoded;
        setUserId(userId); // Set the user ID in state
      } else {
        alert('Invalid token. Please log in again.');
        window.location.href = '/login'; // Redirect to login page
      }
    } catch (error) {
      alert('Error verifying token. Please log in again.');
      window.location.href = '/login'; // Redirect to login page
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/course_page?userId=${userId}`);
      if (response.status === 200) {
        const data = await response.json();
        setCourses(data);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        setMessage(errorData.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  // Fetch courses for the user
  useEffect(() => {
    if (!userId) return; // Wait until userId is set
    fetchCourses();
  }, [userId]); // Depend on userId to refetch courses when it changes

  const deleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/course_page?id=${courseId}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        setMessage('Course deleted successfully!');
        setCourses(courses.filter(course => course.id !== courseId)); // Remove the deleted course from the list
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        setMessage(errorData.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  // Render the page
  return (
    <div>
      <Navbar />
      <Container maxWidth="lg">
        <Typography
            variant="h3"
            className="title"
            sx={{
              fontFamily: crimsonPro.style.fontFamily,
              fontWeight: 600,
              color: 'black'
            }}
        >Courses</Typography>
        {message && <p style={{color:'black'}}>{message}</p>}
        {/* Creating each course */}
        <Grid container spacing={2}>
          {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: `2px solid ${course.colour}`
                    }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2">
                      {course.name}
                    </Typography>
                    <Chip label={course.tag}/><br/>
                    {course.events.map((event) => (
                        <React.Fragment key={event.id}>
                          <Divider sx={{marginTop: "5px"}}/>
                          <Typography variant="caption" sx={{ color: 'text.secondary'}}>
                            {dayjs(event.date).format('dddd, MMM. D, YYYY h:mm A')}
                          </Typography>
                          <Typography variant="body1">{event.title}</Typography>
                        </React.Fragment>
                    ))}
                    <Divider sx={{marginTop: "5px"}}/>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => setOpenUpdateCourseDialog(course.id)}>Edit</Button>
                    <Button size="small" onClick={() => deleteCourse(course.id)}>Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
          ))}
        </Grid>
        <br />
        <CreateCourseDialog
            userId={userId}
            open={openCreateCourseDialog}
            setOpen={() => setOpenCreateCourseDialog(true)}
            onClose={() => setOpenCreateCourseDialog(false)}
            successCallback={() => {
              fetchCourses();
              setMessage('Course created successfully!');
            }}
            errorCallback={(error: string) => setMessage(error)}
        />
      </Container>
      {openUpdateCourseDialog && (
          <UpdateCourseDialog
              course={courses.find(c => c.id === openUpdateCourseDialog)!}
              open={true}
              setOpen={() => {}}
              onClose={() => setOpenUpdateCourseDialog(null)}
              successCallback={() => {
                fetchCourses();
                setMessage('Course updated successfully!');
              }}
              errorCallback={(error: string) => setMessage(error)}
          />
      )}
    </div>
  );
};

export default CoursePage;