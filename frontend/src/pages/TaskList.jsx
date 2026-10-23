// src/pages/TaskList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters initialized from URL query params
  const statusParam = searchParams.get('status') || '';
  const priorityParam = searchParams.get('priority') || '';

  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [priorityFilter, setPriorityFilter] = useState(priorityParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'dueDate'

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when URL searchParams change
  useEffect(() => {
    setStatusFilter(searchParams.get('status') || '');
    setPriorityFilter(searchParams.get('priority') || '');
  }, [searchParams]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await tasksAPI.getAll(params);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set('status', val);
    else newParams.delete('status');
    setSearchParams(newParams);
  };

  const handlePriorityFilterChange = (val) => {
    setPriorityFilter(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set('priority', val);
    else newParams.delete('priority');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchQuery('');
    setSearchParams({});
  };

  // Client-side search and sort
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(query);
      const descMatch = task.description?.toLowerCase().includes(query);
      return titleMatch || descMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success(`Task status changed to ${newStatus.replace('-', ' ')}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update task status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await tasksAPI.delete(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      toast.success(`Task "${taskToDelete.title}" deleted.`);
      setTaskToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete task.');
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
      {/* Top Header */}
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
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>
            {statusFilter === 'pending'
              ? 'Pending Tasks'
              : statusFilter === 'completed'
              ? 'Completed Tasks'
              : 'All Tasks'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Filter, search, sort, and manage all your tasks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="view-toggle">
            <span className="btn btn-primary btn-sm" style={{ cursor: 'default' }}>
              📋 List
            </span>
            <Link to="/tasks/kanban" className="btn btn-outline btn-sm">
              📌 Kanban
            </Link>
          </div>
          <Link to="/tasks/create" className="btn btn-primary">
            + Create Task
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchTasks} />

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)' }}>
        <div className="tasks-toolbar">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              className="form-input search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              aria-label="Filter by status"
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
              onChange={(e) => handlePriorityFilterChange(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort tasks"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="dueDate">Sort: Due Date</option>
            </select>

            {(statusFilter || priorityFilter || searchQuery) && (
              <button className="btn btn-outline btn-sm" onClick={clearAllFilters}>
                Clear Filters
              </button>
            )}
          </div>

          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredAndSortedTasks.length}</strong> of {tasks.length} tasks
          </span>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <Loading size="lg" text="Fetching tasks..." />
      ) : filteredAndSortedTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h2 className="empty-title">
            {searchQuery || statusFilter || priorityFilter ? 'No matching tasks' : 'No tasks created yet'}
          </h2>
          <p className="empty-subtitle">
            {searchQuery || statusFilter || priorityFilter
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'Get started by creating your first task to stay organized.'}
          </p>
          {searchQuery || statusFilter || priorityFilter ? (
            <button className="btn btn-outline" onClick={clearAllFilters}>
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
          {filteredAndSortedTasks.map((task) => (
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
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="form-select"
                  style={{ padding: '3px 8px', fontSize: '12px', width: 'auto', marginRight: 'auto' }}
                  aria-label={`Update status for ${task.title}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

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
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
