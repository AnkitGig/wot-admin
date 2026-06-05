// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accept': 'application/json',
  },
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    ...apiConfig,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('admin_id');
      localStorage.removeItem('admin_data');
      window.location.href = '/login';
    }

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};
