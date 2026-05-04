import axios from "axios";

const api = axios.create({
  baseURL: "https://campussync-pqrs.onrender.com",
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

// ✅ FIXED ROUTES (added /api)
export const authService = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  getMe: () => api.get("/api/auth/me"),
};

export const chatService = {
  getChannels: () => api.get("/api/channels/my"),

  getMessages: (channelId) =>
    api.get(`/api/messages/${channelId}`),

  sendMessage: (data) => api.post("/api/messages", data),
  createChannel: (data) => api.post("/api/channels", data),

  getMembers: (channelId) =>
    api.get(`/api/channels/${channelId}/members`),

  removeMember: (channelId, userId) =>
    api.delete(`/api/channels/${channelId}/remove/${userId}`),

  muteMember: (channelId, userId) =>
    api.patch(`/api/channels/${channelId}/mute/${userId}`),

  unmuteMember: (channelId, userId) =>
    api.patch(`/api/channels/${channelId}/unmute/${userId}`),
};

export const aiService = {
  chat: (data) => api.post("/api/ai/chat", data),
};

export default api;