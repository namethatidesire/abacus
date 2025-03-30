'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

// Styled components
const UploadBox = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: '400px',
  border: '2px dashed',
  borderColor: theme.palette.grey[300],
  backgroundColor: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const SyllabusScanner = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [events, setEvents] = useState(null);
  const [isAddingEvents, setIsAddingEvents] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [accountId, setAccountId] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1976d2');
  
  // Predefined Material-UI colors
  const colors = {
    'Blue': '#1976d2',
    'Green': '#2e7d32',
    'Purple': '#7b1fa2',
    'Orange': '#ed6c02',
    'Red': '#d32f2f',
    'Teal': '#008080',
    'Pink': '#d81b60',
    'Brown': '#795548',
    'Gray': '#757575',
    'Deep Purple': '#673ab7'
  };
  
  // List of common university-wide terms that shouldn't include course name
  const universityWideTerms = [
    'drop deadline',
    'withdrawal',
    'enrollment',
    'registration',
    'academic holiday',
    'study break',
    'reading week',
    'final exam period',
    'semester start',
    'semester end'
  ];

  const isUniversityWideEvent = (title) => {
    return universityWideTerms.some(term => 
      title.toLowerCase().includes(term.toLowerCase())
    );
  };

  // useEffect(() => {
  //   const verifyToken = async () => {
  //     const token = sessionStorage.getItem('token');
  //     if (!token) {
  //       alert('Missing token. Please log in again.');
  //       // Redirect to login page Session expired
  //       window.location.href = '/login';
  //       return;
  //     }

  //     try {
  //       const response = await fetch(`http://localhost:3000/api/account/authorize`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });

  //       const data = await response.json();
  //       console.log(data);
  //       if (data.status === 200) {
  //         const { userId } = data.decoded;
  //         setAccountId(userId);
  //       } else {
  //         alert('Invalid token. Please log in again.');
  //         // Redirect to login page Session expired  
  //         window.location.href = '/login';
  //       }
  //     } catch (error) {
  //       alert('Error verifying token. Please log in again.');
  //       // Redirect to login page Session expired  
  //       window.location.href = '/login';
  //     }
  //   };

  //   verifyToken();
  // }, []);

  const handleAddAllEvents = useCallback(async () => {
    if (!events?.length || !courseName) {
      setError('Please enter a course name before adding events');
      setShowError(true);
      return;
    }
    
    const token = sessionStorage.getItem('token');
    let userId;
    try {
      // For JWT tokens
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId || payload.sub; // 'sub' is commonly used for user IDs in JWTs
      setAccountId(userId);
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (tokenError) {
      console.error('Error parsing token:', tokenError);
      throw new Error('Invalid authentication token. Please log in again.');
    }

    try {
      const getDefaultCalendar = await fetch(`http://localhost:3000/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: userId, query: "default" })
      });
      const defaultCalendar = await getDefaultCalendar.json();
      if (defaultCalendar) {
        // redirect to the default calendar page
        setCalendarId(defaultCalendar.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      window.location.href = '/login'; // Redirect to login page
    }

    setIsAddingEvents(true);
    setError('');
    setAddedCount(0);
    
    try {
      // First, ensure the course tag exists
      if (!isUniversityWideEvent(events[0].eventTitle)) {
        try {
          await fetch('/api/tag', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: courseName,
              color: selectedColor || '#1976d2'
            })
          });
        } catch (err) {
          console.error('Error creating tag:', err);
          // Continue anyway, the API might return an error if the tag already exists
        }
      }
      
      // Process events sequentially
      for (const event of events) {
        // Prepare event data without tags initially
        const eventData = {
          userId: userId,
          calendarId: calendarId,
          title: isUniversityWideEvent(event.eventTitle) ? event.eventTitle : `${courseName}: ${event.eventTitle}`,
          date: event.date,
          recurring: event.recurring,
          color: selectedColor || '#1976d2', // Ensure color always has a default value
          description: null,
          start: null,
          end: null,
          type: "EVENT"
        };

        // Only add tags if it's not a university-wide event
        if (!isUniversityWideEvent(event.eventTitle) && courseName) {
          try {
            // Create the tag first
            const tagResponse = await fetch('/api/tag', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: courseName,
                color: selectedColor || '#1976d2'
              })
            });
            
            if (tagResponse.ok) {
              // Now that we know the tag exists, we can add it to the eventData
              eventData.tags = {
                connect: [{
                  name: courseName
                }]
              };
            }
          } catch (tagErr) {
            console.error('Error with tag, continuing without tag:', tagErr);
            // Continue without tags if there's an issue
          }
        }

        console.log('Adding event:', eventData);

        console.log('Sending event data:', eventData);
        const response = await fetch(`/api/event/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (!response.ok) {
          const responseText = await response.text();
          console.log('Error response:', responseText);
          let error;
          try {
            error = JSON.parse(responseText);
          } catch (e) {
            error = { message: responseText || 'Invalid server response' };
          }
          throw new Error(error.message || 'Failed to add event');
        }

        setAddedCount(prev => prev + 1);
      }

      // Show success message
      setError(`Successfully added ${events.length} events to calendar`);
      setShowError(true);
      
    } catch (err) {
      console.error('Error adding events:', err);
      setError(`Added ${addedCount} events. Failed to add remaining: ${err.message || 'Unknown error'}`);
      setShowError(true);
    } finally {
      setIsAddingEvents(false);
    }
  }, [events, courseName, selectedColor]);

  const handleAddSingleEvent = useCallback(async (event) => {
    if (!courseName) {
      setError('Please enter a course name before adding events');
      setShowError(true);
      return;
    }
    
    const token = sessionStorage.getItem('token');
    let userId;
    try {
      // For JWT tokens
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.userId || payload.sub; // 'sub' is commonly used for user IDs in JWTs
      
      if (!userId) {
        throw new Error('User ID not found in token');
      }
    } catch (tokenError) {
      console.error('Error parsing token:', tokenError);
      throw new Error('Invalid authentication token. Please log in again.');
    }

    try {
      const getDefaultCalendar = await fetch(`http://localhost:3000/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: userId, query: "default" })
      });
      const defaultCalendar = await getDefaultCalendar.json();
      if (defaultCalendar) {
        // redirect to the default calendar page
        setCalendarId(defaultCalendar.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      window.location.href = '/login'; // Redirect to login page
    }

    try {
      // First, ensure the course tag exists if this isn't a university-wide event
      if (!isUniversityWideEvent(event.eventTitle)) {
        try {
          await fetch('/api/tag', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: courseName,
              color: selectedColor || '#1976d2'
            })
          });
        } catch (err) {
          console.error('Error creating tag:', err);
          // Continue anyway, the API might return an error if the tag already exists
        }
      }

      const eventData = {
        userId: userId,
        calendarId: calendarId,
        title: isUniversityWideEvent(event.eventTitle) ? event.eventTitle : `${courseName}: ${event.eventTitle}`,
        date: event.date,
        recurring: event.recurring,
        color: selectedColor || '#1976d2', // Ensure color always has a default value
        description: null,
        start: null,
        end: null,
        type: "EVENT",
        tags: {
          connect: isUniversityWideEvent(event.eventTitle) ? [] : [{
            name: courseName
          }]
        }
      };

      console.log('Adding single event:', eventData);

      const response = await fetch(`/api/event/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const responseError = await response.json();
        throw new Error(responseError.message || 'Failed to add event');
      }

      setError('Event added successfully');
      setShowError(true);

    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event: ' + (err.message || 'Unknown error'));
      setShowError(true);
    }
  }, [courseName, selectedColor]);

  const renderEventRow = (event, index) => (
    <TableRow key={index}>
      <TableCell>{isUniversityWideEvent(event.eventTitle) ? event.eventTitle : `${courseName}: ${event.eventTitle}`}</TableCell>
      <TableCell>{formatDate(event.date)}</TableCell>
      <TableCell>{event.recurring ? 'Yes' : 'No'}</TableCell>
      <TableCell align="right">
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleAddSingleEvent(event)}
          sx={{ minWidth: '40px', px: 1 }}
        >
          +
        </Button>
      </TableCell>
    </TableRow>
  );

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.includes('pdf')) {
      setError('Please upload a PDF file');
      setShowError(true);
      return;
    }

    setFile(selectedFile);
  };

  const handleProcessFile = async () => {
    if (!file) return;
  
    setIsProcessing(true);
    setError('');
    setEvents(null);

    // Debug mode - skip API call if file is named debug.pdf
    if (file.name.toLowerCase() === 'debug.pdf') {
      console.log('Debug mode activated');
      const debugEvents = [
        {
          "eventTitle": "Debug Tutorial",
          "date": "2025-02-23 00:00:00.000Z",
          "recurring": true
        },
        {
          "eventTitle": "Debug Assignment 1",
          "date": "2025-03-15 23:59:00.000Z",
          "recurring": false
        },
        {
          "eventTitle": "Debug Midterm",
          "date": "2025-04-01 23:59:00.000Z",
          "recurring": false
        },
        {
          "eventTitle": "Debug Project",
          "date": "2025-02-23 00:00:00.000Z",
          "recurring": true
        },
        {
          "eventTitle": "Debug Final",
          "date": "2025-05-01 23:59:00.000Z",
          "recurring": false
        }
      ];

      setTimeout(() => {
        setEvents(debugEvents);
        setIsProcessing(false);
      }, 1000); // Simulate API delay
      return;
    }
  
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result?.toString().split(',')[1];
          
          if (!base64String) {
            throw new Error('Failed to read file');
          }
  
          console.log('Sending request with PDF data length:', base64String.length);
          
          const prompt = `
          Analyze this syllabus PDF and extract all deadlines and key dates.
          Return ONLY a JSON array using this exact format, with no other text or explanation:
          [{
            "eventTitle": "Example Assignment",
            "date": "2024-03-15 23:59:00.000Z",
            "recurring": false
          }]

          Important formatting rules:
          - eventTitle must be a string
          - date must be in SQLite DateTime format: "YYYY-MM-DD HH:mm:ss.SSSZ"
          - for recurring events, use "recurring" field instead of a special date format
          - recurring must be a boolean
          - return only the JSON array, no other text
          - all dates must be in UTC timezone
          - do not include any explanation or text outside the JSON array
          `;
          
          const response = await fetch('http://localhost:3000/api/process-syllabus', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 4096,
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: prompt
                    },
                    {
                      type: "document",
                      source: {
                        type: "base64",
                        media_type: "application/pdf",
                        data: base64String
                      }
                    }
                  ]
                }
              ]
            })
          });
  
          console.log('Response status:', response.status);
          const data = await response.json();
          console.log('Response data:', data);
  
          if (!response.ok) {
            throw new Error(data.error || 'Failed to process PDF');
          }

          // Parse the events from Claude's response
          let parsedEvents;
          try {
            // Extract the JSON string from Claude's response
            const textContent = data.content[0].text;
            console.log('Text content:', textContent);
            
            // Find the JSON array in the text response
            const jsonMatch = textContent.match(/\[.*\]/s);
            if (!jsonMatch) {
              throw new Error('No JSON array found in response');
            }
            
            // Parse the JSON string and handle null dates
            parsedEvents = JSON.parse(jsonMatch[0]);
            
            // Add date validation and default to current date if null
            parsedEvents = parsedEvents.map(event => {
              if (!event.date) {
                const now = new Date();
                event.date = now.toISOString(); // This will give us the format "YYYY-MM-DDTHH:mm:ss.sssZ"
                console.log('Replaced null date with current date:', event.date);
              }
              return event;
            });
            
            console.log('Parsed events:', parsedEvents);
            setEvents(parsedEvents);
            
          } catch (parseError) {
            console.error('Error parsing events:', parseError);
            throw new Error('Failed to parse events from response: ' + parseError.message);
          }
  
        } catch (err) {
          console.error('Processing error:', err);
          setError('Error processing PDF: ' + (err.message || 'Unknown error'));
          setShowError(true);
        }
      };
  
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setError('Error reading file');
        setShowError(true);
      };
  
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Top level error:', err);
      setError('Error reading file: ' + (err.message || 'Unknown error'));
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length) {
      handleFileUpload({ target: { files: [files[0]] } });
    }
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (error) {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  // Update the Add All to Calendar button in the render section
  const addAllButton = (
    <Button
      variant="contained"
      size="large"
      onClick={handleAddAllEvents}
      disabled={isAddingEvents || !courseName}
      sx={{
        bgcolor: selectedColor,
        color: 'white',
        px: 4,
        py: 1,
        fontSize: '16px',
        '&:hover': {
          bgcolor: selectedColor,
          opacity: 0.9
        }
      }}
    >
      {isAddingEvents ? (
        <>
          <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          {addedCount}/{events.length}
        </>
      ) : (
        'Add All to Calendar'
      )}
    </Button>
  );

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom sx={{ 
        fontSize: '48px',
        fontWeight: 400,
        mb: 6 
      }}>
        Syllabus Scanner
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          required
          fullWidth
          label="Course Name (e.g. COMP301)"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          sx={{ mb: 2 }}
          error={!courseName}
          helperText={!courseName ? "Course name is required" : ""}
        />
        
        <FormControl fullWidth>
          <InputLabel id="color-select-label">Event Color</InputLabel>
          <Select
            labelId="color-select-label"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            label="Event Color"
          >
            {Object.entries(colors).map(([name, hex]) => (
              <MenuItem key={hex} value={hex}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: hex,
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography>{name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <UploadBox
        elevation={0}
        component="label"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography variant="body1" color="text.secondary" align="center">
          Drag and drop file here or click to browse
        </Typography>
        {file && (
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            Selected: {file.name}
          </Typography>
        )}
      </UploadBox>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleProcessFile}
          disabled={!file || isProcessing}
          sx={{
            bgcolor: '#1976d2',
            color: 'white',
            px: 4,
            py: 1,
            fontSize: '16px',
            '&:hover': {
              bgcolor: '#1565c0',
            }
          }}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Process PDF'
          )}
        </Button>
      </Box>

      {events && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Events:
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Recurring</TableCell>
                  <TableCell align="right">Add</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(events) ? (
                  events.map((event, index) => renderEventRow(event, index))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="error">
                        Invalid event data format
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            {addAllButton}
          </Box>
        </Box>
      )}

      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity={error.includes('Successfully') ? 'success' : 'error'} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SyllabusScanner;