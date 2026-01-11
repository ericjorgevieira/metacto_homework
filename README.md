# Feature Voting System

A full-stack mobile application for voting on feature ideas. Built with React Native (Expo), Node.js (Express), TypeScript, and SQLite.

## Project Structure

```
metacto_homework/
├── api/                    # Backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── database/       # Database setup and schema
│   │   └── middleware/     # Validation middleware
│   ├── server.js           # API entry point
│   └── database.sqlite     # SQLite database (auto-generated, not in git)
│
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API service layer
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── App.tsx             # App entry point
│
└── prompts.txt             # Development audit log
```

## Features

- **Simple Authentication**: Username-only login (no passwords)
- **Feature Management**: Create, edit, and delete feature requests
- **Voting System**: Like and dislike features
- **Real-time Updates**: Pull-to-refresh functionality
- **User Ownership**: Users can only edit/delete their own features
- **Clean UI**: Modern, intuitive interface with separated styles

## Tech Stack

### Backend
- Node.js
- Express.js
- Better-SQLite3
- CORS

### Mobile
- React Native
- Expo
- TypeScript
- React Navigation
- Axios
- AsyncStorage

## Prerequisites

- Node.js (v20+ recommended)
- npm or yarn
- iOS Simulator (for macOS) or Android Emulator
- Expo Go app (for testing on physical devices)

## Installation

### 1. Clone the repository

```bash
cd /Users/ericoliveira/Documents/htdocs/interview_tests/metacto_homework
```

### 2. Install API dependencies

```bash
cd api
npm install
```

### 3. Install Mobile dependencies

```bash
cd ../mobile
npm install
```

## Running the Project

### Start the API Server

```bash
cd api
npm start
```

The API will run on `http://localhost:3000`

### Start the Mobile App

In a new terminal:

```bash
cd mobile
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## API Configuration for Physical Devices

If testing on a physical device, update the API URL in:
`mobile/src/services/api.ts`

```typescript
// Change from localhost to your machine's IP address
const API_URL = 'http://YOUR_MACHINE_IP:3000/api';

// For Android emulator, use:
const API_URL = 'http://10.0.2.2:3000/api';
```

## API Endpoints

### Users
- `POST /api/users` - Create or retrieve user

### Features
- `GET /api/features?userId={id}` - Get all features
- `GET /api/features/:id?userId={id}` - Get feature by ID
- `POST /api/features` - Create new feature
- `PUT /api/features/:id` - Update feature
- `DELETE /api/features/:id?userId={id}` - Delete feature

### Votes
- `POST /api/votes` - Create or update vote
- `DELETE /api/votes?featureId={id}&userId={id}` - Remove vote

## Testing

### Automated Tests (167 tests total)

The project includes comprehensive Jest-based test suites for both API (52 tests) and mobile app (115 tests) with high coverage across all critical functionality.

#### API Tests (52 tests)

**Test Coverage:**
- ✅ Validation middleware (27 tests)
- ✅ Database operations (19 tests)
- ✅ Route integration (6 tests)

**Run API tests:**
```bash
cd api
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Test Structure:**
```
api/tests/
├── setup/
│   ├── testDb.js         # Test database utilities
│   └── testHelpers.js    # Helper functions
└── unit/
    ├── validation.test.js  # Middleware validation
    ├── database.test.js    # Database operations
    └── routes.test.js      # Route integration
```

#### Mobile Tests

The mobile app has **115 passing tests** with **84% overall coverage** covering:
- ✅ Component tests (37 tests) - **100% coverage**
  - FeatureCard (12 tests)
  - VoteButtons (8 tests)
  - FeatureForm (17 tests)
- ✅ Screen tests (62 tests) - **96% coverage**
  - UsernameScreen (13 tests)
  - FeatureListScreen (19 tests)
  - FeatureDetailScreen (21 tests)
  - CreateFeatureScreen (7 tests)
  - EditFeatureScreen (7 tests)
- ✅ Service tests (9 tests) - **100% coverage**
- ✅ Utility tests (7 tests) - **100% coverage**

**Coverage Summary:**
- Overall: 84% statements, 83% branches, 86% functions, 84% lines
- Components: 100% across all metrics
- Screens: 96% statements, 84% branches, 96% functions, 98% lines
- Services (API): 100% across all metrics
- Utils (Storage): 100% across all metrics

**Run mobile tests:**
```bash
cd mobile
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

**Test Structure:**
```
mobile/src/
├── __tests__/
│   ├── components/
│   │   ├── FeatureCard.test.tsx
│   │   ├── VoteButtons.test.tsx
│   │   └── FeatureForm.test.tsx
│   ├── screens/
│   │   ├── UsernameScreen.test.tsx
│   │   ├── FeatureListScreen.test.tsx
│   │   ├── FeatureDetailScreen.test.tsx
│   │   ├── CreateFeatureScreen.test.tsx
│   │   └── EditFeatureScreen.test.tsx
│   ├── services/
│   │   └── api.test.ts
│   └── utils/
│       └── storage.test.ts
└── __mocks__/
    └── axios.ts
```

### Manual API Testing

You can test the API endpoints using curl:

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Create a feature
curl -X POST http://localhost:3000/api/features \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark Mode","description":"Add dark mode support","userId":1}'

# Vote on a feature
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"featureId":1,"userId":1,"voteType":"like"}'

# Get all features
curl "http://localhost:3000/api/features?userId=1"
```

### Test Database

The API tests use a separate test database (`database.test.sqlite`) that is automatically created and cleaned between tests. This ensures tests don't interfere with development data.

## App Flow

1. **Username Screen**: Enter a username to get started
2. **Feature List**: Browse all features, vote, and create new ones
3. **Feature Detail**: View full details, edit/delete (if owner)
4. **Create/Edit Feature**: Add or modify feature ideas

## Database

The application uses SQLite with the `better-sqlite3` package.

### Automatic Setup

**No manual database setup required!** The database file (`api/database.sqlite`) is automatically created when the API server starts for the first time. The schema is initialized from `api/src/database/schema.sql`.

**Note:** The `database.sqlite` file is excluded from version control (`.gitignore`) as it contains local development data. Each developer/environment will have their own database instance.

### Schema

#### users
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- created_at (DATETIME)

#### features
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- user_id (INTEGER FK)
- created_at (DATETIME)
- updated_at (DATETIME)

#### votes
- id (INTEGER PRIMARY KEY)
- feature_id (INTEGER FK)
- user_id (INTEGER FK)
- vote_type (TEXT: 'like' or 'dislike')
- created_at (DATETIME)
- UNIQUE(feature_id, user_id)

## Development Notes

- TypeScript is used throughout the mobile app
- Styles are separated into `.styles.ts` files
- The API uses synchronous better-sqlite3 for simplicity
- No authentication tokens - username-only (suitable for learning)
- SQLite database is created automatically on first run (not in version control)

## Troubleshooting

### API won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed: `cd api && npm install`

### Mobile app can't connect to API
- Verify API is running on port 3000
- Update API_URL in `mobile/src/services/api.ts` with correct IP
- For physical devices, ensure you're on the same network

### TypeScript errors
- Run `npx expo start -c` to clear cache
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## License

This is a learning project created for skill development purposes.
