// src/pages/TaskList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await tasksAPI.getAll(params);
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Client-side search on title and description
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title?.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      await tasksAPI.delete(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setSuccessMsg(`Task "${taskToDelete.title}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setTaskToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'None';
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>All Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage, filter, and track all your tasks in one place.
          </p>
        </div>
        <Link to="/tasks/create" className="btn btn-primary">
          + Create Task
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={fetchTasks} />

      {successMsg && (
        <div className="alert alert-success" role="status">
          <span>✅</span>
          <p>{successMsg}</p>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
        <div className="tasks-toolbar">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="🔍 Search tasks by title or details..."
              className="form-input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {(statusFilter || priorityFilter || searchQuery) && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredTasks.length}</strong> of {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Task List / Grid */}
      {loading ? (
        <Loading size="lg" text="Fetching your tasks..." />
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h2 className="empty-title">
            {searchQuery || statusFilter || priorityFilter ? 'No matching tasks' : 'No tasks created yet'}
          </h2>
          <p className="empty-subtitle">
            {searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Get started by creating your very first task to stay productive.'}
          </p>
          {searchQuery || statusFilter || priorityFilter ? (
            <button
              className="btn btn-outline"
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          ) : (
            <Link to="/tasks/create" className="btn btn-primary">
              + Create First Task
            </Link>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h3 className="task-card-title">{task.title}</h3>
                <span className={`badge badge-${task.status}`}>{task.status}</span>
              </div>

              <p className="task-card-description">
                {task.description || (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No description provided
                  </span>
                )}
              </p>

              <div className="task-card-meta">
                <span className={`badge priority-${task.priority}`}>
                  {task.priority}
                </span>
                <span>📅 Due: {formatDate(task.dueDate)}</span>
              </div>

              <div className="task-card-actions">
                <Link to={`/tasks/${task.id}`} className="btn btn-outline btn-sm">
                  Details
                </Link>
                <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => setTaskToDelete(task)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Keep Task"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
