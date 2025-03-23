import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar'; 
import styles from './coursepage.module.css';

interface Course {
  id: string;
  name: string;
  tag: string;
  colour: string;
  events: Array<{ id: string; title: string; date: string }>;
}

const CoursePage = () => {
  const [message, setMessage] = useState('');
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // State to store the user ID

  // Fetch user ID and verify token
  useEffect(() => {
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

    fetchUserId();
  }, []);

  // Fetch courses for the user
  useEffect(() => {
    if (!userId) return; // Wait until userId is set

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

    fetchCourses();
  }, [userId]); // Depend on userId to refetch courses when it changes

  // Create a new course
  const createCourse = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const name = prompt("Enter course name:");
    const tag = prompt("Enter course tag (e.g., CSC301):");
    const colour = prompt("Enter colour (e.g., #FF0000):");

    try {
      const response = await fetch(`http://localhost:3000/api/course_page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag, colour, userId }),
      });

      if (response.status === 201) {
        const data: Course = await response.json();
        console.log(data);
        setMessage('Course created successfully!');
        setCreatedCourse(data); // Update the state with the newly created course
        setCourses([...courses, { ...data, events: [] }]); // Add the new course to the list of courses
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
      <h1>Courses</h1>
      {message && <p>{message}</p>}
      {/* Creating each course */}
      {courses.map((course) => (
        <details className={styles.details} key={course.id} >
          {/* Title of course dropdown */}
          <summary className={styles.summary} style={{ background: course.colour }}>{course.name}</summary>
          {/* Body of course dropdown */}
          <article className={styles.article}>
            {/* Event information */}
            <ul>
              {course.events.map((event) => (
                <li key={event.id}>{event.title} - {event.date}</li>
              ))}
            </ul>
            {/* Delete course button */}
            <button onClick={() => deleteCourse(course.id)}>Delete Course</button>
          </article>
        </details>
      ))}
      <button onClick={createCourse}>Create Course</button>
    </div>
  );
};

export default CoursePage;