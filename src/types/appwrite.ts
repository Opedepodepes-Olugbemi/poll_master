export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

export interface PollDocument extends AppwriteDocument {
  question: string;
  created_at: string;
  votes_count: number;
}

export interface OptionDocument extends AppwriteDocument {
  poll_id: string;
  text: string;
  image_url?: string;
  votes: number;
}

export interface VoteDocument extends AppwriteDocument {
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
} 