import { Client, Databases, ID, Query } from 'appwrite';
import { Poll } from '../types/poll';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('673842a100103139395d');

const databases = new Databases(client);

// Update these IDs with your actual Appwrite IDs
const DATABASE_ID = '673843f2001bc95fb5c2';           // <-- This should match your database ID
const POLLS_COLLECTION_ID = '67384402001506445ed0';
const OPTIONS_COLLECTION_ID = '673844290020d62b2699';
const VOTES_COLLECTION_ID = '67384437002126de664d';
const USERS_COLLECTION_ID = 'users';

export const appwriteService = {
  async createPoll(poll: Poll): Promise<void> {
    try {
      // Create poll document
      await databases.createDocument(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        poll.id, // Use the poll's ID directly
        {
          question: poll.question,
          created_at: new Date().toISOString(),
          votes_count: 0
        }
      );

      // Create options documents
      await Promise.all(poll.options.map(option =>
        databases.createDocument(
          DATABASE_ID,
          OPTIONS_COLLECTION_ID,
          option.id, // Use the option's ID directly
          {
            poll_id: poll.id,
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
  },

  async getPolls(): Promise<Poll[]> {
    try {
      const pollsData = await databases.listDocuments(
        DATABASE_ID,
        POLLS_COLLECTION_ID,
        [Query.orderDesc('created_at')]
      );

      const polls = await Promise.all(pollsData.documents.map(async (poll) => {
        const options = await databases.listDocuments(
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
  },

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
  },

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
  },

  async deletePoll(id: string): Promise<boolean> {
    try {
      // Delete poll and its options (options will be deleted by Appwrite's cascading delete)
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
  },

  async getUserInfo(userId?: string): Promise<{ id: string; username: string }> {
    try {
      const actualUserId = userId || localStorage.getItem('userId') || ID.unique();
      
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', actualUserId);
      }

      try {
        const user = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          actualUserId
        );
        return {
          id: user.$id,
          username: user.username
        };
      } catch {
        // If user doesn't exist, return default
        return {
          id: actualUserId,
          username: `User_${actualUserId.slice(0, 4)}`
        };
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      return {
        id: 'anonymous',
        username: 'Anonymous'
      };
    }
  },

  async updateUsername(username: string): Promise<boolean> {
    try {
      const userId = localStorage.getItem('userId') || ID.unique();
      
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', userId);
      }

      try {
        await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
        // Update existing user
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          { username }
        );
      } catch {
        // Create new user
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          { username }
        );
      }
      return true;
    } catch (error) {
      console.error('Error updating username:', error);
      return false;
    }
  }
}; 