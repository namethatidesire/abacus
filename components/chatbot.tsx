"use client";

import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Add keyframes for the animation
const pulse = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(0.8);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`;

// Add style tag for global animations
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: pulse }} />
);

// Add CSS for typing animation
const typingDotStyle = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#888',
  margin: '0 2px',
  animation: 'pulse 1.4s infinite ease-in-out'
};

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi there! I'm your schedule assistant. Ask me about your schedule or for help managing your time.", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState({});
  const [eventMap, setEventMap] = useState(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    date: '',
    start: '',
    end: '',
    description: '',
    location: '',
    color: '#8CA7D6'
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCreationSuccess, setEventCreationSuccess] = useState<string | null>(null);

  // Interface definitions
  interface MessagePart {
    text: string;
    isHighlighted: boolean;
    color?: string;
    eventId?: string;
    date?: string;
    time?: string;
    isEventSuggestion?: boolean;
    suggestedEvent?: {
      title: string;
      date: string;
      start?: string;
      end?: string;
      description?: string;
    };
  }

  interface Message {
    text: string;
    sender: "user" | "bot";
    id: number;
    parts?: MessagePart[];
  }

  interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    description?: string;
    color?: string;
  }

  // Initialize with user authentication and fetch events
  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in first.');
          return null;
        }
        
        // For JWT tokens
        let id;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          id = payload.userId || payload.sub; // 'sub' is commonly used for user IDs in JWTs
          
          if (!id) {
            throw new Error('User ID not found in token');
          }
        } catch (tokenError) {
          console.error('Error parsing token:', tokenError);
          setError('Invalid authentication token format. Please log in again.');
          return null;
        }
        
        setUserId(id);
        
        // Verify token with the server (similar to Calendar.js)
        try {
          const authResponse = await fetch(`/api/account/authorize`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!authResponse.ok) {
            throw new Error(`Token validation failed: ${authResponse.status}`);
          }

          const authData = await authResponse.json();
          if (authData.status !== 200) {
            throw new Error('Invalid token. Please log in again.');
          }
          
          // Once authenticated, fetch the user's events with the validated user ID
          const userIdFromAuth = authData.decoded.userId;
          if (userIdFromAuth) {
            setUserId(userIdFromAuth); // Update with server-validated ID
            const eventsData = await fetchUserEvents(userIdFromAuth);
            if (eventsData) {
              setEvents(eventsData);
              buildEventMap(eventsData);
            }
          }
          
          setIsInitialized(true);
          return userIdFromAuth || id;
        } catch (serverError) {
          console.error('Server authentication error:', serverError);
          setError('Server authentication failed. Please log in again.');
          return null;
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed. Please log in again.');
        return null;
      }
    };

    initializeAssistant();
  }, []);

  // Build a map of event titles to event data for easy lookup
  const buildEventMap = (eventsData: { [dateKey: string]: Event[] }) => {
    const map = new Map();
    
    Object.values(eventsData).forEach(dateEvents => {
      dateEvents.forEach(event => {
        // Use lowercase title as key for case-insensitive matching
        map.set(event.title.toLowerCase(), {
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          color: event.color || getRandomEventColor(event.title)
        });
      });
    });
    
    setEventMap(map);
  };
  
  // Generate a consistent color for events that don't have a color
  const getRandomEventColor = (title: string) => {
    // Generate a color based on the event title (for consistency)
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use pastel colors (lighter and less saturated)
    const h = hash % 360;
    const s = 60 + (hash % 20); // 60-80% saturation
    const l = 65 + (hash % 15); // 65-80% lightness
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // Fetch user events
  const fetchUserEvents = async (userIdToUse = null) => {
    try {
      const token = sessionStorage.getItem('token');
      const effectiveUserId = userIdToUse || userId;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      if (!effectiveUserId) {
        throw new Error('User ID not available');
      }

      const response = await fetch(`/api/event/${effectiveUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`);
      }

      const events = await response.json();
      
      // Process events similar to Calendar.js
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const processedEvents = events.reduce((acc: { [x: string]: any[]; }, event: { date: string | number | Date; }) => {
        const eventDate = new Date(event.date);
        const localDate = new Date(eventDate.toLocaleString('en-US', { timeZone: userTimezone }));
        const dateKey = localDate.toDateString();
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        
        acc[dateKey].push({
          ...event,
          date: localDate.toISOString().split('T')[0],
          time: localDate.toTimeString().split(' ')[0].substring(0, 5)
        });
        
        return acc;
      }, {});
      
      return processedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Don't set an error state here, just return null
      return null;
    }
  };

  // Query Claude API
  const queryClaudeAPI = async (userMessage: string) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      if (!userId) {
        throw new Error('User ID not available');
      }

      // Use cached events or fetch fresh ones
      let userEvents = events;
      if (Object.keys(userEvents).length === 0) {
        userEvents = await fetchUserEvents();
      }
      
      const eventSummary = formatEventSummary(userEvents);
      
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: `
            The user is asking about their schedule.
            Here is their current schedule information:
            
            ${eventSummary}
            
            User question: "${userMessage}"
            
            Based on this schedule information, please provide insights or answer their question.
            Keep responses conversational and focused on schedule management.
            
            Be concise and provide relevant information. Avoid repeating the user's question.
            
            VERY IMPORTANT:
            1. When you mention an event in your response, always use the EXACT title of the event 
            as it appears in the schedule information.
            
            2. Only suggest the user to create an event if the user asks something to entail that response. If you're suggesting the user create a new event, use this exact format:
            "You could create a new event: [Title: Event Title | Date: YYYY-MM-DD | Description: description here]"

            3. Today's date is ${new Date().toISOString().split('T')[0]}. When suggesting new events, ALWAYS ensure the dates are in the future (after today's date).
            
            For example:
            "You could create a new event: [Title: Team Meeting | Date: 2025-03-25 | Description: Weekly team sync-up]"
            
            If they ask about specific dates or times, refer to the schedule information provided.
            If they ask for schedule analysis, provide insights based on their event distribution.
            
            If their question is unclear or not about their schedule, ask clarifying questions.
          `,
          model: "claude-3-5-sonnet-20241022" // Use appropriate model
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.completion || "I'm having trouble accessing your schedule information right now. Could you try again or provide more details?";
    } catch (err) {
      console.error('Error querying Claude API:', err);
      if (err instanceof Error && err.message.includes('Authentication')) {
        setError(err.message);
      }
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  };
  
  // Format events for the Claude prompt
  const formatEventSummary = (events: { [x: string]: any; } | null) => {
    if (!events || Object.keys(events).length === 0) {
      return "No events found in your schedule.";
    }
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    let summary = "SCHEDULE SUMMARY:\n";
    
    // Sort dates
    const sortedDates = Object.keys(events).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // Only include upcoming events (today and future)
    const upcomingDates = sortedDates.filter(dateStr => new Date(dateStr) >= today);
    
    if (upcomingDates.length === 0) {
      return "You have no upcoming events in your schedule.";
    }
    
    // Limit to next 10 days or 20 events max
    let eventCount = 0;
    const maxEvents = 20;
    
    upcomingDates.forEach(dateStr => {
      if (eventCount >= maxEvents) return;
      
      const date = new Date(dateStr);
      if (date > nextWeek && eventCount > 5) return; // Only show more distant events if we have few upcoming
      
      const dateEvents = events[dateStr];
      if (dateEvents && dateEvents.length > 0) {
        // Format date nicely
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
        
        summary += `\n${formattedDate}:\n`;
        
        // Sort events by time
        const sortedEvents = [...dateEvents].sort((a, b) => {
          return a.time.localeCompare(b.time);
        });
        
        sortedEvents.forEach(event => {
          if (eventCount >= maxEvents) return;
          // Add color information to help Claude understand which events to highlight
          const colorInfo = event.color ? ` [color: ${event.color}]` : '';
          summary += `- ${event.time}: ${event.title}${colorInfo} (${event.location || 'No location'})`;
          if (event.description) {
            summary += ` - ${event.description.substring(0, 50)}${event.description.length > 50 ? '...' : ''}`;
          }
          summary += '\n';
          eventCount++;
        });
      }
    });
    
    return summary;
  };

  // Process response text to find event suggestions
  const processEventSuggestions = (text: string): MessagePart[] => {
    if (!text) return [{ text, isHighlighted: false }];
    
    // Regular expression to match suggested events in the format:
    // [Title: Event Title | Date: YYYY-MM-DD | Start: HH:MM | End: HH:MM | Description: description here]
    const eventSuggestionRegex = /\[Title: ([^|]+)\s*\|\s*Date: ([^|]+)\s*\|\s*Description: ([^\]]+)\]/g;
    
    // Also detect existing events
    const existingEventsHighlights = highlightEvents(text);
    
    // Combine both event detection mechanisms
    let result: MessagePart[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = eventSuggestionRegex.exec(text)) !== null) {
      // Get text before the match
      const beforeText = text.substring(lastIndex, match.index);
      
      // Process the text before the match for existing events
      if (beforeText) {
        const processedBeforeText = highlightEvents(beforeText);
        result = [...result, ...processedBeforeText];
      }
      
      // Add the suggested event as a special part
      const suggestedEvent = {
        title: match[1].trim(),
        date: match[2].trim(),
        description: match[3].trim()
      };
      
      result.push({
        text: match[0],
        isHighlighted: true,
        isEventSuggestion: true,
        suggestedEvent,
        color: '#4CAF50' // Green color for suggested events
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Process the remaining text for existing events
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      const processedRemainingText = highlightEvents(remainingText);
      result = [...result, ...processedRemainingText];
    }
    
    return result;
  };

  // Highlight event titles in message text
  const highlightEvents = (text: string): MessagePart[] => {
    if (!text || eventMap.size === 0) return [{ text, isHighlighted: false }];
    
    // Create a regex pattern that matches event titles
    // Sort titles by length (descending) to match longer titles first
    const eventTitles = Array.from(eventMap.keys()).sort((a, b) => b.length - a.length);
    
    if (eventTitles.length === 0) {
      return [{ text, isHighlighted: false }];
    }
    
    // Escape special regex characters in titles
    const escapedTitles = eventTitles.map(title => 
      title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    
    // Create regex pattern with word boundaries for exact matches
    const pattern = new RegExp(`\\b(${escapedTitles.join('|')})\\b`, 'gi');
    
    // Split text by matches to preserve formatting
    const parts = [];
    let lastIndex = 0;
    let match;
    
    const textToSearch = text;
    while ((match = pattern.exec(textToSearch)) !== null) {
      const matchedTitle = match[0];
      const eventInfo = eventMap.get(matchedTitle.toLowerCase());
      
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({
          text: textToSearch.substring(lastIndex, match.index),
          isHighlighted: false
        });
      }
      
      // Add highlighted match
      parts.push({
        text: matchedTitle,
        isHighlighted: true,
        color: eventInfo?.color || getRandomEventColor(matchedTitle),
        eventId: eventInfo?.id,
        date: eventInfo?.date,
        time: eventInfo?.time
      });
      
      lastIndex = match.index + matchedTitle.length;
    }
    
    // Add remaining text
    if (lastIndex < textToSearch.length) {
      parts.push({
        text: textToSearch.substring(lastIndex),
        isHighlighted: false
      });
    }
    
    return parts;
  };

  // Handle user message submission
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    if (inputValue.trim() === "") return;
    
    // Check authentication before proceeding
    if (!userId || !isInitialized) {
      setError('Not authenticated. Please refresh the page or log in again.');
      return;
    }
    
    // Add user message
    const userMessage: Message = { 
      id: messages.length + 1, 
      text: inputValue, 
      sender: "user" as const,
      parts: undefined // Plain text for user messages
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Get response from Claude API
      const claudeResponse = await queryClaudeAPI(inputValue);
      
      const botMessage: Message = { 
        id: messages.length + 2, 
        text: claudeResponse, 
        sender: "bot" as const,
        parts: processEventSuggestions(claudeResponse) // Process both highlighting and event suggestions
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      const errorMessage: Message = { 
        id: messages.length + 2, 
        text: "Sorry, I encountered an error. Please try again later.", 
        sender: "bot",
        parts: undefined // Plain text for error messages
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Create a new event based on suggestion
const createEvent = async (suggestedEvent: any) => {
  if (!userId) {
    setError('User ID not available. Please log in again.');
    return;
  }
  
  setIsCreatingEvent(true);
  setEventCreationSuccess(null);
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    // Parse the date (assuming it's in YYYY-MM-DD format)
    let eventDate = new Date(suggestedEvent.date);
    
    // Prepare the event data according to the Prisma schema
    const eventData = {
      // No need to manually set id, Prisma will generate with @default(uuid())
      userId: userId,
      title: suggestedEvent.title,
      date: eventDate.toISOString(), // Main date field
      recurring: false,
      color: suggestedEvent.color || newEventData.color || '#8CA7D6',
      type: 'EVENT',
      // Handle tags properly - must be connected, not created inline
      tags: {
        connect: suggestedEvent.tags?.map((tag: string) => ({ id: tag })) || []
      },
      description: suggestedEvent.description || ''
    };

    console.log('Creating event with data:', eventData);
    
    const response = await fetch(`/api/event/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }
    
    const createdEvent = await response.json();
    
    // Update local events state
    await fetchUserEvents(userId).then(updatedEvents => {
      if (updatedEvents) {
        setEvents(updatedEvents);
        buildEventMap(updatedEvents);
      }
    });

    // Trigger calendar refresh by dispatching a custom event
    const refreshEvent = new CustomEvent('calendarRefresh', {
      detail: {
        newEvent: createdEvent
      }
    });
    document.dispatchEvent(refreshEvent);
    
    setEventCreationSuccess(`Successfully created "${suggestedEvent.title}" event!`);
    
    // Format display date and times for the confirmation message
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const displayDate = eventDate.toLocaleDateString(undefined, dateOptions);
    
    // Add a message from the bot confirming event creation
    const confirmationMessage: Message = {
      id: Date.now(),
      text: `Event created: "${suggestedEvent.title}" on ${displayDate}.`,
      sender: "bot",
      parts: undefined
    };
    
    setMessages(prevMessages => [...prevMessages, confirmationMessage]);
    
    // Clear event creation success message after a delay
    setTimeout(() => {
      setEventCreationSuccess(null);
    }, 5000);
    
    return createdEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    setError(error instanceof Error ? error.message : 'Failed to create event.');
    return null;
  } finally {
    setIsCreatingEvent(false);
    setCreateEventModalOpen(false);
  }
};

  // Handle click on suggested event
  const handleEventSuggestionClick = (suggestedEvent: any) => {
    setNewEventData({
      title: suggestedEvent.title,
      date: suggestedEvent.date,
      start: suggestedEvent.start,
      end: suggestedEvent.end,
      description: suggestedEvent.description,
      location: suggestedEvent.location || '',
      color: '#8CA7D6'
    });
    
    // Either show modal or create immediately
    // For simplicity, we'll create immediately
    createEvent(suggestedEvent);
  };

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper function to determine text color based on background color
  const getContrastColor = (bgColor: string) => {
    // For HSL colors
    if (bgColor.startsWith('hsl')) {
      // Extract lightness value from HSL color
      const match = bgColor.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/);
      if (match && match[1]) {
        const lightness = parseInt(match[1], 10);
        return lightness > 65 ? '#000000' : '#ffffff';
      }
    }
    
    // For hex and other colors
    let hex = bgColor;
    if (bgColor.startsWith('rgb')) {
      const rgbValues = bgColor.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        hex = `#${Number(rgbValues[0]).toString(16).padStart(2, '0')}${Number(rgbValues[1]).toString(16).padStart(2, '0')}${Number(rgbValues[2]).toString(16).padStart(2, '0')}`;
      }
    }
    
    // Default contrast color if format not recognized
    if (!hex.startsWith('#')) return '#000000';
    
    // Calculate perceived brightness and return appropriate contrast color
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 125 ? '#000000' : '#ffffff';
  };

  const renderMessage = (message: { id?: number; text: any; sender?: string; parts?: any; }) => {
    if (!message.parts) {
      // Render plain text for messages without highlighting
      // Add white-space: pre-wrap to preserve newlines
      return <span style={{ whiteSpace: 'pre-wrap' }}>{message.text}</span>;
    }
    
    // For messages with highlighted parts
    return (
      <>
        {message.parts.map((part: MessagePart, index: React.Key | null | undefined) => {
          if (!part.isHighlighted) {
            // Add white-space: pre-wrap to preserve newlines in regular text
            return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</span>;
          }
          
          // For event suggestions (clickable to create)
          if (part.isEventSuggestion && part.suggestedEvent) {
            return (
              <span
                key={index}
                className="relative block my-2 px-3 py-2 rounded border border-green-500 bg-green-50"
              >
                <div className="font-medium text-green-800 mb-1">Suggested Event:</div>
                <div className="text-gray-700 mb-2">
                  <strong>{part.suggestedEvent.title}</strong> on {part.suggestedEvent.date}
                </div>
                <div className="text-sm text-gray-600 mb-2">{part.suggestedEvent.description}</div>
                <button
                  onClick={() => handleEventSuggestionClick(part.suggestedEvent)}
                  className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
                  disabled={isCreatingEvent}
                >
                  {isCreatingEvent ? "Creating..." : "Add to Calendar"}
                </button>
              </span>
            );
          }
          
          // For existing events (highlight only)
          return (
            <span
              key={index}
              className="relative"
              onMouseEnter={() => {
                // Dispatch custom event when hovering over an event in chat
                const highlightEvent = new CustomEvent('highlightCalendarEvent', {
                  detail: {
                    eventId: part.eventId,
                    highlight: true
                  }
                });
                document.dispatchEvent(highlightEvent);
              }}
              onMouseLeave={() => {
                // Remove highlight when mouse leaves
                const unhighlightEvent = new CustomEvent('highlightCalendarEvent', {
                  detail: {
                    eventId: part.eventId,
                    highlight: false
                  }
                });
                document.dispatchEvent(unhighlightEvent);
              }}
            >
              <span 
                style={{ 
                  backgroundColor: part.color || '#e0e0e0',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  color: getContrastColor(part.color || '#e0e0e0'),
                  fontWeight: 500,
                  whiteSpace: 'pre-wrap',
                  cursor: 'pointer' // Add pointer cursor to indicate it's interactive
                }}
              >
                {part.text}
              </span>
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-white overflow-hidden">
      <GlobalStyles />
      {/* Header */}
      <div className="bg-[#8CA7D6] text-white p-4 flex items-center">
        <div className="h-3 w-3 bg-[#FBE59D] rounded-full mr-2"></div>
        <h2 className="font-medium">Schedule Assistant</h2>
        {userId && (
          <span className="ml-auto text-xs bg-green-500 px-2 py-1 rounded-full">Connected</span>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {eventCreationSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 text-sm">
          {eventCreationSuccess}
        </div>
      )}
      
      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-xs p-3 rounded-lg ${
                message.sender === "user" 
                  ? "bg-[#8CA7D6] text-white rounded-br-none" 
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {renderMessage(message)}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-xs flex">
              <span style={typingDotStyle}></span>
              <span style={{...typingDotStyle, animationDelay: '0.2s'}}></span>
              <span style={{...typingDotStyle, animationDelay: '0.4s'}}></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={userId ? "Ask about your schedule..." : "Please log in first..."}
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#8CA7D6] text-black"
          disabled={!userId || !isInitialized}
        />
        <button 
          type="submit" 
          className={`p-2 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#8CA7D6] ${
            userId && isInitialized 
              ? "bg-[#8CA7D6] text-white hover:bg-[#7b93bd]" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={isTyping || !userId || !isInitialized}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;