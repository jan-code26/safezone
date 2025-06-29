"use client"

import { useState } from "react"
import { useMapContext } from "../../contexts/MapContext"

interface Contact {
  id: string
  name: string
  relationship: string
  status: "safe" | "caution" | "danger"
  location: string
  // Add coordinates for map integration
  coordinates: [number, number]
  address: string
  description: string
}

export default function ContactsList() {
  const { setSelectedMarker, markers } = useMapContext()
  
  const [contacts] = useState<Contact[]>([
    { 
      id: "1", 
      name: "Mom", 
      relationship: "Home - Queens", 
      status: "safe", 
      location: "At Work - Manhattan",
      coordinates: [40.7282, -73.7949],
      address: "321 Manhattan Plaza, NY",
      description: "Safe location with shelter access"
    },
    { 
      id: "2", 
      name: "Jake (Son)", 
      relationship: "School - Midtown", 
      status: "safe", 
      location: "School - Midtown",
      coordinates: [40.7589, -73.9851],
      address: "789 Education Blvd, Midtown, NY",
      description: "Elementary school with emergency protocols in place"
    },
    {
      id: "3",
      name: "Emma (Daughter)",
      relationship: "Friend's House - UES",
      status: "danger",
      location: "Friend's House - UES",
      coordinates: [40.7505, -73.9934],
      address: "456 Upper East Side, NY",
      description: "At friend's house during storm warning"
    },
    {
      id: "4",
      name: "Dad",
      relationship: "Brooklyn - Near Storm",
      status: "caution",
      location: "Brooklyn - Near Storm",
      coordinates: [40.6892, -74.0445],
      address: "123 Brooklyn Ave, Brooklyn, NY",
      description: "Near storm area, monitoring conditions"
    },
  ])

  const getStatusColor = (status: Contact["status"]) => {
    switch (status) {
      case "safe":
        return "bg-teal-500"
      case "caution":
        return "bg-orange-500"
      case "danger":
        return "bg-red-500"
    }
  }

  const handleContactClick = (contact: Contact) => {
    // Create a marker data object that matches the MarkerData interface
    const markerData = {
      id: contact.id,
      name: contact.name,
      type: "person" as const,
      status: contact.status,
      position: contact.coordinates,
      address: contact.address,
      description: contact.description,
      relationship: contact.relationship
    }
    
    // Set the selected marker in the map context
    setSelectedMarker(markerData)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleContactClick(contact)
                }
              }}
              aria-label={`View ${contact.name} on map`}
            >
              <div className={`w-3 h-3 rounded-full ${getStatusColor(contact.status)} flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{contact.name}</div>
                <div className="text-xs text-gray-600 truncate">{contact.relationship}</div>
                <div className="text-xs text-gray-500 truncate">{contact.location}</div>
              </div>
              <div className="text-xs text-gray-400">
                📍
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h3>
        <button 
          className="w-full py-2 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => alert("Add Contact functionality would be implemented here")}
        >
          <span>➕</span> Add Contact
        </button>
        <button 
          className="w-full py-2 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => alert("Set Safe Location functionality would be implemented here")}
        >
          <span>📍</span> Set Safe Location
        </button>
      </div>
    </div>
  )
}