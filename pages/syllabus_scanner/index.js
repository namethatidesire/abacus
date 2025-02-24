'use client';

import React, { useState, useCallback } from 'react';
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
  TableRow
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

  const handleAddAllEvents = useCallback(async () => {
    if (!events?.length) return;
    
    setIsAddingEvents(true);
    setError('');
    setAddedCount(0);
    
    try {
      // Process events sequentially using your existing API endpoint
      for (const event of events) {
        const eventData = {
          id: crypto.randomUUID(),
          userId: 'd79bf43f-a033-4485-94ea-d1e300299829',
          title: event.eventTitle,
          date: event.date, // Already in correct SQLite format
          recurring: event.recurring,
          color: '#1976d2',
          description: null,
          start: null,
          end: null,
          type: "EVENT",
          tags: {
            connect: [] // This creates an event with no tags
          }
        };

        console.log('Adding event:', eventData);

        console.log('Sending event data:', eventData);
        const response = await fetch('/api/event/d79bf43f-a033-4485-94ea-d1e300299829', {  // Using accountId 14 to match userId
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
  }, [events]);

  const handleAddSingleEvent = useCallback(async (event) => {
    try {
      const eventData = {
        id: crypto.randomUUID(),
        userId: "d79bf43f-a033-4485-94ea-d1e300299829",
        title: event.eventTitle,
        date: event.date, // Already in correct SQLite format
        recurring: event.recurring,
        color: '#1976d2',
        description: null,
        start: null,
        end: null,
        type: "EVENT",
        tags: {
          connect: [] // This creates an event with no tags
        }
      };

      console.log('Adding single event:', eventData);

      const response = await fetch('/api/event/d79bf43f-a033-4485-94ea-d1e300299829', {  // Using accountId 14 to match userId
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add event');
      }

      setError('Event added successfully');
      setShowError(true);

    } catch (err) {
      console.error('Error adding event:', err);
      setError('Failed to add event: ' + (err.message || 'Unknown error'));
      setShowError(true);
    }
  }, []);

  const renderEventRow = (event, index) => (
    <TableRow key={index}>
      <TableCell>{event.eventTitle}</TableCell>
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
      disabled={isAddingEvents}
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
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SyllabusScanner;