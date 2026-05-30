import { create } from 'zustand';
import { 
  getGreenhouseSensorsApi, 
  getGreenhouseActuatorsApi, 
  updateActuatorStateApi,
  createSensorApi,
  updateSensorApi,
  deleteSensorApi,
  createActuatorApi,
  updateActuatorConfigApi,
  deleteActuatorApi,
  getSensorHistoryApi
} from '../api/iot.api';

const useIotStore = create((set, get) => ({
  sensors: [],
  actuators: [],
  isLoading: false,
  isActionLoading: false,

   fetchIotData: async (greenhouseId) => {
    if (get().sensors.length === 0 && get().actuators.length === 0) {
      set({ isLoading: true });
    }
    try {
      const [sensorsRes, actuatorsRes] = await Promise.all([
        getGreenhouseSensorsApi(greenhouseId).catch(() => []), 
        getGreenhouseActuatorsApi(greenhouseId).catch(() => [])
      ]);
      
      const rawSensors = Array.isArray(sensorsRes) ? sensorsRes : (sensorsRes.data || []);
      const rawActuators = Array.isArray(actuatorsRes) ? actuatorsRes : (actuatorsRes.data || []);

      const sortedSensors = [...rawSensors].sort((a, b) => String(a.id).localeCompare(String(b.id)));
      const sortedActuators = [...rawActuators].sort((a, b) => String(a.id).localeCompare(String(b.id)));

      const sensorsWithHistory = await Promise.all(sortedSensors.map(async (sensor) => {
        try {
          const historyRes = await getSensorHistoryApi(greenhouseId, sensor.id, 20);
          const historyData = Array.isArray(historyRes) ? historyRes : (historyRes?.data || historyRes?.history || []);
          
          const normalizedHistory = historyData.map(h => ({
            ...h,
            value: h.value !== undefined ? h.value : h.reading,
            createdAt: h.createdAt || h.timestamp || h.date
          }));

          let latestValue = sensor.value !== undefined ? sensor.value : sensor.reading;
          if (normalizedHistory.length > 0 && normalizedHistory[0].value !== undefined) {
            latestValue = normalizedHistory[0].value;
          }

          return { ...sensor, value: latestValue, history: normalizedHistory };
        } catch (error) {
          return { ...sensor, value: sensor.value !== undefined ? sensor.value : sensor.reading, history: [] };
        }
      }));

      const mappedActuators = sortedActuators.map(actuator => {
        const isStateOn = 
          actuator.currentState === true || actuator.currentState === 'true' ||
          actuator.state === true || actuator.state === 'true' || 
          actuator.status === true || actuator.status === 'true' ||
          actuator.isActive === true || actuator.isActive === 'true';
                          
        const actualValue = 
          actuator.currentValue !== undefined && actuator.currentValue !== null 
            ? Number(actuator.currentValue) 
            : (actuator.value !== undefined && actuator.value !== null ? Number(actuator.value) : 100);

        return { 
          ...actuator, 
          state: isStateOn, 
          value: actualValue 
        };
      });
      
      set({ 
        sensors: sensorsWithHistory, 
        actuators: mappedActuators, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching IoT data:', error);
      set({ isLoading: false });
    }
  },

  addSensor: async (greenhouseId, data) => {
    set({ isActionLoading: true });
    try {
      const newSensor = await createSensorApi(greenhouseId, data);
      set(state => ({ sensors: [...state.sensors, newSensor].sort((a,b)=>String(a.id).localeCompare(String(b.id))), isActionLoading: false }));
    } catch (error) {
      set({ isActionLoading: false });
      throw error;
    }
  },

  editSensor: async (greenhouseId, sensorId, data) => {
    set({ isActionLoading: true });
    try {
      const updatedSensor = await updateSensorApi(greenhouseId, sensorId, data);
      set(state => ({
        sensors: state.sensors.map(s => s.id === sensorId ? { ...s, ...updatedSensor } : s),
        isActionLoading: false
      }));
    } catch (error) {
      set({ isActionLoading: false });
      throw error;
    }
  },

  removeSensor: async (greenhouseId, sensorId) => {
    try {
      await deleteSensorApi(greenhouseId, sensorId);
      set(state => ({ sensors: state.sensors.filter(s => s.id !== sensorId) }));
    } catch (error) {
      throw error;
    }
  },

  addActuator: async (greenhouseId, data) => {
    set({ isActionLoading: true });
    try {
      const newActuator = await createActuatorApi(greenhouseId, data);
      set(state => ({ actuators: [...state.actuators, newActuator].sort((a,b)=>String(a.id).localeCompare(String(b.id))), isActionLoading: false }));
    } catch (error) {
      set({ isActionLoading: false });
      throw error;
    }
  },

  editActuator: async (greenhouseId, actuatorId, data) => {
    set({ isActionLoading: true });
    try {
      const updatedActuator = await updateActuatorConfigApi(greenhouseId, actuatorId, data);
      set(state => ({
        actuators: state.actuators.map(a => a.id === actuatorId ? { ...a, ...updatedActuator } : a),
        isActionLoading: false
      }));
    } catch (error) {
      set({ isActionLoading: false });
      throw error;
    }
  },

  removeActuator: async (greenhouseId, actuatorId) => {
    try {
      await deleteActuatorApi(greenhouseId, actuatorId);
      set(state => ({ actuators: state.actuators.filter(a => a.id !== actuatorId) }));
    } catch (error) {
      throw error;
    }
  },

  changeActuatorState: async (greenhouseId, actuatorId, newState, newValue) => {
    const previousActuators = get().actuators;
    
    set((state) => ({
      actuators: state.actuators.map(a => {
        if (a.id === actuatorId) {
          const parsedValue = newValue !== undefined ? Number(newValue) : a.value;
          return { ...a, state: newState, currentState: newState, value: parsedValue, currentValue: parsedValue };
        }
        return a;
      })
    }));

    try {
      await updateActuatorStateApi(greenhouseId, actuatorId, newState, newValue);
    } catch (error) {
      set({ actuators: previousActuators });
      throw error;
    }
  },

 
  updateRealtimeTelemetry: (data) => {
    set((state) => ({
      sensors: state.sensors.map(sensor => {
        if (sensor.id === data.sensorId || sensor.id === data.sensor_id) {
          return { 
            ...sensor, 
            value: data.value,
           
            history: [{ value: data.value, createdAt: data.timestamp || new Date() }, ...(sensor.history || [])].slice(0, 20)
          };
        }
        return sensor;
      })
    }));
  },

  updateRealtimeActuator: (data) => {
    set((state) => ({
      actuators: state.actuators.map(actuator => {
        if (actuator.id === data.actuatorId) {
          const isStateOn = data.currentState === true || data.currentState === 'true';
          const actualValue = data.value !== undefined ? Number(data.value) : actuator.value;
          return { ...actuator, state: isStateOn, value: actualValue };
        }
        return actuator;
      })
    }));
  }
}));

export default useIotStore;