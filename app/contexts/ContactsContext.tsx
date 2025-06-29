"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Contact {
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

interface ContactsContextType {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  refreshContacts: () => Promise<void>;
  addContact: (contact: Contact) => void;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}

interface ContactsProviderProps {
  children: ReactNode;
}

export function ContactsProvider({ children }: ContactsProviderProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default contacts (fallback if no backend data)
  const defaultContacts: Contact[] = [
    { 
      id: "1", 
      name: "Mom", 
      relationship: "Home - Queens", 
      status: "safe", 
      location: "At Work - Manhattan",
      coordinates: [40.7282, -73.7949],
      address: "321 Manhattan Plaza, NY",
      description: "Safe location with shelter access",
      phone: "+1-555-0101",
      email: "mom@example.com"
    },
    { 
      id: "2", 
      name: "Jake (Son)", 
      relationship: "School - Midtown", 
      status: "safe", 
      location: "School - Midtown",
      coordinates: [40.7589, -73.9851],
      address: "789 Education Blvd, Midtown, NY",
      description: "Elementary school with emergency protocols in place",
      phone: "+1-555-0102"
    },
    {
      id: "3",
      name: "Emma (Daughter)",
      relationship: "Friend's House - UES",
      status: "danger",
      location: "Friend's House - UES",
      coordinates: [40.7505, -73.9934],
      address: "456 Upper East Side, NY",
      description: "At friend's house during storm warning",
      phone: "+1-555-0103"
    },
    {
      id: "4",
      name: "Dad",
      relationship: "Brooklyn - Near Storm",
      status: "caution",
      location: "Brooklyn - Near Storm",
      coordinates: [40.6892, -74.0445],
      address: "123 Brooklyn Ave, Brooklyn, NY",
      description: "Near storm area, monitoring conditions",
      phone: "+1-555-0104",
      email: "dad@example.com"
    },
  ];

  // Fetch contacts from backend
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      
      // Convert backend contacts to the format expected by the component
      const backendContacts: Contact[] = data.contacts.map((contact: any) => ({
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        status: contact.status,
        location: contact.address, // Use address as location
        coordinates: [contact.lat, contact.lng] as [number, number],
        address: contact.address,
        description: contact.description || '',
        phone: contact.phone,
        email: contact.email
      }));
      
      // Combine default contacts with backend contacts
      setContacts([...defaultContacts, ...backendContacts]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts from server');
      // Use default contacts as fallback
      setContacts(defaultContacts);
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const refreshContacts = async () => {
    await fetchContacts();
  };

  const addContact = (newContact: Contact) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const value: ContactsContextType = {
    contacts,
    isLoading,
    error,
    refreshContacts,
    addContact,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}
