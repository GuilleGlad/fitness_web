import axios from 'axios';
import toast from 'react-hot-toast';

const SESSION_EXPIRED_MESSAGE = 'Debe iniciar sesion nuevamente';
let redirectTimer = null;

const hasAuthorizationHeader = (config) => {
  const headers = config?.headers;

  if (!headers) return false;
  if (typeof headers.get === 'function') {
    return Boolean(headers.get('Authorization') || headers.get('authorization'));
  }

  return Boolean(headers.Authorization || headers.authorization);
};

const isAuthenticationRequest = (config) => {
  const url = config?.url || '';
  return /\/auth\/(login|register|logout)(?:\/|\?|$)/.test(url);
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config;

    if (
      [401, 403].includes(status) &&
      hasAuthorizationHeader(config) &&
      !isAuthenticationRequest(config) &&
      !redirectTimer
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('client_id');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('status');
      localStorage.removeItem('genre');

      toast.error(SESSION_EXPIRED_MESSAGE, { duration: 3000 });
      redirectTimer = setTimeout(() => {
        redirectTimer = null;
        window.location.assign('/login');
      }, 3000);
    }

    return Promise.reject(error);
  }
);