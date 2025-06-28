// app/components/alerts/AlertsPanel.tsx
'use client';

import { useState } from 'react';

interface Alert {
  id: string;
  type: 'weather' | 'emergency' | 'info';
  message: string;
  timestamp: Date;
}

export default function AlertsPanel() {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'weather',
      message: 'Severe thunderstorm warning in effect',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'emergency',
      message: 'Emergency services deployed to downtown area',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'weather': return '🌩️';
      case 'emergency': return '🚨';
      case 'info': return 'ℹ️';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Active Alerts
      </h2>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 border-l-4 border-red-500 bg-red-50 rounded">
            <div className="flex items-start gap-3">
              <span className="text-lg">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-red-800">
                  {alert.message}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  {alert.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
