"use client"

import { useState } from "react"
import { useMapContext, MarkerData } from "../../contexts/MapContext"
import { useContacts } from "../../contexts/ContactsContext"
import AddContact from "./AddContact"

// Import Contact type from context
type Contact = {
  id: string;
  name: string;
  relationship: string;
  status: "safe" | "caution" | "danger";
  location: string;
  coordinates: [number, number];
  address: string;
  description: string;
  phone?: string;
  email?: string;
}

export default function ContactsList() {
  const { setSelectedMarker, markers } = useMapContext()
  const { contacts, isLoading, error, addContact } = useContacts()
  const [showAddContact, setShowAddContact] = useState(false)

  const handleContactAdded = (newContact: MarkerData) => {
    // Convert MarkerData to Contact format and add to list
    const contact = {
      id: newContact.id,
      name: newContact.name,
      relationship: newContact.relationship || '',
      status: newContact.status,
      location: newContact.address,
      coordinates: newContact.position,
      address: newContact.address,
      description: newContact.description
    }
    
    addContact(contact)
  }

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
    <>
      <div className="h-full flex flex-col">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            Loading contacts...
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-red-600 text-sm">
            {error}
          </div>
        )}

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
            onClick={() => setShowAddContact(true)}
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

      {showAddContact && (
        <AddContact
          onClose={() => setShowAddContact(false)}
          onContactAdded={handleContactAdded}
        />
      )}
    </>
  )
}
