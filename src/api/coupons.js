// Coupon API Service
import { apiCall } from './config';

// Get all coupons
export const getAllCoupons = async (token) => {
  try {
    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/all', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Get all coupons API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch coupons',
    };
  }
};

// Create a new coupon
export const createCoupon = async (token, couponData) => {
  try {
    const formData = new FormData();
    
    // Append all coupon data to FormData
    Object.keys(couponData).forEach(key => {
      if (couponData[key] !== null && couponData[key] !== undefined) {
        formData.append(key, couponData[key]);
      }
    });

    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/create', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon created successfully',
    };
  } catch (error) {
    console.error('Create coupon API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create coupon',
    };
  }
};

// Get all coupon categories
export const getAllCouponCategories = async (token) => {
  try {
    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/category/all', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Get all coupon categories API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch coupon categories',
    };
  }
};

// Create a new coupon category
export const createCouponCategory = async (token, categoryName) => {
  try {
    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/category/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        name: categoryName,
      }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon category created successfully',
    };
  } catch (error) {
    console.error('Create coupon category API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create coupon category',
    };
  }
};

// Delete a coupon category
export const deleteCouponCategory = async (token, categoryId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/category/delete/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon category deleted successfully',
    };
  } catch (error) {
    console.error('Delete coupon category API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete coupon category',
    };
  }
};

// Update a coupon category
export const updateCouponCategory = async (token, categoryId, categoryName) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/category/edit/${categoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        name: categoryName,
      }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon category updated successfully',
    };
  } catch (error) {
    console.error('Update coupon category API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update coupon category',
    };
  }
};

// Delete a coupon
export const deleteCoupon = async (token, couponId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/delete/${couponId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon deleted successfully',
    };
  } catch (error) {
    console.error('Delete coupon API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete coupon',
    };
  }
};

// Update a coupon
export const updateCoupon = async (token, couponId, couponData) => {
  try {
    const formData = new FormData();
    
    // Append all coupon data to FormData
    Object.keys(couponData).forEach(key => {
      if (couponData[key] !== null && couponData[key] !== undefined) {
        formData.append(key, couponData[key]);
      }
    });

    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/edit/${couponId}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return {
      success: response.ok,
      data,
      status: response.status,
      message: data.message || 'Coupon updated successfully',
    };
  } catch (error) {
    console.error('Update coupon API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update coupon',
    };
  }
};
