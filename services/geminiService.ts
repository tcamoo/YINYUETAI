import { GoogleGenAI, Type } from "@google/genai";
import { Track } from '../types';

const getClient = () => {
  // Vite uses import.meta.env for environment variables
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY || ''; 
  return new GoogleGenAI({ apiKey });
};

export const generateRecommendation = async (
  userMood: string
): Promise<{ message: string; recommendedTracks: Partial<Track>[] }> => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return {
      message: "API Key Missing. Using simulated VJ response.",
      recommendedTracks: [
        { title: "Simulated MV 1", artist: "AI Bot", tags: ["Demo"] },
        { title: "Simulated MV 2", artist: "AI Bot", tags: ["Demo"] }
      ]
    };
  }

  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a VJ (Video Jockey) for YinYueTai (音悦台).
      Suggest 3 music videos based on this request: "${userMood}". 
      Focus on tracks with visually stunning or notable music videos.
      Return result as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: "A cool, broadcast-style VJ intro for the videos.",
            },
            tracks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  tags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        message: data.message,
        recommendedTracks: data.tracks
      };
    }
    
    throw new Error("No data returned");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      message: "SIGNAL LOST. RECONNECTING...",
      recommendedTracks: []
    };
  }
};