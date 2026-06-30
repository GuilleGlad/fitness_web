import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || '';
const apiClient = axios.create({
  baseURL: apiUrl,
});

let isRefreshing = false;
let refreshSubscribers = [];

const getToken = () => localStorage.getItem('token');

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const refreshToken = () => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.post(`${apiUrl}/auth/refresh-token`, null, { headers });
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = config;
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshToken();
      const newToken = refreshResponse.data?.token || refreshResponse.data?.accessToken || refreshResponse.data?.access_token;

      if (!newToken) {
        return Promise.reject(error);
      }

      localStorage.setItem('token', newToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      onRefreshed(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
