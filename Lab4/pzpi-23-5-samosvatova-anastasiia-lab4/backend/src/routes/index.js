const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const greenhouseRoutes = require('./greenhouseRoutes');
const iotRoutes = require('./iotRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/greenhouses', greenhouseRoutes);
router.use('/iot', iotRoutes);
router.use('/notifications', notificationRoutes);

router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

const os = require('os');

router.post('/test-load', (req, res) => {
    let result = 0;
    for (let i = 0; i < 5000000; i++) {
        result += Math.sqrt(i);
    }

    res.status(200).json({
        status: "success",
        processed_by: os.hostname(),
        message: "Data processed with heavy load",
        calculation: result
    });
});

module.exports = router;