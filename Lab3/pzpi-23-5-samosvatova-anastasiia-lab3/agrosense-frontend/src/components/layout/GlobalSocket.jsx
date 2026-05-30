import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { socket } from '../../api/socket';
import useAuthStore from '../../store/useAuthStore';
import useAgroStore from '../../store/useAgroStore';
import useNotificationStore from '../../store/useNotificationStore';
import useIotStore from '../../store/useIotStore';

// Цей компонент не малює нічого на екрані, він лише керує з'єднанням
const GlobalSocket = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const greenhouses = useAgroStore(state => state.greenhouses);
  const fetchGreenhouses = useAgroStore(state => state.fetchGreenhouses);
  
  const addRealtimeNotification = useNotificationStore(state => state.addRealtimeNotification);
  const updateRealtimeTelemetry = useIotStore(state => state.updateRealtimeTelemetry);
  const updateRealtimeActuator = useIotStore(state => state.updateRealtimeActuator);

  // Завантажуємо список теплиць, якщо вони ще не завантажені (щоб знати, до яких кімнат підключатись)
  useEffect(() => {
    if (isAuthenticated && greenhouses.length === 0) {
      fetchGreenhouses();
    }
  }, [isAuthenticated, greenhouses.length, fetchGreenhouses]);

  // Керування з'єднанням та кімнатами
  useEffect(() => {
    if (!isAuthenticated) {
      socket.disconnect();
      return;
    }

    // Підключаємо сокет, якщо він ще не підключений
    if (!socket.connected) {
      socket.connect();
    }

    // Підписуємося на оновлення для КОЖНОЇ теплиці користувача
    if (greenhouses.length > 0) {
      greenhouses.forEach(gh => {
        socket.emit('join_greenhouse', gh.id);
      });
    }

    // --- ОБРОБНИКИ ПОДІЙ ВІД БЕКЕНДУ ---
    
    // 1. Нові сповіщення
    const handleNewNotification = (notification) => {
      addRealtimeNotification(notification);
      // Можемо також показати візуальний тост, якщо це критична помилка
      if (notification.severity === 'CRITICAL') {
        toast.error(`Критично: ${notification.message}`, { duration: 5000 });
      }
    };

    // 2. Оновлення показників (телеметрія)
    const handleTelemetryUpdate = (data) => {
      updateRealtimeTelemetry(data);
    };

    // 3. Зміна стану обладнання (автоматикою або іншим користувачем)
    const handleActuatorUpdate = (data) => {
      updateRealtimeActuator(data);
    };

    // Прикріплюємо слухачів
    socket.on('new_notification', handleNewNotification);
    socket.on('telemetry_update', handleTelemetryUpdate); // Переконайтесь, що бекенд емітить саме "telemetry_update"
    socket.on('actuator_update', handleActuatorUpdate);

    // Прибирання при розмонтуванні
    return () => {
      greenhouses.forEach(gh => {
        socket.emit('leave_greenhouse', gh.id);
      });
      socket.off('new_notification', handleNewNotification);
      socket.off('telemetry_update', handleTelemetryUpdate);
      socket.off('actuator_update', handleActuatorUpdate);
    };
  }, [isAuthenticated, greenhouses, addRealtimeNotification, updateRealtimeTelemetry, updateRealtimeActuator]);

  return null; // Компонент прозорий
};

export default GlobalSocket;