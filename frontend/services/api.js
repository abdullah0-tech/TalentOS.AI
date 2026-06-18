const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://33c840159fa13e83-103-129-14-160.serveousercontent.com/api';

/**
 * Base HTTP request handler with token injection and content-type parsing.
 */
export const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...options.headers,
  };

  // Inject token if running in the browser and present in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hireflow_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  // Correct header injection for file uploads (FormData handles its own boundaries)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = options.body;
  } else if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Attempt to parse JSON response
    const contentType = response.headers.get('content-type');
    let data = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred during this request.');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};
