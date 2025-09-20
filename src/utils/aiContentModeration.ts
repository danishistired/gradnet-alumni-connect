// AI-powered content moderation using Ollama
export interface AIModerationResult {
  isAppropriate: boolean;
  confidence: number; // 0-100
  concerns: string[];
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  suggestedAction: 'allow' | 'warn' | 'block';
}

export const moderateContentWithAI = async (content: string): Promise<AIModerationResult> => {
  try {
    const prompt = `You are a content moderation AI for an academic social platform (Chandigarh University Alumni Connect). Your job is to analyze content and detect:

1. Hate speech or discriminatory language
2. Profanity or vulgar language
3. Harassment, bullying, or personal attacks
4. Spam or promotional content
5. Inappropriate sexual content
6. Violence or threats
7. Misinformation or harmful advice

IMPORTANT: Academic discussions, technical terms, and legitimate educational content should NOT be flagged.

Content to analyze: "${content}"

Respond ONLY with a JSON object in this exact format (no additional text):
{
  "isAppropriate": true/false,
  "confidence": 0-100,
  "concerns": ["list of specific concerns found"],
  "severity": "low/medium/high",
  "explanation": "Brief explanation of why this content is/isn't appropriate",
  "suggestedAction": "allow/warn/block"
}

Guidelines:
- "allow": Content is appropriate
- "warn": Minor concerns, show warning but allow publishing
- "block": Serious concerns, do not allow publishing
- Be context-aware (academic platform)
- Consider intent and context, not just keywords
- Confidence should reflect how certain you are`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent results
          top_p: 0.9,
          max_tokens: 300
        }
      })
    });

    if (!response.ok) {
      throw new Error('AI moderation service unavailable');
    }

    const data = await response.json();
    const aiResponse = data.response.trim();
    
    // Try to parse the JSON response
    try {
      const result = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (typeof result.isAppropriate !== 'boolean' || 
          typeof result.confidence !== 'number' ||
          !Array.isArray(result.concerns) ||
          !['low', 'medium', 'high'].includes(result.severity) ||
          !['allow', 'warn', 'block'].includes(result.suggestedAction)) {
        throw new Error('Invalid AI response structure');
      }

      return result as AIModerationResult;
    } catch (parseError) {
      console.error('Failed to parse AI moderation response:', aiResponse);
      // Fallback response if AI gives malformed JSON
      return {
        isAppropriate: true,
        confidence: 50,
        concerns: ['Unable to analyze content properly'],
        severity: 'low',
        explanation: 'Content moderation service encountered an issue',
        suggestedAction: 'allow'
      };
    }

  } catch (error) {
    console.error('AI content moderation error:', error);
    // Fallback to allow content if AI is unavailable
    return {
      isAppropriate: true,
      confidence: 0,
      concerns: ['AI moderation service unavailable'],
      severity: 'low',
      explanation: 'Content moderation service is currently unavailable',
      suggestedAction: 'allow'
    };
  }
};

// Enhanced moderation that combines AI with existing system
export const enhancedContentModeration = async (
  content: string,
  userId: string,
  userName: string,
  contentType: 'post' | 'comment',
  contentId: string
) => {
  const aiResult = await moderateContentWithAI(content);
  
  return {
    aiResult,
    shouldBlock: aiResult.suggestedAction === 'block',
    shouldWarn: aiResult.suggestedAction === 'warn',
    canPublish: aiResult.suggestedAction === 'allow' || aiResult.suggestedAction === 'warn'
  };
};