// Tools API Service
export const getAllToolFlags = async (token) => {
  try {
    const response = await fetch('https://api.wayoftrading.com/aitredding/admin/tools/flags', {
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
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch tool flags',
      };
    }
  } catch (error) {
    console.error('Error fetching tool flags:', error);
    return {
      success: false,
      message: 'An error occurred while fetching tool flags',
    };
  }
};

export const updateToolFlag = async (token, toolName, isEnabled, disabledReason = null) => {
  try {
    const formData = new URLSearchParams();
    formData.append('is_enabled', isEnabled);
    if (disabledReason && !isEnabled) {
      formData.append('disabled_reason', disabledReason);
    }

    const response = await fetch(`https://api.wayoftrading.com/aitredding/admin/tools/flags/${toolName}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update tool flag',
      };
    }
  } catch (error) {
    console.error('Error updating tool flag:', error);
    return {
      success: false,
      message: 'An error occurred while updating tool flag',
    };
  }
};