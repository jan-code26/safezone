// app/components/info/InfoPanel.tsx
"use client"

import { useState } from "react"

interface LocationInfo {
  name: string
  type: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  address: string
  weatherImpact: string[]
}

export default function InfoPanel() {
  const [selectedLocation] = useState<LocationInfo>({
    name: "Kids' School",
    type: "School",
    riskLevel: "LOW",
    address: "789 Education Blvd, Midtown, NY",
    weatherImpact: ["Minimal weather impact expected", "Continue normal activities", "Monitor weather updates"],
  })

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">{selectedLocation.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-1">Type</div>
          <div className="font-semibold text-gray-900">{selectedLocation.type}</div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-2">Risk Level</div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(selectedLocation.riskLevel)}`}
          >
            {selectedLocation.riskLevel}
          </span>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-1">Address</div>
          <div className="font-semibold text-gray-900">{selectedLocation.address}</div>
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-3">Weather Impact Assessment</div>
          <ul className="space-y-2">
            {selectedLocation.weatherImpact.map((impact, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-teal-600 mt-1">•</span>
                <span>{impact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
