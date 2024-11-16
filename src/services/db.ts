import { Poll, DbPoll, PollOption } from '../types/poll';

interface UserInfo {
  id: string;
  username: string;
}

// Create a wrapper for IndexedDB
class IndexedDB {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'pollMasterDB';
  private readonly version = 1;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores
        if (!db.objectStoreNames.contains('polls')) {
          const pollStore = db.createObjectStore('polls', { keyPath: 'id' });
          pollStore.createIndex('created_at', 'created_at');
        }
        
        if (!db.objectStoreNames.contains('votes')) {
          const voteStore = db.createObjectStore('votes', { keyPath: ['poll_id', 'user_id'] });
          voteStore.createIndex('poll_id', 'poll_id');
        }
        
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      };
    });
  }

  async createPoll(poll: Poll) {
    if (!this.db) await this.init();
    return new Promise<{ success: boolean }>((resolve, reject) => {
      const transaction = this.db!.transaction(['polls'], 'readwrite');
      const store = transaction.objectStore('polls');
      const request = store.add(poll);

      request.onsuccess = () => resolve({ success: true });
      request.onerror = () => reject(request.error);
    });
  }

  async getPolls() {
    if (!this.db) await this.init();
    return new Promise<{ polls: Poll[] }>((resolve, reject) => {
      const transaction = this.db!.transaction(['polls'], 'readonly');
      const store = transaction.objectStore('polls');
      const request = store.getAll();

      request.onsuccess = () => resolve({ polls: request.result });
      request.onerror = () => reject(request.error);
    });
  }

  async getPollById(pollId: string, userId?: string) {
    if (!this.db) await this.init();
    return new Promise<Poll | null>(async (resolve, reject) => {
      const transaction = this.db!.transaction(['polls', 'votes'], 'readonly');
      const pollStore = transaction.objectStore('polls');
      const voteStore = transaction.objectStore('votes');

      try {
        const poll = await new Promise<Poll>((res, rej) => {
          const request = pollStore.get(pollId);
          request.onsuccess = () => res(request.result);
          request.onerror = () => rej(request.error);
        });

        if (!poll) {
          resolve(null);
          return;
        }

        if (userId) {
          const hasVoted = await new Promise<boolean>((res) => {
            const request = voteStore.get([pollId, userId]);
            request.onsuccess = () => res(!!request.result);
          });
          poll.hasVoted = hasVoted;
        }

        resolve(poll);
      } catch (error) {
        reject(error);
      }
    });
  }

  async votePoll(pollId: string, optionId: string, userId: string) {
    if (!this.db) await this.init();
    return new Promise<{ success: boolean; message?: string }>(async (resolve, reject) => {
      const transaction = this.db!.transaction(['polls', 'votes'], 'readwrite');
      const pollStore = transaction.objectStore('polls');
      const voteStore = transaction.objectStore('votes');

      try {
        // Check if already voted
        const hasVoted = await new Promise<boolean>((res) => {
          const request = voteStore.get([pollId, userId]);
          request.onsuccess = () => res(!!request.result);
        });

        if (hasVoted) {
          resolve({ success: false, message: 'Already voted' });
          return;
        }

        // Record vote
        await new Promise<void>((res, rej) => {
          const request = voteStore.add({
            poll_id: pollId,
            user_id: userId,
            option_id: optionId,
            created_at: new Date().toISOString()
          });
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });

        // Update poll
        const poll = await new Promise<Poll>((res, rej) => {
          const request = pollStore.get(pollId);
          request.onsuccess = () => res(request.result);
          request.onerror = () => rej(request.error);
        });

        poll.options = poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        poll.votes_count++;

        await new Promise<void>((res, rej) => {
          const request = pollStore.put(poll);
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });

        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  }

  async deletePoll(pollId: string) {
    if (!this.db) await this.init();
    return new Promise<{ success: boolean }>(async (resolve, reject) => {
      const transaction = this.db!.transaction(['polls', 'votes'], 'readwrite');
      const pollStore = transaction.objectStore('polls');
      const voteStore = transaction.objectStore('votes');

      try {
        // Delete poll
        await new Promise<void>((res, rej) => {
          const request = pollStore.delete(pollId);
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });

        // Delete associated votes
        const voteIndex = voteStore.index('poll_id');
        const voteRequest = voteIndex.getAllKeys(pollId);
        voteRequest.onsuccess = () => {
          voteRequest.result.forEach(key => {
            voteStore.delete(key);
          });
        };

        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    if (!this.db) await this.init();
    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          resolve({
            id: userId,
            username: `Anonymous_${userId.slice(0, 4)}`
          });
        }
      };

      request.onerror = () => {
        resolve({
          id: userId,
          username: `Anonymous_${userId.slice(0, 4)}`
        });
      };
    });
  }

  async updateUsername(userId: string, username: string): Promise<{ success: boolean }> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put({ id: userId, username });

      request.onsuccess = () => resolve({ success: true });
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new IndexedDB(); 