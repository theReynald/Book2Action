import axios from 'axios';
import { Book, BookSearchResult } from '../types/Book';
import { isAppropriateTitle } from '../utils/contentFilter';

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4.1';

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

const generateBookAnalysis = async (bookTitle: string): Promise<Book | null> => {
    console.log(`🔍 Starting AI analysis for: "${bookTitle}"`);
    console.log('📡 API Configuration:');
    console.log('- URL:', OPENROUTER_API_URL);
    console.log('- Model:', MODEL);
    console.log('- API Key available:', OPENROUTER_API_KEY ? 'Yes' : 'No');

    // Check if API key is available
    if (!OPENROUTER_API_KEY) {
        console.error('❌ OpenRouter API key not found. Please set REACT_APP_OPENROUTER_API_KEY in your .env file');
        return null;
    }

    try {
        const prompt = `Analyze the book "${bookTitle}" and provide a comprehensive response in the following JSON format:

{
  "title": "Exact book title",
  "author": "Author name",
  "publishedYear": year_as_number,
  "genre": "Primary genre",
  "isbn": "The book's ISBN-13 number (13 digits, no hyphens)",
  "summary": "A comprehensive 3-paragraph summary that deeply explores the book's core concepts, main themes, key insights, practical methodologies, and real-world applications. This should be substantial content extracted directly from the book, not just a brief overview. Include specific frameworks, principles, examples, and actionable wisdom that the author presents. Make each paragraph focus on different aspects: main premise/problem and core methodology, key insights/principles and practical applications, and lasting impact/transformation and real-world results.",
  "actionableSteps": [
    {
      "day": "Monday",
      "step": "Specific actionable step that readers can implement",
      "chapter": "Chapter or section where this concept is primarily discussed",
      "details": {
        "sentences": [
          "Detailed explanation sentence 1",
          "Detailed explanation sentence 2",
          "Detailed explanation sentence 3",
          "Detailed explanation sentence 4",
          "Detailed explanation sentence 5"
        ],
        "keyTakeaway": "The core lesson to remember from this action step"
      }
    }
    // Provide exactly 7 actionable steps, one for each day of the week (Monday through Sunday)
  ]
}

Requirements:
- If the book doesn't exist or you're not familiar with it, return null
- The summary should be 3 substantial paragraphs that extract real content from the book
- Each paragraph should be 4-6 sentences long and contain specific insights from the book
- Include the author's actual frameworks, methodologies, case studies, and examples
- Cover the book's main premise and methodology, key principles and applications, and transformational impact
- Each actionable step should be practical and implementable
- Assign each step to a specific day of the week (Monday through Sunday)
- Structure the steps as a 7-day action plan, with logical progression from Monday to Sunday
- Chapter references should be specific (e.g., "Chapter 3: The Power of Habit" or "Part 2: The Four Laws")
- Focus on the most impactful and actionable insights from the book
- Include the correct ISBN-13 number for accurate book identification
- If ISBN is unknown, leave it as empty string
- For each step, provide detailed implementation information with 5 specific sentences
- For each step, include a key takeaway that summarizes the core lesson

Please analyze: "${bookTitle}"`;

        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No content received from API');
        }

        // Try to parse the JSON response
        try {
            const bookData = JSON.parse(content);

            // Validate the response structure
            if (!bookData || typeof bookData !== 'object') {
                throw new Error('Invalid response format');
            }

            // Ensure we have the required fields
            if (!bookData.title || !bookData.author || !bookData.summary || !Array.isArray(bookData.actionableSteps)) {
                throw new Error('Missing required fields in response');
            }

            // Validate actionable steps format
            if (bookData.actionableSteps.length !== 7) {
                throw new Error('Expected exactly 7 actionable steps (one for each day of the week)');
            }

            for (const step of bookData.actionableSteps) {
                if (!step.step || !step.chapter || !step.day) {
                    throw new Error('Invalid actionable step format: missing step, chapter, or day');
                }

                // Ensure details property exists
                if (!step.details) {
                    step.details = {
                        sentences: [
                            `This step helps you implement "${step.step}" in your daily life.`,
                            `Based on the principles from chapter ${step.chapter}, this action creates lasting change.`,
                            `Many readers have found that this specific technique leads to measurable results.`,
                            `The author emphasizes this point as essential to mastering the book's core concepts.`,
                            `Try implementing this consistently for at least 21 days to form a habit.`
                        ],
                        keyTakeaway: `The most important aspect of "${step.step}" is consistency and intentional practice.`
                    };
                }

                // Ensure sentences and keyTakeaway properties exist
                if (!step.details.sentences || !Array.isArray(step.details.sentences) || step.details.sentences.length < 1) {
                    step.details.sentences = [
                        `This step helps you implement "${step.step}" in your daily life.`,
                        `Based on the principles from chapter ${step.chapter}, this action creates lasting change.`,
                        `Many readers have found that this specific technique leads to measurable results.`,
                        `The author emphasizes this point as essential to mastering the book's core concepts.`,
                        `Try implementing this consistently for at least 21 days to form a habit.`
                    ];
                }

                if (!step.details.keyTakeaway) {
                    step.details.keyTakeaway = `The most important aspect of "${step.step}" is consistency and intentional practice.`;
                }
            }

            // Add cover image URL based on ISBN or title
            const bookWithCover = {
                ...bookData,
                coverImageUrl: generateCoverImageUrl(bookData.isbn, bookData.title)
            };

            return bookWithCover as Book;
        } catch (parseError) {
            console.error('Failed to parse API response:', parseError);
            console.error('Raw content:', content);

            // If JSON parsing fails, try to extract information manually
            return null;
        }
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);

        // Log more specific error details
        if (axios.isAxiosError(error)) {
            console.error('API Error Details:');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request Headers:', error.config?.headers);
        }

        return null;
    }
};

// Add detailed action step info to fallback books
const addDetailedSteps = (steps: any[]) => {
    return steps.map(step => ({
        ...step,
        details: {
            sentences: [
                `This step helps you implement "${step.step}" in your daily routine.`,
                `Based on the principles from ${step.chapter}, this action creates lasting change.`,
                `Consistency with this practice leads to substantial improvements over time.`,
                `Many readers have reported that this specific technique leads to measurable results.`,
                `The author identifies this as a key principle for success in this area.`
            ],
            keyTakeaway: `The core lesson is to ${step.step.toLowerCase()} with intention and consistency.`
        }
    }));
};

// Fallback data for when API fails or for popular books
const fallbackBooks: { [key: string]: Book } = {
    'atomic habits': {
        title: 'Atomic Habits',
        author: 'James Clear',
        publishedYear: 2018,
        genre: 'Self-Help',
        isbn: '9780735211292',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
        summary: 'Atomic Habits presents a revolutionary approach to habit formation based on the principle that small changes can yield remarkable results when compounded over time. James Clear argues that we often overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. The book introduces the concept that if you get one percent better each day for one year, you will end up thirty-seven times better by the time you are done, demonstrating the mathematical power of marginal gains in personal development.\n\nThe core framework of the book revolves around the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. Clear systematically breaks down how habits work at a neurological level, explaining the habit loop of cue, craving, response, and reward. He demonstrates how environmental design plays a crucial role in habit formation, showing that motivation is often overrated while environment and systems design are underrated factors in creating lasting behavioral change. One of the book\'s most powerful concepts is identity-based habits, where Clear advocates focusing on who you want to become rather than what you want to achieve.\n\nThe practical applications extend beyond personal development to professional growth, relationships, and health, with Clear introducing powerful techniques such as habit stacking, the two-minute rule, and environment design strategies. The book provides numerous real-world examples and case studies, from how the British cycling team dominated international competition through marginal gains to how businesses and individuals have transformed their lives through systematic habit design. What sets Atomic Habits apart is its evidence-based approach combined with practical implementation strategies, emphasizing that systems are more important than goals and that focusing on the process rather than outcomes leads to sustainable, long-term change.',
        actionableSteps: addDetailedSteps([
            { day: 'Monday', step: 'Start with habits so small they seem almost ridiculous (2-minute rule)', chapter: 'Chapter 11: Walk Slowly, but Never Backward' },
            { day: 'Tuesday', step: 'Stack new habits onto existing ones using habit stacking', chapter: 'Chapter 5: The Best Way to Start a New Habit' },
            { day: 'Wednesday', step: 'Design your environment to make good habits obvious and bad habits invisible', chapter: 'Chapter 6: Motivation Is Overrated; Environment Often Matters More' },
            { day: 'Thursday', step: 'Track your habits daily using a simple habit tracker', chapter: 'Chapter 16: How to Stick with Good Habits Every Day' },
            { day: 'Friday', step: 'Focus on identity-based habits: "I am the type of person who..."', chapter: 'Chapter 2: How Your Habits Shape Your Identity' },
            { day: 'Saturday', step: 'Use the two-day rule: never miss twice in a row', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' },
            { day: 'Sunday', step: 'Celebrate small wins immediately after completing a habit', chapter: 'Chapter 15: The Cardinal Rule of Behavior Change' }
        ])
    },
    'think and grow rich': {
        title: 'Think and Grow Rich',
        author: 'Napoleon Hill',
        publishedYear: 1937,
        genre: 'Personal Finance',
        isbn: '9781585424337',
        coverImageUrl: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
        summary: 'Think and Grow Rich emerged from Napoleon Hill\'s twenty-year study of over 500 successful individuals, including Andrew Carnegie, Henry Ford, and Thomas Edison. The book presents thirteen fundamental principles for achieving wealth and success, based on Hill\'s analysis of what separates those who accumulate wealth from those who struggle financially. Hill discovered that success begins with a definite major purpose, supported by burning desire, unwavering faith, and persistent action toward clearly defined goals, with the foundation resting on the principle that thoughts become things.\n\nThe book introduces revolutionary concepts such as the "Master Mind" principle, which Hill defines as the coordination of knowledge and effort between two or more people working toward a definite purpose. He demonstrates how the most successful individuals surrounded themselves with advisors, mentors, and like-minded individuals who could provide specialized knowledge and support. Hill also explores the transmutation of sexual energy into creative and productive pursuits, arguing that the most successful people channel their emotional and physical energy into their work and goals, while addressing psychological barriers including the six basic fears that hold people back.\n\nThe lasting impact of Think and Grow Rich lies in its emphasis on personal responsibility and mental conditioning, with Hill arguing that circumstances do not make the person but rather reveal their character and mental attitude. The book provides a complete philosophy of personal achievement that extends beyond financial success to encompass happiness, health, and fulfillment. It remains one of the most influential success books ever written because it addresses the fundamental mindset shifts necessary for transforming dreams into reality, emphasizing that success begins with a burning desire and a definite plan, supported by specialized knowledge, decisive action, and unwavering persistence.',
        actionableSteps: addDetailedSteps([
            { day: 'Monday', step: 'Define your definite major purpose with specific financial goals', chapter: 'Chapter 2: Desire' },
            { day: 'Tuesday', step: 'Develop burning desire by writing down exactly what you want', chapter: 'Chapter 2: Desire' },
            { day: 'Wednesday', step: 'Build unwavering faith through auto-suggestion and visualization', chapter: 'Chapter 3: Faith' },
            { day: 'Thursday', step: 'Acquire specialized knowledge in your chosen field', chapter: 'Chapter 5: Specialized Knowledge' },
            { day: 'Friday', step: 'Use your imagination to create detailed plans for achieving your goals', chapter: 'Chapter 6: Imagination' },
            { day: 'Saturday', step: 'Make quick, firm decisions and stick to them', chapter: 'Chapter 8: Decision' },
            { day: 'Sunday', step: 'Develop persistence by never giving up on your major purpose', chapter: 'Chapter 9: Persistence' }
        ])
    },
    'the 7 habits of highly effective people': {
        title: 'The 7 Habits of Highly Effective People',
        author: 'Stephen R. Covey',
        publishedYear: 1989,
        genre: 'Self-Help',
        isbn: '9781982137274',
        coverImageUrl: 'https://books.google.com/books/content?id=ISBN:9781982137274&printsec=frontcover&img=1&zoom=1&source=gbs_api',
        summary: 'The 7 Habits of Highly Effective People presents a principle-centered approach to personal and professional effectiveness that has transformed millions of lives. Stephen Covey introduces a paradigm shift from the "Personality Ethic" that focuses on quick-fix techniques and manipulation tactics to the "Character Ethic" that emphasizes fundamental principles and character development. The book is built on the premise that true effectiveness comes from aligning our actions with timeless, universal principles such as integrity, human dignity, service, quality, and growth, organizing the seven habits into a logical progression from dependence to independence to interdependence.\n\nThe first three habits focus on achieving private victory and personal mastery: Be Proactive (taking responsibility for your choices), Begin with the End in Mind (defining your values and life mission), and Put First Things First (managing yourself according to your priorities). The next three habits address public victory and effective interpersonal relationships: Think Win-Win (seeking mutual benefit), Seek First to Understand Then to Be Understood (practicing empathetic communication), and Synergize (valuing differences and creating collaborative solutions). The seventh habit, Sharpen the Saw, focuses on continuous renewal in four dimensions: physical, mental, spiritual, and social/emotional, ensuring individuals maintain their capacity to practice the other habits effectively.\n\nWhat makes this book enduringly powerful is its emphasis on inside-out change, starting with self-mastery before attempting to influence others, demonstrating that quick fixes are superficial unless based on solid character and correct principles. Covey introduces powerful concepts such as the Circle of Influence versus Circle of Concern, the Time Management Matrix, and Emotional Bank Accounts in relationships. The book provides practical frameworks for decision-making, goal-setting, communication, and leadership that have been validated across cultures and industries, emphasizing that effectiveness is not just about productivity but about achieving meaningful results that align with your deepest values and contribute to the greater good.',
        actionableSteps: addDetailedSteps([
            { day: 'Monday', step: 'Be proactive: Focus on what you can control and take responsibility', chapter: 'Habit 1: Be Proactive' },
            { day: 'Tuesday', step: 'Begin with the end in mind: Define your personal mission statement', chapter: 'Habit 2: Begin with the End in Mind' },
            { day: 'Wednesday', step: 'Put first things first: Prioritize important over urgent tasks', chapter: 'Habit 3: Put First Things First' },
            { day: 'Thursday', step: 'Think win-win: Seek mutual benefit in all interactions', chapter: 'Habit 4: Think Win-Win' },
            { day: 'Friday', step: 'Seek first to understand, then to be understood: Practice empathetic listening', chapter: 'Habit 5: Seek First to Understand, Then to Be Understood' },
            { day: 'Saturday', step: 'Synergize: Value differences and work collaboratively', chapter: 'Habit 6: Synergize' },
            { day: 'Sunday', step: 'Sharpen the saw: Continuously improve in all four dimensions of life', chapter: 'Habit 7: Sharpen the Saw' }
        ])
    }
};

export const searchBook = async (title: string): Promise<BookSearchResult> => {
    const normalizedTitle = title.toLowerCase().trim();

    // Check if the book title contains inappropriate language
    if (!isAppropriateTitle(normalizedTitle)) {
        return {
            success: false,
            error: 'Sorry, we cannot process this book title due to our content policy.'
        };
    }

    // Test API connection on first real search
    if (!normalizedTitle.toLowerCase().includes('7 habits')) {
        console.log('Testing API connection before search...');
        await testAPIConnection();
    }

    try {
        // First check if we have fallback data for popular books
        if (fallbackBooks[normalizedTitle]) {
            return {
                success: true,
                book: fallbackBooks[normalizedTitle]
            };
        }

        // Check for partial matches in fallback data
        const partialMatch = Object.keys(fallbackBooks).find(key =>
            key.includes(normalizedTitle) || normalizedTitle.includes(key)
        );

        if (partialMatch) {
            return {
                success: true,
                book: fallbackBooks[partialMatch]
            };
        }

        // If not in fallback data, use AI to generate analysis
        console.log(`🤖 Generating AI analysis for: ${title}`);
        console.log('📊 Starting OpenRouter API call...');
        const aiGeneratedBook = await generateBookAnalysis(title);

        if (aiGeneratedBook) {
            return {
                success: true,
                book: aiGeneratedBook
            };
        }

        // If AI fails, return error
        return {
            success: false,
            error: `Sorry, we couldn't find or analyze "${title}". Please try a different book title or check the spelling.`
        };

    } catch (error) {
        console.error('Error in searchBook:', error);
        return {
            success: false,
            error: 'An error occurred while searching for the book. Please try again.'
        };
    }
};

// Test function to verify API connectivity
const testAPIConnection = async (): Promise<boolean> => {
    try {
        console.log('Testing OpenRouter API connection...');
        console.log('API Key (first 20 chars):', OPENROUTER_API_KEY.substring(0, 20) + '...');
        console.log('API URL:', OPENROUTER_API_URL);
        console.log('Model:', MODEL);

        const response = await axios.post<OpenRouterResponse>(
            OPENROUTER_API_URL,
            {
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello, this is a test message. Please respond with just "API working".'
                    }
                ],
                temperature: 0.7,
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('API Test Response:', response.data);
        return true;
    } catch (error) {
        console.error('API Test Failed:', error);
        if (axios.isAxiosError(error)) {
            console.error('Test Error Details:');
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
        }
        return false;
    }
};

// Helper function to generate cover image URL from ISBN
const generateCoverImageUrl = (isbn?: string, title?: string): string => {
    if (isbn && isbn.length >= 10) {
        // Use ISBN for better accuracy - always prefer ISBN search
        // ISBN is more reliable and specific than title search
        return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    } else if (title) {
        // Fallback to title-based search if no ISBN available
        const encodedTitle = encodeURIComponent(title);
        return `https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`;
    }
    return '';
};

// Function to get trending books for the homepage
export const getTrendingBooks = (): Pick<Book, 'title' | 'author' | 'coverImageUrl' | 'isbn'>[] => {
    // Extract and return all fallback books as trending books
    return Object.values(fallbackBooks).map(book => ({
        title: book.title,
        author: book.author,
        coverImageUrl: book.coverImageUrl,
        isbn: book.isbn
    }));
};
