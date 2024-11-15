import { Poll } from '../types/poll';

const STORAGE_KEY = 'poll_app_temp_data';
const TEMP_USER_KEY = 'poll_app_temp_user';

// Get or create temporary user ID
const getTempUserId = (): { id: string, username: string } => {
  let userId = sessionStorage.getItem(TEMP_USER_KEY);
  let username = sessionStorage.getItem('temp_username');
  
  if (!userId) {
    userId = 'temp_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(TEMP_USER_KEY, userId);
  }
  
  if (!username) {
    username = `Anonymous_${userId.slice(5, 9)}`;
    sessionStorage.setItem('temp_username', username);
  }
  
  return { id: userId, username };
};

// Load from temporary storage
const loadFromStorage = (): { polls: Poll[], votes: Record<string, string[]> } => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { polls: [], votes: {} };
    
    const parsed = JSON.parse(data);
    return {
      polls: parsed.polls || [],
      votes: parsed.votes || {}
    };
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return { polls: [], votes: {} };
  }
};

// Save to temporary storage
const saveToStorage = (polls: Poll[], votes: Record<string, string[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ polls, votes }));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

// Initialize data from storage
const initialData = loadFromStorage();
let mockPolls = initialData.polls;
let pollVotes = initialData.votes;

export const mockDb = {
  getUserInfo: () => {
    return getTempUserId();
  },

  updateUsername: (newUsername: string) => {
    sessionStorage.setItem('temp_username', newUsername);
    return { success: true };
  },

  getPolls: () => {
    const { id: userId } = getTempUserId();
    return { 
      polls: mockPolls.map(poll => ({
        ...poll,
        hasVoted: pollVotes[poll.id]?.includes(userId) || false
      }))
    };
  },
  
  createPoll: (poll: Poll) => {
    mockPolls = [...mockPolls, poll];
    saveToStorage(mockPolls, pollVotes);
    return { id: poll.id };
  },
  
  votePoll: (pollId: string, optionId: string) => {
    const { id: userId } = getTempUserId();
    
    if (pollVotes[pollId]?.includes(userId)) {
      return { success: false, message: 'Already voted' };
    }

    const pollIndex = mockPolls.findIndex(p => p.id === pollId);
    if (pollIndex === -1) {
      return { success: false, message: 'Poll not found' };
    }

    if (!pollVotes[pollId]) {
      pollVotes[pollId] = [];
    }
    pollVotes[pollId].push(userId);

    mockPolls = mockPolls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map(opt => {
          if (opt.id === optionId) {
            return { 
              ...opt, 
              votes: opt.votes + 1
            };
          }
          return opt;
        });
        return {
          ...poll,
          options: updatedOptions,
          votes_count: poll.votes_count + 1
        };
      }
      return poll;
    });
    
    saveToStorage(mockPolls, pollVotes);
    return { success: true };
  },

  getPollById: (pollId: string) => {
    const { id: userId } = getTempUserId();
    const poll = mockPolls.find(p => p.id === pollId);
    if (!poll) return null;
    
    return {
      ...poll,
      hasVoted: pollVotes[poll.id]?.includes(userId) || false
    };
  },

  deletePoll: (pollId: string) => {
    mockPolls = mockPolls.filter(poll => poll.id !== pollId);
    delete pollVotes[pollId];
    saveToStorage(mockPolls, pollVotes);
    return { success: true };
  }
}; 






























