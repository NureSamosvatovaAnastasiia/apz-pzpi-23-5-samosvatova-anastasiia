const db = require('../config/db');
const { notifications,greenhouses  } = require('../db/schema');
const { eq, and, desc, gt, ilike } = require('drizzle-orm');
const socketService = require('../services/socketService');
class NotificationRepository {
    async create(greenhouseId, message, severity = 'INFO') {
        const result = await db.insert(notifications).values({
            greenhouseId,
            message,
            severity,
            isRead: false
        }).returning();
        const newNotification = result[0];

        // ДОДАЄМО WEBSOCKET:
        try {
             socketService.getIO().to(`greenhouse_${greenhouseId}`).emit('new_notification', newNotification);
        } catch (err) {
             console.error("Socket notification error:", err);
        }

        return newNotification;
    }

    async getAll(greenhouseId, limit = 50) {
        return await db.select().from(notifications)
            .where(eq(notifications.greenhouseId, greenhouseId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);
    }

    async getUnread(greenhouseId) {
        return await db.select().from(notifications)
            .where(and(
                eq(notifications.greenhouseId, greenhouseId),
                eq(notifications.isRead, false)
            ))
            .orderBy(desc(notifications.createdAt));
    }

    async markAsRead(id) {
        const result = await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, id))
            .returning();
        return result[0];
    }

    async hasRecentNotification(greenhouseId, keyPhrase, minutes = 60, severity = null) {
        const timeLimit = new Date(Date.now() - minutes * 60 * 1000);
       
        const conditions = [
            eq(notifications.greenhouseId, greenhouseId),
            gt(notifications.createdAt, timeLimit),
            eq(notifications.isRead, false),
            ilike(notifications.message, `%${keyPhrase}%`)
        ];


        if (severity) {
            conditions.push(eq(notifications.severity, severity));
        }

        const recent = await db.select().from(notifications)
            .where(and(...conditions))
            .limit(1);
            
        return recent.length > 0;
    }

    async getLastSeverity(greenhouseId, keyPhrase) {
        const result = await db.select({ severity: notifications.severity })
            .from(notifications)
            .where(and(
                eq(notifications.greenhouseId, greenhouseId),
                ilike(notifications.message, `%${keyPhrase}%`)
            ))
            .orderBy(desc(notifications.createdAt))
            .limit(1);

        return result.length > 0 ? result[0].severity : null;
    }
    
    async getAllForUser(userId, limit = 50) {
        return await db.select({
            id: notifications.id,
            greenhouseId: notifications.greenhouseId,
            message: notifications.message,
            severity: notifications.severity,
            isRead: notifications.isRead,
            createdAt: notifications.createdAt,
            // Додаємо назву теплиці, щоб на фронтенді було зрозуміло, звідки сповіщення
            greenhouseName: greenhouses.name 
        })
        .from(notifications)
        .innerJoin(greenhouses, eq(notifications.greenhouseId, greenhouses.id))
        .where(eq(greenhouses.ownerId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }

}

module.exports = new NotificationRepository();