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
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      setShowAddForm(false);
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const localStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    completion_rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  if (loading && tasks.length === 0) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing Neural Network...</div>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="background-grid"></div>
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            <div className="title-section">
              <h1 className="main-title">NEXUS TASK</h1>
              <p className="subtitle">Advanced Task Management System</p>
            </div>
          </div>
          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-value">{localStats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{localStats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{localStats.completed}</span>
              <span className="stat-label">Complete</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{localStats.completion_rate}%</span>
              <span className="stat-label">Rate</span>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-notification">
          <div className="error-icon">⚠</div>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <main className="main-content">
        <div className="control-panel">
          <div className="filter-tabs">
            {(['all', 'active', 'completed'] as const).map(filterType => (
              <button
                key={filterType}
                className={`filter-tab ${filter === filterType ? 'active' : ''}`}
                onClick={() => setFilter(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="add-task-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <span className="btn-icon">+</span>
            <span>New Task</span>
          </button>
        </div>

        {showAddForm && (
          <div className="task-form-modal">
            <div className="modal-backdrop" onClick={() => setShowAddForm(false)}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Task</h3>
                <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              <form onSubmit={createTask} className="task-form">
                <div className="form-group">
                  <label htmlFor="title">Task Title</label>
                  <input
                    type="text"
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title..."
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={3}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="tasks-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No {filter !== 'all' ? filter : ''} tasks found</h3>
              <p>
                {filter === 'all'
                  ? "Create your first task to get started!"
                  : `No ${filter} tasks at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`task-card ${task.completed ? 'completed' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="task-status">
                    <div className={`status-indicator ${task.completed ? 'complete' : 'pending'}`}></div>
                  </div>
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-meta">
                      <span className="task-date">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      <span className={`task-badge ${task.completed ? 'complete' : 'pending'}`}>
                        {task.completed ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => toggleTask(task)}
                      className={`action-btn toggle-btn ${task.completed ? 'complete' : 'pending'}`}
                      title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed ? '✓' : '○'}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="action-btn delete-btn"
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
