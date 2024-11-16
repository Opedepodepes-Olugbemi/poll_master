import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Vote, PlusCircle, BarChart, X } from 'lucide-react';
import { getPolls } from './services/api';
import { Poll } from './types/poll';
import PollCard from './components/PollCard';
import CreatePollForm from './components/CreatePollForm';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { ThemeProvider } from './components/ThemeProvider';
import UsernameSetting from './components/UsernameSetting';
import { Routes, Route } from 'react-router-dom';
import SharedPollView from './components/SharedPollView';
import { testAppwriteIntegration } from './services/test';

// Register ChartJS components properly
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const { polls: fetchedPolls } = await getPolls();
      setPolls(fetchedPolls);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getMostVotedPoll = () => {
    return polls.reduce<Poll | null>((max, poll) => 
      (poll.votes_count > (max?.votes_count || 0)) ? poll : max
    , null);
  };

  const getPieChartData = (poll: Poll) => {
    return {
      labels: poll.options.map(opt => opt.text.substring(0, 30) + (opt.text.length > 30 ? '...' : '')),
      datasets: [{
        data: poll.options.map(opt => opt.votes),
        backgroundColor: [
          'rgba(255, 69, 0, 0.8)',   // Reddit Orange
          'rgba(46, 204, 113, 0.8)',  // Green
          'rgba(52, 152, 219, 0.8)',  // Blue
          'rgba(155, 89, 182, 0.8)',  // Purple
          'rgba(241, 196, 15, 0.8)',  // Yellow
        ],
        borderColor: [
          'rgba(255, 69, 0, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(241, 196, 15, 1)',
        ],
        borderWidth: 1,
      }],
    };
  };

  const getBarChartData = () => {
    // Sort polls by vote count in descending order
    const sortedPolls = [...polls].sort((a, b) => b.votes_count - a.votes_count);
    const topPolls = sortedPolls.slice(0, 5); // Show top 5 polls

    return {
      labels: topPolls.map(poll => poll.question.substring(0, 20) + '...'),
      datasets: [{
        label: 'Total Votes',
        data: topPolls.map(poll => poll.votes_count),
        backgroundColor: 'rgba(255, 69, 0, 0.8)', // Reddit Orange
        borderColor: 'rgba(255, 69, 0, 1)',
        borderWidth: 1,
      }],
    };
  };

  const getLineChartData = () => {
    // Sort polls by creation date
    const sortedPolls = [...polls].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return {
      labels: sortedPolls.map(poll => {
        const date = new Date(poll.created_at);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Votes Over Time',
        data: sortedPolls.map(poll => poll.votes_count),
        borderColor: 'rgba(255, 69, 0, 1)', // Reddit Orange
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(255, 69, 0, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 69, 0, 1)',
      }]
    };
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Vote Distribution',
        color: 'rgb(215, 218, 220)',
        font: {
          family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          size: 16,
          weight: 'normal' as const
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Top 5 Most Voted Polls',
        color: 'rgb(215, 218, 220)',
        font: {
          family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          size: 16,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          },
          stepSize: 1
        },
        grid: {
          color: 'rgba(215, 218, 220, 0.1)'
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Voting Activity Over Time',
        color: 'rgb(215, 218, 220)',
        font: {
          family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          size: 16,
          weight: 'normal' as const
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(215, 218, 220, 0.1)'
        },
        ticks: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(215, 218, 220, 0.1)'
        },
        ticks: {
          color: 'rgb(215, 218, 220)',
          font: {
            family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          },
          stepSize: 1
        }
      }
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-reddit-light dark:bg-reddit-dark font-reddit transition-colors duration-200">
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#FF4500',
              color: '#FFFFFF',
              fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            },
          }} 
        />
        
        <Routes>
          <Route path="/" element={
            <>
              <header className="bg-white dark:bg-reddit-card-dark shadow-reddit dark:shadow-reddit-dark sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Vote className="h-8 w-8 text-reddit-orange" />
                      <h1 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark">PollMaster</h1>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(!showCreateForm)}
                      className="flex items-center space-x-2 px-4 py-1.5 bg-reddit-orange text-white rounded-full hover:bg-reddit-hover transition-colors text-sm font-bold"
                    >
                      {showCreateForm ? (
                        <>
                          <X size={18} />
                          <span>Close</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle size={18} />
                          <span>Create Poll</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </header>

              <main className="max-w-6xl mx-auto px-4 py-6">
                {showCreateForm && (
                  <div className="mb-6 bg-white dark:bg-reddit-card-dark rounded-md shadow-reddit dark:shadow-reddit-dark">
                    <CreatePollForm
                      onPollCreated={() => {
                        fetchPolls();
                        setShowCreateForm(false);
                      }}
                    />
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-reddit-orange mx-auto"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-600">
                    <p>{error}</p>
                  </div>
                ) : polls.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {polls.map((poll) => (
                        <PollCard
                          key={poll.id}
                          poll={poll}
                          onVote={fetchPolls}
                          onDelete={fetchPolls}
                        />
                      ))}
                    </div>
                    
                    <div className="bg-white dark:bg-reddit-card-dark rounded-md shadow-reddit dark:shadow-reddit-dark p-6 mt-8">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-reddit-text-dark mb-6 flex items-center gap-2">
                        <BarChart className="h-6 w-6 text-reddit-orange" />
                        Poll Analytics
                      </h2>
                      <div className="grid grid-cols-1 gap-8">
                        {/* Voting Activity Line Chart */}
                        <div className="bg-white dark:bg-reddit-dark rounded-lg p-4">
                          <div className="h-64">
                            <Line 
                              data={getLineChartData()} 
                              options={lineChartOptions}
                            />
                          </div>
                        </div>

                        {/* Existing charts in a grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Most Voted Poll Chart */}
                          <div className="bg-white dark:bg-reddit-dark rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-reddit-text-dark">
                              Most Voted Poll Results
                            </h3>
                            {getMostVotedPoll() && (
                              <div className="h-64">
                                <Pie 
                                  data={getPieChartData(getMostVotedPoll()!)} 
                                  options={pieChartOptions}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Overall Votes Chart */}
                          <div className="bg-white dark:bg-reddit-dark rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-reddit-text-dark">
                              Top Polls by Votes
                            </h3>
                            <div className="h-64">
                              <Bar 
                                data={getBarChartData()} 
                                options={barChartOptions} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-reddit-text-dark">
                    <p>No polls available. Create one to get started!</p>
                  </div>
                )}
              </main>
            </>
          } />
          <Route path="/poll/:pollId" element={<SharedPollView />} />
        </Routes>
        
        <UsernameSetting />
      </div>
    </ThemeProvider>
  );
}