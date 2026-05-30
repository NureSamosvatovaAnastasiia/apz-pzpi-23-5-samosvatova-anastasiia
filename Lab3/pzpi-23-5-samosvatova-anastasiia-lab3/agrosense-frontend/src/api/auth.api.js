import api from './axios';



export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const verifyEmailApi = async (email, code) => {
  const response = await api.post('/auth/verify', { email, code });
  return response.data;
};