import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { processUploadedFile } from './deadline-parser';

const SyllabusScanner = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deadlines, setDeadlines] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const extractedDeadlines = await processUploadedFile(file);
      setDeadlines(extractedDeadlines);
    } catch (err) {
      setError('Error processing file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ mb: 4 }}
      >
        Syllabus Scanner
      </Typography>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        style={{ display: 'none' }}
        accept=".pdf"
      />
      
      <Paper
        variant="outlined"
        sx={{
          height: 300,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'grey.300',
          bgcolor: isDragging ? 'grey.50' : 'background.paper',
          transition: 'background-color 200ms ease',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'grey.50'
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!file ? (
          <Box sx={{ textAlign: 'center', color: 'grey.400' }}>
            <InsertDriveFileOutlinedIcon 
              sx={{ fontSize: 64, mb: 2 }} 
            />
            <Typography variant="h6">
              Drag and drop PDF here
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              or click to browse
            </Typography>
          </Box>
        ) : (
          <Typography variant="h6" color="text.secondary">
            File uploaded: {file.name}
          </Typography>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          sx={{ minWidth: 200 }}
          onClick={handleProcessFile}
          disabled={!file || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Extract Deadlines'}
        </Button>
      </Box>

      {deadlines && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Found Deadlines:
          </Typography>
          <Paper sx={{ p: 2 }}>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(deadlines, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default SyllabusScanner;