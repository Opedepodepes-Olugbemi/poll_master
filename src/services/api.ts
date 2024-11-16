import { v4 as uuidv4 } from 'uuid';
import { CreatePollData, Poll } from '../types/poll';
import { appwriteService } from './appwrite';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

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
  
  await appwriteService.createPoll(newPoll);
  return { id: pollId };
}

export async function getPolls() {
  const polls = await appwriteService.getPolls();
  return { polls };
}

export type VotePollResponse = {
  success: boolean;
  poll?: Poll;
  message?: string;
};

export async function votePoll(pollId: string, optionId: string): Promise<VotePollResponse> {
  const sessionId = getSessionId();
  const success = await appwriteService.votePoll(pollId, optionId, sessionId);
  
  if (!success) {
    return { success: false, message: 'Already voted or poll not found' };
  }
  
  const poll = await appwriteService.getPoll(pollId);
  if (!poll) {
    return { success: false, message: 'Poll not found after voting' };
  }
  
  return { success: true, poll };
}

export async function getPoll(pollId: string) {
  const poll = await appwriteService.getPoll(pollId);
  if (!poll) {
    throw new Error('Poll not found');
  }
  return { poll };
}

export async function deletePoll(pollId: string) {
  const success = await appwriteService.deletePoll(pollId);
  return { success };
}
