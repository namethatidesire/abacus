"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/navbar.js';
import eventServiceConfig from '../../configs/eventservice.json';
import prisma from '../../utils/db.js'

const SearchFilter = () => {
  useEffect(() => {
      const fetchData = async () => {
        try {
          const getCurrentUser = 'API CALL TO GET LOGGED IN USER'
          const eventsResponse = await fetch('http://localhost:3000/event/${accountId}/retrieve');
          const eventData = await eventsResponse.json();
          setUsername(getCurrentUser.username);
          setEvents(eventData.events);

          /*Implement event filtering below*/
          const eventTags = ['GET EVENT TAGLIST FROM USER INPUT']; /*This should be a list of strings*/
          const filterOR = false; /*Filter OR on tags. By default should be false.*/


          if (filterOR) {
            const events = await prisma.event.findMany({
              where:  {
                tags: {
                 hasSome: eventTags
                }
              }
            });
          }
          else { /*FilterAND*/
            const events = await prisma.event.findMany({
               where:  {
                 tags: {
                  hasEvery: eventTags
                 }
               }
             });
          }

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, []);

    return (
        <div>
          <div>
            <Navbar />
            {/* Other content can go here */}
          </div>
          <div style={{
            width: '33%',
            backgroundColor: '#d3d3d3',
            padding: '20px',
            height: '100vh',
            color: '#333' // Dark gray color
          }}>
            <p style={{ fontSize: '3em', margin: '20px 0 0 0' }}>Dashboard</p>
            <p style={{ fontSize: '2em'}}>Welcome, {username}.</p>
            <p style={{ fontSize: '1em', margin: '0 0 20px 0' }}>{today}</p>
            <div style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '10px',
              padding: '10px',
            }}>
              <h2>Today's Events</h2>
              {events.length > 0 ? (
                <ul>
                  {events.map(event => (
                    <li key={event.id}>
                      [{event.time}] - {event.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events planned for today.</p>
              )}
            </div>
          </div>
        </div>
      );
};