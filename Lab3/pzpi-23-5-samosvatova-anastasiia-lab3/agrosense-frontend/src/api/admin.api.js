import api from './axios';


export const getAdminStatsApi = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminChartsApi = async (days = 7) => {
  const response = await api.get(`/admin/dashboard/charts?days=${days}`);
  return response.data;
};


export const getAllUsersApi = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const deleteUserApi = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const updateUserRoleApi = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};


export const getSystemLogsApi = async () => {
  const response = await api.get('/admin/logs');
  return response.data;
};

export const getAllSystemGreenhousesApi = async () => {
  const response = await api.get('/admin/greenhouses');
  return response.data;
};

export const getAdminGreenhouseDetailsApi = async (greenhouseId) => {
  const response = await api.get(`/admin/greenhouses/${greenhouseId}`);
  return response.data;
};

export const deleteSystemGreenhouseApi = async (greenhouseId) => {
  const response = await api.delete(`/admin/greenhouses/${greenhouseId}`);
  return response.data;
};


export const getAdminCropsApi = async () => {
  const response = await api.get('/greenhouses/crops');
  return response.data;
};

export const createAdminCropApi = async (cropData) => {
  const response = await api.post('/greenhouses/crops', cropData);
  return response.data;
};

export const updateAdminCropApi = async (cropId, cropData) => {
  const response = await api.put(`/greenhouses/crops/${cropId}`, cropData);
  return response.data;
};

export const deleteAdminCropApi = async (cropId) => {
  const response = await api.delete(`/greenhouses/crops/${cropId}`);
  return response.data;
};


export const exportSystemDataApi = async () => {
  try {
    const response = await api.get('/admin/backup/export');
    return response.data;
  } catch (error) {
    const [usersRes, greenhousesRes] = await Promise.all([
      api.get('/admin/users').catch(() => ({ data: [] })),
      api.get('/admin/greenhouses').catch(() => ({ data: [] }))
    ]);
    
    return {
      exportDate: new Date().toISOString(),
      version: "1.0",
      systemData: { 
        users: usersRes.data, 
        greenhouses: greenhousesRes.data 
      }
    };
  }
};

export const importSystemDataApi = async (jsonData) => {
  const response = await api.post('/admin/backup/import', jsonData);
  return response.data;
};