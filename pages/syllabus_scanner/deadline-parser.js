import * as pdfjsLib from 'pdfjs-dist';

// Only initialize worker on client side
if (typeof window !== 'undefined') {
  // Set worker path correctly
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

async function extractDeadlines(file) {
  // Regular expressions for finding dates and deadline-related content
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/g,
    // Month DD, YYYY
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/g,
    // DD Month YYYY
    /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/g
  ];

  // Words that might indicate a deadline
  const deadlineKeywords = [
    'due',
    'deadline',
    'submit',
    'assignment',
    'quiz',
    'exam',
    'test',
    'project',
    'paper',
    'presentation',
    'homework'
  ];

  // Words that might indicate recurring events
  const recurringKeywords = [
    'weekly',
    'daily',
    'monthly',
    'every',
    'each',
    'recurring'
  ];

  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }

    // Split text into sentences (rough approximation)
    const sentences = fullText.split(/[.!?]\s+/);
    
    const deadlines = [];

    for (const sentence of sentences) {
      // Check if sentence contains any deadline-related keywords
      const hasDeadlineKeyword = deadlineKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasDeadlineKeyword) {
        // Check for dates in the sentence
        let foundDate = null;
        let dateString = null;

        for (const pattern of datePatterns) {
          const match = sentence.match(pattern);
          if (match) {
            dateString = match[0];
            try {
              // Try to parse the date
              if (pattern.toString().includes('Month')) {
                foundDate = new Date(dateString);
              } else {
                // Handle MM/DD/YYYY format
                const [month, day, year] = dateString.split(/[-/]/).map(num => parseInt(num));
                foundDate = new Date(year, month - 1, day);
              }
              break;
            } catch (e) {
              continue;
            }
          }
        }

        if (foundDate && foundDate.toString() !== 'Invalid Date') {
          // Check if this appears to be a recurring event
          const isRecurring = recurringKeywords.some(keyword => 
            sentence.toLowerCase().includes(keyword.toLowerCase())
          );

          // Extract title by taking the relevant part of the sentence
          let title = sentence.trim();
          // Remove the date from the title
          if (dateString) {
            title = title.replace(dateString, '');
          }
          // Clean up the title
          title = title.replace(/\s+/g, ' ').trim();

          deadlines.push({
            title,
            date: foundDate.toISOString(),
            recurring: isRecurring
          });
        }
      }
    }

    return deadlines;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

// Function to process the uploaded file
async function processUploadedFile(file) {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file');
  }
  return await extractDeadlines(file);
}

export { processUploadedFile };