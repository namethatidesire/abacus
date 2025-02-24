import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar'; 
import styles from './coursepage.module.css';

const CoursePage = () => {
  const [message, setMessage] = useState('');
  const [createdCourse, setCreatedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const userId = "1"; // Replace with actual user ID logic

  useEffect(() => {
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
  }, []);

  const createCourse = async (event) => {
    event.preventDefault();

    const name = prompt("Enter course name:");
    const tag = prompt("Enter course tag (e.g., CSC301):");

    try {
      const response = await fetch(`http://localhost:3000/api/course_page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag, userId }),
      });

      if (response.status === 201) {
        const data = await response.json();
        console.log(data);
        setMessage('Course created successfully!');
        setCreatedCourse(data); // Update the state with the newly created course
        setCourses([...courses, data]); // Add the new course to the list of courses
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

  return (
    <div>
      <Navbar />
      <h1>Courses</h1>
      <button onClick={createCourse}>Create Course</button>
      {message && <p>{message}</p>}
      {courses.map((course) => (
        <details className={styles.details} key={course.id}>
          <summary className={styles.summary}>{course.name}</summary>
          <article className={styles.article}>
            {/* SPECIFICALLY FOR DEBUGGING */}
            {/* <p>Tag: {course.tag}</p>  */}
            <p>Events:</p>
            <ul>
              {course.events.map((event) => (
                <li key={event.id}>{event.title} - {event.date}</li>
              ))}
            </ul>
          </article>
          
        </details>
      ))}
    </div>
  );
};

export default CoursePage;