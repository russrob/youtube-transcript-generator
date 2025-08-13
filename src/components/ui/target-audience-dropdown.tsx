"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface TargetAudience {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  createdAt?: Date | null;
}

interface TargetAudienceDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TargetAudienceDropdown({
  value,
  onValueChange,
  disabled = false,
  className
}: TargetAudienceDropdownProps) {
  const [audiences, setAudiences] = useState<TargetAudience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [newAudienceName, setNewAudienceName] = useState('');
  const [newAudienceDescription, setNewAudienceDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch audiences on mount
  useEffect(() => {
    fetchAudiences();
  }, []);

  const fetchAudiences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/audiences');
      const data = await response.json();

      if (data.success) {
        setAudiences(data.audiences);
      } else {
        console.error('Failed to fetch audiences:', data.error);
      }
    } catch (error) {
      console.error('Error fetching audiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudience = async () => {
    if (!newAudienceName.trim()) {
      setError('Audience name is required');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/audiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAudienceName.trim(),
          description: newAudienceDescription.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add new audience to the list
        setAudiences(prev => [...prev, data.audience]);
        
        // Select the new audience
        onValueChange(data.audience.name.toLowerCase().replace(/\s+/g, '_'));
        
        // Close modal and reset form
        setShowCreateModal(false);
        setNewAudienceName('');
        setNewAudienceDescription('');
      } else {
        setError(data.error || 'Failed to create audience');
      }
    } catch (error) {
      console.error('Error creating audience:', error);
      setError('Failed to create audience. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAudience = async (audienceId: string, audienceName: string) => {
    if (!confirm(`Are you sure you want to delete "${audienceName}"?`)) {
      return;
    }

    setIsDeleting(audienceId);

    try {
      const response = await fetch(`/api/audiences/${audienceId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setAudiences(prev => prev.filter(audience => audience.id !== audienceId));
        
        // If the deleted audience was selected, switch to general
        const deletedAudience = audiences.find(a => a.id === audienceId);
        if (deletedAudience && value === deletedAudience.name.toLowerCase().replace(/\s+/g, '_')) {
          onValueChange('general');
        }
      } else {
        console.error('Failed to delete audience:', data.error);
        alert(data.error || 'Failed to delete audience');
      }
    } catch (error) {
      console.error('Error deleting audience:', error);
      alert('Failed to delete audience. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleValueChange = (newValue: string) => {
    if (newValue === 'CREATE_NEW') {
      setShowCreateModal(true);
    } else {
      onValueChange(newValue);
    }
  };

  const selectedAudience = audiences.find(a => 
    value === a.name.toLowerCase().replace(/\s+/g, '_') || 
    value === a.id
  );

  return (
    <>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled || isLoading}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={isLoading ? "Loading audiences..." : "Select target audience"} />
        </SelectTrigger>
        <SelectContent>
          {/* Default Audiences */}
          {audiences.filter(audience => audience.isDefault).map((audience) => (
            <SelectItem 
              key={audience.id} 
              value={audience.name.toLowerCase().replace(/\s+/g, '_')}
            >
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-medium">{audience.name}</div>
                  {audience.description && (
                    <div className="text-xs text-gray-500">{audience.description}</div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}

          {/* Separator if there are custom audiences */}
          {audiences.some(audience => !audience.isDefault) && (
            <div className="border-t border-gray-200 my-1"></div>
          )}

          {/* Custom Audiences */}
          {audiences.filter(audience => !audience.isDefault).map((audience) => (
            <SelectItem 
              key={audience.id} 
              value={audience.name.toLowerCase().replace(/\s+/g, '_')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <div className="font-medium">{audience.name}</div>
                  {audience.description && (
                    <div className="text-xs text-gray-500">{audience.description}</div>
                  )}
                  <div className="text-xs text-blue-600">Custom</div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteAudience(audience.id, audience.name);
                  }}
                  disabled={isDeleting === audience.id}
                  className="ml-2 text-red-500 hover:text-red-700 text-xs px-1"
                  title="Delete custom audience"
                >
                  {isDeleting === audience.id ? '...' : '×'}
                </button>
              </div>
            </SelectItem>
          ))}

          {/* Create New Option */}
          <div className="border-t border-gray-200 my-1"></div>
          <SelectItem value="CREATE_NEW">
            <div className="flex items-center text-blue-600">
              <span className="mr-2">+</span>
              <span>Create Custom Audience</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Create Audience Modal */}
      <Dialog open={showCreateModal} onClose={() => !isCreating && setShowCreateModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
              Create Custom Audience
            </DialogTitle>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience Name *
                </label>
                <Input
                  value={newAudienceName}
                  onChange={(e) => setNewAudienceName(e.target.value)}
                  placeholder="e.g., Tech Startup Founders"
                  maxLength={50}
                  disabled={isCreating}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newAudienceName.length}/50 characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  value={newAudienceDescription}
                  onChange={(e) => setNewAudienceDescription(e.target.value)}
                  placeholder="Brief description of this audience..."
                  maxLength={200}
                  rows={3}
                  disabled={isCreating}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {newAudienceDescription.length}/200 characters
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAudienceName('');
                  setNewAudienceDescription('');
                  setError(null);
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAudience}
                disabled={isCreating || !newAudienceName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? 'Creating...' : 'Create Audience'}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Show current selection info */}
      {selectedAudience && selectedAudience.description && (
        <div className="text-xs text-gray-600 mt-1">
          {selectedAudience.description}
        </div>
      )}
    </>
  );
}