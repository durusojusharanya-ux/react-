import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tasksAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await tasksAPI.getById(id);
      const t = res.data.task;
      setFormData({
        title: t.title || '',
        description: t.description || '',
        status: t.status || 'pending',
        priority: t.priority || 'medium',
        dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      });
    } catch (err) {
      setApiError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

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
    setSuccessMsg('');

    try {
      let validDueDate = null;
      if (formData.dueDate) {
        const parsed = new Date(formData.dueDate);
        if (!isNaN(parsed.getTime())) {
          validDueDate = parsed.toISOString();
        }
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: validDueDate,
      };

      await tasksAPI.update(id, payload);
      toast.success('Task updated successfully!');
      setSuccessMsg('Task updated successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/tasks/${id}`, { replace: true });
      }, 700);
    } catch (err) {
      toast.error(err.message || 'Failed to update task.');
      setApiError(err.message || 'Failed to update task.');
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link to={`/tasks/${id}`} className="btn btn-outline btn-sm">
          ← Cancel & Back to Details
        </Link>
      </div>

      <ErrorMessage message={apiError} onRetry={fetchTask} />

      {successMsg && (
        <div className="alert alert-success" role="status">
          <span>✅</span>
          <p>{successMsg}</p>
        </div>
      )}

      {loading ? (
        <Loading size="lg" text="Loading task data..." />
      ) : (
        <div className="card">
          <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
            <div>
              <h1 className="card-title">Edit Task #{id}</h1>
              <p className="card-subtitle">Update task details and save changes</p>
            </div>
          </div>

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
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="form-textarea"
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
                Due Date
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
              <Link to={`/tasks/${id}`} className="btn btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
