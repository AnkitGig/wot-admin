const API_BASE_URL = 'https://api.wayoftrading.com/aitredding';

// Add new glossary term
export const addGlossary = async (glossaryData, token) => {
  try {
    const url = `${API_BASE_URL}/admin/create-TradingGlossary`;
    
    const payload = {
      term: glossaryData.term,
      short_form: glossaryData.short_form,
      category: glossaryData.category,
      description: glossaryData.description,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status === 1 || response.status === 200) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || 'Glossary added successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to add glossary',
      };
    }
  } catch (error) {
    console.error('Add Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding glossary',
    };
  }
};

// Get all glossary terms with pagination
export const getAllGlossaries = async (token, page = 1, limit = 10) => {
  try {
    const url = `${API_BASE_URL}/admin/TradingGlossary?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
        data: [],
        pagination: { page, limit, total: 0, count: 0 },
      };
    }

    const data = await response.json();

    if (data.status === 1) {
      return {
        success: true,
        data: data.data || [],
        message: data.message || 'Glossaries fetched successfully',
        pagination: {
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || 0,
          count: data.count || 0,
        },
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch glossaries',
        data: [],
        pagination: { page, limit, total: 0, count: 0 },
      };
    }
  } catch (error) {
    console.error('Get Glossaries API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching glossaries',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, count: 0 },
    };
  }
};

// Get single glossary term
export const getGlossaryById = async (glossaryId, token) => {
  try {
    const url = `${API_BASE_URL}/admin/get-TradingGlossary/${glossaryId}`;
    
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
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch glossary',
      };
    }
  } catch (error) {
    console.error('Get Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching glossary',
    };
  }
};

// Update glossary term
export const updateGlossary = async (glossaryId, glossaryData, token) => {
  try {
    const url = `${API_BASE_URL}/admin/update-TradingGlossary/${glossaryId}`;
    
    const payload = {
      term: glossaryData.term,
      short_form: glossaryData.short_form,
      category: glossaryData.category,
      description: glossaryData.description,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(payload),
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
        message: data.message || 'Failed to update glossary term',
      };
    }
  } catch (error) {
    console.error('Update Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating glossary term',
    };
  }
};

// Delete glossary term
export const deleteGlossary = async (glossaryId, token) => {
  try {
    const url = `${API_BASE_URL}/admin/delete-TradingGlossary/${glossaryId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
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
        message: data.message || 'Failed to delete glossary term',
      };
    }
  } catch (error) {
    console.error('Delete Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting glossary term',
    };
  }
};
