const API_BASE_URL = 'https://api.wayoftrading.com/aitredding/quiz';

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
    const url = new URL(`${API_BASE_URL}/admin/all-quizzes`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    const response = await fetch(url.toString(), { method: 'GET', headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.detail || 'Failed to fetch quizzes', status: response.status };
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getQuizById = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/quiz/${quizId}`, { 
      method: 'GET', 
      headers: getAuthHeaders() 
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.detail || 'Failed to fetch quiz', status: response.status };
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadPdf = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/upload-file`, { method: 'POST', headers: getAuthHeaders(), body: formData });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || 'Failed to upload PDF', status: response.status };
    return { success: response.ok, data, status: response.status };
  } catch (error) {
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
    formData.append('top10_coupon_id', quizData.top10_coupon_id || '');
    formData.append('top25_reward_percent', quizData.top25_reward_percent || 60);
    formData.append('participation_reward_percent', quizData.participation_reward_percent || 10);
    formData.append('max_attempts', quizData.max_attempts || 2);
    formData.append('is_featured', quizData.is_featured || false);
    formData.append('is_sponsored', quizData.is_sponsored || false);
    if (quizData.image) formData.append('image', quizData.image);
    const response = await fetch(`${API_BASE_URL}/generate`, { method: 'POST', headers: getAuthHeaders(), body: formData });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.detail || data.message || 'Failed to create quiz', status: response.status };
    return { success: response.ok, data, status: response.status };
  } catch (error) {
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
    formData.append('top10_coupon_id', quizData.top10_coupon_id || '');
    if (quizData.translations) {
      formData.append('translations', JSON.stringify(quizData.translations));
    }
    if (quizData.image) formData.append('image', quizData.image);
    const response = await fetch(`${API_BASE_URL}/${quizId}/edit`, { method: 'PATCH', headers: getAuthHeaders(), body: formData });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || data.detail || 'Failed to update quiz', status: response.status };
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const editQuizQuestions = async (quizId, questions) => {
  try {
    if (!questions || !Array.isArray(questions) || questions.length === 0)
      return { success: false, error: 'Questions data is required and must be a non-empty array' };
    const formData = new FormData();
    formData.append('questions', JSON.stringify(questions));
    const response = await fetch(`${API_BASE_URL}/${quizId}/edit-questions`, { method: 'PATCH', headers: getAuthHeaders(), body: formData });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || data.detail || 'Failed to edit quiz questions', status: response.status };
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadQuestionImage = async (quizId, questionId, imageFile) => {
  try {
    console.log('[v0] Uploading image for question:', questionId, 'in quiz:', quizId);
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await fetch(`${API_BASE_URL}/${quizId}/question/${questionId}/image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || data.detail || 'Failed to upload question image', status: response.status };
    console.log('[v0] Question image uploaded:', questionId, data);
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteQuestionImage = async (quizId, questionId) => {
  try {
    console.log('[v0] Deleting image for question:', questionId, 'in quiz:', quizId);
    const response = await fetch(`${API_BASE_URL}/${quizId}/question/${questionId}/image`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || data.detail || 'Failed to delete question image', status: response.status };
    console.log('[v0] Question image deleted:', questionId);
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${quizId}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || data.detail || 'Failed to delete quiz', status: response.status };
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getQuizStats = async (quizId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/quiz-stats/${quizId}`, { method: 'GET', headers: getAuthHeaders() });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.detail || 'Failed to fetch quiz statistics', status: response.status };
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};