// app/components/alerts/AlertsPanel.tsx
"use client"

import { useState } from "react"

interface Alert {
  id: string
  type: "severe" | "watch" | "warning"
  title: string
  message: string
  timestamp: Date
}

export default function AlertsPanel() {
  const [alerts] = useState<Alert[]>([
    {
      id: "1",
      type: "severe",
      title: "Severe Thunderstorm Warning",
      message: "Severe thunderstorm with damaging winds and heavy rain. Seek shelter immediately.",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "watch",
      title: "Flash Flood Watch",
      message: "Heavy rainfall may cause rapid flooding in low-lying areas.",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ])

  const getAlertStyle = (type: Alert["type"]) => {
    switch (type) {
      case "severe":
        return "border-l-red-500 bg-red-50"
      case "watch":
        return "border-l-orange-500 bg-orange-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Weather Alerts</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-3 border-l-4 rounded ${getAlertStyle(alert.type)}`}>
            <div className="font-semibold text-sm text-gray-900 mb-1">{alert.title}</div>
            <div className="text-xs text-gray-700 leading-relaxed">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
