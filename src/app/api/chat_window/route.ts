import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { User } from "@/models/user";
import { Tool } from "@/models/tool";

// Assuming a Mongoose model for your metaprompts.
// You would typically have this in a file like 'src/models/metaprompt.ts'
import mongoose, { Schema, Document, models, Model } from "mongoose";

// --- Assumed Database and Model Setup ---

interface IMetaPrompt extends Document {
  question: string;
  mprompts: string[];
}

const MetaPromptSchema: Schema = new Schema({
  question: { type: String, required: true, unique: true },
  mprompts: [{ type: String, required: true }],
});

// Prevent model overwrite in Next.js hot-reloading environments
const MetaPrompt: Model<IMetaPrompt> =
  models.MetaPrompt || mongoose.model<IMetaPrompt>("MetaPrompt", MetaPromptSchema);

// Assuming a dbConnect utility in your project
async function dbConnect() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  // Ensure you have MONGODB_URI in your .env.local file
  return mongoose.connect(process.env.MONGODB_URI!);
}

// --- End of Assumed Setup ---

// Helper function to get module-specific teaching guidance
function getModuleGuidance(moduleNumber: number): string {
  const guidance: { [key: number]: string } = {
    1: "You're teaching Module 1 (Fundamentals). Focus on: 1) Introducing basic concepts clearly 2) Using simple examples 3) Asking occasional check-in questions 4) Building confidence 5) Moving forward once basics are understood. Keep the conversation flowing naturally.",
    2: "You're teaching Module 2 (Data Structures). Focus on: 1) Building on Module 1 2) Showing practical examples 3) Interactive learning with real scenarios 4) Progressing naturally through topics 5) Ensuring understanding before moving on. Maintain conversational flow.",
    3: "You're teaching Module 3 (Functions & Control Flow). Focus on: 1) Connecting to previous modules 2) Teaching through examples and practice 3) Natural progression through concepts 4) Interactive but forward-moving discussions 5) Testing understanding appropriately. Keep momentum.",
    4: "You're teaching Module 4 (OOP/Advanced Concepts). Focus on: 1) Building on previous knowledge 2) Real-world applications 3) Progressive complexity 4) Interactive learning with forward momentum 5) Practical understanding. Natural conversation flow.",
    5: "You're teaching Module 5 (Best Practices). Focus on: 1) Code quality concepts 2) Practical patterns 3) Real-world scenarios 4) Progressive learning 5) Preparing for practical application. Keep conversations engaging and progressive."
  };
  
  return guidance[moduleNumber] || "Focus on interactive teaching while maintaining forward progress through the material. Avoid getting stuck in loops of questions.";
}

// --- End of Helper Functions ---

interface UserWithAnswers extends User {
  questionnaireAnswers?: {
    [key: string]: number;
  };
}

export async function POST(req: Request) {
  const { message, user, tools, currentModule, conversationHistory } = (await req.json()) as {
    message: string;
    user: UserWithAnswers | null;
    tools: Tool[] | null;
    currentModule?: number;
    conversationHistory?: { sender: string; text: string }[];
  };

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // 1. Construct the system prompt with user and course context
  const systemInstructionParts: string[] = [
    "You are DevTutor, an expert programming tutor. Your teaching philosophy:",
    "- Ask probing questions to assess understanding before moving forward",
    "- Provide hands-on examples and encourage the student to try coding",
    "- Break complex concepts into digestible steps",
    "- Ask follow-up questions to ensure comprehension",
    "- Give encouraging feedback and correct misconceptions gently",
    "- Challenge students with progressively harder questions as they show mastery",
  ];

  // Add module-specific guidance
  if (currentModule) {
    const moduleGuidance = getModuleGuidance(currentModule);
    systemInstructionParts.push(moduleGuidance);
    systemInstructionParts.push(`You are currently teaching Module ${currentModule}. Focus on this module's content while maintaining natural conversation flow. Don't get stuck asking endless questions - teach, engage, and progress naturally through the material.`);
  }

  // Add conversation context awareness
  if (conversationHistory && conversationHistory.length > 0) {
    const recentExchanges = conversationHistory.slice(-6); // Last 3 exchanges
    systemInstructionParts.push(`Recent conversation context: ${recentExchanges.map(msg => `${msg.sender}: ${msg.text.substring(0, 100)}`).join(' | ')}`);
  }

  if (user) {
    systemInstructionParts.push(`You are speaking with ${user.firstName || user.username}.`);

    if (user.questionnaireAnswers && Object.keys(user.questionnaireAnswers).length > 0) {
      await dbConnect();
      const questions = Object.keys(user.questionnaireAnswers);
      const metaPromptDocs = await MetaPrompt.find({ question: { $in: questions } }).lean();
      const metaPromptsMap = new Map(metaPromptDocs.map(doc => [doc.question, doc.mprompts]));

      for (const [question, answerIndex] of Object.entries(user.questionnaireAnswers)) {
        const prompts = metaPromptsMap.get(question);
        if (prompts && prompts[answerIndex]) {
          systemInstructionParts.push(prompts[answerIndex]);
        }
      }
    }
  }

  if (tools && tools.length > 0) {
      // Since we are now passing only the current tool, we can take the first element.
      const currentTool = tools[0];
      if (currentTool) {
          systemInstructionParts.push(`The user is currently working with the tool: "${currentTool.name}".`);
          systemInstructionParts.push(`Description of the tool: ${currentTool.description}`);

          if (currentTool.modules && currentTool.modules.length > 0) {
              const modulePrompts = currentTool.modules
                  .map(module => `- ${module.title}: ${module.description}`)
                  .join('\n');
              
              systemInstructionParts.push(
                  `Base your tutoring on the following learning modules for this tool:\n${modulePrompts}`
              );
          }
          
          systemInstructionParts.push(`Please tailor your explanations and examples to the "${currentTool.name}" tool and its modules.`);
      }
  }


  const systemInstruction = systemInstructionParts.join(" ");

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(message);
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    
    // Check if it's a quota exceeded error and return a helpful message
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: "I'm currently experiencing high demand. Please try again in a moment, or consider upgrading your API plan for uninterrupted service." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to get response from Gemini API" },
      { status: 500 }
    );
  }
}
