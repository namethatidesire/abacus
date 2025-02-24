import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar'; 
import styles from './coursepage.module.css';

const CoursePage = () => {
  const [message, setMessage] = useState('');
  const [createdCourse, setCreatedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const userId = "1"; // TODO: REPLACE WITH CORRECT USER ID LOGIC

  // Fetch courses for the user
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/course_page?userId=${userId}`); // TODO: REPLACE WITH CORRECT USER ID LOGIC
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

  // Create a new course
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

  const deleteCourse = async (courseId) => {
    // TODO: REPLACE WITH CORRECT USER ID LOGIC
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
        <details className={styles.details} key={course.id}>

          {/* Title of course dropdown */}
          <summary className={styles.summary}>{course.name}</summary>

          {/* Body of course dropdown */}
          <article className={styles.article}>

            {/* SPECIFICALLY FOR DEBUGGING */}
            {/* <p>Tag: {course.tag}</p>  */}

            {/* Event information */}
            {/* <p>Events:</p> */}
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