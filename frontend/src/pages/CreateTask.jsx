// src/pages/CreateTask.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function CreateTask() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required.';
    } else if (formData.title.trim().length > 100) {
      errs.title = 'Title must be 100 characters or fewer.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      const res = await tasksAPI.create(payload);
      const newTaskId = res.data?.task?.id;
      if (newTaskId) {
        navigate(`/tasks/${newTaskId}`, { replace: true });
      } else {
        navigate('/tasks', { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Failed to create task. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/tasks" className="btn btn-outline btn-sm">
          ← Cancel & Back
        </Link>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
          <div>
            <h1 className="card-title">Create New Task</h1>
            <p className="card-subtitle">Add a new task to your personal task board</p>
          </div>
        </div>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Task Title <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              className={`form-input ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Implement user authentication test suite"
              value={formData.title}
              onChange={handleChange}
              autoFocus
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="form-textarea"
              placeholder="Provide any additional details or requirements for this task..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Status & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">
              Due Date (Optional)
            </label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-sm)',
              marginTop: 'var(--space-xl)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: 'var(--space-lg)',
            }}
          >
            <Link to="/tasks" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
