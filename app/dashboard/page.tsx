'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar.js';
import RenderProgressBar from '../../components/progressbar.js';

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('beloved user');
  interface Event {
    id: string;
    date: string;
    title: string;
  }

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchUserId = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Missing token. Please log in again.');
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch(`api/account/authorize`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log(data);
        if (data.status === 200) {
          const { userId } = data.decoded;
          setUserId(userId);
        } else {
          alert('Invalid token. Please log in again.');
          window.location.href = '/login';
        }
      } catch (error) {
        alert('Error verifying token. Please log in again.');
        window.location.href = '/login';
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getCurrentUser = await fetch(`http://localhost:3000/api/account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: userId })
        });
        const eventsResponse = await fetch(`http://localhost:3000/api/event/${userId}`);
        const currentUserData = await getCurrentUser.json();
        const eventData = await eventsResponse.json();
        console.log(eventData);
        setUsername(currentUserData.account.username);
        if (eventData) {
          setEvents(eventData.events);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-[35%] bg-white p-6 h-[calc(100vh-64px)] text-gray-800 shadow-md m-5 rounded-2xl">
        <p className="text-4xl font-semibold mb-2.5">
          Dashboard
        </p>
        <p className="text-3xl mb-4 text-gray-800">
          Welcome, {username}.
        </p>
        <p className="text-base mb-5 text-gray-500">
          {today}
        </p>
        
        <div className="bg-gray-50 rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="text-2xl text-blue-500 mb-4">
            Today's Events
          </h2>
          
          {(() => {
            const todaysEvents = events
              .filter(event => {
                const eventDate = new Date(event.date).toDateString();
                const todayDate = new Date().toDateString();
                return eventDate === todayDate;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            return todaysEvents.length > 0 ? (
              <ul className="list-none p-0 m-0">
                {todaysEvents.map(event => (
                  <li 
                    key={event.id} 
                    className="p-3 mb-2 bg-white rounded-lg text-gray-800 flex items-center border border-gray-200 shadow-sm hover:border-blue-200 transition-colors"
                  >
                    <span className="text-blue-500 mr-2.5 text-sm font-medium">
                      [{new Date(event.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}]
                    </span>
                    <span>{event.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-5">
                No events planned for today.
              </p>
            );
          })()}
          <div>
            <RenderProgressBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;