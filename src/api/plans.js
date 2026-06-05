const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllPlans = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/plans`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        total: data.total,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch plans',
      };
    }
  } catch (error) {
    console.error('Plans API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching plans',
    };
  }
};

export const createPlan = async (token, planData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/plans`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create plan',
      };
    }
  } catch (error) {
    console.error('Create Plan API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating plan',
    };
  }
};

export const updatePlan = async (token, planId, planData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/plans/${planId}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update plan',
      };
    }
  } catch (error) {
    console.error('Update Plan API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating plan',
    };
  }
};

export const deletePlan = async (token, planId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/plans/${planId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        message: data.message || 'Plan deleted successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete plan',
      };
    }
  } catch (error) {
    console.error('Delete Plan API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting plan',
    };
  }
};