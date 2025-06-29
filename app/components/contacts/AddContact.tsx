"use client"

import { useState } from "react"
import { MarkerData } from "../../contexts/MapContext"

interface AddContactProps {
  onClose: () => void
  onContactAdded: (newContact: MarkerData) => void
}

interface ContactFormData {
  name: string
  relationship: string
  phone: string
  email: string
  address: string
  lat: number
  lng: number
  status: 'safe' | 'caution' | 'danger'
  description: string
  type: 'person' | 'school' | 'home' | 'work' | 'emergency'
}

export default function AddContact({ onClose, onContactAdded }: AddContactProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    lat: 0,
    lng: 0,
    status: 'safe',
    description: '',
    type: 'person'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Simple geocoding function using a free service
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      setIsGeocodingAddress(true)
      // Using Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    } finally {
      setIsGeocodingAddress(false)
    }
  }

  const handleAddressBlur = async () => {
    if (formData.address && formData.lat === 0 && formData.lng === 0) {
      const coordinates = await geocodeAddress(formData.address)
      if (coordinates) {
        setFormData(prev => ({
          ...prev,
          lat: coordinates.lat,
          lng: coordinates.lng
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // If coordinates are still 0, try to geocode the address
      let finalFormData = { ...formData }
      if (formData.lat === 0 && formData.lng === 0 && formData.address) {
        const coordinates = await geocodeAddress(formData.address)
        if (coordinates) {
          finalFormData = {
            ...formData,
            lat: coordinates.lat,
            lng: coordinates.lng
          }
        } else {
          setError('Could not find coordinates for the provided address. Please check the address.')
          return
        }
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add contact')
      }

      const result = await response.json()
      const newContact = result.contact

      // Convert the Supabase contact to MarkerData format for the map context
      const markerData: MarkerData = {
        id: newContact.id,
        name: newContact.name,
        type: finalFormData.type,
        status: newContact.status,
        position: [newContact.lat, newContact.lng],
        address: newContact.address,
        description: newContact.description || '',
        relationship: newContact.relationship
      }

      // Success - notify parent component
      onContactAdded(markerData)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add New Contact</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact name"
              />
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <input
                type="text"
                id="relationship"
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Family, Friend, Colleague"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Location Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="person">Person</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="school">School</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleAddressBlur}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address"
              />
              {isGeocodingAddress && (
                <p className="text-xs text-blue-600 mt-1">Looking up coordinates...</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  id="lat"
                  name="lat"
                  value={formData.lat}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-filled"
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  id="lng"
                  name="lng"
                  value={formData.lng}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Auto-filled"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="safe">Safe</option>
                <option value="caution">Caution</option>
                <option value="danger">Danger</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about this contact"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGeocodingAddress}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
