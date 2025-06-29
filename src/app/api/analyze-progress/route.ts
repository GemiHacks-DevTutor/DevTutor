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

Conversation to analyze:
${conversationSummary}

A module should be considered complete when the student has:
1. Been introduced to the core concepts of the current module
2. Asked relevant questions OR demonstrated understanding through responses
3. Received explanations and examples for the main topics
4. Had at least 2-3 meaningful exchanges about the module content

Be LIBERAL with progression - if there's been meaningful discussion about the module topics and the student seems engaged, they're ready to advance. Learning is iterative and students benefit from moving forward.

Respond with a JSON object containing:
{
  "moduleComplete": boolean,
  "confidence": number (0-1),
  "topicsCovered": string[],
  "nextModuleReady": boolean,
  "summary": "Brief explanation of the analysis"
}

IMPORTANT: Err strongly on the side of progression. If students have engaged with the material, mark as complete.
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
