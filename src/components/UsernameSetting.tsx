import { useState, useEffect } from "react";
import { User, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { appwriteService } from "../services/appwrite";

export default function UsernameSetting() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const userInfo = await appwriteService.getUserInfo();
        setCurrentUsername(userInfo.username || '');
        setUsername(userInfo.username || '');
      } catch (error) {
        console.error('Failed to load username:', error);
      }
    };

    loadUsername();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await appwriteService.updateUsername(username.trim());
      setCurrentUsername(username);
      setIsOpen(false);
      toast.success("Username updated successfully!");
    } catch (error) {
      console.error('Failed to update username:', error);
      toast.error("Failed to update username");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800 shadow-lg"
        aria-label="Set username"
      >
        <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-reddit-card-dark rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark">
            Set Username
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-reddit-dark rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-reddit-orange focus:border-reddit-orange dark:bg-reddit-dark dark:text-reddit-text-dark"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-reddit-dark rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-reddit-orange hover:bg-reddit-hover rounded-md transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </form>

        {currentUsername && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Current username: {currentUsername}
          </p>
        )}
      </div>
    </div>
  );
}