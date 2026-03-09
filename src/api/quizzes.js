const API_BASE_URL = 'https://api.wayoftrading.com/aitredding/quiz';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('[v0] No authentication token found in localStorage');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    'accept': 'application/json',
  };
};

export const getAllQuizzes = async (page = 1, limit = 10) => {
  try {
    console.log('[v0] Fetching all quizzes - Page:', page, 'Limit:', limit);
    
    const url = new URL(`${API_BASE_URL}/admin/all-quizzes`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Failed to fetch quizzes:', data);
      return { success: false, error: data.detail || 'Failed to fetch quizzes', status: response.status };
    }

    console.log('[v0] Quizzes fetched successfully:', data.total_quizzes, 'Page:', data.current_page);
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('[v0] Error fetching quizzes:', error);
    return { success: false, error: error.message };
  }
};

export const uploadPdf = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('[v0] Uploading PDF:', file.name);

    const response = await fetch(`${API_BASE_URL}/upload-file`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[v0] PDF upload failed:', data);
      return { success: false, error: data.message || 'Failed to upload PDF', status: response.status };
    }

    console.log('[v0] PDF uploaded successfully:', data.pdf_id);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] PDF Upload Error:', error);
    return { success: false, error: error.message };
  }
};

export const generateQuiz = async (quizData) => {
  try {
    const formData = new FormData();
    
    formData.append('pdf_id', quizData.pdf_id);
    formData.append('title', quizData.title);
    formData.append('description', quizData.description || '');
    formData.append('start_datetime', quizData.start_datetime || '');
    formData.append('end_datetime', quizData.end_datetime || '');
    formData.append('max_participants', quizData.max_participants || 0);
    formData.append('entry_type', quizData.entry_type || 'FREE');
    formData.append('entry_fee', quizData.entry_fee || 0);
    formData.append('prize_pool', quizData.prize_pool || 0);
    formData.append('prize_description', quizData.prize_description || '');
    formData.append('top10_reward_percent', quizData.top10_reward_percent || 100);
    formData.append('top25_reward_percent', quizData.top25_reward_percent || 60);
    formData.append('participation_reward_percent', quizData.participation_reward_percent || 10);
    formData.append('max_attempts', quizData.max_attempts || 2);
    formData.append('is_featured', quizData.is_featured || false);
    formData.append('is_sponsored', quizData.is_sponsored || false);
    formData.append('featured_order', quizData.featured_order || 0);
    
    if (quizData.image) {
      formData.append('image', quizData.image);
    }

    console.log('[v0] Creating quiz with title:', quizData.title);

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Quiz generation failed:', data);
      return { success: false, error: data.detail || data.message || 'Failed to create quiz', status: response.status };
    }

    console.log('[v0] Quiz created successfully:', data);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] Quiz Generation Error:', error);
    return { success: false, error: error.message };
  }
};

export const updateQuiz = async (quizId, quizData) => {
  try {
    const formData = new FormData();
    
    formData.append('title', quizData.title);
    formData.append('description', quizData.description || '');
    formData.append('start_datetime', quizData.start_datetime || '');
    formData.append('end_datetime', quizData.end_datetime || '');
    formData.append('max_participants', quizData.max_participants || 0);
    formData.append('entry_type', quizData.entry_type || 'FREE');
    formData.append('entry_fee', quizData.entry_fee || 0);
    formData.append('prize_pool', quizData.prize_pool || 0);
    formData.append('prize_description', quizData.prize_description || '');
    formData.append('top10_reward_percent', quizData.top10_reward_percent || 100);
    formData.append('top25_reward_percent', quizData.top25_reward_percent || 60);
    formData.append('participation_reward_percent', quizData.participation_reward_percent || 10);
    formData.append('max_attempts', quizData.max_attempts || 2);
    formData.append('is_featured', quizData.is_featured || false);
    formData.append('is_sponsored', quizData.is_sponsored || false);
    formData.append('featured_order', quizData.featured_order || 0);
    
    if (quizData.image) {
      formData.append('image', quizData.image);
    }

    console.log('[v0] Updating quiz with PATCH:', quizId, 'title:', quizData.title);

    const response = await fetch(`${API_BASE_URL}/${quizId}/edit`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Quiz update failed:', data);
      return { success: false, error: data.message || data.detail || 'Failed to update quiz', status: response.status };
    }

    console.log('[v0] Quiz updated successfully:', quizId);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] Quiz Update Error:', error);
    return { success: false, error: error.message };
  }
};

export const editQuizQuestions = async (quizId, questions) => {
  try {
    console.log('[v0] Editing quiz questions for quiz:', quizId, 'Questions count:', questions.length);
    console.log('[v0] Questions data:', JSON.stringify(questions, null, 2));

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error('[v0] Invalid questions data:', questions);
      return { success: false, error: 'Questions data is required and must be a non-empty array' };
    }
    const formData = new FormData();
    formData.append('questions', JSON.stringify(questions));
    
    console.log('[v0] FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(`${API_BASE_URL}/${quizId}/edit-questions`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Response data:', data);

    if (!response.ok) {
      console.error('[v0] Quiz questions edit failed:', data);
      return { success: false, error: data.message || data.detail || 'Failed to edit quiz questions', status: response.status };
    }

    console.log('[v0] Quiz questions edited successfully:', quizId);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] Quiz Questions Edit Error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    console.log('[v0] Deleting quiz:', quizId);

    const response = await fetch(`${API_BASE_URL}/${quizId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Quiz deletion failed:', data);
      return { success: false, error: data.message || data.detail || 'Failed to delete quiz', status: response.status };
    }

    console.log('[v0] Quiz deleted successfully:', quizId);
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('[v0] Quiz Deletion Error:', error);
    return { success: false, error: error.message };
  }
};

export const getQuizStats = async (quizId) => {
  try {
    console.log('[v0] Fetching quiz statistics for:', quizId);

    const response = await fetch(`${API_BASE_URL}/admin/quiz-stats/${quizId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Failed to fetch quiz statistics:', data);
      return { success: false, error: data.detail || 'Failed to fetch quiz statistics', status: response.status };
    }

    console.log('[v0] Quiz statistics fetched successfully:', quizId);
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error('[v0] Error fetching quiz statistics:', error);
    return { success: false, error: error.message };
  }
};
