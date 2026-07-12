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
  readBooks: { title: string; author: string }[],
  alreadyRecommended: { title: string; author: string }[] = []
): Promise<Recommendation[]> {
  const readList = readBooks.length > 0 
    ? `The user has already read the following books (do NOT recommend them again): ${readBooks.map(b => `'${b.title}' by ${b.author}`).join(', ')}.`
    : '';

  const alreadyRecommendedList = alreadyRecommended.length > 0 
    ? `You have already recommended the following books in this session, do NOT recommend them again: ${alreadyRecommended.map(b => `'${b.title}' by ${b.author}`).join(', ')}.`
    : '';

  const systemInstruction = `You are a helpful bookstore assistant for Book Finder. Recommend exactly 5 books based on the user's prompt or their reading history. 
${readList}
${alreadyRecommendedList}
Respond with a JSON object that matches the provided schema.`;

  const finalPrompt = prompt.trim() ? prompt : (readBooks.length > 0 ? "Recommend 5 books that are similar to the ones I have already read." : "Recommend 5 popular and highly rated books.");

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: finalPrompt,
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
