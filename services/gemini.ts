import { GoogleGenAI } from "@google/genai";

// Helper to get a fresh client
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDescription = async (title: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a catchy, short YouTube video description for a video titled: "${title}". Include hashtags.`,
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Could not generate description.";
  }
};

export const polishStatus = async (text: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following social media status to be more engaging and viral: "${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error polishing status:", error);
    return text;
  }
};

interface VeoOptions {
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
}

export const generateVeoVideo = async (prompt: string, options: VeoOptions = { resolution: '720p', aspectRatio: '16:9' }): Promise<string | null> => {
  try {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: options.resolution,
        aspectRatio: options.aspectRatio
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink && process.env.API_KEY) {
      // Return the URI with the key appended for direct playback/download
      return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};