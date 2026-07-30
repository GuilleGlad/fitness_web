import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Logout = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const clearSession = async () => {
      try {
        if (apiUrl) {
          await axios.post(`${apiUrl}/auth/logout`);
        }
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Always clear localStorage regardless of API call success/failure
        // Always clear localStorage regardless of API call success/failure
        const keysToClear = ['token', 'role', 'name', 'client_id', 'status'];
        keysToClear.forEach(key => {
          localStorage.removeItem(key);
        });
        navigate('/login', { replace: true });
      }
    };

    clearSession();
  }, [apiUrl, navigate]);

  return null;
};

export default Logout;
