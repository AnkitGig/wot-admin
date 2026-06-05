const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllToolFlags = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/flags`, {
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

export const broadcastNotification = async (token, notificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/broadcast-notification`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Notification sent successfully',
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to send notification',
      };
    }
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return {
      success: false,
      message: 'An error occurred while broadcasting notification',
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

    const response = await fetch(`${API_BASE_URL}/admin/tools/flags/${toolName}`, {
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

export const getEmailTemplates = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/email-templates`, {
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
        message: data.message || 'Failed to fetch email templates',
      };
    }
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return {
      success: false,
      message: 'An error occurred while fetching email templates',
    };
  }
};

export const updateEmailTemplate = async (token, id, templateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/email-templates/${id}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Template updated successfully',
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update template',
      };
    }
  } catch (error) {
    console.error('Error updating email template:', error);
    return {
      success: false,
      message: 'An error occurred while updating template',
    };
  }
};

export const getBrokerEntitlements = async (token, page = 1, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/broker-entitlements?page=${page}&limit=${limit}`, {
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
        data: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch broker entitlements',
      };
    }
  } catch (error) {
    console.error('Error fetching broker entitlements:', error);
    return {
      success: false,
      message: 'An error occurred while fetching broker entitlements',
    };
  }
};

export const getBrokerReviewQueue = async (token, page = 1, limit = 20, status = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/admin/tools/broker/queue?${params}`, {
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
        data: data.data || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch broker review queue',
      };
    }
  } catch (error) {
    console.error('Error fetching broker review queue:', error);
    return {
      success: false,
      message: 'An error occurred while fetching broker review queue',
    };
  }
};

export const extendBrokerAccess = async (token, { subscriptionId, daysToAdd, reason }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/broker/extend`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: Number(subscriptionId),
        days_to_add: Number(daysToAdd),
        reason: reason,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Broker access extended successfully',
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to extend broker access',
      };
    }
  } catch (error) {
    console.error('Error extending broker access:', error);
    return {
      success: false,
      message: 'An error occurred while extending broker access',
    };
  }
};

export const revokeBrokerAccess = async (token, { subscriptionId, reason }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/tools/broker/revoke`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_id: Number(subscriptionId),
        reason: reason,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Broker access revoked successfully',
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to revoke broker access',
      };
    }
  } catch (error) {
    console.error('Error revoking broker access:', error);
    return {
      success: false,
      message: 'An error occurred while revoking broker access',
    };
  }
};