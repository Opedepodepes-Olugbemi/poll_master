import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Poll } from '../types/poll';

interface ShareButtonsProps {
  poll: Poll;
}

export default function ShareButtons({ poll }: ShareButtonsProps) {
  const getBaseUrl = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://opedepodepes-olugbemi.github.io/poll_master';
  };

  const shareUrl = `${getBaseUrl()}/#/poll/${poll.id}`;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.question,
          text: 'Vote in this poll!',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}