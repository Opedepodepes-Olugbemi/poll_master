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



   git clone https://github.com/Opedepodepes-Olugbemi/poll_master



   cd poll-master



   ```  



2. Install dependencies



   ```bash



   npm install



   ```



3. Configure Environment Variables



Create a `.env` file in the root directory with the following variables:







```env



# Required



POLLS_API_KEY=your_polls_api_key_here    # Get this from pollsapi.com



NODE_ENV=development                      # or 'production' for deployment



PORT=3000                                # Port for the web server



DATABASE_URL="file:./dev.db"             # SQLite database location







# Optional



ENABLE_ANALYTICS=false                    # Set to true to enable analytics



```







Make sure to replace `your_polls_api_key_here` with your actual API key from pollsapi.com.







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



1. Check the [Issues](https://github.com/Opedepodepes-Olugbemi/poll_master/







## Deployment 🚀



This project is automatically deployed to GitHub Pages. You can view the live version at:

https://Opedepodepes-Olugbemi.github.io/poll_master



To deploy manually:

```bash

npm run deploy

```






