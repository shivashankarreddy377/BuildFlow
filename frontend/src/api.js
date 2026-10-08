// API Client for Developer Workshop DevProd Application
const configuredApiBase = import.meta.env.VITE_API_BASE_URL;
export function getApiBase() {
  if (configuredApiBase && !configuredApiBase.includes('localhost')) {
    return configuredApiBase.startsWith('http')
      ? configuredApiBase
      : `https://${configuredApiBase}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { hostname, origin } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (hostname.includes('onrender.com')) {
        return origin.replace('developer-productivity-frontend', 'developer-productivity-api');
      }
    }
  }

  return 'http://localhost:8080';
}

const TOKEN_KEY = 'devprod_auth_token';

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || '';
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized or token expired
    window.dispatchEvent(new CustomEvent('devprod:unauthorized'));
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: Request failed`;
    try {
      const errorData = await response.json();
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'object') {
        // e.g. validation errors map { field: "error" }
        errorMessage = Object.values(errorData).join(', ');
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// Authentication
export async function loginUser(username, password) {
  const token = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setStoredToken(token);
  return token;
}

export async function registerUser(username, password, email) {
  const token = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, email }),
  });
  setStoredToken(token);
  return token;
}

export async function getCurrentUser() {
  return apiRequest('/user/me');
}

// Analytics
export async function getAnalytics() {
  return apiRequest('/analytics');
}

// Projects
export async function getProjects({ page = 0, size = 20, title = '', status = null } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);
  if (title) params.append('Title', title);
  if (status !== null && status !== undefined && status !== '') {
    params.append('status', status);
  }
  return apiRequest(`/project?${params.toString()}`);
}

export async function createProject({ title, description, dueDate, file }) {
  const formData = new FormData();
  const projectRequestBlob = new Blob([
    JSON.stringify({
      Title: title,
      description: description || '',
      due_date: dueDate,
    })
  ], { type: 'application/json' });

  formData.append('projectRequest', projectRequestBlob);
  if (file) {
    formData.append('file', file);
  }

  const token = getStoredToken();
  const response = await fetch(`${getApiBase()}/user/project`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let msg = 'Failed to create project';
    try {
      const err = await response.json();
      msg = err.message || err.error || msg;
    } catch {
      const text = await response.text().catch(() => '');
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

export async function toggleProjectStatus(projectId) {
  return apiRequest(`/user/project/${projectId}/toggle-status`, {
    method: 'PATCH',
  });
}

export async function deleteProject(projectId) {
  return apiRequest(`/project/${projectId}`, {
    method: 'DELETE',
  });
}

export async function downloadProjectFile(projectId, filename = 'download') {
  const token = getStoredToken();
  const res = await fetch(`${getApiBase()}/project/${projectId}/file`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Unable to download project file');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Tasks
export async function getProjectTasks(projectId, { page = 0, size = 50, status = null, tech = '' } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('size', size);
  if (status !== null && status !== undefined && status !== '') {
    params.append('status', status);
  }
  if (tech) params.append('tech', tech);

  return apiRequest(`/user/project/${projectId}/task?${params.toString()}`);
}

export async function createTask(projectId, { title, description, dueDate, tech }) {
  return apiRequest(`/user/project/${projectId}/task`, {
    method: 'POST',
    body: JSON.stringify({
      Title: title,
      description: description || '',
      due_date: dueDate,
      Tech: tech,
    }),
  });
}

export async function toggleTaskStatus(taskId) {
  return apiRequest(`/user/project/task/${taskId}/toggle-status`, {
    method: 'PATCH',
  });
}

export async function deleteTask(taskId) {
  return apiRequest(`/user/project/task/${taskId}`, {
    method: 'DELETE',
  });
}

// AI
export async function generateAITasks(projectIdea) {
  return apiRequest('/ai/generate-tasks', {
    method: 'POST',
    body: JSON.stringify({ projectIdea }),
  });
}
