export interface PollOption {
  id: string;
  text: string;
  votes: number;
  imageUrl?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  created_at: string;
  votes_count: number;
  hasVoted?: boolean;
  sessionId?: string;
}

export interface CreatePollData {
  question: string;
  options: {
    text: string;
    imageUrl?: string;
  }[];
}