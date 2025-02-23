'use client';

import React, { useState } from 'react';
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
        "date": "ongoing",
        "recurring": true
      },
      {
        "eventTitle": "Debug Assignment 1",
        "date": "2025-03-15",
        "recurring": false
      },
      {
        "eventTitle": "Debug Midterm",
        "date": "2025-04-01",
        "recurring": false
      },
      {
        "eventTitle": "Debug Project",
        "date": "ongoing",
        "recurring": true
      },
      {
        "eventTitle": "Debug Final",
        "date": "2025-05-01",
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
                      text: "Please analyze this syllabus PDF and extract all deadlines and key dates. Return it to me a list in json form as follows: {eventTitle: String, date: DateTime, recurring: Boolean}"
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
            // Get the text content from the response structure
            const textContent = data.content[0].text;
            console.log('Text content:', textContent);
            
            // Parse the JSON string from the text content
            parsedEvents = JSON.parse(textContent);
            console.log('Parsed events:', parsedEvents);
          } catch (parseError) {
            console.error('Error parsing events:', parseError);
            throw new Error('Failed to parse events from response: ' + parseError.message);
          }
  
          setEvents(parsedEvents);
          
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
                  events.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>{event.eventTitle}</TableCell>
                      <TableCell>{formatDate(event.date)}</TableCell>
                      <TableCell>{event.recurring ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: '40px', px: 1 }}
                        >
                          +
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
            <Button
              variant="contained"
              size="large"
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
              Add All to Calendar
            </Button>
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