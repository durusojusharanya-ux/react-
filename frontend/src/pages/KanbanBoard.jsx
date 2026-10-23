// src/pages/KanbanBoard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const COLUMNS = [
  { id: 'pending', title: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-light)' },
  { id: 'in-progress', title: 'In Progress', icon: '⚡', color: 'var(--info)', bg: 'var(--info-light)' },
  { id: 'completed', title: 'Completed', icon: '✅', color: 'var(--success)', bg: 'var(--success-light)' },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tasksAPI.getAll();
      setTasks(res.data?.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTasks = [...tasks];
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('-', ' ')}`);
    } catch (err) {
      // Revert on error
      setTasks(originalTasks);
      toast.error(err.message || 'Failed to update task status.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="main-content">
      {/* Header & Controls */}
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
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>Kanban Task Board</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Visually manage workflows and move tasks across lifecycle stages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <div className="view-toggle">
            <Link to="/tasks" className="btn btn-outline btn-sm">
              📋 List View
            </Link>
            <span className="btn btn-primary btn-sm" style={{ cursor: 'default' }}>
              📌 Kanban
            </span>
          </div>
          <Link to="/tasks/create" className="btn btn-primary">
            + New Task
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchTasks} />

      {loading ? (
        <Loading size="lg" text="Loading Kanban board..." />
      ) : (
        <div className="kanban-grid">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="kanban-column">
                <div
                  className="kanban-column-header"
                  style={{ borderTop: `3px solid ${col.color}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{col.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>
                      {col.title}
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{ backgroundColor: col.bg, color: col.color }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="kanban-cards-list">
                  {colTasks.length === 0 ? (
                    <div className="kanban-empty">No tasks in {col.title.toLowerCase()}</div>
                  ) : (
                    colTasks.map((task) => (
                      <div key={task.id} className="kanban-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                          <Link
                            to={`/tasks/${task.id}`}
                            style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}
                          >
                            {task.title}
                          </Link>
                          <span className={`badge priority-${task.priority}`}>
                            {task.priority}
                          </span>
                        </div>

                        {task.description && (
                          <p
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--text-secondary)',
                              marginBottom: '10px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {formatDate(task.dueDate) ? `📅 ${formatDate(task.dueDate)}` : `#${task.id}`}
                          </span>

                          {/* Quick Move Dropdown / Action */}
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="form-select form-select-sm"
                            style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
                            aria-label={`Change status for ${task.title}`}
                          >
                            <option value="pending">Move to Pending</option>
                            <option value="in-progress">Move to In Progress</option>
                            <option value="completed">Move to Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
