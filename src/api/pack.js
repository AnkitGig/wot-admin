const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PACKS_API_URL = '/admin/tools/recharge-packs';

export const getPacks = async (token) => {
  try {
    const url = `${API_BASE_URL}${PACKS_API_URL}`;

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
        total: data.total || 0,
        message: data.message || 'Packs fetched successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch packs',
        data: [],
      };
    }
  } catch (error) {
    console.error('Get Packs API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching packs',
      data: [],
    };
  }
};

export const createPack = async (data, token) => {
  try {
    const url = `${API_BASE_URL}${PACKS_API_URL}`;

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
      console.error('Create Pack HTTP Error:', response.status, errorText);
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
        message: responseData.message || 'Pack created successfully',
      };
    } else {
      return {
        success: false,
        message: responseData.message || 'Failed to create pack',
      };
    }
  } catch (error) {
    console.error('Create Pack API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating pack',
    };
  }
};

export const updatePack = async (id, data, token) => {
  try {
    const url = `${API_BASE_URL}${PACKS_API_URL}/${id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update Pack HTTP Error:', response.status, errorText);
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
        message: responseData.message || 'Pack updated successfully',
      };
    } else {
      return {
        success: false,
        message: responseData.message || 'Failed to update pack',
      };
    }
  } catch (error) {
    console.error('Update Pack API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating pack',
    };
  }
};

export const deletePack = async (id, token) => {
  try {
    const url = `${API_BASE_URL}${PACKS_API_URL}/${id}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete Pack HTTP Error:', response.status, errorText);
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
        message: data.message || 'Pack deleted successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete pack',
      };
    }
  } catch (error) {
    console.error('Delete Pack API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting pack',
    };
  }
};