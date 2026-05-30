const UserRepo = require('../repositories/userRepository');

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // Беремо ID з токена (middleware protect)
        
        const user = await UserRepo.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        // Видаляємо хеш пароля перед відправкою на клієнт
        const { passwordHash, ...safeUser } = user;
        
        res.status(200).json({ success: true, user: safeUser });
    } catch (error) {
        console.error("Помилка отримання профілю:", error);
        next(error);
    }
};

// Оновлення профілю
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Додайте сюди поля, які дозволено оновлювати
        const { username } = req.body; 

        if (!username || username.trim() === '') {
            return res.status(400).json({ message: "Ім\\'я користувача не може бути порожнім" });
        }

        const updatedUser = await UserRepo.updateProfile(userId, { 
            username: username.trim(),
            // Якщо у вашій схемі є інші поля (аватар, телефон тощо), додайте їх сюди
        });

        if (!updatedUser) {
            return res.status(404).json({ error: 'Користувача не знайдено' });
        }

        const { passwordHash, ...safeUser } = updatedUser;

        res.status(200).json({ 
            success: true, 
            message: 'Профіль успішно оновлено', 
            user: safeUser 
        });
    } catch (error) {
        console.error("Помилка оновлення профілю:", error);
        next(error);
    }
};

module.exports = { getProfile, updateProfile };