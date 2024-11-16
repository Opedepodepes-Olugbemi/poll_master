import { Poll } from '../types/poll';

const STORAGE_KEY = 'poll_master_data';

interface DbData {
  polls: Poll[];
  userInfo: {
    username: string;
  };
}

const initialData: DbData = {
  polls: [],
  userInfo: {
    username: '',
  },
};

function loadData(): DbData {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialData;
}

function saveData(data: DbData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const mockDb = {
  async createPoll(poll: Poll) {
    const data = loadData();
    data.polls.push(poll);
    saveData(data);
    return { success: true };
  },

  async getPolls() {
    const data = loadData();
    return { polls: data.polls };
  },

  async getPollById(pollId: string) {
    const data = loadData();
    return data.polls.find(p => p.id === pollId) || null;
  },

  async votePoll(pollId: string, optionId: string) {
    const data = loadData();
    const poll = data.polls.find(p => p.id === pollId);
    
    if (!poll) {
      return { success: false, message: 'Poll not found' };
    }

    const option = poll.options.find(opt => opt.id === optionId);
    if (!option) {
      return { success: false, message: 'Option not found' };
    }

    option.votes += 1;
    poll.votes_count = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    saveData(data);

    return { success: true };
  },

  async deletePoll(pollId: string) {
    const data = loadData();
    const index = data.polls.findIndex(p => p.id === pollId);
    
    if (index === -1) {
      return { success: false };
    }

    data.polls.splice(index, 1);
    saveData(data);
    return { success: true };
  },

  getUserInfo() {
    const data = loadData();
    return data.userInfo;
  },

  updateUsername(username: string) {
    const data = loadData();
    data.userInfo.username = username;
    saveData(data);
    return { success: true };
  },
}; 






























