# KingdomQuest

A Christian-themed interactive web application featuring biblical stories, quizzes, and family devotional content. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🏛️ Core Features
- **Interactive Biblical Stories**: Engaging narratives with interactive elements, choices, and reflections
- **Educational Quizzes**: Test knowledge with multiple question types and Bible references
- **Family Altar Devotions**: Structured family devotion sessions with discussion questions and activities
- **User Authentication**: Email/password and magic link authentication with profile management
- **Child Account Linking**: Parents can manage and connect child accounts for family features

### 🎨 User Experience
- **Responsive Design**: Fully responsive interface optimized for all devices
- **Accessibility First**: ARIA-compliant components with keyboard navigation support
- **Christian Aesthetic**: Warm color palette with blues, golds, and earthy tones
- **Progressive Web App**: Optimized performance with modern web standards

### 🔧 Technical Features
- **Full-Stack Architecture**: Next.js with App Router, TypeScript, and Supabase backend
- **Real-time Data**: Live updates and progress tracking
- **Secure Authentication**: Supabase Auth with profile management
- **Media Support**: Image and document upload with secure storage
- **Admin Dashboard**: Content management and user administration

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Christian-themed design system
- **UI Components**: Headless UI and Radix UI for accessibility
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for media files
- **Edge Functions**: Supabase Edge Functions for server-side logic
- **Real-time**: Supabase Real-time subscriptions

### Development
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Development Server**: Next.js development server with hot reload

## Project Structure

```
kingdom-quest/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── select-story/      # Story selection
│   ├── quest/[id]/        # Individual story quest
│   ├── quiz/              # Quiz pages
│   ├── altar/             # Family altar devotions
│   ├── profile/           # User profile management
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   │   ├── button.tsx    
│   │   ├── card.tsx      
│   │   ├── input.tsx     
│   │   ├── story-card.tsx
│   │   ├── quiz-card.tsx 
│   │   └── family-altar-card.tsx
│   ├── navigation.tsx    # Main navigation
│   └── layout.tsx       # Layout wrapper
├── lib/                  # Utility libraries
│   ├── agents/          # AI agent stubs for future implementation
│   │   ├── story-generation.ts
│   │   ├── quiz-generation.ts
│   │   ├── content-curation.ts
│   │   └── family-engagement.ts
│   ├── auth.tsx         # Authentication context
│   ├── supabase.ts      # Supabase client and types
│   └── utils.ts         # Utility functions
├── supabase/            # Supabase configuration
│   └── functions/       # Edge functions
│       ├── profile-setup/
│       └── media-upload/
├── scripts/             # Development scripts
│   └── dev.sh          # Development environment setup
├── public/              # Static assets
├── Dockerfile           # Container configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── README.md           # This file
```

## Database Schema

The application uses a well-structured PostgreSQL database with the following key tables:

- **profiles**: User profiles with parent-child linking
- **stories**: Biblical stories with metadata
- **scenes**: Individual scenes within stories
- **quizzes**: Quiz definitions with difficulty levels
- **quiz_questions**: Questions with Bible references
- **quiz_options**: Answer options with explanations
- **family_altars**: Family devotion sessions
- **discussion_questions**: Age-appropriate discussion prompts
- **prayers**: Prayer templates and user prayers
- **media**: File storage metadata
- **map_markers**: Biblical location markers
- **progress tracking**: User progress through content

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase account and project
- Google Maps API key (optional, for location features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kingdom-quest
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   # Using the development script
   ./scripts/dev.sh
   
   # Or using npm directly
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Script

The included development script (`scripts/dev.sh`) provides several helpful commands:

```bash
# Start development server (default)
./scripts/dev.sh dev

# Build for production
./scripts/dev.sh build

# Start production server
./scripts/dev.sh start

# Run linting
./scripts/dev.sh lint

# Type checking
./scripts/dev.sh typecheck

# Show help
./scripts/dev.sh help
```

## Deployment

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t kingdom-quest \
     --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
     --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key \
     --build-arg NEXT_PUBLIC_SITE_URL=your_production_url \
     .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 kingdom-quest
   ```

### Vercel Deployment

1. Connect your repository to Vercel
2. Set the environment variables in your Vercel project settings
3. Deploy automatically on push to main branch

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | Optional |
| `NEXT_PUBLIC_SITE_URL` | Full URL of your site | Yes |

### Supabase Setup

The application requires several Supabase configurations:

1. **Database Tables**: All tables are created via the provided schema
2. **Authentication**: Email/password and magic link providers enabled
3. **Storage**: Public bucket for media files
4. **Edge Functions**: Profile setup and media upload functions
5. **Row Level Security**: Implemented for data protection

## Features in Detail

### Authentication & User Management

- **Multiple Sign-in Options**: Email/password and magic link authentication
- **Profile Management**: User profiles with age groups and preferences
- **Family Accounts**: Parent accounts can link and manage child profiles
- **Secure Sessions**: JWT-based authentication with automatic refresh

### Interactive Stories

- **Scene-based Navigation**: Stories broken into manageable scenes
- **Interactive Elements**: Choices, reflections, prayers, and activities
- **Progress Tracking**: Automatic saving of user progress
- **Bible References**: Each story linked to specific Bible passages
- **Age-appropriate Content**: Content filtered by age groups

### Quiz System

- **Multiple Question Types**: Multiple choice, true/false, fill-in-blank
- **Timed Quizzes**: Optional time limits for added challenge
- **Detailed Feedback**: Explanations for correct and incorrect answers
- **Progress Tracking**: Score history and completion tracking
- **Bible Integration**: Questions linked to specific Bible verses

### Family Altar

- **Structured Devotions**: Complete family devotion sessions
- **Discussion Questions**: Age-appropriate conversation starters
- **Activity Suggestions**: Family-friendly biblical activities
- **Scripture Integration**: Featured Bible passages with each devotion
- **Flexible Timing**: Devotions designed for various time commitments

## AI Agent Architecture

The application includes a robust architecture for future AI integration through specialized agents:

### Story Generation Agent
- Generate age-appropriate biblical narratives
- Create interactive story elements
- Adapt content based on user preferences

### Quiz Generation Agent
- Create contextual quizzes from biblical content
- Generate questions with varying difficulty levels
- Provide intelligent answer evaluation

### Content Curation Agent
- Suggest related content based on user activity
- Categorize and tag content automatically
- Validate biblical accuracy of generated content

### Family Engagement Agent
- Create personalized family devotion plans
- Generate age-appropriate discussion questions
- Track family spiritual growth and engagement

*Note: These agents are currently implemented as stubs and will be developed in future updates.*

## Accessibility

KingdomQuest is built with accessibility as a core principle:

- **ARIA Compliance**: All interactive elements include proper ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility for all features
- **Screen Reader Support**: Semantic HTML and proper heading structure
- **Color Contrast**: WCAG AA compliant color combinations
- **Responsive Design**: Touch-friendly interface with appropriate target sizes
- **Alternative Text**: All images include descriptive alt text

## Contributing

### Development Guidelines

1. **Code Style**: Follow the existing TypeScript and React patterns
2. **Component Structure**: Use the established component architecture
3. **Accessibility**: Ensure all new features meet accessibility standards
4. **Testing**: Write tests for new functionality
5. **Documentation**: Update documentation for new features

### Adding New Content

1. **Stories**: Add new biblical stories through the admin interface
2. **Quizzes**: Create quizzes with proper Bible references
3. **Devotions**: Design family-friendly devotional content
4. **Media**: Upload images and documents through the secure upload system

## Security

- **Authentication**: Secure JWT-based authentication via Supabase
- **Data Protection**: Row Level Security (RLS) policies on all tables
- **Input Validation**: Server-side validation of all user inputs
- **File Upload Security**: Secure media upload with file type validation
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS**: SSL/TLS encryption for all communications

## Performance

- **Server-Side Rendering**: Next.js SSR for optimal initial load times
- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic code splitting for reduced bundle sizes
- **Caching**: Intelligent caching strategies for static and dynamic content
- **Database Optimization**: Indexed queries and optimized database schema

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Accessibility Tools**: Compatible with major screen readers
- **Progressive Enhancement**: Graceful degradation for older browsers

## License

This project is created for educational and religious purposes. See the LICENSE file for details.

## Support

For technical support or questions about the application:

1. Check the documentation in this README
2. Review the code comments for implementation details
3. Examine the database schema for data relationships
4. Test the application features using the provided seed data

---

**Author**: MiniMax Agent  
**Created**: 2025-08-25  
**Last Updated**: 2025-08-25  

*"Train up a child in the way he should go; even when he is old he will not depart from it." - Proverbs 22:6*Final deployment trigger.
