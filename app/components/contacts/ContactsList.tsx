// app/components/contacts/ContactsList.tsx
'use client';

import { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  status: 'safe' | 'warning' | 'emergency';
  location: string;
}

export default function ContactsList() {
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'John Doe', status: 'safe', location: 'Downtown' },
    { id: '2', name: 'Jane Smith', status: 'warning', location: 'Suburbs' },
    { id: '3', name: 'Bob Johnson', status: 'emergency', location: 'Airport' }
  ]);

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Emergency Contacts
      </h2>
      
      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{contact.name}</div>
                <div className="text-sm text-gray-600">{contact.location}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                {contact.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Add Contact
      </button>
    </div>
  );
}
