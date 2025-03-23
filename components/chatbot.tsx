"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! How can I help you today?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Bot responses based on user input
  interface Message {
    text: string;
    sender: "user" | "bot";
    id: number;
  }

  interface BotResponse {
    responseText: string;
  }

  const getBotResponse = (userMessage: string): string => {
    const userMessageLower: string = userMessage.toLowerCase();
    
    if (userMessageLower.includes("hello") || userMessageLower.includes("hi")) {
      return "Hello! Nice to meet you!";
    } else if (userMessageLower.includes("help")) {
      return "I can help with general questions, provide information, or just chat. What would you like to know?";
    } else if (userMessageLower.includes("bye") || userMessageLower.includes("goodbye")) {
      return "Goodbye! Have a great day!";
    } else if (userMessageLower.includes("thank")) {
      return "You're welcome! Is there anything else you'd like to talk about?";
    } else {
      return "That's interesting. Tell me more or ask a different question.";
    }
  };

  // Handle user message submission
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    if (inputValue.trim() === "") return;
    
    // Add user message
    const userMessage = { 
      id: messages.length + 1, 
      text: inputValue, 
      sender: "user" 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate response delay
    setTimeout(() => {
      const botMessage = { 
        id: messages.length + 2, 
        text: getBotResponse(inputValue), 
        sender: "bot" 
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto rounded-lg shadow-lg bg-white overflow-hidden h-96">
      <GlobalStyles />
      {/* Header */}
      <div className="bg-[#8CA7D6] text-white p-4 flex items-center">
        <div className="h-3 w-3 bg-[#FBE59D] rounded-full mr-2"></div>
        <h2 className="font-medium">Study Assistant</h2>
      </div>
      
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
              {message.text}
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
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#8CA7D6] text-black"
        />
        <button 
          type="submit" 
          className="bg-[#8CA7D6] text-white p-2 rounded-r-lg hover:bg-[#7b93bd] focus:outline-none focus:ring-2 focus:ring-[#8CA7D6]"
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