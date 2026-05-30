import api from './axios';

export const getGreenhouseSensorsApi = async (greenhouseId) => {
  const response = await api.get(`/iot/greenhouses/${greenhouseId}/sensors`);
  return response.data;
};

export const createSensorApi = async (greenhouseId, sensorData) => {
  const response = await api.post(`/iot/greenhouses/${greenhouseId}/sensors`, sensorData);
  return response.data;
};

export const updateSensorApi = async (greenhouseId, sensorId, sensorData) => {
  const response = await api.put(`/iot/greenhouses/${greenhouseId}/sensors/${sensorId}`, sensorData);
  return response.data;
};

export const deleteSensorApi = async (greenhouseId, sensorId) => {
  const response = await api.delete(`/iot/greenhouses/${greenhouseId}/sensors/${sensorId}`);
  return response.data;
};

export const getSensorHistoryApi = async (greenhouseId, sensorId, limit = 20) => {
  const response = await api.get(`/iot/greenhouses/${greenhouseId}/sensors/${sensorId}/history?limit=${limit}`);
  return response.data;
};


export const getSensorChartApi = async (greenhouseId, sensorId, hours = 24) => {
  const response = await api.get(`/iot/greenhouses/${greenhouseId}/sensors/${sensorId}/chart?hours=${hours}`);
  return response.data;
};

export const getGreenhouseActuatorsApi = async (greenhouseId) => {
  const response = await api.get(`/iot/greenhouses/${greenhouseId}/actuators`);
  return response.data;
};

export const createActuatorApi = async (greenhouseId, actuatorData) => {
  const response = await api.post(`/iot/greenhouses/${greenhouseId}/actuators`, actuatorData);
  return response.data;
};

export const updateActuatorConfigApi = async (greenhouseId, actuatorId, actuatorData) => {
  const response = await api.put(`/iot/greenhouses/${greenhouseId}/actuators/${actuatorId}/config`, actuatorData);
  return response.data;
};

export const deleteActuatorApi = async (greenhouseId, actuatorId) => {
  const response = await api.delete(`/iot/greenhouses/${greenhouseId}/actuators/${actuatorId}`);
  return response.data;
};

export const updateActuatorStateApi = async (greenhouseId, actuatorId, state, value) => {
  const payload = { 
    state: Boolean(state),
    value: value !== undefined && value !== null ? Number(value) : 100 
  };
  
  try {
    const response = await api.patch(`/iot/actuators/${actuatorId}`, payload);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      const fallbackResponse = await api.patch(`/iot/greenhouses/${greenhouseId}/actuators/${actuatorId}`, payload);
      return fallbackResponse.data;
    }
    throw error;
  }
};

export const getActuatorHistoryApi = async (greenhouseId, actuatorId, limit = 20) => {
  const response = await api.get(`/iot/greenhouses/${greenhouseId}/actuators/${actuatorId}/history?limit=${limit}`);
  return response.data;
};