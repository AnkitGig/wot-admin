import { apiConfig } from './config';

const API_BASE_URL = 'https://api.wayoftrading.com/aitredding';

export const addCourse = async (courseData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/course`;
    const formData = new FormData();
    formData.append('title_en', courseData.title_en);
    formData.append('title_fr', courseData.title_fr || '');
    formData.append('title_es', courseData.title_es || '');
    formData.append('slug', courseData.slug);
    formData.append('description_en', courseData.description_en);
    formData.append('description_fr', courseData.description_fr || '');
    formData.append('description_es', courseData.description_es || '');
    formData.append('short_description_en', courseData.short_description_en || '');
    formData.append('short_description_fr', courseData.short_description_fr || '');
    formData.append('short_description_es', courseData.short_description_es || '');
    formData.append('objectives_en', courseData.objectives_en);
    formData.append('objectives_fr', courseData.objectives_fr || '');
    formData.append('objectives_es', courseData.objectives_es || '');
    formData.append('what_you_will_learn_en', courseData.what_you_will_learn_en || '');
    formData.append('what_you_will_learn_fr', courseData.what_you_will_learn_fr || '');
    formData.append('what_you_will_learn_es', courseData.what_you_will_learn_es || '');
    formData.append('requirements_en', courseData.requirements_en || '');
    formData.append('requirements_fr', courseData.requirements_fr || '');
    formData.append('requirements_es', courseData.requirements_es || '');
    formData.append('target_audience_en', courseData.target_audience_en || '');
    formData.append('target_audience_fr', courseData.target_audience_fr || '');
    formData.append('target_audience_es', courseData.target_audience_es || '');
    formData.append('duration_in_minutes', courseData.duration_in_minutes);
    formData.append('level_en', courseData.level_en || courseData.level || '');
    formData.append('level_fr', courseData.level_fr || '');
    formData.append('level_es', courseData.level_es || '');
    formData.append('language_en', courseData.language_en || courseData.language || 'English');
    formData.append('language_fr', courseData.language_fr || '');
    formData.append('language_es', courseData.language_es || '');
    formData.append('price', courseData.price || 0);
    formData.append('is_free', courseData.is_free || false);
    formData.append('is_featured', courseData.is_featured || false);
    formData.append('status', courseData.status || 'draft');
    formData.append('certificate_available', courseData.certificate_available || false);

    if (courseData.image instanceof File) {
      formData.append('image', courseData.image);
    }
    if (courseData.thumbnail instanceof File) {
      formData.append('thumbnail', courseData.thumbnail);
    }
    if (courseData.intro_video instanceof File) {
      formData.append('intro_video', courseData.intro_video);
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
        message: data.message || 'Failed to create course',
      };
    }
  } catch (error) {
    console.error('Add Course API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding course',
    };
  }
};

export const getAllCourses = async (token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/courses`;

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
        message: data.message || 'Failed to fetch courses',
      };
    }
  } catch (error) {
    console.error('Get Courses API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching courses',
    };
  }
};

export const getCourseById = async (courseId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}`;

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
        message: data.message || 'Failed to fetch course',
      };
    }
  } catch (error) {
    console.error('Get Course API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching course',
    };
  }
};

export const updateCourse = async (courseId, courseData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}`;

    const formData = new FormData();
    formData.append('title_en', courseData.title_en);
    formData.append('title_fr', courseData.title_fr || '');
    formData.append('title_es', courseData.title_es || '');
    formData.append('slug', courseData.slug);
    formData.append('description_en', courseData.description_en);
    formData.append('description_fr', courseData.description_fr || '');
    formData.append('description_es', courseData.description_es || '');
    formData.append('short_description_en', courseData.short_description_en || '');
    formData.append('short_description_fr', courseData.short_description_fr || '');
    formData.append('short_description_es', courseData.short_description_es || '');
    formData.append('objectives_en', courseData.objectives_en);
    formData.append('objectives_fr', courseData.objectives_fr || '');
    formData.append('objectives_es', courseData.objectives_es || '');
    formData.append('what_you_will_learn_en', courseData.what_you_will_learn_en || '');
    formData.append('what_you_will_learn_fr', courseData.what_you_will_learn_fr || '');
    formData.append('what_you_will_learn_es', courseData.what_you_will_learn_es || '');
    formData.append('requirements_en', courseData.requirements_en || '');
    formData.append('requirements_fr', courseData.requirements_fr || '');
    formData.append('requirements_es', courseData.requirements_es || '');
    formData.append('target_audience_en', courseData.target_audience_en || '');
    formData.append('target_audience_fr', courseData.target_audience_fr || '');
    formData.append('target_audience_es', courseData.target_audience_es || '');
    formData.append('duration_in_minutes', courseData.duration_in_minutes);
    formData.append('level_en', courseData.level_en || courseData.level || '');
    formData.append('level_fr', courseData.level_fr || '');
    formData.append('level_es', courseData.level_es || '');
    formData.append('language_en', courseData.language_en || courseData.language || 'English');
    formData.append('language_fr', courseData.language_fr || '');
    formData.append('language_es', courseData.language_es || '');
    formData.append('price', courseData.price || 0);
    formData.append('is_free', String(courseData.is_free === true || courseData.is_free === 'true'));
    formData.append('is_featured', String(courseData.is_featured === true || courseData.is_featured === 'true'));
    formData.append('status', courseData.status || 'draft');
    formData.append('certificate_available', String(courseData.certificate_available === true || courseData.certificate_available === 'true'));

    if (courseData.image instanceof File) {
      formData.append('image', courseData.image);
    }
    if (courseData.thumbnail instanceof File) {
      formData.append('thumbnail', courseData.thumbnail);
    }
    if (courseData.intro_video instanceof File) {
      formData.append('intro_video', courseData.intro_video);
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
        message: data.message || 'Failed to update course',
      };
    }
  } catch (error) {
    console.error('Update Course API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating course',
    };
  }
};

export const deleteCourse = async (courseId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}`;

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
        message: data.message || 'Failed to delete course',
      };
    }
  } catch (error) {
    console.error('Delete Course API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting course',
    };
  }
};

export const getCategoriesByCourse = async (courseId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/course/category/${courseId}`;

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
        data: data.categories || [],
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch categories',
      };
    }
  } catch (error) {
    console.error('Get Categories API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching categories',
    };
  }
};

export const addCategory = async (courseId, categoryData, token) => {
  try {
    console.log('[v0] Adding category for course:', courseId);
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}/category`;

    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description || '');
    if (categoryData.order_number !== null && categoryData.order_number !== undefined) {
      formData.append('order_number', categoryData.order_number);
    }
    formData.append('status', categoryData.status || '');
    if (categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
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
    console.log('[v0] Add category response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create category',
      };
    }
  } catch (error) {
    console.error('Add Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while adding category',
    };
  }
};

export const getChaptersByCategory = async (categoryId, token) => {
  try {
    console.log('[v0] Fetching chapters for category:', categoryId);
    const url = `${API_BASE_URL}/courses/admin/category/${categoryId}/chapters`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Chapters response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.chapters || [],
        categoryId: data.category_id,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch chapters',
      };
    }
  } catch (error) {
    console.error('Get Chapters API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching chapters',
    };
  }
};

export const getLessonsByChapter = async (chapterId, token) => {
  try {
    console.log('[v0] Fetching lessons for chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}/lessons`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Lessons response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.lessons || [],
        chapterId: data.chapter_id,
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

export const createChapter = async (categoryId, chapterData, token) => {
  try {
    console.log('[v0] Creating chapter for category:', categoryId);
    const url = `${API_BASE_URL}/courses/admin/category/${categoryId}/chapter`;

    const formData = new FormData();
    formData.append('title_en', chapterData.title_en);
    formData.append('title_fr', chapterData.title_fr || '');
    formData.append('title_es', chapterData.title_es || '');
    formData.append('description_en', chapterData.description_en || '');
    formData.append('description_fr', chapterData.description_fr || '');
    formData.append('description_es', chapterData.description_es || '');
    formData.append('chapter_number', chapterData.chapter_number || 0);
    formData.append('duration', chapterData.duration || '');
    formData.append('total_duration', chapterData.total_duration || 0);
    formData.append('is_locked', chapterData.is_locked || false);
    if (chapterData.order_number !== null && chapterData.order_number !== undefined) {
      formData.append('order_number', chapterData.order_number);
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
    console.log('[v0] Create chapter response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create chapter',
      };
    }
  } catch (error) {
    console.error('Create Chapter API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating chapter',
    };
  }
};

export const createCourseChapter = async (courseId, chapterData, token) => {
  try {
    console.log('[v0] Creating chapter for course:', courseId);
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}/chapter`;

    const formData = new FormData();
    formData.append('title_en', chapterData.title_en);
    formData.append('title_fr', chapterData.title_fr || '');
    formData.append('title_es', chapterData.title_es || '');
    formData.append('category', chapterData.category || '');
    formData.append('category_id', chapterData.category_id || 0);
    formData.append('description_en', chapterData.description_en || '');
    formData.append('description_fr', chapterData.description_fr || '');
    formData.append('description_es', chapterData.description_es || '');
    formData.append('chapter_number', chapterData.chapter_number || 0);
    formData.append('duration_en', chapterData.duration_en || chapterData.duration || '');
    formData.append('duration_fr', chapterData.duration_fr || chapterData.duration || '');
    formData.append('duration_es', chapterData.duration_es || chapterData.duration || '');
    formData.append('is_locked', chapterData.is_locked || false);
    formData.append('order_number', chapterData.order_number || 0);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Create course chapter response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to create chapter',
      };
    }
  } catch (error) {
    console.error('Create Course Chapter API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating chapter',
    };
  }
};

export const getCourseChapters = async (courseId, token) => {
  try {
    console.log('[v0] Fetching chapters for course:', courseId);
    const url = `${API_BASE_URL}/courses/admin/course/${courseId}/chapters`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Course chapters response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch chapters',
      };
    }
  } catch (error) {
    console.error('Get Course Chapters API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching chapters',
    };
  }
};

export const updateCourseChapter = async (chapterId, chapterData, token) => {
  try {
    console.log('[v0] Updating chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}`;

    const formData = new FormData();
    formData.append('title_en', chapterData.title_en);
    formData.append('title_fr', chapterData.title_fr || '');
    formData.append('title_es', chapterData.title_es || '');
    formData.append('category', chapterData.category || '');
    formData.append('category_id', chapterData.category_id || 0);
    formData.append('description_en', chapterData.description_en || '');
    formData.append('description_fr', chapterData.description_fr || '');
    formData.append('description_es', chapterData.description_es || '');
    formData.append('chapter_number', chapterData.chapter_number || 0);
    formData.append('duration_en', chapterData.duration_en || chapterData.duration || '');
    formData.append('duration_fr', chapterData.duration_fr || chapterData.duration || '');
    formData.append('duration_es', chapterData.duration_es || chapterData.duration || '');
    formData.append('is_locked', chapterData.is_locked || false);
    formData.append('order_number', chapterData.order_number || 0);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
      body: formData,
    });

    const data = await response.json();
    console.log('[v0] Update chapter response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to update chapter',
      };
    }
  } catch (error) {
    console.error('Update Course Chapter API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating chapter',
    };
  }
};

export const deleteCourseChapter = async (chapterId, token) => {
  try {
    console.log('[v0] Deleting chapter:', chapterId);
    const url = `${API_BASE_URL}/courses/admin/chapter/${chapterId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Delete chapter response:', data);

    if (data.status === 1) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to delete chapter',
      };
    }
  } catch (error) {
    console.error('Delete Course Chapter API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting chapter',
    };
  }
};

export const getAllAdminCategories = async (token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/categories`;

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
        data: data.data || [],
        message: data.message,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch categories',
      };
    }
  } catch (error) {
    console.error('Get All Admin Categories API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching categories',
    };
  }
};

export const createAdminCategory = async (categoryData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/category`;

    const formData = new FormData();
    formData.append('name_en', categoryData.name_en || categoryData.name || '');
    formData.append('name_fr', categoryData.name_fr || '');
    formData.append('name_es', categoryData.name_es || '');
    formData.append('description_en', categoryData.description_en || categoryData.description || '');
    formData.append('description_fr', categoryData.description_fr || '');
    formData.append('description_es', categoryData.description_es || '');
    
    if (categoryData.order_number !== null && categoryData.order_number !== undefined) {
      formData.append('order_number', categoryData.order_number);
    }
    formData.append('is_active', categoryData.is_active !== false);
    if (categoryData.icon instanceof File) {
      formData.append('icon', categoryData.icon);
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
        message: data.message || 'Failed to create category',
      };
    }
  } catch (error) {
    console.error('Create Admin Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while creating category',
    };
  }
};

export const getAdminCategoryById = async (categoryId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/category/${categoryId}`;

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
        message: data.message || 'Failed to fetch category',
      };
    }
  } catch (error) {
    console.error('Get Admin Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching category',
    };
  }
};

export const updateAdminCategory = async (categoryId, categoryData, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/category/${categoryId}`;

    const formData = new FormData();
    formData.append('name_en', categoryData.name_en || categoryData.name || '');
    formData.append('name_fr', categoryData.name_fr || '');
    formData.append('name_es', categoryData.name_es || '');
    formData.append('description_en', categoryData.description_en || categoryData.description || '');
    formData.append('description_fr', categoryData.description_fr || '');
    formData.append('description_es', categoryData.description_es || '');
    
    if (categoryData.order_number !== null && categoryData.order_number !== undefined) {
      formData.append('order_number', categoryData.order_number);
    }
    formData.append('is_active', categoryData.is_active !== false);
    if (categoryData.icon instanceof File) {
      formData.append('icon', categoryData.icon);
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
        message: data.message || 'Failed to update category',
      };
    }
  } catch (error) {
    console.error('Update Admin Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while updating category',
    };
  }
};

export const deleteAdminCategory = async (categoryId, token) => {
  try {
    const url = `${API_BASE_URL}/courses/admin/category/${categoryId}`;

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
        message: data.message || 'Failed to delete category',
      };
    }
  } catch (error) {
    console.error('Delete Admin Category API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while deleting category',
    };
  }
};

export const deleteLesson = async (lessonId, token) => {
  try {
    console.log('[v0] Deleting lesson:', lessonId);
    const url = `${API_BASE_URL}/courses/admin/lesson/${lessonId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    console.log('[v0] Delete lesson response:', data);

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
