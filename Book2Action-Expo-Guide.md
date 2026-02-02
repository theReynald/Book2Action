# Book2Action - Expo Mobile App Recreation Guide

> A comprehensive guide to recreating the Book2Action web app as a modern mobile application using Expo React Native.

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Core Features](#core-features)
3. [Data Types](#data-types)
4. [Prompts for Recreation](#prompts-for-recreation)
   - [Prompt 1: Project Setup & Architecture](#prompt-1-project-setup--architecture)
   - [Prompt 2: Type Definitions & Constants](#prompt-2-type-definitions--constants)
   - [Prompt 3: Theme Store & Provider](#prompt-3-theme-store--provider)
   - [Prompt 4: OpenRouter AI Service](#prompt-4-openrouter-ai-service)
   - [Prompt 5: Home Screen with Search & Trending](#prompt-5-home-screen-with-search--trending)
   - [Prompt 6: Book Result Screen](#prompt-6-book-result-screen)
   - [Prompt 7: Action Step Detail Screen](#prompt-7-action-step-detail-screen)
   - [Prompt 8: Utility Functions](#prompt-8-utility-functions)
   - [Prompt 9: PDF Export Feature](#prompt-9-pdf-export-feature)
   - [Prompt 10: Navigation & Polish](#prompt-10-navigation--polish)
5. [Web vs Mobile Differences](#web-vs-mobile-differences)

---

## App Overview

**Book2Action** is an application that transforms books into actionable insights. Users can search for any book by title and receive an AI-generated comprehensive summary along with a personalized 7-day action plan based on the book's content.

The app uses OpenRouter API with GPT-4.1 to analyze books and generate structured, practical action steps that users can implement in their daily lives.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Book Search** | Search any book by title |
| **AI-Powered Analysis** | Uses OpenRouter API (GPT-4.1) to generate book analysis |
| **Book Summary** | 3-paragraph comprehensive summary |
| **7-Day Action Plan** | Daily actionable steps with chapter references |
| **Trending Books** | Carousel of 25+ popular self-help/business books |
| **Text-to-Speech** | Read aloud functionality with voice selection & speed control |
| **PDF Export** | Generate detailed or short action plan PDFs |
| **Google Calendar Integration** | Add action steps directly to calendar |
| **Amazon Links** | Quick links to purchase books |
| **Dark/Light Theme Toggle** | Full theme support with persistence |
| **Action Step Detail View** | Detailed view for each action step with implementation guide |

---

## Data Types

### Book Interface

```typescript
export interface Book {
  title: string;
  author: string;
  summary: string;
  actionableSteps: ActionableStep[];
  coverImageUrl?: string;
  publishedYear?: number;
  genre?: string;
  isbn?: string;
}
```

### ActionableStep Interface

```typescript
export interface ActionableStep {
  step: string;
  chapter: string;
  day?: string; // Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  details?: DetailedStepInfo;
}
```

### DetailedStepInfo Interface

```typescript
export interface DetailedStepInfo {
  sentences: string[];  // 5 detailed implementation sentences
  keyTakeaway: string;  // Core lesson summary
}
```

### BookSearchResult Interface

```typescript
export interface BookSearchResult {
  success: boolean;
  book?: Book;
  error?: string;
  rawContent?: string;
  parseError?: string;
}
```

---

## Prompts for Recreation

### Prompt 1: Project Setup & Architecture

```
Create a new Expo React Native mobile app called "Book2Action" with the following setup:

TECH STACK:
- Expo SDK 52+ with TypeScript
- Expo Router for file-based navigation
- NativeWind (TailwindCSS for React Native)
- React Query (TanStack Query) for data fetching
- Zustand for state management
- expo-secure-store for API key storage
- expo-speech for text-to-speech
- expo-sharing & expo-print for PDF export
- expo-linking for external URLs
- expo-haptics for tactile feedback
- @expo/vector-icons (Lucide icons equivalent)

PROJECT STRUCTURE:
/app
  _layout.tsx (root layout with theme provider)
  index.tsx (home screen with search & trending)
  book/[id].tsx (book result screen)
  action/[id].tsx (action step detail screen)
/components
  Header.tsx
  SearchBar.tsx
  TrendingBooks.tsx
  BookResult.tsx
  ActionStepCard.tsx
  ActionStepDetail.tsx
  ErrorMessage.tsx
  LoadingAnimation.tsx
  ThemeToggle.tsx
  ExportPdfButton.tsx
/services
  openRouterService.ts
  trendingBooksService.ts
/types
  Book.ts
/utils
  contentFilter.ts
  calendarLinks.ts
  amazonLinks.ts
/stores
  themeStore.ts
  bookStore.ts
/constants
  colors.ts
  fallbackBooks.ts

Install all dependencies and set up the basic folder structure with TypeScript configuration.
```

---

### Prompt 2: Type Definitions & Constants

```
Create the TypeScript type definitions and constants for the Book2Action Expo app:

TYPES (types/Book.ts):

export interface DetailedStepInfo {
  sentences: string[];
  keyTakeaway: string;
}

export interface ActionableStep {
  step: string;
  chapter: string;
  day?: string; // Monday, Tuesday, etc.
  details?: DetailedStepInfo;
}

export interface Book {
  title: string;
  author: string;
  summary: string;
  actionableSteps: ActionableStep[];
  coverImageUrl?: string;
  publishedYear?: number;
  genre?: string;
  isbn?: string;
}

export interface BookSearchResult {
  success: boolean;
  book?: Book;
  error?: string;
}

CONSTANTS (constants/colors.ts):
Create a color palette with:
- Primary blue: #3182ce
- Secondary blue: #4299e1
- Accent: #3b82f6
- Dark theme background gradient: #1a202c to #2d3748
- Light theme background gradient: #ebf8ff to #f0f5fa
- Glass effect backgrounds for both themes
- Text colors for both themes

FALLBACK BOOKS (constants/fallbackBooks.ts):
Include 25+ trending self-help/business books with:
- Atomic Habits, Think and Grow Rich, The 7 Habits, Rich Dad Poor Dad
- Deep Work, Mindset, Start with Why, Sapiens, The Lean Startup
- Zero to One, Grit, Essentialism, Leaders Eat Last, Radical Candor
- Emotional Intelligence, The Infinite Game, Dare to Lead
- How to Win Friends and Influence People, The 4-Hour Workweek
- The Power of Now, Outliers, The Alchemist, Man's Search for Meaning
- Thinking Fast and Slow, Good to Great, Everything Is Figureoutable

Each with title, author, isbn, and OpenLibrary cover URL:
https://covers.openlibrary.org/b/isbn/[ISBN]-L.jpg
```

---

### Prompt 3: Theme Store & Provider

```
Create a theme management system for the Book2Action Expo app using Zustand:

THEME STORE (stores/themeStore.ts):
- State: isDarkMode (default: true)
- Actions: toggleTheme()
- Persist theme preference using expo-secure-store
- Auto-load saved preference on app start

THEME PROVIDER (app/_layout.tsx):
- Wrap app with theme context
- Apply theme colors to StatusBar
- Use NativeWind dark mode class
- Smooth transitions between themes
- Apply theme to navigation header

COLORS UTILITY:
Create a useThemeColors() hook that returns:
- backgroundColor
- textColor
- cardBackground
- borderColor
- primaryColor
- secondaryColor

Make the entire app respond to theme changes with smooth animations.
```

---

### Prompt 4: OpenRouter AI Service

```
Create the OpenRouter AI service for generating book analysis in the Book2Action Expo app:

SERVICE (services/openRouterService.ts):
- API URL: https://openrouter.ai/api/v1/chat/completions
- Model: openai/gpt-4.1
- Store API key securely using expo-secure-store

PROMPT TEMPLATE:
Generate a comprehensive book analysis with this JSON structure:
{
  "title": "Exact book title",
  "author": "Author name",
  "publishedYear": number,
  "genre": "Primary genre",
  "isbn": "13-digit ISBN",
  "summary": "3-paragraph comprehensive summary covering:
    - Main premise and core methodology
    - Key insights and practical applications
    - Lasting impact and transformation",
  "actionableSteps": [
    {
      "day": "Monday through Sunday",
      "step": "Specific actionable step",
      "chapter": "Chapter reference",
      "details": {
        "sentences": ["5 detailed implementation sentences"],
        "keyTakeaway": "Core lesson summary"
      }
    }
    // Exactly 7 steps, one per day
  ]
}

FEATURES:
- JSON parsing with error handling
- Markdown code fence removal (```json ... ```)
- Trailing comma cleanup
- Fallback to cached popular books if API fails
- Content filter for inappropriate titles
- Cover image URL generation from ISBN using OpenLibrary API
- Retry logic with exponential backoff
- Request timeout handling (30 seconds)
- Temperature: 0.7
- Max tokens: 4000
```

---

### Prompt 5: Home Screen with Search & Trending

```
Create the home screen for the Book2Action Expo app with search and trending books:

HOME SCREEN (app/index.tsx):

HEADER COMPONENT:
- App logo with BookOpen icon
- "Book2Action" title with "2" in accent color
- Subtitle: "Transform Books into Actionable Insights"
- Theme toggle button (Sun/Moon icon) in top right
- Three feature indicators: Search Books, Get Summary, Actionable Steps

SEARCH BAR COMPONENT:
- Glass-morphism card style (semi-transparent with blur)
- Search input with magnifying glass icon
- Animated placeholder cycling through book suggestions every 5 seconds:
  "Try 'Atomic Habits' by James Clear"
  "Try 'Think and Grow Rich' by Napoleon Hill"
  "Try 'The 7 Habits of Highly Effective People'"
  "Try 'How to Win Friends and Influence People'"
  "Try 'The 4-Hour Workweek' by Tim Ferriss"
  "Try 'Rich Dad Poor Dad' by Robert Kiyosaki"
  "Try 'The Power of Now' by Eckhart Tolle"
- "Get Insights" button with gradient background (#3182ce to #4299e1)
- Loading state with spinner and "Analyzing..." text
- Haptic feedback on button press
- Disabled state when empty or loading

TRENDING BOOKS COMPONENT:
- Section title "Trending Books"
- Refresh button with rotation animation when loading
- Horizontal ScrollView/FlatList of 5 random books
- Each book card shows:
  - Cover image from OpenLibrary (with fallback BookOpen icon)
  - Title (1 line truncated)
  - Author name (smaller, muted text)
- Tap to search for that book
- Scale animation on press (1.05x)
- Show different 5 books on each refresh (no immediate repeats)
- Subtitle: "Click on a book to get its summary and 7-day action plan"

LOADING STATE:
- Animated book GIF or Lottie animation (centered)
- Marquee/scrolling text animation:
  "Our AI is reading through [BOOK TITLE] to create a custom 7-day action plan and summary for you..."
- Book title shown in bold/white

ERROR STATE:
- Red alert circle icon
- "Oops! Something went wrong" title
- Error message text
- "Try Again" button with gradient
- Optional "Details" button to show technical error info
```

---

### Prompt 6: Book Result Screen

```
Create the book result screen for the Book2Action Expo app:

SCREEN (app/book/[id].tsx):
- Receive book data via route params or global store

BOOK HEADER CARD:
- Glass-morphism styling
- Book cover image (left side, ~80x120)
  - Multiple fallback sources:
    1. OpenLibrary ISBN: https://covers.openlibrary.org/b/isbn/[ISBN]-L.jpg
    2. Google Books: https://books.google.com/books/content?id=ISBN:[ISBN]&printsec=frontcover&img=1&zoom=1
    3. OpenLibrary Title: https://covers.openlibrary.org/b/title/[TITLE]-L.jpg
    4. Fallback: Gradient background with BookOpen icon
- Book title (tappable, links to Amazon with external link icon)
- Author name with User icon
- Published year with Calendar icon
- Genre with Tag icon
- "Buy on Amazon" button (orange #FF9900, black text)

SUMMARY SECTION:
- "Summary" header with BookOpen icon
- Collapsible text (show first paragraph by default)
- "See More" / "Show Less" button with ChevronDown/ChevronUp icons
- Read Aloud controls (right side of header):
  - When not playing: "Read Aloud" button (blue) + Settings gear icon
  - When playing: "Pause" button (purple) + "Stop" button (red)
  - When paused: "Resume" button (purple) + "Stop" button (red)
- Voice Settings Dropdown (on gear click):
  - Voice selection dropdown (filter English voices, prioritize Google UK Female)
  - Speech rate slider (0.5x to 2.0x, step 0.1)
  - "Test Voice" button
  - Note about premium voices

7-DAY ACTION PLAN SECTION:
- "7-Day Action Plan" header with CheckCircle icon
- Export PDF button (green, right side)
- List of 7 action step cards:
  - Numbered circle (1-7) with gradient background
  - Day label (Monday-Sunday) in accent color (bold)
  - Action step text
  - Chapter reference with Bookmark icon (italic, muted)
  - "Add to Calendar" link with CalendarPlus icon
  - Tap card to navigate to detail view
  - ExternalLink icon indicating more details available
- Cards have hover/press effect (slight background change)

PDF EXPORT MODAL:
- "Export Options" title
- Radio button options:
  - "Detailed Action Plan" - Full 7-day with supporting points, key takeaways, chapter references
  - "Short Action Plan" - Condensed 7-day with essential steps only
- "Generate [Detailed/Quick] PDF" button (green)
- Note: "Creates a professionally formatted PDF document"
- Loading state with spinner
- Success state with checkmark
```

---

### Prompt 7: Action Step Detail Screen

```
Create the action step detail screen for the Book2Action Expo app:

SCREEN (app/action/[id].tsx):
- Back button to return to book result
- Receive step data via route params

HEADER:
- Back arrow button (circular, themed background)
- "Day [X]: Action Detail" title (or just "Action Detail" if no day)
- Read Aloud controls (same as book result screen):
  - Play/Pause/Resume/Stop buttons
  - Settings gear for voice options
  - Voice dropdown and speech rate slider

MAIN CONTENT CARD (glass-morphism):

ACTION TITLE:
- Step text (large, bold, themed)
- Info row:
  - Chapter reference with BookOpen icon (accent color)
  - Day badge (pill shape, themed background) e.g., "Monday"

KEY TAKEAWAY SECTION:
- "Key Takeaway:" label (medium font, themed)
- Italicized takeaway text
- Fallback if no details: "The most important aspect of [step] is consistency and intentional practice."

DETAILED IMPLEMENTATION SECTION:
- "Detailed Implementation:" label (medium font, themed)
- Bulleted list (disc style) of 5 implementation sentences
- Proper spacing between items
- Fallback sentences if no details provided:
  1. "This step helps you implement [step] in your daily life."
  2. "Based on the principles from chapter [chapter], this action creates lasting change."
  3. "Many readers have found that this specific technique leads to measurable results."
  4. "The author emphasizes this point as essential to mastering the book's core concepts."
  5. "Try implementing this consistently for at least 21 days to form a habit."

FOOTER:
- Divider line (subtle, themed)
- Book title reference: "From [Book Title]" (muted text)
- "Add to Calendar" gradient button with Calendar icon
  - Opens Google Calendar with:
    - Event title: "Book Action: [step]"
    - Description: Book name, chapter, key takeaway, all detail sentences
    - Date: Next occurrence of that weekday, 9am-10am
```

---

### Prompt 8: Utility Functions

```
Create utility functions for the Book2Action Expo app:

CALENDAR LINKS (utils/calendarLinks.ts):

generateCalendarLink(actionStep: string, bookTitle: string, day: string): string
- Calculate next occurrence of the specified weekday (Monday-Sunday)
- If today is that day or it has passed this week, get next week's date
- Create Google Calendar URL:
  https://calendar.google.com/calendar/render?action=TEMPLATE&text=[encoded step]&details=[encoded details]&dates=[YYYYMMDD]T090000/[YYYYMMDD]T100000&ctz=local
- Return properly URL-encoded string


AMAZON LINKS (utils/amazonLinks.ts):

generateAmazonLink(title: string, author: string, isbn?: string): string
- If ISBN exists: https://www.amazon.com/s?k=[ISBN]
- Otherwise: https://www.amazon.com/s?k=[title] [author] book
- Return URL-encoded string


COVER IMAGE (utils/coverImage.ts):

generateCoverImageUrl(isbn?: string, title?: string): string
- Primary (if ISBN): https://covers.openlibrary.org/b/isbn/[ISBN]-L.jpg
- Fallback (if title): https://covers.openlibrary.org/b/title/[encoded title]-L.jpg
- Return empty string if neither available


CONTENT FILTER (utils/contentFilter.ts):

inappropriateWords: string[] = ['f*ck', 'fuck', 'shit', 'damn', 'ass', 'bitch', 'crap']

isAppropriateTitle(title: string): boolean
- Convert title to lowercase
- Check if any inappropriate word is included
- Return false if inappropriate, true otherwise


TEXT-TO-SPEECH (utils/speech.ts):

Using expo-speech:

speakText(text: string, options?: { rate?: number, voice?: string }): void
- Call Speech.speak() with options

stopSpeaking(): void
- Call Speech.stop()

pauseSpeaking(): Promise<void>
- Call Speech.pause() (iOS only, stop on Android)

resumeSpeaking(): Promise<void>
- Call Speech.resume() (iOS only, restart on Android)

getAvailableVoices(): Promise<Voice[]>
- Call Speech.getAvailableVoicesAsync()
- Filter for English voices
- Sort by quality (prioritize Google, Premium, Enhanced, Neural)

isSpeaking(): Promise<boolean>
- Call Speech.isSpeakingAsync()
```

---

### Prompt 9: PDF Export Feature

```
Create the PDF export feature for the Book2Action Expo app:

EXPORT PDF BUTTON (components/ExportPdfButton.tsx):
- Green button with Printer icon and "PDF" text
- Tap to show options modal
- Loading state: spinner with "Generating..."
- Success state: checkmark with "PDF!"

OPTIONS MODAL:
- Title: "Export Options"
- Radio button group:
  - "Detailed Action Plan"
    - Description: "Full 7-day plan with supporting points, key takeaways, and chapter references"
  - "Short Action Plan"
    - Description: "Condensed 7-day plan with essential action steps only"
- "Generate [Type] PDF" button (green, full width)
- Helper text: "Creates a professionally formatted PDF document"

PDF GENERATION (using expo-print):

Create HTML template string with inline CSS:

COLOR SCHEME:
- Primary: #3182ce (Steel Blue)
- Secondary: #4299e1 (Lighter Blue)
- Accent: #3b82f6 (Blue-500)
- Text: #1e293b (Slate-800)
- Light Text: #64748b (Slate-500)
- Background: #f8fafc (Slate-50)
- Dark Blue: #1e3a8a (Blue-900)
- Light BG: #eff6ff (Blue-50)

TITLE PAGE:
- Blue header band (#3182ce)
- Book title (24pt, white, bold, centered)
- "by [Author]" (16pt, secondary blue)
- "[Detailed/Quick] Action Plan" (18pt, accent blue)
- Book cover image (if available, right side)

FOR DETAILED PLAN:
- "Detailed Book Summary" header (20pt, primary blue, light bg)
- Full 3-paragraph summary (12pt)
- Page break
- "7-Day Action Plan" header (22pt, primary blue)
- Each day on separate page:
  - "Day [N]: [Step]" header (18pt, white on primary blue)
  - "Action:" label + step text
  - "Key Takeaway:" label + takeaway text
  - "Supporting Details:" label + 5 bullet points
  - "Source Chapter:" label + chapter reference

FOR SHORT PLAN:
- "Quick Action Plan" header (20pt, primary blue)
- "Summary:" label + first paragraph only
- "Action Steps:" label
- Numbered list (1-7) with proper indentation:
  - Step text (bold, dark blue)
  - Chapter reference (smaller, muted)

METADATA:
- title: "[Book] - [Type] Action Plan"
- subject: "Action plan for [Book]"
- author: [Book Author]
- keywords: "[book], [author], action plan, book summary, self-improvement"
- creator: "Book2Action"

SHARING (using expo-sharing):
- Generate PDF with expo-print
- Share via Sharing.shareAsync()
- Filename: [sanitized_title]_[type]_action_plan.pdf
```

---

### Prompt 10: Navigation & Polish

```
Add navigation and final polish to the Book2Action Expo app:

NAVIGATION SETUP (app/_layout.tsx):
- Stack navigator with expo-router
- Custom header styling matching theme:
  - Dark: #1a202c background, white text
  - Light: #ebf8ff background, #1e293b text
- Animated transitions between screens (slide)
- Deep linking support for sharing books

ANIMATIONS:
- FadeIn animation for screens (300ms)
- Scale animation on card press (0.98x on press, 1.0x on release)
- Smooth theme transition (500ms ease)
- Loading skeleton placeholders (shimmer effect)
- Pull-to-refresh on trending books (RefreshControl)
- Marquee text animation for loading state
- Rotation animation on refresh button when loading

HAPTIC FEEDBACK (expo-haptics):
- Haptics.impactAsync(ImpactFeedbackStyle.Light) on button press
- Haptics.impactAsync(ImpactFeedbackStyle.Medium) on successful search
- Haptics.notificationAsync(NotificationFeedbackType.Error) on failed search
- Haptics.selectionAsync() on theme toggle

ACCESSIBILITY:
- accessibilityLabel on all interactive elements
- accessibilityRole="button" for buttons
- accessibilityRole="link" for external links
- accessibilityHint for actions (e.g., "Double tap to search for this book")
- Support for VoiceOver (iOS) and TalkBack (Android)
- Proper contrast ratios (WCAG AA)
- Minimum touch target size (44x44)

ERROR HANDLING:
- Network error detection (NetInfo)
- Graceful fallbacks to cached/fallback data
- Retry mechanisms with exponential backoff
- User-friendly error messages
- Error boundaries for component crashes

OFFLINE SUPPORT:
- Cache recently viewed books (AsyncStorage)
- Show cached trending books when offline
- Indicate offline status with banner
- Queue searches for when back online

PERFORMANCE:
- Lazy load images with placeholder
- Memoize expensive computations (useMemo)
- Use FlatList for lists (not ScrollView with map)
- Optimize re-renders with React.memo
- Image caching with expo-image or fast-image

SPLASH SCREEN (app.json):
- Custom splash screen with app logo
- Match theme background color (#1a202c for dark)
- Smooth transition to app (fade)
- Minimum display time: 1 second

APP ICON:
- Book with lightning bolt or action arrow
- Blue gradient background (#3182ce to #4299e1)
- Clean, modern design
- Rounded corners (iOS adaptive)
- Provide all required sizes

ADDITIONAL POLISH:
- Safe area handling (notches, home indicators)
- Keyboard avoiding view for search input
- Proper scroll behavior (bounce on iOS)
- Status bar style matching theme
- Orientation lock (portrait)
- App version in settings/about
```

---

## Web vs Mobile Differences

| Feature | Web (React) | Mobile (Expo) |
|---------|-------------|---------------|
| **Styling** | Tailwind CSS | NativeWind |
| **Navigation** | React state/URL | Expo Router (Stack) |
| **Storage** | localStorage | expo-secure-store / AsyncStorage |
| **Speech** | Web Speech API | expo-speech |
| **PDF** | jsPDF (client-side) | expo-print + expo-sharing |
| **External Links** | `<a href>` tags | expo-linking |
| **Images** | `<img>` tag | `<Image>` with caching |
| **Animations** | CSS transitions | React Native Reanimated |
| **Haptics** | N/A | expo-haptics |
| **Icons** | lucide-react | @expo/vector-icons |
| **Blur Effect** | CSS backdrop-filter | expo-blur |
| **Calendar** | URL redirect | expo-linking to Google Calendar |
| **Scroll** | CSS overflow | ScrollView / FlatList |
| **Theme** | CSS classes on body | Context + NativeWind dark: |

---

## Quick Start Commands

```bash
# Create new Expo project
npx create-expo-app Book2Action --template expo-template-blank-typescript

# Navigate to project
cd Book2Action

# Install dependencies
npx expo install expo-router expo-secure-store expo-speech expo-print expo-sharing expo-linking expo-haptics @expo/vector-icons

# Install additional packages
npm install nativewind tailwindcss zustand @tanstack/react-query axios

# Configure NativeWind
npx tailwindcss init

# Start development
npx expo start
```

---

## Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_OPENROUTER_API_KEY=your_api_key_here
```

Access in code:
```typescript
const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
```

---

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://expo.github.io/router/docs/)
- [NativeWind](https://www.nativewind.dev/)
- [OpenRouter API](https://openrouter.ai/docs)
- [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TanStack Query](https://tanstack.com/query/latest)

---

*Generated from Book2Action web app analysis - January 2026*
