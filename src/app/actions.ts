'use server';

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Recommendation {
  title: string;
  author: string;
  reasoning: string;
  genre: string;
}

export async function getRecommendations(
  prompt: string,
  readBooks: { title: string; author: string; coverUrl?: string }[],
  alreadyRecommended: { title: string; author: string }[] = []
): Promise<Recommendation[]> {
  const readList = readBooks.length > 0
    ? `The user has already read the following books (do NOT recommend them again): ${readBooks.map(b => `'${b.title}' by ${b.author}`).join(', ')}.`
    : '';

  const alreadyRecommendedList = alreadyRecommended.length > 0
    ? `You have already recommended the following books in this session, do NOT recommend them again: ${alreadyRecommended.map(b => `'${b.title}' by ${b.author}`).join(', ')}.`
    : '';

  const systemInstruction = `You are a helpful bookstore assistant for Books Finder. Recommend exactly 5 books based on the user's prompt or their reading history. 
${readList}
${alreadyRecommendedList}
IMPORTANT: If the user's prompt specifies constraints about the book's cover (e.g. 'no persons on the cover', 'blue cover'), use your internal knowledge of the book's most common or original cover to filter your recommendations. Only recommend books that fit the cover description. I have provided the covers of the books the user has already read, you can use them to understand their preferences if they ask for similar covers.
Respond with a JSON object that matches the provided schema.`;

  const finalPrompt = prompt.trim() ? prompt : (readBooks.length > 0 ? "Recommend 5 books that are similar to the ones I have already read." : "Recommend 5 popular and highly rated books.");

  const contentsParts: any[] = [{ text: finalPrompt }];

  // Fetch covers of read books to provide visual context
  for (const book of readBooks) {
    if (book.coverUrl) {
      try {
        const res = await fetch(book.coverUrl);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64 = buffer.toString('base64');
          contentsParts.push({ text: `Cover of '${book.title}':` });
          contentsParts.push({
            inlineData: { data: base64, mimeType: 'image/jpeg' }
          });
        }
      } catch (err) {
        console.error(`Failed to fetch cover for ${book.title}`, err);
      }
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [{ role: 'user', parts: contentsParts }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" },
                  reasoning: { type: "string", description: "Short explanation matching user preferences, e.g., 'Weil du X magst'" },
                  genre: { type: "string", description: "The main genre of the book, e.g., 'Sci-Fi' or 'Krimi'" }
                },
                required: ["title", "author", "reasoning", "genre"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(text);
    return data.recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Fehler bei der Gemini API: ${errorMessage}`);
  }
}

export async function getSeriesBooks(title: string, author: string): Promise<{title: string, author: string}[]> {
  const prompt = `Return a list of all books in the same series as '${title}' by ${author}. Return them in reading order. If the book is not part of a series, just return an array containing only that book. Respond with a JSON object containing a 'books' array.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            books: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  author: { type: "string" }
                },
                required: ["title", "author"]
              }
            }
          },
          required: ["books"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      return [{title, author}];
    }

    const data = JSON.parse(text);
    return data.books || [{title, author}];
  } catch (error) {
    console.error("Error generating series books:", error);
    return [{title, author}];
  }
}
