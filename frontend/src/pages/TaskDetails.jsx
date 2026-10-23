// src/pages/TaskDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tasksAPI.getById(id);
      setTask(res.data.task);
    } catch (err) {
      setError(err.message || 'Task not found or failed to load.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await tasksAPI.delete(id);
      navigate('/tasks', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Not specified';
    try {
      return new Date(isoString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      {/* Back button */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/tasks" className="btn btn-outline btn-sm">
          ← Back to All Tasks
        </Link>
      </div>

      <ErrorMessage message={error} onRetry={fetchTask} />

      {loading ? (
        <Loading size="lg" text="Loading task details..." />
      ) : !task ? (
        <div className="card empty-state">
          <div className="empty-icon">🔍</div>
          <h2 className="empty-title">Task Not Found</h2>
          <p className="empty-subtitle">The task you requested does not exist or you do not have permission to view it.</p>
          <Link to="/tasks" className="btn btn-primary">
            Back to Task List
          </Link>
        </div>
      ) : (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--space-md)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: 'var(--space-lg)',
              marginBottom: 'var(--space-lg)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                Task #{task.id}
              </span>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
                {task.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <span className={`badge badge-${task.status}`}>{task.status}</span>
              <span className={`badge priority-${task.priority}`}>{task.priority} priority</span>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' }}>
              Description
            </h3>
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: 'var(--font-size-sm)',
                color: task.description ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {task.description || 'No description provided for this task.'}
            </div>
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              backgroundColor: 'var(--secondary-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-xl)',
            }}
          >
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Due Date</p>
              <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Created At</p>
              <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                {formatDate(task.createdAt)}
              </p>
            </div>

            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Last Updated</p>
              <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                {formatDate(task.updatedAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: 'var(--space-lg)',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
            }}
          >
            <Link to="/tasks" className="btn btn-secondary">
              Back to List
            </Link>

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Link to={`/tasks/${task.id}/edit`} className="btn btn-primary">
                ✏️ Edit Task
              </Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️ Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${task?.title}"?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
