const API_BASE_URL = 'https://api.wayoftrading.com/aitredding';

// Get all lessons for a course
export const getLessonsByCourse = async (courseId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/${courseId}/lessons`;
    
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
        message: data.message || 'Failed to fetch lessons',
      };
    }
  } catch (error) {
    console.error('Get Lessons API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching lessons',
    };
  }
};

// Get single lesson
export const getLessonById = async (lessonId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/lessons/${lessonId}`;
    
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
        message: data.message || 'Failed to fetch lesson',
      };
    }
  } catch (error) {
    console.error('Get Lesson API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching lesson',
    };
  }
};

// Update lesson
export const updateLesson = async (courseId, lessonId, lessonData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/lessons/${lessonId}/update`;
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('content', lessonData.content);
    formData.append('content_type', lessonData.content_type);
    formData.append('duration', lessonData.duration || '');
    formData.append('order', lessonData.order);
    
    if (lessonData.media instanceof File) {
      formData.append('media', lessonData.media);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
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
        message: data.message || 'Failed to update lesson',
      };
    }
  } catch (error) {
    console.error('Update Lesson API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating lesson',
    };
  }
};

// Delete lesson
export const deleteLesson = async (lessonId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/lessons/${lessonId}/delete`;
    
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
        message: data.message || 'Failed to delete lesson',
      };
    }
  } catch (error) {
    console.error('Delete Lesson API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting lesson',
    };
  }
};

// Get lesson content
export const getLessonContent = async (lessonId, token) => {
  try {
    console.log('[v0] Fetching lesson content for lessonId:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/content`;
    console.log('[v0] API URL:', url);
    console.log('[v0] Token present:', !!token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Get Lesson Content HTTP Error:', response.status, errorText);
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
        message: data.message || 'Failed to fetch lesson content',
      };
    }
  } catch (error) {
    console.error('[v0] Get Lesson Content API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching lesson content',
    };
  }
};

// Add new lesson
export const addLesson = async (courseId, lessonData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/${courseId}/lessons/add`;
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('content', lessonData.content);
    formData.append('content_type', lessonData.content_type);
    formData.append('duration', lessonData.duration || '');
    formData.append('order', lessonData.order);
    formData.append('text_content', lessonData.text_content);
    if (lessonData.media instanceof File) {
      formData.append('media', lessonData.media);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
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
        message: data.message || 'Failed to add lesson',
      };
    }
  } catch (error) {
    console.error('Add Lesson API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding lesson',
    };
  }
};

// Create lesson content
export const createLessonContent = async (lessonId, contentData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/content`;
    
    const formData = new FormData();
    formData.append('title', contentData.title);
    formData.append('content_type', contentData.content_type);
    
    if (contentData.text_content) {
      formData.append('text_content', contentData.text_content);
    }
    if (contentData.duration) {
      formData.append('duration', contentData.duration);
    }
    if (contentData.file_size) {
      formData.append('file_size', contentData.file_size);
    }
    if (contentData.is_downloadable !== undefined && contentData.is_downloadable !== null) {
      formData.append('is_downloadable', contentData.is_downloadable);
    }
    if (contentData.order_number !== undefined && contentData.order_number !== null) {
      formData.append('order_number', contentData.order_number);
    }
    if (contentData.media instanceof File) {
      formData.append('media', contentData.media);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Create Content HTTP Error:', response.status, errorText);
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
        message: data.message || 'Failed to create lesson content',
      };
    }
  } catch (error) {
    console.error('[v0] Create Content API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating lesson content',
    };
  }
};

// Create lesson in chapter
export const createLesson = async (chapterId, lessonData, token) => {
  try {
    console.log('[v0] Creating lesson for chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}/lesson`;
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('content_type', lessonData.content_type);
    formData.append('lesson_number', lessonData.lesson_number || 0);
    formData.append('duration', lessonData.duration || '');
    formData.append('xp_points', lessonData.xp_points || 0);
    formData.append('reward_points', lessonData.reward_points || 0);
    formData.append('is_preview', lessonData.is_preview || false);
    formData.append('is_locked', lessonData.is_locked || false);
    formData.append('quiz_available', lessonData.quiz_available || false);
    formData.append('is_downloadable', lessonData.is_downloadable || false);
    formData.append('status', lessonData.status || 'active');
    if (lessonData.order_number !== null && lessonData.order_number !== undefined) {
      formData.append('order_number', lessonData.order_number);
    }
    if (lessonData.thumbnail instanceof File) {
      formData.append('thumbnail', lessonData.thumbnail);
    }
    if (lessonData.media instanceof File) {
      formData.append('media', lessonData.media);
    }
    if (lessonData.content_title) {
      formData.append('content_title', lessonData.content_title);
    }
    if (lessonData.text_content) {
      formData.append('text_content', lessonData.text_content);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Create lesson response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create lesson',
      };
    }
  } catch (error) {
    console.error('Create Lesson API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating lesson',
    };
  }
};

// Update lesson at /courses/admin/lesson/{lesson_id}
export const updateLessonAdmin = async (lessonId, lessonData, token) => {
  try {
    console.log('[v0] Updating lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}`;
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('lesson_number', lessonData.lesson_number || 0);
    formData.append('duration', lessonData.duration || '');
    formData.append('xp_points', lessonData.xp_points || 0);
    formData.append('reward_points', lessonData.reward_points || 0);
    formData.append('is_preview', lessonData.is_preview || false);
    formData.append('is_locked', lessonData.is_locked || false);
    if (lessonData.order_number !== null && lessonData.order_number !== undefined) {
      formData.append('order_number', lessonData.order_number);
    }
    if (lessonData.thumbnail instanceof File) {
      formData.append('thumbnail', lessonData.thumbnail);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Update lesson admin response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update lesson',
      };
    }
  } catch (error) {
    console.error('Update Lesson Admin API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating lesson',
    };
  }
};

// Add lesson to chapter at /courses/admin/chapter/{chapter_id}/lesson
export const addLessonToChapter = async (chapterId, lessonData, token) => {
  try {
    console.log('[v0] Adding lesson to chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}/lesson`;
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('lesson_number', lessonData.lesson_number || 0);
    formData.append('duration', lessonData.duration || '');
    formData.append('xp_points', lessonData.xp_points || 0);
    formData.append('reward_points', lessonData.reward_points || 0);
    formData.append('is_preview', lessonData.is_preview || false);
    formData.append('is_locked', lessonData.is_locked || false);
    if (lessonData.order_number !== null && lessonData.order_number !== undefined) {
      formData.append('order_number', lessonData.order_number);
    }
    if (lessonData.thumbnail instanceof File) {
      formData.append('thumbnail', lessonData.thumbnail);
    }
    if (lessonData.content_title) {
      formData.append('content_title', lessonData.content_title);
    }
    if (lessonData.content_type) {
      formData.append('content_type', lessonData.content_type);
    }
    if (lessonData.text_content) {
      formData.append('text_content', lessonData.text_content);
    }
    if (lessonData.content_duration) {
      formData.append('content_duration', lessonData.content_duration);
    }
    if (lessonData.file_size) {
      formData.append('file_size', lessonData.file_size);
    }
    if (lessonData.is_downloadable !== undefined && lessonData.is_downloadable !== null) {
      formData.append('is_downloadable', lessonData.is_downloadable);
    }
    if (lessonData.media instanceof File) {
      formData.append('media', lessonData.media);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Add lesson to chapter response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to add lesson to chapter',
      };
    }
  } catch (error) {
    console.error('Add Lesson To Chapter API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding lesson to chapter',
    };
  }
};

// Get lesson details at /courses/admin/lesson/{lesson_id}
export const getLessonAdmin = async (lessonId, token) => {
  try {
    console.log('[v0] Fetching lesson details:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Get lesson admin response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch lesson details',
      };
    }
  } catch (error) {
    console.error('Get Lesson Admin API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching lesson details',
    };
  }
};

// Create lesson page at /courses/admin/lesson/{lesson_id}/page
export const createLessonPage = async (lessonId, pageData, token) => {
  try {
    console.log('[v0] Creating lesson page:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page`;
    
    const formData = new FormData();
    formData.append('title', pageData.title);
    formData.append('html_content', pageData.html_content);
    
    if (pageData.image instanceof File) {
      formData.append('image', pageData.image);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Create Page HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[v0] Create lesson page response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create lesson page',
      };
    }
  } catch (error) {
    console.error('Create Lesson Page API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating lesson page',
    };
  }
};

// Delete lesson page at /courses/admin/lesson/{lesson_id}/page/{page_id}
export const deleteLessonPage = async (lessonId, pageId, token) => {
  try {
    console.log('[v0] Deleting lesson page:', pageId, 'for lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page/${pageId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Delete Page HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[v0] Delete lesson page response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete lesson page',
      };
    }
  } catch (error) {
    console.error('Delete Lesson Page API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting lesson page',
    };
  }
};

// Update lesson page at /courses/admin/lesson/{lesson_id}/page/{page_id}
export const updateLessonPage = async (lessonId, pageId, pageData, token) => {
  try {
    console.log('[v0] Updating lesson page:', pageId, 'for lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page/${pageId}`;
    
    const formData = new FormData();
    formData.append('title', pageData.title);
    formData.append('html_content', pageData.html_content);
    
    if (pageData.image instanceof File) {
      formData.append('image', pageData.image);
    }
    
    if (pageData.remove_image !== undefined && pageData.remove_image !== null) {
      formData.append('remove_image', pageData.remove_image);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[v0] Update Page HTTP Error:', response.status, errorText);
      return {
        success: false,
        message: `HTTP Error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[v0] Update lesson page response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update lesson page',
      };
    }
  } catch (error) {
    console.error('Update Lesson Page API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating lesson page',
    };
  }
};
