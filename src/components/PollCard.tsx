import { useState } from 'react';
import { Poll } from '../types/poll';
import PollOption from './PollOption';
import ShareButtons from './ShareButtons';
import { votePoll, deletePoll } from '../services/api';
import { Calendar, Trash2, AlertCircle, Link } from 'lucide-react';
import toast from 'react-hot-toast';

interface PollCardProps {
  poll: Poll & { hasVoted?: boolean; sessionId?: string };
  onVote: () => void;
  onDelete?: () => void;
}

const cardColors = [
  'bg-white hover:bg-gray-50',
  'bg-white hover:bg-gray-50',
  'bg-white hover:bg-gray-50',
  'bg-white hover:bg-gray-50',
  'bg-white hover:bg-gray-50',
];

const cardColorsDark = [
  'dark:bg-reddit-card-dark dark:hover:bg-gray-800',
  'dark:bg-reddit-card-dark dark:hover:bg-gray-800',
  'dark:bg-reddit-card-dark dark:hover:bg-gray-800',
  'dark:bg-reddit-card-dark dark:hover:bg-gray-800',
  'dark:bg-reddit-card-dark dark:hover:bg-gray-800',
];

export default function PollCard({ poll, onVote, onDelete }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(poll.hasVoted || false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const formattedDate = new Date(poll.created_at).toLocaleDateString();

  const handleVote = async (optionId: string) => {
    try {
      await votePoll(poll.id, optionId);
      setHasVoted(true);
      onVote();
      setSelectedColor((prev) => (prev + 1) % cardColors.length);
      toast.success('Vote recorded successfully!');
    } catch (error) {
      toast.error('Failed to record vote');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePoll(poll.id);
      toast.success('Poll deleted successfully!');
      onDelete?.();
    } catch (error) {
      toast.error('Failed to delete poll');
    }
  };

  const getBaseUrl = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://opedepodepes-olugbemi.github.io/poll_master';
  };

  const handleShare = () => {
    const shareUrl = `${getBaseUrl()}/#/poll/${poll.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <div className={`rounded-md shadow-reddit dark:shadow-reddit-dark transition-all duration-200 ${cardColors[selectedColor]} ${cardColorsDark[selectedColor]}`}>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 dark:text-reddit-text-dark">{poll.question}</h2>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-1">
                <Calendar size={14} className="mr-1" />
                {formattedDate}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-1 hover:bg-gray-100 dark:hover:bg-reddit-dark rounded-full transition-colors"
                title="Copy link"
              >
                <Link className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Delete poll"
                aria-label="Delete poll"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="bg-white dark:bg-reddit-dark rounded-md p-4 border border-red-200 dark:border-red-900/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-reddit-text-dark">
                    Delete Poll?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This action cannot be undone. All votes will be permanently deleted.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {poll.options.map((option) => (
              <PollOption
                key={option.id}
                option={option}
                totalVotes={totalVotes}
                onVote={handleVote}
                hasVoted={hasVoted}
              />
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </div>
            <ShareButtons poll={poll} />
          </div>
        </div>
      </div>
    </div>
  );
}