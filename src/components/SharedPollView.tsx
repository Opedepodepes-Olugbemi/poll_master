import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPoll, votePoll, type VotePollResponse } from '../services/api';
import { Poll } from '../types/poll';
import toast from 'react-hot-toast';
import { Vote } from 'lucide-react';

export default function SharedPollView() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      if (!pollId) {
        setError('Invalid poll ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPoll(pollId);
        if (response.poll) {
          setPoll(response.poll);
          setHasVoted(response.poll.hasVoted || false);
        } else {
          setError('Poll not found');
        }
      } catch (err) {
        setError('Failed to load poll');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption || !poll) return;

    try {
      const response: VotePollResponse = await votePoll(poll.id, selectedOption);
      
      if (response.success && response.poll) {
        setPoll(response.poll);
        setHasVoted(true);
        toast.success('Vote recorded successfully!');
      } else {
        toast.error(response.message || 'Failed to submit vote');
      }
    } catch (err) {
      toast.error('Failed to submit vote');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-reddit-orange"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Poll not found'}</div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="min-h-screen bg-reddit-light dark:bg-reddit-dark">
      <header className="bg-white dark:bg-reddit-card-dark shadow-reddit dark:shadow-reddit-dark sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <Vote className="h-8 w-8 text-reddit-orange" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark">PollMaster</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-reddit-card-dark rounded-lg shadow-reddit dark:shadow-reddit-dark p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark mb-4">
            {poll.question}
          </h1>

          <div className="space-y-3">
            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              
              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                    disabled={hasVoted}
                    className={`w-full p-3 text-left rounded-md transition-colors relative z-10 
                      ${hasVoted 
                        ? 'bg-gray-100 dark:bg-reddit-dark cursor-default' 
                        : 'hover:bg-gray-100 dark:hover:bg-reddit-dark cursor-pointer'
                      }
                      ${selectedOption === option.id ? 'ring-2 ring-reddit-orange' : ''}
                    `}
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-900 dark:text-reddit-text-dark">
                        {option.text}
                      </span>
                      {hasVoted && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {option.votes} votes ({percentage.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </button>
                  {hasVoted && (
                    <div 
                      className="absolute top-0 left-0 h-full bg-reddit-orange/20 rounded-md transition-all"
                      style={{ width: `${percentage}%`, zIndex: 5 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!hasVoted && (
            <button
              onClick={handleVote}
              disabled={!selectedOption}
              className={`mt-4 w-full py-2 px-4 rounded-md text-white font-bold
                ${selectedOption
                  ? 'bg-reddit-orange hover:bg-reddit-hover'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              Vote
            </button>
          )}

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Total votes: {totalVotes}
          </div>
        </div>
      </div>
    </div>
  );
}
