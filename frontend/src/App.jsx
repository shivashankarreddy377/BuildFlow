import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  LogOut,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Paperclip,
  AlertCircle,
  Menu,
  X,
  FileText,
  Tag,
  Calendar,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import * as api from './api';
import './App.css';

const TECH_PRESETS = ['React', 'Spring Boot', 'Java', 'MySQL', 'Docker', 'REST API', 'TypeScript', 'Tailwind'];

const AI_SUGGESTIONS = [
  'E-Commerce microservices platform with shopping cart and Stripe checkout',
  'Real-time collaborative whiteboard app with WebSockets and canvas rendering',
  'AI-powered document summarizer and vector search retrieval dashboard',
  'DevOps CI/CD pipeline monitor with automated Slack notifications'
];

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Toast notifications
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

  const showToast = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Auth state
  const [token, setToken] = useState(() => api.getStoredToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Projects state
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState(''); // '' | 'true' | 'false'
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [projectFile, setProjectFile] = useState(null);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskTechFilter, setTaskTechFilter] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    tech: 'React',
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    completionPercentage: 0,
  });

  // AI Planner state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultText, setAiResultText] = useState('');

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm }

  // Handle unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      api.clearStoredToken();
      setToken('');
      setCurrentUser(null);
      showToast('Your session has expired. Please sign in again.', 'error');
    };
    window.addEventListener('devprod:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('devprod:unauthorized', handleUnauthorized);
  }, [showToast]);

  // Load initial data upon authentication
  const loadInitialData = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const [user, analyticsData, projectPage] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getAnalytics().catch(() => null),
        api.getProjects({ page: 0, size: 50 }).catch(() => ({ content: [] })),
      ]);

      if (user) setCurrentUser(user);
      if (analyticsData) setAnalytics(analyticsData);

      const projectList = projectPage?.content || [];
      setProjects(projectList);

      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(projectList[0].id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRefreshing(false);
    }
  }, [token, selectedProjectId, showToast]);

  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token, loadInitialData]);

  // Load tasks whenever selectedProjectId changes
  const loadTasksForSelectedProject = useCallback(async (projId) => {
    if (!projId) {
      setTasks([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getProjectTasks(projId, { page: 0, size: 50 });
      setTasks(res?.content || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasksForSelectedProject(selectedProjectId);
    } else {
      setTasks([]);
    }
  }, [selectedProjectId, loadTasksForSelectedProject]);

  // Refresh all data
  const handleRefreshAll = async () => {
    await loadInitialData();
    if (selectedProjectId) {
      await loadTasksForSelectedProject(selectedProjectId);
    }
    showToast('Workspace data refreshed', 'info');
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'register') {
      if (authForm.password !== authForm.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      if (authForm.password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      let newToken;
      if (authMode === 'login') {
        newToken = await api.loginUser(authForm.username, authForm.password);
        showToast('Welcome back to Developer Workshop!');
      } else {
        newToken = await api.registerUser(authForm.username, authForm.password, authForm.email);
        showToast('Account created successfully!');
      }
      setToken(newToken);
      setActiveTab('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setAuthForm({
      username: 'devuser',
      password: 'password123',
      email: 'devuser@example.com',
      confirmPassword: 'password123',
    });
    showToast('Loaded demo credentials (devuser / password123)', 'info');
  };

  const handleLogout = () => {
    api.clearStoredToken();
    setToken('');
    setCurrentUser(null);
    setProjects([]);
    setTasks([]);
    setSelectedProjectId('');
    showToast('Signed out successfully', 'info');
  };

  // Project Handlers
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }
    if (!projectForm.dueDate) {
      showToast('Due date is required', 'error');
      return;
    }
    if (!projectFile) {
      showToast('Please attach a project requirement or spec file', 'error');
      return;
    }

    try {
      setLoading(true);
      const newProj = await api.createProject({
        title: projectForm.title,
        description: projectForm.description,
        dueDate: projectForm.dueDate,
        file: projectFile,
      });

      showToast(`Project "${newProj.title}" created successfully!`);
      setProjectForm({ title: '', description: '', dueDate: '' });
      setProjectFile(null);
      setShowNewProjectForm(false);

      await loadInitialData();
      if (newProj.id) {
        setSelectedProjectId(String(newProj.id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProjectStatus = async (projectId) => {
    try {
      const updated = await api.toggleProjectStatus(projectId);
      setProjects((curr) =>
        curr.map((p) => (p.id === projectId ? { ...p, status: updated.status } : p))
      );
      showToast(`Project marked as ${updated.status ? 'Completed' : 'Pending'}`);
      const analyticsData = await api.getAnalytics().catch(() => null);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProject = (projectId, projectTitle) => {
    setConfirmDialog({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectTitle}"? All associated tasks will also be removed.`,
      onConfirm: async () => {
        try {
          await api.deleteProject(projectId);
          setProjects((curr) => curr.filter((p) => p.id !== projectId));
          if (String(projectId) === selectedProjectId) {
            const remaining = projects.filter((p) => p.id !== projectId);
            setSelectedProjectId(remaining.length > 0 ? String(remaining[0].id) : '');
          }
          showToast(`Project "${projectTitle}" deleted`);
          const analyticsData = await api.getAnalytics().catch(() => null);
          if (analyticsData) setAnalytics(analyticsData);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDownloadFile = async (projectId, filename) => {
    try {
      showToast('Downloading project file...', 'info');
      await api.downloadProjectFile(projectId, filename);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Task Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      showToast('Please select a project first', 'error');
      return;
    }
    if (!taskForm.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    if (!taskForm.dueDate) {
      showToast('Due date is required', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.createTask(selectedProjectId, {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate,
        tech: taskForm.tech,
      });

      showToast('Task added successfully!');
      setTaskForm({ title: '', description: '', dueDate: '', tech: 'React' });
      setShowNewTaskForm(false);
      await loadTasksForSelectedProject(selectedProjectId);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskStatus = async (taskId) => {
    try {
      const updated = await api.toggleTaskStatus(taskId);
      setTasks((curr) =>
        curr.map((t) => (t.id === taskId ? { ...t, status: updated.status } : t))
      );
      showToast(`Task marked as ${updated.status ? 'Done' : 'Pending'}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    setConfirmDialog({
      title: 'Delete Task',
      message: `Delete task "${taskTitle}"?`,
      onConfirm: async () => {
        try {
          await api.deleteTask(taskId);
          setTasks((curr) => curr.filter((t) => t.id !== taskId));
          showToast('Task deleted');
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // AI Generator Handlers
  const handleGenerateAITasks = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      showToast('Please provide a project idea or description', 'error');
      return;
    }

    try {
      setAiLoading(true);
      setAiResultText('');
      const res = await api.generateAITasks(aiPrompt.trim());
      setAiResultText(res.response || 'No tasks generated.');
      showToast('AI development plan generated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Convert AI task items into actionable cards
  const parsedAiTasks = useMemo(() => {
    if (!aiResultText) return [];
    const lines = aiResultText.split('\n').filter((l) => l.trim().length > 0);
    const taskItems = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match lines like "1. [Title] Description (Tech: ...)" or "1. Title: Description"
      const numMatch = trimmed.match(/^(\d+[\.\)]\s*)(.*)/);
      if (numMatch) {
        const fullContent = numMatch[2];
        let title = fullContent;
        let desc = '';
        let tech = 'Fullstack';

        // Extract bracketed title e.g. [Setup & Architecture]
        const bracketMatch = fullContent.match(/^\[(.*?)\]\s*(.*)/);
        if (bracketMatch) {
          title = bracketMatch[1];
          desc = bracketMatch[2];
        }

        // Extract Tech: ...
        const techMatch = (desc || fullContent).match(/\(Tech:\s*([^)]+)\)/i);
        if (techMatch) {
          tech = techMatch[1];
          desc = desc.replace(techMatch[0], '').trim();
        }

        taskItems.push({
          raw: trimmed,
          title: title || 'Task Item',
          description: desc || fullContent,
          tech: tech || 'React / Java',
        });
      }
    }

    return taskItems;
  }, [aiResultText]);

  const handleAddAiTaskToCurrentProject = async (aiTask) => {
    if (!selectedProjectId) {
      showToast('Please create or select a project first in Projects tab', 'error');
      return;
    }
    try {
      const today = new Date();
      today.setDate(today.getDate() + 14); // 2 weeks out
      const dueDate = today.toISOString().split('T')[0];

      await api.createTask(selectedProjectId, {
        title: aiTask.title,
        description: aiTask.description,
        dueDate,
        tech: aiTask.tech.split(',')[0].trim() || 'Java',
      });

      showToast(`Added "${aiTask.title}" to project tasks!`);
      if (activeTab === 'tasks') {
        await loadTasksForSelectedProject(selectedProjectId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        !projectSearch ||
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()));

      let matchesStatus = true;
      if (projectStatusFilter === 'true') matchesStatus = p.status === true;
      if (projectStatusFilter === 'false') matchesStatus = p.status === false;

      return matchesSearch && matchesStatus;
    });
  }, [projects, projectSearch, projectStatusFilter]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !taskSearch ||
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase()));

      let matchesStatus = true;
      if (taskStatusFilter === 'true') matchesStatus = t.status === true;
      if (taskStatusFilter === 'false') matchesStatus = t.status === false;

      const matchesTech =
        !taskTechFilter ||
        (t.tech && t.tech.toLowerCase().includes(taskTechFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [tasks, taskSearch, taskStatusFilter, taskTechFilter]);

  const selectedProjectObj = useMemo(() => {
    return projects.find((p) => String(p.id) === String(selectedProjectId));
  }, [projects, selectedProjectId]);

  // ----------------------------------------------------
  // AUTH VIEW (LOGIN / REGISTER)
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="auth-container">
        {notification && (
          <div className={`toast toast-${notification.type}`}>
            {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-badge">
              <span className="brand-logo">DW</span>
              <div>
                <h2>Developer Workshop</h2>
                <span className="brand-subtitle">Project & Task Management Platform</span>
              </div>
            </div>
            <p className="auth-pitch">
              Seamlessly track development workflows, break down requirements with AI, and manage deliverables.
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <div className="input-icon-wrapper">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" /> Processing...
                </>
              ) : authMode === 'login' ? (
                'Sign In to Dashboard'
              ) : (
                'Create Developer Account'
              )}
            </button>

            <div className="auth-helper-row">
              <button type="button" className="btn-link" onClick={handleDemoFill}>
                ⚡ Auto-fill Demo Credentials (devuser)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN WORKSPACE VIEW
  // ----------------------------------------------------
  return (
    <div className="workspace-layout">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog && (
        <div className="modal-backdrop" onClick={() => setConfirmDialog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{confirmDialog.title}</h3>
              <button type="button" className="icon-btn" onClick={() => setConfirmDialog(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="modal-body">{confirmDialog.message}</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDialog.onConfirm}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`workspace-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">DW</div>
          <div className="brand-info">
            <h1>DevWorkshop</h1>
            <span>Productivity Hub</span>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('projects');
              setMobileMenuOpen(false);
            }}
          >
            <FolderKanban size={20} />
            <span>Projects</span>
            <span className="nav-badge">{projects.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tasks');
              setMobileMenuOpen(false);
            }}
          >
            <CheckSquare size={20} />
            <span>Tasks</span>
            <span className="nav-badge">{tasks.length}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('ai');
              setMobileMenuOpen(false);
            }}
          >
            <Sparkles size={20} className="glow-icon" />
            <span>AI Task Planner</span>
            <span className="nav-badge ai-badge">AI</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-details">
              <strong>{currentUser?.username || 'Developer'}</strong>
              <small>{currentUser?.Email || 'Connected'}</small>
            </div>
          </div>
          <button type="button" className="btn-logout" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="workspace-main">
        {/* Top Header Bar */}
        <header className="workspace-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="header-titles">
              <span className="page-breadcrumb">Workspace / {activeTab.toUpperCase()}</span>
              <h2>
                {activeTab === 'dashboard' && 'Developer Dashboard'}
                {activeTab === 'projects' && 'Projects Hub & Specs'}
                {activeTab === 'tasks' && 'Sprint & Project Tasks'}
                {activeTab === 'ai' && 'AI Roadmap & Task Generator'}
              </h2>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
              <span className="hide-on-mobile">Refresh</span>
            </button>

            {activeTab === 'dashboard' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setActiveTab('projects');
                  setShowNewProjectForm(true);
                }}
              >
                <Plus size={16} />
                <span>New Project</span>
              </button>
            )}
            {activeTab === 'projects' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewProjectForm((prev) => !prev)}
              >
                {showNewProjectForm ? <X size={16} /> : <Plus size={16} />}
                <span>{showNewProjectForm ? 'Close Form' : 'New Project'}</span>
              </button>
            )}
            {activeTab === 'tasks' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewTaskForm((prev) => !prev)}
              >
                {showNewTaskForm ? <X size={16} /> : <Plus size={16} />}
                <span>{showNewTaskForm ? 'Close Form' : 'Add Task'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="workspace-content-body">
          {/* ==================================================== */}
          {/* VIEW: DASHBOARD */}
          {/* ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              {/* Welcome Card */}
              <div className="welcome-banner">
                <div className="welcome-text">
                  <h3>Hello, {currentUser?.username || 'Developer'}! 👋</h3>
                  <p>Here is your developer productivity overview across projects, tasks, and deliverables.</p>
                </div>
                <div className="welcome-actions">
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => {
                      setActiveTab('projects');
                      setShowNewProjectForm(true);
                    }}
                  >
                    <Plus size={15} /> Create Project
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('ai')}
                  >
                    <Sparkles size={15} /> Plan with AI
                  </button>
                </div>
              </div>

              {/* 4 Analytics Metric Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Projects</span>
                    <div className="stat-icon-wrapper primary">
                      <FolderKanban size={22} />
                    </div>
                  </div>
                  <div className="stat-value">{analytics.totalProjects}</div>
                  <div className="stat-subtext">Active developer repositories</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Completed</span>
                    <div className="stat-icon-wrapper success">
                      <CheckCircle2 size={22} />
                    </div>
                  </div>
                  <div className="stat-value text-success">{analytics.completedProjects}</div>
                  <div className="stat-subtext">Successfully delivered</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Pending / In Progress</span>
                    <div className="stat-icon-wrapper warning">
                      <Clock size={22} />
                    </div>
                  </div>
                  <div className="stat-value text-warning">{analytics.pendingProjects}</div>
                  <div className="stat-subtext">Active development queue</div>
                </div>

                <div className="stat-card accent-card">
                  <div className="stat-header">
                    <span className="stat-label">Completion Rate</span>
                    <div className="stat-icon-wrapper info">
                      <CheckSquare size={22} />
                    </div>
                  </div>
                  <div className="stat-value">{Math.round(analytics.completionPercentage)}%</div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, analytics.completionPercentage))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Projects Table Preview */}
              <div className="panel-box">
                <div className="panel-box-header">
                  <div>
                    <h3>Recent Projects</h3>
                    <p className="panel-box-subtitle">Quick overview of your latest project activities</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('projects')}
                  >
                    View All Projects
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="empty-panel">
                    <FolderKanban size={48} className="empty-icon" />
                    <h4>No projects yet</h4>
                    <p>Get started by creating your first project with specification files.</p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setActiveTab('projects');
                        setShowNewProjectForm(true);
                      }}
                    >
                      <Plus size={16} /> Create Project
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Project Title</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>File Spec</th>
                          <th className="text-right">Quick Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.slice(0, 5).map((project) => (
                          <tr key={project.id}>
                            <td>
                              <div className="table-title-cell">
                                <strong>{project.title}</strong>
                                {project.description && (
                                  <span className="table-subtext">{project.description}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="cell-with-icon">
                                <Calendar size={14} />
                                <span>{project.due_date}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`status-pill ${project.status ? 'status-completed' : 'status-pending'}`}
                                onClick={() => handleToggleProjectStatus(project.id)}
                                title="Click to toggle status"
                              >
                                {project.status ? (
                                  <>
                                    <CheckCircle2 size={13} /> Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock size={13} /> Pending
                                  </>
                                )}
                              </button>
                            </td>
                            <td>
                              {project.filename ? (
                                <button
                                  type="button"
                                  className="file-link-btn"
                                  onClick={() => handleDownloadFile(project.id, project.filename)}
                                  title="Download Spec File"
                                >
                                  <Download size={14} />
                                  <span>{project.filename.replace(/^\d+_/, '')}</span>
                                </button>
                              ) : (
                                <span className="text-muted">None</span>
                              )}
                            </td>
                            <td className="text-right">
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => {
                                  setSelectedProjectId(String(project.id));
                                  setActiveTab('tasks');
                                }}
                              >
                                Manage Tasks
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: PROJECTS (MAIN FEATURES, FORMS, TABLES) */}
          {/* ==================================================== */}
          {activeTab === 'projects' && (
            <div className="projects-view">
              {/* Collapsible New Project Form */}
              {showNewProjectForm && (
                <div className="form-card-container">
                  <div className="form-card-header">
                    <div className="header-icon-title">
                      <FolderKanban size={20} className="text-primary" />
                      <h3>Create New Project</h3>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setShowNewProjectForm(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProject} className="modern-form">
                    <div className="form-row">
                      <div className="form-group flex-2">
                        <label>
                          Project Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Developer Productivity Workshop"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group flex-1">
                        <label>
                          Target Due Date <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          value={projectForm.dueDate}
                          onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Project Description</label>
                      <textarea
                        rows={3}
                        placeholder="Outline the scope, architecture requirements, and goals for this project..."
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Project Spec File / Attachment <span className="required">*</span>
                      </label>
                      <div className="file-upload-zone">
                        <input
                          type="file"
                          id="project-file-input"
                          className="file-hidden-input"
                          onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                          required
                        />
                        <label htmlFor="project-file-input" className="file-drop-label">
                          <Paperclip size={24} className="text-muted" />
                          <div className="file-drop-text">
                            <strong>{projectFile ? projectFile.name : 'Choose a requirement file'}</strong>
                            <small>
                              {projectFile
                                ? `${(projectFile.size / 1024).toFixed(1)} KB selected`
                                : 'Upload PDF, DOCX, TXT, or ZIP spec'}
                            </small>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="form-actions-row">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowNewProjectForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <RefreshCw size={16} className="spin" /> Uploading & Saving...
                          </>
                        ) : (
                          'Save Project'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Projects Filter & Search Toolbar */}
              <div className="filter-toolbar">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search projects by title or description..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                  {projectSearch && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setProjectSearch('')}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <div className="filter-select-wrapper">
                    <select
                      value={projectStatusFilter}
                      onChange={(e) => setProjectStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="false">Pending Only</option>
                      <option value="true">Completed Only</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                  </div>
                </div>
              </div>

              {/* Projects Table */}
              <div className="panel-box">
                <div className="panel-box-header">
                  <div>
                    <h3>All Projects ({filteredProjects.length})</h3>
                    <p className="panel-box-subtitle">Click status pill to mark completed/pending</p>
                  </div>
                </div>

                {filteredProjects.length === 0 ? (
                  <div className="empty-panel">
                    <FolderKanban size={48} className="empty-icon" />
                    <h4>No matching projects</h4>
                    <p>Try adjusting your search query or status filter.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Project Name & Details</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Attachment</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => (
                          <tr
                            key={project.id}
                            className={String(project.id) === selectedProjectId ? 'highlight-row' : ''}
                          >
                            <td className="text-muted">#{project.id}</td>
                            <td>
                              <div className="table-title-cell">
                                <strong>{project.title}</strong>
                                <span className="table-subtext">{project.description || 'No description'}</span>
                              </div>
                            </td>
                            <td>
                              <div className="cell-with-icon">
                                <Calendar size={14} />
                                <span>{project.due_date}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`status-pill ${project.status ? 'status-completed' : 'status-pending'}`}
                                onClick={() => handleToggleProjectStatus(project.id)}
                                title="Click to toggle status"
                              >
                                {project.status ? (
                                  <>
                                    <CheckCircle2 size={13} /> Completed
                                  </>
                                ) : (
                                  <>
                                    <Clock size={13} /> Pending
                                  </>
                                )}
                              </button>
                            </td>
                            <td>
                              {project.filename ? (
                                <button
                                  type="button"
                                  className="file-link-btn"
                                  onClick={() => handleDownloadFile(project.id, project.filename)}
                                  title="Download Spec File"
                                >
                                  <Download size={14} />
                                  <span>{project.filename.replace(/^\d+_/, '')}</span>
                                </button>
                              ) : (
                                <span className="text-muted">None</span>
                              )}
                            </td>
                            <td className="text-right actions-cell">
                              <button
                                type="button"
                                className={`btn btn-xs ${
                                  String(project.id) === selectedProjectId ? 'btn-primary' : 'btn-outline'
                                }`}
                                onClick={() => {
                                  setSelectedProjectId(String(project.id));
                                  setActiveTab('tasks');
                                }}
                                title="Open tasks for this project"
                              >
                                Tasks
                              </button>
                              <button
                                type="button"
                                className="icon-btn-danger"
                                onClick={() => handleDeleteProject(project.id, project.title)}
                                title="Delete Project"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: TASKS (MAIN FEATURES, FORMS, TABLES) */}
          {/* ==================================================== */}
          {activeTab === 'tasks' && (
            <div className="tasks-view">
              {/* Project Selector Bar */}
              <div className="project-selector-card">
                <div className="selector-left">
                  <label htmlFor="project-dropdown-select">Active Project:</label>
                  <div className="select-wrapper">
                    <select
                      id="project-dropdown-select"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.title} ({p.status ? 'Completed' : 'Pending'})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                </div>

                {selectedProjectObj && (
                  <div className="project-badge-summary">
                    <span className="summary-pill">
                      Status:{' '}
                      <strong className={selectedProjectObj.status ? 'text-success' : 'text-warning'}>
                        {selectedProjectObj.status ? 'Completed' : 'In Progress'}
                      </strong>
                    </span>
                    <span className="summary-pill">
                      Tasks: <strong>{tasks.length}</strong> (
                      {tasks.filter((t) => t.status).length} done)
                    </span>
                  </div>
                )}
              </div>

              {/* Add Task Form (Collapsible) */}
              {showNewTaskForm && (
                <div className="form-card-container">
                  <div className="form-card-header">
                    <div className="header-icon-title">
                      <CheckSquare size={20} className="text-primary" />
                      <h3>
                        Add Task to {selectedProjectObj ? `"${selectedProjectObj.title}"` : 'Project'}
                      </h3>
                    </div>
                    <button type="button" className="icon-btn" onClick={() => setShowNewTaskForm(false)}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTask} className="modern-form">
                    <div className="form-row">
                      <div className="form-group flex-2">
                        <label>
                          Task Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Implement Responsive Dashboard Layout"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group flex-1">
                        <label>
                          Due Date <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          value={taskForm.dueDate}
                          onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Task Description</label>
                      <textarea
                        rows={2}
                        placeholder="Detail the steps, acceptance criteria, or endpoints involved..."
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Technology / Tech Stack <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Spring Boot, MySQL"
                        value={taskForm.tech}
                        onChange={(e) => setTaskForm({ ...taskForm, tech: e.target.value })}
                        required
                      />
                      <div className="tech-tags-list">
                        <small className="text-muted">Quick Presets:</small>
                        {TECH_PRESETS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className={`tag-btn ${taskForm.tech.includes(tag) ? 'active' : ''}`}
                            onClick={() => setTaskForm({ ...taskForm, tech: tag })}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-actions-row">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowNewTaskForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <RefreshCw size={16} className="spin" /> Adding...
                          </>
                        ) : (
                          'Save Task'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tasks Toolbar */}
              <div className="filter-toolbar">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                  />
                  {taskSearch && (
                    <button type="button" className="search-clear-btn" onClick={() => setTaskSearch('')}>
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="filter-group">
                  <div className="filter-select-wrapper">
                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="false">Pending</option>
                      <option value="true">Done</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                  </div>

                  <div className="filter-select-wrapper">
                    <select
                      value={taskTechFilter}
                      onChange={(e) => setTaskTechFilter(e.target.value)}
                    >
                      <option value="">All Tech</option>
                      {TECH_PRESETS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                  </div>
                </div>
              </div>

              {/* Tasks Data Table */}
              <div className="panel-box">
                <div className="panel-box-header">
                  <div>
                    <h3>
                      {selectedProjectObj ? `Tasks for "${selectedProjectObj.title}"` : 'Project Tasks'}{' '}
                      ({filteredTasks.length})
                    </h3>
                    <p className="panel-box-subtitle">
                      Toggle checkbox to update task completion in real time
                    </p>
                  </div>
                </div>

                {filteredTasks.length === 0 ? (
                  <div className="empty-panel">
                    <CheckSquare size={48} className="empty-icon" />
                    <h4>No tasks found</h4>
                    <p>
                      {selectedProjectId
                        ? 'Add tasks manually or use the AI Planner to generate tasks!'
                        : 'Please select a project to view and manage its tasks.'}
                    </p>
                    {selectedProjectId && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowNewTaskForm(true)}
                      >
                        <Plus size={16} /> Add Task
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>Done</th>
                          <th>Task Title & Scope</th>
                          <th>Technology</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map((task) => (
                          <tr key={task.id} className={task.status ? 'row-completed' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                className="custom-checkbox"
                                checked={Boolean(task.status)}
                                onChange={() => handleToggleTaskStatus(task.id)}
                                title="Toggle Complete"
                              />
                            </td>
                            <td>
                              <div className="table-title-cell">
                                <strong className={task.status ? 'task-done-strike' : ''}>
                                  {task.title}
                                </strong>
                                <span className="table-subtext">
                                  {task.description || 'No description.'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="tech-badge">
                                <Tag size={12} />
                                {task.tech || 'Fullstack'}
                              </span>
                            </td>
                            <td>
                              <div className="cell-with-icon">
                                <Calendar size={14} />
                                <span>{task.due_date}</span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-pill ${
                                  task.status ? 'status-completed' : 'status-pending'
                                }`}
                              >
                                {task.status ? 'Completed' : 'Pending'}
                              </span>
                            </td>
                            <td className="text-right actions-cell">
                              <button
                                type="button"
                                className="icon-btn-danger"
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                title="Delete Task"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: AI TASK PLANNER */}
          {/* ==================================================== */}
          {activeTab === 'ai' && (
            <div className="ai-planner-view">
              <div className="ai-hero-card">
                <div className="ai-hero-header">
                  <div className="ai-avatar-badge">
                    <Sparkles size={24} className="glow-icon" />
                  </div>
                  <div>
                    <h3>AI Development Task Generator</h3>
                    <p>
                      Enter your feature or project idea to let the system generate structured development tasks with tech stacks.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGenerateAITasks} className="ai-prompt-form">
                  <div className="form-group">
                    <label>Project or Feature Description</label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Build an authenticated real-time chat application with group channels, file uploads, and online presence indicators..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ai-presets-row">
                    <small className="text-muted">Sample Ideas:</small>
                    {AI_SUGGESTIONS.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        className="suggestion-chip"
                        onClick={() => setAiPrompt(sug)}
                      >
                        {sug.slice(0, 42)}...
                      </button>
                    ))}
                  </div>

                  <div className="ai-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={aiLoading}>
                      {aiLoading ? (
                        <>
                          <RefreshCw size={16} className="spin" /> Analyzing & Generating Tasks...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Generate Task Plan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* AI Generated Output Section */}
              {parsedAiTasks.length > 0 && (
                <div className="panel-box">
                  <div className="panel-box-header">
                    <div>
                      <h3>Generated Task Roadmap ({parsedAiTasks.length} tasks)</h3>
                      <p className="panel-box-subtitle">
                        Add any task directly to your currently active project
                      </p>
                    </div>
                  </div>

                  <div className="ai-task-cards-grid">
                    {parsedAiTasks.map((aiTask, idx) => (
                      <div key={idx} className="ai-task-card">
                        <div className="ai-card-top">
                          <span className="ai-task-number">Step {idx + 1}</span>
                          <span className="tech-badge">
                            <Tag size={12} />
                            {aiTask.tech}
                          </span>
                        </div>
                        <h4 className="ai-task-title">{aiTask.title}</h4>
                        <p className="ai-task-desc">{aiTask.description}</p>

                        <div className="ai-card-footer">
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => handleAddAiTaskToCurrentProject(aiTask)}
                            title={`Add "${aiTask.title}" to project`}
                          >
                            <Plus size={14} /> Add to Active Project
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiResultText && parsedAiTasks.length === 0 && (
                <div className="panel-box">
                  <div className="panel-box-header">
                    <h3>Raw AI Response</h3>
                  </div>
                  <pre className="ai-raw-text">{aiResultText}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
