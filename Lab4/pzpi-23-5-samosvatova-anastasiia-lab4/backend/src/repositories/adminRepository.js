const db = require('../config/db');
const { users, greenhouses, sensors, actuatorLogs } = require('../db/schema');
const { eq, sql, desc, gte } = require('drizzle-orm');

class AdminRepository {
    
    async getAllUsers() {
        return await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            isVerified: users.isVerified,
            createdAt: users.createdAt
        }).from(users);
    }

    async getAllGreenhouses() {
        return await db.select({
            id: greenhouses.id,
            name: greenhouses.name,
            location: greenhouses.location,
            owner: users.username,
            ownerEmail: users.email,
            createdAt: greenhouses.createdAt,
            ownerId: greenhouses.ownerId 
        })
        .from(greenhouses)
        .leftJoin(users, eq(greenhouses.ownerId, users.id));
    }
    
    async getGreenhouseDetails(greenhouseId) {
         const gh = await db.query.greenhouses.findFirst({
            where: eq(greenhouses.id, greenhouseId),
            with: {
                owner: true,
                sensors: true,
                actuators: true
            }
        });
        return gh;
    }
    async deleteUser(userId) {
        return await db.delete(users).where(eq(users.id, userId)).returning();
    }

    async updateUserRole(userId, newRole) {
        return await db.update(users)
            .set({ role: newRole })
            .where(eq(users.id, userId))
            .returning();
    }

    async getGlobalStats() {
        const userCount = await db.select({ count: sql`count(*)` }).from(users);
        const ghCount = await db.select({ count: sql`count(*)` }).from(greenhouses);
        const sensorCount = await db.select({ count: sql`count(*)` }).from(sensors);
        
        return {
            totalUsers: Number(userCount[0].count),
            totalGreenhouses: Number(ghCount[0].count),
            totalSensors: Number(sensorCount[0].count)
        };
    }

   
    async getGlobalLogs(limit = 100) {
        return await db.select().from(actuatorLogs)
            .orderBy(desc(actuatorLogs.timestamp))
            .limit(limit);
    }

    async getRegistrationsChart(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Групуємо користувачів за датою реєстрації
    return await db.select({
        date: sql`DATE(${users.createdAt})`,
        count: sql`count(*)::int`
    })
    .from(users)
    .where(gte(users.createdAt, startDate))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);
  }
}

module.exports = new AdminRepository();