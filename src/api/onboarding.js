const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "https://api.wayoftrading.com";
  try {
    const origin = new URL(envUrl).origin;
    return `${origin}/api`;
  } catch (e) {
    return "https://api.wayoftrading.com/api";
  }
};

const getToken = () => localStorage.getItem("access_token");

// 1. GET ALL QUESTIONS
export const getOnboardingQuestions = async (customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/questions`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1" || data.data)) {
      return {
        success: true,
        data: data.data || data,
        total: data.data?.total || data.total || 0,
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to fetch onboarding questions",
      };
    }
  } catch (error) {
    console.error("Get Onboarding Questions Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching onboarding questions",
    };
  }
};

// 2. CREATE QUESTION (FormData)
export const createOnboardingQuestion = async (formData, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/questions`, {
      method: "POST",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || "Question created successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create onboarding question",
      };
    }
  } catch (error) {
    console.error("Create Onboarding Question Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating onboarding question",
    };
  }
};

// 3. UPDATE QUESTION (PUT FormData)
export const updateOnboardingQuestion = async (questionId, formData, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/questions/${questionId}`, {
      method: "PUT",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || "Question updated successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update onboarding question",
      };
    }
  } catch (error) {
    console.error("Update Onboarding Question Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while updating onboarding question",
    };
  }
};

// 4. DELETE QUESTION
export const deleteOnboardingQuestion = async (questionId, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        message: data.message || "Question deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete onboarding question",
      };
    }
  } catch (error) {
    console.error("Delete Onboarding Question Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while deleting onboarding question",
    };
  }
};

// 5. CREATE OPTION FOR A QUESTION (POST JSON)
export const createOnboardingOption = async (questionId, optionData, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/questions/${questionId}/options`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(optionData),
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || "Option created successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to create option",
      };
    }
  } catch (error) {
    console.error("Create Onboarding Option Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating option",
    };
  }
};

// 6. UPDATE OPTION (PUT JSON)
export const updateOnboardingOption = async (optionId, optionData, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/options/${optionId}`, {
      method: "PUT",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(optionData),
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        data: data.data || data,
        message: data.message || "Option updated successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to update option",
      };
    }
  } catch (error) {
    console.error("Update Onboarding Option Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while updating option",
    };
  }
};

// 7. DELETE OPTION (DELETE)
export const deleteOnboardingOption = async (optionId, customToken = null) => {
  try {
    const token = customToken || getToken();
    const response = await fetch(`${getBaseUrl()}/admin/onboarding/options/${optionId}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && (data.status === 1 || data.status === "1")) {
      return {
        success: true,
        message: data.message || "Option deleted successfully",
      };
    } else {
      return {
        success: false,
        message: data.message || "Failed to delete option",
      };
    }
  } catch (error) {
    console.error("Delete Onboarding Option Error:", error);
    return {
      success: false,
      message: error.message || "An error occurred while deleting option",
    };
  }
};
