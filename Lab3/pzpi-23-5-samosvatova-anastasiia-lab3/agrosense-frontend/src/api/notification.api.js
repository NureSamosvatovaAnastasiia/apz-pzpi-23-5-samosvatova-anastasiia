import api from './axios';


export const getAllUserNotificationsApi = async (limit = 50) => {
  const response = await api.get(`/notifications?limit=${limit}`);
  return response.data;
};

export const getGreenhouseNotificationsApi = async (greenhouseId) => {
  const response = await api.get(`/notifications/${greenhouseId}`);
  return response.data;
};

export const markNotificationReadApi = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};