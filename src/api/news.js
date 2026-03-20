import { apiCall } from './config';

// Get news list with pagination
export const getNews = async (token, limit = 50) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news?limit=${limit}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch news',
      };
    }
  } catch (error) {
    console.error('Get News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching news',
    };
  }
};

// Get news by ID
export const getNewsById = async (token, newsId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news/${newsId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch news',
      };
    }
  } catch (error) {
    console.error('Get News by ID API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching news',
    };
  }
};

// Update news by ID
export const updateNews = async (token, newsId, newsData) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news/${newsId}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update news',
      };
    }
  } catch (error) {
    console.error('Update News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating news',
    };
  }
};

// Delete news by ID
export const deleteNews = async (token, newsId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news/${newsId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete news',
      };
    }
  } catch (error) {
    console.error('Delete News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting news',
    };
  }
};

// Delete all news
export const deleteAllNews = async (token) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete all news',
      };
    }
  } catch (error) {
    console.error('Delete All News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting all news',
    };
  }
};

// Publish news by ID
export const publishNews = async (token, newsId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news/${newsId}/publish`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to publish news',
      };
    }
  } catch (error) {
    console.error('Publish News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while publishing news',
    };
  }
};

// Feature news by ID
export const featureNews = async (token, newsId) => {
  try {
    const response = await fetch(`https://api.wayoftrading.com/aitredding/api/admin/news/${newsId}/feature`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to feature news',
      };
    }
  } catch (error) {
    console.error('Feature News API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while featuring news',
    };
  }
};
