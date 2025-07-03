# GrowwStocksApp

A React Native mobile application for tracking and analyzing stock market data, built with Expo and TypeScript. The app provides real-time stock information, watchlist management, and comprehensive stock analytics.

## Features

### Core Functionality
- **Stock Exploration**: Browse and search for stocks with real-time data
- **Watchlist Management**: Create and manage personalized stock watchlists
- **Stock Details**: Comprehensive stock information including price, volume, market cap, and technical indicators
- **Market Analysis**: View top gainers, losers, and most actively traded stocks
- **Interactive Charts**: Visualize stock price movements with interactive charts
- **Dark/Light Theme**: Toggle between dark and light themes for better user experience

### Data Features
- Real-time stock prices and market data
- Historical price charts with timezone support
- Company information and financial metrics
- Search functionality with debounced API calls
- Offline data caching for improved performance

## Tech Stack

### Frontend
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (53.0.13) - Development platform and build tools
- **TypeScript** (5.8.3) - Type-safe JavaScript development
- **React Navigation** - Navigation between screens
- **NativeWind** - Tailwind CSS for React Native styling

### UI/UX
- **Tailwind CSS** - Utility-first CSS framework
- **React Native Chart Kit** - Interactive charts and graphs
- **Expo Vector Icons** - Icon library
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch interactions

### Data & Storage
- **Alpha Vantage API** - Stock market data provider
- **AsyncStorage** - Local data persistence
- **React Native Dotenv** - Environment variable management

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Babel** - JavaScript compiler

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

For mobile development:
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GrowwStocksApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**Note**: You'll need to obtain an API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key). The free tier allows 25 API calls per day.

### 4. Start the Development Server
```bash
npm start
```

This will start the Expo development server and open the Expo DevTools in your browser.

### 5. Run on Device/Simulator

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Web
```bash
npm run web
```

## Project Structure

```
GrowwStocksApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── screens/            # Application screens
│   ├── services/           # API and data services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, and static assets
├── App.tsx                 # Main application component
├── package.json            # Dependencies and scripts
└── app.json               # Expo configuration
```

## Key Components

### Screens
- **ExploreScreen**: Main stock browsing interface
- **WatchlistScreen**: Personal stock watchlist management
- **ProductScreen**: Detailed stock information and charts
- **ViewAllScreen**: Extended lists of stocks (gainers, losers, etc.)
- **SettingsScreen**: App configuration and preferences

### Services
- **stockService.ts**: Handles all stock-related API calls and data management
- **watchlistService.ts**: Manages watchlist operations and local storage

### Components
- **StockCard**: Displays individual stock information
- **SimpleChart**: Renders stock price charts
- **CustomAlert**: Custom alert dialogs
- **ThemeToggle**: Dark/light theme switcher

## API Integration

The app integrates with the Alpha Vantage API for real-time stock data:

- **Rate Limiting**: Implements 25 requests per day limit
- **Caching**: 24-hour cache for API responses
- **Error Handling**: Graceful fallback to cached data
- **Debounced Search**: Optimized search with 500ms debounce

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Configuration

<!-- ### Expo Configuration
The app is configured in `app.json` with:
- Portrait orientation
- Support for iOS tablets
- Android edge-to-edge display
- Custom splash screen and icons -->

### Styling
The app uses NativeWind (Tailwind CSS for React Native) with:
- Custom color schemes for light/dark themes
- Responsive design patterns
- Consistent spacing and typography

## Performance Optimizations

- **API Caching**: Reduces API calls and improves load times
- **Debounced Search**: Prevents excessive API requests during typing
- **Lazy Loading**: Components load only when needed
- **Memory Management**: Proper cleanup of timers and listeners

<!-- ## Troubleshooting

### Common Issues

1. **API Rate Limit Exceeded**
   - The free Alpha Vantage API has a 25 requests/day limit
   - Check the cache status in settings
   - Consider upgrading to a paid API key

2. **Build Errors**
   - Clear Metro cache: `npx expo start --clear`
   - Reset node_modules: `rm -rf node_modules && npm install`

3. **Navigation Issues**
   - Ensure all navigation dependencies are properly installed
   - Check for proper screen registration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the Expo documentation
- Open an issue in the repository  -->