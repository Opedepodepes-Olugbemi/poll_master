import { v4 as uuidv4 } from 'uuid';

import { CreatePollData, Poll } from '../types/poll';

import { dbService } from './db';



// Get or create session ID

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

  

  await dbService.createPoll(newPoll);

  return { id: pollId };

}



export async function getPolls() {

  return dbService.getPolls();

}



export type VotePollResponse = {

  success: boolean;

  poll?: Poll;

  message?: string;

};



export async function votePoll(pollId: string, optionId: string): Promise<VotePollResponse> {

  const sessionId = getSessionId();

  const result = await dbService.votePoll(pollId, optionId, sessionId);

  

  if (!result.success) {

    return { success: false, message: result.message };

  }

  

  const poll = await dbService.getPollById(pollId, sessionId);

  if (!poll) {

    return { success: false, message: 'Poll not found after voting' };

  }

  

  return { success: true, poll };

}



export async function getPoll(pollId: string) {

  const sessionId = getSessionId();

  const poll = await dbService.getPollById(pollId, sessionId);

  if (!poll) {

    throw new Error('Poll not found');

  }

  return { poll };

}



export async function deletePoll(pollId: string) {

  return dbService.deletePoll(pollId);

}



export function getUserInfo() {

  const sessionId = getSessionId();

  return dbService.getUserInfo(sessionId);

}



export function updateUsername(username: string) {

  const sessionId = getSessionId();

  return dbService.updateUsername(sessionId, username);

}
