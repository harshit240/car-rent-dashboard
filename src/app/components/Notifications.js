'use client';
import { useApp } from '@/app/context/AppContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Notifications() {
  const { state, dispatch } = useApp();

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: CheckCircleIcon,
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: XCircleIcon,
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-600'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {state.notifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        const IconComponent = config.icon;
        
        return (
          <div
            key={notification.id}
            className={`${config.bg} ${config.border} border-l-4 p-4 rounded-xl shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl animate-in slide-in-from-right-5`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.text} leading-relaxed`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity duration-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-20`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}