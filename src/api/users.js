import { apiCall } from './config';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
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

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/set-status`, {
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

export const getUserById = async (token, userId) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
  });
};

export const updateUserStatus = async (token, userId, isActive, reason = '') => {
  const formData = new URLSearchParams();
  formData.append('is_active', isActive.toString());
  if (reason) {
    formData.append('reason', reason);
  }
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/set-status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update user status");
  }

  return data;
};

export const deleteUser = async (token, userId) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'accept': 'application/json',
    },
  });
};

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

export const updateUserCoins = async (token, userId, coins) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/user-coins`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        coins: parseInt(coins)
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || 'Failed to update user coins' };
    }

    return { success: true, data, message: data.message || 'Coins updated successfully' };
  } catch (error) {
    console.error('Update User Coins Error:', error);
    return { success: false, message: error.message || 'An error occurred while updating user coins' };
  }
};
