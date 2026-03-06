import { apiCall } from './config';

// Get users list with pagination and filtering
export const getUsers = async (token, page = 1, limit = 10, sortBy = 'id', order = 'desc', search = null, isActive = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: sortBy,
    order: order,
  });

  if (search) {
    params.append('search', search);
  }

  if (isActive !== null) {
    params.append('is_active', isActive.toString());
  }

  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/admin/users?${params}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch users',
      };
    }
  } catch (error) {
    console.error('Get Users API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching users',
    };
  }
};

export const setUserStatus = async (token, userId, isActive) => {
  try {
    console.log('[v0] Setting user status:', { userId, isActive });

    const response = await fetch(`https://api.wayoftrading.com/aitredding/admin/users/${userId}/set-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: isActive
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] User status update failed:', data);
      return { success: false, error: data.message || data.detail || 'Failed to update user status', status: response.status };
    }

    console.log('[v0] User status updated successfully:', { userId, isActive });
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] User Status Update Error:', error);
    return { success: false, error: error.message };
  }
};

// Get user details by ID
export const getUserById = async (token, userId) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
  });
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (token, userId, isActive) => {
  return apiCall(`/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify({
      is_active: isActive,
    }),
  });
};

// Delete user
export const deleteUser = async (token, userId) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
  });
};

// Update user details
export const updateUser = async (token, userId, userData) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'accept': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};
