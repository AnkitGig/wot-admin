const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const getNews = async (token, limit = 50) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news?limit=${limit}`, {
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

export const getNewsById = async (token, newsId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}`, {
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

export const updateNews = async (token, newsId, newsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}`, {
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

export const deleteNews = async (token, newsId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}`, {
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

export const deleteAllNews = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news`, {
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

export const publishNews = async (token, newsId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}/publish`, {
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
        message: data.message || 'News published successfully',
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

export const featureNews = async (token, newsId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/news/${newsId}/feature`, {
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
        message: data.message || 'News featured successfully',
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
