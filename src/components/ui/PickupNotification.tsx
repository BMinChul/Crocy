import React from 'react';
import { useNotificationStore } from '../../stores/notificationStore';

const PickupNotification = () => {
  const { notifications } = useNotificationStore();

  const warnings = notifications.filter(n => n.type === 'warning' || n.type === 'error');
  const loots = notifications.filter(n => n.type !== 'warning' && n.type !== 'error');

  return (
    <>
      {/* Top Center Warnings */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-[10000] w-full max-w-md">
        {warnings.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-2 rounded border-2 shadow-lg
              font-bold text-center transition-all duration-300
              ${getStyles(notification.type)}
            `}
            style={{
              textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
              fontSize: 'var(--fs-body)', // 14px for warnings
              fontFamily: 'var(--font-body)',
              animation: 'fadeInDown 0.3s ease-out forwards',
              backgroundColor: 'rgba(15, 15, 15, 0.95)', // Match UI window bg
              borderColor: '#ff6b6b', // Subtle Red/Orange border
              color: '#ff6b6b', // Text color
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Bottom Loot Notifications */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-2 pointer-events-none z-[10000] w-full max-w-md">
        {loots.map((notification) => (
          <div
            key={notification.id}
            className={`
              animate-fade-in-up 
              px-4 py-1.5 rounded-lg border 
              font-bold text-center transition-all duration-300
              ${getStyles(notification.type)}
            `}
            style={{
              textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
              fontSize: 'var(--fs-notification)', // 12px
              animation: 'slideUpFade 0.3s ease-out forwards',
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

const getStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-900/80 border-green-500 text-green-100';
    case 'error':
      return 'border-red-500 text-red-100'; // BG/Color overridden inline for top warnings
    case 'warning':
      return 'border-orange-500 text-orange-100'; // BG/Color overridden inline for top warnings
    case 'loot-gold':
      return 'bg-black/70 border-yellow-500 text-yellow-400';
    case 'loot-item':
      return 'bg-black/70 border-purple-500 text-purple-300';
    default:
      return 'bg-blue-900/80 border-blue-500 text-blue-100';
  }
};

export default PickupNotification;
