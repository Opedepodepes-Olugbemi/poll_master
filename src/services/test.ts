import { appwriteService } from './appwrite';
import { v4 as uuidv4 } from 'uuid';

export async function testAppwriteIntegration() {
  try {
    console.log('Starting Appwrite integration test...');

    // Test creating a poll
    const testPoll = {
      id: uuidv4(),
      question: 'Test Poll Question',
      created_at: new Date().toISOString(),
      votes_count: 0,
      options: [
        {
          id: uuidv4(),
          text: 'Option 1',
          votes: 0
        },
        {
          id: uuidv4(),
          text: 'Option 2',
          votes: 0
        }
      ]
    };

    console.log('Creating test poll...');
    await appwriteService.createPoll(testPoll);
    console.log('Poll created successfully');

    // Test fetching polls
    console.log('Fetching polls...');
    const polls = await appwriteService.getPolls();
    console.log('Fetched polls:', polls);

    // Test fetching single poll
    console.log('Fetching single poll...');
    const poll = await appwriteService.getPoll(testPoll.id);
    console.log('Fetched poll:', poll);

    // Test voting
    console.log('Testing vote...');
    const userId = uuidv4();
    const voteResult = await appwriteService.votePoll(
      testPoll.id,
      testPoll.options[0].id,
      userId
    );
    console.log('Vote result:', voteResult);

    // Test duplicate vote
    console.log('Testing duplicate vote...');
    const duplicateVote = await appwriteService.votePoll(
      testPoll.id,
      testPoll.options[0].id,
      userId
    );
    console.log('Duplicate vote result:', duplicateVote);

    // Test deleting poll
    console.log('Deleting test poll...');
    const deleteResult = await appwriteService.deletePoll(testPoll.id);
    console.log('Delete result:', deleteResult);

    console.log('All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
} 