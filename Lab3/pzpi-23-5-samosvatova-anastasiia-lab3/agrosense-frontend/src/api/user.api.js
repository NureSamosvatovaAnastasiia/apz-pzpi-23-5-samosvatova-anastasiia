import api from './axios';



export const getMyGreenhousesApi = async () => {
  const response = await api.get('/greenhouses');
  return response.data;
};

export const createGreenhouseApi = async (greenhouseData) => {
  const response = await api.post('/greenhouses', greenhouseData);
  return response.data;
};

export const updateGreenhouseApi = async (id, greenhouseData) => {
  const response = await api.put(`/greenhouses/${id}`, greenhouseData);
  return response.data;
};

export const deleteGreenhouseApi = async (id) => {
  const response = await api.delete(`/greenhouses/${id}`);
  return response.data;
};


export const getUserNotificationsApi = async (limit = 50) => {
  const response = await api.get(`/notifications?limit=${limit}`);
  return response.data;
};

export const updateUserProfileApi = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};