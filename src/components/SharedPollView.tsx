import { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { getPoll, votePoll, type VotePollResponse } from '../services/api';

import { Poll } from '../types/poll';

import toast from 'react-hot-toast';

import { Vote } from 'lucide-react';

import { AlertCircle } from 'lucide-react';



export default function SharedPollView() {

  const { pollId } = useParams();

  const [poll, setPoll] = useState<Poll | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [hasVoted, setHasVoted] = useState(false);



  useEffect(() => {

    const handlePollsChanged = (event: any) => {

      if (event.detail.poll?.id === pollId) {

        setPoll(event.detail.poll);

        setError(null);

      }

    };



    window.addEventListener('pollsChanged', handlePollsChanged);

    return () => window.removeEventListener('pollsChanged', handlePollsChanged);

  }, [pollId]);



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

          updateMetaTags(response.poll);

        } else {

          setError('This poll has been deleted or is no longer available');

        }

      } catch (err) {

        console.error('Failed to load poll:', err);

        setError('Unable to load poll. The poll might have been deleted or is no longer available.');

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



  const updateMetaTags = (poll: Poll) => {

    const baseUrl = 'https://opedepodepes-olugbemi.github.io/poll_master';

    document.title = `Vote: ${poll.question} | PollMaster`;



    const metaTags = {

      'og:title': poll.question,

      'og:description': `Vote on this poll: ${poll.options.map(opt => opt.text).join(', ')}`,

      'og:image': generatePreviewImage(poll),

      'og:url': `${baseUrl}/#/poll/${poll.id}`,

      'twitter:card': 'summary_large_image',

      'twitter:title': poll.question,

      'twitter:description': `Vote on this poll: ${poll.options.map(opt => opt.text).join(', ')}`,

      'twitter:image': generatePreviewImage(poll),

      'twitter:url': `${baseUrl}/#/poll/${poll.id}`,

    };



    Object.entries(metaTags).forEach(([property, content]) => {

      let meta = document.querySelector(`meta[property="${property}"]`);

      if (!meta) {

        meta = document.createElement('meta');

        meta.setAttribute('property', property);

        document.head.appendChild(meta);

      }

      meta.setAttribute('content', content);

    });

  };



  const generatePreviewImage = (poll: Poll) => {

    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d');

    

    canvas.width = 1200;

    canvas.height = 630;

    

    if (ctx) {

      // Background

      ctx.fillStyle = '#1A1A1B';

      ctx.fillRect(0, 0, canvas.width, canvas.height);

      

      // Header background

      ctx.fillStyle = '#272729';

      ctx.fillRect(0, 0, canvas.width, 80);

      

      // App icon (simplified vote icon)

      ctx.strokeStyle = '#FF4500';

      ctx.lineWidth = 4;

      ctx.beginPath();

      ctx.moveTo(40, 40);

      ctx.lineTo(60, 20);

      ctx.lineTo(80, 40);

      ctx.stroke();

      

      // App name

      ctx.fillStyle = '#FFFFFF';

      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';

      ctx.fillText('PollMaster', 100, 50);

      

      // Poll question

      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';

      wrapText(ctx, poll.question, 60, 160, canvas.width - 120, 60);

      

      // Options

      let y = 300;

      poll.options.forEach((option) => {

        // Option box

        ctx.fillStyle = '#272729';

        ctx.fillRect(60, y, canvas.width - 120, 80);

        

        // Option text

        ctx.fillStyle = '#FFFFFF';

        ctx.font = '32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';

        ctx.fillText(option.text, 80, y + 50);

        

        // Vote count

        ctx.fillStyle = '#FF4500';

        ctx.fillText(`${option.votes} votes`, canvas.width - 200, y + 50);

        

        y += 100;

      });



      // Footer

      ctx.fillStyle = '#272729';

      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      

      ctx.fillStyle = '#FFFFFF';

      ctx.font = '24px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto';

      ctx.fillText('Click to vote on this poll', 60, canvas.height - 20);

    }

    

    return canvas.toDataURL('image/png');

  };



  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {

    const words = text.split(' ');

    let line = '';

    

    for (let n = 0; n < words.length; n++) {

      const testLine = line + words[n] + ' ';

      const metrics = ctx.measureText(testLine);

      const testWidth = metrics.width;

      

      if (testWidth > maxWidth && n > 0) {

        ctx.fillText(line, x, y);

        line = words[n] + ' ';

        y += lineHeight;

      } else {

        line = testLine;

      }

    }

    ctx.fillText(line, x, y);

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

      <div className="min-h-screen bg-reddit-light dark:bg-reddit-dark">

        <header className="bg-white dark:bg-reddit-card-dark shadow-reddit dark:shadow-reddit-dark sticky top-0 z-50">

          <div className="max-w-6xl mx-auto px-4 py-3">

            <div className="flex items-center space-x-2">

              <Vote className="h-8 w-8 text-reddit-orange" />

              <h1 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark">PollMaster</h1>

            </div>

          </div>

        </header>



        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">

          <div className="bg-white dark:bg-reddit-card-dark rounded-lg shadow-reddit dark:shadow-reddit-dark p-6 max-w-md mx-4">

            <div className="text-center">

              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />

              <h2 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark mb-2">

                Failed to Load Poll

              </h2>

              <p className="text-gray-500 dark:text-gray-400">

                {error || 'This poll may have been deleted or is no longer available.'}

              </p>

              <button

                onClick={() => window.location.href = '/poll_master'}

                className="mt-4 px-4 py-2 bg-reddit-orange text-white rounded-full hover:bg-reddit-hover transition-colors"

              >

                Return Home

              </button>

            </div>

          </div>

        </div>

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


