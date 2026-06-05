const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const FAQ_API_URL = '/admin/support/faq';

export const getFAQs = async (token) => {
  try {
    const url = `${API_BASE_URL}${FAQ_API_URL}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        data: data.data || [],
        message: data.message || 'FAQs fetched successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch FAQs',
        data: [],
      };
    }
  } catch (error) {
    console.error('Get FAQs API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching FAQs',
      data: [],
    };
  }
};

export const createFAQ = async (data, token) => {
  try {
    const url = `${API_BASE_URL}${FAQ_API_URL}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const responseData = await response.json();

    if (responseData.status === 1 || response.status === 201 || response.status === 200) {
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message || 'FAQ created successfully',
      };
    } else {
      return {
        success: false,
        message: responseData.message || 'Failed to create FAQ',
      };
    }
  } catch (error) {
    console.error('Create FAQ API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating FAQ',
    };
  }
};

export const updateFAQ = async (id, data, token) => {
  try {
    const url = `${API_BASE_URL}${FAQ_API_URL}/${id}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update FAQ HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const responseData = await response.json();

    if (responseData.status === 1) {
      return {
        success: true,
        data: responseData.data,
        message: responseData.message || 'FAQ updated successfully',
      };
    } else {
      return {
        success: false,
        message: responseData.message || 'Failed to update FAQ',
      };
    }
  } catch (error) {
    console.error('Update FAQ API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating FAQ',
    };
  }
};

export const deleteFAQ = async (id, token) => {
  try {
    const url = `${API_BASE_URL}${FAQ_API_URL}/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete FAQ HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message || 'FAQ deleted successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete FAQ',
      };
    }
  } catch (error) {
    console.error('Delete FAQ API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting FAQ',
    };
  }
};