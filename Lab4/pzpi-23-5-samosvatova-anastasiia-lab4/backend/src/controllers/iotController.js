const IoTRepo = require('../repositories/iotRepository');
const GreenhouseRepo = require('../repositories/greenhouseRepository');
const db = require('../config/db');
const { sensors } = require('../db/schema');
const { eq } = require('drizzle-orm');
const AutomationService = require('../services/automationService');
const socketService = require('../services/socketService');

const receiveTelemetry = async (req, res, next) => {
    try {
        const sensorId = req.body.sensorId || req.body.sensor_id;
        const value = Number(req.body.value);
        const timestamp = req.body.timestamp; 

        if (!sensorId || isNaN(value)) {
            return res.status(400).json({ message: 'Invalid data' });
        }
  
        await IoTRepo.saveReading(sensorId, value, timestamp);

        const sensor = await db.query.sensors.findFirst({ where: eq(sensors.id, sensorId) });
        
        if (sensor) {

            const timeLog = timestamp ? `[Time: ${new Date(timestamp).toLocaleTimeString()}]` : '';
            console.log(`📡 Recv ${timeLog}: ${sensor.type} = ${value}`);

            AutomationService.processTelemetry(sensor.greenhouseId, sensor.type, value, timestamp)
                .catch(err => console.error(' Auto error:', err));
            try {
                socketService.getIO().to(`greenhouse_${sensor.greenhouseId}`).emit('sensor_update', {
                    sensorId: sensor.id,
                    type: sensor.type,
                    value: value,
                    timestamp: timestamp || new Date()
                });
            } catch (socketErr) {
                console.error("Socket emit error:", socketErr);
            }
        }

        res.status(201).json({ success: true });
    } catch (e) { 
        console.error(' Telemetry error:', e);
        next(e);
    }
};

const createSensor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId } = req.params;
        const { name, type, unit } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: 'Назва та тип сенсора обов\'язкові' });
        }

        // Перевірка прав доступу до теплиці
        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });

        if (!gh) {
            return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });
        }

        const newSensor = await IoTRepo.createSensor({
            greenhouseId,
            name,
            type,
            unit
        });

        res.status(201).json({ success: true, sensor: newSensor });
    } catch (e) {
        console.error("Помилка створення сенсора:", e);
        next(e);
    }
};
const createActuator = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId } = req.params;
        const { name, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: 'Назва та тип актуатора обов\'язкові' });
        }

        // Перевірка прав доступу до теплиці
        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });

        if (!gh) {
            return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });
        }

        const newActuator = await IoTRepo.createActuator({
            greenhouseId,
            name,
            type
        });

        res.status(201).json({ success: true, actuator: newActuator });
    } catch (e) {
        console.error("Помилка створення актуатора:", e);
        next(e);
    }
};
const addManualReading = async (req, res, next) => {
    try {
        const { sensorId, value } = req.body;

        if (!sensorId || value === undefined) {
            return res.status(400).json({ error: 'sensorId and value are required' });
        }

        const sensor = await db.query.sensors.findFirst({
            where: eq(sensors.id, sensorId)
        });

        if (!sensor) return res.status(404).json({ error: 'Sensor not found' });

        const gh = await GreenhouseRepo.findById(sensor.greenhouseId);
        if (!gh || gh.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: You do not own this sensor' });
        }

        const readingVal = parseFloat(value);
        await IoTRepo.saveReading(sensorId, readingVal);
        
        console.log(`👤 Manual Input [User:${req.user.username}]: ${sensor.type} = ${readingVal}`);

        AutomationService.processTelemetry(sensor.greenhouseId, sensor.type, readingVal)
            .catch(err => console.error('❌ Auto error (Manual):', err));

        res.status(201).json({ message: 'Reading added manually', sensor: sensor.type, value: readingVal });
    } catch (e) { next(e); }
};

const getDashboard = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;
        const gh = await GreenhouseRepo.findById(greenhouseId);
        
        if (!gh || gh.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const data = await IoTRepo.getLatestReadings(greenhouseId);
        res.json(data);
    } catch (e) { next(e); }
};


const updateActuator = async (req, res, next) => {
    try {
        const { id } = req.params; 
        const { state, value } = req.body; 

        if (state === undefined) {
            return res.status(400).json({ error: 'State (boolean) is required' });
        }
        
        const result = await IoTRepo.updateActuatorState(id, state, value, `USER:${req.user.id}`);
        
        res.json({ message: 'Actuator updated', device: result });
    } catch (e) { next(e); }
};

const editActuatorConfig = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, capacity } = req.body;

        const actuator = await IoTRepo.getActuatorById(id);
        if (!actuator) return res.status(404).json({ error: 'Actuator not found' });

        const gh = await GreenhouseRepo.findById(actuator.greenhouseId);
        if (!gh || gh.ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const updateData = {};
        if (name) updateData.name = name;
        if (type) updateData.type = type;
        if (capacity) updateData.capacity = String(capacity);

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const updated = await IoTRepo.updateActuatorConfig(id, updateData);
        res.json({ message: 'Actuator settings updated', actuator: updated });

    } catch (e) { next(e); }
};

const getLogs = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;
        
        const gh = await GreenhouseRepo.findById(greenhouseId);
        if (!gh || gh.ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const logs = await IoTRepo.getSystemLogs(greenhouseId);
        res.json(logs);
    } catch (e) { next(e); }
};

const getStats = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;

        const gh = await GreenhouseRepo.findById(greenhouseId);
        if (!gh || gh.ownerId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

        const stats = await IoTRepo.getSystemStats(greenhouseId);
        
        const formattedStats = {
            period: '24h',
            actions: stats
        };

        res.json(formattedStats);
    } catch (e) { next(e); }
};
const clearLogs = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;

        const gh = await GreenhouseRepo.findById(greenhouseId);
        if (!gh || gh.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const result = await IoTRepo.clearSystemLogs(greenhouseId);
        
        console.log(`Logs cleared for GH:${greenhouseId} by User:${req.user.id}`);
        
        res.json({ 
            message: 'System logs cleared successfully',
            details: result 
        });
    } catch (e) { next(e); }
};
const getGreenhouseSensors = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;
        const gh = await GreenhouseRepo.findById(greenhouseId);
        
        if (!gh || gh.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const sensors = await IoTRepo.getSensorsByGreenhouse(greenhouseId);
        res.json(sensors);
    } catch (e) { next(e); }
};


const getGreenhouseActuators = async (req, res, next) => {
    try {
        const { greenhouseId } = req.params;
        const gh = await GreenhouseRepo.findById(greenhouseId);
        
        if (!gh || gh.ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const actuators = await IoTRepo.getActuatorsByGreenhouse(greenhouseId);
        res.json(actuators);
    } catch (e) { next(e); }
};

const provisionSimulator = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Отримуємо ID теплиці, якщо він був переданий
        const { greenhouseId } = req.body;
        
        console.log(` Provisioning request for user: ${userId}${greenhouseId ? ` [Target GH: ${greenhouseId}]` : ''}`);

        let gh;

        if (greenhouseId) {

            gh = await db.query.greenhouses.findFirst({
                where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
            });

            if (!gh) {
                return res.status(404).json({ error: "Specified greenhouse not found or access denied" });
            }
        } else {
            // 2. Якщо ID не передано (Auto-Discovery) - шукаємо першу доступну
            gh = await db.query.greenhouses.findFirst({
                where: (table, { eq }) => eq(table.ownerId, userId)
            });
        }

        console.log(`   Returning Greenhouse ID: ${gh.id}`);

        res.json({ 
            success: true, 
            greenhouseId: gh.id,
            message: "Greenhouse ID retrieved"
        });

    } catch (e) {
        console.error("Provisioning error:", e);
        next(e);
    }
};
const deleteSensor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId, sensorId } = req.params;

        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });
        if (!gh) return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });

        const sensor = await db.query.sensors.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, sensorId), eq(table.greenhouseId, greenhouseId))
        });
        if (!sensor) return res.status(404).json({ error: "Сенсор не знайдено у цій теплиці" });

        await IoTRepo.deleteSensor(sensorId);
        res.status(200).json({ success: true, message: "Сенсор успішно видалено" });
    } catch (e) {
        console.error("Помилка видалення сенсора:", e);
        next(e);
    }
};

const deleteActuator = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId, actuatorId } = req.params;

        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });
        if (!gh) return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });

        const actuator = await db.query.actuators.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, actuatorId), eq(table.greenhouseId, greenhouseId))
        });
        if (!actuator) return res.status(404).json({ error: "Актуатор не знайдено у цій теплиці" });

        await IoTRepo.deleteActuator(actuatorId);
        res.status(200).json({ success: true, message: "Актуатор успішно видалено" });
    } catch (e) {
        console.error("Помилка видалення актуатора:", e);
        next(e);
    }
    
};

const getSensorHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId, sensorId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });
        if (!gh) return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });

        const sensor = await db.query.sensors.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, sensorId), eq(table.greenhouseId, greenhouseId))
        });
        if (!sensor) return res.status(404).json({ error: "Сенсор не знайдено" });

        const history = await IoTRepo.getSensorReadings(sensorId, limit);
        res.status(200).json({ success: true, limit, data: history });
    } catch (e) {
        console.error("Помилка отримання історії сенсора:", e);
        next(e);
    }
};

const getActuatorHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId, actuatorId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });
        if (!gh) return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });

        const actuator = await db.query.actuators.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, actuatorId), eq(table.greenhouseId, greenhouseId))
        });
        if (!actuator) return res.status(404).json({ error: "Актуатор не знайдено" });

        const history = await IoTRepo.getActuatorLogs(actuatorId, limit);
        res.status(200).json({ success: true, limit, data: history });
    } catch (e) {
        console.error("Помилка отримання історії актуатора:", e);
        next(e);
    }
};

const getSensorChart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { greenhouseId, sensorId } = req.params;
        // За замовчуванням беремо дані за останні 24 години
        const hours = parseInt(req.query.hours) || 24; 
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setHours(startDate.getHours() - hours);

        // Перевірка прав доступу до теплиці
        const gh = await db.query.greenhouses.findFirst({
            where: (table, { and, eq }) => and(eq(table.id, greenhouseId), eq(table.ownerId, userId))
        });
        if (!gh) return res.status(404).json({ error: "Теплицю не знайдено, або у вас немає доступу" });

        const chartData = await IoTRepo.getSensorChartData(sensorId, startDate, endDate);
        
        res.status(200).json({ 
            success: true, 
            timeRange: `${hours} hours`,
            data: chartData 
        });
    } catch (e) {
        console.error("Помилка отримання даних для графіка:", e);
        next(e);
    }
};


module.exports = { 
    receiveTelemetry, 
    getDashboard, 
    addManualReading,
    updateActuator, 
    getLogs, 
    getStats,
    clearLogs,
    getGreenhouseSensors,
    getGreenhouseActuators,
    editActuatorConfig,provisionSimulator, createSensor,
  createActuator,deleteSensor,deleteActuator,
  getActuatorHistory,getSensorHistory,
  getSensorChart
};