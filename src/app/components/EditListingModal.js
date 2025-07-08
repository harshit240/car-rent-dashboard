'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import {
  XMarkIcon,
  PencilIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export default function EditListingModal({ listing, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addNotification } = useApp();

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        location: listing.location || ''
      });
      setErrors({});
    }
  }, [listing]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/listings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: listing.id,
          action: 'edit',
          updates: {
            ...formData,
            price: parseFloat(formData.price)
          }
        })
      });

      if (response.ok) {
        const updatedListing = await response.json();
        addNotification('Listing updated successfully!', 'success');
        onSave(updatedListing);
        onClose();
      } else {
        const error = await response.json();
        addNotification(error.error || 'Failed to update listing', 'error');
      }
    } catch (error) {
      addNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Edit Listing
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700">
              <TagIcon className="h-4 w-4 mr-2 text-blue-600" />
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white text-gray-900 placeholder-gray-500 ${
                errors.title 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
              placeholder="Enter listing title..."
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700">
              <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-600" />
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none resize-none bg-white text-gray-900 placeholder-gray-500 ${
                errors.description 
                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
              placeholder="Describe the vehicle..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="flex items-center text-sm font-semibold text-gray-700">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-green-600" />
                Price/day
              </label>
              <input
                type="number"
                name="price"
                id="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white text-gray-900 placeholder-gray-500 ${
                  errors.price 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="flex items-center text-sm font-semibold text-gray-700">
                <MapPinIcon className="h-4 w-4 mr-2 text-red-600" />
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white text-gray-900 placeholder-gray-500 ${
                  errors.location 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
                placeholder="City, State"
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}