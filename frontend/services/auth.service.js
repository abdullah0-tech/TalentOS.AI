import { request } from './api';

export const authService = {
  async register(companyName, name, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: { companyName, name, email, password },
    });
    
    if (data.token) {
      localStorage.setItem('hireflow_token', data.token);
      localStorage.setItem('hireflow_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    if (data.token) {
      localStorage.setItem('hireflow_token', data.token);
      localStorage.setItem('hireflow_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('hireflow_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('hireflow_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('hireflow_token');
    }
    return false;
  },

  async changePassword(currentPassword, newPassword) {
    const data = await request('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('hireflow_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.mustChangePassword = false;
        localStorage.setItem('hireflow_user', JSON.stringify(user));
      }
    }
    return data;
  },

  async resetPassword(userId) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: { userId },
    });
  }
};
