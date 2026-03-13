import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token may be expired");
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

export const chatService = {
  getChannels: () => api.get("/channels/my"),

  getMessages: (channelId) =>
    api.get(`/messages/${channelId}`),

  // ✅ supports text + file upload
  sendMessage: (data) => api.post("/messages", data),
  createChannel: (data) => api.post("/channels", data),

  getMembers: (channelId) =>
    api.get(`/channels/${channelId}/members`),

  removeMember: (channelId, userId) =>
    api.delete(`/channels/${channelId}/remove/${userId}`),

  muteMember: (channelId, userId) =>
    api.patch(`/channels/${channelId}/mute/${userId}`),

  unmuteMember: (channelId, userId) =>
    api.patch(`/channels/${channelId}/unmute/${userId}`),
};

export const aiService = {
  chat: (data) => api.post("/ai/chat", data),
};

export default api;
