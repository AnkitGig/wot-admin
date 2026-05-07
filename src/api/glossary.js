const API_BASE_URL = 'https://api.wayoftrading.com/aitredding';

export const addGlossary = async (glossaryData, token) => {
  try {
    const url = `${API_BASE_URL}/admin/create-TradingGlossary`;

    const payload = {
      term: glossaryData.term,
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

export const searchGlossaries = async (token, query, page = 1, limit = 10) => {
  try {
    const url = `${API_BASE_URL}/admin/glossary/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

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
        message: data.message || 'Search results fetched successfully',
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
        message: data.message || 'No results found',
        data: [],
        pagination: { page, limit, total: 0, count: 0 },
      };
    }
  } catch (error) {
    console.error('Search Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while searching',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, count: 0 },
    };
  }
};

export const getGlossaryById = async (glossaryId, token) => { 
  try {
    const url = `${API_BASE_URL}/admin/TradingGlossary/${glossaryId}`;

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

export const updateGlossary = async (glossaryId, glossaryData, token) => {
  try {
    const url = `${API_BASE_URL}/admin/update-tradingGlossary/${glossaryId}`;

    // Payload is already in the required multilingual format from the frontend
    // No need to transform – just send it as is.
    const payload = {
      term: glossaryData.term,           // { en, fr, es }
      short_form: glossaryData.short_form || "",
      category: glossaryData.category,   // { en, fr, es }
      description: glossaryData.description, // { en, fr, es }
      // Include color only if your backend supports it and you have it
      // color: glossaryData.color,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update Glossary HTTP Error:', response.status, errorText);
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

export const deleteGlossary = async (glossaryId, token) => {
  try {
    const url = `${API_BASE_URL}/admin/delete-tradingGlossary/${glossaryId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Delete Glossary HTTP Error:', response.status, errorText);
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
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete glossary term',
      };
    }
  } catch (error) {
    console.error('[v0] Delete Glossary API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting glossary term',
    };
  }
};

export const deleteAllGlossaries = async (ids, token) => {
  try {
    const url = `${API_BASE_URL}/admin/bulk-delete-tradingGlossary`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete All Glossaries HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.status === 1 || response.status === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message || 'Glossaries deleted successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete selected glossaries',
      };
    }
  } catch (error) {
    console.error('Delete All Glossaries API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting selected glossaries',
    };
  }
};

export const importGlossaryFromJSON = async (
  file,
  token
) => {
  try {
    console.log('api called')
    // validation
    if (!file) {
      return {
        success: false,
        message: "Please select a JSON file",
      };
    }

    // file type validation
    if (
      file.type !== "application/json" &&
      !file.name.endsWith(".json")
    ) {
      return {
        success: false,
        message:
          "Only JSON files are allowed",
      };
    }

    const url = `${API_BASE_URL}/admin/upload-glossary-json`;

    // form data
    const formData = new FormData();

    formData.append("file", file);

    // api request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      body: formData,
    });

    // parse response safely
    let data = {};

    try {
      data = await response.json();
    } catch (err) {
      console.error(
        "JSON Parse Error:",
        err
      );
    }

    console.log(
      "Import API Response:",
      data
    );

    // error handling
    if (!response.ok) {
      return {
        success: false,
        message:
          data?.detail ||
          data?.message ||
          `HTTP Error ${response.status}`,
      };
    }

    // success
    if (
      data.status === 1 ||
      response.status === 200
    ) {
      return {
        success: true,
        data: data.data || data,
        message:
          data.message ||
          "Glossary imported successfully",
      };
    }

    // fallback
    return {
      success: false,
      message:
        data.message ||
        "Failed to import glossary",
    };
  } catch (error) {
    console.error(
      "Import Glossary API Error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Something went wrong while importing glossary",
    };
  }
};

export const addGlossaryCategory = async (categoryData, token) => {
  try {
    const url = `${API_BASE_URL}/admin/glossary-category`;

    const formData = new URLSearchParams();
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description || '');
    formData.append('color', categoryData.color || '#000000');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: formData.toString(),
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
        message: data.message || 'Glossary category added successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to add glossary category',
      };
    }
  } catch (error) {
    console.error('Add Glossary Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding glossary category',
    };
  }
};

export const getAllGlossaryCategories = async (token, page = 1, limit = 10, search = '') => {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const url = `${API_BASE_URL}/admin/glossary-categories?page=${page}&limit=${limit}`;

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
        message: data.message || 'Glossary categories fetched successfully',
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
        message: data.message || 'Failed to fetch glossary categories',
        data: [],
        pagination: { page, limit, total: 0, count: 0 },
      };
    }
  } catch (error) {
    console.error('Get Glossary Categories API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching glossary categories',
      data: [],
      pagination: { page: 1, limit: 10, total: 0, count: 0 },
    };
  }
};

export const getGlossaryCategoryById = async (categoryId, token) => {
  try {
    const url = `${API_BASE_URL}/admin/glossary-category/${categoryId}`;

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
        message: data.message || 'Failed to fetch glossary category',
      };
    }
  } catch (error) {
    console.error('Get Glossary Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching glossary category',
    };
  }
};

export const updateGlossaryCategory = async (
  
  categoryId,
  categoryData,
  token
) => {
  console.log('updateGlossaryCategory called')
  try {
    const url = `${API_BASE_URL}/admin/glossary-category/${categoryId}?lang=en`;

    // JSON payload
    const payload = {
      name: {
        en: categoryData.name_en,
        fr: categoryData.name_fr,
        es: categoryData.name_es,
      },
      description:
        categoryData.description || "",
      color:
        categoryData.color || "#000000",
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Update Glossary Category HTTP Error:",
        response.status,
        errorText
      );

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
        message: data.message,
      };
    } else {
      return {
        success: false,
        message:
          data.message ||
          "Failed to update glossary category",
      };
    }
  } catch (error) {
    console.error(
      "Update Glossary Category API Error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "An error occurred while updating glossary category",
    };
  }
};

export const deleteGlossaryCategory = async (categoryId, token) => {
  try {
    const url = `${API_BASE_URL}/admin/glossary-category/${categoryId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete Glossary Category HTTP Error:', response.status, errorText);
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
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete glossary category',
      };
    }
  } catch (error) {
    console.error('Delete Glossary Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting glossary category',
    };
  }
};