// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tasksAPI } from '../services/api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tasksAPI.getAll();
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Compute metrics from actual API data
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;

  const recentTasks = tasks.slice(0, 5);

  const formatDate = (isoString) => {
    if (!isoString) return 'No due date';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="main-content">
      {/* Top Banner / Welcome */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Here is a snapshot of your task progress and activity today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link to="/tasks/create" className="btn btn-primary">
            + New Task
          </Link>
          <Link to="/tasks" className="btn btn-secondary">
            View All Tasks
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchTasks} />

      {loading ? (
        <Loading size="lg" text="Loading dashboard metrics..." />
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
              >
                📋
              </div>
              <div className="metric-info">
                <span className="metric-value">{totalCount}</span>
                <span className="metric-label">Total Tasks</span>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)' }}
              >
                ⏳
              </div>
              <div className="metric-info">
                <span className="metric-value">{pendingCount}</span>
                <span className="metric-label">Pending</span>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ backgroundColor: 'var(--info-light)', color: 'var(--info-text)' }}
              >
                ⚡
              </div>
              <div className="metric-info">
                <span className="metric-value">{inProgressCount}</span>
                <span className="metric-label">In Progress</span>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-text)' }}
              >
                ✅
              </div>
              <div className="metric-info">
                <span className="metric-value">{completedCount}</span>
                <span className="metric-label">Completed</span>
              </div>
            </div>

            <div className="metric-card">
              <div
                className="metric-icon"
                style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
              >
                🔥
              </div>
              <div className="metric-info">
                <span className="metric-value">{highPriorityCount}</span>
                <span className="metric-label">High Priority</span>
              </div>
            </div>
          </div>

          {/* Recent Tasks Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Recent Tasks</h2>
                <p className="card-subtitle">Your 5 most recently created or updated tasks</p>
              </div>
              <Link to="/tasks" className="btn btn-outline btn-sm">
                See all ({totalCount})
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No tasks found</h3>
                <p className="empty-subtitle">
                  You haven't created any tasks yet. Start organizing your work by creating your first task!
                </p>
                <Link to="/tasks/create" className="btn btn-primary">
                  + Create Your First Task
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Link
                        to={`/tasks/${task.id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: 'var(--font-size-base)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {task.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${task.status}`}>{task.status}</span>
                        <span className={`badge priority-${task.priority}`}>
                          {task.priority} priority
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      <Link to={`/tasks/${task.id}`} className="btn btn-outline btn-sm">
                        View
                      </Link>
                      <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
