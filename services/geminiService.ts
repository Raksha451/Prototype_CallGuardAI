
import { GoogleGenAI, Type } from "@google/genai";
import { CallRecord, CallLogAnalysis, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeCalls = async (calls: CallRecord[]): Promise<CallLogAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following call history for potential fraud and IDENTITY VERIFICATION. 
    For each call, provide a definitive security assessment.
    
    Determine:
    1. isGenuine: Boolean (true if the caller is definitely who they claim to be, false if suspicious).
    2. riskScore: Number from 0 (Safe) to 100 (Certain Fraud).
    3. riskLevel: 'low' (0-30), 'medium' (31-70), 'high' (71-100).
    4. threatCategory: One of 'Spam', 'Phishing', 'Telemarketing', 'Safe', 'Identity Theft', or 'Verified Business'.
    5. reasoning: Detailed explanation focusing on carrier patterns, timing, and caller identity.
    6. indicators: Array of specific threat markers detected (e.g., "VoIP Gateway", "Unknown International Prefix", "Business Hours Mismatch").

    Calls: ${JSON.stringify(calls)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                isGenuine: { type: Type.BOOLEAN },
                riskScore: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING, description: "low, medium, or high" },
                threatCategory: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                indicators: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["id", "isGenuine", "riskScore", "riskLevel", "threatCategory", "reasoning", "indicators"]
            }
          }
        },
        required: ["results"]
      }
    }
  });

  try {
    const text = response.text || '{"results": []}';
    const data = JSON.parse(text);
    return data as CallLogAnalysis;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    return { results: [] };
  }
};

export const analyzeScreenshot = async (base64Image: string): Promise<{ calls: CallRecord[], analysis: AnalysisResult[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `Extract all call records from this screenshot and perform a deep fraud analysis.
          For each call detected, return a CallRecord and a corresponding AnalysisResult.
          
          Include: isGenuine status, riskScore (0-100), riskLevel (low/medium/high), reasoning, and specific threat indicators.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          calls: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                phoneNumber: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                callerName: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          },
          analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                isGenuine: { type: Type.BOOLEAN },
                riskScore: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING },
                threatCategory: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                indicators: { 
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

  try {
    const text = response.text || '{"calls": [], "analysis": []}';
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Failed to parse AI image response:", error);
    return { calls: [], analysis: [] };
  }
};
