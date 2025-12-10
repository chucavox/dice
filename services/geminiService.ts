import { GoogleGenAI, Type } from "@google/genai";
import { GameState, Player } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getAIDecision = async (gameState: GameState): Promise<{ action: 'roll' | 'hold'; reasoning: string }> => {
  if (!apiKey) {
    // Fallback logic if no API key is present
    console.warn("No API Key found. Using simple fallback logic.");
    const score = gameState.currentTurnScore;
    const total = gameState.scores[Player.AI];
    // Simple strategy: Hold at 20 or if winning
    const action = (score >= 20 || (total + score >= 100)) ? 'hold' : 'roll';
    return { action, reasoning: "I'm playing it safe using basic logic." };
  }

  const userScore = gameState.scores[Player.USER];
  const aiScore = gameState.scores[Player.AI];
  const turnScore = gameState.currentTurnScore;

  const prompt = `
    You are playing the dice game 'Pig'.
    Goal: First to 100 points wins.
    
    Current State:
    - Your Total Score: ${aiScore}
    - Opponent's Total Score: ${userScore}
    - Your Current Turn Score (at risk): ${turnScore}
    
    Rules:
    - If you roll a 1, you lose your turn score (${turnScore}) and your turn ends.
    - If you roll 2-6, it adds to your turn score.
    - You can 'hold' to bank your turn score into your total score.
    
    Decide whether to 'roll' or 'hold'. 
    Be strategic. If you are close to 100, play safe. If you are behind, take risks.
    Provide a very short, witty reasoning (max 10 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["roll", "hold"] },
            reasoning: { type: Type.STRING }
          },
          required: ["action", "reasoning"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const decision = JSON.parse(jsonText);
    
    // Validate output
    if (decision.action !== 'roll' && decision.action !== 'hold') {
      return { action: 'hold', reasoning: "I'm confused, so I'll hold." };
    }

    return decision;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback on error
    return { action: 'hold', reasoning: "My brain hurts. I hold." };
  }
};
