# Engineering Learn - Free Tech Education Platform

A production-ready Learning Management System (LMS) focused on free, practical tech education for engineering students. Built with React, TypeScript, SQLite, and Tailwind CSS.

## Philosophy

- **All content is free forever** - No course selling, no paywalls
- **No certificates or gatekeeping** - Just knowledge
- **Pattern-based learning** - Focus on practical patterns over theory
- **Community-driven** - Peer learning through discussions
- **Offline-capable** - Data persists in browser storage

## Features

### Core Features

#### 1. Authentication
- Email + Password authentication
- Persistent sessions via localStorage
- Protected routes
- Secure password hashing with Web Crypto API

#### 2. Dashboard
- Learning path progress tracking
- Current streak and longest streak
- Total learning time
- Topics completed counter
- Weak areas identification
- Revision reminders with spaced repetition
- Motivational stats and progress visualization

#### 3. Learning Paths (7 Paths)
- **Data Structures & Algorithms** - Pattern-based DSA learning
- **System Design** - From basics to distributed systems
- **Low Level Design** - OOP and design patterns
- **Operating Systems** - Process, memory, threading concepts
- **Computer Networks** - Protocols and networking fundamentals
- **Database Management** - SQL, transactions, optimization
- **AI & Machine Learning** - Practical ML introduction

Each path contains:
- Organized modules
- Structured topics with concepts, thought processes, and common mistakes
- Progress tracking per topic
- Estimated completion time

#### 4. Topic Viewer
- Clean, distraction-free content display
- Concept explanations
- Thought process sections
- Common mistakes warnings
- 3-5 practice problems per topic
- Topic-wise discussion threads
- Previous/Next navigation

#### 5. Practice Problems
- Pattern-tagged problems
- Difficulty levels (Easy, Medium, Hard)
- Filter by difficulty and pattern
- Solution submission and tracking
- Past attempts history
- Hints system (progressive reveal)
- Optimal solution viewing
- Pattern recognition learning

#### 6. Progress Tracking & Analytics
- Per-topic mastery scores
- Time spent tracking
- Weak area identification
- Recent activity feed
- Visual progress indicators
- Topic completion status

#### 7. Revision Engine
- Spaced repetition algorithm
- Scheduled review reminders
- "Revise Today" section on dashboard
- Review count tracking
- Automatic scheduling based on mastery

#### 8. Community Discussions
- Topic-wise discussion threads
- Anonymous posting option
- Upvoting system
- Nested replies
- Search functionality
- User reputation (based on helpful contributions)

#### 9. Optional Paid Features (Non-Intrusive)
- 1:1 Mentorship sessions
- Group doubt resolution sessions
- Resume review services
- Mock interview practice
- **Important**: All core content remains free, these are truly optional

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with dark theme
- **Routing**: React Router v7
- **Database**: SQLite (sql.js) - runs entirely in the browser
- **Authentication**: Custom auth with Web Crypto API
- **Storage**: localStorage for data persistence
- **Icons**: Lucide React

## Database Schema

### Tables (SQLite)
- `auth_users` - User credentials and authentication
- `user_profiles` - Extended user data, streaks, learning time
- `learning_paths` - 7 main learning tracks
- `topics` - Individual learning units
- `lessons` - Content within topics
- `practice_problems` - Coding/theory problems
- `problem_submissions` - Solution attempts history
- `user_progress` - Topic completion and mastery
- `cohorts` - Study groups
- `cohort_members` - Group membership
- `discussion_threads` - Community Q&A
- `discussion_replies` - Thread responses
- `daily_goals` - Learning targets
- `donations` - Platform support
- `subscriptions` - Premium features

All data is stored locally in the browser using sql.js with localStorage persistence.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

No environment variables or external database setup required - everything runs in the browser.

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components (sidebar, nav)
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/
│   ├── sqlite-db.ts    # SQLite database wrapper
│   ├── supabase.ts     # Query builder (SQLite-backed)
│   └── crypto.ts       # Web Crypto API utilities
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── LearningPaths.tsx
│   ├── PathDetail.tsx
│   ├── TopicDetail.tsx
│   ├── PracticeProblems.tsx
│   ├── ProblemDetail.tsx
│   ├── Progress.tsx
│   ├── Discussions.tsx
│   ├── ThreadDetail.tsx
│   ├── Cohorts.tsx
│   ├── Mentorship.tsx
│   ├── Donate.tsx
│   └── Subscriptions.tsx
└── App.tsx             # Main app with routing
```

## Key Features Implementation

### Dark Mode by Default
Clean, minimal dark theme optimized for extended study sessions. Uses dark grays and blues, avoiding purple/indigo hues.

### Responsive Design
Fully responsive from mobile to desktop with:
- Mobile drawer navigation
- Responsive grids
- Touch-friendly interactions

### Performance
- Code splitting for faster initial load
- Lazy loading where appropriate
- Efficient client-side database queries
- Minimal bundle size

### Offline-First Architecture
- SQLite database runs entirely in the browser via sql.js
- Data persists to localStorage
- No server required for core functionality
- Works offline after initial load

### Security
- Passwords hashed with PBKDF2 via Web Crypto API
- Protected routes
- Secure authentication flow

## Design Principles

1. **Calm, Focused Interface** - Minimal distractions, engineering-first
2. **No Purple/Indigo** - Uses blues, grays, and greens
3. **Smooth Animations** - Subtle micro-interactions
4. **Developer-Friendly Typography** - Readable during long sessions
5. **Progressive Disclosure** - Show what's needed, when needed

## Future Enhancements

- Real-time collaboration features
- Code editor integration
- Video content support
- Mobile native apps
- Cloud sync option
- Achievement system
- Leaderboards (optional, community-driven)

## License

This is an educational project demonstrating a production-ready LMS.

## Contributing

This platform is built for the community. Contributions welcome!

---

**Remember**: All learning content is free forever. Optional paid features help sustain the platform while keeping education accessible to all.
