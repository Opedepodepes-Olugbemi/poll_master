import { PollOption as PollOptionType } from '../types/poll';

interface PollOptionProps {
  option: PollOptionType;
  totalVotes: number;
  onVote: (optionId: string) => void;
  hasVoted: boolean;
}

export default function PollOption({ option, totalVotes, onVote, hasVoted }: PollOptionProps) {
  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

  return (
    <button
      onClick={() => !hasVoted && onVote(option.id)}
      disabled={hasVoted}
      className={`w-full p-3 rounded-md relative overflow-hidden transition-all ${
        hasVoted ? 'cursor-default' : 'hover:bg-reddit-orange/5 dark:hover:bg-reddit-orange/10'
      }`}
    >
      <div
        className="absolute left-0 top-0 h-full bg-reddit-orange/10 dark:bg-reddit-orange/20 transition-all"
        style={{ width: `${percentage}%` }}
      />
      <div className="relative flex items-center gap-4">
        <div className="flex-1 flex justify-between items-center min-w-0">
          <span className="font-medium text-gray-900 dark:text-reddit-text-dark truncate">
            {option.text}
          </span>
          {hasVoted && (
            <span className="text-reddit-orange font-bold text-sm ml-2 shrink-0">
              {percentage}%
            </span>
          )}
        </div>

        {option.imageUrl && (
          <div className="shrink-0 w-24 h-24">
            <img
              src={option.imageUrl}
              alt={option.text}
              className="w-full h-full object-cover rounded-md"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </button>
  );
}