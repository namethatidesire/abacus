import React from 'react';

interface Task {
    text: string;
    completed: boolean;
}

interface TodoListProps {
    tasks: Task[];
    newTask: string;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    setNewTask: React.Dispatch<React.SetStateAction<string>>;
}

const TodoList: React.FC<TodoListProps> = ({ tasks, newTask, setTasks, setNewTask }) => {
    const addTask = () => {
        if (newTask.trim() !== '') {
            setTasks([...tasks, { text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const removeTask = (index: number) => {
        const updatedTasks = tasks.filter((task, i) => i !== index);
        setTasks(updatedTasks);
    };

    const toggleTaskCompletion = (index: number) => {
        const updatedTasks = tasks.map((task, i) => {
            if (i === index) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        setTasks(updatedTasks);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>To-Do List</h2>
            <div style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    style={{ flex: '1', padding: '10px', border: "1px solid black", outline: 'none', color: 'black',  
                        fontSize: '1em' }}
                />
                <button
                    onClick={addTask}
                    style={{
                        padding: '10px 20px',
                        marginLeft: '10px',
                        fontSize: '1em',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Add
                </button>
            </div>
            <ul style={{ listStyleType: 'none', padding: '0' }}>
                {tasks.map((task, index) => (
                    <li
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px',
                            marginBottom: '10px',
                            backgroundColor: '#f0f0f0',
                            color: 'black', 
                            borderRadius: '5px',
                            textDecoration: task.completed ? 'line-through' : 'none'
                        }}
                    >
                        <span
                            onClick={() => toggleTaskCompletion(index)}
                            style={{ cursor: 'pointer', flex: '1' }}
                        >
                            {task.text}
                        </span>
                        <button
                            onClick={() => removeTask(index)}
                            style={{
                                padding: '5px 10px',
                                fontSize: '0.8em',
                                backgroundColor: '#f44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoList;