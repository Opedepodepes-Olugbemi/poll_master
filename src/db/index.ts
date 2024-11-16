import { Client, Databases, ID, Query, Models } from 'appwrite';
import { Poll } from '../types/poll';
import { PollDocument, OptionDocument, VoteDocument } from '../types/appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('673842a100103139395d');

const databases = new Databases(client);

// Constants for Appwrite resources
const DATABASE_ID = 'poll_master_db';
const POLLS_COLLECTION_ID = '67384402001506445ed0';
const OPTIONS_COLLECTION_ID = '673844290020d62b2699';
const VOTES_COLLECTION_ID = '67384437002126de664d';

interface DB {
  getPoll(id: string): Promise<Poll | null>;
  getPolls(): Promise<Poll[]>;
  createPoll(poll: Poll): Promise<void>;
  votePoll(pollId: string, optionId: string, userId: string): Promise<boolean>;
  deletePoll(id: string): Promise<boolean>;
}

class AppwriteDB implements DB {
  private static instance: AppwriteDB;

  private constructor() {}

  static getInstance(): AppwriteDB {
    if (!AppwriteDB.instance) {
      AppwriteDB.instance = new AppwriteDB();
    }
    return AppwriteDB.instance;
  }

  async getPoll(id: string): Promise<Poll | null> {
    try {
      const poll = await databases.getDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        id
      );

      const options = await databases.listDocuments(
        DATABASE_ID,
        OPTIONS_COLLECTION_ID,
        [Query.equal('poll_id', id)]
      );

      return {
        id: poll.$id,
        question: poll.question,
        created_at: poll.created_at,
        votes_count: poll.votes_count,
        options: options.documents.map(opt => ({
          id: opt.$id,
          text: opt.text,
          imageUrl: opt.image_url,
          votes: opt.votes
        }))
      };
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  }

  async getPolls(): Promise<Poll[]> {
    try {
      const pollsData = await databases.listDocuments<PollDocument>(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        [Query.orderDesc('created_at')]
      );

      const polls = await Promise.all(pollsData.documents.map(async (poll) => {
        const options = await databases.listDocuments<OptionDocument>(
          DATABASE_ID,
          OPTIONS_COLLECTION_ID,
          [Query.equal('poll_id', poll.$id)]
        );

        return {
          id: poll.$id,
          question: poll.question,
          created_at: poll.created_at,
          votes_count: poll.votes_count,
          options: options.documents.map(opt => ({
            id: opt.$id,
            text: opt.text,
            imageUrl: opt.image_url,
            votes: opt.votes
          }))
        };
      }));

      return polls;
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  }

  async createPoll(poll: Poll): Promise<void> {
    try {
      const createdPoll = await databases.createDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        ID.unique(),
        {
          question: poll.question,
          created_at: new Date().toISOString(),
          votes_count: 0
        }
      );

      await Promise.all(poll.options.map(option =>
        databases.createDocument(
          DATABASE_ID,
          OPTIONS_COLLECTION_ID,
          ID.unique(),
          {
            poll_id: createdPoll.$id,
            text: option.text,
            image_url: option.imageUrl,
            votes: 0
          }
        )
      ));
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  async votePoll(pollId: string, optionId: string, userId: string): Promise<boolean> {
    try {
      // Check if already voted
      const existingVotes = await databases.listDocuments(
        DATABASE_ID,
        VOTES_COLLECTION_ID,
        [
          Query.equal('poll_id', pollId),
          Query.equal('user_id', userId)
        ]
      );

      if (existingVotes.documents.length > 0) {
        return false;
      }

      // Record vote
      await databases.createDocument(
        DATABASE_ID,
        VOTES_COLLECTION_ID,
        ID.unique(),
        {
          poll_id: pollId,
          option_id: optionId,
          user_id: userId,
          created_at: new Date().toISOString()
        }
      );

      // Update option votes
      const option = await databases.listDocuments(
        DATABASE_ID,
        OPTIONS_COLLECTION_ID,
        [Query.equal('$id', optionId)]
      );

      if (option.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          OPTIONS_COLLECTION_ID,
          optionId,
          {
            votes: option.documents[0].votes + 1
          }
        );
      }

      // Update poll total
      const poll = await databases.getDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        pollId
      );

      await databases.updateDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        pollId,
        {
          votes_count: poll.votes_count + 1
        }
      );

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  }

  async deletePoll(id: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        id
      );
      return true;
    } catch (error) {
      console.error('Error deleting poll:', error);
      return false;
    }
  }
}

export const db = AppwriteDB.getInstance();