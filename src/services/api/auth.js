const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
}; 