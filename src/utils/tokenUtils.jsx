import React from "react";
import axios from "axios";

export const verifyToken = async () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const login = '/login';

  if (!token) {
    return login;
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${apiUrl}/auth/check-token`, config);
    return response.status === 200 ? null : login;
  } catch (error) {
    return login;
  }
};