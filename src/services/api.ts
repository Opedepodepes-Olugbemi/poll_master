import { v4 as uuidv4 } from 'uuid';
import { CreatePollData, Poll } from '../types/poll';
import { mockDb } from './mockDb';

export async function createPoll(data: CreatePollData) {
  const pollId = uuidv4();
  const newPoll: Poll = {
    id: pollId,
    question: data.question,
    created_at: new Date().toISOString(),
    options: data.options.map(opt => ({
      id: uuidv4(),
      text: opt.text,
      imageUrl: opt.imageUrl,
      votes: 0
    })),
    votes_count: 0
  };
  
  await mockDb.createPoll(newPoll);
  return { id: pollId };
}

export async function getPolls() {
  try {
    const result = await mockDb.getPolls();
    return result;
  } catch (error) {
    console.error('Error getting polls:', error);
    return { polls: [] };
  }
}

export type VotePollResponse = {
  success: boolean;
  poll?: Poll;
  message?: string;
};

export async function votePoll(pollId: string, optionId: string): Promise<VotePollResponse> {
  try {
    const result = await mockDb.votePoll(pollId, optionId);
    if (!result.success) {
      return { success: false, message: result.message || 'Failed to vote' };
    }
    
    const poll = await mockDb.getPollById(pollId);
    if (!poll) {
      return { success: false, message: 'Poll not found after voting' };
    }
    
    return { success: true, poll };
  } catch (error) {
    console.error('Error voting on poll:', error);
    return { success: false, message: 'Failed to vote' };
  }
}

export async function getPoll(pollId: string): Promise<{ poll: Poll }> {
  try {
    const poll = await mockDb.getPollById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }
    return { poll };
  } catch (error) {
    console.error('Error getting poll:', error);
    throw new Error('Failed to fetch poll');
  }
}

export async function deletePoll(pollId: string) {
  try {
    return await mockDb.deletePoll(pollId);
  } catch (error) {
    console.error('Error deleting poll:', error);
    return { success: false };
  }
}

export function getUserInfo() {
  return mockDb.getUserInfo();
}

export function updateUsername(username: string) {
  return mockDb.updateUsername(username);
}