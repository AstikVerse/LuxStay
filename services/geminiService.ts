import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeGrievance = async (description: string, category: string) => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return { priority: 'Medium', analysis: "AI Analysis unavailable (Missing API Key)." };
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Analyze the following student grievance for a hostel management system.
      Category: ${category}
      Description: "${description}"

      Provide a priority level (Low, Medium, High) based on urgency and a short, polite, 1-sentence summary of the issue for the warden.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            analysis: { type: Type.STRING }
          },
          required: ['priority', 'analysis']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { priority: 'Medium', analysis: "Could not analyze grievance automatically." };
  }
};