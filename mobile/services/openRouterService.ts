import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Book, BookSearchResult } from "../types/Book";
import { isAppropriateTitle } from "../utils/contentFilter";
import { generateCoverImageUrl } from "../utils/coverImage";

// API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const API_KEY_STORAGE_KEY = "openai_api_key";

interface APIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Get API key from secure storage
const getApiKey = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return null;
  }
};

// Set API key in secure storage
export const setApiKey = async (key: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
  } catch (error) {
    console.error("Error storing API key:", error);
  }
};

// Add detailed action step info to fallback books
const addDetailedSteps = (steps: any[]) => {
  return steps.map((step) => ({
    ...step,
    details: {
      sentences: [
        `This step helps you implement "${step.step}" in your daily routine.`,
        `Based on the principles from ${step.chapter}, this action creates lasting change.`,
        `Consistency with this practice leads to substantial improvements over time.`,
        `Many readers have reported that this specific technique leads to measurable results.`,
        `The author identifies this as a key principle for success in this area.`,
      ],
      keyTakeaway: `The core lesson is to ${step.step.toLowerCase()} with intention and consistency.`,
    },
  }));
};

// Fallback data for popular books
const fallbackBooks: { [key: string]: Book } = {
  "atomic habits": {
    title: "Atomic Habits",
    author: "James Clear",
    publishedYear: 2018,
    genre: "Self-Help",
    isbn: "9780735211292",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    summary: `Atomic Habits presents a revolutionary approach to habit formation based on the principle that small changes can yield remarkable results when compounded over time. James Clear argues that we often overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. The book introduces the concept that if you get one percent better each day for one year, you will end up thirty-seven times better by the time you are done, demonstrating the mathematical power of marginal gains in personal development.

The core framework of the book revolves around the Four Laws of Behavior Change: make it obvious, make it attractive, make it easy, and make it satisfying. Clear systematically breaks down how habits work at a neurological level, explaining the habit loop of cue, craving, response, and reward. He demonstrates how environmental design plays a crucial role in habit formation, showing that motivation is often overrated while environment and systems design are underrated factors in creating lasting behavioral change.

The practical applications extend beyond personal development to professional growth, relationships, and health, with Clear introducing powerful techniques such as habit stacking, the two-minute rule, and environment design strategies. The book provides numerous real-world examples and case studies, from how the British cycling team dominated international competition through marginal gains to how businesses and individuals have transformed their lives through systematic habit design.`,
    actionableSteps: addDetailedSteps([
      {
        day: "Monday",
        step: "Start with habits so small they seem almost ridiculous (2-minute rule)",
        chapter: "Chapter 11: Walk Slowly, but Never Backward",
      },
      {
        day: "Tuesday",
        step: "Stack new habits onto existing ones using habit stacking",
        chapter: "Chapter 5: The Best Way to Start a New Habit",
      },
      {
        day: "Wednesday",
        step: "Design your environment to make good habits obvious and bad habits invisible",
        chapter:
          "Chapter 6: Motivation Is Overrated; Environment Often Matters More",
      },
      {
        day: "Thursday",
        step: "Track your habits daily using a simple habit tracker",
        chapter: "Chapter 16: How to Stick with Good Habits Every Day",
      },
      {
        day: "Friday",
        step: 'Focus on identity-based habits: "I am the type of person who..."',
        chapter: "Chapter 2: How Your Habits Shape Your Identity",
      },
      {
        day: "Saturday",
        step: "Use the two-day rule: never miss twice in a row",
        chapter: "Chapter 15: The Cardinal Rule of Behavior Change",
      },
      {
        day: "Sunday",
        step: "Celebrate small wins immediately after completing a habit",
        chapter: "Chapter 15: The Cardinal Rule of Behavior Change",
      },
    ]),
  },
  "think and grow rich": {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    publishedYear: 1937,
    genre: "Personal Finance",
    isbn: "9781585424337",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg",
    summary: `Think and Grow Rich emerged from Napoleon Hill's twenty-year study of over 500 successful individuals, including Andrew Carnegie, Henry Ford, and Thomas Edison. The book presents thirteen fundamental principles for achieving wealth and success, based on Hill's analysis of what separates those who accumulate wealth from those who struggle financially.

The book introduces revolutionary concepts such as the "Master Mind" principle, which Hill defines as the coordination of knowledge and effort between two or more people working toward a definite purpose. He demonstrates how the most successful individuals surrounded themselves with advisors, mentors, and like-minded individuals who could provide specialized knowledge and support.

The lasting impact of Think and Grow Rich lies in its emphasis on personal responsibility and mental conditioning, with Hill arguing that circumstances do not make the person but rather reveal their character and mental attitude. The book provides a complete philosophy of personal achievement that extends beyond financial success to encompass happiness, health, and fulfillment.`,
    actionableSteps: addDetailedSteps([
      {
        day: "Monday",
        step: "Define your definite major purpose with specific financial goals",
        chapter: "Chapter 2: Desire",
      },
      {
        day: "Tuesday",
        step: "Develop burning desire by writing down exactly what you want",
        chapter: "Chapter 2: Desire",
      },
      {
        day: "Wednesday",
        step: "Build unwavering faith through auto-suggestion and visualization",
        chapter: "Chapter 3: Faith",
      },
      {
        day: "Thursday",
        step: "Acquire specialized knowledge in your chosen field",
        chapter: "Chapter 5: Specialized Knowledge",
      },
      {
        day: "Friday",
        step: "Use your imagination to create detailed plans for achieving your goals",
        chapter: "Chapter 6: Imagination",
      },
      {
        day: "Saturday",
        step: "Make quick, firm decisions and stick to them",
        chapter: "Chapter 8: Decision",
      },
      {
        day: "Sunday",
        step: "Develop persistence by never giving up on your major purpose",
        chapter: "Chapter 9: Persistence",
      },
    ]),
  },
  "the 7 habits of highly effective people": {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    publishedYear: 1989,
    genre: "Self-Help",
    isbn: "9781982137274",
    coverImageUrl: "https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg",
    summary: `The 7 Habits of Highly Effective People presents a principle-centered approach to personal and professional effectiveness that has transformed millions of lives. Stephen Covey introduces a paradigm shift from the "Personality Ethic" that focuses on quick-fix techniques and manipulation tactics to the "Character Ethic" that emphasizes fundamental principles and character development.

The first three habits focus on achieving private victory and personal mastery: Be Proactive (taking responsibility for your choices), Begin with the End in Mind (defining your values and life mission), and Put First Things First (managing yourself according to your priorities). The next three habits address public victory and effective interpersonal relationships.

What makes this book enduringly powerful is its emphasis on inside-out change, starting with self-mastery before attempting to influence others, demonstrating that quick fixes are superficial unless based on solid character and correct principles.`,
    actionableSteps: addDetailedSteps([
      {
        day: "Monday",
        step: "Be proactive: Focus on what you can control and take responsibility",
        chapter: "Habit 1: Be Proactive",
      },
      {
        day: "Tuesday",
        step: "Begin with the end in mind: Define your personal mission statement",
        chapter: "Habit 2: Begin with the End in Mind",
      },
      {
        day: "Wednesday",
        step: "Put first things first: Prioritize important over urgent tasks",
        chapter: "Habit 3: Put First Things First",
      },
      {
        day: "Thursday",
        step: "Think win-win: Seek mutual benefit in all interactions",
        chapter: "Habit 4: Think Win-Win",
      },
      {
        day: "Friday",
        step: "Seek first to understand, then to be understood: Practice empathetic listening",
        chapter: "Habit 5: Seek First to Understand, Then to Be Understood",
      },
      {
        day: "Saturday",
        step: "Synergize: Value differences and work collaboratively",
        chapter: "Habit 6: Synergize",
      },
      {
        day: "Sunday",
        step: "Sharpen the saw: Continuously improve in all four dimensions of life",
        chapter: "Habit 7: Sharpen the Saw",
      },
    ]),
  },
};

const generateBookAnalysis = async (
  bookTitle: string,
): Promise<Book | null> => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.error("OpenAI API key not found");
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
  "summary": "A comprehensive 3-paragraph summary that deeply explores the book's core concepts, main themes, key insights, practical methodologies, and real-world applications.",
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
  ]
}

Requirements:
- ALWAYS try to find a book first. The input may be a book title, movie, TV show, video game, or other media.
- If the input is a movie, TV show, or video game, find the official novelization, tie-in novel, or "making of" companion book and analyze that. Examples:
  * "A New Hope" → "Star Wars: A New Hope" novelization by Alan Dean Foster (ISBN 9780345341464)
  * "Breaking Bad" → "Breaking Bad: The Official Book" by David Thomson, OR analyze the show's themes as if it were a book
  * "The Last of Us" → "The Last of Us: American Dreams" graphic novel by Neil Druckmann
- If you cannot find an exact novelization, find the CLOSEST related book on the same subject/franchise and analyze that — do NOT return notFound for well-known media.
- Only respond with {"notFound": true} if the input is gibberish, nonsensical, or has no plausible book/novelization/related work whatsoever.
- The summary should be 3 substantial paragraphs
- Provide exactly 7 actionable steps, one for each day of the week (Monday through Sunday)
- Each step should have detailed implementation information
- Include the correct ISBN-13 number for accurate book identification

Respond with ONLY the JSON object.

Please analyze: "${bookTitle}"`;

    const response = await axios.post<APIResponse>(
      OPENAI_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              'You are a helpful assistant that always responds with valid JSON. If a book cannot be found, respond with: {"notFound": true}',
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      },
    );

    let content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from API");
    }

    // JSON mode guarantees valid JSON - parse directly
    const bookData = JSON.parse(content);

    // Handle book-not-found response
    if (bookData?.notFound) {
      return null;
    }

    if (!bookData || typeof bookData !== "object") {
      throw new Error("Invalid response format");
    }

    if (
      !bookData.title ||
      !bookData.author ||
      !bookData.summary ||
      !Array.isArray(bookData.actionableSteps)
    ) {
      throw new Error("Missing required fields in response");
    }

    // Add cover image URL
    const bookWithCover = {
      ...bookData,
      coverImageUrl: generateCoverImageUrl(bookData.isbn, bookData.title),
    };

    return bookWithCover as Book;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
};

export const searchBook = async (title: string): Promise<BookSearchResult> => {
  const normalizedTitle = title.toLowerCase().trim();

  // Check content filter
  if (!isAppropriateTitle(normalizedTitle)) {
    return {
      success: false,
      error:
        "Sorry, we cannot process this book title due to our content policy.",
    };
  }

  try {
    // Check fallback data first
    if (fallbackBooks[normalizedTitle]) {
      return {
        success: true,
        book: fallbackBooks[normalizedTitle],
      };
    }

    // Check for partial matches
    const partialMatch = Object.keys(fallbackBooks).find(
      (key) => key.includes(normalizedTitle) || normalizedTitle.includes(key),
    );

    if (partialMatch) {
      return {
        success: true,
        book: fallbackBooks[partialMatch],
      };
    }

    // Try AI generation
    const aiGeneratedBook = await generateBookAnalysis(title);

    if (aiGeneratedBook) {
      return {
        success: true,
        book: aiGeneratedBook,
      };
    }

    return {
      success: false,
      error: `Sorry, we couldn't find or analyze "${title}". Please try a different book title or check the spelling.`,
    };
  } catch (error) {
    console.error("Error in searchBook:", error);
    return {
      success: false,
      error:
        "An error occurred while searching for the book. Please try again.",
    };
  }
};

export const getTrendingBooks = (): Pick<
  Book,
  "title" | "author" | "coverImageUrl" | "isbn"
>[] => {
  return Object.values(fallbackBooks).map((book) => ({
    title: book.title,
    author: book.author,
    coverImageUrl: book.coverImageUrl,
    isbn: book.isbn,
  }));
};
