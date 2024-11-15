# Poll Master 🎮

A simple yet powerful Opensource web app that helps gaming communities organize and manage polls for game sessions. Perfect for deciding what to choose from a list of options!

## Features ✨

- Multiple voting options
- Easy to use commands
- Support for custom game options
- Role-based access control
- Results visualization

## Getting Started 🚀

### Prerequisites

- Node.js 16.x or higher
- TypeScript
- React
- [Poll API Key](https://www.pollsapi.com/)
- SQLite (for storing poll data)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/poll-master.git
   cd poll-master
   ```  
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure Environment Variables
Create a `.env` file in the root directory with your poll api key.

4. Build and Start
   ```bash
   npm run build
   npm start
   ```

## Todo

- [ ] Add timed polls with automatic closing

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Error Handling 🔧

The bot includes comprehensive error handling for:
- Invalid commands
- Database connection issues
- Permission errors
- Rate limiting

## Support 💬

For support, please:
1. Check the [Issues](https://github.com/yourusername/discord-game-poll-bot/