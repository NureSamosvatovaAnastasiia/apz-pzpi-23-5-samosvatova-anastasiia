const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  receiveTelemetry,
  getDashboard,
  updateActuator,
  addManualReading,
  getLogs,
  getStats,
  clearLogs,
  getGreenhouseSensors,
  getGreenhouseActuators,
  editActuatorConfig, 
  provisionSimulator,
  createSensor,
  createActuator,
  deleteActuator,
  deleteSensor,
  getSensorHistory,
  getActuatorHistory,
  getSensorChart
} = require('../controllers/iotController');

/**
 * @swagger
 * tags:
 *   - name: IoT
 *     description: Telemetry, control, logs and stats
 */


router.post('/telemetry', receiveTelemetry);

/**
 * @swagger
 * /iot/manual:
 *   post:
 *     summary: Manually add a sensor reading (User input)
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sensorId
 *               - value
 *             properties:
 *               sensorId:
 *                 type: string
 *                 format: uuid
 *               value:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reading added
 *       403:
 *         description: Access denied
 */
router.post('/manual', protect, addManualReading);

/**
 * @swagger
 * /iot/dashboard/{greenhouseId}:
 *   get:
 *     summary: Get current sensor readings
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Current data
 */
router.get('/dashboard/:greenhouseId', protect, getDashboard);

/**
 * @swagger
 * /iot/actuators/{id}:
 *   patch:
 *     summary: Update actuator state (Manual Control)
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Actuator UUID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - state
 *             properties:
 *               state:
 *                 type: boolean
 *                 description: ON / OFF
 *               value:
 *                 type: number
 *                 description: Optional value (0–100% or angle)
 *     responses:
 *       200:
 *         description: State updated
 */
router.patch('/actuators/:id', protect, updateActuator);

/**
 * @swagger
 * /iot/actuators/{id}:
 *   put:
 *     summary: Edit actuator configuration (Name, Type, Capacity)
 *     tags: [IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Actuator UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 description: heater, fan, grow_light, vent, pump, humidifier
 *               capacity:
 *                 type: string
 *                 description: Power consumption or throughput (e.g. "2000" Watts)
 *     responses:
 *       200:
 *         description: Configuration updated
 *       403:
 *         description: Access denied
 */
router.put('/actuators/:id', protect, editActuatorConfig);


/**
 * @swagger
 * /iot/logs/{greenhouseId}:
 *   get:
 *     summary: Get automation history logs
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of system actions
 */
router.get('/logs/:greenhouseId', protect, getLogs);

/**
 * @swagger
 * /iot/stats/{greenhouseId}:
 *   get:
 *     summary: Get system statistics (last 24h)
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Aggregated stats
 */
router.get('/stats/:greenhouseId', protect, getStats);
/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/logs:
 *   delete:
 *     summary: Clear all automation logs for a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logs successfully cleared
 *       403:
 *         description: Access denied
 *       404:
 *         description: Greenhouse or logs not found
 */

router.delete('/greenhouses/:greenhouseId/logs', protect, clearLogs);
/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors:
 *   get:
 *     summary: Get all sensors for a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of sensors
 *       403:
 *         description: Access denied
 *       404:
 *         description: Greenhouse or sensors not found
 */

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/actuators:
 *   get:
 *     summary: Get all actuators for a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of actuators
 *       403:
 *         description: Access denied
 *       404:
 *         description: Greenhouse or actuators not found
 */

router.get('/greenhouses/:greenhouseId/sensors', protect, getGreenhouseSensors);

router.get('/greenhouses/:greenhouseId/actuators', protect, getGreenhouseActuators);

/**
 * @swagger
 * /iot/provision:
 *   post:
 *     summary: Get Greenhouse ID for IoT Device (Auto-Discovery)
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               greenhouseId:
 *                 type: string
 *                 description: Optional specific Greenhouse ID
 *     responses:
 *       200:
 *         description: Greenhouse ID returned
 *       404:
 *         description: Greenhouse not found
 */
router.post('/provision', protect, provisionSimulator);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors:
 *   post:
 *     summary: Create a new sensor for a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Temperature Sensor 1"
 *               type:
 *                 type: string
 *                 enum: [temperature, humidity, soil_moisture, light]
 *               unit:
 *                 type: string
 *                 example: "°C"
 *     responses:
 *       201:
 *         description: Sensor created successfully
 */
router.post('/greenhouses/:greenhouseId/sensors', protect, createSensor);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/actuators:
 *   post:
 *     summary: Create a new actuator for a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Fan"
 *               type:
 *                 type: string
 *                 enum: [fan, pump, heater, grow_light, vent, humidifier]
 *     responses:
 *       201:
 *         description: Actuator created successfully
 */
router.post('/greenhouses/:greenhouseId/actuators', protect, createActuator);
/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors/{sensorId}:
 *   delete:
 *     summary: Delete a sensor from a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor deleted successfully
 *       404:
 *         description: Not found or access denied
 */
router.delete('/greenhouses/:greenhouseId/sensors/:sensorId', protect, deleteSensor);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/actuators/{actuatorId}:
 *   delete:
 *     summary: Delete an actuator from a greenhouse
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: actuatorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Actuator deleted successfully
 *       404:
 *         description: Not found or access denied
 */
router.delete('/greenhouses/:greenhouseId/actuators/:actuatorId', protect, deleteActuator);
/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors/{sensorId}/history:
 *   get:
 *     summary: Get last N readings for a specific sensor
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent readings to fetch
 *     responses:
 *       200:
 *         description: History retrieved successfully
 */
router.get('/greenhouses/:greenhouseId/sensors/:sensorId/history', protect, getSensorHistory);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/actuators/{actuatorId}/history:
 *   get:
 *     summary: Get last N logs for a specific actuator
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: actuatorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent logs to fetch
 *     responses:
 *       200:
 *         description: History retrieved successfully
 */
router.get('/greenhouses/:greenhouseId/actuators/:actuatorId/history', protect, getActuatorHistory);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors/{sensorId}/chart:
 *   get:
 *     summary: Get sensor reading history for charts
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Time range in hours (e.g., 24 for last day, 168 for last week)
 *     responses:
 *       200:
 *         description: Array of data points for chart
 */
router.get(
  '/greenhouses/:greenhouseId/sensors/:sensorId/chart',
  protect,
  getSensorChart
);

/**
 * @swagger
 * /iot/greenhouses/{greenhouseId}/sensors/{sensorId}/chart:
 *   get:
 *     summary: Get sensor reading history for charts
 *     tags:
 *       - IoT
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: sensorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Time range in hours (e.g., 24 for last day, 168 for last week)
 *     responses:
 *       200:
 *         description: Array of data points for chart
 */
router.get(
  '/greenhouses/:greenhouseId/sensors/:sensorId/chart',
  protect,
  getSensorChart
);
module.exports = router;
