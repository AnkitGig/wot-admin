const API_BASE_URL = "https://api.wayoftrading.com/aitredding";

// 🔥 TOKEN
const getToken = () => localStorage.getItem("access_token");

// 🔥 COMMON HEADERS
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  accept: "application/json",
});


// ================= GET =================
export const getBrokers = async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/tools/brokers`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await res.json();

    return data.status === 1
      ? { success: true, data: data.data }
      : { success: false, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};



// ================= CREATE (FormData) =================
export const createBroker = async (formData) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/tools/brokers`,
      {
        method: "POST",
        headers: getHeaders(), // ❗ no content-type
        body: formData,
      }
    );

    const data = await res.json();

    return data.status === 1
      ? { success: true, data: data.data }
      : { success: false, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};



// ================= UPDATE (FormData) =================
export const updateBroker = async (brokerId, formData) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/tools/brokers/${brokerId}`,
      {
        method: "PATCH", // ⚠️ many APIs use POST for form update
        headers: getHeaders(),
        body: formData,
      }
    );

    const data = await res.json();

    return data.status === 1
      ? { success: true, data: data.data }
      : { success: false, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};



// ================= DELETE =================
export const deleteBroker = async (brokerId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/admin/tools/brokers/${brokerId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data = await res.json();

    return data.status === 1
      ? { success: true }
      : { success: false, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};