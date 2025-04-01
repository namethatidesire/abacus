import React, { useEffect } from "react";
import { prisma } from "@/utils/db";

export default function RenderProgressBar(accountId) {
    const eventType = "TASK";
    const [eventCounts, setEventCounts] = React.useState({completeEvents: 0, incompleteEvents: 0, completeTasks: 0, incompleteTasks: 0});

    useEffect(() => {
        async function fetchEventCounts() {
            try {
                const token = sessionStorage.getItem('token');
                let userId;
                const payload = JSON.parse(atob(token.split('.')[1]));
                userId = payload.userId || payload.sub;
                if (!userId) {
                  throw new Error('User ID not found in token');
                }
                const response = await fetch(`http://localhost:3000/api/type`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({"userId" : userId}),
                });
                setEventCounts(await response.json());
            }
            catch (error) {
               console.error('Error searching for event:', error);
            }
        }

        fetchEventCounts();
    }, []);

    let overallProgress = 0;
    let eventProgress = 0;
    let taskProgress = 0;

    let events = eventCounts.completeEvents + eventCounts.incompleteEvents;
    let tasks = eventCounts.completeTasks + eventCounts.incompleteTasks;

    if (events) {
        eventProgress = 1.0 * eventCounts.completeEvents / events;
    }
    if (tasks) {
        taskProgress = 1.0 * eventCounts.completeTasks / tasks;
    }
    if (events || tasks) {
        overallProgress = 1.0 * (eventCounts.completeEvents + eventCounts.completeTasks) / (events + tasks);
    }

    return (
        <div className="mt-6 space-y-4">
            <div className="progress-section">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="overall">
                    Overall Completion:
                </label>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                        <div 
                            style={{ width: `${overallProgress * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                        />
                    </div>
                    <span className="text-xs text-gray-500">
                        {Math.round(overallProgress * 100)}%
                    </span>
                </div>
            </div>

            <div className="progress-section">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event">
                    Event Completion:
                </label>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                        <div 
                            style={{ width: `${eventProgress * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                        />
                    </div>
                    <span className="text-xs text-gray-500">
                        {Math.round(eventProgress * 100)}%
                    </span>
                </div>
            </div>

            <div className="progress-section">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="task">
                    Task Completion:
                </label>
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                        <div 
                            style={{ width: `${taskProgress * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                        />
                    </div>
                    <span className="text-xs text-gray-500">
                        {Math.round(taskProgress * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
}