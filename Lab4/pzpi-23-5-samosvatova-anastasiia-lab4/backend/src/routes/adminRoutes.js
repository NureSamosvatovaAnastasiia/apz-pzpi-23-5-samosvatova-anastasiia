const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  deleteUser,
  changeUserRole,
  getAdminDashboard,
  getSystemLogs,
  getAllGreenhouses,
  getGreenhouseDetails,
  getAdminCharts
} = require('../controllers/adminController');


router.use(protect);
router.use(adminOnly);

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Administrator panel
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get global system statistics
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object
 */
router.get('/dashboard', getAdminDashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:userId', deleteUser);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Change user role
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum:
 *                   - user
 *                   - admin
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/users/:userId/role', changeUserRole);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Get global system logs (last 100 actions)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of logs
 */
router.get('/logs', getSystemLogs);
// ... existing code ...

/**
 * @swagger
 * /admin/greenhouses:
 *   get:
 *     summary: Get all greenhouses (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed list of all greenhouses in the system
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                   description: Total number of greenhouses
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: "Томати Південь"
 *                       location:
 *                         type: string
 *                         example: "Сектор А"
 *                       owner:
 *                         type: string
 *                         description: Username of the owner
 *                       ownerEmail:
 *                         type: string
 *                         format: email
 *                       ownerId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/greenhouses', getAllGreenhouses);

/**
 * @swagger
 * /admin/greenhouses/{greenhouseId}:
 *   get:
 *     summary: Get full details of a specific greenhouse (Admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: greenhouseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the greenhouse
 *     responses:
 *       200:
 *         description: Full greenhouse details including sensors, actuators, and owner info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                     ownerId:
 *                       type: string
 *                       format: uuid
 *                     activeCropId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     owner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         username:
 *                           type: string
 *                         email:
 *                           type: string
 *                     sensors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [temperature, humidity, soil_moisture, light]
 *                           unit:
 *                             type: string
 *                     actuators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [fan, pump, heater, grow_light, vent, humidifier]
 *                           currentState:
 *                             type: boolean
 *       404:
 *         description: Greenhouse not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Теплицю не знайдено"
 */
router.get('/greenhouses/:greenhouseId', getGreenhouseDetails);

/**
 * @swagger
 * /admin/dashboard/charts:
 *   get:
 *     summary: Get data for admin dashboard charts (e.g., registrations over time)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of past days to include in the chart
 *     responses:
 *       200:
 *         description: Chart data points
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 days:
 *                   type: integer
 *                 charts:
 *                   type: object
 *                   properties:
 *                     registrations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 */
router.get('/dashboard/charts', getAdminCharts);
module.exports = router;
