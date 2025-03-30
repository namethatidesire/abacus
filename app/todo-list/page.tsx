'use client';

import React, { useState } from 'react';
import TodoList from '../../components/todolist';
import Navbar from '../../components/navbar';

interface Task {
    text: string;
    completed: boolean;
}

const TodoListPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');

    return (
        <div>
            <div style={{ padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', color: '#000' }}>Todo List</h1>
                <TodoList tasks={tasks} newTask={newTask} setTasks={setTasks} setNewTask={setNewTask} />
            </div>
        </div>
    );
};

export default TodoListPage;