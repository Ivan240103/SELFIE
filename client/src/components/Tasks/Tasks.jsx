import React, { useEffect, useState } from 'react';
import TimeMachine from '../TimeMachine/TimeMachine';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthenticationContext';
import '../../css/Tasks.css';

const Tasks = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate()

    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState(null);
    
    // verifica l'autenticazione
    useEffect(() => {
        if (!isAuthenticated) {
        navigate('/login')
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (isAuthenticated) {
            fetch(`${process.env.REACT_APP_API}/api/tasks/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Includi il token se necessario
                },
                })
                .then((response) => {
                if (!response.ok) {
                    throw new Error('Errore nel recupero delle note');
                }
                return response.json();
                })
                .then((data) => {
                    setTasks(data)
                    setError('')
                })
                .catch((error) => setError('Errore:', error.message));
        };
    }, [isAuthenticated]);

    const now = new Date();

    return (
        <div>
            {isAuthenticated && (
                <>
                    <TimeMachine />
                    <div className="tasks-container">
                        <h1>My Tasks</h1>
                        {tasks.length === 0 ? (
                            <p>No tasks found.</p>
                        ) : (
                            <ul className="task-list">
                                {tasks.map((task) => {
                                    const deadline = new Date(task.deadline);
                                    const isExpired = deadline < now;
                                    const isHighlighted = !task.isDone && !isExpired;
                                    return (
                                        <li
                                            key={task._id}
                                            className={`task-item ${task.isDone ? 'completed' : isHighlighted ? 'highlighted' : 'not-completed'}`}
                                        >
                                            <h2>
                                                {task.isDone ? '✅ ' : isHighlighted ? '📌 ' : '❌ '}
                                                {task.title}
                                            </h2>
                                            <p>Descrizione: {task.description}</p>
                                            <p>Deadline: {deadline.toLocaleString()}</p>
                                            <p>Status: {task.isDone ? 'Completed' : 'Not Completed'}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Tasks;