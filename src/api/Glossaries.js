// src/api/glossary.js

const BASE_URL = 'https://api.wayoftrading.com/aitredding';

// token direct storage se uthao
const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
};

const getHeaders = (isJson = true) => {
  const token = getToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Create Glossary
export const addGlossaryCategory = async (data) => {
    console.log('api called')
  try {
    const response = await fetch(`${BASE_URL}/admin/glossary-category?lang=en`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Upload Glossary JSON
export const uploadGlossaryJson = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/upload-glossary-json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Get All Glossaries
export const getAllGlossaries = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/TradingGlossary?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.message,
    };
  }
};

// Search Glossaries
export const searchGlossaries = async (
  search,
  page = 1,
  limit = 10
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/TradingGlossary?search=${encodeURIComponent(
        search
      )}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.message,
    };
  }
};

// Update Glossary
export const updateGlossary = async (id, data) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/update-tradingGlossary/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Delete Single Glossary
export const deleteGlossary = async (id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/delete-tradingGlossary/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Bulk Delete Glossaries
export const deleteAllGlossaries = async (ids) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/bulk-delete-tradingGlossary`,
      {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Delete All Glossaries
export const deleteEveryGlossary = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/delete-all-tradingGlossary`,
      {
        method: "DELETE",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Glossary Categories
export const getAllGlossaryCategories = async (
  page = 1,
  limit = 100
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/admin/glossary-categories?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.message,
    };
  }
};