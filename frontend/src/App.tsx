import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [API_BASE]);

  // Create task
  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to create task');

      setNewTask({ title: '', description: '' });
      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (task: Task) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');

      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Delete task
  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');

      await fetchTasks();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AutoDeploy Hub - Task Manager</h1>
        <p>A complete DevOps pipeline demonstration</p>
      </header>

      <main className="App-main">
        {/* Stats Dashboard */}
        {stats && (
          <div className="stats-dashboard">
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <span className="stat-number">{stats.total_tasks}</span>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <span className="stat-number completed">{stats.completed_tasks}</span>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <span className="stat-number pending">{stats.pending_tasks}</span>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <span className="stat-number rate">{stats.completion_rate}%</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Task Creation Form */}
        <form onSubmit={createTask} className="task-form">
          <h2>Create New Task</h2>
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Task description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            rows={3}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>

        {/* Tasks List */}
        <div className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          {loading && tasks.length === 0 ? (
            <p>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p>No tasks yet. Create your first task above!</p>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    {task.description && <p>{task.description}</p>}
                    <small>
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => toggleTask(task)}
                      className={task.completed ? 'undo-btn' : 'complete-btn'}
                    >
                      {task.completed ? '↶ Undo' : '✓ Complete'}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with React + Flask + Docker + Kubernetes + CI/CD</p>
      </footer>
    </div>
  );
}

export default App;
