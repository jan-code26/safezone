// app/components/contacts/ContactsList.tsx
"use client"

import { useState } from "react"

interface Contact {
  id: string
  name: string
  relationship: string
  status: "safe" | "caution" | "danger"
  location: string
}

export default function ContactsList() {
  const [contacts] = useState<Contact[]>([
    { id: "1", name: "Mom", relationship: "Home - Queens", status: "safe", location: "At Work - Manhattan" },
    { id: "2", name: "Jake (Son)", relationship: "School - Midtown", status: "safe", location: "School - Midtown" },
    {
      id: "3",
      name: "Emma (Daughter)",
      relationship: "Friend's House - UES",
      status: "danger",
      location: "Friend's House - UES",
    },
    {
      id: "4",
      name: "Dad",
      relationship: "Brooklyn - Near Storm",
      status: "caution",
      location: "Brooklyn - Near Storm",
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className={`w-3 h-3 rounded-full ${getStatusColor(contact.status)} flex-shrink-0`}></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{contact.name}</div>
                <div className="text-xs text-gray-600 truncate">{contact.relationship}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Quick Actions</h3>
        <button className="w-full py-2 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
          <span>➕</span> Add Contact
        </button>
        <button className="w-full py-2 px-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
          <span>📍</span> Set Safe Location
        </button>
      </div>
    </div>
  )
}
