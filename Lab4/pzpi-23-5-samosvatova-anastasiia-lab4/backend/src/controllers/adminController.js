const AdminRepo = require('../repositories/adminRepository');

// Отримати список користувачів
const getAllUsers = async (req, res, next) => {
    try {
        const users = await AdminRepo.getAllUsers();
        res.json(users);
    } catch (e) { next(e); }
};

const getAllGreenhouses = async (req, res, next) => {
    try {
        const ghList = await AdminRepo.getAllGreenhouses();
        res.json({
            success: true,
            count: ghList.length,
            data: ghList
        });
    } catch (e) { next(e); }
};

const getGreenhouseDetails = async (req, res, next) => {
     try {
        const { greenhouseId } = req.params;
        const details = await AdminRepo.getGreenhouseDetails(greenhouseId);
        
        if(!details) {
            return res.status(404).json({error: "Теплицю не знайдено"});
        }
        res.json({success: true, data: details});
     } catch (e) {
         next(e);
     }
}

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await AdminRepo.deleteUser(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (e) { next(e); }
};

const changeUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body; // 'admin' або 'user'
        
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const updated = await AdminRepo.updateUserRole(userId, role);
        res.json(updated[0]);
    } catch (e) { next(e); }
};

const getAdminDashboard = async (req, res, next) => {
    try {
        const stats = await AdminRepo.getGlobalStats();
        res.json(stats);
    } catch (e) { next(e); }
};

const getSystemLogs = async (req, res, next) => {
    try {
        const logs = await AdminRepo.getGlobalLogs();
        res.json(logs);
    } catch (e) { next(e); }
};

const getAdminCharts = async (req, res, next) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const registrations = await AdminRepo.getRegistrationsChart(days);
        
        res.json({
            success: true,
            days: days,
            charts: {
                registrations: registrations
            }
        });
    } catch (e) { 
        next(e); 
    }
};

module.exports = { 
    getAllUsers, 
    deleteUser, 
    changeUserRole, 
    getAdminDashboard,
    getSystemLogs,
    getAllGreenhouses,
    getGreenhouseDetails,
    getAdminCharts
};