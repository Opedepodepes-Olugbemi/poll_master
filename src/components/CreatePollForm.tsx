import React, { useState } from 'react';
import { Plus, Minus, Send, Image, X } from 'lucide-react';
import { createPoll } from '../services/api';
import toast from 'react-hot-toast';
import ImageSearch from './ImageSearch';

interface CreatePollFormProps {
  onPollCreated: () => void;
}

interface PollOption {
  text: string;
  imageUrl: string;
}

export default function CreatePollForm({ onPollCreated }: CreatePollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', imageUrl: '' },
    { text: '', imageUrl: '' }
  ]);
  const [activeImageSearch, setActiveImageSearch] = useState<number | null>(null);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, { text: '', imageUrl: '' }]);
    } else {
      toast.error('Maximum 5 options allowed');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    try {
      await createPoll({ question: question.trim(), options: validOptions });
      toast.success('Poll created successfully!');
      onPollCreated();
      // Reset form
      setQuestion('');
      setOptions([
        { text: '', imageUrl: '' },
        { text: '', imageUrl: '' }
      ]);
    } catch (error) {
      toast.error('Failed to create poll');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <label className="block text-gray-900 dark:text-reddit-text-dark font-medium mb-2">
          Question
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-reddit-dark focus:ring-2 focus:ring-reddit-orange focus:border-transparent dark:text-reddit-text-dark"
          placeholder="What would you like to ask?"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-900 dark:text-reddit-text-dark font-medium mb-2">
          Options
        </label>
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = { ...option, text: e.target.value };
                    setOptions(newOptions);
                  }}
                  className="flex-1 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-reddit-dark focus:ring-2 focus:ring-reddit-orange focus:border-transparent dark:text-reddit-text-dark"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Remove option"
                    aria-label="Remove option"
                  >
                    <Minus size={20} />
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setActiveImageSearch(index)}
                  className="p-2 text-gray-400 hover:text-reddit-orange hover:bg-reddit-orange/10 rounded-md transition-colors"
                  title="Add image"
                  aria-label="Add image"
                >
                  <Image size={20} />
                </button>
                {option.imageUrl && (
                  <div className="flex-1 relative group">
                    <img
                      src={option.imageUrl}
                      alt={option.text || `Option ${index + 1} image`}
                      className="h-20 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...options];
                        newOptions[index] = { ...option, imageUrl: '' };
                        setOptions(newOptions);
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                      aria-label="Remove image"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                )}
                {!option.imageUrl && (
                  <input
                    type="url"
                    value={option.imageUrl}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = { ...option, imageUrl: e.target.value };
                      setOptions(newOptions);
                    }}
                    className="flex-1 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-reddit-dark focus:ring-2 focus:ring-reddit-orange focus:border-transparent dark:text-reddit-text-dark"
                    placeholder="Image URL (optional)"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center gap-2 px-4 py-2 text-reddit-orange hover:bg-reddit-orange/10 rounded-full transition-colors font-bold text-sm"
        >
          <Plus size={18} aria-hidden="true" />
          Add Option
        </button>
        
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-reddit-orange text-white rounded-full hover:bg-reddit-hover transition-colors font-bold text-sm"
        >
          <Send size={18} aria-hidden="true" />
          Create Poll
        </button>
      </div>

      {activeImageSearch !== null && (
        <ImageSearch
          onImageSelect={(url) => {
            const newOptions = [...options];
            newOptions[activeImageSearch] = { 
              ...newOptions[activeImageSearch], 
              imageUrl: url 
            };
            setOptions(newOptions);
            setActiveImageSearch(null);
          }}
          onClose={() => setActiveImageSearch(null)}
        />
      )}
    </form>
  );
}