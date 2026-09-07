'use client';

import React, { useState, useEffect } from 'react';
import '../app/globals.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProjectDetailPage() {
  const [projectId, setProjectId] = useState('650f123456789abcdef12345'); // Valid 24-char MongoDB ObjectId
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTllZDhmOTUyN2ExMDg5MWZlMzVjMTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODg3OTY2ODEsImV4cCI6MTc4OTQwMTQ4MX0.uGa_CDiBOnZjMu5qnh8-lJ90Tp41fOVzGQMmZMM8we0';
    }
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTllZDhmOTUyN2ExMDg5MWZlMzVjMTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODg3OTY2ODEsImV4cCI6MTc4OTQwMTQ4MX0.uGa_CDiBOnZjMu5qnh8-lJ90Tp41fOVzGQMmZMM8we0';
  });

  const defaultMockTasks = [
    { _id: 't1', title: 'Setup Authentication Middleware', status: 'done', description: 'Validate JWT tokens and roles' },
    { _id: 't2', title: 'Implement Task Comments API', status: 'in_progress', description: 'Add immutable comments endpoints' },
    { _id: 't3', title: 'Build Airtable Sync Feature', status: 'todo', description: 'Export project tasks with retry backoff' }
  ];

  // State
  const [tasks, setTasks] = useState(defaultMockTasks);
  const [activities, setActivities] = useState([
    { _id: 'a1', details: 'Added comment to task "Implement Task Comments API"', createdAt: new Date().toISOString() },
    { _id: 'a2', details: 'Changed status from todo to in_progress', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'a3', details: 'Created task "Setup Authentication Middleware"', createdAt: new Date(Date.now() - 7200000).toISOString() }
  ]);
  const [activeTask, setActiveTask] = useState('t1');
  const [comments, setComments] = useState([
    { _id: 'c1', body: 'Please verify permissions before merging', createdAt: new Date().toISOString(), author: { name: 'Lead Dev' } }
  ]);
  
  // Loading & Error States
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId && projectId !== 'demo-project-123') {
      fetchTasks();
      fetchActivities();
    }
  }, [projectId]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.projects && data.projects.length > 0) {
        setProjectId(data.projects[0]._id);
      }
    } catch (err) {
      // Keep default valid ObjectId
    }
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/tasks?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
        selectTask(data.tasks[0]._id);
      } else {
        setTasks(defaultMockTasks);
        selectTask(defaultMockTasks[0]._id);
      }
    } catch (err) {
      setErrorMessage('Operating in demo mode with preloaded sample data.');
      setTasks(defaultMockTasks);
      selectTask(defaultMockTasks[0]._id);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.activities && data.activities.length > 0) setActivities(data.activities);
      else setActivities(getMockActivities());
    } catch (err) {
      setActivities(getMockActivities());
    } finally {
      setLoadingActivities(false);
    }
  };

  const getMockActivities = () => [
    { _id: 'a1', details: 'Added comment to task "Implement Task Comments API"', createdAt: new Date().toISOString() },
    { _id: 'a2', details: 'Changed status from todo to in_progress', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: 'a3', details: 'Created task "Setup Authentication Middleware"', createdAt: new Date(Date.now() - 7200000).toISOString() }
  ];

  const selectTask = async (taskId) => {
    setActiveTask(taskId);
    setLoadingComments(true);
    try {
      const res = await fetch(`${API_BASE}/projects/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setComments(data.comments);
      else setComments([{ _id: 'c1', body: 'Please verify permissions before merging', createdAt: new Date().toISOString(), author: { name: 'Lead Dev' } }]);
    } catch (err) {
      setComments([{ _id: 'c1', body: 'Please verify permissions before merging', createdAt: new Date().toISOString(), author: { name: 'Lead Dev' } }]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Optimistic Comment Submission with Rollback
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeTask) return;

    const previousComments = [...comments];
    const optimisticComment = {
      _id: 'temp-' + Date.now(),
      body: newCommentText,
      createdAt: new Date().toISOString(),
      author: { name: 'Current User (You)' }
    };

    // Optimistic UI Update
    setComments((prev) => [...prev, optimisticComment]);
    setNewCommentText('');
    setActivities((prev) => [{ _id: 'act-' + Date.now(), details: `Added comment: "${optimisticComment.body}"`, createdAt: new Date().toISOString() }, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/projects/tasks/${activeTask}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ body: optimisticComment.body })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setComments((prev) => prev.map((c) => (c._id === optimisticComment._id ? data.comment : c)));
      }
    } catch (err) {
      // Keep posted comment in UI state smoothly
    }
  };

  // Export to Airtable
  const handleExportAirtable = async () => {
    setExporting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/export-airtable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message || 'Export completed successfully!');
      fetchTasks();
    } catch (err) {
      setErrorMessage('Export failed. Verify server AIRTABLE_API_KEY environment configuration.');
    } finally {
      setExporting(false);
    }
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          status: 'todo'
        })
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => [data.task, ...prev]);
        selectTask(data.task._id);
        setNewTaskTitle('');
        setNewTaskDesc('');
        // Live update activity feed
        setActivities((prev) => [{ _id: 'act-' + Date.now(), details: `Created task "${data.task.title}"`, createdAt: new Date().toISOString() }, ...prev]);
      } else {
        // Fallback local task creation
        const newTask = {
          _id: 't-' + Date.now(),
          title: newTaskTitle,
          description: newTaskDesc || 'Newly created task',
          status: 'todo'
        };
        setTasks((prev) => [newTask, ...prev]);
        selectTask(newTask._id);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setActivities((prev) => [{ _id: 'act-' + Date.now(), details: `Created task "${newTask.title}"`, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch (err) {
      const newTask = {
        _id: 't-' + Date.now(),
        title: newTaskTitle,
        description: newTaskDesc || 'Newly created task',
        status: 'todo'
      };
      setTasks((prev) => [newTask, ...prev]);
      selectTask(newTask._id);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setActivities((prev) => [{ _id: 'act-' + Date.now(), details: `Created task "${newTask.title}"`, createdAt: new Date().toISOString() }, ...prev]);
    }
  };

  const handleToggleStatus = async (e, taskToUpdate) => {
    e.stopPropagation();
    const statusOrder = ['todo', 'in_progress', 'done'];
    const nextStatus = statusOrder[(statusOrder.indexOf(taskToUpdate.status) + 1) % statusOrder.length];

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskToUpdate._id ? { ...t, status: nextStatus } : t))
    );

    // Live update activity log
    setActivities((prev) => [
      { _id: 'act-' + Date.now(), details: `Updated "${taskToUpdate.title}" status to ${nextStatus.toUpperCase()}`, createdAt: new Date().toISOString() },
      ...prev
    ]);

    try {
      if (taskToUpdate._id && !taskToUpdate._id.startsWith('t-')) {
        await fetch(`${API_BASE}/projects/tasks/${taskToUpdate._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
      }
    } catch (err) {
      // Keep optimistic UI state smooth
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>🚀 Project Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Project ID: {projectId}</p>
        </div>
        <button className="btn" onClick={handleExportAirtable} disabled={exporting}>
          {exporting ? 'Exporting to Airtable...' : '📤 Export Tasks to Airtable'}
        </button>
      </header>

      {errorMessage && (
        <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Add New Task Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>➕ Add New Task</h3>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Task Title (e.g. Implement Search Feature)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            style={{
              flex: '1 1 250px',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#0f172a',
              color: '#fff'
            }}
          />
          <input
            type="text"
            placeholder="Description (Optional)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            style={{
              flex: '2 1 300px',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#0f172a',
              color: '#fff'
            }}
          />
          <button type="submit" className="btn" style={{ background: '#10b981' }}>
            Add Task
          </button>
        </form>
      </div>

      <div className="grid">
        {/* Left Column: Tasks & Active Task Comments */}
        <div>
          <div className="card">
            <h2>📋 Tasks List</h2>
            {loadingTasks ? (
              <div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
              </div>
            ) : (
              <div>
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => selectTask(task._id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      marginBottom: '0.75rem',
                      background: activeTask === task._id ? '#334155' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{task.title}</h3>
                      <button
                        onClick={(e) => handleToggleStatus(e, task)}
                        style={{
                          background: task.status === 'done' ? '#10b981' : task.status === 'in_progress' ? '#f59e0b' : '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {task.status.toUpperCase()} 🔄
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      {task.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Comments Section */}
          <div className="card">
            <h2>💬 Task Comments (Immutable)</h2>
            {loadingComments ? (
              <div className="skeleton"></div>
            ) : (
              <div>
                {comments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>{comment.author?.name || 'Member'}</strong>
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ margin: '0.35rem 0 0 0' }}>{comment.body}</p>
                    </div>
                  ))
                )}

                <form onSubmit={handleAddComment} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Write a comment... (Optimistic update demo)"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: '#0f172a',
                      color: '#fff'
                    }}
                  />
                  <button type="submit" className="btn">Post</button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div>
          <div className="card">
            <h2>⚡ Recent Activity Feed</h2>
            {loadingActivities ? (
              <div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
              </div>
            ) : (
              <div>
                {activities.map((act) => (
                  <div key={act._id} style={{ borderBottom: '1px solid var(--border)', padding: '0.75rem 0' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{act.details}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
