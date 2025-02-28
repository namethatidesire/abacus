 
 /**
  *  A File intended to be used as an API route between EventService.py and the Calendar Frontend
  */
 

export default async function handler(req, res) {
    /**
     * This function serves as a mediator between calendar.js and eventservice.py. It sends a POST request from calendar.js to eventService.py.
     * 
     * @param {Object} req - The request object containing the incoming request information
     * @param {Object} res - The response object that sends the completed information to eventService.py 
     */

    if (req.method === 'POST') {
      try {
        // Using Asnych function properties, forward the request to the EventService server
        const eventServiceResponse = await fetch('http://localhost:8080/event', {
          method: 'POST',
          // Specifies what type of content is being sent via POST
          headers: {
            'Content-Type': 'application/json',
          },
          // Forward the request body from json to string
          body: JSON.stringify(req.body), 
        });
  
        // Check if the EventService server responded successfully
        if (!eventServiceResponse.ok) {
          throw new Error('Failed to create event in EventService');
        }
  
        // Parse the response from EventService
        const data = await eventServiceResponse.json();
  
        // Send the response back to the client
        res.status(200).json(data);
      } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }