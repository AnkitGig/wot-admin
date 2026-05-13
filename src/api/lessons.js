const API_BASE_URL = 'https://api.wayoftrading.com/aitredding';

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

export const createLesson = async (chapterId, lessonData, token) => {
  try {
    console.log('[v0] Creating lesson for chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}/lesson`;

    const formData = new FormData();
    formData.append('title_en', lessonData.title_en);
    formData.append('title_fr', lessonData.title_fr || '');
    formData.append('title_es', lessonData.title_es || '');
    formData.append('description_en', lessonData.description_en);
    formData.append('description_fr', lessonData.description_fr || '');
    formData.append('description_es', lessonData.description_es || '');
    formData.append('lesson_number', lessonData.lesson_number || 0);
    
    // Localized durations
    formData.append('duration_en', lessonData.duration_en || lessonData.duration || '');
    formData.append('duration_fr', lessonData.duration_fr || lessonData.duration || '');
    formData.append('duration_es', lessonData.duration_es || lessonData.duration || '');

    formData.append('xp_points', lessonData.xp_points || 0);
    formData.append('reward_points', lessonData.reward_points || 0);
    formData.append('is_preview', lessonData.is_preview || false);
    formData.append('is_locked', lessonData.is_locked || false);
    formData.append('order_number', lessonData.order_number || 0);
    
    // Thumbnail and Media
    if (lessonData.thumbnail instanceof File) {
      formData.append('thumbnail', lessonData.thumbnail);
    }
    if (lessonData.media instanceof File) {
      formData.append('media', lessonData.media);
    }
    
    // Content type
    formData.append('content_type', lessonData.content_type);
    
    // Localized content title
    formData.append('content_title_en', lessonData.content_title_en || '');
    formData.append('content_title_fr', lessonData.content_title_fr || '');
    formData.append('content_title_es', lessonData.content_title_es || '');

    // Localized text content
    formData.append('text_content_en', lessonData.text_content_en || '');
    formData.append('text_content_fr', lessonData.text_content_fr || '');
    formData.append('text_content_es', lessonData.text_content_es || '');

    // Localized content duration
    formData.append('content_duration_en', lessonData.content_duration_en || lessonData.duration || '');
    formData.append('content_duration_fr', lessonData.content_duration_fr || lessonData.duration || '');
    formData.append('content_duration_es', lessonData.content_duration_es || lessonData.duration || '');

    // Localized file size
    formData.append('file_size_en', lessonData.file_size_en || '0');
    formData.append('file_size_fr', lessonData.file_size_fr || '0');
    formData.append('file_size_es', lessonData.file_size_es || '0');

    formData.append('is_downloadable', lessonData.is_downloadable || false);
    formData.append('status', lessonData.status || 'active');
    
    if (lessonData.quiz_available !== undefined) {
      formData.append('quiz_available', lessonData.quiz_available || false);
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

export const updateLessonAdmin = async (lessonId, lessonData, token) => {
  try {
    console.log('[v0] Updating lesson with multilingual content:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}`;

    const formData = new FormData();
    
    // Lesson Basic Info - Multilingual
    formData.append('title_en', lessonData.title_en);
    formData.append('title_fr', lessonData.title_fr || '');
    formData.append('title_es', lessonData.title_es || '');
    
    formData.append('description_en', lessonData.description_en);
    formData.append('description_fr', lessonData.description_fr || '');
    formData.append('description_es', lessonData.description_es || '');
    
    formData.append('duration_en', lessonData.duration_en || '');
    formData.append('duration_fr', lessonData.duration_fr || '');
    formData.append('duration_es', lessonData.duration_es || '');

    // Lesson Settings
    formData.append('lesson_number', lessonData.lesson_number || 0);
    formData.append('xp_points', lessonData.xp_points || 0);
    formData.append('reward_points', lessonData.reward_points || 0);
    formData.append('is_preview', lessonData.is_preview === true || lessonData.is_preview === 'true');
    formData.append('is_locked', lessonData.is_locked === true || lessonData.is_locked === 'true');
    formData.append('quiz_available', lessonData.quiz_available === true || lessonData.quiz_available === 'true');
    
    if (lessonData.order_number !== null && lessonData.order_number !== undefined) {
      formData.append('order_number', lessonData.order_number);
    }
    
    if (lessonData.thumbnail instanceof File) {
      formData.append('thumbnail', lessonData.thumbnail);
    }

    // Lesson Content Info - Multilingual
    formData.append('content_title_en', lessonData.content_title_en || '');
    formData.append('content_title_fr', lessonData.content_title_fr || '');
    formData.append('content_title_es', lessonData.content_title_es || '');
    
    formData.append('content_type', lessonData.content_type || 'text');
    
    formData.append('text_content_en', lessonData.text_content_en || '');
    formData.append('text_content_fr', lessonData.text_content_fr || '');
    formData.append('text_content_es', lessonData.text_content_es || '');
    
    formData.append('content_duration_en', lessonData.content_duration_en || '');
    formData.append('content_duration_fr', lessonData.content_duration_fr || '');
    formData.append('content_duration_es', lessonData.content_duration_es || '');
    
    formData.append('file_size_en', lessonData.file_size_en || '');
    formData.append('file_size_fr', lessonData.file_size_fr || '');
    formData.append('file_size_es', lessonData.file_size_es || '');

    formData.append('is_downloadable', lessonData.is_downloadable === true || lessonData.is_downloadable === 'true');

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

export const createLessonPage = async (lessonId, pageData, token) => {
  try {
    console.log('[v0] Creating lesson page:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page`;

    const formData = new FormData();
    formData.append('title_en', pageData.title_en);
    formData.append('title_fr', pageData.title_fr || '');
    formData.append('title_es', pageData.title_es || '');
    
    formData.append('html_content_en', pageData.html_content_en);
    formData.append('html_content_fr', pageData.html_content_fr || '');
    formData.append('html_content_es', pageData.html_content_es || '');

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

export const importLessonPageFromJSON = async (lessonId, file, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/pages/upload-json`;
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    if (data.status === 1 || response.status === 200) {
      return {
        success: true,
        data: data.data,
        message: data.message || 'Pages imported successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to import pages',
      };
    }
  } catch (error) {
    console.error('Import Lesson Page API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during import',
    };
  }
};

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

export const getLessonPageAdmin = async (lessonId, pageId, token) => {
  try {
    console.log('[v0] Fetching lesson page details:', pageId, 'for lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page/${pageId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Get lesson page admin response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch page details',
      };
    }
  } catch (error) {
    console.error('Get Lesson Page Admin API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching page details',
    };
  }
};

export const generateLessonQuiz = async (lessonId, config, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/generate-quiz`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        question_count: config.question_count || 10,
        difficulty: config.difficulty || 'medium',
      }),
    });

    const data = await response.json();
    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message || 'Quiz generated successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to generate quiz',
      };
    }
  } catch (error) {
    console.error('Generate Quiz API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while generating quiz',
    };
  }
};

export const getLessonQuiz = async (lessonId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/quiz`;
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
        quiz_available: data.quiz_available,
        total_questions: data.total_questions,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch quiz details',
      };
    }
  } catch (error) {
    console.error('Get Quiz API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching quiz details',
    };
  }
};

export const updateLessonQuiz = async (quizId, quizData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/quiz/${quizId}`;
    
    // Using URLSearchParams for application/x-www-form-urlencoded as per screenshot
    const body = new URLSearchParams();
    Object.entries(quizData).forEach(([key, value]) => {
      body.append(key, value);
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: body.toString(),
    });

    const data = await response.json();
    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message || 'Quiz updated successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update quiz',
      };
    }
  } catch (error) {
    console.error('Update Quiz API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating quiz',
    };
  }
};

export const deleteLessonQuiz = async (quizId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/quiz/${quizId}`;
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
        message: data.message || 'Quiz deleted successfully',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete quiz',
      };
    }
  } catch (error) {
    console.error('Delete Quiz API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting quiz',
    };
  }
};

export const updateLessonPage = async (lessonId, pageId, pageData, token) => {
  try {
    console.log('[v0] Updating lesson page:', pageId, 'for lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}/page/${pageId}`;

    const formData = new FormData();
    formData.append('title_en', pageData.title_en);
    formData.append('title_fr', pageData.title_fr || '');
    formData.append('title_es', pageData.title_es || '');
    
    formData.append('html_content_en', pageData.html_content_en);
    formData.append('html_content_fr', pageData.html_content_fr || '');
    formData.append('html_content_es', pageData.html_content_es || '');

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
