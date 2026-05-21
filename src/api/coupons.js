const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('[Coupons] No authentication token found in localStorage');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'accept': 'application/json',
  };
};

export const getAllCoupons = async () => {
  try {
    console.log('[Coupons] Fetching all coupons');

    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/all', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    console.log('[Coupons] API Response:', data);

    if (!response.ok) {
      console.error('[Coupons] Failed to fetch coupons:', data);
      return { success: false, error: data.detail || 'Failed to fetch coupons', status: response.status };
    }

    console.log('[Coupons] Coupons fetched successfully');
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('[Coupons] Error fetching coupons:', error);
    return { success: false, error: error.message };
  }
};

export const createCoupon = async (token, couponData) => {
  try {
    const formData = new FormData();
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

export const createCouponCategory = async (token, categoryName) => {
  try {
    // categoryName is expected to be an object like {"en": "Travel", "es": "Viajes", "fr": "Voyage"}
    const nameValue = typeof categoryName === 'string' ? categoryName : JSON.stringify(categoryName);

    const response = await fetch('https://api.wayoftrading.com/aitredding/coupon/admin/category/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        name: nameValue,
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

export const updateCouponCategory = async (token, categoryId, categoryName) => {
  try {
    // categoryName is expected to be an object like {"en": "Travel", "es": "Viajes", "fr": "Voyage"}
    const nameValue = typeof categoryName === 'string' ? categoryName : JSON.stringify(categoryName);

    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/category/edit/${categoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({
        name: nameValue,
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


export const updateCoupon = async (token, couponId, couponData) => {
  try {
    const formData = new FormData();
    Object.keys(couponData).forEach(key => {
      if (couponData[key] !== null && couponData[key] !== undefined) {
        formData.append(key, couponData[key]);
      }
    });

    const response = await fetch(`https://api.wayoftrading.com/aitredding/coupon/admin/edit/${couponId}`, {
      method: 'PATCH',
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
