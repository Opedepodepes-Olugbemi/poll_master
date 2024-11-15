import React, { useState, useEffect } from 'react';
import { User, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockDb } from '../services/mockDb';

export default function UsernameSetting() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const { username } = mockDb.getUserInfo();
    setUsername(username);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    mockDb.updateUsername(username.trim());
    toast.success('Username updated successfully!');
    setIsEditing(false);
  };

  return (
    <div className="fixed bottom-20 right-4 bg-white dark:bg-reddit-card-dark rounded-lg shadow-reddit dark:shadow-reddit-dark p-3">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-2 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-reddit-dark focus:ring-2 focus:ring-reddit-orange focus:border-transparent dark:text-reddit-text-dark"
            placeholder="Enter username"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
            title="Save username"
          >
            <Save size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Cancel"
          >
            <X size={16} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-reddit-orange dark:hover:text-reddit-orange transition-colors"
          title="Edit username"
        >
          <User size={16} />
          <span>{username}</span>
        </button>
      )}
    </div>
  );
} 