import { Difficulty, Genre } from "@/types/text";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NewTextType } from "@/types/text";

const CORS_PROXY = "https://api.allorigins.win/get?url=";
const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;  

/// Gutendex API base URL
const GUTENDEX_API = "https://gutendex.com/books";

const findTxtUrl = (data: { [format: string]: string }, id: string, title: string): string => {
  for (const [format, url] of Object.entries(data)) {
    console.log("book:", title, "format:", format, "url:", url);
    if (url.endsWith(".txt")) {
      console.log("found txt url:", url);
      return url;
    } else if (url.endsWith(".txt.utf-8")) {
      return `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
    }
  }
  return "NOT_FOUND";
};

/// Fetch texts from the Gutendex API
export const fetchBooks = async (genre: Genre, existingTexts: string[]): Promise<NewTextType[]> => {
  try {
    console.log("fetchBooks: waiting for list of texts fetch");
    const response = await axios.get(GUTENDEX_API, {
      params: { 
        topic: genre as string, 
        languages: ["en"], 
        mime_type: ["text/plain; charset=us-ascii"],
        copyright: "false", 
        page: Math.floor(Math.random() * 10) + 1
      },
    });

    // Manually filter for English texts as some were still non-English
    const tempTexts = response.data.results.filter(
      (text: any) => Array.isArray(text.languages) && text.languages.includes("en")
    );

    console.log(tempTexts);
    
    console.log(`fetchBooks: ${tempTexts.length} texts fetched`, tempTexts.map((text: any) => text.title));

    const texts = tempTexts
      .sort(() => Math.random())
      .map((text: any) => ({
        title: text.title,
        content: "", // Fetch the content later
        difficulty: Difficulty.EASY, // Placeholder difficulty
        isFiction: true, 
        genre: genre,
        category: null, // Books can only be fiction
        text_link: findTxtUrl(text.formats || {}, text.id, text.title) || "NOT_FOUND",
        wordLength: 0, // Placeholder, will be updated later
        questions: [], // Placeholder, will be updated later
        isValid: false, // Placeholder, will be updated later
        isAI: false, // Placeholder, will be updated later
      }))
      .filter((text: NewTextType) => !existingTexts.includes(text.title))
      .slice(0, 5);

    console.log("texts: ", texts);
    
    return texts;
  } catch (error) {
    console.error("Error fetching texts from Gutendex:", error);
    return [];
  }
};

const filterTextUsingAI = async (content: string, minWords: number, maxWords: number): Promise<{ 
  excerpt: string, questions: any[], isValid: boolean, difficulty: Difficulty }> => {
  try {
    const gemini = new GoogleGenerativeAI(GEMINI_KEY ?? "");
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Task: Analyze the given text and return a structured JSON response following these steps:

    Extract a meaningful excerpt such that it:
      Forms a coherent narrative or complete thought,
      Has over ${minWords} words and STRICTLY under ${maxWords} words
      Has proper sentence structure and punctuation,
      Excludes footnotes, headers, and non-content text,
      Has a natural beginning and ending - if you have to cut a sentence off at the end, 
      in order to maintain the word count, do so at a natural stopping point. Also, 
      if you absolutely must, you can edit a few words at the end to make it a natural stopping point, 
      but ensure to do so without drastically changing the meaning of the text.

    Clean the text by:
      Replacing all underscores (_) with spaces,
      Removing [?] placeholders and unclear references.

    Generate 4 multiple-choice questions such that: 
      Each question is based ONLY on the excerpt, 
      Each question has a very obvious answer which is not subjective,
      Each question has 4 choices,
      Only one choice is correct.
      Ensure the 4 choices in the JSON are comma-separated and in each 
      choice there are NO COMMAS. 

    Validate the excerpt, setting "isValid": true only if the text:
      Is part of the main text of a book and is NOT a preface or disclaimer,
      Is in English,
      Is NOT a play or poem.
    
    Determine the difficulty level of the text using the following guidelines:
      Easy: Simple language, short sentences, and common words,
      Medium: Moderate language complexity, longer sentences, and some uncommon words,
      Hard: Complex language, long sentences, and many uncommon words.
    
    Return JSON format with strict structure:
      \`\`\`json
      {
        "excerpt": "Cleaned text without underscores or [?]",
        "isValid": true/false,
        "difficulty": "easy/medium/hard",
        "questions": [
          {
            "question": "...",
            "choices": ["...", "...", "...", "..."],
            "answer": "..."
          }
        ]
      }
      \`\`\`
    Text to analyze: ${content.slice(0, 10000)}`;

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text().trim();
    //console.log("AI response:", rawResponse);
    
    // Extract JSON response
    const jsonStart = rawResponse.indexOf("{");
    const jsonEnd = rawResponse.lastIndexOf("}");
    const cleanJson = rawResponse.slice(jsonStart, jsonEnd + 1);
    console.log("Cleaned JSON:", cleanJson);

    const response = JSON.parse(cleanJson);
    console.log("response:", response);
    
    // Clean and validate response
    const cleanedExcerpt = response.excerpt
      .replace(/_/g, " ")
      .replace(/\[\?\]/g, "")
      .trim();
    
    console.log("cleanedExcerpt:", cleanedExcerpt);

    const wordCount = cleanedExcerpt.split(/\s+/).length;
    const structureValid =  cleanedExcerpt.split(/\s+/).length >= maxWords * 0;

    // console.log("structureValid:", structureValid);

    const finalValidity = response.isValid && structureValid && 
      !/[\[\]{}]/.test(cleanedExcerpt) && // Check for remaining special chars
      wordCount <= maxWords * 1.9 &&
      !/gutendex/i.test(cleanedExcerpt); 
    // console.log("questions after cleaning:", response.questions);
    
    return {
      excerpt: cleanedExcerpt,
      questions: finalValidity ? response.questions : [],
      isValid: finalValidity, 
      difficulty: response.difficulty
    };

  } catch (error) {
    console.log("AI filtering failed:", error);
    return { 
      excerpt: "CONTENT_UNAVAILABLE",
      questions: [],
      isValid: false, 
      difficulty: Difficulty.EASY
    };
  }
};

/// Fetch coherent paragraph from specified book
export const fetchBookContent = async (book: NewTextType, minWords: number, maxWords: number): Promise<NewTextType> => {
  try {
    if (book.text_link === "NOT_FOUND") {
      return { 
        ...book, 
        content: "CONTENT_UNAVAILABLE", 
        difficulty: Difficulty.EASY,
        questions: [],
        isValid: false, 
        isAI: false
      };
    }

    const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(book.text_link)}`);
    const fullText = response.data.contents || "";

    // Get AI-processed content
    // console.log("fullText:", fullText.slice(1000, 2000));
    const aiResponse = await filterTextUsingAI(fullText, minWords, maxWords);
    console.log("questions:", aiResponse.questions);

    // Final cleaning and validation
    const finalExcerpt = aiResponse.excerpt
      .split(/\s+/)
      .slice(0, maxWords)
      .join(" ")
      .replace(/(\s[.,!?])/g, "$1") // Ensure proper punctuation spacing
      .trim();

    const difficulty = aiResponse.difficulty;
    
    return { 
      ...book, 
      content: finalExcerpt,
      difficulty,
      questions: aiResponse.questions,
      isValid: aiResponse.isValid, 
      isAI: false,
      wordLength: finalExcerpt.split(/\s+/).length
    };
  } catch (error) {
    console.error(`Error processing ${book.title}:`, error);
    return { 
      ...book, 
      content: "CONTENT_UNAVAILABLE", 
      difficulty: Difficulty.EASY,
      questions: [],
      isValid: false,
      isAI: false
    };
  }
};