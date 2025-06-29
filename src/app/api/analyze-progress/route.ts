import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, toolName, currentModule }: { 
      messages: Message[]; 
      toolName: string; 
      currentModule: number;
    } = body;

    if (!messages || !toolName) {
      return NextResponse.json(
        { error: 'Messages and toolName are required' },
        { status: 400 }
      );
    }

    // Create a conversation summary for analysis
    const conversationSummary = messages
      .slice(-10) // Only analyze last 10 messages for efficiency
      .map((msg: Message) => `${msg.sender}: ${msg.text}`)
      .join('\n');

    const analysisPrompt = `
You are an educational progress analyzer for a programming learning platform called DevTutor.

Analyze this conversation about learning ${toolName} and determine if the student has sufficiently covered the concepts for module ${currentModule || 1}.

Here are the typical learning modules for ${toolName}:
1. Basic syntax and fundamentals
2. Core concepts and data structures  
3. Functions and control flow
4. Object-oriented programming (if applicable)
5. Advanced features and best practices
6. Practical applications and projects
7. Error handling and debugging
8. Performance optimization
9. Testing and quality assurance
10. Real-world project implementation

Conversation to analyze:
${conversationSummary}

Based on this conversation, has the student:
1. Asked meaningful questions about the current module topics?
2. Received comprehensive explanations?
3. Demonstrated understanding through follow-up questions or examples?
4. Covered the core concepts sufficiently to move to the next module?

Respond with a JSON object containing:
{
  "moduleComplete": boolean,
  "confidence": number (0-1),
  "topicsCovered": string[],
  "nextModuleReady": boolean,
  "summary": "Brief explanation of the analysis"
}

Be conservative - only mark a module as complete if there's clear evidence of comprehensive learning.
`;

    const result = await model.generateContent(analysisPrompt);
    const response = result.response;
    const text = response.text();

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          analysis
        });
      } else {
        // Fallback if no valid JSON found
        return NextResponse.json({
          success: true,
          analysis: {
            moduleComplete: false,
            confidence: 0.3,
            topicsCovered: [],
            nextModuleReady: false,
            summary: "Could not properly analyze the conversation"
          }
        });
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return NextResponse.json({
        success: true,
        analysis: {
          moduleComplete: false,
          confidence: 0.2,
          topicsCovered: [],
          nextModuleReady: false,
          summary: "Analysis failed due to parsing error"
        }
      });
    }

  } catch (error) {
    console.error('Error analyzing progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
