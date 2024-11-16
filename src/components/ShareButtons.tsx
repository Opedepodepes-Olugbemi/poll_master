import { useState } from 'react';
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  pollId: string;
  pollQuestion?: string;
  sessionId?: string;
}

export default function ShareButtons({ pollId, pollQuestion, sessionId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = sessionId 
    ? `${window.location.origin}/poll/${pollId}?session=${sessionId}`
    : `${window.location.origin}/poll/${pollId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = pollQuestion ? `Check out this poll: ${pollQuestion}` : 'Check out this poll!';
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex gap-1">
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={16} className="text-[#1DA1F2] dark:text-[#1DA1F2]/80" />
      </a>
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={16} className="text-[#4267B2] dark:text-[#4267B2]/80" />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={16} className="text-[#0A66C2] dark:text-[#0A66C2]/80" />
      </a>
      <button
        onClick={copyToClipboard}
        className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        aria-label="Copy link"
      >
        {copied ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Link2 size={16} className="text-gray-600 dark:text-gray-400" />
        )}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {copied ? 'Copied!' : 'Copy link'}
        </span>
      </button>
    </div>
  );
}