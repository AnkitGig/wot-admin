// src/api/courseCategory.js

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token") ||
    ""
  );
};

const getHeaders = (isJson = true) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Create Category
export const createCourseCategory = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/courses/admin/category`, {
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

// Get All Categories
export const getAllCourseCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/courses/admin/categories`, {
      method: "GET",
      headers: getHeaders(false),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.message,
    };
  }
};

// Get Single Category
export const getCourseCategoryById = async (categoryId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/courses/admin/category/${categoryId}`,
      {
        method: "GET",
        headers: getHeaders(false),
      }
    );

    return await response.json();
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
};

// Update Category
export const updateCourseCategory = async (categoryId, data) => {
  try {
    const response = await fetch(
      `${BASE_URL}/courses/admin/category/${categoryId}`,
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

// Delete Category
export const deleteCourseCategory = async (categoryId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/courses/admin/category/${categoryId}`,
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